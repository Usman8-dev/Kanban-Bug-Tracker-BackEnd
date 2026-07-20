const express = require("express");
const router = express.Router();

const { IsLoginUser } = require("../Middlewares/IsLoginUser_Middleware");

const { validate } = require("../Middlewares/validate");
const { Create_Bug_validator } = require("../Validator.js/BugValidator");
const { Create,ShowAllBug , Update} = require("../Controllers/BugController");

router.get("/", function (req, res) {
    res.send("Bug tracker is running");
});
router.post("/create", IsLoginUser, Create_Bug_validator, validate, Create);
router.put("/update/:id", IsLoginUser, Update);
router.get("/AllBugs", IsLoginUser, ShowAllBug);
// router.get('/SearchProject/:name',IsLoginUser,Search );
// router.delete('/delete/:id', IsLoginUser, Delete);

module.exports = router;
