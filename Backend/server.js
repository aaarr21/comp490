const express = require('express'); //express middle ware
const session = require('express-session'); // express session 
const mysql = require('mysql2');
const dotenv = require('dotenv');
const cors = require('cors');
const connect_ensure_login = require('connect-ensure-login') // authorization, so we can make routes only work for logged-in users
//const flash = require('connect-flash'); // flash, this seems like to be used for messaging
const passport = require('passport');
const passport_google = require('./passport-google.js');
const auth_routes = require('./routes/auth.js');

dotenv.config();


 // require('./routes/auth'); //load in auth.js in here
const app = express();
const sessionSecret = process.env.SESSION_SECRET;






app.use(express.json()); //parses incoming JSON requests
app.use(express.urlencoded());
app.use(cors({
  origin: "localhost:3000",
  methods: "GET, POST, PUT, DELETE",
  credentials: true //  allow sending session cookies with request
}));

app.options('*',cors());


app.use(session({
  secret: sessionSecret,  // Used to sign the session ID cookie
  resave: false,  // Prevents saving the session back to the store if not modified
  saveUninitialized: false,  // Prevents saving uninitialized sessions
  cookie: {
    httpOnly: true,  // Protects the cookie from being accessed by client-side scripts
    secure: process.env.NODE_ENV === 'production',  // Set `secure` to true only in production for HTTPS
    sameSite: 'lax'  // Helps prevent CSRF attacks
  }
}));


app.use("/auth", auth_routes);

function isLoggedIN(req, res,next) {
  //checks if logged in, sends 401 status if not
  req.user ? next() : res.sendStatus(401);
}

app.get("/WorkBoard",isLoggedIN, (req,res) => {
  console.log("this worked?");
  if(req.user){
    res.status(200).json({
        success:true,
        message: "Login successful",
        user: req.user,
        
      });
  } else {
    res.status(401).json({
      success: false,
      message: "unauthorized user",
    });
    res.redirect("/");
  }

});


app.post('/register' , (req,res) =>{
  const username = req.body.username;
  const password = req.body.password;
   res.sendStatus(201);
  console.log(username + " " + password); //check if this route actually acquired the username and password
                                          // This should redone to include storing within the db.
});

app.post('/login', (req,res) =>{
   const username = req.body.username;
   const password = req.body.password;
   res.sendStatus(201);
   console.log(username + " " + password);
 
});



//MySql database connection
/* const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_NAME || 3306,
  connectionLimit: 8 //arbitary number of connections allowed to database at a single instance, can change
}) */

// Database connection confirmation testing
/* db.getConnection((err, connection) => {
  if(err) {
    console.error('Failed to connect to MySQL:', err.stack);
    return;
  }
  console.log('Connected to MySQL');
  connection.release();
}) */






const PORT = process.env.PORT || 5000; //Port used
app.listen(PORT, () => console.log('Listening on port ' + PORT));