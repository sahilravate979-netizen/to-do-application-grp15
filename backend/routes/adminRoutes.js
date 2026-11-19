
const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const db = require('../config/db');

// GET ALL REGISTERED USERS (ADMIN ONLY)
router.get('/users', authMiddleware, adminMiddleware, async (req, res) => {

    try {

        const [users] = await db.execute(
            'SELECT user_id, name, email, role, created_at FROM users ORDER BY user_id DESC'
        );

        return res.status(200).json({
            message: 'Users fetched successfully',
            totalUsers: users.length,
            users: users
        });

    } catch (error) {

        console.error('Admin Users Error:', error.message);

        return res.status(500).json({
            message: 'Server error while fetching users'
        });
    }

});

// GET ALL TASKS OF A PARTICULAR USER (ADMIN ONLY)
router.get('/users/:userId/tasks', authMiddleware, adminMiddleware, async (req, res) => {

    try {

        const userId = Number(req.params.userId);

        if (!Number.isInteger(userId) || userId <= 0) {
            return res.status(400).json({
                message: 'Invalid user ID'
            });
        }

        // Check whether user exists
        const [users] = await db.execute(
            'SELECT user_id, name, email FROM users WHERE user_id = ?',
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        // Fetch tasks belonging to this user
        const [tasks] = await db.execute(
            'SELECT task_id, title, description, status, priority, deadline, created_at FROM tasks WHERE user_id = ? ORDER BY created_at DESC',
            [userId]
        );

        return res.status(200).json({
            message: 'User tasks fetched successfully',
            user: users[0],
            totalTasks: tasks.length,
            tasks: tasks
        });

    } catch (error) {

        console.error('Admin User Tasks Error:', error.message);

        return res.status(500).json({
            message: 'Server error while fetching user tasks'
        });
    }

});


// GET OVERALL TASK PROGRESS (ADMIN ONLY)
router.get('/progress', authMiddleware, adminMiddleware, async (req, res) => {

    try {

        const [progress] = await db.execute(`
            SELECT
                u.user_id,
                u.name,
                u.email,
                COUNT(t.task_id) AS totalTasks,
                SUM(CASE WHEN t.status = 'Pending' THEN 1 ELSE 0 END) AS pendingTasks,
                SUM(CASE WHEN t.status = 'In Progress' THEN 1 ELSE 0 END) AS inProgressTasks,
                SUM(CASE WHEN t.status = 'Completed' THEN 1 ELSE 0 END) AS completedTasks
            FROM users u
            LEFT JOIN tasks t ON u.user_id = t.user_id
            WHERE u.role = 'User'
            GROUP BY u.user_id, u.name, u.email
            ORDER BY u.user_id DESC
        `);

        return res.status(200).json({
            message: 'Overall task progress fetched successfully',
            progress: progress
        });

    } catch (error) {

        console.error('Admin Progress Error:', error.message);

        return res.status(500).json({
            message: 'Server error while fetching task progress'
        });
    }

});



module.exports = router;
