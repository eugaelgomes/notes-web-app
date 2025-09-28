const { body } = require("express-validator");

const dataValidator = () => {
  return [
    body("name")
      .trim()
      .matches(/^[\p{L}\s]+$/u).withMessage("Apenas letras e espaços são permitidos.")
      .isLength({ min: 1, max: 100 }).withMessage("Name cannot be empty or too long.")
      .escape(),

    body("username")
      .trim()
      .matches(/^[a-zA-Z0-9._-]+$/)
      .withMessage("Invalid characters, only letters, numbers, ., - or _ are allowed.")
      .isLength({ min: 6, max: 18 })
      .withMessage("Username must be between 6 and 18 characters.")
      .escape(),

    body("email")
      .isEmail().withMessage("Email is invalid."),

    body("password")
      .isStrongPassword({
        minLength: 6,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        //minSymbols: 1,
      })
      .withMessage("Password must contain at least 8 characters, including uppercase, lowercase and numbers."),
  ];
};

module.exports = dataValidator;
