// controllers/UserController.js
const UserService = require("../services/UserService");
const userService = new UserService();
const {
  registerSchema,
  loginSchema,
  verifyResetCodeSchema,
} = require("../utils/userValidator");
const Mailer = require("../utils/mailer");
const mailer = new Mailer();

// Route handler for user registration
const registerUser = async (req, res) => {
  console.log("Received registration request:", req.body); // debug code
  const { error } = registerSchema.validate(req.body);
  if (error) {
    console.error(
      `[registerUser]: Validation error - ${error.details[0].message}`
    ); // debug code
    return res.status(400).json({ error: error.details[0].message });
  }

  const { username, email, password, role } = req.body;

  try {
    const existingUser = await userService.findByUsernameOrEmail(
      username,
      email
    );
    if (existingUser) {
      return res
        .status(409)
        .json({ error: "Username or email already exists" });
    }

    const newUser = await userService.register(username, email, password, role);
    res.status(201).json({ message: "User registered successfully", newUser });
  } catch (error) {
    console.error("Error during registration:", error); // debug code
    res.status(500).json({ error: "Registration failed" });
  }
};

// Route handler for user login
const loginUser = async (req, res) => {
  console.log("Received login request:", req.body); // debug code

  const { error } = loginSchema.validate(req.body);
  if (error) {
    console.error(
      `[loginUser]: Validation error - ${error.details[0].message}`
    ); // debug code
    return res.status(400).json({ error: error.details[0].message });
  }

  const { identifier, password, rememberMe } = req.body;

  try {
    const user = await userService.login(identifier, password);
    req.login(user, (err) => {
      if (err) {
        console.error("[loginUser]: Error during login:", err); // debug code
        return res
          .status(500)
          .json({ error: "Incorrect username or password" });
      }
      req.session.cookie.maxAge = rememberMe
        ? 30 * 24 * 60 * 60 * 1000
        : 15 * 60 * 1000; // Set session duration (30 days or 5 mins)
      req.session.save((saveErr) => {
        if (saveErr) {
          console.error("[loginUser]: Error saving session:", saveErr); // debug code
          return res.status(500).json({ error: "Session not saved" });
        }
        console.log("[loginUser]: Login successful:", user); // debug code
        res.status(200).json({ message: "Login successful", user });
      });
    });
  } catch (error) {
    console.error("Error during login:", error); // debug code
    res.status(401).json({ error: error.message });
  }
};

// Route handler for getting user profile by ID
const getUserProfile = async (req, res) => {
  const { id } = req.params;
  console.log(`[getUserProfile]: Fetching profile for user ID ${id}`);

  try {
    // Ensure id is a valid number and exists
    const userId = parseInt(id, 10);
    if (isNaN(userId)) {
      console.error(`[getUserProfile]: Invalid user ID format: ${id}`);
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format",
      });
    }

    // Check if user is authenticated
    if (!req.isAuthenticated()) {
      console.error(
        `[getUserProfile]: Unauthorized access attempt for ID ${userId}`
      );
      return res.status(401).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    // Get user profile
    const user = await userService.findById(userId);
    if (!user) {
      console.error(`[getUserProfile]: User not found for ID ${userId}`);
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Only allow users to access their own profile unless they're an admin
    if (req.user.id !== userId && req.user.role !== "admin") {
      console.error(
        `[getUserProfile]: Unauthorized access - User ${req.user.id} attempted to access profile ${userId}`
      );
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    // Remove sensitive information before sending
    const sanitizedUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      created_at: user.created_at,
    };

    console.log("[getUserProfile]: Successfully fetched user profile");
    res.status(200).json({
      success: true,
      user: sanitizedUser,
    });
  } catch (error) {
    console.error("[getUserProfile]: Error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user profile",
      error: error.message,
    });
  }
};

// Route handler for updating user profile
const updateUserProfile = async (req, res) => {
  const userId = req.params.id;
  console.log(
    `[updateUserProfile]: Received update request for user ID ${userId}`,
    req.body
  ); // debug code
  // Validate the request body using updateUserSchema
  const { error } = updateUserSchema.validate(req.body);
  if (error) {
    console.error(
      `[updateUserProfile]: Validation error - ${error.details[0].message}`
    ); // debug code
    return res.status(400).json({ error: error.details[0].message });
  }
  const updatedData = req.body;
  try {
    const updatedUser = await userService.updateUserFields(userId, updatedData);
    if (!updatedUser) {
      console.error(`[updateUserProfile]: User not found for ID ${userId}`); // debug code
      return res.status(404).json({ message: "User not found" });
    }
    console.log(
      "[updateUserProfile]: User profile updated successfully:",
      updatedUser
    ); // debug code
    res
      .status(200)
      .json({ message: "User profile updated successfully", updatedUser });
  } catch (error) {
    console.error("Error updating user profile:", error); // debug code
    res.status(500).json({ error: error.message });
  }
};

