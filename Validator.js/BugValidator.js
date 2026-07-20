const { body } = require("express-validator");

exports.Create_Bug_validator = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ min: 2, max: 40 })
    .withMessage("Title must be between 2 and 40 characters"),

  body("description")
    .optional({ checkFalsy: true })
    .isLength({ max: 500 })
    .withMessage("Description cannot exceed 500 characters"),

  body("status").notEmpty().withMessage("Status is required"),

  body('priority').notEmpty().withMessage('Priority is required'),
];
