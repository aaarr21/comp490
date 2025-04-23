const express = require("express");
const passport = require("passport");
const userController = require("../controllers/UserController");
const taskController = require("../controllers/TaskController");
const router = express.Router();
const FRONTEND_URL = "http://localhost:3000/workBoard";
const nodemailer = require("nodemailer");
const multer = require('multer');
const multers3 = require('multer-s3');
const { S3Client } = require("@aws-sdk/client-s3");
const {
  requireTaskPermission,
  requirePermission,
  requireRole,
} = require("../middleware/rbacMiddleware");
const RBACService = require("../services/RBACService");
const rbacService = new RBACService();


const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_KEY,
    },
});


//multer storage set up, using memoryStorage because I don't want this to be in our server.



const upload = multer({
  storage: multers3({
    s3,
    bucket: process.env.S3_BUCKET_NAME,
    acl: 'private',
    contentType: multers3.AUTO_CONTENT_TYPE,
    metadata: (req,file,cb) => {
      cb(null,{fieldName: file.fieldname});
    } ,
    key: (req,file,cb) => {
      const fileKey = `${Date.now()}-${file.originalname}`;
      cb(null,fileKey);
    }

  }),
  limits: {fileSize : 10000000000}
});

// --- User Management Routes ---
router.post('/register', userController.registerUser);  // Route to register a new user
router.post('/login', userController.loginUser);  // Backend login route
router.get('/users', userController.getAllUsers);  // Route to get all users
router.get('/get-current-user', userController.getUserProfile);
router.put('/update-user/:id', userController.updateUserProfile);  // Route to update user profile
router.delete('/delete-task',taskController.deleteTask);
router.delete('/:id', userController.deleteUser);  // Route to delete a user
router.post('/reset-password', userController.resetPassword);  // Route to reset the password
router.post('/swap-columns',taskController.dealWTaskDrag); //route to deal with swapping columns
router.post('/update-status', taskController.updateStatus);
router.post('/update-title',taskController.updateTitle);
router.post('/create-new-task', upload.single('attachment'), taskController.createNewTask); // Route to create a new task 
router.post('/create-new-goal', taskController.createGoal);
router.get('/get-all-members', userController.getAllUsers);
router.get('/get-all-goals', taskController.getAllGoals);
router.get('/get-all-tasks', taskController.getAllTasks);


// --- Task Routes ---


// --- Password Reset Routes ---
router.post('/reset', userController.sendResetCode); // Route to send password reset code
router.post('/verify-reset', userController.verifyResetCode); // Route to verify reset code

// --- Authentication Routes ---
function isLoggedIN(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ success: false, message: "Unauthorized" });
}

// --- User Management Routes ---
router.post("/register", userController.registerUser);
router.post("/login", userController.loginUser);
router.get(
  "/users",
  requirePermission("user.view"),
  userController.getAllUsers
);
router.get("/get-current-user", userController.getUserProfile);
router.put(
  "/:id([0-9]+)",
  requirePermission("user.update"),
  userController.updateUserProfile
);
router.delete(
  "/delete-column",
  isLoggedIN,
  requirePermission("board.delete"),
  taskController.deleteColumn
);

// --- Task Routes ---
router.post(
  "/create-new-task",
  isLoggedIN,
  requirePermission("task.create"),
  upload.single("attachment"),
  taskController.createNewTask
);

router.post(
  "/create-new-goal",
  isLoggedIN,
  requireTaskPermission("create"),
  taskController.createGoal
);
router.delete(
  "/delete-task",
  isLoggedIN,
  requireTaskPermission("delete"),
  taskController.deleteTask
);
router.post(
  "/swap-columns",
  isLoggedIN,
  requirePermission("task.move"),
  taskController.dealWTaskDrag
);
router.post(
  "/update-status",
  isLoggedIN,
  requireTaskPermission("update"),
  taskController.updateStatus
);
router.post(
  "/update-title",
  isLoggedIN,
  requireTaskPermission("update"),
  taskController.updateTitle
);

// --- Task Data Routes ---
router.get("/get-all-members", isLoggedIN, userController.getAllUsers);
router.get("/get-all-goals", isLoggedIN, taskController.getAllGoals);
router.get("/get-all-tasks", isLoggedIN, taskController.getAllTasks);

// --- Password Reset Routes ---
router.post("/reset", userController.sendResetCode);
router.post("/verify-reset", userController.verifyResetCode);
router.post("/reset-password", userController.resetPassword);

