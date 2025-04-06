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

     async createTask (task) {
       try{
        const [result] = await db.query(
            "INSERT INTO tasks (creator, title, status, assigned, date, columnId) VALUES (?,?,?,?,?,?)",
             [task.creator,task.title,task.status,task.assigned,task.date,task.column]
         );
         return result.insertId;
       }catch(error){
        console.error("Error adding new task", error);
        throw error;
       }
     }

     async findOrCreateTask (){

     }

     async updateDate (){

     }

     async deleteTask (cardId) {
        
        const [rows] = await db.query(`SELECT * FROM tasks where id =  ?`,[cardId]); // is it this?
        console.log(rows);
        if(rows.length === 0)
            throw new Error("Task Not Found");

        try {
            const [result] = await db.query(`DELETE FROM tasks WHERE id = ?`,[cardId]);
            console.log(result);
            return result;
        }catch(error){
             throw new Error("Unable to delete Task");
        }
     }

     async deleteColumn () {
        
     }


     async updateStatus(taskTitle, oldStatus, newStatus) {

     }

     async getAllTasks(){
        try{
            const [rows] = await db.query("SELECT id, title, creator, assigned, columnId, status, date FROM tasks"); // Get all of the board columns.
            return rows;
         }catch(error){
            throw error;
         }
     }

     async getAllGoals(){
         try{
            const [rows] = await db.query("SELECT title, columnAsg, color, creator FROM columns"); // Get all of the board columns.
            return rows;
         }catch(error){
            throw error;
         }
     }
}



module.exports = TaskRepository;