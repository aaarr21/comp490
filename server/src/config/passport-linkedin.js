//TBD
const passport = require("passport");
const LinkedInStrategy = require("passport-linkedin-oauth2").Strategy;
const UserService = require("../services/UserService");
const dotenv = require("dotenv");

dotenv.config();

passport.use(
  new LinkedInStrategy(
    {
      clientID: process.env.LINKEDIN_CLIENT_ID,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
      callbackURL: process.env.LINKEDIN_CALLBACK_URL,
      scope: ["profile"],
    },
    async (accessToken, refreshToken, profile, done) => {
      console.log("Incoming Profile: ", profile);

      try {
        const userService = new UserService();

        let user = await userService.findOrCreatebyLinkedInId(
          profile.id,
          profile.email,
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
