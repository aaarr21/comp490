const { compare } = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');  // Use the Sequelize instance from database.js

class User extends Model {

    // Static utility method to validate email format
    static validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
}

// Initialize the User model using the Sequelize instance
User.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,  // Correct UUID generation
            primaryKey: true,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true,  // Email format validation
            },
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    },
    {
        sequelize,           // Use the Sequelize instance from database.js
        modelName: 'User',    // Define the model name
        tableName: 'users',   // Define the table name
        timestamps: true,     // Enable timestamps (createdAt, updatedAt)
    }
);

module.exports = User;
