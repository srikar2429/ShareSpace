import { google } from "googleapis";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import env from "../utils/validateEnv.js";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const keyPath = path.join(
  __dirname,
  "..",
  "..",
  "secrets",
  "service-account-key.json"
);

const drive = google.drive("v3");

const authorize = () => {
  const auth = new google.auth.GoogleAuth({
    keyFile: keyPath,
    scopes: ["https://www.googleapis.com/auth/drive"],
  });
  return auth;
};

export const uploadFile = async (filePath, fileName, mimeType) => {
  const auth = await authorize();
  const driveService = google.drive({ version: "v3", auth });

  const fileMetadata = {
    name: fileName,
    parents: [env.DRIVE_FOLDER_ID],
  };

  const media = {
    mimeType: mimeType,
    body: fs.createReadStream(filePath),
  };

  try {
    const res = await driveService.files.create({
      resource: fileMetadata,
      media: media,
      fields: "id",
    });
    console.log("File uploaded successfully", res.data.id);
    return res.data.id;
  } catch (error) {
    console.error("Error uploading file:", error.message);
    throw error;
  }
};
