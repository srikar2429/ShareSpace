import React, { useState, useEffect } from "react";
import {
  Box,
  List,
  ListItem,
  ListItemText,
  Avatar,
  TextField,
  Typography,
  Divider,
  Button,
  IconButton,
  InputAdornment,
  Chip,
  AvatarGroup,
} from "@mui/material";
import axios from "axios";
import socket from "../socket";
import Cookies from "js-cookie";
import { useAuth } from "../context/AuthContext";
import GroupIcon from "@mui/icons-material/Group";

const ChatList = ({ chats, onSelectChat, setChats }) => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeChat, setActiveChat] = useState(null);
  const [chatType, setChatType] = useState("single");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [groupName, setGroupName] = useState("");
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    console.log("hi1")
    socket.on("online-users", (onlineUsersMap) => {
      console.log("Received online users:", onlineUsersMap);
      setOnlineUsers(onlineUsersMap);
    });

    socket.emit("get-online-users");

    return () => {
      socket.off("online-users");
    };
  }, []);

  const handleSearchChange = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query === "") {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const token = Cookies.get("token");
      const response = await axios.get(`/api/users/search?search=${query}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSearchResults(response.data);
    } catch (err) {
      console.error(err);
      setSearchResults([]);
    }
    setLoading(false);
  };

  const handleCreateChat = async (userId) => {
    try {
      setSearchQuery("");
      const token = Cookies.get("token");
      const response = await axios.post(
        "/api/chat/",
        { userId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const newChat = response.data;
      socket.emit("new chat created", newChat);
      onSelectChat(newChat);

      if (activeChat) {
        socket.emit("leave chat", activeChat);
      }

      setActiveChat(newChat._id);
      socket.emit("join chat", newChat._id);

      setChats((prev) => {
        const exists = prev.find((chat) => chat._id === newChat._id);
        if (exists) return prev;
        return [newChat, ...prev];
      });

      setSearchResults([]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleExistingChatClick = (chat) => {
    onSelectChat(chat);

    if (activeChat) {
      socket.emit("leave chat", activeChat);
    }

    setActiveChat(chat._id);
    socket.emit("join chat", chat._id);
  };

  const handleSelectUser = (userObj) => {
    const already = selectedUsers.find((u) => u._id === userObj._id);
    if (already) {
      setSelectedUsers((prev) => prev.filter((u) => u._id !== userObj._id));
    } else {
      setSelectedUsers((prev) => [...prev, userObj]);
    }
  };

  const handleCreateGroup = async () => {
    try {
      const token = Cookies.get("token");
      const response = await axios.post(
        "/api/chat/group",
        {
          name: groupName,
          users: selectedUsers.map((u) => u._id),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const newChat = response.data;
      socket.emit("new chat created", newChat);
      onSelectChat(newChat);

      if (activeChat) {
        socket.emit("leave chat", activeChat);
      }

      setActiveChat(newChat._id);
      socket.emit("join chat", newChat._id);

      setChats((prev) => {
        const exists = prev.find((chat) => chat._id === newChat._id);
        if (exists) return prev;
        return [newChat, ...prev];
      });

      setGroupName("");
      setSelectedUsers([]);
      setSearchQuery("");
      setSearchResults([]);
      setChatType("single");
    } catch (err) {
      console.error("Error creating group:", err);
    }
  };

  const getChatName = (chat) => {
    if (chat.isGroupChat) return chat.chatName;
    const otherUser = chat.users?.find((u) => u._id !== user?._id);
    return otherUser?.name || "Unknown";
  };

  const getChatAvatar = (chat) => {
    if (chat.isGroupChat) {
      return (
        <AvatarGroup max={3}>
          {chat.users
            .filter((u) => u._id !== user?._id)
            .slice(0, 3)
            .map((u) => (
              <Avatar key={u._id} src={u.pic} />
            ))}
        </AvatarGroup>
      );
    }

    const otherUser = chat.users?.find((u) => u._id !== user?._id);
    return <Avatar src={otherUser?.pic || ""} />;
  };

  return (
    <Box
      sx={{
        height: "91.5vh",
        overflowY: "auto",
        backgroundColor: "#f9f9f9",
        padding: 2,
        borderRadius: "10px",
        boxShadow: 3,
      }}
    >
      <TextField
        label="Search Users"
        variant="outlined"
        fullWidth
        value={searchQuery}
        onChange={handleSearchChange}
        sx={{
          marginTop: 2,
          marginBottom: 2,
          backgroundColor: "#fff",
          borderRadius: "8px",
          input: { color: "#000" },
          label: { color: "#000" },
        }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={() =>
                  setChatType((prev) =>
                    prev === "single" ? "group" : "single"
                  )
                }
                sx={{
                  border:
                    chatType === "group"
                      ? "1px solid #1976d2"
                      : "1px solid #ccc",
                  backgroundColor:
                    chatType === "group" ? "#e3f2fd" : "transparent",
                  borderRadius: "4px",
                  padding: "2px",
                }}
              >
                <GroupIcon
                  fontSize="small"
                  color={chatType === "group" ? "primary" : "action"}
                />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      {chatType === "group" && selectedUsers.length > 0 && (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
          {selectedUsers.map((u) => (
            <Chip
              key={u._id}
              label={u.name}
              onDelete={() =>
                setSelectedUsers((prev) => prev.filter((x) => x._id !== u._id))
              }
            />
          ))}
        </Box>
      )}

      {searchQuery && (
        <Box sx={{ maxHeight: "50vh", overflowY: "auto", marginBottom: 2 }}>
          {loading ? (
            <Typography sx={{ color: "#000" }}>Loading...</Typography>
          ) : (
            searchResults.map((result) => {
              const alreadySelected = selectedUsers.find(
                (u) => u._id === result._id
              );
              return (
                <ListItem
                  button
                  key={result._id}
                  onClick={() =>
                    chatType === "single"
                      ? handleCreateChat(result._id)
                      : handleSelectUser(result)
                  }
                  sx={{
                    padding: "12px",
                    borderBottom: "1px solid #ddd",
                    backgroundColor: alreadySelected
                      ? "#dbeeff"
                      : "transparent",
                    "&:hover": {
                      backgroundColor: "#f1f1f1",
                    },
                  }}
                >
                  <Avatar src={result.pic} />
                  <ListItemText
                    primary={result.name}
                    secondary={result.email}
                    sx={{ marginLeft: 2, color: "#000" }}
                  />
                </ListItem>
              );
            })
          )}
        </Box>
      )}

      {chatType === "group" && selectedUsers.length > 1 && (
        <Box sx={{ padding: 1 }}>
          <TextField
            label="Group Name"
            variant="outlined"
            fullWidth
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            sx={{ marginBottom: 1 }}
          />
          <Button variant="contained" fullWidth onClick={handleCreateGroup}>
            Create Group
          </Button>
        </Box>
      )}

      <List sx={{ overflowY: "auto" }}>
        {chats.map((chat) => {
          const isActive = activeChat === chat._id;
          const isGroup = chat.isGroupChat;
          const otherUser =
            !isGroup && chat.users.find((u) => u._id !== user?._id);
          const isOnline = otherUser && onlineUsers.includes(otherUser?._id);

          return (
            <ListItem
              button
              key={chat._id}
              onClick={() => handleExistingChatClick(chat)}
              sx={{
                padding: "12px",
                borderBottom: "1px solid #ddd",
                color: "#000",
                backgroundColor: isActive ? "#dbeeff" : "transparent",
                "&:hover": {
                  backgroundColor: "#e6f3ff",
                },
              }}
            >
              <Box sx={{ minWidth: 56, position: "relative" }}>
                {getChatAvatar(chat)}
                {!isGroup && (
                  <Box
                    sx={{
                      position: "absolute",
                      bottom: 0,
                      right: 0,
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      backgroundColor: isOnline ? "#4caf50" : "#ccc",
                      border: "2px solid white",
                    }}
                  />
                )}
              </Box>
              <ListItemText
                primary={
                  <Typography sx={{ color: "#000", fontWeight: 500 }}>
                    {getChatName(chat)}
                  </Typography>
                }
                secondary={
                  <Typography sx={{ color: "#000" }}>
                    {chat.typing
                      ? "Typing..."
                      : chat.lastMessage
                      ? chat.lastMessage
                      : ""}
                  </Typography>
                }
                sx={{ marginLeft: 2 }}
              />
            </ListItem>
          );
        })}
      </List>
    </Box>
  );
};

export default ChatList;
