const Task = require('../models/Task');
const Column = require('../models/Column');
const multer = require('multer');
const TaskService = require('../services/TaskService');
const taskService = new TaskService();


const createNewTask = async (req,res) => {
   
    try{
         let attachment = req.file;
         const newTask = new Task(req.body.people, req.body.date,req.body.textPart,attachment,req.body.column);
         console.log(newTask);
    }catch(error){
      return  res.status(500).json({error: 'Something went Wrong'});
    }
    return res.status(201).json({test: 'displaying in backend the task data received.'});
      
};

const createGoal = async (req,res) => {
    const {column, columnName, color, loggedInUser } = req.body;
     console.log(column);
     if(!column || !columnName || !color || !loggedInUser)
        return res.status(401).json({error: "At least one field is missing"});

    try{    

       const newColumn = await taskService.registerColumn( columnName, column, color, loggedInUser);
       res.status(201).json({ message: 'Goal Created', newColumn }); 
    }catch(error){
         return res.status(500).json({error: "Something went Wrong"});
    }

};



module.exports = {
    createNewTask,
    createGoal,
};