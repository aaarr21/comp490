// UserRepository.js
const User = require('../models/User');
const db = require('../config/db'); // Import the promise-based db connection

class UserRepository {
    // Find a user by email
    async findByEmail(email) {
        try {
            const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
            return rows.length > 0 ? new User(rows[0].id, rows[0].email, rows[0].password, rows[0].name, rows[0].role, rows[0].created_at) : null;
        } catch (error) {
            throw error;
        }
    }

    // Find a user by Google ID
    async findByGoogleId(googleId) {
        try {
            const [rows] = await db.query("SELECT * FROM users WHERE google_id = ?", [googleId]);
            return rows.length > 0 ? new User(rows[0].id, rows[0].email, null, rows[0].name, rows[0].role, rows[0].created_at) : null;
        } catch (error) {
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

            // Insert a new user with Google ID and tokens
            const [result] = await db.query(
                "INSERT INTO users (google_id, email, name, access_token, refresh_token) VALUES (?, ?, ?, ?, ?)", 
                [googleId, email, name, accessToken, refreshToken]
            );
            return new User(result.insertId, email, null, name, null, new Date());
        } catch (error) {
            throw error;
        }
    }

    // Save a new user
    async save(user) {
        try {
            const [result] = await db.query(
                "INSERT INTO users (google_id, email, name, role, created_at) VALUES (?, ?, ?, ?, ?)", 
                [user.google_id, user.email, user.name, user.role, user.created_at]
            );
            return result.insertId;
        } catch (error) {
            throw error;
        }
    }

    // Find a user by ID
    async findById(id) {
        try {
            const [rows] = await db.query("SELECT * FROM users WHERE id = ?", [id]);
            return rows.length > 0 ? new User(rows[0].id, rows[0].email, null, rows[0].name, rows[0].role, rows[0].created_at) : null;
        } catch (error) {
            throw error;
        }
    }

    // Retrieve all users from the database
    async getAllUsers() {
        try {
            const [rows] = await db.query("SELECT * FROM users");
            return rows;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = UserRepository;
