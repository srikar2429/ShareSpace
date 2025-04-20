import { uploadFile } from "../config/drive.js";
import path from "path";


const filePath = "test_image.jpg"; 
const fileName = "test-image.jpg"; 
const mimeType = "image/jpg";

uploadFile(filePath, fileName, mimeType)
  .then((fileId) => console.log("File uploaded with ID:", fileId))
  .catch((err) => console.error("Error uploading file:", err));