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

    async findByGithubId(githubId) {
        try{
             const [rows] = await db.query("SELECT id, username, email,password, role, created_at FROM users WHERE google_id = ?",[githubId]);
             return rows.length > 0 ? new User(rows[0].id,rows[0].username,rows[0].email,rows[0].password, rows[0].role, rows[0].created_at) : null;
        }catch(error){
            console.error("Error finding user by Github ID:", error);
            throw error;
        }
    }

    async findByFacebookId(facebookId) {
        try{
             const [rows] = await db.query("SELECT id, username, email,password, role, created_at FROM users WHERE google_id = ?",[facebookId]);
             return rows.length > 0 ? new User(rows[0].id,rows[0].username,rows[0].email,rows[0].password, rows[0].role, rows[0].created_at) : null;
        }catch(error){
            console.error("Error finding user by Github ID:", error);
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

            let existing_user = await this.findByEmail(email) // Hack to deal with the case if email exists within the database by updating tokens on email. Could be implemented better
                if(existing_user){
                    await db.query(
                        "UPDATE users SET access_token = ?, refresh_token = ? WHERE email = ?",
                        [accessToken,refreshToken,email]
                    );
                    existing_user.accessToken = accessToken;
                    existing_user.refreshToken = refreshToken;
                    return existing_user;
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
    async findOrCreatebyGithubId(githubId,profileURL,name, accessToken, refreshToken){
        try {
             let user = await this.findByGithubId(githubId);
             if (user) {
                 await db.query(
                    "UPDATE users SET access_token = ?, refresh_token = ? WHERE google_id = ?", 
                    [accessToken, refreshToken, githubId]
                 );
                user.accessToken = accessToken;
                user.refreshToken = refreshToken;
                return user;
             }
            const username = name; 

            const [result] = await db.query( //Note: google_id is used here it's the only attribute for non-local logins
               "INSERT INTO users (google_id,username, email, access_token, refresh_token, password) VALUES (?, ?, ?, ?, ?, NULL)",
               [githubId, username , profileURL ,accessToken, refreshToken]
            );
            
            return new User(result.insertId, username, profileURL, null, null, new Date());
        } catch (error) {
            throw error;
        }
    }

    async findOrCreatebyFacebookId(facebookId, email,name, accessToken, refreshToken){
        try {
             let user = await this.findByFacebookId(facebookId);
             if (user) {
                 await db.query(
                    "UPDATE users SET access_token = ?, refresh_token = ? WHERE google_id = ?", 
                    [accessToken, refreshToken, facebookId]
                 );
                user.accessToken = accessToken;
                user.refreshToken = refreshToken;
                return user;
             }

             let emailCheck = await this.findByEmail(email)
                if(emailCheck){
                await db.query("UPDATE users Set access_token = ?, refresh_token = ? Where google_id = ?",
                    [accessToken,refreshToken,facebookId]
                );
                emailCheck.accessToken = accessToken;
                emailCheck.refreshToken = refreshToken;
                return emailCheck;
             }
            const username = email.split('@')[0];

            const [result] = await db.query( //Note: google_id is as it's the only attribute describing non-local logins
               "INSERT INTO users (google_id,username, email, access_token, refresh_token, password) VALUES (?, ?, ?, ?, ?, NULL)",
               [facebookId, username , email, accessToken, refreshToken]
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
    async saveUserCode(email, usercode, expiryTime) {
        const query = `
            UPDATE users
            SET reset_code = ?, reset_code_expiry = ?
            WHERE email = ?
        `;
        // Convert expiryTime to MySQL datetime string
        const expiryTimeString = expiryTime.toISOString().slice(0, 19).replace('T', ' ');
        console.log('Saving reset code:', usercode, 'with expiry:', expiryTimeString); //debug code
        const [result] = await db.query(query, [usercode, expiryTimeString, email]);
        if (result.affectedRows === 0) {
            throw new Error('User not found or no changes made');
        }
        return result;
    }

    // Retrieve user by email and usercode to verify
    async findByEmailAndCode(email, usercode) {
        const currentTime = new Date();
        const currentTimeString = currentTime.toISOString().slice(0, 19).replace('T', ' ');
        const query = `
            SELECT id, username, email, reset_code, reset_code_expiry
            FROM users
            WHERE email = ? AND reset_code = ? AND reset_code_expiry > ?
        `;
        console.log("Query inputs: ", { email, usercode, currentTimeString }); //debug code//debug code
        const [rows] = await db.query(query, [email, usercode, currentTimeString]);
        console.log("Query results: ", rows); //debug code
        if (rows.length === 0) {
            throw new Error('Invalid or expired code');
        }
        return rows[0];
    }
    // Update user password
    async updateUserPassword(userId, hashedPassword) {
        try {
            if (typeof userId !== 'number') {
                userId = parseInt(userId, 10);
            }
            console.log('Executing SQL query to update password for userId:', userId); //debug code
            const [result] = await db.query(
                "UPDATE users SET password = ? WHERE id = ?", 
                [hashedPassword, userId]
            );
            console.log('Password Update Result:', result); //debug code
            if (result.affectedRows === 0) {
                throw new Error('User not found or no changes made');
            }
        } catch (error) {
            console.error('Error updating user password:', error);
            throw error;
        }
    }
    async updateResetCodeLastSent(email) {
        const query = `
            UPDATE users
            SET reset_code_last_sent = NOW()
            WHERE email = ?
        `;
        const [result] = await db.query(query, [email]);
        if (result.affectedRows === 0) {
            throw new Error('User not found or no changes made');
        }
        return result;
    }
}

module.exports = UserRepository;