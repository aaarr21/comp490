const { Sequelize } = require('sequelize'); // Import Sequelize class from sequelize package
// Load environment variables from .env
require('dotenv').config();

class Database {
    // Static property to store the Sequelize instance (Singleton Pattern)
    static sequelize = null;

    // Static method to connect to MySQL using Sequelize
    static async connectMySQL() {
        if (!this.sequelize) {
            // Lazy initialization, create connection if it doesn't exist
            this.sequelize = new Sequelize(
                process.env.MYSQL_DB,  // Database name
                process.env.MYSQL_USER,  // Database user
                process.env.MYSQL_PASSWORD,  // Database password
                {
                    host: process.env.MYSQL_HOST,  // MySQL host (e.g., localhost)
                    dialect: 'mysql',              // Specify the MySQL dialect
                    port: process.env.MYSQL_PORT || 3306,  // MySQL port, default to 3306 if not provided
                    logging: false,                // Disable Sequelize's default logging
                    pool: {
                        max: 5,                     // Maximum number of connections
                        min: 0,                     // Minimum number of connections
                        acquire: 30000,             // Maximum time (ms) that pool will try to get connection before throwing error
                        idle: 10000                 // Maximum time (ms) that a connection can be idle before being released
                    }
                }
            );

            // Test the connection to ensure everything works
            try {
                await this.sequelize.authenticate();
                console.log('MySQL connected successfully!');
            } catch (error) {
                console.error('Unable to connect to MySQL:', error);
                throw new Error('Database connection failed');
            }
        }

        // Return the Sequelize instance for use elsewhere in the application
        return this.sequelize;
    }
    static async closeConnection() {
        if (this.sequelize) {
            try {
                await this.sequelize.close();
                console.log('Database connection closed.');
            } catch (error) {
                console.error('Error closing the database connection:', error);
            }
        }
    }
    
    
}

module.exports = Database;