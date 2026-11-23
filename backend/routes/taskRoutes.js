
const express = require('express');
const router = express.Router();

// Authentication middleware
const authMiddleware = require('../middleware/authMiddleware');

// Task controller functions
const {
    createTask,
    getTasks,
    getTask,
    updateTask,
    deleteTask
} = require('../controllers/taskController');

// Protect all task routes
router.use(authMiddleware);

// CREATE TASK
router.post('/', createTask);

// GET ALL TASKS
router.get('/', getTasks);

// GET SINGLE TASK
router.get('/:id', getTask);

// UPDATE TASK
router.put('/:id', updateTask);

// DELETE TASK
router.delete('/:id', deleteTask);

module.exports = router;
