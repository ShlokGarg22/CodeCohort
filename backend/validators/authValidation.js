const { z } = require('zod');

// Signup validation schema
const signupSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must not exceed 30 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  
  email: z
    .string()
    .email('Invalid email address')
    .toLowerCase(),
  
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  fullName: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(50, 'Full name must not exceed 50 characters')
    .trim()
});

// Signin validation schema
const signinSchema = z.object({
  email: z
    .string()
    .email('Invalid email address')
    .toLowerCase(),
  
  password: z
    .string()
    .min(1, 'Password is required')
});

// Update profile validation schema
const updateProfileSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must not exceed 30 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
    .optional(),
  
  fullName: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(50, 'Full name must not exceed 50 characters')
    .trim()
    .optional(),
  
  profileImage: z
    .string()
    .url('Invalid URL format')
    .optional()
});

module.exports = {
  signupSchema,
  signinSchema,
  updateProfileSchema
};
