// routes/rbacRoutes.js
const express = require("express");
const router = express.Router();
const RBACController = require("../controllers/RBACController");
const {
  requirePermission,
  requireRole,
} = require("../middleware/rbacMiddleware");

// Public endpoint for users to get their own roles/permissions
// This must be BEFORE the admin middleware
router.get(
  "/public/users/:id/roles",
  RBACController.getUserRolesAndPermissions
);

// Admin-only routes below
router.use(requireRole(["admin"]));

// Role routes
router.get("/roles", RBACController.getAllRoles);
router.get("/roles/:id", RBACController.getRoleDetails);
router.post("/roles", RBACController.createRole);
router.put("/roles/:id", RBACController.updateRole);
router.delete("/roles/:id", RBACController.deleteRole);
router.put("/roles/:id/permissions", RBACController.updateRolePermissions);

// Permission routes
router.get("/permissions", RBACController.getAllPermissions);

// User-role routes (admin only)
router.get("/users/:id/roles", RBACController.getUserRolesAndPermissions);
router.post("/users/:userId/roles/:roleId", RBACController.assignRoleToUser);
router.delete(
  "/users/:userId/roles/:roleId",
  RBACController.removeRoleFromUser
);

module.exports = router;
