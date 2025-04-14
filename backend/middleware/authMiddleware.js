import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import User from "../models/User.js";
import createHttpError from "http-errors";
import env from "../utils/validateEnv.js";

// Protected Routes Middleware
const protect = asyncHandler(async (req, res, next) => {
  let token = req.cookies.jwt;

  if (!token) {
    throw createHttpError(401, "Not authorized, no token");
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    req.user = await User.findById(decoded.userId).select("-password");
    next();
  } catch (error) {
    throw createHttpError(401, "Not authorized, token failed");
  }
});

// Admin middleware

const admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    throw new createHttpError(401, "Not authorized as admin");
  }
};

export { protect, admin };
