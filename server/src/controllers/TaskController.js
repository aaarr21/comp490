// Enhanced TaskController.js with additional logging
const Task = require("../models/Task");
const Column = require("../models/Column");
const TaskService = require("../services/TaskService");
const taskService = new TaskService();
const RBACService = require("../services/RBACService");
const rbacService = new RBACService();
const db = require("../config/db");

const createNewTask = async (req, res) => {
  const { textPart, date, assigned, column, creator } = req.body;

  if (!textPart || !date || !assigned || !column || !creator) {
    return res.status(400).json({ error: "Missing task field." });
  }

  try {
    const newTask = await taskService.registerTask(
      textPart,
      date,
      assigned,
      column,
      creator
    );
    res.status(201).json({
      success: true,
      message: "Task created successfully",
      newTask,
    });
  } catch (error) {
    console.error("Error creating task:", error);
    return res.status(500).json({ error: "Failed to create task" });
  }
};

const dealWTaskDrag = async (req, res) => {
  const { cardId, columnId } = req.body;
  if (!cardId || !columnId) {
    return res.status(400).json({ error: "Missing task or column ID" });
  }

  try {
    const hasPermission = await rbacService.userHasPermission(
      req.user.id,
      "task.move"
    );
    console.log(
      `Checking move permission for user ${req.user.id}: ${hasPermission}`
    );
    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to move this task",
      });
    }
    await taskService.dragTaskEvent(cardId, columnId);
    return res.status(200).json({
      success: true,
      message: "Task moved successfully",
    });
  } catch (error) {
    console.error("Error moving task:", error);
    return res.status(500).json({ error: error.message });
  }
};

const updateStatus = async (req, res) => {
  const { cardId, newStatus } = req.body;
  if (!cardId || !newStatus) {
    return res.status(400).json({ error: "Missing task ID or status" });
  }

  try {
    const hasPermission = await Task.checkPermission(
      req.user.id,
      cardId,
      "update"
    );
    console.log(
      `User ${req.user.id} update status permission for card ${cardId}: ${hasPermission}`
    );
    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to update this task",
      });
    }
    await taskService.updateTaskStatus(cardId, newStatus);
    res.status(200).json({
      success: true,
      message: "Task status updated successfully",
    });
  } catch (error) {
    console.error("Error updating task status:", error);
    return res.status(500).json({ error: error.message });
  }
};

const updateTitle = async (req, res) => {
  const { cardId, newTitle } = req.body;
  if (!cardId || !newTitle) {
    return res.status(400).json({ error: "Missing task ID or title" });
  }

  try {
    const hasPermission = await Task.checkPermission(
      req.user.id,
      cardId,
      "update"
    );
    console.log(
      `User ${req.user.id} update title permission for card ${cardId}: ${hasPermission}`
    );
    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to update this task",
      });
    }
    await taskService.updateTaskTitle(cardId, newTitle);
    res.status(200).json({
      success: true,
      message: "Task title updated successfully",
    });
  } catch (error) {
    console.error("Error updating task title:", error);
    return res.status(500).json({ error: error.message });
  }
};

const deleteTask = async (req, res) => {
  const { cardId } = req.query;
  if (!cardId) {
    return res.status(400).json({ error: "Missing task ID" });
  }
  try {
    const hasPermission = await Task.checkPermission(
      req.user.id,
      cardId,
      "delete"
    );
    console.log(
      `User ${req.user.id} delete permission for card ${cardId}: ${hasPermission}`
    );
    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to delete this task",
      });
    }
    await taskService.deleteTask(cardId);
    return res.status(200).json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting task:", error);
    res.status(500).json({ error: error.message });
  }
};

const createGoal = async (req, res) => {
  const { columnName, column, color, loggedInUser } = req.body;

  // Log the incoming payload for debugging
  console.log("createGoal payload:", {
    columnName,
    column,
    color,
    loggedInUser,
  });

  if (!column || !columnName || !color || !loggedInUser) {
    return res.status(400).json({ error: "Missing required field" });
  }

  try {
    const userRoles = await rbacService.getUserRoles(req.user.id);
    const isAdmin = userRoles.some((role) => role.name === "admin");

    if (!isAdmin) {
      const userPermission = await rbacService.userHasPermission(
        req.user.id,
        "board.create"
      );
      if (!userPermission) {
        return res.status(403).json({
          success: false,
          message: "You don't have permission to create new columns",
        });
      }
    }

    // Create the column using TaskService; the order is: (columnName, column, color, loggedInUser)
    const newColumnId = await taskService.registerColumn(
      columnName,
      column,
      color,
      loggedInUser
    );

    // Optionally, you may want to fetch and return the newly created column details:
    const newColumn = {
      title: columnName,
      columnAsg: column,
      color,
      creator: loggedInUser,
      id: newColumnId,
    };

    res.status(201).json({
      success: true,
      message: "Column created successfully",
      newColumn,
    });
  } catch (error) {
    console.error("Error creating column:", error);
    return res
      .status(500)
      .json({ error: "Failed to create column: " + error.message });
  }
};

const getAllGoals = async (req, res) => {
  try {
    const columns = await taskService.getAllGoals();
    res.status(200).json(columns);
  } catch (error) {
    console.error("Error fetching columns:", error);
    return res.status(500).json({ error: "Failed to fetch columns" });
  }
};

const getAllTasks = async (req, res) => {
  try {
    const userRoles = await rbacService.getUserRoles(req.user.id);
    const isAdmin = userRoles.some((role) => role.name === "admin");
    const hasViewAllPermission = await rbacService.userHasPermission(
      req.user.id,
      "task.view.all"
    );
    let tasks;
    if (isAdmin || hasViewAllPermission) {
      tasks = await taskService.getAllTasks();
    } else {
      tasks = await taskService.getTasksByUser(req.user.id);
    }
    res.status(200).json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return res.status(500).json({ error: "Failed to fetch tasks" });
  }
};

const deleteColumn = async (req, res) => {
  const { columnId } = req.query;
  if (!columnId) {
    return res.status(400).json({ error: "Missing column ID" });
  }

  try {
    const userRoles = await rbacService.getUserRoles(req.user.id);
    const isAdmin = userRoles.some((role) => role.name === "admin");
    const [columnRows] = await db.query(
      "SELECT creator FROM columns WHERE columnAsg = ?",
      [columnId]
    );
    if (columnRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Column not found",
      });
    }
    if (
      !isAdmin &&
      columnRows[0].creator !== req.user.id.toString() &&
      columnRows[0].creator !== req.user.username
    ) {
      return res.status(403).json({
        success: false,
        message: "You can only delete columns you created",
      });
    }
    await taskService.deleteColumn(columnId, req.user.id);
    return res.status(200).json({
      success: true,
      message: "Column deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting column:", error);
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createNewTask,
  createGoal,
  getAllGoals,
  getAllTasks,
  deleteTask,
  dealWTaskDrag,
  updateStatus,
  updateTitle,
  deleteColumn,
};
