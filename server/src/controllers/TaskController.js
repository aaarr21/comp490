const Task = require('../models/Task');
const multer = require('multer');


const createNewTask = async (req,res) => {
    //To Be Done.
    console.log(JSON.stringify(req.body));
    console.log(JSON.stringify(req.files));
    res.status(201).json({test: 'displaying in backend the task data received.'})
      
};



module.exports = {
    createNewTask
};