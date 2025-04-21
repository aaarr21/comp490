const passport = require("passport");
const GitHubStrategy = require("passport-github2").Strategy;
const UserService = require("../services/UserService");
const dotenv = require("dotenv");

dotenv.config();

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.GITHUB_CALLBACK_URL,
      scope: ["profile", "profile:email"],
    },
    async (accessToken, refreshToken, profile, done) => {
      console.log("Incoming Profile: ", profile);
      try {
        const userService = new UserService();

        let user = await userService.findOrCreateByGithubId(
          profile.id,
          profile.profileUrl,
          profile.username,
          accessToken,
          refreshToken
        ); // Need to create this soon.
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
