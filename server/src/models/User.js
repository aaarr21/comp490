const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

class User {
    // Constructor to establish the user object
    constructor(id, email, password, name, role, createdAt) {
        this.id = id || uuidv4(); // Generate a UUID
        this.email = email;
        this.password = password;
        this.name = name;
        this.role = role;
        this.createdAt = createdAt || new Date();
    }

    // Static method to register a new user
    static async register(email, password, name, role) {
        const hashedPassword = await bcrypt.hash(password, 10);
        return new User(null, email, hashedPassword, name, role);
    }

    // Instance method to authenticate user with plain password
    async authenticate(plainPassword) {
        return await bcrypt.compare(plainPassword, this.password);
    }
}

module.exports = User;
