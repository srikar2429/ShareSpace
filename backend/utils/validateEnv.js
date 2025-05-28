import { cleanEnv } from "envalid";
import { port, str } from "envalid";
import dotenv from "dotenv";
dotenv.config({ path: "./env/.env" });

export default cleanEnv(process.env, {
  NODE_ENV: str({
    choices: ["development", "production", "test"],
    default: "development",
  }),
  MONGO_URI: str(),
  PORT: port(),
  JWT_SECRET: str(),
  GOOGLE_CLIENT_ID:str(),
  GOOGLE_CLIENT_SECRET:str(),
  //GOOGLE_CALLBACK_URL: str(),
  CLIENT_URL: str(),
  DRIVE_FOLDER_ID: str(),
});
