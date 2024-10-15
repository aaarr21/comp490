const express = require('express');
const passport = require('passport');
const userController = require('../controllers/UserController'); // Import the user controller
const router = express.Router();
const FRONTEND_URL = "http://localhost:3000/WorkBoard";

// --- User Management Routes ---
router.post('/register', userController.registerUser);  // Route to register a new user
router.post('/login', userController.loginUser);  // Route to log in a user
router.get('/users', userController.getAllUsers);  // Route to get all users
router.put('/:id', userController.updateUserProfile);  // Route to update user profile
router.delete('/:id', userController.deleteUser);  // Route to delete a user

// --- Authentication Routes ---
// Middleware to check if user is logged in, sends 401 if not
function isLoggedIN(req, res, next) {
    req.user ? next() : res.sendStatus(401);
}

// Google Authentication Route
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google Callback Route
router.get('/google/callback', passport.authenticate('google', {
  failureRedirect: '/auth/login/failed'
}), (req, res) => {
  console.log("User successfully authenticated, redirecting to WorkBoard..."); // debug code
  // Send a script to the popup window to close itself and update the main window
  res.send(`
    <script>
      // Redirect the main (opener) window to the WorkBoard page
      if (window.opener) {
        window.opener.location = "${FRONTEND_URL}";
        // Close the popup window
        window.close();
      } else {
        // If the popup was not opened by the main window, redirect directly
        window.location = "${FRONTEND_URL}";
      }
    </script>
  `);
});

// Login Failure Route
router.get('/login/failed', (req, res) => {
  res.status(401).json({ success: false, message: "Failed to login" });
});

// Protected route for checking login status
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

// Logout Route
router.post('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) { return next(err); }
    req.session.destroy();
    res.redirect(FRONTEND_URL);
  });
});

// Dynamic Route to get user profile by ID
router.get('/:id', userController.getUserProfile);  // Route to get user profile by ID (move this last)

module.exports = router;
