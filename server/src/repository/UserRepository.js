const User = require('../models/User');
const db = require('../config/db'); // Import the promise-based db connection

class UserRepository {
    // Find a user by email
    async findByEmail(email) {
        try {
            const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
            return rows.length > 0 ? new User(rows[0].id, rows[0].username, rows[0].email, rows[0].password, rows[0].name, rows[0].role, rows[0].created_at) : null;
        } catch (error) {
            throw error;
        }
    }

    // Find a user by username
    async findByUsername(username) {
        try {
            const [rows] = await db.query("SELECT * FROM users WHERE username = ?", [username]);
            return rows.length > 0 ? new User(rows[0].id, rows[0].username, rows[0].email, rows[0].password, rows[0].name, rows[0].role, rows[0].created_at) : null;
        } catch (error) {
            throw error;
        }
    }

    // Find a user by Google ID
    async findByGoogleId(googleId) {
        try {
            const [rows] = await db.query("SELECT * FROM users WHERE google_id = ?", [googleId]);
            return rows.length > 0 ? new User(rows[0].id, rows[0].username, rows[0].email, rows[0].password, rows[0].name, rows[0].role, rows[0].created_at) : null;
        } catch (error) {
            console.error("Error finding user by Google ID:", error); // debug code
            throw error;
        }
    }

    // Add the findByUsernameOrEmail method to handle login via either username or email
    async findByUsernameOrEmail(identifier) {
        try {
            const [rows] = await db.query(
                "SELECT * FROM users WHERE username = ? OR email = ?",
                [identifier, identifier]
            );
            return rows.length > 0 ? new User(rows[0].id, rows[0].username, rows[0].email, rows[0].password, rows[0].name, rows[0].role, rows[0].created_at) : null;
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
            "INSERT INTO users (google_id, username, email, access_token, refresh_token, password) VALUES (?, ?, ?, ?, ?, ?, NULL)", 
            [googleId, username, email, name, accessToken, refreshToken]
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
            const [rows] = await db.query("SELECT * FROM users WHERE id = ?", [id]);
            return rows.length > 0 ? new User(rows[0].id, rows[0].username, rows[0].email, null, rows[0].name, rows[0].role, rows[0].created_at) : null;
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
