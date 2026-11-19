
const db = require('../config/db');

// 1. CREATE TASK
const createTask = async (req, res) => {
  try {
    const { title, description, priority, status, dueDate } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Task title is required'
      });
    }

    const [result] = await db.execute(
      `INSERT INTO tasks
       (user_id, title, description, priority, status, deadline)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        req.user.id,
        title.trim(),
        description || '',
        priority || 'Medium',
        status || 'Pending',
        dueDate || null
      ]
    );

    const [rows] = await db.execute(
      `SELECT task_id AS id, title, description, priority,
              status, deadline AS dueDate, created_at AS createdAt
       FROM tasks
       WHERE task_id = ? AND user_id = ?`,
      [result.insertId, req.user.id]
    );

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: rows[0]
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating task',
      error: error.message
    });
  }
};

// 2. GET ALL TASKS
const getTasks = async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT task_id AS id, title, description, priority,
              status, deadline AS dueDate, created_at AS createdAt
       FROM tasks
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [req.user.id]
    );

    res.status(200).json({
      success: true,
      count: rows.length,
      data: rows
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching tasks',
      error: error.message
    });
  }
};

// 3. GET SINGLE TASK
const getTask = async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT task_id AS id, title, description, priority,
              status, deadline AS dueDate, created_at AS createdAt
       FROM tasks
       WHERE task_id = ? AND user_id = ?`,
      [req.params.id, req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    res.status(200).json({
      success: true,
      data: rows[0]
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching task',
      error: error.message
    });
  }
};

// 4. UPDATE TASK
const updateTask = async (req, res) => {
  try {
    const allowedFields = {
      title: 'title',
      description: 'description',
      priority: 'priority',
      status: 'status',
      dueDate: 'deadline'
    };

    const updates = [];
    const values = [];

    for (const field in allowedFields) {
      if (req.body[field] !== undefined) {
        if (field === 'title' && !req.body[field].trim()) {
          return res.status(400).json({
            success: false,
            message: 'Task title cannot be empty'
          });
        }

        updates.push(`${allowedFields[field]} = ?`);
        values.push(
          field === 'title' ? req.body[field].trim() : req.body[field]
        );
      }
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields provided for update'
      });
    }

    values.push(req.params.id, req.user.id);

    const [result] = await db.execute(
      `UPDATE tasks SET ${updates.join(', ')}
       WHERE task_id = ? AND user_id = ?`,
      values
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    const [rows] = await db.execute(
      `SELECT task_id AS id, title, description, priority,
              status, deadline AS dueDate, created_at AS createdAt
       FROM tasks
       WHERE task_id = ? AND user_id = ?`,
      [req.params.id, req.user.id]
    );

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: rows[0]
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating task',
      error: error.message
    });
  }
};

// 5. DELETE TASK
const deleteTask = async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT task_id AS id, title, description, priority,
              status, deadline AS dueDate, created_at AS createdAt
       FROM tasks
       WHERE task_id = ? AND user_id = ?`,
      [req.params.id, req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    await db.execute(
      'DELETE FROM tasks WHERE task_id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
      data: rows[0]
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting task',
      error: error.message
    });
  }
};

module.exports = {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask
};
