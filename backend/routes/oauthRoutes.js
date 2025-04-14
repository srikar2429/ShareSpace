import express from "express";
import passport from "passport";
import { googleAuthCallback } from "../controllers/oauthController.js";

const router = express.Router();

router.get(
  "/google",
  (req, res, next) => {
    console.log("Redirecting to Google OAuth");
    next();
  },
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account",
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/login",
  }),
  googleAuthCallback
);

export default router;  