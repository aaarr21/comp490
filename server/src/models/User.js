const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

class User {
    constructor(id, username, email, password, name, role, createdAt) {
        this.id = id || uuidv4(); // Generate a UUID
        this.username = username;  // Correct field for username
        this.email = email;        // Correct field for email
        this.password = password;  // Correct field for hashed password
        this.role = role;
        this.createdAt = createdAt || new Date();
    }

    // Static method to register a new user
    static async register(username, email, password, name, role) {
        const hashedPassword = await bcrypt.hash(password, 10);
        return new User(null, username, email, hashedPassword, name, role);
    }

    // Instance method to authenticate user with plain password
    async authenticate(plainPassword) {
        return await bcrypt.compare(plainPassword, this.password);
    }
}
 module.exports = User;