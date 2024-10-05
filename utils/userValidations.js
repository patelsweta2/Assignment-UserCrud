const Joi = require("joi");

// Base validation schema for common fields
const userValidation = Joi.object({
  name: Joi.string().min(3).required().messages({
    "string.empty": "Name is required",
    "string.min": "Name must be at least 3 characters long",
  }),
});

const emailValidation = Joi.object({
  email: Joi.string().email().required().messages({
    "string.empty": "Email is required",
    "string.email": "Please enter a valid email address",
  }),
});

// Create User Validation Schema
const createUserValidation = Joi.object({
  name: Joi.string().min(3).required().messages({
    "string.empty": "Name is required",
    "string.min": "Name must be at least 3 characters long",
  }),
  email: Joi.string().email().required().messages({
    "string.empty": "Email is required",
    "string.email": "Please enter a valid email address",
  }),
  password: Joi.string().min(6).required().messages({
    "string.empty": "Password is required",
    "string.min": "Password must be at least 6 characters long",
  }),
  role: Joi.string().valid("user", "admin").required().messages({
    "string.empty": "Role is required",
    "any.only": "Role must be either 'user' or 'admin'",
  }),
});

module.exports = {
  userValidation,
  createUserValidation,
  emailValidation,
};
