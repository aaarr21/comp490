const UserService = require('../services/UserService');
const userService = new UserService();
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const Joi = require('joi');
const Task = require('../models/Task');
const multer = require('multer');



// Route handler for user registration
const registerUser = async (req, res) => {
    const { username, email, password, role } = req.body;
    console.log('Received registration request:', req.body); //debug code
    
    if (!username || !email || !password) {
        return res.status(400).json({ error: "Username, email, and password are required." });
    }
    
    try {
        const existingUser = await userService.findByUsernameOrEmail(username, email);
        if (existingUser) {
            return res.status(409).json({ error: 'Username or email already exists' });
        }

        const newUser = await userService.register(username, email, password, role);
        res.status(201).json({ message: 'User registered successfully', newUser });
	} catch (error) {
        console.error('Error during registration:', error);
        res.status(500).json({ error: 'Registration failed' });
	}
};



// Route handler for user login
const loginUser = async (req, res) => {
    const { identifier, password } = req.body;
    try {
        const user = await userService.login(identifier, password);
        req.login(user, (err) => {
            if (err) {
                return res.status(500).json({ error: 'Login failed' });
            }

            req.session.save((saveErr) => {
                if (saveErr) {
                    return res.status(500).json({ error: 'Session not saved' });
                }
                res.status(200).json({ message: 'Login successful', user });
            });
        });
    } catch (error) {
        res.status(401).json({ error: error.message });
	}
};

// Route handler for getting user profile by ID
const getUserProfile = async (req, res) => {
   // const userId = req.session.passport.user;
      if(!req.session.passport){
        return res.status(401).json({error: 'Non-authenticated user.'});
      }
      // const userId = req.session.passport.user;
    try {
        const user = await userService.findById(userId);
        const username = user.username;
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ username });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateUserName = async (req, res) => {
    // const userId = req.session.passport.user;
      const {userId, nextUser} = req.body;
      console.log(userId + "  " + nextUser);
      try{
        const updatedUser = await userService.updateUserName(userId, nextUser);
      }catch(error) {
        res.status(500).json({error:  error.message});
      }
      res.status(200).json({ success: true, message: 'Reset code sent successfully.' });
 };
 

// Route handler for updating user profile
const updateUserProfile = async (req, res) => {
    const paramsId = req.params.id;
    userId = paramsId.slice(1);
    console.log(userId);
    const {username, email, role } = req.body;
    
    try {
        const updatedUser = await userService.updateUserProfile(userId, { username, email, role });
        console.log(updatedUser);
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
        await userService.deleteUser(userId);
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
        res.status(404).json({ error: error.message });
    }
};

// Route handler for generating and sending password reset code
const sendResetCode = async (req, res) => {
    const { userEmail } = req.body;

    try {
        // Check if the user exists
        const user = await userService.findByEmail(userEmail);
        if (!user) {
            return res.status(404).json({ success: false, message: 'Email not registered.' });
        }

        // Rate limiting: Check if code was sent recently
        const lastSent = user.reset_code_last_sent;
        if (lastSent && new Date() - new Date(lastSent) < 60 * 1000) {
            return res.status(429).json({ success: false, message: 'Please wait at least 1 minute before requesting another reset code.' });
        }

        // Generate a secure reset code
        const usercode = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit numeric code
        const expiryTime = new Date(Date.now() + 15 * 60 * 1000); // 15-minute expiry

        // Save reset code and expiry in the database
        await userService.saveUserCode(userEmail, usercode, expiryTime);

        // Update the timestamp of the last sent code
        await userService.updateResetCodeLastSent(userEmail);

        // Send the reset code via email
        const transporter = nodemailer.createTransport({
            service: "Gmail",
            auth: {
                user: process.env.EMAIL,
                pass: process.env.EMAIL_PASSKEY,
            },
        });

        const mailOptions = {
            from: process.env.EMAIL,
            to: userEmail,
            subject: 'Password Reset Code',
            text: `Your password reset code is: ${usercode}`,
        };

        try {
            await transporter.sendMail(mailOptions);
            console.log('Email sent successfully.'); //debug code
            res.status(200).json({ success: true, message: 'Reset code sent successfully.' });
        } catch (emailError) {
            console.error('Error sending email:', emailError);
            res.status(500).json({ success: false, message: 'Failed to send reset code email.' });
        }

    } catch (error) {
        console.error('Error sending reset code:', error);
        res.status(500).json({ success: false, message: 'Failed to send reset code.' });
    }
};

// Route handler for verifying the reset code
const verifyResetCode = async (req, res) => {
    // Validation schema for user input
    const schema = Joi.object({
        userEmail: Joi.string().email().required(),
        usercode: Joi.string().length(6).required()
    });

    // Ensure usercode is a string
    req.body.usercode = String(req.body.usercode);

    // Validate the request body
    const { error } = schema.validate(req.body);
    if (error) {
        console.error(`[verifyResetCode]: Validation error - ${error.details[0].message}`);
        return res.status(400).json({ success: false, message: error.details[0].message });
    }

    const { userEmail, usercode } = req.body;

    try {
        console.log(`[verifyResetCode]: Attempting to verify code for ${userEmail}`); //debug code
        const user = await userService.verifyUserCode(userEmail, usercode);
        console.log(`[verifyResetCode]: Code verified successfully for ${userEmail}`); //debug code
        res.status(200).json({ success: true, message: 'Code verified successfully.', userId: user.id });
    } catch (error) {
        console.error(`[verifyResetCode]: Error - ${error.message}`); //debug MSG
        res.status(400).json({ success: false, message: error.message });
    }
};

// Route handler for resetting the password
const resetPassword = async (req, res) => {
    let { userId, newPassword } = req.body;

    try {
        userId = parseInt(userId, 10);
        if (isNaN(userId)) {
            throw new Error('Invalid userId provided');
        }

        await userService.updateUserPassword(userId, newPassword);

        res.status(200).json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
        console.error('Error during password reset:', error); //debug MSG
        res.status(500).json({ success: false, message: 'Failed to update password' });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getUserProfile,
    updateUserName,
    updateUserProfile,
    deleteUser,
    getAllUsers,
    sendResetCode,
    verifyResetCode,
    resetPassword,
    
};
