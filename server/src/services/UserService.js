const User = require('../models/User');
const UserRepository = require('../repository/UserRepository');

class UserService {
    constructor() {
        this.userRepository = new UserRepository();
    }

    // Register a new user with additional fields
    async register(email, password, name, role) {
        const existingUser = await this.userRepository.findByEmail(email);
        if (existingUser) {
            throw new Error('User already exists');
        }
        const newUser = await User.register(email, password, name, role);
        await this.userRepository.save(newUser);
        return newUser;
    }

    // Login a user by email and password
    async login(email, password) {
        const userRecord = await this.userRepository.findByEmail(email);
        if (!userRecord) {
            throw new Error('User not found');
        }
        const user = new User(
            userRecord.id,
            userRecord.email,
            userRecord.password,
            userRecord.name,
            userRecord.role,
            userRecord.createdAt
        );

        const isAuthenticated = await user.authenticate(password);

        if (!isAuthenticated) {
            throw new Error('Invalid password');
        }
        return user;
    }

    // Find user by Google ID or create a new one
    async findOrCreateByGoogleId(googleId, email, name) {
        return await this.userRepository.findOrCreateByGoogleId(googleId, email, name);
    }

    // Find a user by their ID
    async findById(userId) {
        return await this.userRepository.findById(userId);
    }

    // Retrieve all users from the database
async getAllUsers() {
    return await this.userRepository.getAllUsers();
}
}

module.exports = UserService;
