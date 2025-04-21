const Joi = require("joi");

// Schema for user registration
const registerSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid("admin", "user", "moderator").optional(),
});

// Schema for login validation
const loginSchema = Joi.object({
  identifier: Joi.string().required(), // identifier can be username or email
  password: Joi.string().required(),
  rememberMe: Joi.boolean().optional(), // Add rememberMe as an optional field
});

// Schema for verifying the reset code
const verifyResetCodeSchema = Joi.object({
  userEmail: Joi.string().email().required(),
  usercode: Joi.string().length(6).required(),
});

// Schema for user profile updates
const updateUserSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).optional(),
  email: Joi.string().email().optional(),
  name: Joi.string().optional(),
  role: Joi.string().valid("admin", "user", "moderator").optional(),
}).min(1); // At least one field must be provided for an update

module.exports = {
  registerSchema,
  loginSchema,
  verifyResetCodeSchema,
  updateUserSchema,
};
