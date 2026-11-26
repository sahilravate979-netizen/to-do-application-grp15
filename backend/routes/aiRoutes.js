
const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');
const { generateTask } = require('../controllers/aiController');

// Protect AI route: only logged-in users can use it
router.use(authMiddleware);

// Generate task details using Gemini
router.post('/generate-task', generateTask);

module.exports = router;
