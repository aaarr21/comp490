const UserService = require('../services/UserService');
const userService = new UserService();
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');

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

// Route handler for generating and sending password reset code
const sendResetCode = async (req, res) => {
    const { userEmail } = req.body;
  
    try {
      // Generate a 6-digit numeric usercode
      const usercode = Math.floor(100000 + Math.random() * 900000).toString();
  
      // Store the usercode in the database with an expiration time
      await userService.saveUserCode(userEmail, usercode);
  
      // Send the reset code via email
      const transporter = nodemailer.createTransport({
        service: "Gmail",
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
          user: process.env.EMAIL,
          pass: process.env.EMAIL_PASSKEY
        }
      });
  
      const mailOptions = {
        from: process.env.EMAIL,
        to: userEmail,
        subject: 'Password Reset',
        text: `Your password reset code is: ${usercode}`
      };
  
      await transporter.sendMail(mailOptions);
      res.status(200).json({ success: true, message: 'Reset code sent successfully' });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ success: false, message: 'Failed to send reset code' });
    }
  };
  
  // Route handler for verifying the reset code
  const verifyResetCode = async (req, res) => {
    const { userEmail, usercode } = req.body;
  
    try {
      const user = await userService.verifyUserCode(userEmail, usercode);
      res.status(200).json({ success: true, message: 'Code verified successfully', userId: user.id });
    } catch (error) {
      console.error('Error:', error);
      res.status(400).json({ success: false, message: error.message });
    }
  };

  const resetPassword = async (req, res) => {
    let { userId, newPassword } = req.body;
  
    try {
      // Convert userId to integer
      userId = parseInt(userId, 10);
      if (isNaN(userId)) {
        throw new Error('Invalid userId provided');
      }
  
      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
  
      // Update the password in the database
      await userService.updateUserPassword(userId, hashedPassword);
      
      res.status(200).json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
      console.error('Error during password reset:', error);//debug code
      res.status(500).json({ success: false, message: 'Failed to update password' });
    }
  };




  
  module.exports = {
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile,
    deleteUser,
    getAllUsers,
    sendResetCode,
    verifyResetCode,
    resetPassword
  };