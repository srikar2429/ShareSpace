import generateToken from "../utils/generateToken.js";
import createHttpError from "http-errors";
import env from "../utils/validateEnv.js";

// @desc    Handle successful Google OAuth login
// @route   GET /api/users/google/callback
// @access  Public (handled by passport)
const googleAuthCallback = async (req, res) => {
  if (!req.user) {
    throw createHttpError(401, "OAuth authentication failed");
  }

  generateToken(res, req.user._id, req.user.username);

  // Redirect to frontend after successful login
  res.redirect(`${env.CLIENT_URL}/dashboard`);
};

export { googleAuthCallback }; 
