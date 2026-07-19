const express = require('express');
const app = express();
const devenv = require('dotenv').config();
const cookieParser = require('cookie-parser');

// Models 
const UserModel = require('./Models/UserModel')
const ProjectModel = require('./Models/ProjectModel')

// database 
const db = require('./Config/connection-mongoose')

// Routers 
const userRouter = require('./Routers/UserRouter')
const projectRouter = require('./Routers/ProjectRouter')


app.use(express.json());                    
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/user', userRouter);
app.use('/project', projectRouter);


app.listen(3000, ()=>{
    console.log('server is running');  
});