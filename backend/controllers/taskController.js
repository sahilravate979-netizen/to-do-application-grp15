
// Temporary In-Memory Storage
let tasks = [];
let nextId = 1;

// 1. CREATE TASK
const createTask = (req, res) => {
  const { title, description, priority, status, dueDate, category } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Task title is required'
    });
  }

  const task = {
    id: String(nextId++),
    title: title.trim(),
    description: description || '',
    priority: priority || 'Medium',
    status: status || 'Pending',
    dueDate: dueDate || null,
    category: category || 'Personal',
    createdAt: new Date()
  };

  tasks.push(task);

  res.status(201).json({
    success: true,
    message: 'Task created successfully',
    data: task
  });
};

// 2. GET ALL TASKS
const getTasks = (req, res) => {
  res.status(200).json({
    success: true,
    count: tasks.length,
    data: tasks
  });
};

// 3. GET SINGLE TASK
const getTask = (req, res) => {
  const task = tasks.find(t => t.id === req.params.id);

  if (!task) {
    return res.status(404).json({
      success: false,
      message: 'Task not found'
    });
  }

  res.status(200).json({
    success: true,
    data: task
  });
};

// 4. UPDATE TASK
const updateTask = (req, res) => {
  const task = tasks.find(t => t.id === req.params.id);

  if (!task) {
    return res.status(404).json({
      success: false,
      message: 'Task not found'
    });
  }

  const allowedFields = [
    'title',
    'description',
    'priority',
    'status',
    'dueDate',
    'category'
  ];

  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) {
      task[field] = req.body[field];
    }
  });

  res.status(200).json({
    success: true,
    message: 'Task updated successfully',
    data: task
  });
};

// 5. DELETE TASK
const deleteTask = (req, res) => {
  const index = tasks.findIndex(t => t.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: 'Task not found'
    });
  }

  const deletedTask = tasks.splice(index, 1)[0];

  res.status(200).json({
    success: true,
    message: 'Task deleted successfully',
    data: deletedTask
  });
};

module.exports = {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask
};
