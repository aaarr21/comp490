const bcrypt = require('bcrypt');
const User = require('../models/User');
const UserRepository = require('../repository/UserRepository');

class UserService {
    constructor() {
        this.userRepository = new UserRepository();
    }

    // Register a new user with additional fields
    async register(username, email, password, role) {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User(null, username, email, hashedPassword, role);
        await this.userRepository.save(newUser);
        return newUser;
    }

// Login a user by email or username and password
async login(identifier, password) {
    try {
        // Retrieve the user by identifier (username or email)
        const userRecord = await this.userRepository.findByUsernameOrEmail(identifier, identifier);
        
        if (!userRecord) {
            throw new Error('User not found');
        }
        
        // Check if password from userRecord is not undefined or null
        if (!userRecord.password) {
            throw new Error('Password is missing for the user record');
        }

        // Log the values for debugging
        console.log('Plaintext password:', password);
        console.log('Hashed password from DB:', userRecord.password);

        // Verify the password using bcrypt
        const isAuthenticated = await bcrypt.compare(password, userRecord.password);
        if (!isAuthenticated) {
            throw new Error('Invalid password');
        }

        // Return the user object if the password is correct
        return new User(
            userRecord.id,
            userRecord.username,
            userRecord.email,
            userRecord.password,
            userRecord.name,
            userRecord.role,
            userRecord.createdAt
        );
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
}

    // Find a user by username or email
    async findByUsernameOrEmail(username, email) {
        return await this.userRepository.findByUsernameOrEmail(username, email);
    }

    // Find user by Google ID or create a new one with tokens
    async findOrCreateByGoogleId(googleId, email, name, accessToken, refreshToken) {
        return await this.userRepository.findOrCreateByGoogleId(googleId, email, name, accessToken, refreshToken);
    }



    // Find a user by their ID
    async findById(userId) {
        return await this.userRepository.findById(userId);
    }

    // Retrieve all users from the database
    async getAllUsers() {
        return await this.userRepository.getAllUsers();
    }
    // Method to update user profile
    async updateUserProfile(userId, updatedData) {
        return await this.userRepository.updateUserProfile(userId, updatedData);
    }

     // Save the usercode for password reset
     async saveUserCode(email, usercode) {
        return await this.userRepository.saveUserCode(email, usercode);
    }

    // Verify the usercode for password reset
    async verifyUserCode(email, usercode) {
        const user = await this.userRepository.findByEmailAndCode(email, usercode.toString());
        if (!user) {
            console.error('Invalid or expired code for user:', email);
            throw new Error('Invalid or expired code');
        }
        return user;
    }

    async updateUserPassword(userId, newPassword) {
        console.log('Attempting to update password for userId:', userId); //debug code
        return await this.userRepository.updateUserPassword(userId, newPassword);
      }
}

module.exports = UserService;