const UserService = require('../services/UserService');
const userService = new UserService();

// Route handler for user registration
const registerUser = async (req, res) => {
    const { email, password, name, role } = req.body;
    try {
        const newUser = await userService.register(email, password, name, role);
        res.status(201).json({ message: 'User registered successfully', newUser });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Route handler for user login
const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await userService.login(email, password);
        res.status(200).json({ message: 'Login successful', user });
    } catch (error) {
        res.status(401).json({ error: error.message });
    }
};

// Route handler for getting user profile
const getUserProfile = async (req, res) => {
    // Implement getting user profile logic here
    res.status(200).json({ message: 'User profile retrieved successfully' });
};

// Route handler for updating user profile
const updateUserProfile = async (req, res) => {
    // Implement updating user profile logic here
    res.status(200).json({ message: 'User profile updated successfully' });
};


// Route handler for deleting a user
const deleteUser = async (req, res) => {
    // Implement deleting user logic here
    res.status(200).json({ message: 'User deleted successfully' });
};

// Route handler to get a list of all users
const getAllUsers = async (req, res) => {
    try {
        const users = await userService.getAllUsers();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


// Other potential handlers can go here, like getting, updating, or deleting a user

module.exports = {
    registerUser,
    loginUser,
	getUserProfile,
	updateUserProfile,
	deleteUser,
    getAllUsers, 
};
