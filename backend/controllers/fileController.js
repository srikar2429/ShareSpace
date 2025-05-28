import asyncHandler from "express-async-handler";
import createHttpError from "http-errors";
import { uploadFile, getOrCreateFolder } from "../config/drive.js";
import File from "../models/File.js";
import path from "path";
import fs from "fs";

// @desc    Upload a file to a chat
// @route   POST /api/files/:chatId
// @access  Protected
const uploadChatFile = asyncHandler(async (req, res) => {
  const { chatId } = req.body;
  const senderId = req.user._id;

  if (!req.file) {
    throw createHttpError(400, "No file uploaded");
  }

  const filePath = req.file.path;
  const fileName = req.file.originalname;
  const mimeType = req.file.mimetype;

  const folderId = await getOrCreateFolder(chatId);

  const obj = await uploadFile(filePath, fileName, mimeType, folderId);
  console.log("Uploaded file info:", obj);
  //console.log("Drive file ID:", driveFileId);

  const fileDoc = await File.create({
    chat: chatId,
    sender: senderId,
    fileName,
    mimeType,
    deliveredFileId: obj.fileId,
    viewUrl: obj.viewUrl,
    downloadUrl: obj.downloadUrl,
  });

  fs.unlink(filePath, () => {});

  return res.status(201).json(fileDoc);
});



// @desc    Get all files for a chat
// @route   GET /api/files/:chatId
// @access  Protected
const getChatFiles = asyncHandler(async (req, res) => {
  const { chatId } = req.params;

  const files = await File.find({ chat: chatId }).populate(
    "sender",
    "name email"
  );

  return res.status(200).json(files);
});

export { uploadChatFile, getChatFiles };
