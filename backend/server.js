
const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import route files
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const taskRoutes = require('./routes/taskRoutes');
const aiRoutes = require('./routes/aiRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Log incoming requests
app.use((req, res, next) => {
    console.log('REQUEST:', req.method, req.url);
    next();
});

// Authentication routes
app.use('/api/auth', authRoutes);

// Admin routes
app.use('/api/admin', adminRoutes);

// Task routes
app.use('/api/tasks', taskRoutes);
app.use('/api/ai', aiRoutes);

// Backend home route
app.get('/', (req, res) => {
    res.send('To-Do Application Backend is running!');
});

// Start server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
