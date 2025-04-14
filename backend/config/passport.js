import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/User.js";
import env from "../utils/validateEnv.js";

passport.use(
  new GoogleStrategy(
    {
      clientID: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const existingUser = await User.findOne({ googleId: profile.id });

        if (existingUser) return done(null, existingUser);

        const email = profile.emails[0].value;
        const name = profile.displayName;
        const avatar = profile.photos?.[0]?.value;

        let user = await User.findOne({ email });

        if (user) {
          // Link their Google account
          user.googleId = profile.id;
          user.profilePicture = user.profilePicture || avatar;
          await user.save();
        } else {
          const username = email.split("@")[0];

          // Create new user
          user = await User.create({
            name,
            username,
            email,
            googleId: profile.id,
            profilePicture: avatar,
            password: "GOOGLE_OAUTH", 
          });
        }

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);