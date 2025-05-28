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

const authorize = () => {
  const auth = new google.auth.GoogleAuth({
    keyFile: keyPath,
    scopes: ["https://www.googleapis.com/auth/drive"],
  });
  return auth;
};

export const getOrCreateFolder = async (chatId) => {
  const auth = await authorize();
  const drive = google.drive({ version: "v3", auth });

  const parentFolderId = env.DRIVE_FOLDER_ID;

  const res = await drive.files.list({
    q: `'${parentFolderId}' in parents and name='${chatId}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    fields: "files(id, name)",
  });

  if (res.data.files.length > 0) {
    return res.data.files[0].id;
  }

  const fileMetadata = {
    name: chatId,
    mimeType: "application/vnd.google-apps.folder",
    parents: [parentFolderId],
  };

  const folder = await drive.files.create({
    resource: fileMetadata,
    fields: "id",
  });

  return folder.data.id;
};

export const uploadFile = async (filePath, fileName, mimeType, folderId) => {
  const auth = await authorize();
  const driveService = google.drive({ version: "v3", auth });

  const fileMetadata = {
    name: fileName,
    parents: [folderId],
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

    console.log("File uploaded successfully", res.data);

    const fileId = res.data.id;

    await driveService.permissions.create({
      fileId,
      requestBody: {
        role: "reader",
        type: "anyone",
      },
    });

    // Fetch file metadata to get the view and download URLs
    const fileMetadataRes = await driveService.files.get({
      fileId: fileId,
      fields: "webViewLink, webContentLink",
    });

    console.log("File metadata:", fileMetadataRes.data);

    const fileInfo = {
      fileId: fileId,
      viewUrl: fileMetadataRes.data.webViewLink,
      downloadUrl: fileMetadataRes.data.webContentLink,
    };

    return fileInfo;
  } catch (error) {
    console.error("Error uploading file:", error.message);
    throw error;
  }
};
