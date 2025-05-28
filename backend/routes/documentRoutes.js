import express from "express";
import {
  createDocument,
  getDocumentsByChatId,
  getDocumentByName,
  getDocumentById,
  updateDocument,
} from "../controllers/documentController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").post(protect, createDocument);

router.route("/chat/:chatId").get(protect, getDocumentsByChatId);

router.route("/chat/:chatId/name/:name").get(protect, getDocumentByName);

router.route("/:id").get(protect, getDocumentById).put(protect, updateDocument);

export default router;
