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
            const [rows] = await db.query("SELECT * FROM users WHERE google_id = ?", [googleId]); // Update to google_id
            return rows.length > 0 ? new User(rows[0].id, rows[0].email, null, rows[0].name, rows[0].role, rows[0].created_at) : null;
        } catch (error) {
            throw error;
        }
    }

    // Find or create a user by Google ID
    async findOrCreateByGoogleId(googleId, email, name) {
        try {
            let user = await this.findByGoogleId(googleId);
            if (user) {
                return user;
            }

            const [result] = await db.query(
                "INSERT INTO users (google_id, email, name) VALUES (?, ?, ?)", // Update to google_id
                [googleId, email, name]
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
                "INSERT INTO users (google_id, email, name, role, created_at) VALUES (?, ?, ?, ?, ?)", // Update to google_id
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
