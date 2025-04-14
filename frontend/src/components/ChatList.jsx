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
} from "@mui/material";
import axios from "axios";
import socket from "../socket";
import Cookies from "js-cookie";
import { useAuth } from "../context/AuthContext";

const ChatList = ({ chats, onSelectChat, setChats }) => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeChat, setActiveChat] = useState(null);

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

      setSearchQuery("");
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

  const getChatName = (chat) => {
    const otherUser = chat.users?.find((u) => u._id !== user._id);
    return otherUser?.name || "Unknown";
  };

  const getChatAvatar = (chat) => {
    const otherUser = chat.users?.find((u) => u._id !== user._id);
    return otherUser?.pic || "";
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
          marginTop: 5,
          marginBottom: 2,
          backgroundColor: "#fff",
          borderRadius: "8px",
          input: { color: "#000" },
          label: { color: "#000" },
        }}
      />

      {searchQuery && (
        <Box sx={{ maxHeight: "50vh", overflowY: "auto", marginBottom: 2 }}>
          {loading ? (
            <Typography sx={{ color: "#000" }}>Loading...</Typography>
          ) : (
            searchResults.map((result) => (
              <ListItem
                button
                key={result._id}
                onClick={() => handleCreateChat(result._id)}
                sx={{
                  padding: "12px",
                  borderBottom: "1px solid #ddd",
                  "&:hover": {
                    backgroundColor: "#f1f1f1",
                  },
                }}
              >
                <Avatar src={result.pic} />
                <ListItemText
                  primary={result.name}
                  secondary={result.email}
                  sx={{
                    marginLeft: 2,
                    "& .MuiTypography-root": { color: "#000" },
                  }}
                />
              </ListItem>
            ))
          )}
        </Box>
      )}

      {searchQuery && <Divider sx={{ marginBottom: 2 }} />}

      <List sx={{ overflowY: "auto" }}>
        {chats.map((chat) => (
          <ListItem
            button
            key={chat._id}
            onClick={() => handleExistingChatClick(chat)}
            sx={{
              padding: "12px",
              borderBottom: "1px solid #ddd",
              color: "#000",
              backgroundColor:
                activeChat === chat._id ? "#dbeeff" : "transparent", // light blue for selected
              "&:hover": {
                backgroundColor: "#e6f3ff", // lighter blue for hover
              },
            }}
          >
            <Avatar src={getChatAvatar(chat)} />
            <ListItemText
              primary={
                <Typography sx={{ color: "#000", fontWeight: 500 }}>
                  {getChatName(chat)}
                </Typography>
              }
              secondary={
                <Typography sx={{ color: "#000" }}>
                  {chat.lastMessage || ""}
                </Typography>
              }
              sx={{ marginLeft: 2 }}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default ChatList;
