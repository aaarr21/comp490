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
           console.log(newColumn);
           await this.taskRepository.createColumn(newColumn);
           return newColumn;
     }

     async findorCreateTask(taskTitle, taskDate, taskAttachment, taskperson, taskCreator, status, column){
        return await TaskRepository.findorCreateTask(taskTitle, taskDate, taskAttachment, taskperson, taskCreator, status, column)
     }

     async deleteColumn(columnName, columnAsg,columnColor,creator){
        return await TaskRepository.deleteColumn(columnName,columnAsg, columnColor, creator)
     }
}

module.exports = TaskService;