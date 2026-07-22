const express = require("express");
const router = express.Router();
const {
    Create,
    ShowAllProject,
    Update,
    Search,
    Delete,
    ShowSingle,
} = require("../Controllers/ProjectController");
const { IsLoginUser } = require("../Middlewares/IsLoginUser_Middleware");
const {
    Create_Project_validator,
} = require("../Validator.js/projectValidator");
const { validate } = require("../Middlewares/validate");

router.get("/", function (req, res) {
    res.send("Bug tracker is running");
});
router.post("/create", IsLoginUser, Create_Project_validator, validate, Create);
router.put("/update/:id", IsLoginUser, Create_Project_validator, validate, Update);
router.get("/show/:id", IsLoginUser, ShowSingle);
router.get("/AllProject", IsLoginUser, ShowAllProject);
router.get('/SearchProject/:name',IsLoginUser,Search );
router.delete('/delete/:id', IsLoginUser, Delete);

module.exports = router;
