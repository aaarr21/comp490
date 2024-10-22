import { hash, compare } from 'bcryptjs'; // Import bcrypt for password hashing
import User from '../models/User'; // Assuming User is a Sequelize model
import UserRepository from './UserRepository'; // Import UserRepository

class UserService {
    constructor() {
        this.userRepository = new UserRepository();
    }

    // Register a new user with additional fields
    async register(email, password, name, role) {
        // Check if the user already exists
        const existingUser = await this.userRepository.findByEmail(email);
        if (existingUser) {
            throw new Error('User already exists');
        }

        // Hash the password explicitly in the service layer
        const hashedPassword = await hash(password, 10);

        // Create a new user object and save it to the database
        const newUser = await this.userRepository.save({
			email,
			password: hashedPassword,
			name,
			role,
		});

        // Save the new user in the database
        const savedUser = await this.userRepository.save(newUser);

        // Return the user data without the password
        const { password: _, ...userData } = savedUser.dataValues;
        return userData;
    }

    // Login a user by email and password
    async login(email, password) {
        // Retrieve the user record from the database
        const userRecord = await this.userRepository.findByEmail(email);
        if (!userRecord) {
            throw new Error('User not found');
        }

        // Authenticate the user by comparing the password
        const isAuthenticated = await compare(password, userRecord.password);
        if (!isAuthenticated) {
            throw new Error('Invalid password');
        }

        // Return the user data without the password
        const { password: _, ...userData } = userRecord.dataValues;
        return userData;
    }
}

export default UserService;
