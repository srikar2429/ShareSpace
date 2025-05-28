import express from "express";
import multer from "multer";
import { uploadChatFile, getChatFiles } from "../controllers/fileController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// Route to upload file
router.post("/upload", protect, upload.single("file"), uploadChatFile);

// Route to get files for a chat
router.get("/:chatId", protect, getChatFiles);

export default router;