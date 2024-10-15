// routes/userRoutes.js
const express = require('express');
const passport = require('passport');
const userController = require('../controllers/UserController'); // Import the user controller
const router = express.Router(); // Create a new router object
const FRONTEND_URL = "http://localhost:3000/WorkBoard";

// --- User Management Routes ---
router.post('/register', userController.registerUser);  // Route to register a new user (POST /api/users/register)
router.post('/login', userController.loginUser);  // Route to log in a user (POST /api/users/login)
router.get('/:id', userController.getUserProfile);  // Route to get user profile (GET /api/users/:id)
router.put('/:id', userController.updateUserProfile);  // Route to update user profile (PUT /api/users/:id)
router.delete('/:id', userController.deleteUser);  // Route to delete a user (DELETE /api/users/:id)

// --- Authentication Routes ---
// Middleware to check if user is logged in
function isLoggedIN(req, res, next) {
    req.user ? next() : res.sendStatus(401);
  }
  
// Route to initiate Google authentication, including the correct scope
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email']  // request profile and email
}));

// Google callback route after successful authentication
router.get('/google/callback', passport.authenticate('google', {
  failureRedirect: '/auth/login/failed'
}), (req, res) => {
  console.log("User successfully authenticated, redirecting to workBoard..."); // debug code
  res.redirect(FRONTEND_URL);
});

  
  router.get('/login/failed', (req, res) => {
    res.status(401).json({ success: false, message: "Failed to login" });
  });
  

  // protected workBoard route to check login status
  router.get('/WorkBoard', isLoggedIN, (req, res) => {
    if (req.user) {
      res.status(200).json({
        success: true,
        message: "Login successful",
        user: req.user,
      });
    } else {
      res.status(401).json({ success: false, message: "Unauthorized" });
    }
  });
  
  router.post('/logout', (req, res, next) => {
    req.logout((err) => {
      if (err) { return next(err); }
      req.session.destroy();
      res.redirect(FRONTEND_URL);
    });
  });

  // Route to get a list of all users
  router.get('/users', userController.getAllUsers);
  
  // Export the router to use it in index.js or app.js
  module.exports = router;