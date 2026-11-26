
const db = require('../config/db');

// Format database task for frontend
const formatTask = (task) => {
    let dueDate = null;

    if (task.deadline) {
        const date = new Date(task.deadline);

        if (!Number.isNaN(date.getTime())) {
            dueDate = date.toISOString().slice(0, 10);
        }
    }

    return {
        id: String(task.task_id),
        task_id: task.task_id,
        user_id: task.user_id,
        title: task.title,
        description: task.description || '',
        status: task.status || 'Pending',
        priority: task.priority || 'Medium',
        dueDate,
        deadline: dueDate,
        createdAt: task.created_at
    };
};

// 1. CREATE TASK
const createTask = async (req, res) => {
    console.log('CREATE TASK: Request received');

    try {
        const {
            title,
            description,
            priority,
            status,
            dueDate
        } = req.body;

        const userId = req.user?.id;

        console.log('CREATE TASK: User ID:', userId);
        console.log('CREATE TASK: Title:', title);

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'User authentication required'
            });
        }

        if (!title || typeof title !== 'string' || !title.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Task title is required'
            });
        }

        // Convert date into MySQL DATETIME format
        let deadline = null;

        if (dueDate) {
            const datePart = String(dueDate).slice(0, 10);

            if (!/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid due date format'
                });
            }

            deadline = `${datePart} 00:00:00`;
        }

        console.log('CREATE TASK: Inserting into MySQL...');

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

        console.log(
            'CREATE TASK: Insert successful. ID:',
            result.insertId
        );

        const [rows] = await db.execute(
            `SELECT * FROM tasks
             WHERE task_id = ? AND user_id = ?`,
            [result.insertId, userId]
        );

        if (rows.length === 0) {
            throw new Error('Created task could not be retrieved');
        }

        console.log('CREATE TASK: Completed successfully');

        return res.status(201).json({
            success: true,
            message: 'Task created successfully',
            data: formatTask(rows[0])
        });

    } catch (error) {
        console.error('CREATE TASK ERROR:', error);

        return res.status(500).json({
            success: false,
            message: 'Could not create task',
            error: process.env.NODE_ENV === 'development'
                ? error.message
                : undefined
        });
    }
};


// 2. GET ALL TASKS
const getTasks = async (req, res) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'User authentication required'
            });
        }

        const [rows] = await db.execute(
            `SELECT * FROM tasks
             WHERE user_id = ?
             ORDER BY created_at DESC`,
            [userId]
        );

        return res.status(200).json({
            success: true,
            count: rows.length,
            data: rows.map(formatTask)
        });

    } catch (error) {
        console.error('GET TASKS ERROR:', error);

        return res.status(500).json({
            success: false,
            message: 'Could not retrieve tasks'
        });
    }
};


// 3. GET SINGLE TASK
const getTask = async (req, res) => {
    try {
        const userId = req.user?.id;
        const taskId = req.params.id;

        const [rows] = await db.execute(
            `SELECT * FROM tasks
             WHERE task_id = ? AND user_id = ?`,
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
        console.error('GET SINGLE TASK ERROR:', error);

        return res.status(500).json({
            success: false,
            message: 'Could not retrieve task'
        });
    }
};


// 4. UPDATE TASK
const updateTask = async (req, res) => {
    try {
        const userId = req.user?.id;
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
                let value = req.body[field];

                if (field === 'title') {
                    if (typeof value !== 'string' || !value.trim()) {
                        return res.status(400).json({
                            success: false,
                            message: 'Task title cannot be empty'
                        });
                    }

                    value = value.trim();
                }

                if (field === 'dueDate') {
                    if (value) {
                        const datePart = String(value).slice(0, 10);

                        if (!/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
                            return res.status(400).json({
                                success: false,
                                message: 'Invalid due date format'
                            });
                        }

                        value = `${datePart} 00:00:00`;
                    } else {
                        value = null;
                    }
                }

                updates.push(`${column} = ?`);
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
            `UPDATE tasks
             SET ${updates.join(', ')}
             WHERE task_id = ? AND user_id = ?`,
            values
        );

        if (result.affectedRows === 0) {
            const [existing] = await db.execute(
                `SELECT task_id FROM tasks
                 WHERE task_id = ? AND user_id = ?`,
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
            `SELECT * FROM tasks
             WHERE task_id = ? AND user_id = ?`,
            [taskId, userId]
        );

        return res.status(200).json({
            success: true,
            message: 'Task updated successfully',
            data: formatTask(rows[0])
        });

    } catch (error) {
        console.error('UPDATE TASK ERROR:', error);

        return res.status(500).json({
            success: false,
            message: 'Could not update task'
        });
    }
};


// 5. DELETE TASK
const deleteTask = async (req, res) => {
    try {
        const userId = req.user?.id;
        const taskId = req.params.id;

        const [result] = await db.execute(
            `DELETE FROM tasks
             WHERE task_id = ? AND user_id = ?`,
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
        console.error('DELETE TASK ERROR:', error);

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
