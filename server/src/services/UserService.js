const bcrypt = require("bcrypt");
const User = require("../models/User");
const UserRepository = require("../repository/UserRepository");

class UserService {
  constructor() {
    this.userRepository = new UserRepository();
  }

  // Register a new user with additional fields
  async register(username, email, password, role) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User(null, username, email, hashedPassword, role);
    await this.userRepository.save(newUser);
    return newUser;
  }

  // Find a user by email
  async findByEmail(email) {
    return await this.userRepository.findByEmail(email);
  }

  // Login a user by email or username and password
  async login(identifier, password) {
    try {
      // Retrieve the user by identifier (username or email)
      const userRecord = await this.userRepository.findByUsernameOrEmail(
        identifier,
        identifier
      );

      if (!userRecord) {
        throw new Error("User not found");
      }

      if (!userRecord.password) {
        throw new Error("Password is missing for the user record");
      }

      console.log("Plaintext password:", password); //debug code
      console.log("Hashed password from DB:", userRecord.password); //debug code

      const isAuthenticated = await bcrypt.compare(
        password,
        userRecord.password
      );
      if (!isAuthenticated) {
        throw new Error("Invalid password");
      }

      return new User(
        userRecord.id,
        userRecord.username,
        userRecord.email,
        userRecord.password,
        userRecord.name,
        userRecord.role,
        userRecord.createdAt
      );
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  }

  // Find a user by username or email
  async findByUsernameOrEmail(username, email) {
    return await this.userRepository.findByUsernameOrEmail(username, email);
  }

  // Find user by Google ID or create a new one with tokens
  async findOrCreateByGoogleId(
    googleId,
    email,
    name,
    accessToken,
    refreshToken
  ) {
    return await this.userRepository.findOrCreateByGoogleId(
      googleId,
      email,
      name,
      accessToken,
      refreshToken
    );
  }

  //Find user by GitHub ID, or create a new one with tokens.
  async findOrCreateByGithubId(
    githubId,
    profileURL,
    name,
    accessToken,
    refreshToken
  ) {
    return await this.userRepository.findOrCreatebyGithubId(
      githubId,
      profileURL,
      name,
      accessToken,
      refreshToken
    );
  }

  async findOrCreatebyFacebookId(
    facebookid,
    email,
    name,
    accessToken,
    refreshToken
  ) {
    return await this.userRepository.findOrCreatebyFacebookId(
      facebookid,
      email,
      name,
      accessToken,
      refreshToken
    );
  }

  async findOrCreatebyLinkedInId(
    Linkedinid,
    email,
    name,
    accessToken,
    refreshToken
  ) {
    return await this.userRepository.findOrCreatebyLinkedInId(
      Linkedinid,
      email,
      name,
      accessToken,
      refreshToken
    );
  }

  // Find a user by their ID
  async findById(userId) {
    return await this.userRepository.findById(userId);
  }

  // Retrieve all users from the database with optional limit
  async getAllUsers(limit = 10) {
    return await this.userRepository.getAllUsers(limit);
  }

  // Method to update user profile
  async updateUserProfile(userId, updatedData) {
    return await this.userRepository.updateUserProfile(userId, updatedData);
  }

  // Save the user code for password reset
  async saveUserCode(email, usercode, expiryTime) {
    return await this.userRepository.saveUserCode(email, usercode, expiryTime);
  }

  // Verify the user code for password reset
  async verifyUserCode(email, usercode) {
    const user = await this.userRepository.findByEmailAndCode(email, usercode);
    if (!user) {
      throw new Error("Invalid or expired code");
    }
    return user;
  }

  // Update the user's password
  async updateUserPassword(userId, newPassword) {
    console.log("Attempting to update password for userId:", userId); //debug code
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    return await this.userRepository.updateUserPassword(userId, hashedPassword);
  }

  async updateResetCodeLastSent(email) {
    return await this.userRepository.updateResetCodeLastSent(email);
  }
}

module.exports = UserService;
