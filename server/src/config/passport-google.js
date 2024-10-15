const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const UserService = require('../services/UserService'); // Import UserService
const dotenv = require('dotenv');
dotenv.config();

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "http://localhost:5000/auth/google/callback",
  scope: ['profile', 'email'], // Ensure correct scope is defined
},
async (accessToken, refreshToken, profile, done) => {
  console.log("Profile received" , profile); // debug code to see if profile is being returned by google and receieved correctly
  try {
      const userService = new UserService();
      let user = await userService.findOrCreateByGoogleId(profile.id, profile.emails[0].value, profile.displayName);
      return done(null, user);
  } catch (error) {
      return done(error, null);
  }
}
));

passport.serializeUser((user, cb) => {
  cb(null, user.id);  // Make sure you're using the correct user property
});


passport.deserializeUser(async (id, cb) => {
  try {
    const userService = new UserService();
    const user = await userService.findById(id);
    cb(null, user);
  } catch (err) {
    cb(err, null);
  }
});
