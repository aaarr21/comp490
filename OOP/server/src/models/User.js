import { hash, compare } from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { DataTypes, Model } from 'sequelize'; // Import Sequelize dependencies
import sequelize from '../config/database'; // Assuming you have a Sequelize instance

class User extends Model {
    // Instance method to authenticate user with plain password
    async authenticate(plainPassword) {
        return await compare(plainPassword, this.password); // Compare the password using bcrypt
    }

    // Static utility method to validate email format (for manual validation)
    static validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email); // Return true if the email is valid
    }
}

// Define the User schema using Sequelize
User.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: uuidv4, // Generate UUID if not provided
        primaryKey: true,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true, // Email format validation
        },
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    role: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
}, {
    sequelize, // Pass the Sequelize instance
    modelName: 'User', // Name of the model
    hooks: {
        beforeCreate: async (user) => {
            if (user.password) {
                user.password = await hash(user.password, 10); // Hash the password before saving
            }
        },
        beforeUpdate: async (user) => {
            if (user.password && user.changed('password')) {
                user.password = await hash(user.password, 10); // Hash the password if it is updated
            }
        },
    },
});

export default User;
