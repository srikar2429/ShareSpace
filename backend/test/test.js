import { uploadFile, getOrCreateFolder } from "../config/drive.js";

const chatId = "test-chat-id"; 
const filePath = "test_image.jpg";
const fileName = "test-image.jpg";
const mimeType = "image/jpg";

const runTest = async () => {
  try {
    const folderId = await getOrCreateFolder(chatId);
    const fileId = await uploadFile(filePath, fileName, mimeType, folderId);
    console.log("File uploaded with ID:", fileId);
  } catch (err) {
    console.error("Error uploading file:", err);
  }
};

runTest();