// --- Authentication Routes ---
// Protected route for checking login status
router.get("/status", isLoggedIN, (req, res) => {
  console.log("Session: ", req.session);
  console.log("Passport: ", req.session.passport);
  res.status(200).json({ loggedIn: true, user: req.user });
});

// Workboard route - Add this before the dynamic ID route
router.get("/workBoard", isLoggedIN, (req, res) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "User not authenticated",
    });
  }
  res.status(200).json({
    success: true,
    user: {
      id: req.user.id,
      username: req.user.username,
      email: req.user.email,
      role: req.user.role,
    },
  });
});

// Authentication check endpoint
router.get("/check-auth", (req, res) => {
  if (req.isAuthenticated() && req.user) {
    // Include the user's permissions in the response
    rbacService
      .getUserPermissions(req.user.id)
      .then((permissions) => {
        res.status(200).json({
          success: true,
          message: "User is authenticated",
          user: {
            id: req.user.id,
            username: req.user.username,
            email: req.user.email,
            permissions: permissions,
          },
        });
      })
      .catch((err) => {
        console.error("Error getting user permissions:", err);
        res.status(200).json({
          success: true,
          message: "User is authenticated",
          user: {
            id: req.user.id,
            username: req.user.username,
            email: req.user.email,
          },
        });
      });
  } else {
    res
      .status(401)
      .json({ success: false, message: "User is not authenticated" });
  }
});

// OAuth routes
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account",
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/auth/login/failed",
  }),
  (req, res) => {
    console.log("User successfully authenticated, redirecting to WorkBoard...");
    res.send(`
    <script>
      if (window.opener) {
        window.opener.location = "${FRONTEND_URL}";
        window.close();
      } else {
        window.location = "${FRONTEND_URL}";
      }
    </script>
  `);
  }
);

// Other OAuth routes...
router.get(
  "/github",
  passport.authenticate("github", {
    scope: ["profile", "email"],
    prompt: "select account",
  })
);

router.get(
  "/github/callback",
  passport.authenticate("github", {
    failureRedirect: "/auth/login/failed",
  }),
  (req, res) => {
    console.log("User successfully authenticated, redirecting to WorkBoard...");
    res.send(`
    <script>
      if (window.opener) {
        window.opener.location = "${FRONTEND_URL}";
        window.close();
      } else {
        window.location = "${FRONTEND_URL}";
      }
    </script>
  `);
  }
);

router.get(
  "/facebook",
  passport.authenticate("facebook", {
    scope: "email",
    prompt: "select account",
  })
);

router.get(
  "/facebook/callback",
  passport.authenticate("facebook", {
    failureRedirect: "/auth/login/failed",
  }),
  (req, res) => {
    console.log("User successfully authenticated, redirecting to WorkBoard...");
    res.send(`
    <script>
      if (window.opener) {
        window.opener.location = "${FRONTEND_URL}";
        window.close();
      } else {
        window.location = "${FRONTEND_URL}";
      }
    </script>
  `);
  }
);

router.get(
  "/linkedin",
  passport.authenticate("linkedin", {
    scope: ["profile", "email", "openid"],
    prompt: "select account",
  })
);

router.get(
  "/linkedin/callback",
  passport.authenticate("linkedin", {
    failureRedirect: "/auth/login/failed",
  }),
  (req, res) => {
    console.log("User successfully authenticated, redirecting to WorkBoard...");
    res.send(`
    <script>
      if (window.opener) {
        window.opener.location = "${FRONTEND_URL}";
        window.close();
      } else {
        window.location = "${FRONTEND_URL}";
      }
    </script>
  `);
  }
);

// Login Failure Route
router.get("/login/failed", (req, res) => {
  res.status(401).json({ success: false, message: "Failed to login" });
});

// Logout Route
router.post("/logout", (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(200).json({
      success: true,
      message: "Already logged out",
    });
  }

  req.logout((err) => {
    if (err) {
      console.error("Logout error:", err);
      return res.status(500).json({
        success: false,
        message: "Error during logout",
      });
    }

    req.session.destroy((err) => {
      if (err) {
        console.error("Session destruction error:", err);
        return res.status(500).json({
          success: false,
          message: "Error clearing session",
        });
      }

      res.status(200).json({
        success: true,
        message: "Logged out successfully",
      });
    });
  });
});

// RBAC Admin routes
router.use("/rbac", requireRole(["admin"]), require("./rbacRoutes"));

// User profile route - must be last to avoid conflicts
router.get("/:id([0-9]+)", userController.getUserProfile);

// Catch-all for undefined routes
router.get("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

module.exports = router;
