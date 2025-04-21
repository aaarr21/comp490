const express = require("express"); // express middleware
const session = require("express-session"); // express session
const mysql = require("mysql2");
const dotenv = require("dotenv");
const cors = require("cors");
const connect_ensure_login = require("connect-ensure-login"); // authorization middleware
// const flash = require('connect-flash'); // Flash messages, if needed
const passport = require("passport");
require("./config/passport-google"); // Load passport config
require("./config/passport-github"); //load passport config for github logins
require("./config/passport-facebook"); //load passport config for facebook logins
require("./config/passport-linkedin");
const userRoutes = require("./routes/userRoutes");
const rbacRoutes = require("./routes/rbacRoutes");
const sessionConfig = require("./config/redisConfig");

// Add RBAC middleware
const { addPermissionsToRequest } = require("./middleware/rbacMiddleware");

// Load environment variables
dotenv.config();

// Initialize the app
const app = express();
const sessionSecret = process.env.SESSION_SECRET;

app.use(express.json()); //  parse incoming JSON requests
app.use(express.urlencoded({ extended: true }));

// CORS setup to allow requests from frontend
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: "GET, POST, PUT, DELETE",
    credentials: true, // allow sending session cookies with request
  })
);

app.options("*", cors());

// redis session management
app.use(sessionConfig);

// Initialize Passport for authentication
app.use(passport.initialize());
app.use(passport.session());

// Apply RBAC middleware to add permissions to request objects
app.use(addPermissionsToRequest);

// RBAC routes - add them under /auth to maintain consistency
app.use("/auth/rbac", rbacRoutes);

// Route handling for user-related requests
app.use("/auth", userRoutes);

// MySQL database connection setup
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  connectionLimit: 8,
});

// Test the database connection
db.getConnection((err, connection) => {
  if (err) {
    console.error("Failed to connect to MySQL:", err.stack);
    return;
  }
  console.log("Connected to MySQL"); //debug MSG

  // Initialize RBAC by checking if tables exist
  connection.query(
    `
    SELECT COUNT(*) as count FROM information_schema.tables 
    WHERE table_schema = ? AND table_name = 'roles'
  `,
    [process.env.DB_NAME],
    (err, results) => {
      if (err) {
        console.error("Error checking RBAC tables:", err);
        connection.release();
        return;
      }

      // If roles table doesn't exist, we might want to initialize it
      if (results[0].count === 0) {
        console.log(
          "RBAC tables not found. Run database migration to set up RBAC."
        );
      } else {
        console.log("RBAC system initialized");
      }

      connection.release();
    }
  );
});

// Export the db connection for use in other parts of the app
module.exports = db;

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("Listening on port " + PORT)); //debug MSG
