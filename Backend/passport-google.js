//passport-google strategy
const dotenv = require('dotenv');

dotenv.config();

const passport = require('passport');
var GoogleStrategy = require('passport-google-oauth20').Strategy;

const Google_CLient_ID = process.env.GOOGLE_CLIENT_ID;
const Google_Client_Secret = process.env.GOOGLE_CLIENT_SECRET;

passport.use(new GoogleStrategy({ //use googel strategy, with the provided Google-Client-ID and secret
    clientID: Google_CLient_ID,    // These are contained within the .env file, and are held in my own email
    clientSecret: Google_Client_Secret,
    callbackURL: "/auth/google/callback" //callback url. 
  },
  function(accessToken, refreshToken, profile, cb) {
   // User.findOrCreate({ googleId: profile.id }, function (err, user) { // We need a database set up to actually search for and add the user authetnicated from google.
      return cb(null, profile); //call-back, returns google profile
    //});
  }
));

passport.serializeUser(function(user, cb) { // serialize user, this is what stores the user in the current session
   cb(null,user);                           // This is what is calledv when user sucussfully authenticates with google                   
});                                         // You can actually check if you're within the session by clicking f12 and checking the cookies.
 
passport.deserializeUser(function(user, cb){ //deserlize user
    cb(null,user);
});