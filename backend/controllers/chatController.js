import createHttpError from "http-errors";
import Chat from "../models/Chat.js";
import User from "../models/User.js";

//@description     Create or fetch One to One Chat
//@route           POST /api/chat/
//@access          Protected
const accessChat = async (req, res, next) => {
  const { userId } = req.body;

  if (!userId) {
    throw createHttpError(400, "UserId parameter is missing in the request");
  }

  if (userId === req.user._id) {
    throw createHttpError(400, "Can't chat with yourself!");
  }

  let existingChat = await Chat.find({
    isGroupChat: false,
    $and: [
      { users: { $elemMatch: { $eq: req.user._id } } },
      { users: { $elemMatch: { $eq: userId } } },
    ],
  })
    .populate("users", "-password")
    .populate("latestMessage");

  existingChat = await User.populate(existingChat, {
    path: "latestMessage.sender",
    select: "name pic email",
  });

  if (existingChat.length > 0) {
    return res.status(200).send(existingChat[0]);
  } else {
    const chatData = {
      chatName: "Private Chat",
      isGroupChat: false,
      users: [req.user._id, userId],
    };

    const newChat = await Chat.create(chatData);
    const fullChat = await Chat.findOne({ _id: newChat._id }).populate(
      "users",
      "-password"
    );

    return res.status(201).json(fullChat);
  }
};

//@description     Fetch all chats for a user
//@route           GET /api/chat/
//@access          Protected
const fetchChats = async (req, res) => {
  const chats = await Chat.find({
    users: { $elemMatch: { $eq: req.user._id } },
  })
    .populate("users", "-password")
    .populate("groupAdmin", "-password")
    .populate("latestMessage")
    .sort({ updatedAt: -1 });

  const populatedChats = await User.populate(chats, {
    path: "latestMessage.sender",
    select: "name pic email",
  });

  return res.status(200).json(populatedChats);
};

//@description     Create a New Group Chat
//@route           POST /api/chat/group
//@access          Protected
const createGroupChat = async (req, res) => {
  const { users, name } = req.body;

  if (!users || !name) {
    throw createHttpError(
      400,
      "All fields (users and name) are required to create a group chat"
    );
  }
  console.log(users, 123);
  //let userList = JSON.parse(users);

  let groupMembers = users.map((user) => ({
    user: user,
    added: new Date().toISOString(),
  }));

  groupMembers.push({ user: req.user._id, added: new Date().toISOString() }); 

  if (users.length < 2) {
    throw createHttpError(
      400,
      "At least two users are required to create a group chat"
    );
  }

  users.push(req.user._id); 

  const groupChat = await Chat.create({
    chatName: name,
    users: users,
    members: groupMembers,
    isGroupChat: true,
    groupAdmin: req.user._id, 
  });

  const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  return res.status(201).json(fullGroupChat);
};


//@description     Rename Group Chat
//@route           PUT /api/chat/rename
//@access          Protected
const renameGroup = async (req, res, next) => {
  const { chatId, chatName } = req.body;

  if (!chatId || !chatName) {
    throw createHttpError(
      400,
      "Chat ID and chat name are required to rename the group"
    );
  }

  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    { chatName: chatName },
    { new: true }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!updatedChat) {
    throw createHttpError(404, "Chat not found");
  }

  return res.status(200).json(updatedChat);
};

//@description     Remove user from Group
//@route           PUT /api/chat/groupremove
//@access          Protected
const removeFromGroup = async (req, res, next) => {
  const { chatId, userId } = req.body;

  if (!chatId || !userId) {
    throw createHttpError(
      400,
      "Both chat ID and user ID are required to remove a user"
    );
  }

  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    {
      $pull: {
        users: userId,
        members: { user: userId },
      },
    },
    { new: true }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!updatedChat) {
    throw createHttpError(404, "Chat not found");
  }

  return res.status(200).json(updatedChat);
};

//@description     Add user to Group
//@route           PUT /api/chat/groupadd
//@access          Protected
const addToGroup = async (req, res, next) => {
  const { chatId, userId } = req.body;

  if (!chatId || !userId) {
    throw createHttpError(
      400,
      "Both chat ID and user ID are required to add a user"
    );
  }

  const addedChat = await Chat.findByIdAndUpdate(
    chatId,
    {
      $push: {
        users: userId,
        members: { user: userId, added: new Date().toISOString() },
      },
    },
    { new: true }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!addedChat) {
    throw createHttpError(404, "Chat not found");
  }

  return res.status(200).json(addedChat);
};

export {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroup,
  addToGroup,
  removeFromGroup,
};
