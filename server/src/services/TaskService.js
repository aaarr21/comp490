// Enhanced TaskService.js with RBAC integration

const db = require("../config/db");
const User = require("../models/User");
const UserRepository = require("../repository/UserRepository");
const Task = require("../models/Task");
const Column = require("../models/Column");
const TaskRepository = require("../repository/TaskRepository");
const rbacService = require("../services/RBACService");
const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
const {getSignedUrl} = require("@aws-sdk/s3-request-presigner");

const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_KEY,
    },
});


class TaskService {
  constructor() {
    this.taskRepository = new TaskRepository();
  }

  async registerColumn(columnName, columnAsg, columnColor, creator) {
    const newColumn = new Column(columnName, columnAsg, columnColor, creator);
    await this.taskRepository.createColumn(newColumn);
    return newColumn;
  }

  async registerTask(textPart, date, assigned,attachment,column, creator) {
    const newTask = new Task(textPart, date, assigned,attachment, column, creator);
    const id = await this.taskRepository.createTask(newTask);
    if(attachment !== null){
      newTask.attachment = await this.generateURL(attachment);
    }
    const taskWithId = { ...newTask, id: id };
    return taskWithId;
  }


  async attachFile(cardId, fileKey) {
     await this.taskRepository.attachFile(cardId,fileKey);
     const key = await this.generateURL(fileKey);
     return key;
  }

  async deleteFile(cardId){
    await this.taskRepository.deleteFile(cardId);
  }

  //Generate a signedURL for task creation
  // Done so the immediate created task actually has a link to access the file.
  async generateURL(attachment) { 
     const command = new GetObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: attachment
     })
     const attached = await getSignedUrl(s3,command,{expiresIn: (3600 * 10)});
     return attached;
  }

  async deleteTask(cardId) {
    return await this.taskRepository.deleteTask(cardId);
  }

  async deleteColumn(columnId, userId) {
    return await this.taskRepository.deleteColumn(columnId, userId);
  }

  async dragTaskEvent(cardId, columnId) {
    return await this.taskRepository.swapColumns(cardId, columnId);
  }

  async updateTaskStatus(cardId, newStatus) {
    return await this.taskRepository.updateStatus(cardId, newStatus);
  }

  async updateTaskTitle(cardId, newTitle) {
    return await this.taskRepository.updateTitle(cardId, newTitle);
  }

  async getAllGoals() {
    return await this.taskRepository.getAllGoals();
  }

  async getAllTasks() {
    return await this.taskRepository.getAllTasks();
  }

  /**
   * Get tasks created by or assigned to a specific user
   * @param {number|string} userId - User ID
   * @returns {Promise<Array>} Array of task objects
   */
  async getTasksByUser(userId) {
    return await this.taskRepository.getTasksByUser(userId);
  }

  /**
   * Get tasks assigned to a specific user
   * @param {string} username - Username to check in 'assigned' field
   * @returns {Promise<Array>} Array of task objects
   */
  async getTasksByAssigned(username) {
    return await this.taskRepository.getTasksByAssigned(username);
  }

  // Check if a user has permission to perform an action on a task
  async checkTaskPermission(userId, taskId, action) {
    return await Task.checkPermission(userId, taskId, action);
  }

  // Get all tasks related to a column
  async getTasksByColumn(columnId) {
    try {
      const [rows] = await db.query(
        "SELECT id, title, creator, assigned, columnId, status, date FROM tasks WHERE columnId = ?",
        [columnId]
      );
      return rows;
    } catch (error) {
      console.error(`Error getting tasks for column ${columnId}`, error);
      throw error;
    }
  }

  // Check if column can be deleted (no incomplete tasks)
  async canDeleteColumn(columnId) {
    try {
      const tasks = await this.getTasksByColumn(columnId);
      return tasks.every((task) => task.status === "COMPLETED");
    } catch (error) {
      console.error(
        `Error checking if column ${columnId} can be deleted`,
        error
      );
      return false;
    }
  }
}

module.exports = TaskService;
