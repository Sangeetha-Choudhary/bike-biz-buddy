import { body, param, query, validationResult } from 'express-validator';

// User creation validation
export const validateCreateUser = [
    body('username')
        .trim()
        .notEmpty().withMessage('Username is required'),
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail({ allow_utf8_local_part: false, require_tld: true }) //ensuring use should not apply with domain other then (.com , .in ) and require TLD means not use of any unusual character
        .withMessage('Invalid email address')   
        .normalizeEmail(),   // //it should always be in lower case
    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
        // .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).+$/)   //it should have at least one uppercase, one lowercase, and one special character
        // .withMessage('Password must contain at least one uppercase, one lowercase, and one special character'),
    body('role')
        .notEmpty().withMessage('Role is required')
        .isIn(['global_admin', 'store_admin', 'sales_executive', 'procurement_admin', 'procurement_executive'])
        .withMessage('Invalid role'),
    body('store')
        .optional()
        .isMongoId().withMessage('Store must be a valid ID'),
    body('phone')
        .trim()
        .notEmpty().withMessage('Phone number is required')
        .matches(/^\+91[1-9][0-9]{9}$/).withMessage('Invalid phone number'),     //phone number should have country code +91 and 10 digits not starting with 0
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
