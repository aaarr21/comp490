const UserRepository = require('../repository/UserRepository.js'); // Import UserRepository
const { hash } = require('bcrypt'); // Import hash function from bcrypt

class UserService {
    constructor() {
        this.userRepository = new UserRepository();
    }

    // Centralizing logic for excluding sensitive fields
    excludeSensitiveFields(user) {
        const { password: _, ...userData } = user.dataValues;
        return userData;
    }

    // Register a new user with additional fields
    async register(email, password, name, role) {
        // Check if the user already exists
        const existingUser = await this.userRepository.findByEmail(email);
        if (existingUser) {
            throw new Error('User already exists');
        }

        // Hash the password explicitly in the service layer
        const hashedPassword = await hash(password, 10);

        // Create a new user object and save it to the database
        const newUser = await this.userRepository.save({
            email,
            password: hashedPassword,
            name,
            role,
        });

        // Save the new user in the database
        const savedUser = await this.userRepository.save(newUser);

        return this.excludeSensitiveFields(savedUser);
    }

    // Get a user by ID
    async getById(id) {
        const user = await this.userRepository.findById(id);
        if (!user) {
            throw new Error('User not found');
        }

        return this.excludeSensitiveFields(user);
    }

    // Update a user by ID
    async updateById(id, update) {
        const user = await this.userRepository.findById(id);
        if (!user) {
            throw new Error('User not found');
        }

        // Update the user object with new data
        const updatedUser = await this.userRepository.update(user, update);

        return this.excludeSensitiveFields(updatedUser);
    }

    // Delete a user by ID
    async deleteById(id) {
        const user = await this.userRepository.findById(id);
        if (!user) {
            throw new Error('User not found');
        }

        await this.userRepository.delete(user);

        return this.excludeSensitiveFields(user);
    }

    // Authenticate a user by email and password
    async authenticate(email, password) {
        const user = await this.userRepository.findByEmail(email);
        if (!user) {
            throw new Error('User not found');
        }

        const passwordMatch = await user.authenticate(password);
        if (!passwordMatch) {
            throw new Error('Invalid password');
        }

        return this.excludeSensitiveFields(user);
    }

    // get user by email
    async getByEmail(email) {
        const user = await this.userRepository.findByEmail(email);
        if (!user) {
            throw new Error('User not found');
        }

        return this.excludeSensitiveFields(user);
    }
}

module.exports = UserService;