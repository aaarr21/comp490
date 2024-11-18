const express = require('express');
const passport = require('passport');
const userController = require('../controllers/UserController'); 
const router = express.Router();
const FRONTEND_URL = "http://localhost:3000/WorkBoard";
const nodemailer = require("nodemailer");  

// --- User Management Routes ---
router.post('/register', userController.registerUser);  // Route to register a new user
router.post('/login', userController.loginUser);  // Backend login route
router.get('/users', userController.getAllUsers);  // Route to get all users
router.put('/:id', userController.updateUserProfile);  // Route to update user profile
router.delete('/:id', userController.deleteUser);  // Route to delete a user
router.post('/reset-password', userController.resetPassword);  // Route to reset the password

// --- Password Reset Routes ---
router.post('/reset', userController.sendResetCode); // Route to send password reset code
router.post('/verify-reset', userController.verifyResetCode); // Route to verify reset code

// --- Authentication Routes ---
function isLoggedIN(req, res, next) {
    req.user ? next() : res.sendStatus(401).json({ success: false, message: "Unauthorized" });
}

// Google Authentication Route
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google Callback Route
router.get('/google/callback', passport.authenticate('google', {
  failureRedirect: '/auth/login/failed'
}), (req, res) => {
  console.log("User successfully authenticated, redirecting to WorkBoard...");
  res.send(`
    <script>
      if (window.opener) {
        window.opener.location = "${FRONTEND_URL}";
        window.close();
      } else {
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
  res.status(200).json({ success: true, message: "Welcome to the WorkBoard!" });
});

// Logout Route
router.post('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) { return next(err); }
    req.session.destroy();  // Destroy the session
    res.redirect(FRONTEND_URL);
  });
});

// Frontend auth check
router.get('/check-auth', (req, res) => {
  if (req.isAuthenticated()) {
    res.status(200).json({ success: true, message: 'User is authenticated' });
  } else {
    res.status(401).json({ success: false, message: 'User is not authenticated' });
  }
});

// Dynamic Route to get user profile by ID
router.get('/:id', userController.getUserProfile);

module.exports = router;
