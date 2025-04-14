import express from "express";
import { allMessages, sendMessage } from "../controllers/messageController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/:chatId").get(protect, allMessages); // Get all messages for a chat
router.route("/").post(protect, sendMessage); // Send a message

export default router;
