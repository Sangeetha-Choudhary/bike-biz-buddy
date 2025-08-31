import { body, param, query, validationResult } from 'express-validator';

// Password strength validation
const validatePasswordStrength = (value) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(value);
  const hasLowerCase = /[a-z]/.test(value);
  const hasNumbers = /\d/.test(value);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value);

  if (value.length < minLength) {
    throw new Error(`Password must be at least ${minLength} characters long`);
  }
  if (!hasUpperCase) {
    throw new Error('Password must contain at least one uppercase letter');
  }
  if (!hasLowerCase) {
    throw new Error('Password must contain at least one lowercase letter');
  }
  if (!hasNumbers) {
    throw new Error('Password must contain at least one number');
  }
  if (!hasSpecialChar) {
    throw new Error('Password must contain at least one special character');
  }

  return true;
};

// Phone number validation with international format support
const validatePhoneNumber = (value) => {
  // International format: +[country code][number] or just [number]
  const phoneRegex = /^(\+?[1-9]\d{1,14}|\d{10,15})$/;

  if (!phoneRegex.test(value)) {
    throw new Error(
      'Please provide a valid phone number (international format supported)'
    );
  }

  return true;
};

// Email validation with additional security checks
const validateEmail = (value) => {
  // Basic email format
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    throw new Error('Please provide a valid email address');
  }

  // Check for suspicious patterns
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /vbscript:/i,
    /onload/i,
    /onerror/i,
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(value)) {
      throw new Error('Email contains invalid characters');
    }
  }

  return true;
};

// User creation validation with enhanced security
export const validateCreateUser = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be between 3 and 50 characters')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage(
      'Username can only contain letters, numbers, underscores, and hyphens'
    )
    .notEmpty()
    .withMessage('Username is required'),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .custom(validateEmail),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .custom(validatePasswordStrength),

  body('role')
    .isIn([
      'global_admin',
      'store_admin',
      'sales_executive',
      'procurement_admin',
      'procurement_executive',
    ])
    .withMessage('Invalid role'),

  body('phone').optional().custom(validatePhoneNumber),

  body('store').optional().isMongoId().withMessage('Invalid store ID format'),

  body('department')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Department must be less than 100 characters'),

  body('city')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('City must be less than 100 characters'),
];

// User login validation with enhanced security
export const validateLoginUser = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .custom(validateEmail),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 1 })
    .withMessage('Password cannot be empty'),
];

// Password change validation
export const validatePasswordChange = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),

  body('newPassword')
    .notEmpty()
    .withMessage('New password is required')
    .custom(validatePasswordStrength),

  body('confirmPassword')
    .notEmpty()
    .withMessage('Password confirmation is required')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Password confirmation does not match');
      }
      return true;
    }),
];

// Password reset request validation
export const validatePasswordResetRequest = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .custom(validateEmail),
];

// Password reset validation
export const validatePasswordReset = [
  body('token').notEmpty().withMessage('Reset token is required'),

  body('newPassword')
    .notEmpty()
    .withMessage('New password is required')
    .custom(validatePasswordStrength),

  body('confirmPassword')
    .notEmpty()
    .withMessage('Password confirmation is required')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Password confirmation does not match');
      }
      return true;
    }),
];

// Store creation validation with enhanced security
export const validateCreateStore = [
  body('storename')
    .trim()
    .notEmpty()
    .withMessage('Store name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Store name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z0-9\s\-_&.()]+$/)
    .withMessage('Store name contains invalid characters'),

  body('address')
    .trim()
    .notEmpty()
    .withMessage('Address is required')
    .isLength({ min: 10, max: 500 })
    .withMessage('Address must be between 10 and 500 characters'),

  body('googlemaplink')
    .optional()
    .trim()
    .isURL()
    .withMessage('Google Maps link must be a valid URL'),

  body('city')
    .trim()
    .notEmpty()
    .withMessage('City is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('City must be between 2 and 100 characters'),

  body('latitude')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be a valid number between -90 and 90'),

  body('longitude')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be a valid number between -180 and 180'),

  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .custom(validatePhoneNumber),

  body('whatsapp')
    .trim()
    .notEmpty()
    .withMessage('WhatsApp number is required')
    .custom(validatePhoneNumber),

  body('state')
    .trim()
    .notEmpty()
    .withMessage('State is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('State must be between 2 and 100 characters'),

  body('storeemail')
    .trim()
    .notEmpty()
    .withMessage('Store email is required')
    .custom(validateEmail),

  body('pancard')
    .optional()
    .trim()
    .matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/)
    .withMessage('PAN card must be in valid format (e.g., ABCDE1234F)'),

  body('gstnumber')
    .optional()
    .trim()
    .matches(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/)
    .withMessage('GST number must be in valid format'),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .custom(validatePasswordStrength),
];

// Store update validation with enhanced security
export const validateUpdateStore = [
  body('storename')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Store name cannot be empty')
    .isLength({ min: 2, max: 100 })
    .withMessage('Store name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z0-9\s\-_&.()]+$/)
    .withMessage('Store name contains invalid characters'),

  body('address')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Address cannot be empty')
    .isLength({ min: 10, max: 500 })
    .withMessage('Address must be between 10 and 500 characters'),

  body('googlemaplink')
    .optional()
    .trim()
    .isURL()
    .withMessage('Google Maps link must be a valid URL'),

  body('city')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('City cannot be empty')
    .isLength({ min: 2, max: 100 })
    .withMessage('City must be between 2 and 100 characters'),

  body('latitude')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be a valid number between -90 and 90'),

  body('longitude')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be a valid number between -180 and 180'),

  body('phone').optional().trim().custom(validatePhoneNumber),

  body('whatsapp').optional().trim().custom(validatePhoneNumber),

  body('state')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('State cannot be empty')
    .isLength({ min: 2, max: 100 })
    .withMessage('State must be between 2 and 100 characters'),

  body('storeemail').optional().trim().custom(validateEmail),

  body('pancard')
    .optional()
    .trim()
    .matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/)
    .withMessage('PAN card must be in valid format (e.g., ABCDE1234F)'),

  body('gstnumber')
    .optional()
    .trim()
    .matches(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/)
    .withMessage('GST number must be in valid format'),

  body('status')
    .optional()
    .isIn(['active', 'inactive'])
    .withMessage('Status must be either active or inactive'),
];

// Generic ID validation
export const validateId = [
  param('id').isMongoId().withMessage('Invalid ID format'),
];

// Search and filter validation
export const validateSearchParams = [
  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Search term must be less than 100 characters'),

  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),

  query('sort')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort must be either asc or desc'),
];

// Validation result handler with enhanced error formatting
export const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Format validation errors for better UX
    const formattedErrors = errors.array().map((error) => ({
      field: error.path,
      message: error.msg,
      value: error.value,
      location: error.location,
    }));

    return res.status(400).json({
      success: false,
      error: {
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: formattedErrors,
      },
    });
  }
  next();
};
