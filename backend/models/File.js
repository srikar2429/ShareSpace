import mongoose from "mongoose";

const fileModel = mongoose.Schema(
  {
    chat: { type: mongoose.Schema.Types.ObjectId, ref: "Chat", required: true },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fileName: { type: String, required: true },
    mimeType: { type: String, required: true },
    deliveredFileId: { type: String, required: true },
    viewUrl: { type: String, required: true },
    downloadUrl: { type: String, required: true },
  },
  { timestamps: true }
);

const File = mongoose.model("File", fileModel);

export default File;