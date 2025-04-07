const User = require('../models/User');
const UserRepository = require('../repository/UserRepository');

const Task = require('../models/Task');
const Column = require('../models/Column');
const TaskRepository = require('../repository/TaskRepository');



//TBD, ignore this for now. This should honestly be removed because majority of task operations will be done in context of a user.

class TaskService {
    constructor(){
        this.taskRepository = new TaskRepository();
    }
     async registerColumn(columnName, columnAsg, columnColor, creator){

           const newColumn = new Column(columnName, columnAsg, columnColor, creator)
           
           await this.taskRepository.createColumn(newColumn);
           return newColumn;
     }

     async registerTask(textPart, date, assigned, column, creator){
       const newTask = new Task(textPart, date,assigned,column,creator);
        
        const id = await this.taskRepository.createTask(newTask);
        
        const taskWithId = {...newTask, id: id};
        
        return taskWithId;
     }

     async findorCreateTask(taskTitle, taskDate, taskAttachment, taskperson, taskCreator, status, column){
        return await TaskRepository.findorCreateTask(taskTitle, taskDate, taskAttachment, taskperson, taskCreator, status, column)
     }

     async deleteColumn(columnName, columnAsg,columnColor,creator){
        return await TaskRepository.deleteColumn(columnName,columnAsg, columnColor, creator);
     }

     async deleteTask(cardId){
       return await this.taskRepository.deleteTask(cardId);
     }

     async dragTaskEvent (cardId, columnId) {
       return await this.taskRepository.swapColumns(cardId, columnId);  
     }

     async updateTaskStatus (cardId, newStatus){
       return await this.taskRepository.updateStatus(cardId, newStatus);
     }

     async updateTaskTitle (cardId, newTitle){
       return await this.taskRepository.updateTitle(cardId, newTitle);
     }

     async getAllGoals(){
       return await this.taskRepository.getAllGoals();
     }

     async getAllTasks(){
      return await this.taskRepository.getAllTasks();
     }
}

module.exports = TaskService;