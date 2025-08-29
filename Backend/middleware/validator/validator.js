import { body, param, query, validationResult } from 'express-validator';

// User creation validation
export const validateCreateUser = [
    body('username')
        .notEmpty().withMessage('Username is required'),
    body('email')
        .isEmail().withMessage('Please provide a valid email'),
    body('password')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('role')
        .isIn(['global_admin', 'store_admin', 'sales_executive', 'procurement_admin', 'procurement_executive'])
        .withMessage('Invalid role'),
    body('phone')
        .optional()
        .custom(value => {
            if (!value) return true;
            // Either allow international format or just digits
            if (/^\+\d{1,4}\d{10}$/.test(value) || /^\d{10}$/.test(value)) {
                return true;
            }
            throw new Error('Invalid phone number');
        }),
    body('store')
        .optional(),
    body('department')
        .optional(),
    body('city')
        .optional(),
];

// User login validation
export const validateLoginUser = [
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Invalid email address'),
    body('password')
        .notEmpty().withMessage('Password is required'),
];

// Store creation validation
export const validateCreateStore = [
    body('storename')
        .trim()
        .notEmpty().withMessage('Store name is required'),
    body('address')
        .trim()
        .notEmpty().withMessage('Address is required'),
    body('googlemaplink')
        .trim()
        .optional(),
    body('city')
        .trim()
        .notEmpty().withMessage('City is required'),
    body('latitude')
        .optional()
        .isFloat().withMessage('Latitude must be a number'),
    body('longitude')
        .optional()
        .isFloat().withMessage('Longitude must be a number'),
    body('phone')
        .trim()
        .notEmpty().withMessage('Phone number is required')
        .matches(/^\+?[0-9]{10,15}$/).withMessage('Invalid phone number'),
    body('whatsapp')
        .trim()
        .notEmpty().withMessage('WhatsApp number is required'),
    body('state')
        .trim()
        .notEmpty().withMessage('State is required'),
    body('storeemail')
        .trim()
        .notEmpty().withMessage('Store email is required')
        .isEmail().withMessage('Invalid store email'),
    body('pancard')
        .trim()
        .optional(),
    body('gstnumber')
        .trim()
        .optional(),
    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

// Store update validation
export const validateUpdateStore = [
    body('storename')
        .optional()
        .trim()
        .notEmpty().withMessage('Store name cannot be empty'),
    body('address')
        .optional()
        .trim()
        .notEmpty().withMessage('Address cannot be empty'),
    body('googlemaplink')
        .optional()
        .trim(),
    body('city')
        .optional()
        .trim()
        .notEmpty().withMessage('City cannot be empty'),
    body('latitude')
        .optional()
        .isFloat().withMessage('Latitude must be a number'),
    body('longitude')
        .optional()
        .isFloat().withMessage('Longitude must be a number'),
    body('phone')
        .optional()
        .trim()
        .matches(/^\+?[0-9]{10,15}$/).withMessage('Invalid phone number'),
    body('whatsapp')
        .optional()
        .trim(),
    body('state')
        .optional()
        .trim()
        .notEmpty().withMessage('State cannot be empty'),
    body('storeemail')
        .optional()
        .trim()
        .isEmail().withMessage('Invalid store email'),
    body('pancard')
        .optional()
        .trim(),
    body('gstnumber')
        .optional()
        .trim(),
    body('status')
        .optional()
        .isIn(['active', 'inactive']).withMessage('Status must be either active or inactive'),
];

// Validation result handler
export const handleValidation = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};
