import { Router } from 'express';
import UserService from './UserService'; // Import the UserService class
const router = Router(); // Create an instance of Express Router

// Initialize the UserService
const userService = new UserService();

// Route for user registration with additional attributes
router.post('/register', async (req, res) => {
    const { email, password, name, role } = req.body;

    try {
        const newUser = await userService.registerUser(email, password, name, role); // Call registerUser method from UserService
        // Exclude sensitive fields like the password from the response
        const { password, ...userData } = newUser.dataValues; 
        res.status(201).json({ message: 'User registered successfully', user: userData });
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
        // Exclude sensitive fields like the password from the response
        const { password, ...userData } = user.dataValues; 
        res.status(200).json({ message: 'Login successful', user: userData });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(401).json({ error: error.message });
    }
});

export default router;
