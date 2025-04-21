// services/RBACService.js
const db = require("../config/db");

class RBACService {
  constructor() {
    // Cache for permissions to avoid frequent DB lookups
    this.permissionCache = {};
    this.cacheExpiry = null;
    this.CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Get all roles in the system
   * @returns {Promise<Array>} Array of role objects
   */
  async getAllRoles() {
    try {
      const [rows] = await db.query("SELECT * FROM roles ORDER BY name");
      return rows;
    } catch (error) {
      console.error("[getAllRoles]: Error fetching roles:", error);
      throw error;
    }
  }

  /**
   * Get a role by ID
   * @param {number} roleId - Role ID
   * @returns {Promise<Object>} Role object
   */
  async getRoleById(roleId) {
    try {
      const [rows] = await db.query("SELECT * FROM roles WHERE id = ?", [
        roleId,
      ]);
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error(`[getRoleById]: Error fetching role ${roleId}:`, error);
      throw error;
    }
  }

  /**
   * Get all permissions in the system, optionally filtered by category
   * @param {string} category - Optional category filter
   * @returns {Promise<Array>} Array of permission objects
   */
  async getAllPermissions(category = null) {
    try {
      let query = "SELECT * FROM permissions";
      const params = [];

      if (category) {
        query += " WHERE category = ?";
        params.push(category);
      }

      query += " ORDER BY category, name";

      const [rows] = await db.query(query, params);
      return rows;
    } catch (error) {
      console.error("[getAllPermissions]: Error fetching permissions:", error);
      throw error;
    }
  }

  /**
   * Get permissions for a specific role
   * @param {number} roleId - Role ID
   * @returns {Promise<Array>} Array of permission objects
   */
  async getRolePermissions(roleId) {
    try {
      const [rows] = await db.query(
        `
                SELECT p.* 
                FROM permissions p
                JOIN role_permissions rp ON p.id = rp.permission_id
                WHERE rp.role_id = ?
                ORDER BY p.category, p.name
            `,
        [roleId]
      );
      return rows;
    } catch (error) {
      console.error(
        `[getRolePermissions]: Error fetching permissions for role ${roleId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Assign a role to a user
   * @param {number} userId - User ID
   * @param {number} roleId - Role ID
   * @returns {Promise<boolean>} Success indicator
   */
  async assignRoleToUser(userId, roleId) {
    try {
      await db.query(
        "INSERT INTO user_roles (user_id, role_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE user_id = VALUES(user_id)",
        [userId, roleId]
      );
      return true;
    } catch (error) {
      console.error(
        `[assignRoleToUser]: Error assigning role ${roleId} to user ${userId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Remove a role from a user
   * @param {number} userId - User ID
   * @param {number} roleId - Role ID
   * @returns {Promise<boolean>} Success indicator
   */
  async removeRoleFromUser(userId, roleId) {
    try {
      await db.query(
        "DELETE FROM user_roles WHERE user_id = ? AND role_id = ?",
        [userId, roleId]
      );
      return true;
    } catch (error) {
      console.error(
        `[removeRoleFromUser]: Error removing role ${roleId} from user ${userId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Get all roles assigned to a user
   * @param {number} userId - User ID
   * @returns {Promise<Array>} Array of role objects
   */
  async getUserRoles(userId) {
    try {
      const [rows] = await db.query(
        `
                SELECT r.* 
                FROM roles r
                JOIN user_roles ur ON r.id = ur.role_id
                WHERE ur.user_id = ?
                ORDER BY r.name
            `,
        [userId]
      );
      return rows;
    } catch (error) {
      console.error(
        `[getUserRoles]: Error fetching roles for user ${userId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Check if a user has a specific permission
   * @param {number} userId - User ID
   * @param {string} permissionName - Permission name to check
   * @returns {Promise<boolean>} True if the user has the permission
   */
  async userHasPermission(userId, permissionName) {
    try {
      // Get permissions for this user from cache or DB
      const permissions = await this.getUserPermissions(userId);

      // Check if the permission is in the list
      return permissions.some((p) => p.name === permissionName);
    } catch (error) {
      console.error(
        `[userHasPermission]: Error checking permission ${permissionName} for user ${userId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Get all permissions assigned to a user through their roles
   * @param {number} userId - User ID
   * @returns {Promise<Array>} Array of permission objects
   */
  async getUserPermissions(userId) {
    console.log(
      `[getUserPermissions]: Fetching permissions for user ${userId}`
    );

    try {
      // Force fresh data by clearing cache for this user
      delete this.permissionCache[userId];

      const query = `
        SELECT DISTINCT p.* 
        FROM permissions p
        JOIN role_permissions rp ON p.id = rp.permission_id
        JOIN user_roles ur ON rp.role_id = ur.role_id
        WHERE ur.user_id = ?
      `;

      console.log(`Executing query: ${query} with userId: ${userId}`);
      const [rows] = await db.query(query, [userId]);

      console.log(
        `[getUserPermissions]: Found ${rows.length} permissions:`,
        rows.map((p) => p.name)
      );

      // Update cache
      this.permissionCache[userId] = rows;
      this.cacheExpiry = new Date(Date.now() + this.CACHE_DURATION);

      return rows;
    } catch (error) {
      console.error(`[getUserPermissions]: Error:`, error);
      return []; // Return empty array instead of throwing
    }
  }

  /**
   * Clear the permission cache for a specific user or all users
   * @param {number} userId - Optional user ID to clear cache for specific user
   */
  clearPermissionCache(userId = null) {
    if (userId) {
      delete this.permissionCache[userId];
    } else {
      this.permissionCache = {};
    }
    this.cacheExpiry = null;
  }

  /**
   * Create a new role
   * @param {string} name - Role name
   * @param {string} description - Role description
   * @returns {Promise<number>} New role ID
   */
  async createRole(name, description) {
    try {
      const [result] = await db.query(
        "INSERT INTO roles (name, description) VALUES (?, ?)",
        [name, description]
      );
      return result.insertId;
    } catch (error) {
      console.error(`[createRole]: Error creating role ${name}:`, error);
      throw error;
    }
  }

  /**
   * Update role details
   * @param {number} roleId - Role ID
   * @param {Object} data - Object containing fields to update
   * @returns {Promise<boolean>} Success indicator
   */
  async updateRole(roleId, data) {
    try {
      const allowedFields = ["name", "description"];
      const fields = Object.keys(data).filter((field) =>
        allowedFields.includes(field)
      );

      if (fields.length === 0) {
        throw new Error("No valid fields to update");
      }

      const setClause = fields.map((field) => `${field} = ?`).join(", ");
      const values = fields.map((field) => data[field]);
      values.push(roleId);

      await db.query(`UPDATE roles SET ${setClause} WHERE id = ?`, values);

      // Clear cache as roles may have changed
      this.clearPermissionCache();

      return true;
    } catch (error) {
      console.error(`[updateRole]: Error updating role ${roleId}:`, error);
      throw error;
    }
  }

  /**
   * Assign permissions to a role
   * @param {number} roleId - Role ID
   * @param {Array<number>} permissionIds - Array of permission IDs
   * @returns {Promise<boolean>} Success indicator
   */
  async assignPermissionsToRole(roleId, permissionIds) {
    try {
      // Start a transaction
      await db.query("START TRANSACTION");

      // Insert new role-permission pairs
      for (const permissionId of permissionIds) {
        await db.query(
          "INSERT IGNORE INTO role_permissions (role_id, permission_id) VALUES (?, ?)",
          [roleId, permissionId]
        );
      }

      // Commit the transaction
      await db.query("COMMIT");

      // Clear cache as permissions have changed
      this.clearPermissionCache();

      return true;
    } catch (error) {
      // Rollback in case of error
      await db.query("ROLLBACK");
      console.error(
        `[assignPermissionsToRole]: Error assigning permissions to role ${roleId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Remove permissions from a role
   * @param {number} roleId - Role ID
   * @param {Array<number>} permissionIds - Array of permission IDs
   * @returns {Promise<boolean>} Success indicator
   */
  async removePermissionsFromRole(roleId, permissionIds) {
    try {
      const placeholders = permissionIds.map(() => "?").join(", ");
      await db.query(
        `DELETE FROM role_permissions WHERE role_id = ? AND permission_id IN (${placeholders})`,
        [roleId, ...permissionIds]
      );

      // Clear cache as permissions have changed
      this.clearPermissionCache();

      return true;
    } catch (error) {
      console.error(
        `[removePermissionsFromRole]: Error removing permissions from role ${roleId}:`,
        error
      );
      throw error;
    }
  }
}

module.exports = RBACService;
