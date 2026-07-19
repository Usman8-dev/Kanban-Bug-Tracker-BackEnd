const express = require('express');
const router = express.Router();
const {Create} = require('../Controllers/ProjectController')
const {IsLoginUser} = require('../Middlewares/IsLoginUser_Middleware');
const { Create_Project_validator } = require('../Validator.js/projectValidator');
const { validate } = require('../Middlewares/validate');




router.get('/', function (req, res) {
    res.send('Bug tracker is running')
})
router.post('/create',IsLoginUser, Create_Project_validator, validate, Create);
// router.put('/update/:id');
// router.get('/AllExpense');
// router.get('/SearchExpense/:title', );
// router.delete('/delete/:id');


module.exports = router;