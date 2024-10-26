const User = require('../models/User.js'); // Assuming User is a Sequelize model
const Database = require('../config/database.js'); // Import the Database class to establish connection

class UserRepository {
    constructor() {
        this.sequelize = Database.connectMySQL(); // Initialize the connection
    }

    // Find a user by email
    async findByEmail(email) {
        return await User.findOne({ where: { email } });
    }

    // Find a user by ID
    async findById(id) {
        return await User.findByPk(id);
    }

    // Save a new user to the database
    async save(user) {
        return await User.create(user);
    }

    // Update an existing user in the database
    async updateUser(id, user) {
        return await User.update(user, { where: { id } });
    }

    // Delete a user from the database
    async deleteUser(id) {
        return await User.destroy({ where: { id } });
    }

    // Instance method to authenticate user with plain password
    async authenticateUser(email, plainPassword) {
        const user = await this.findByEmail(email);
        if (!user) {
            throw new Error('User not found');
        }
        
        const isPasswordValid = await compare(plainPassword, user.password);
        if (!isPasswordValid) {
            throw new Error('Invalid password');
        }

        return user;
    }
}

module.exports = UserRepository;