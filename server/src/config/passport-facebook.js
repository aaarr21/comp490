const passport = require("passport");
const FacebookStrategy = require("passport-facebook").Strategy;
const UserService = require("../services/UserService");
const dotenv = require("dotenv");

dotenv.config();


passport.use(new FacebookStrategy({
      clientID: process.env.FACEBOOK_CLIENT_ID, 
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
      callbackURL:  process.env.FACEBOOK_CALLBACK_URL,

},
async (accessToken,refreshToken,profile,done) => {
    console.log("Incoming Profile: ", profile);

    /*
     try{
        const userService = new UserService();
          /*
        let user = await userService.findOrCreateByFacebookId(
            profile.id,
            profile.username,      
            accessToken,
            refreshToken
        ); // Need to create this soon.
        return done(null,user); 
     }catch(error){
        return done(null,error);
        
     }
        */
  })
  

);

passport.serializeUser((user, cb) => { // Serialize only the user ID
    cb(null, user.id);
  });
  
  passport.deserializeUser(async (id, cb) => { // Deserialize by fetching the user from DB
    try {
      const userService = new UserService();
      const user = await userService.findById(id);
      cb(null, user);
    } catch (err) {
      cb(err, null);
    }
  });
    
