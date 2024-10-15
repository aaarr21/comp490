const express = require('express'); // express middleware
const session = require('express-session'); // express session 
const mysql = require('mysql2');
const dotenv = require('dotenv');
const cors = require('cors');
const connect_ensure_login = require('connect-ensure-login'); // authorization middleware
// const flash = require('connect-flash'); // Flash messages, if needed
const passport = require('passport');
require('./config/passport-google'); // Load passport config
const userRoutes = require('./routes/userRoutes');


// Load environment variables
dotenv.config();

// Initialize the app
const app = express();
const sessionSecret = process.env.SESSION_SECRET;


app.use(express.json()); //  parse incoming JSON requests
app.use(express.urlencoded({ extended: true }));


// CORS setup to allow requests from frontend
app.use(cors({
  origin: "http://localhost:3000",
  methods: "GET, POST, PUT, DELETE",
  credentials: true // allow sending session cookies with request
}));

app.options('*',cors());

// Session management
app.use(session({
  secret: sessionSecret, // Used to sign the session ID cookie
  resave: false, // Prevents saving the session back to the store if not modified
  saveUninitialized: true, // Prevents saving uninitialized sessions
  cookie: {
    httpOnly: true, // Protects the cookie from being accessed by client-side scripts
    secure: process.env.NODE_ENV === 'production', // Set `secure` to true only in production for HTTPS
    sameSite: 'lax' // Helps prevent CSRF attacks
  }
}));

// Initialize Passport for authentication
app.use(passport.initialize());
app.use(passport.session());

// Route handling for user-related requests

app.use('/auth', userRoutes);

// MySQL database connection setup
const db = mysql.createPool({

  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  connectionLimit: 8
});

// Test the database connection
db.getConnection((err, connection) => {
  if (err) {
    console.error('Failed to connect to MySQL:', err.stack);
    return;
  }
  console.log('Connected to MySQL');
  connection.release();
});

// Export the db connection for use in other parts of the app
module.exports = db;

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log('Listening on port ' + PORT));
