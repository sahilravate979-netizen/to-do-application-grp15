
const db = require('../config/db');

// Helper: Format database task for frontend
const formatTask = (task) => ({
    id: String(task.task_id),
    title: task.title,
    description: task.description || '',
    status: task.status || 'Pending',
    priority: task.priority || 'Medium',
    dueDate: task.deadline
        ? new Date(task.deadline).toISOString().slice(0, 10)
        : null,
    createdAt: task.created_at
});

// 1. CREATE TASK
const createTask = async (req, res) => {
    try {
        const {
            title,
            description,
            priority,
            status,
            dueDate
        } = req.body;

        if (!title || !title.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Task title is required'
            });
        }

        const userId = req.user.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'User authentication required'
            });
        }

        const deadline = dueDate
            ? `${dueDate.slice(0, 10)} 00:00:00`
            : null;

        const [result] = await db.execute(
            `INSERT INTO tasks
            (user_id, title, description, status, priority, deadline)
            VALUES (?, ?, ?, ?, ?, ?)`,
            [
                userId,
                title.trim(),
                description || null,
                status || 'Pending',
                priority || 'Medium',
                deadline
            ]
        );

        const [rows] = await db.execute(
            'SELECT * FROM tasks WHERE task_id = ? AND user_id = ?',
            [result.insertId, userId]
        );

        return res.status(201).json({
            success: true,
            message: 'Task created successfully',
            data: formatTask(rows[0])
        });

    } catch (error) {
        console.error('Create task error:', error);

        return res.status(500).json({
            success: false,
            message: 'Could not create task'
        });
    }
};

// 2. GET ALL TASKS
const getTasks = async (req, res) => {
    try {
        const userId = req.user.id;

        const [rows] = await db.execute(
            'SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC',
            [userId]
        );

        return res.status(200).json({
            success: true,
            count: rows.length,
            data: rows.map(formatTask)
        });

    } catch (error) {
        console.error('Get tasks error:', error);

        return res.status(500).json({
            success: false,
            message: 'Could not retrieve tasks'
        });
    }
};

// 3. GET SINGLE TASK
const getTask = async (req, res) => {
    try {
        const userId = req.user.id;
        const taskId = req.params.id;

        const [rows] = await db.execute(
            'SELECT * FROM tasks WHERE task_id = ? AND user_id = ?',
            [taskId, userId]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        return res.status(200).json({
            success: true,
            data: formatTask(rows[0])
        });

    } catch (error) {
        console.error('Get single task error:', error);

        return res.status(500).json({
            success: false,
            message: 'Could not retrieve task'
        });
    }
};

// 4. UPDATE TASK
const updateTask = async (req, res) => {
    try {
        const userId = req.user.id;
        const taskId = req.params.id;

        const allowedFields = {
            title: 'title',
            description: 'description',
            status: 'status',
            priority: 'priority',
            dueDate: 'deadline'
        };

        const updates = [];
        const values = [];

        for (const [field, column] of Object.entries(allowedFields)) {
            if (req.body[field] !== undefined) {
                updates.push(`${column} = ?`);

                let value = req.body[field];

                if (field === 'dueDate') {
                    value = value
                        ? `${value.slice(0, 10)} 00:00:00`
                        : null;
                }

                if (field === 'title') {
                    value = value.trim();

                    if (!value) {
                        return res.status(400).json({
                            success: false,
                            message: 'Task title cannot be empty'
                        });
                    }
                }

                values.push(value);
            }
        }

        if (updates.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No valid fields provided'
            });
        }

        values.push(taskId, userId);

        const [result] = await db.execute(
            `UPDATE tasks SET ${updates.join(', ')}
             WHERE task_id = ? AND user_id = ?`,
            values
        );

        if (result.affectedRows === 0) {
            const [existing] = await db.execute(
                'SELECT task_id FROM tasks WHERE task_id = ? AND user_id = ?',
                [taskId, userId]
            );

            if (existing.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Task not found'
                });
            }
        }

        const [rows] = await db.execute(
            'SELECT * FROM tasks WHERE task_id = ? AND user_id = ?',
            [taskId, userId]
        );

        return res.status(200).json({
            success: true,
            message: 'Task updated successfully',
            data: formatTask(rows[0])
        });

    } catch (error) {
        console.error('Update task error:', error);

        return res.status(500).json({
            success: false,
            message: 'Could not update task'
        });
    }
};

// 5. DELETE TASK
const deleteTask = async (req, res) => {
    try {
        const userId = req.user.id;
        const taskId = req.params.id;

        const [result] = await db.execute(
            'DELETE FROM tasks WHERE task_id = ? AND user_id = ?',
            [taskId, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Task deleted successfully'
        });

    } catch (error) {
        console.error('Delete task error:', error);

        return res.status(500).json({
            success: false,
            message: 'Could not delete task'
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
