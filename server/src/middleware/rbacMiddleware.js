// middleware/rbacMiddleware.js
const RBACService = require("../services/RBACService");
const rbacService = new RBACService();

/**
 * Middleware to check if the user has the required permission
 * @param {string} permission - Permission name to check
 * @returns {Function} Express middleware
 */
const requirePermission = (permission) => {
  return async (req, res, next) => {
    // Skip permission check if not authenticated
    if (!req.isAuthenticated() || !req.user) {
      console.log("User:", req.user);
      console.log("Checking permission:", permission);
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    try {
      // Check if user is admin first - admins bypass individual permission checks
      const userRoles = await rbacService.getUserRoles(req.user.id);
      const isAdmin = userRoles.some((role) => role.name === "admin");

      if (isAdmin) {
        // Admin users bypass regular permission checks
        console.log(
          `[requirePermission]: User ${req.user.id} is admin, bypassing permission check for ${permission}`
        );
        return next();
      }

      // For non-admin users, check specific permission
      const hasPermission = await rbacService.userHasPermission(
        req.user.id,
        permission
      );

      if (hasPermission) {
        return next();
      } else {
        return res.status(403).json({
          success: false,
          message: "You do not have permission to perform this action",
        });
      }
    } catch (error) {
      console.error(
        `[requirePermission]: Error checking permission ${permission}:`,
        error
      );
      return res.status(500).json({
        success: false,
        message: "Error checking permissions",
      });
    }
  };
};

/**
 * Middleware to check if the user has any of the required roles
 * @param {Array<string>} roles - Array of role names to check
 * @returns {Function} Express middleware
 */
const requireRole = (roles) => {
  return async (req, res, next) => {
    // Skip role check if not authenticated
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    try {
      const userRoles = await rbacService.getUserRoles(req.user.id);

      // Always grant access to users with 'admin' role
      if (userRoles.some((role) => role.name === "admin")) {
        console.log(
          `[requireRole]: User ${
            req.user.id
          } is admin, bypassing role check for ${roles.join(", ")}`
        );
        return next();
      }

      // Check if the user has any of the required roles
      const hasRequiredRole = userRoles.some((role) =>
        roles.includes(role.name)
      );

      if (hasRequiredRole) {
        return next();
      } else {
        return res.status(403).json({
          success: false,
          message: "You do not have the required role to perform this action",
        });
      }
    } catch (error) {
      console.error(
        `[requireRole]: Error checking roles ${roles.join(", ")}:`,
        error
      );
      return res.status(500).json({
        success: false,
        message: "Error checking roles",
      });
    }
  };
};

/**
 * Add permissions and roles to the request object for views
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const addPermissionsToRequest = async (req, res, next) => {
  if (req.isAuthenticated() && req.user) {
    try {
      // Add user permissions to the request
      req.userPermissions = await rbacService.getUserPermissions(req.user.id);

      // Add user roles to the request
      req.userRoles = await rbacService.getUserRoles(req.user.id);

      // Add helper methods for checking permissions in templates
      req.hasPermission = (permission) => {
        // Admin users have all permissions
        if (req.userRoles.some((role) => role.name === "admin")) {
          return true;
        }
        return req.userPermissions.some((p) => p.name === permission);
      };

      req.hasRole = (role) => {
        return req.userRoles.some((r) => r.name === role);
      };
    } catch (error) {
      console.error(
        "[addPermissionsToRequest]: Error fetching permissions:",
        error
      );
      // Continue even if there's an error, just without permissions
    }
  }

  next();
};

/**
 * Task permission middleware - checks if user can perform actions on tasks
 * @param {string} action - One of 'view', 'create', 'update', 'delete'
 * @returns {Function} Express middleware
 */
const requireTaskPermission = (action) => {
  return async (req, res, next) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    try {
      // Admin always has access to all tasks
      const userRoles = await rbacService.getUserRoles(req.user.id);
      const isAdmin = userRoles.some((role) => role.name === "admin");

      if (isAdmin) {
        return next();
      }

      // Check for specific task permission
      const hasPermission = await rbacService.userHasPermission(
        req.user.id,
        `task.${action}`
      );

      if (hasPermission) {
        // For delete/update operations, check if user is creator (unless they have special permission)
        if (action === "delete" || action === "update") {
          const { cardId } = req.body || req.query || {};

          if (!cardId) {
            return res.status(400).json({
              success: false,
              message: "Task ID is required",
            });
          }

          // Check if user has special permission to manage any task
          const canManageAny = await rbacService.userHasPermission(
            req.user.id,
            `task.${action}.any`
          );

          if (canManageAny) {
            return next();
          }

          // Get task details to check creator
          const [taskDetails] = await db.query(
            "SELECT creator FROM tasks WHERE id = ?",
            [cardId]
          );

          if (taskDetails.length === 0) {
            return res.status(404).json({
              success: false,
              message: "Task not found",
            });
          }

          // Check if user is the creator
          if (
            taskDetails[0].creator === req.user.id.toString() ||
            taskDetails[0].creator === req.user.username
          ) {
            return next();
          }

          return res.status(403).json({
            success: false,
            message: "You can only modify tasks you created",
          });
        }

        return next();
      }

      // Special case: users can always view tasks assigned to them
      if (action === "view") {
        // Allow viewing if task is assigned to the user
        const { cardId } = req.params || req.query || {};

        if (cardId) {
          const [assignedTasks] = await db.query(
            "SELECT id FROM tasks WHERE id = ? AND assigned LIKE ?",
            [cardId, `%${req.user.username}%`]
          );

          if (assignedTasks.length > 0) {
            return next();
          }
        }
      }

      return res.status(403).json({
        success: false,
        message: "You do not have permission to perform this action",
      });
    } catch (error) {
      console.error(
        `[requireTaskPermission]: Error checking permission for task.${action}:`,
        error
      );
      return res.status(500).json({
        success: false,
        message: "Error checking permissions",
      });
    }
  };
};

module.exports = {
  requirePermission,
  requireRole,
  addPermissionsToRequest,
  requireTaskPermission,
};
