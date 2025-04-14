import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Typography,
  Avatar,
  Divider,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import axios from "axios";
import Cookies from "js-cookie";
import socket from "../socket";
import { useAuth } from "../context/AuthContext";

const ChatWindow = ({ selectedChat }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedChat) return;

    const fetchMessages = async () => {
      setLoading(true);
      try {
        const token = Cookies.get("token");
        const response = await axios.get(`/api/message/${selectedChat._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMessages(response.data);
      } catch (err) {
        console.error("Error fetching messages", err);
      }
      setLoading(false);
    };

    fetchMessages();

    socket.emit("joinChat", selectedChat._id);

    socket.on("newMessage", (msg) => {
      setMessages((prevMessages) => [...prevMessages, msg]);
    });

    return () => {
      socket.off("newMessage");
    };
  }, [selectedChat]);

  const sendMessage = async () => {
    if (message.trim()) {
      try {
        const token = Cookies.get("token");
        const response = await axios.post(
          "/api/message",
          { chatId: selectedChat._id, content: message, messageType: "text" },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        await socket.emit("sendMessage", response.data);

        setMessages((prevMessages) => [...prevMessages, { ...response.data }]);
        setMessage("");
      } catch (err) {
        console.error("Error sending message", err);
      }
    }
  };

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#f4f6f9",
      }}
    >
      {/* Messages */}
      <Box sx={{ flex: 1, overflowY: "auto", padding: 2 }}>
        <List sx={{ paddingBottom: "10px" }}>
          {loading ? (
            <Typography>Loading messages...</Typography>
          ) : (
            messages.map((msg, idx) => {
              const isOwnMessage = msg.sender._id === user._id;
              return (
                <ListItem
                  key={idx}
                  sx={{
                    display: "flex",
                    justifyContent: isOwnMessage ? "flex-end" : "flex-start",
                    alignItems: "center",
                    marginBottom: 1,
                  }}
                >
                  {!isOwnMessage && (
                    <Avatar
                      sx={{ width: 30, height: 30, marginRight: 1 }}
                      src={msg.sender.avatarUrl}
                    />
                  )}

                  <Box
                    sx={{
                      backgroundColor: isOwnMessage ? "#007bff" : "#e9ecef",
                      color: isOwnMessage ? "#fff" : "#000",
                      padding: "8px 12px",
                      borderRadius: "20px",
                      maxWidth: "60%",
                      wordWrap: "break-word",
                      textAlign: "left",
                    }}
                  >
                    {msg.content}
                  </Box>

                  {isOwnMessage && (
                    <Avatar
                      sx={{ width: 30, height: 30, marginLeft: 1 }}
                      src={msg.sender.avatarUrl}
                    />
                  )}
                </ListItem>
              );

            })
          )}
        </List>
      </Box>

      <Divider sx={{ marginBottom: 1 }} />

      <Box sx={{ display: "flex", alignItems: "center", padding: "10px" }}>
        <TextField
          variant="outlined"
          fullWidth
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          sx={{
            borderRadius: "20px",
            marginRight: 2,
            "& .MuiOutlinedInput-root": {
              borderRadius: "20px",
            },
            "& .MuiOutlinedInput-input": {
              padding: "10px",
            },
          }}
        />
        <IconButton
          onClick={sendMessage}
          color="primary"
          sx={{
            borderRadius: "50%",
            backgroundColor: "#fff",
            "&:hover": {
              backgroundColor: "#eee",
            },
          }}
        >
          <SendIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

export default ChatWindow;
