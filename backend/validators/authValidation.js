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
    .trim(),
  
  githubProfile: z
    .string()
    .url('Please provide a valid URL')
    .regex(/^https:\/\/github\.com\/[a-zA-Z0-9_-]+\/?$/, 'Please provide a valid GitHub profile URL (https://github.com/username)')
    .optional(),
  
  profileImage: z
    .string()
    .optional()
    .default(''),
  
  role: z
    .enum(['user', 'creator', 'admin'])
    .default('user')
    .optional()
}).refine((data) => {
  // GitHub profile is required for creators
  if (data.role === 'creator' && !data.githubProfile) {
    return false;
  }
  return true;
}, {
  message: "GitHub profile URL is required for creator accounts",
  path: ["githubProfile"]
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
    .optional(),

  githubProfile: z
    .string()
    .optional()
    .refine(
      (val) => {
        // Allow empty strings or valid GitHub URLs
        if (!val || val === '') return true;
        return /^https:\/\/github\.com\/[a-zA-Z0-9_-]+\/?$/.test(val);
      },
      {
        message: 'Please provide a valid GitHub profile URL (https://github.com/username) or leave it empty'
      }
    )
    .transform((val) => val === '' ? undefined : val)
});

module.exports = {
  signupSchema,
  signinSchema,
  updateProfileSchema
};
