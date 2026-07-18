const express = require('express');
const router = express.Router();
const {RegisterUser, LoginUser, LogoutUser} = require('../Controllers/AuthController')


router.get('/', function (req, res) {
    res.send('Hello, I am working');
});
router.post('/register', RegisterUser);
router.post('/login',  LoginUser);
router.post('/logout', LogoutUser);



module.exports = router;