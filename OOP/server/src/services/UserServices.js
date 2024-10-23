import { hash, compare } from 'bcryptjs'; // Import bcrypt for password hashing
import User from '../models/User'; // Assuming User is a Sequelize model
import UserRepository from './UserRepository'; // Import UserRepository

class UserService {
    constructor() {
        this.userRepository = new UserRepository();
    }
	// centralizing logic for excluding sensitive fields
	excludeSensitiveFields(user) {
		const { password: _, ...userData } = user.dataValues;
		return userData;
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

        return this.excludeSensitiveFields(savedUser);
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

        return this.excludeSensitiveFields(userRecord);
    }


	//reset password
	async resetPassword(email, password) {
		// Retrieve the user record from the database
		const userRecord = await this.userRepository.findByEmail(email);
		if (!userRecord) {
			throw new Error('User not found');
		}
		// Hash the new password and update the user record
		const hashedPassword = await hash(password, 10);
		userRecord.password = hashedPassword;
		await this.userRepository.updateUser(userRecord.id, userRecord);
		return this.excludeSensitiveFields(userRecord);
	}

	//get user profile
	async getUserProfile(id) {
		const user = await this.userRepository.findById(id);
		if (!user) {
			throw new Error('User not found');
		}
		return this.excludeSensitiveFields(user);
	}

	//update user profile
	async updateUserProfile(id, email, name, role) {
		const user = await this.userRepository.findById(id);
		if (!user) {
			throw new Error('User not found');
		}
		user.email = email;
		user.name = name;
		user.role = role;
		await this.userRepository.updateUser(id, user);
		return this.excludeSensitiveFields(user);
	}

	//delete user
	async deleteUser(id) {
		const user = await this.userRepository.findById(id);
		if (!user) {
			throw new Error('User not found');
		}
		await this.userRepository.deleteUser(id);
	}
}


export default UserService;
