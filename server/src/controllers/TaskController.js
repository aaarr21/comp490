const Task = require('../models/Task');
const Column = require('../models/Column');
const multer = require('multer');
const TaskService = require('../services/TaskService');
const taskService = new TaskService();


const createNewTask = async (req,res) => {
     
  const {textPart, date, assigned, column, creator} = req.body;
  if(!textPart || !date || !assigned || !column || !creator)
      return res.status(500).json({error: "Missing task field."})


    try{
        const newTask = await taskService.registerTask( textPart, date, assigned, column, creator);
        res.status(201).json({newTask});
         //let attachment = req.file;
         
    }catch(error){
      return  res.status(500).json({error: 'Failed Registeration'});
    }
  //  return res.status(201).json({test: 'displaying in backend the task data received.'});
      
};

const createGoal = async (req,res) => {
    const {columnName, column, color, loggedInUser } = req.body;
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

const getAllGoals = async (req,res) => {
       try{
           const columns = await taskService.getAllGoals();
           res.status(200).json(columns);
       }catch(error){
        return res.status(500).json({error})
       }
}


const getAllTasks = async (req,res) => {
  try{
     const tasks = await taskService.getAllTasks();
     res.status(200).json(tasks);
  }catch(error){
    return res.status(500).json({error: "failed to retrive tasks"})
  }
}

const deleteTask = async (req,res) => {
  
    const {cardId} = req.query;
   
  try{
       await taskService.deleteTask(cardId);
       return res.status(201).json({msg : "Successfully deleted task!"})
  }catch(error){
    res.status(500).json({error: error})
  }
}

module.exports = {
    createNewTask,
    createGoal,
    getAllGoals,
    getAllTasks,
    deleteTask
};