// Route handler for deleting a user
const deleteUser = async (req, res) => {
  const userId = req.params.id;
  console.log(`[deleteUser]: Deleting user ID ${userId}`); // debug code
  try {
    await userService.deleteUser(userId);
    console.log("[deleteUser]: User deleted successfully"); // debug code
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error); // debug code
    res.status(500).json({ error: error.message });
  }
};

// Route handler to get a list of all users
const getAllUsers = async (req, res) => {
  console.log("[getAllUsers]: Fetching all users");

  // Get limit parameter or use default
  const limit = req.query.limit ? parseInt(req.query.limit) : 10;

  try {
    const users = await userService.getAllUsers(limit);
    console.log(`[getAllUsers]: ${users.length} users fetched successfully`);
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: error.message });
  }
};

// Route handler for generating and sending password reset code
const sendResetCode = async (req, res) => {
  const { userEmail } = req.body;
  console.log(
    `[sendResetCode]: Received password reset request for email ${userEmail}`
  ); // debug code

  try {
    // Check if the user exists
    const user = await userService.findByEmail(userEmail);
    if (!user) {
      console.error(`[sendResetCode]: Email not registered: ${userEmail}`); // debug code
      return res
        .status(404)
        .json({ success: false, message: "Email not registered." });
    }

    // Rate limiting: Check if code was sent recently
    const lastSent = user.reset_code_last_sent;
    if (lastSent && new Date() - new Date(lastSent) < 60 * 1000) {
      console.error(
        "[sendResetCode]: Code was recently sent, rate limit triggered"
      ); // debug code
      return res.status(429).json({
        success: false,
        message:
          "Please wait at least 1 minute before requesting another reset code.",
      });
    }

    // Generate a secure reset code
    const usercode = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit numeric code
    console.log("[sendResetCode]: Generated reset code:", usercode); // debug code
    const expiryTime = new Date(Date.now() + 15 * 60 * 1000); // 15-minute expiry

    // Save reset code and expiry in the database
    await userService.saveUserCode(userEmail, usercode, expiryTime);
    await userService.updateResetCodeLastSent(userEmail);

    // Send the reset code via email using the new mailer utility
    await mailer.sendPasswordResetCode(userEmail, usercode);

    console.log("[sendResetCode]: Reset code sent successfully"); // debug code
    res
      .status(200)
      .json({ success: true, message: "Reset code sent successfully." });
  } catch (error) {
    console.error("Error sending reset code:", error); // debug code
    res
      .status(500)
      .json({ success: false, message: "Failed to send reset code." });
  }
};

// Route handler for verifying the reset code
const verifyResetCode = async (req, res) => {
  console.log("[verifyResetCode]: Received verification request:", req.body); // debug code
  const { error } = verifyResetCodeSchema.validate(req.body);
  if (error) {
    console.error(
      `[verifyResetCode]: Validation error - ${error.details[0].message}`
    ); // debug code
    return res
      .status(400)
      .json({ success: false, message: error.details[0].message });
  }

  const { userEmail, usercode } = req.body;

  try {
    console.log(
      `[verifyResetCode]: Attempting to verify code for ${userEmail}`
    ); // debug code
    const user = await userService.verifyUserCode(userEmail, usercode);
    console.log(
      `[verifyResetCode]: Code verified successfully for ${userEmail}`
    ); // debug code
    res.status(200).json({
      success: true,
      message: "Code verified successfully.",
      userId: user.id,
    });
  } catch (error) {
    console.error(`[verifyResetCode]: Error - ${error.message}`); // debug code
    res.status(400).json({ success: false, message: error.message });
  }
};

// Route handler for resetting the password
const resetPassword = async (req, res) => {
  console.log("[resetPassword]: Received reset password request:", req.body);
  let { userId, newPassword } = req.body;

  try {
    // Validate userId
    userId = parseInt(userId, 10);
    if (isNaN(userId)) {
      console.error("[resetPassword]: Invalid userId provided:", userId);
      return res.status(400).json({
        success: false,
        message: "Invalid userId provided",
      });
    }

    // Check if user exists and get user type
    const user = await userService.findById(userId);
    if (!user) {
      console.error("[resetPassword]: User not found for ID:", userId);
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Special handling for OAuth users
    if (
      user.google_id ||
      user.facebook_id ||
      user.github_id ||
      user.linkedin_id
    ) {
      console.error("[resetPassword]: Cannot reset password for OAuth user");
      return res.status(400).json({
        success: false,
        message: "Password reset not available for social login accounts",
      });
    }

    // Update password
    await userService.updateUserPassword(userId, newPassword);

    // Destroy the current session to force re-login
    if (req.session) {
      req.session.destroy();
    }

    console.log(
      "[resetPassword]: Password updated successfully for user ID:",
      userId
    );
    res.status(200).json({
      success: true,
      message:
        "Password updated successfully. Please login with your new password.",
      requireRelogin: true,
    });
  } catch (error) {
    console.error("[resetPassword]: Error during password reset:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update password",
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  deleteUser,
  getAllUsers,
  sendResetCode,
  verifyResetCode,
  resetPassword,
};
