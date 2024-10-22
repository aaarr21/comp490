import { config } from 'dotenv';

// Load environment variables from .env
config();

class Database {
    // Static property to store the Sequelize instance (Singleton Pattern)
    static sequelize = null;

    // Static method to connect to MySQL using Sequelize
    static async connectMySQL() {
        if (!Database.sequelize) {
            // Lazy initialization, create connection if it doesn't exist
            const { Sequelize } = require('sequelize');
            Database.sequelize = new Sequelize(
                process.env.MYSQL_DB,  // Database name
                process.env.MYSQL_USER,  // Database user
                process.env.MYSQL_PASSWORD,  // Database password
                {
                    host: process.env.MYSQL_HOST, // MySQL host (e.g., localhost)
                    dialect: 'mysql',             // Specify the MySQL dialect
                    port: process.env.MYSQL_PORT || 3306, // MySQL port, default to 3306 if not provided
                    logging: false,               // Disable Sequelize's default logging
                }
            );

            // Test the connection to ensure everything works
            try {
                await Database.sequelize.authenticate();
                console.log('MySQL connected successfully!');
            } catch (error) {
                console.error('Unable to connect to MySQL:', error);
                throw new Error('Database connection failed');
            }
        }

        // Return the Sequelize instance for use elsewhere in the application
        return Database.sequelize;
    }
}

export default Database;
