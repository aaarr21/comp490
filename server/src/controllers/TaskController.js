const Task = require('../models/Task');
const Column = require('../models/Column');
const multer = require('multer');
//const taskService = require('../services/TaskService');
//const taskservice = new taskService();


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
    try{
      const newColumn = new Column(req.body.columnName, req.body.columnName, req.body.color)
      console.log(newColumn)
    }catch(error){
         return res.status(500).json({error: "Something went Wrong"});
    }
    return res.status(201).json({test: "Received back end data"})
};



module.exports = {
    createNewTask,
    createGoal,
};