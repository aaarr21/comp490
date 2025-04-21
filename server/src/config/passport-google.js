const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const UserService = require("../services/UserService"); // Import UserService
const dotenv = require("dotenv");
dotenv.config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL, // Use .env for flexibility
      scope: ["profile", "email"],
    },
    async (accessToken, refreshToken, profile, done) => {
      console.log("Profile received", profile); // Debug to check profile
      try {
        const userService = new UserService();
        // Pass accessToken and refreshToken to the method
        let user = await userService.findOrCreateByGoogleId(
          profile.id,
          profile.emails[0].value,
          profile.displayName,
          accessToken,
          refreshToken
        );
        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

passport.serializeUser((user, cb) => {
  // Serialize only the user ID
  cb(null, user.id);
});

passport.deserializeUser(async (id, cb) => {
  // Deserialize by fetching the user from DB
  try {
    const userService = new UserService();
    const user = await userService.findById(id);
    cb(null, user);
  } catch (err) {
    cb(err, null);
  }
});
