const Router = require('express').Router;
const userController = require('../controllers/UserController'); // Import the user controller
const { validateUserRegistration, validateUserLogin } = require('../middlewares/validationMiddleware'); // Import validation middleware
const authenticateJWT = require('../middlewares/authMiddleware'); // Import authentication middleware
const validateUserId = require('../middlewares/validateUserId'); // Middleware for validating user ID

const router = Router(); // Create a new router object

// Route to register a new user (POST /api/users/register) with validation middleware
router.post('/register', validateUserRegistration, userController.registerUser);

// Route to log in a user (POST /api/users/login) with validation middleware
router.post('/login', validateUserLogin, userController.loginUser);

// Route to get user profile (GET /api/users/:id) with authentication and user ID validation middleware
router.get('/:id', authenticateJWT, validateUserId, userController.getUserProfile);

// Route to update user profile (PUT /api/users/:id) with authentication and user ID validation middleware
router.put('/:id', authenticateJWT, validateUserId, userController.updateUserProfile);

// Route to delete a user (DELETE /api/users/:id) with authentication and user ID validation middleware
router.delete('/:id', authenticateJWT, validateUserId, userController.deleteUser);

// Export the router to use it in index.js or app.js
module.exports = router;