import express from "express";
import {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroup,
  addToGroup,
  removeFromGroup,
} from "../controllers/chatController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").post(protect, accessChat); // Create or fetch one-on-one chat
router.route("/").get(protect, fetchChats); // Fetch all chats for user
router.route("/group").post(protect, createGroupChat); // Create group chat
router.route("/rename").put(protect, renameGroup); // Rename group chat
router.route("/groupadd").put(protect, addToGroup); // Add user to group
router.route("/groupremove").put(protect, removeFromGroup); // Remove user from group

export default router;
