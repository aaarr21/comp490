


const createNewTask = async (req,res) => {
    
    console.log(JSON.stringify(req.body));
     const {person, texttoPass, taskDate, files} = req.body;
     console.log("New Task acquired!\n" + person + " " + taskDate + "  " + " " + files + texttoPass);
    try{
       let newTask = new Task(person ,taskDate,texttoPass,files);
       
      res.status(201).json({message: 'Task Created!', newTask});
    } catch(error){
        console.log('Error during task intilization', error);
        res.status(401).json({error: 'task creation failed'});
    }
     
    
};