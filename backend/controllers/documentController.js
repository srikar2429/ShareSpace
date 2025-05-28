import Document from "../models/Document.js";
import asyncHandler from "express-async-handler";
import createHttpError from "http-errors";

// @desc    Create new document
// @route   POST /api/documents
// @access  Private
const createDocument = asyncHandler(async (req, res) => {
  const { title, content, chatId } = req.body;

  if (!chatId) throw createHttpError(400, "Chat ID is required");

  const newDoc = await Document.create({
    name: title || "Untitled Document",
    content: content || "",
    chat: chatId,
  });

  if (!newDoc) throw createHttpError(500, "Failed to create document");

  res.status(201).json(newDoc);
});

// @desc    Get all documents of a chat
// @route   GET /api/documents/chat/:chatId
// @access  Private
const getDocumentsByChatId = asyncHandler(async (req, res) => {
  const chatId = req.params.chatId;

  const docs = await Document.find({ chat: chatId });

  if (!docs)
    throw createHttpError(404, "No documents found for this chat");

  res.json(docs);
});

// @desc    Get document by name within a chat
// @route   GET /api/documents/chat/:chatId/name/:name
// @access  Private
const getDocumentByName = asyncHandler(async (req, res) => {
  const { chatId, name } = req.params;

  const doc = await Document.findOne({ chat: chatId, name });

  if (!doc) throw createHttpError(404, "Document not found");

  res.json(doc);
});

// @desc    Get document by ID
// @route   GET /api/documents/:id
// @access  Private
const getDocumentById = asyncHandler(async (req, res) => {
  const doc = await Document.findById(req.params.id);

  if (!doc) throw createHttpError(404, "Document not found");

  res.json(doc);
});

// @desc    Update document content and/or name
// @route   PUT /api/documents/:id
// @access  Private
const updateDocument = asyncHandler(async (req, res) => {
  const { content, name } = req.body;
  const doc = await Document.findById(req.params.id);

  if (!doc) throw createHttpError(404, "Document not found");

  if (content !== undefined) doc.content = content;
  if (name !== undefined) doc.name = name;

  const updatedDoc = await doc.save();

  res.json(updatedDoc);
});

export {
  createDocument,
  getDocumentsByChatId,
  getDocumentByName,
  getDocumentById,
  updateDocument,
};
