const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const { body, validationResult } = require('express-validator');
const DOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');

// Create DOMPurify instance for server-side sanitization
const window = new JSDOM('').window;
const purify = DOMPurify(window);

// Rate limiting configurations
const createRateLimit = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      message: message || 'Too many requests, please try again later.'
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    handler: (req, res) => {
      res.status(429).json({
        success: false,
        message: message || 'Too many requests, please try again later.',
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }
  });
};

// Different rate limits for different endpoints
const rateLimits = {
  // General API rate limit
  general: createRateLimit(
    15 * 60 * 1000, // 15 minutes
    100, // limit each IP to 100 requests per windowMs
    'Too many API requests, please try again later.'
  ),

  // Stricter rate limit for authentication endpoints
  auth: createRateLimit(
    15 * 60 * 1000, // 15 minutes
    5, // limit each IP to 5 requests per windowMs
    'Too many authentication attempts, please try again later.'
  ),

  // Rate limit for chat/messaging
  chat: createRateLimit(
    1 * 60 * 1000, // 1 minute
    30, // limit each IP to 30 messages per minute
    'Too many messages, please slow down.'
  ),

  // Rate limit for problem creation
  problemCreation: createRateLimit(
    60 * 60 * 1000, // 1 hour
    10, // limit each IP to 10 problem creations per hour
    'Too many problems created, please try again later.'
  ),

  // Rate limit for team operations
  teamOperations: createRateLimit(
    10 * 60 * 1000, // 10 minutes
    20, // limit each IP to 20 team operations per 10 minutes
    'Too many team operations, please try again later.'
  )
};

// Input sanitization middleware
const sanitizeInput = (req, res, next) => {
  const sanitizeString = (str) => {
    if (typeof str !== 'string') return str;
    return purify.sanitize(str, { 
      ALLOWED_TAGS: [], // Remove all HTML tags
      ALLOWED_ATTR: [] // Remove all attributes
    });
  };

  const sanitizeObject = (obj) => {
    if (typeof obj !== 'object' || obj === null) return obj;
    
    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    }

    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        sanitized[key] = sanitizeString(value);
      } else if (typeof value === 'object') {
        sanitized[key] = sanitizeObject(value);
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  };

  // Sanitize request body
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }

  // Sanitize query parameters
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }

  // Sanitize URL parameters
  if (req.params) {
    req.params = sanitizeObject(req.params);
  }

  next();
};

// Validation error handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  next();
};

// Common validation rules
const validationRules = {
  // User registration/update validations
  userValidation: [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email address'),
    body('username')
      .isLength({ min: 3, max: 30 })
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('Username must be 3-30 characters and contain only letters, numbers, and underscores'),
    body('bio')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Bio must not exceed 500 characters')
  ],

  // Problem creation/update validations
  problemValidation: [
    body('title')
      .isLength({ min: 5, max: 100 })
      .withMessage('Title must be between 5 and 100 characters'),
    body('description')
      .isLength({ min: 20, max: 5000 })
      .withMessage('Description must be between 20 and 5000 characters'),
    body('difficulty')
      .isIn(['Easy', 'Medium', 'Hard'])
      .withMessage('Difficulty must be Easy, Medium, or Hard'),
    body('techStack')
      .isArray({ min: 1, max: 10 })
      .withMessage('Tech stack must be an array with 1-10 items'),
    body('maxTeamSize')
      .isInt({ min: 2, max: 10 })
      .withMessage('Max team size must be between 2 and 10')
  ],

  // Chat message validations
  messageValidation: [
    body('message')
      .isLength({ min: 1, max: 2000 })
      .withMessage('Message must be between 1 and 2000 characters'),
    body('teamId')
      .isMongoId()
      .withMessage('Invalid team ID')
  ],

  // Team operations validations
  teamValidation: [
    body('teamName')
      .optional()
      .isLength({ min: 3, max: 50 })
      .withMessage('Team name must be between 3 and 50 characters'),
    body('teamDescription')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Team description must not exceed 500 characters')
  ]
};

// Helmet configuration for security headers
const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "http:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "ws:", "wss:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false, // Disable for Socket.IO compatibility
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
});

module.exports = {
  rateLimits,
  sanitizeInput,
  handleValidationErrors,
  validationRules,
  helmetConfig
};
