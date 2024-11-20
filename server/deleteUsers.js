require('dotenv').config();
const db = require('./src/config/db');
const readline = require('readline');

// Set up readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to list users
async function listUsers(connection) {
  try {
    // Select the correct columns (id, email, username)
    const [users] = await connection.query('SELECT id, email, username FROM users ORDER BY id');
    
    if (users.length === 0) {
      console.log('No users found in the database.');
      return null;
    }

    console.log('\nAvailable users:');
    users.forEach(user => {
      console.log(`- ${user.username}: ${user.email}`);
    });
    console.log('\n'); 

    return users;
  } catch (error) {
    console.error('Error retrieving users:', error.message);
    return null;
  }
}

// Function to delete users by email and resequence IDs
async function deleteUsers() {
  try {
    const connection = await db.getConnection();
    console.log('MySQL Connected...');

    async function promptForDeletion() {
      const users = await listUsers(connection);
      if (!users) {
        cleanup(connection);
        return;
      }

      rl.question('Enter the emails of the users to delete (separated by commas or spaces), or type "exit" to quit: ', async (input) => {
        if (input.toLowerCase() === 'exit') {
          cleanup(connection);
          return;
        }

        const emails = input.split(/[\s,]+/).filter(Boolean);
        if (emails.length === 0) {
          console.log('No valid emails provided.');
          return promptForDeletion();
        }

        const deleteQuery = `DELETE FROM users WHERE email IN (${emails.map(() => '?').join(', ')})`;
        try {
          const [result] = await connection.query(deleteQuery, emails);
          console.log(`Deleted ${result.affectedRows} user(s) with email(s): ${emails.join(', ')}`);
          
          // Resequence IDs after deletion
          await connection.query('SET @count = 0');
          await connection.query('UPDATE users SET id = @count := @count + 1 ORDER BY id');
          await connection.query('ALTER TABLE users AUTO_INCREMENT = 1');
          console.log('IDs resequenced.');

        } catch (error) {
          console.error('Error deleting users:', error.message);
        }

        promptForDeletion();
      });
    }

    promptForDeletion();
  } catch (error) {
    console.error('Database connection failed:', error.message);
    rl.close();
  }
}

// Cleanup function
function cleanup(connection) {
  connection.release();
  rl.close();
  console.log('Exiting the program...');
  process.exit(0); // Exit the program and return to the command prompt
}

// Run the deleteUsers function
deleteUsers();
