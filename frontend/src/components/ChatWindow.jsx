import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  IconButton,
  List,
  ListItem,
  Typography,
  Avatar,
  Divider,
  Tooltip,
  MenuItem,
  Button,
  Stack,
} from "@mui/material";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import SendIcon from "@mui/icons-material/Send";
import VideoCallIcon from "@mui/icons-material/VideoCall";
import axios from "axios";
import Cookies from "js-cookie";
import socket from "../socket";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const ChatWindow = ({ selectedChat }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [docs, setDocs] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState("");
  const [newDocName, setNewDocName] = useState("");
  const navigate = useNavigate();

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

  useEffect(() => {
    const fetchDocs = async () => {
      if (!selectedChat) return;
      try {
        const token = Cookies.get("token");
        const res = await axios.get(`/api/docs/chat/${selectedChat._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDocs(res.data);
      } catch (err) {
        console.error("Error fetching docs:", err);
      }
    };

    fetchDocs();
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

        setMessages((prevMessages) => [...prevMessages, response.data]);
        setMessage("");
      } catch (err) {
        console.error("Error sending message", err);
      }
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !selectedChat) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("chatId", selectedChat._id);

    try {
      const token = Cookies.get("token");

      const res = await axios.post("/api/files/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      const uploadedFile = res.data;

      const messageRes = await axios.post(
        "/api/message",
        {
          chatId: selectedChat._id,
          content: uploadedFile.fileName,
          messageType: "file",
          file: {
            fileName: uploadedFile.fileName,
            mimeType: uploadedFile.mimeType,
            deliveredFileId: uploadedFile.deliveredFileId,
            viewUrl: uploadedFile.viewUrl,
            downloadUrl: uploadedFile.downloadUrl,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      socket.emit("sendMessage", messageRes.data);
      setMessages((prev) => [...prev, messageRes.data]);
    } catch (err) {
      console.error("Error uploading/saving file message:", err);
    }
  };

  const handleCreateDoc = async () => {
    if (!newDocName.trim()) return;
    try {
      const token = Cookies.get("token");
      const res = await axios.post(
        "/api/docs",
        { title: newDocName, chatId: selectedChat._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDocs((prev) => [...prev, res.data]);
      console.log(docs);
      setNewDocName("");
    } catch (err) {
      console.error(
        "Error creating doc:",
        err.response ? err.response.data : err.message
      );
    }
  };

  const handleDocSelect = (docId) => {
    console.log(docId);
    setSelectedDoc(docId);
    if (docId) {
      navigate(`/document/${docId}`);
    }
  };

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#f0f2f5",
        borderRadius: 2,
        boxShadow: 3,
      }}
    >
      {selectedChat && (
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: "center",
            p: 2,
            gap: 2,
            borderBottom: "1px solid #ddd",
            backgroundColor: "#fff",
          }}
        >
          <TextField
            size="small"
            label="New Document Name"
            value={newDocName}
            onChange={(e) => setNewDocName(e.target.value)}
            sx={{ flex: 1, minWidth: 200 }}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCreateDoc();
            }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleCreateDoc}
            sx={{ height: 40 }}
          >
            Create Doc
          </Button>

          <TextField
            select
            size="small"
            label="Open Document"
            value={selectedDoc || ""}
            onChange={(e) => handleDocSelect(e.target.value)}
            sx={{ width: 250 }}
            placeholder="Select Document"
          >
            <MenuItem value="">-- Select a document --</MenuItem>
            {docs.map((doc) => (
              <MenuItem key={doc._id} value={doc._id}>
                <Typography sx={{ color: "#000" }}>{doc.name}</Typography>
              </MenuItem>
            ))}
          </TextField>
        </Box>
      )}

      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          padding: 2,
          bgcolor: "#fff",
          borderRadius: "0 0 0 8px",
          display: "flex",
          flexDirection: "column",
          gap: 1,
        }}
      >
        {loading ? (
          <Typography align="center" sx={{ mt: 2 }}>
            Loading messages...
          </Typography>
        ) : messages.length === 0 ? (
          <Typography align="center" sx={{ mt: 2, color: "gray" }}>
            No messages yet. Start the conversation!
          </Typography>
        ) : (
          messages.map((msg, idx) => {
            const isOwn = msg.sender._id === user._id;
            const isFile = msg.messageType === "file";

            return (
              <Box
                key={idx}
                sx={{
                  display: "flex",
                  justifyContent: isOwn ? "flex-end" : "flex-start",
                  mb: 1,
                }}
              >
                {!isOwn && (
                  <Avatar
                    src={msg.sender.avatarUrl}
                    sx={{ width: 32, height: 32, mr: 1, alignSelf: "flex-end" }}
                    alt={msg.sender.name || "User"}
                  />
                )}

                <Box
                  sx={{
                    bgcolor: isOwn ? "#0b81ff" : "#e0e0e0",
                    color: isOwn ? "#fff" : "#000",
                    p: 1.2,
                    borderRadius: 2,
                    maxWidth: "70%",
                    fontSize: "0.9rem",
                    boxShadow: isOwn
                      ? "0 2px 8px rgb(11 129 255 / 0.4)"
                      : "0 2px 8px rgb(0 0 0 / 0.1)",
                    wordBreak: "break-word",
                    cursor: isFile ? "pointer" : "default",
                    textDecoration: isFile ? "underline" : "none",
                  }}
                >
                  {isFile ? (
                    <a
                      href={msg.file?.viewUrl || msg.file?.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: isOwn ? "#fff" : "#000",
                        textDecoration: "none",
                      }}
                    >
                      📎 {msg.content || "File"}
                    </a>
                  ) : (
                    msg.content
                  )}
                </Box>

                {isOwn && (
                  <Avatar
                    src={msg.sender.avatarUrl}
                    sx={{ width: 32, height: 32, ml: 1, alignSelf: "flex-end" }}
                    alt={msg.sender.name || "User"}
                  />
                )}
              </Box>
            );
          })
        )}
      </Box>

      <Divider />

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          p: 1.5,
          bgcolor: "#fff",
          borderRadius: "0 0 8px 8px",
          gap: 1,
        }}
      >
        <TextField
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
          placeholder="Type a message..."
          fullWidth
          size="medium"
          multiline
          maxRows={4}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "24px",
              fontSize: "1rem",
            },
          }}
        />

        <input
          id="file-upload"
          type="file"
          hidden
          onChange={handleFileUpload}
          accept="*"
        />
        <label htmlFor="file-upload">
          <IconButton color="primary" component="span">
            <AttachFileIcon />
          </IconButton>
        </label>

        <IconButton
          color="primary"
          onClick={sendMessage}
          disabled={!message.trim()}
          sx={{ ml: 0.5 }}
        >
          <SendIcon />
        </IconButton>

        {selectedChat && (
          <Tooltip title="Join Video Call">
            <IconButton
              onClick={() => navigate(`/video-call/${selectedChat._id}`)}
              color="secondary"
            >
              <VideoCallIcon />
            </IconButton>
          </Tooltip>
        )}
      </Box>
    </Box>
  );
};

export default ChatWindow;
