import React, { useEffect, useRef, useState } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import socket from "../socket.js";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Button, Container } from "@mui/material";

const TOOLBAR_OPTIONS = [
  [{ header: [1, 2, 3, false] }],
  [{ font: [] }],
  [{ list: "ordered" }, { list: "bullet" }],
  ["bold", "italic", "underline", "strike"],
  [{ color: [] }, { background: [] }],
  [{ script: "sub" }, { script: "super" }],
  [{ align: [] }],
  ["image", "blockquote", "code-block"],
  ["clean"],
];

export default function TextEditor() {
  const wrapperRef = useRef(null);
  const [quill, setQuill] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();

  const handleBack = () => {
    socket.emit("leave-document", id);
    navigate("/chat");
  };

  useEffect(() => {
    if (!wrapperRef.current) return;

    wrapperRef.current.innerHTML = "";
    const editor = document.createElement("div");
    wrapperRef.current.appendChild(editor);

    const q = new Quill(editor, {
      theme: "snow",
      modules: { toolbar: TOOLBAR_OPTIONS },
    });

    q.disable();
    q.setText("Loading document...");
    setQuill(q);
  }, []);

  useEffect(() => {
    if (!quill) return;

    const handleLoad = (document) => {
      if (document) {
        quill.setContents(document);
      } else {
        quill.setText("");
      }
      quill.enable();
    };

    socket.once("load-document", handleLoad);
    socket.emit("get-document", id);

    return () => {
      socket.off("load-document", handleLoad);
    };
  }, [quill, id]);

  useEffect(() => {
    if (!quill) return;

    const handleChange = (delta, oldDelta, source) => {
      if (source !== "user") return;
      socket.emit("send-changes", delta);
    };

    quill.on("text-change", handleChange);
    return () => quill.off("text-change", handleChange);
  }, [quill]);

  useEffect(() => {
    if (!quill) return;

    const handleReceive = (delta) => {
      quill.updateContents(delta);
    };

    socket.on("receive-changes", handleReceive);
    return () => socket.off("receive-changes", handleReceive);
  }, [quill]);

  useEffect(() => {
    if (!quill) return;

    const interval = setInterval(() => {
      socket.emit("save-document", quill.getContents());
    }, 2000);

    return () => clearInterval(interval);
  }, [quill]);

  return (
    <Box
      sx={{
        minHeight: "95vh",
        minWidth: "100vw",
        bgcolor: "#121212",
        color: "#fff",
        py: 2,
      }}
    >
      <Container maxWidth="xl">
        <Box display="flex" justifyContent="flex-start" mb={2}>
          <Button
            variant="outlined"
            color="secondary"
            onClick={handleBack}
            sx={{
              borderRadius: 2,
              fontWeight: "bold",
              textTransform: "none",
            }}
          >
            🔙 Back
          </Button>
        </Box>
        <Box
          ref={wrapperRef}
          sx={{
            bgcolor: "#1e1e1e",
            borderRadius: 3,
            height: "85vh",
            p: 2,
            overflowY: "auto",
            scrollbarWidth: "none", 
            "&::-webkit-scrollbar": {
              display: "none", 
            },
          }}
        />
      </Container>
    </Box>
  );
}
