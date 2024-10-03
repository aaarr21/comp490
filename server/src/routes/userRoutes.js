// routes/userRoutes.js
const express = require('express');
const userController = require('../controllers/userController'); // Import the user controller

const router = express.Router(); // Create a new router object

// Define the routes and associate them with controller methods

// Route to register a new user (POST /api/users/register)
router.post('/register', userController.registerUser);

// Route to log in a user (POST /api/users/login)
router.post('/login', userController.loginUser);

// Route to get user profile (GET /api/users/:id)
router.get('/:id', userController.getUserProfile);

// Route to update user profile (PUT /api/users/:id)
router.put('/:id', userController.updateUserProfile);

// Route to delete a user (DELETE /api/users/:id)
router.delete('/:id', userController.deleteUser);

// Export the router to use it in index.js or app.js
module.exports = router;
