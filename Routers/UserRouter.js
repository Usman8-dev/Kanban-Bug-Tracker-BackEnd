const express = require('express');
const router = express.Router();
const {RegisterUser} = require('../Controllers/AuthController')


router.get('/', function (req, res) {
    res.send('Hello, I am working');
});
router.post('/register', RegisterUser);
// router.post('/login', loginValidator, validate, LoginUser);
// router.post('/logout', LogoutUser);



module.exports = router;