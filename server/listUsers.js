require('dotenv').config(); // Load environment variables from .env file
const path = require('path');


const UserRepository = require('./src/repository/UserRepository');

const userRepository = new UserRepository();

async function listUsers() {
    try {
        const users = await userRepository.getAllUsers();
        if (users.length === 0) {
            console.log("No users found in the database.");
        } else {
            console.log("List of users:");
            users.forEach((user) => {
                console.log(`ID: ${user.id}, Username: ${user.username}, Email: ${user.email}, Role: ${user.role}`);
            });
        }
    } catch (error) {
        console.error('Error retrieving users:', error.message);
    }
}

listUsers();
