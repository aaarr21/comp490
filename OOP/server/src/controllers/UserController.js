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
        res.status(201).json({ message: 'User registered successfully', user });
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
	const { id } = req.params;

	try {
		const user = await userService.getUserProfile(id); // Call getUserProfile method from UserService
		res.status(200).json(user);
	} catch (error) {
		console.error('Error getting user profile:', error);
		res.status(404).json({ error: error.message });
	}
});

// Route for updating user profile
router.put('/:id', async (req, res) => {
	const { id } = req.params;
	const { email, name, role } = req.body;

	try {
		const updatedUser = await userService.updateUserProfile(id, email, name, role); // Call updateUserProfile method from UserService
		res.status(200).json({ message: 'User profile updated successfully', user });
	}
	catch (error) {
		console.error('Error updating user profile:', error);
		res.status(400).json({ error: error.message });
	}
});

// Route for deleting a user
router.delete('/:id', async (req, res) => {
	const { id } = req.params;

	try {
		await userService.deleteUser(id); // Call deleteUser method from UserService
		res.status(204).end();
	}
	catch (error) {
		console.error('Error deleting user:', error);
		res.status(400).json({ error: error.message });
	}
});

export default router;
