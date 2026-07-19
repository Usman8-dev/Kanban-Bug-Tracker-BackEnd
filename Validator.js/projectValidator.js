const { body } = require('express-validator');

exports.Create_Project_validator = [
    body('name')
        .trim()
        .notEmpty().withMessage('Name is required')
        .isLength({ min: 2, max: 20 }).withMessage('Name must be between 2 and 20 characters'),
        
    body('description')
        .optional({ checkFalsy: true })
        .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
        
];
