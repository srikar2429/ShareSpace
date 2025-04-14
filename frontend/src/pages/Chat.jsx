// pages/Chat.js
import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { Box, Button, Typography } from "@mui/material";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import ChatList from "../components/ChatList";
import ChatWindow from "../components/ChatWindow";
import axios from "axios";
import Cookies from "js-cookie";
import socket from "../socket.js"; 

const Chat = () => {
  const navigate = useNavigate();
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const token = Cookies.get("token");
        const response = await axios.get("/api/chat", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setChats(response.data);
        console.log(response.data)
      } catch (err) {
        console.error("Failed to fetch chats:", err);
      }
    };

    fetchChats();
  }, []);

  const handleSelectChat = (chat) => {
    setSelectedChat(chat);
  };

  return (
    <>
      <Navbar />
      <Box
        sx={{
          display: "flex",
          height: "94.5vh",
          width: "100vw",
          paddingTop: "4rem",
          backgroundColor: "#f5f5f5",
        }}
      >
        <Box
          sx={{
            width: "30%",
            borderRight: "1px solid #ddd",
            overflowY: "auto",
          }}
        >
          <ChatList
            chats={chats}
            onSelectChat={handleSelectChat}
            setChats={setChats} 
          />
        </Box>

        <Box
          sx={{
            width: "70%",
            padding: 2,
            overflowY: "auto",
          }}
        >
          {selectedChat ? (
            <ChatWindow selectedChat={selectedChat} />
          ) : (
            <Box sx={{ textAlign: "center", paddingTop: "2rem" }}>
              <Typography variant="h6">
                Select a chat to start messaging
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </>
  );
};

export default Chat;
