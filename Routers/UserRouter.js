const express = require("express");
const router = express.Router();
const {
  RegisterUser,
  LoginUser,
  LogoutUser,
  GetAllUsers,
} = require("../Controllers/AuthController");
const {
  loginValidator,
  RegisterValidator,
} = require("../Validator.js/authValidator");
const { validate } = require("../Middlewares/validate");

router.get("/", function (req, res) {
  res.send("Hello, I am working");
});
router.post("/register",RegisterValidator, validate, RegisterUser);
router.post("/login", loginValidator, validate, LoginUser);
router.get("/alluser", GetAllUsers);
router.post("/logout", LogoutUser);

module.exports = router;
