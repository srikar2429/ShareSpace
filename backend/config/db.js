import mongoose from "mongoose";
import env from "../utils/validateEnv.js";

const connectDB = async () => {
  try {
    console.log(env.MONGO_URI);
    const conn = await mongoose.connect(env.MONGO_URI);
    console.log("Connected to database");
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
