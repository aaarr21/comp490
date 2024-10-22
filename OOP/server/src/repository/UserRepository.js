import User from '../model/User'; // Assuming User is a Sequelize model
import Database from '../config/database'; // Import the Database class to establish connection

class UserRepository {
    constructor() {
        this.sequelize = Database.connectMySQL(); // Initialize the connection
    }

    // Find a user by email
    async findByEmail(email) {
        return await User.findOne({ where: { email } });
    }
	async findById(id) {
		return await User.findByPk(id);
	}

    // Save a new user to the database
    async save(user) {
       return await User.create(user);
    }

	// Update an existing user in the database
	async updateUser(id, user) {
		return await User.update(updatedUser, { where: { id } });
	}

	// Delete a user from the database
	async deleteUser(id) {
		return await User.destroy({ where: { id } });
	}
}

export default UserRepository;
