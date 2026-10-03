const { body, param, query } = require('express-validator');

// Common validation chains based on PDF assessment specifications
const nameValidator = body('name')
  .trim()
  .notEmpty().withMessage('Name is required')
  .isLength({ min: 20, max: 60 }).withMessage('Name must be between 20 and 60 characters');

const emailValidator = body('email')
  .trim()
  .notEmpty().withMessage('Email is required')
  .isEmail().withMessage('Must follow standard email validation rules')
  .normalizeEmail();

const passwordValidator = body('password')
  .notEmpty().withMessage('Password is required')
  .isLength({ min: 8, max: 16 }).withMessage('Password must be 8-16 characters')
  .matches(/[A-Z]/).withMessage('Password must include at least one uppercase letter')
  .matches(/[!@#$%^&*(),.?":{}|<>_\-\+\=\[\]\/\\]/).withMessage('Password must include at least one special character');

const addressValidator = body('address')
  .trim()
  .notEmpty().withMessage('Address is required')
  .isLength({ max: 400 }).withMessage('Address can be max 400 characters');

const roleValidator = body('role')
  .optional()
  .isIn(['SYSTEM_ADMIN', 'NORMAL_USER', 'STORE_OWNER'])
  .withMessage('Role must be SYSTEM_ADMIN, NORMAL_USER, or STORE_OWNER');

const ratingValueValidator = body('rating')
  .notEmpty().withMessage('Rating is required')
  .isInt({ min: 1, max: 5 }).withMessage('Rating must be an integer between 1 and 5');

// Route specific validation rule arrays
const signupValidation = [
  nameValidator,
  emailValidator,
  passwordValidator,
  addressValidator
];

const loginValidation = [
  body('email').trim().notEmpty().withMessage('Email is required').isEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password is required')
];

const changePasswordValidation = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .notEmpty().withMessage('New password is required')
    .isLength({ min: 8, max: 16 }).withMessage('New password must be 8-16 characters')
    .matches(/[A-Z]/).withMessage('New password must include at least one uppercase letter')
    .matches(/[!@#$%^&*(),.?":{}|<>_\-\+\=\[\]\/\\]/).withMessage('New password must include at least one special character')
];

const addUserByAdminValidation = [
  nameValidator,
  emailValidator,
  passwordValidator,
  addressValidator,
  body('role')
    .notEmpty().withMessage('Role is required')
    .isIn(['SYSTEM_ADMIN', 'NORMAL_USER', 'STORE_OWNER'])
    .withMessage('Role must be SYSTEM_ADMIN, NORMAL_USER, or STORE_OWNER')
];

const addStoreValidation = [
  nameValidator,
  emailValidator,
  addressValidator,
  body('owner_id').optional({ nullable: true }).isInt().withMessage('Owner ID must be an integer')
];

const submitRatingValidation = [
  ratingValueValidator
];

module.exports = {
  signupValidation,
  loginValidation,
  changePasswordValidation,
  addUserByAdminValidation,
  addStoreValidation,
  submitRatingValidation
};
