// Task.js
const db = require("../config/db");

class Task {
  constructor(title, date, assigned, column, creator) {
    this.title = title;
    this.date = date;
    this.assigned = assigned;
    this.status = "STARTED"; // Default status for new tasks
    this.columnId = column;
    this.creator = creator;
  }

  // Updated static method to check permission
  static async checkPermission(userId, taskId, action) {
    try {
      // First check if it's an admin user
      const [roleRows] = await db.query(
        `
        SELECT r.name 
        FROM roles r
        JOIN user_roles ur ON r.id = ur.role_id
        WHERE ur.user_id = ?
      `,
        [userId]
      );
      const isAdmin = roleRows.some(
        (role) => role.name.toLowerCase() === "admin"
      );
      if (isAdmin) {
        return true; // Admin can do anything
      }

      // Check if user has the basic permission (case-insensitive)
      const [permRows] = await db.query(
        `
        SELECT DISTINCT p.name 
        FROM permissions p
        JOIN role_permissions rp ON p.id = rp.permission_id
        JOIN user_roles ur ON rp.role_id = ur.role_id
        WHERE ur.user_id = ? AND LOWER(p.name) = LOWER(?)
      `,
        [userId, `task.${action}`]
      );

      const hasBasicPermission = permRows.length > 0;
      if (!hasBasicPermission) {
        return false;
      }

      // Check if user has the special "any" permission for this action (case-insensitive)
      const [anyPermRows] = await db.query(
        `
        SELECT DISTINCT p.name 
        FROM permissions p
        JOIN role_permissions rp ON p.id = rp.permission_id
        JOIN user_roles ur ON rp.role_id = ur.role_id
        WHERE ur.user_id = ? AND LOWER(p.name) = LOWER(?)
      `,
        [userId, `task.${action}.any`]
      );
      if (anyPermRows.length > 0) {
        return true; // User can perform this action on any task
      }

      // Finally, check if user is the creator of the task.
      const [taskRows] = await db.query(
        "SELECT creator FROM tasks WHERE id = ?",
        [taskId]
      );
      if (taskRows.length === 0) {
        return false; // Task not found
      }
      // Convert both values to trimmed strings and compare.
      const storedCreator = String(taskRows[0].creator).trim();
      const currentUserId = String(userId).trim();
      return storedCreator === currentUserId;
    } catch (error) {
      console.error("Error checking task permission:", error);
      return false; // Deny by default if an error occurs
    }
  }

  // Other helper methods remain unchanged
  async editDate(newDate) {
    this.date = newDate;
  }

  async setStatus(newStatus) {
    this.status = newStatus;
  }

  async editPerson(newPerson) {
    this.assigned = newPerson;
  }

  async editTitle(newTitle) {
    this.title = newTitle;
  }
}

module.exports = Task;
