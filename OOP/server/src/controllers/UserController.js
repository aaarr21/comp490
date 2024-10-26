const { Router } = require('express');
const UserService = require('./UserService'); // Import the UserService class
const router = Router(); // Create an instance of Express Router

// Initialize the UserService
const userService = new UserService();

// Route for user registration with additional attributes
router.post('/register', async (req, res) => {
    const { email, password, name, role } = req.body;

    try {
        const newUser = await userService.registerUser(email, password, name, role); // Call registerUser method from UserService
        res.status(201).json({ message: 'User registered successfully', user: newUser });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(400).json({ error: error.message });
    }
});

// Route for user login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await userService.loginUser(email, password); // Call loginUser method from UserService
        
        res.status(200).json({ message: 'Login successful', user });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(401).json({ error: error.message });
    }
});

// Route for getting user profile
router.get('/:id', async (req, res) => {
    // Implementation continues...
});

module.exports = router;