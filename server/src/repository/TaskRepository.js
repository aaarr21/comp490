const db = require("../config/db");

class TaskRepository {
  async createColumn(column) {
    try {
      console.log("Creating column with values:", {
        title: column.title,
        columnAsg: column.columnAsg,
        color: column.color,
        creator: column.creator,
      });

      // Optionally, you can check for duplicate columnAsg here:
      const [existing] = await db.query(
        "SELECT * FROM columns WHERE columnAsg = ?",
        [column.columnAsg]
      );
      if (existing.length > 0) {
        throw new Error("A column with this slug already exists.");
      }

      const [result] = await db.query(
        "INSERT INTO columns (title, columnAsg, color, creator) VALUES (?, ?, ?, ?)",
        [column.title, column.columnAsg, column.color, column.creator]
      );
      console.log("Column created, insertId:", result.insertId);
      return result.insertId;
    } catch (error) {
      console.error("Error adding new column:", error);
      throw new Error("Column creation failed: " + error.message);
    }
  }

  async createTask(task) {
    try {
      const [result] = await db.query(
        "INSERT INTO tasks (creator, title, status, assigned, date, columnId) VALUES (?,?,?,?,?,?)",
        [
          task.creator,
          task.title,
          task.status,
          task.assigned,
          task.date,
          task.columnId,
        ]
      );
      return result.insertId;
    } catch (error) {
      console.error("Error adding new task", error);
      throw error;
    }
  }

  async updateStatus(cardId, newStatus) {
    console.log("Updating status " + cardId + " new status: " + newStatus);
    try {
      const [result] = await db.query(
        "UPDATE tasks SET status = ? WHERE id = ?",
        [newStatus, cardId]
      );
      console.log(result);
      return result;
    } catch (error) {
      console.error("Error updating task status", error);
      throw error;
    }
  }

  async updateTitle(cardId, newTitle) {
    try {
      const [result] = await db.query(
        "UPDATE tasks SET title = ? WHERE id = ?",
        [newTitle, cardId]
      );
      console.log(result);
      return result;
    } catch (error) {
      console.error("Error updating task title", error);
      throw error;
    }
  }

  async swapColumns(cardId, columnId) {
    try {
      const [result] = await db.query(
        "UPDATE tasks SET columnId = ? WHERE id = ?",
        [columnId, cardId]
      );
      console.log(result);
      return result;
    } catch (error) {
      console.error("Error swapping columns", error);
      throw new Error("Task Not Found");
    }
  }

  async deleteTask(cardId) {
    const [rows] = await db.query("SELECT * FROM tasks WHERE id = ?", [cardId]);
    if (rows.length === 0) {
      throw new Error("Task Not Found");
    }

    try {
      const [result] = await db.query("DELETE FROM tasks WHERE id = ?", [
        cardId,
      ]);
      console.log(result);
      return result;
    } catch (error) {
      console.error("Error deleting task", error);
      throw new Error("Unable to delete Task");
    }
  }

  async deleteColumn(columnId, creator) {
    try {
      // First check if column exists
      const [columnRows] = await db.query(
        "SELECT creator FROM columns WHERE columnAsg = ?",
        [columnId]
      );

      if (columnRows.length === 0) {
        throw new Error("Column not found");
      }

      // Check if column has any incomplete tasks (compare status case-insensitively)
      const [taskRows] = await db.query(
        "SELECT COUNT(*) as taskCount FROM tasks WHERE columnId = ? AND UPPER(status) != 'COMPLETED'",
        [columnId]
      );

      if (taskRows[0].taskCount > 0) {
        throw new Error("Cannot delete column with incomplete tasks");
      }

      // Delete the column
      const [result] = await db.query(
        "DELETE FROM columns WHERE columnAsg = ?",
        [columnId]
      );

      return result;
    } catch (error) {
      console.error("Error deleting column", error);
      throw error;
    }
  }

  /**
   * Get all tasks
   * @returns {Promise<Array>} Array of task objects
   */
  async getAllTasks() {
    try {
      const [rows] = await db.query(
        "SELECT id, title, creator, assigned, columnId, status, date FROM tasks"
      );
      return rows;
    } catch (error) {
      console.error("Error getting all tasks", error);
      throw error;
    }
  }

  /**
   * Get tasks created by or assigned to a specific user
   * @param {number|string} userId - User ID or username
   * @returns {Promise<Array>} Array of task objects
   */
  async getTasksByUser(userId) {
    try {
      const [rows] = await db.query(
        "SELECT id, title, creator, assigned, columnId, status, date FROM tasks WHERE creator = ? OR assigned LIKE ?",
        [userId, `%${userId}%`]
      );
      return rows;
    } catch (error) {
      console.error(`Error getting tasks for user ${userId}`, error);
      throw error;
    }
  }

  /**
   * Get tasks assigned to a specific user
   * @param {string} username - Username
   * @returns {Promise<Array>} Array of task objects
   */
  async getTasksByAssigned(username) {
    try {
      const [rows] = await db.query(
        "SELECT id, title, creator, assigned, columnId, status, date FROM tasks WHERE assigned LIKE ?",
        [`%${username}%`]
      );
      return rows;
    } catch (error) {
      console.error(`Error getting tasks for assigned user ${username}`, error);
      throw error;
    }
  }

  async getAllGoals() {
    try {
      const [rows] = await db.query(
        "SELECT title, columnAsg, color, creator FROM columns"
      );
      return rows;
    } catch (error) {
      console.error("Error getting all goals/columns", error);
      throw error;
    }
  }
}

module.exports = TaskRepository;
