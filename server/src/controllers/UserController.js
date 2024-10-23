const UserService = require('../services/UserService');
const userService = new UserService();

// Route handler for user registration
const registerUser = async (req, res) => {
    const { username, email, password, role } = req.body;
    console.log('Received registration request:', req.body);
    
    if (!username || !email || !password) {
        return res.status(400).json({ error: "Username, email, and password are required." });
    }
    
    try {
        // Ensure both username and email are unique
        const existingUser = await userService.findByUsernameOrEmail(username, email);
        if (existingUser) {
            return res.status(409).json({ error: 'Username or email already exists' }); // Send specific error
        }

        // Register the new user
        const newUser = await userService.register(username, email, password, role);
        res.status(201).json({ message: 'User registered successfully', newUser });
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
};


// Route handler for user login
const loginUser = async (req, res) => {
    const { identifier, password } = req.body;  // 'identifier' can be email or username
    try {
        const user = await userService.login(identifier, password);  // Let UserService handle identifier checks
        res.status(200).json({ message: 'Login successful', user });
    } catch (error) {
        res.status(401).json({ error: error.message });
    }
};

// Route handler for getting user profile by ID
const getUserProfile = async (req, res) => {
    const userId = req.params.id;
    try {
        const user = await userService.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Route handler for updating user profile (the missing function)
const updateUserProfile = async (req, res) => {
    const userId = req.params.id;
    const { username, email, name, role } = req.body; // Get the updated fields
    try {
        const updatedUser = await userService.updateUserProfile(userId, { username, email, name, role });
        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ message: 'User profile updated successfully', updatedUser });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Route handler for deleting a user
const deleteUser = async (req, res) => {
    const userId = req.params.id;
    try {
        await userService.deleteUser(userId); // Assume this is implemented in UserService
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
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

module.exports = {
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile,  // Ensure this function is correctly exported
    deleteUser,
    getAllUsers
};
