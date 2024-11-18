const User = require('../models/User');
const db = require('../config/db'); // Import the promise-based db connection
const Joi = require('joi'); // Import Joi for input validation

class UserRepository {
    // Find a user by email
    async findByEmail(email) {
        try {
            const emailSchema = Joi.string().email().required();
            const { error } = emailSchema.validate(email);
            if (error) {
                throw new Error("Invalid email format");
            }
            const [rows] = await db.query("SELECT id, username, email, password, role, created_at FROM users WHERE email = ?", [email]);
            return rows.length > 0 ? new User(rows[0].id, rows[0].username, rows[0].email, rows[0].password, rows[0].role, rows[0].created_at) : null;
        } catch (error) {
            throw error;
        }
    }

    // Find a user by username
    async findByUsername(username) {
        try {
            const [rows] = await db.query("SELECT id, username, email, password, role, created_at FROM users WHERE username = ?", [username]);
            return rows.length > 0 ? new User(rows[0].id, rows[0].username, rows[0].email, rows[0].password, rows[0].role, rows[0].created_at) : null;
        } catch (error) {
            throw error;
        }
    }

    // Find a user by Google ID
    async findByGoogleId(googleId) {
        try {
            const [rows] = await db.query("SELECT id, username, email, password, role, created_at FROM users WHERE google_id = ?", [googleId]);
            return rows.length > 0 ? new User(rows[0].id, rows[0].username, rows[0].email, rows[0].password, rows[0].role, rows[0].created_at) : null;
        } catch (error) {
            console.error("Error finding user by Google ID:", error); // debug code
            throw error;
        }
    }

    // Add the findByUsernameOrEmail method to handle login via either username or email
    async findByUsernameOrEmail(identifier) {
        try {
            const [rows] = await db.query(
                "SELECT id, username, email, password, role, created_at FROM users WHERE username = ? OR email = ?",
                [identifier, identifier]
            );
            return rows.length > 0 ? new User(rows[0].id, rows[0].username, rows[0].email, rows[0].password, rows[0].role, rows[0].created_at) : null;
        } catch (error) {
            console.error("Error finding user by username or email:", error); // debug code
            throw error;
        }
    }

    // Find or create a user by Google ID, and update or insert tokens
    async findOrCreateByGoogleId(googleId, email, name, accessToken, refreshToken) {
        try {
            let user = await this.findByGoogleId(googleId);
            if (user) {
                // Update the tokens if the user already exists
                await db.query(
                    "UPDATE users SET access_token = ?, refresh_token = ? WHERE google_id = ?", 
                    [accessToken, refreshToken, googleId]
                );
                user.accessToken = accessToken;
                user.refreshToken = refreshToken;
                return user;
            }

            // Generate a default username from email if username is not provided
            const username = email.split('@')[0];

            // Insert a new user with Google ID and tokens, set password and username
            const [result] = await db.query(
                "INSERT INTO users (google_id, username, email, access_token, refresh_token, password) VALUES (?, ?, ?, ?, ?, NULL)", 
                [googleId, username, email, accessToken, refreshToken]
            );
            return new User(result.insertId, username, email, null, null, new Date());
        } catch (error) {
            throw error;
        }
    }

    // Save a new user
    async save(user) {
        try {
            const [result] = await db.query(
                "INSERT INTO users (google_id, username, email, password, role, created_at) VALUES (?, ?, ?, ?, ?, ?)", 
                [user.google_id, user.username, user.email, user.password, user.role, user.created_at]
            );
            return result.insertId;
        } catch (error) {
            console.error("Error saving user:", error);
            throw error;
        }
    }

    // Find a user by ID
    async findById(id) {
        try {
            if (typeof id !== 'number') {
                id = parseInt(id, 10);
            }
            const [rows] = await db.query("SELECT id, username, email, password, role, created_at FROM users WHERE id = ?", [id]);
            return rows.length > 0 ? new User(rows[0].id, rows[0].username, rows[0].email, rows[0].password, rows[0].role, rows[0].created_at) : null;
        } catch (error) {
            throw error;
        }
    }

    // Retrieve all users from the database
    async getAllUsers() {
        try {
            const [rows] = await db.query("SELECT id, username, email, password, role, created_at FROM users");
            return rows;
        } catch (error) {
            throw error;
        }
    }

    // Save usercode to the user's record
    async saveUserCode(email, usercode) {
        const emailSchema = Joi.string().email().required();
        const { error } = emailSchema.validate(email);
        if (error) {
            throw new Error("Invalid email format");
        }
        const expiryTime = new Date(Date.now() + 15 * 60 * 1000); // Set expiry to 15 minutes from now
        try {
            const [result] = await db.query(
                "UPDATE users SET reset_code = ?, reset_code_expiry = ? WHERE email = ?",
                [usercode, expiryTime, email]
            );
            if (result.affectedRows === 0) {
                throw new Error('User not found or no changes made');
            }
            return result;
        } catch (error) {
            throw error;
        }
    }

    // Retrieve user by email and usercode to verify
    async findByEmailAndCode(email, usercode) {
        const emailSchema = Joi.string().email().required();
        const { error } = emailSchema.validate(email);
        if (error) {
            throw new Error("Invalid email format");
        }
        try {
            const [rows] = await db.query(
                "SELECT id, username, email, password, role, created_at FROM users WHERE email = ? AND reset_code = ? AND reset_code_expiry > ?",
                [email, usercode, new Date()]
            );
            return rows.length > 0 ? new User(rows[0].id, rows[0].username, rows[0].email, rows[0].password, rows[0].role, rows[0].created_at) : null;
        } catch (error) {
            throw error;
        }
    }

    // Update user password
    async updateUserPassword(userId, hashedPassword) {
        try {
            if (typeof userId !== 'number') {
                userId = parseInt(userId, 10);
            }
            console.log('Executing SQL query to update password for userId:', userId);
            const [result] = await db.query(
                "UPDATE users SET password = ? WHERE id = ?", 
                [hashedPassword, userId]
            );
            console.log('Password Update Result:', result);
            if (result.affectedRows === 0) {
                throw new Error('User not found or no changes made');
            }
        } catch (error) {
            console.error('Error updating user password:', error);
            throw error;
        }
    }
}

module.exports = UserRepository;
