const Task = require('../models/Task');
const Column = require('../models/Column');
const db = require('../config/db');

class TaskRepository{


    async findTask() {

    }

     async createColumn (column){
         try {
                     const [result] = await db.query(
                         "INSERT INTO columns ( title, columnAsg, color, creator ) VALUES (?, ?, ?, ?)", 
                         [column.columnTitle, column.column,column.color,column.creator]
                     );
                     return result.insertId;
                 } catch (error) {
                     console.error("Error adding new column:", error);
                     throw error;
                 }
     }

     async findOrCreateTask (){

     }

     async updateDate (){

     }

     async deleteTask () {

     }

     async deleteColumn () {
        
     }


     async updateStatus(taskTitle, oldStatus, newStatus) {

     }
}



module.exports = TaskRepository;