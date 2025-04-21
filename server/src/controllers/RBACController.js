// controllers/RBACController.js
const RBACService = require("../services/RBACService");
const rbacService = new RBACService();
const db = require("../config/db");

/**
 * Get all roles in the system
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllRoles = async (req, res) => {
  try {
    const roles = await rbacService.getAllRoles();
    res.status(200).json({
      success: true,
      roles,
    });
  } catch (error) {
    console.error("[getAllRoles]: Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve roles",
    });
  }
};

/**
 * Get role details including its permissions
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getRoleDetails = async (req, res) => {
  const roleId = parseInt(req.params.id);

  if (isNaN(roleId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid role ID",
    });
  }

  try {
    const role = await rbacService.getRoleById(roleId);

    if (!role) {
      return res.status(404).json({
        success: false,
        message: "Role not found",
      });
    }

    const permissions = await rbacService.getRolePermissions(roleId);

    res.status(200).json({
      success: true,
      role: {
        ...role,
        permissions,
      },
    });
  } catch (error) {
    console.error(`[getRoleDetails]: Error for role ${roleId}:`, error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve role details",
    });
  }
};

/**
 * Create a new role
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createRole = async (req, res) => {
  const { name, description, permissions } = req.body;

  if (!name) {
    return res.status(400).json({
      success: false,
      message: "Role name is required",
    });
  }

  try {
    // Create the role
    const roleId = await rbacService.createRole(name, description || "");

    // Assign permissions if provided
    if (permissions && Array.isArray(permissions) && permissions.length > 0) {
      await rbacService.assignPermissionsToRole(roleId, permissions);
    }

    // Get all roles to provide updated list
    const roles = await rbacService.getAllRoles();

    res.status(201).json({
      success: true,
      message: "Role created successfully",
      roleId,
      roles, // Include updated roles list
    });
  } catch (error) {
    console.error("[createRole]: Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create role",
    });
  }
};

/**
 * Update role details
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateRole = async (req, res) => {
  const roleId = parseInt(req.params.id);
  const { name, description } = req.body;

  if (isNaN(roleId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid role ID",
    });
  }

  try {
    const role = await rbacService.getRoleById(roleId);

    if (!role) {
      return res.status(404).json({
        success: false,
        message: "Role not found",
      });
    }

    // Update role details
    await rbacService.updateRole(roleId, {
      name: name || role.name,
      description: description !== undefined ? description : role.description,
    });

    // Get all roles to provide updated list
    const roles = await rbacService.getAllRoles();

    res.status(200).json({
      success: true,
      message: "Role updated successfully",
      roles, // Include updated roles list
    });
  } catch (error) {
    console.error(`[updateRole]: Error for role ${roleId}:`, error);
    res.status(500).json({
      success: false,
      message: "Failed to update role",
    });
  }
};

/**
 * Delete a role
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteRole = async (req, res) => {
  const roleId = parseInt(req.params.id);

  if (isNaN(roleId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid role ID",
    });
  }

  try {
    // Check if role exists first
    const role = await rbacService.getRoleById(roleId);

    if (!role) {
      return res.status(404).json({
        success: false,
        message: "Role not found",
      });
    }

    // Delete role permissions first (to avoid foreign key constraint issues)
    await db.query("DELETE FROM role_permissions WHERE role_id = ?", [roleId]);

    // Delete user role assignments
    await db.query("DELETE FROM user_roles WHERE role_id = ?", [roleId]);

    // Finally delete the role
    await db.query("DELETE FROM roles WHERE id = ?", [roleId]);

    // Clear the permission cache
    rbacService.clearPermissionCache();

    // Get all roles to provide updated list
    const roles = await rbacService.getAllRoles();

    res.status(200).json({
      success: true,
      message: "Role deleted successfully",
      roles, // Include updated roles list
    });
  } catch (error) {
    console.error(`[deleteRole]: Error for role ${roleId}:`, error);
    res.status(500).json({
      success: false,
      message: "Failed to delete role",
    });
  }
};

/**
 * Get all permissions in the system
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllPermissions = async (req, res) => {
  const { category } = req.query;

  try {
    const permissions = await rbacService.getAllPermissions(category || null);
    res.status(200).json({
      success: true,
      permissions,
    });
  } catch (error) {
    console.error("[getAllPermissions]: Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve permissions",
    });
  }
};

/**
 * Update permissions for a role
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateRolePermissions = async (req, res) => {
  const roleId = parseInt(req.params.id);
  const { permissions } = req.body;

  console.log("Updating role permissions for role ID:", roleId);
  console.log("New permissions:", permissions);

  if (isNaN(roleId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid role ID",
    });
  }

  if (!permissions || !Array.isArray(permissions)) {
    return res.status(400).json({
      success: false,
      message: "Permissions array is required",
    });
  }

  try {
    const role = await rbacService.getRoleById(roleId);

    if (!role) {
      return res.status(404).json({
        success: false,
        message: "Role not found",
      });
    }

    // Simpler approach: delete all existing permissions first
    await db.query("DELETE FROM role_permissions WHERE role_id = ?", [roleId]);
    console.log(`Deleted all existing permissions for role ${roleId}`);

    // Then add the new permissions
    if (permissions.length > 0) {
      // Insert new permissions one by one to avoid issues
      for (const permissionId of permissions) {
        await db.query(
          "INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)",
          [roleId, permissionId]
        );
        console.log(`Added permission ${permissionId} to role ${roleId}`);
      }
    }

    // Clear the permission cache
    rbacService.clearPermissionCache();

    // Get updated role with permissions
    const updatedRole = await rbacService.getRoleById(roleId);
    const updatedPermissions = await rbacService.getRolePermissions(roleId);

    res.status(200).json({
      success: true,
      message: "Role permissions updated successfully",
      role: {
        ...updatedRole,
        permissions: updatedPermissions,
      },
    });
  } catch (error) {
    console.error(`[updateRolePermissions]: Error for role ${roleId}:`, error);
    res.status(500).json({
      success: false,
      message: "Failed to update role permissions",
      error: error.message,
    });
  }
};

/**
 * Get user's roles and permissions
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getUserRolesAndPermissions = async (req, res) => {
  const userId = parseInt(req.params.id);

  try {
    // Get user roles
    const roles = await rbacService.getUserRoles(userId);

    // Get user permissions
    const permissions = await rbacService.getUserPermissions(userId);

    // Log what we're sending back
    console.log("Sending roles and permissions for user", userId, {
      rolesCount: roles.length,
      permissionsCount: permissions.length,
      permissions: permissions.map((p) => p.name),
    });

    res.status(200).json({
      success: true,
      userId,
      roles,
      permissions,
    });
  } catch (error) {
    console.error(`Error for user ${userId}:`, error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve user roles and permissions",
    });
  }
};

/**
 * Assign a role to a user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const assignRoleToUser = async (req, res) => {
  const userId = parseInt(req.params.userId);
  const roleId = parseInt(req.params.roleId);

  if (isNaN(userId) || isNaN(roleId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid user ID or role ID",
    });
  }

  try {
    await rbacService.assignRoleToUser(userId, roleId);

    // Clear the permission cache for this user
    rbacService.clearPermissionCache(userId);

    // Get updated roles for this user
    const updatedRoles = await rbacService.getUserRoles(userId);

    res.status(200).json({
      success: true,
      message: "Role assigned successfully",
      roles: updatedRoles,
    });
  } catch (error) {
    console.error(
      `[assignRoleToUser]: Error for user ${userId}, role ${roleId}:`,
      error
    );
    res.status(500).json({
      success: false,
      message: "Failed to assign role",
    });
  }
};

/**
 * Remove a role from a user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const removeRoleFromUser = async (req, res) => {
  const userId = parseInt(req.params.userId);
  const roleId = parseInt(req.params.roleId);

  if (isNaN(userId) || isNaN(roleId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid user ID or role ID",
    });
  }

  try {
    await rbacService.removeRoleFromUser(userId, roleId);

    // Clear the permission cache for this user
    rbacService.clearPermissionCache(userId);

    // Get updated roles for this user
    const updatedRoles = await rbacService.getUserRoles(userId);

    res.status(200).json({
      success: true,
      message: "Role removed successfully",
      roles: updatedRoles,
    });
  } catch (error) {
    console.error(
      `[removeRoleFromUser]: Error for user ${userId}, role ${roleId}:`,
      error
    );
    res.status(500).json({
      success: false,
      message: "Failed to remove role",
    });
  }
};

module.exports = {
  getAllRoles,
  getRoleDetails,
  createRole,
  updateRole,
  deleteRole,
  getAllPermissions,
  updateRolePermissions,
  getUserRolesAndPermissions,
  assignRoleToUser,
  removeRoleFromUser,
};
