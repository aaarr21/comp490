const router = require("express").Router();
const passport = require("passport");

const FRONTEND_URL = "http://localhost:3000/WorkBoard";

// Get method for google


// Middleware checks if user is Logged in
function isLoggedIN(req, res,next) {
  //checks if logged in, sends 401 status if not
  req.user ? next() : res.sendStatus(401);
}

//get route for Google Auth
// scope of request from google; email and profile


router.get("/google", passport.authenticate("google", {scope: ['email', 'profile'] })
);

//callback route; authentication check, redirects to path on success or fail
router.get('/google/callback', passport.authenticate("google", { 
  failureRedirect: "/auth/login/failed", // redirect to failure handler
  successRedirect: FRONTEND_URL // redirect to flowban route
})); 

/* 
    This should have a call to the database to search if the username already exists.
   If not, then insert the userdata into a new record within the table.
   Need our made userSchema and all database connections.
    I cannot do this currently because I need my wsl distro password in order to install a mysql database. Of which
    I have no clue on what it is.
*/

router.post('/register' , (req,res) =>{          //NOTE: Currently this route never gets reached by front-end
     const username = req.body.username;         // Attempt to axios.post with /auth/register does a 404 status,
     const password = req.body.password;        // Which means the proxy doesn't play nice with /auth
      res.sendStatus(201);
   
});



// failure handler for google oAuth
router.get("/login/failed" , (req, res) =>{
  res.status(401).json({
    success: false,
    message: "failure to login",
  });
});
 
// success handler for google oAuth
router.get("/WorkBoard",isLoggedIN, (req,res) => {
  console.log("this worked?");
  if(req.user){
    res.status(200).json({
        success:true,
        message: "Login successful",
        user: req.user,
        
      });
  } else {
    res.status(401).json({
      success: false,
      message: "unauthorized user",
    });
    res.redirect("/");
  }

});



// logout route

router.post("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) { 
      return next(err);  // handles logout errors
    }
    req.session.destroy();  // destroys session
    res.redirect(FRONTEND_URL);  // redirect back to frontend after logout
  });
});

module.exports = router;