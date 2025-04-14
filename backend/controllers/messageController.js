import createHttpError from "http-errors";
import Message from "../models/Message.js";
import User from "../models/User.js";
import Chat from "../models/Chat.js";

//@description     Get all Messages
//@route           GET /api/message/:chatId
//@access          Protected
const allMessages = async (req, res, next) => {
  const messages = await Message.find({ chat: req.params.chatId })
    .populate("sender", "name pic email")
    .populate("chat");

  if (!messages) {
    return next(createHttpError(404, "Messages not found"));
  }

  res.status(200).json(messages);
};

//@description     Create New Message
//@route           POST /api/message/
//@access          Protected
const sendMessage = async (req, res, next) => {
  const { content, chatId } = req.body;

  if (!content || !chatId) {
    return next(createHttpError(400, "Invalid data passed into request"));
  }

  const newMessage = {
    sender: req.user._id,
    content: content,
    chat: chatId,
  };

  let message = await Message.create(newMessage);

  if (!message) {
    return next(createHttpError(500, "Failed to create message"));
  }

  message = await message.populate("sender", "name pic");
  message = await message.populate("chat");
  message = await User.populate(message, {
    path: "chat.users",
    select: "name pic email",
  });

  const updatedChat = await Chat.findByIdAndUpdate(chatId, {
    latestMessage: message,
  });

  if (!updatedChat) {
    return next(
      createHttpError(500, "Failed to update chat with latest message")
    );
  }

  res.status(200).json(message);
};

export { allMessages, sendMessage };
