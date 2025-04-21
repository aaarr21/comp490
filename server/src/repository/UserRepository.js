const User = require("../models/User");
const db = require("../config/db"); // Import the promise-based db connection

class UserRepository {
  // Generic fetch method to avoid repetition
  async fetchUserByField(field, value) {
    try {
      const allowedFields = ["id", "username", "email", "google_id"];
      if (!allowedFields.includes(field)) {
        throw new Error(
          `[fetchUserByField]: Invalid field for user lookup: ${field}`
        );
      }

      const [rows] = await db.query(
        `SELECT id, username, email, role, created_at FROM users WHERE ${field} = ?`,
        [value]
      );

      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error(
        `[fetchUserByField]: Error fetching user by ${field}:`,
        error
      );
      throw error;
    }
  }

  // Find a user by ID
  async findById(id) {
    try {
      if (typeof id !== "number") {
        id = parseInt(id, 10);
      }
      if (isNaN(id)) {
        throw new Error("[findById]: Invalid ID provided");
      }
      return await this.fetchUserByField("id", id);
    } catch (error) {
      console.error("[findById]: Error finding user by ID:", error);
      throw error;
    }
  }

  // Find a user by email
  async findByEmail(email) {
    try {
      return await this.fetchUserByField("email", email);
    } catch (error) {
      console.error("[findByEmail]: Error finding user by email:", error);
      throw error;
    }
  }

  // Find a user by username
  async findByUsername(username) {
    try {
      return await this.fetchUserByField("username", username);
    } catch (error) {
      console.error("[findByUsername]: Error finding user by username:", error);
      throw error;
    }
  }

  // Find a user by Google ID
  async findByGoogleId(googleId) {
    try {
      return await this.fetchUserByField("google_id", googleId);
    } catch (error) {
      console.error(
        "[findByGoogleId]: Error finding user by Google ID:",
        error
      );
      throw error;
    }
  }

  // Find a user by either username or email
  async findByUsernameOrEmail(identifier) {
    try {
      const [rows] = await db.query(
        "SELECT id, username, email, password, role, created_at FROM users WHERE username = ? OR email = ?",
        [identifier, identifier]
      );
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error(
        "[findByUsernameOrEmail]: Error finding user by username or email:",
        error
      );
      throw error;
    }
  }

  // Find or create a user by Google ID (removed access/refresh token)
  async findOrCreateByGoogleId(googleId, email, name) {
    try {
      let user = await this.findByGoogleId(googleId);
      if (user) {
        // User already exists, simply return them
        return user;
      }

      // Generate a default username from email if username is not provided
      const username = email.split("@")[0];

      // Insert a new user with Google ID
      const [result] = await db.query(
        "INSERT INTO users (google_id, username, email, password) VALUES (?, ?, ?, NULL)",
        [googleId, username, email]
      );
      return new User(result.insertId, username, email, null, null, new Date());
    } catch (error) {
      console.error(
        "[findOrCreateByGoogleId]: Error finding or creating user by Google ID:",
        error
      );
      throw error;
    }
  }

  // Save a new user
  async save(user) {
    try {
      const [result] = await db.query(
        "INSERT INTO users (google_id, username, email, password, role, created_at) VALUES (?, ?, ?, ?, ?, ?)",
        [
          user.google_id,
          user.username,
          user.email,
          user.password,
          user.role,
          user.created_at,
        ]
      );
      return result.insertId;
    } catch (error) {
      if (error.code === "ER_DUP_ENTRY") {
        throw new Error(
          "[save]: User with this email or username already exists"
        );
      }
      console.error("[save]: Error saving user:", error);
      throw error;
    }
  }

  // Retrieve all users with optional pagination
  async getAllUsers(limit = 10, offset = 0) {
    try {
      // Use the provided limit to get more users when needed
      const [rows] = await db.query(
        "SELECT id, username, email, role, created_at FROM users LIMIT ? OFFSET ?",
        [limit, offset]
      );
      return rows;
    } catch (error) {
      console.error("[getAllUsers]: Error fetching users:", error);
      throw error;
    }
  }

  // Update user fields - allows partial updates
  async updateUserFields(userId, updatedFields) {
    try {
      if (typeof userId !== "number") {
        userId = parseInt(userId, 10);
      }
      if (isNaN(userId)) {
        throw new Error("[updateUserFields]: Invalid user ID provided");
      }

      const fields = Object.keys(updatedFields);
      const values = Object.values(updatedFields);

      // Construct the SQL update statement dynamically
      const setString = fields.map((field) => `${field} = ?`).join(", ");

      const query = `UPDATE users SET ${setString} WHERE id = ?`;
      values.push(userId);

      console.log(
        `[updateUserFields]: Executing query: ${query} with values: ${values}`
      ); // debug code

      const [result] = await db.query(query, values);
      if (result.affectedRows === 0) {
        throw new Error(
          "[updateUserFields]: User not found or no changes made"
        );
      }

      return result;
    } catch (error) {
      console.error("[updateUserFields]: Error updating user fields:", error);
      throw error;
    }
  }

  // Save reset code to the user's record
  async saveUserCode(email, usercode, expiryTime) {
    const query = `
            UPDATE users
            SET reset_code = ?, reset_code_expiry = ?
            WHERE email = ?
        `;
    const expiryTimeString = expiryTime
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");
    console.log(
      "[saveUserCode]: Saving reset code:",
      usercode,
      "with expiry:",
      expiryTimeString
    ); // debug code
    const [result] = await db.query(query, [usercode, expiryTimeString, email]);
    if (result.affectedRows === 0) {
      throw new Error("[saveUserCode]: User not found or no changes made");
    }
    return result;
  }

  // Retrieve user by email and usercode to verify
  async findByEmailAndCode(email, usercode) {
    const currentTime = new Date();
    const currentTimeString = currentTime
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");
    const query = `
            SELECT id, username, email, reset_code, reset_code_expiry
            FROM users
            WHERE email = ? AND reset_code = ? AND reset_code_expiry > ?
        `;
    console.log("[findByEmailAndCode]: Query inputs: ", {
      email,
      usercode,
      currentTimeString,
    }); // debug code
    const [rows] = await db.query(query, [email, usercode, currentTimeString]);
    if (rows.length === 0) {
      throw new Error("[findByEmailAndCode]: Invalid or expired code");
    }
    return rows[0];
  }

  // Update user password
  async updateUserPassword(userId, hashedPassword) {
    try {
      if (typeof userId !== "number") {
        userId = parseInt(userId, 10);
      }
      console.log(
        "[updateUserPassword]: Executing SQL query to update password for userId:",
        userId
      ); // debug code
      const [result] = await db.query(
        "UPDATE users SET password = ? WHERE id = ?",
        [hashedPassword, userId]
      );
      if (result.affectedRows === 0) {
        throw new Error(
          "[updateUserPassword]: User not found or no changes made"
        );
      }
    } catch (error) {
      console.error(
        "[updateUserPassword]: Error updating user password:",
        error
      );
      throw error;
    }
  }

  // Update reset code last sent timestamp
  async updateResetCodeLastSent(email) {
    const query = `
            UPDATE users
            SET reset_code_last_sent = NOW()
            WHERE email = ?
        `;
    const [result] = await db.query(query, [email]);
    if (result.affectedRows === 0) {
      throw new Error(
        "[updateResetCodeLastSent]: User not found or no changes made"
      );
    }
    return result;
  }
}

module.exports = UserRepository;
