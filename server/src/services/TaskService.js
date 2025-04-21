// Enhanced TaskService.js with RBAC integration

const db = require("../config/db");
const User = require("../models/User");
const UserRepository = require("../repository/UserRepository");
const Task = require("../models/Task");
const Column = require("../models/Column");
const TaskRepository = require("../repository/TaskRepository");
const rbacService = require("../services/RBACService");

class TaskService {
  constructor() {
    this.taskRepository = new TaskRepository();
  }

  async registerColumn(columnName, columnAsg, columnColor, creator) {
    const newColumn = new Column(columnName, columnAsg, columnColor, creator);
    await this.taskRepository.createColumn(newColumn);
    return newColumn;
  }

  async registerTask(textPart, date, assigned, column, creator) {
    const newTask = new Task(textPart, date, assigned, column, creator);
    const id = await this.taskRepository.createTask(newTask);
    const taskWithId = { ...newTask, id: id };
    return taskWithId;
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
