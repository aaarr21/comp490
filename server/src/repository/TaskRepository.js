const Task = require('../models/Task');
const Column = require('../models/Column');
const db = require('../config/db');
const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
const {getSignedUrl} = require("@aws-sdk/s3-request-presigner");


const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_KEY,
    },
});

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
            "INSERT INTO tasks (creator, title, status, assigned, date,attachment, columnId) VALUES (?,?,?,?,?,?,?)",
             [task.creator,task.title,task.status,task.assigned,task.date,task.attachment,task.columnId]
         );
         console.log("Task Creation details:" + result);
         return result.insertId;
       }catch(error){
        console.error("Error adding new task", error);
        throw error;
       }
     }

     async updateStatus (cardId, newStatus) {
        console.log("Updating status "+ cardId + " new status: " + newStatus );
        try{
            const [result] = await db.query("UPDATE tasks SET status = ? WHERE id = ?", [newStatus, cardId]);
            console.log(result);
        }catch(error){
            console.error("Error updating task", error)
        }
     }

     async updateTitle (cardId, newTitle) {
        
        try{
            const [result] = await db.query("UPDATE tasks SET title = ? WHERE id = ?", [newTitle, cardId]);
            console.log(result);
        }catch(error){
            console.error("Error updating task", error)
        }
     }

     async swapColumns( cardId, columnId){
        try{
          const [result] = await db.query("UPDATE tasks SET columnId = ? WHERE id = ?", [columnId ,  cardId]);
          console.log(result);
          
        }catch(error){
            throw new Error("Task Not Found");
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



     async getAllTasks(){
        try{
            const [rows] = await db.query("SELECT id, title, creator, assigned, attachment, columnId, status, date FROM tasks"); // Get all of the board columns.
            
           //Promise.all to handle async operations, just to deal with generated signed urls.
            const generatedRows = await Promise.all(
                rows.map( async (row)=>{
                    if(row.attachment !== null){
                        
                           const command = new GetObjectCommand({
                              Bucket: process.env.S3_BUCKET_NAME,
                              Key: row.attachment
                           })
                       const generatedURL = await getSignedUrl(s3, command, 
                        {expiresIn: (3600 * 10)});
                        row.attachment = generatedURL;
                    }
                    return row;
               })
            )
           
            return generatedRows;
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