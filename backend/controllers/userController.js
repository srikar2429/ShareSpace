import User from "../models/User.js";
import asyncHandler from "express-async-handler";
import createHttpError from "http-errors";
import generateToken from "../utils/generateToken.js";
import bcrypt from "bcryptjs";

// @desc    Register user
// @route   POST /api/users
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, username, email, password } = req.body;
  console.log("Registering user with body:", req.body);

  const userExists = await User.findOne({ $or: [{ email }, { username }] });
  if (userExists) throw createHttpError(400, "User already exists");

  const user = await User.create({ name, username, email, password });

  if (!user) throw createHttpError(400, "Invalid user data");

  generateToken(res, user._id, user.username);

  res.status(201).json({
    _id: user._id,
    name: user.name,
    username: user.username,
    email: user.email,
    isAdmin: user.isAdmin,
  });
});

// @desc    Auth user and get token
// @route   POST /api/users/login
// @access  Public
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user || !(await user.matchPassword(password))) {
    throw createHttpError(401, "Invalid credentials");
  }

  generateToken(res, user._id, user.username);

  res.json({
    _id: user._id,
    name: user.name,
    username: user.username,
    email: user.email,
    isAdmin: user.isAdmin,
  });
});

// @desc    Logout user
// @route   POST /api/users/logout
// @access  Private
const logoutUser = asyncHandler(async (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV !== "development",
    sameSite: "strict",
    expires: new Date(0),
  });

  res.status(200).json({ message: "Logged out successfully" });
});

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  if (!req.user.isAdmin) throw createHttpError(403, "Admins only");

  const users = await User.find({}).select("-password");
  res.status(200).json(users);
});

//@description     Get all users except current user or search by query
//@route           GET /api/user?search=
//@access          Protected
const allUsers = async (req, res, next) => {
  const keyword = req.query.search
    ? {
        $or: [
          { name: { $regex: req.query.search, $options: "i" } },
          { email: { $regex: req.query.search, $options: "i" } },
        ],
      }
    : {};

  const users = await User.find(keyword)
    .find({ _id: { $ne: req.user._id } })
    .select("-password");

  res.status(200).json(users);
};

// @desc    Get user profile with projects and tasks
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .select("-password")

  if (!user) throw createHttpError(404, "User not found");

  res.status(200).json(user);
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) throw createHttpError(404, "User not found");

  user.name = req.body.name || user.name;
  user.username = req.body.username || user.username;
  user.email = req.body.email || user.email;
  user.profilePicture = req.body.profilePicture || user.profilePicture;

  // Handle password change
  if (req.body.currentPassword && req.body.newPassword) {
    const isMatch = await user.matchPassword(req.body.currentPassword);
    if (!isMatch) throw createHttpError(401, "Incorrect current password");

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(req.body.newPassword, salt);
  }

  const updatedUser = await user.save();

  res.status(200).json({
    _id: updatedUser._id,
    name: updatedUser.name,
    username: updatedUser.username,
    email: updatedUser.email,
    isAdmin: updatedUser.isAdmin,
    profilePicture: updatedUser.profilePicture,
  });
});

// @desc    Delete user account (self)
// @route   DELETE /api/users/profile
// @access  Private
const deleteUserAccount = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) throw createHttpError(404, "User not found");

  await user.deleteOne();
  res.status(200).json({ message: "Account deleted successfully" });
});

// @desc    Admin deletes any user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUserByAdmin = asyncHandler(async (req, res) => {
  if (!req.user.isAdmin) throw createHttpError(403, "Admins only");

  const user = await User.findById(req.params.id);
  if (!user) throw createHttpError(404, "User not found");

  await user.deleteOne();
  res.status(200).json({ message: "User deleted successfully" });
});

// @desc    Admin updates user
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUserByAdmin = asyncHandler(async (req, res) => {
  if (!req.user.isAdmin) throw createHttpError(403, "Admins only");

  const user = await User.findById(req.params.id);
  if (!user) throw createHttpError(404, "User not found");

  user.name = req.body.name || user.name;
  user.username = req.body.username || user.username;
  user.email = req.body.email || user.email;
  user.isAdmin = req.body.isAdmin || user.roisAdminle;

  const updatedUser = await user.save();
  res.status(200).json(updatedUser);
});

export {
  registerUser,
  authUser,
  logoutUser,
  getUsers,
  getUserProfile,
  updateUserProfile,
  deleteUserAccount,
  deleteUserByAdmin,
  updateUserByAdmin,
  allUsers,
};
