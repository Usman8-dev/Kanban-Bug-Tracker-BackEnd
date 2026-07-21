const express = require('express');
const cors = require("cors");
const app = express();
const devenv = require('dotenv').config();
const cookieParser = require('cookie-parser');

// Models 
const UserModel = require('./Models/UserModel')
const ProjectModel = require('./Models/ProjectModel')
const BugModel = require('./Models/BugModel');

// database 
const db = require('./Config/connection-mongoose')

// Routers 
const userRouter = require('./Routers/UserRouter')
const projectRouter = require('./Routers/ProjectRouter');
const bugRouter = require('./Routers/BugRouter')

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());                    
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/user', userRouter);
app.use('/project', projectRouter);
app.use('/bug', bugRouter);


app.listen(3000, ()=>{
    console.log('server is running');  
});