import jwt from "jsonwebtoken";
import env from "../utils/validateEnv.js";

const generateToken = (res, userId, username) => {
  const token = jwt.sign({ userId, username }, env.JWT_SECRET, {
    expiresIn: "30d",
  });

  // Set token onto a cookie
  res.cookie("jwt", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== "development",
    sameSite: "strict",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
};

export default generateToken;
