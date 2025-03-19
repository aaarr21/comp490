const Task = require('../models/Task');
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



module.exports = {
    createNewTask,
};