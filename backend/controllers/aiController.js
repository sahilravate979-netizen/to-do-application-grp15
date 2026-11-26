
const { generateTaskDetails } = require('../services/geminiService');

// Normalize AI-generated category
const normalizeCategory = (category) => {
    if (typeof category !== 'string') {
        return null;
    }

    const value = category.trim().toLowerCase();

    const categories = {
        work: 'Work',
        professional: 'Work',
        office: 'Work',
        study: 'Study',
        education: 'Study',
        academic: 'Study',
        personal: 'Personal',
        private: 'Personal'
    };

    return categories[value] || null;
};

// Normalize AI-generated priority
const normalizePriority = (priority) => {
    if (typeof priority !== 'string') {
        return null;
    }

    const value = priority.trim().toLowerCase();

    const priorities = {
        high: 'High',
        medium: 'Medium',
        low: 'Low'
    };

    return priorities[value] || null;
};

// Generate task using Gemini AI
const generateTask = async (req, res) => {
    try {
        const { input } = req.body;

        // Validate user input
        if (
            !input ||
            typeof input !== 'string' ||
            !input.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: 'Please enter a task description.'
            });
        }

        if (input.length > 1000) {
            return res.status(400).json({
                success: false,
                message: 'Task description must not exceed 1000 characters.'
            });
        }

        // Generate task details
        const taskDetails = await generateTaskDetails(input.trim());

        // Log the actual Gemini response
        console.log('GEMINI RAW TASK DETAILS:', taskDetails);

        if (!taskDetails || typeof taskDetails !== 'object') {
            throw new Error('Gemini returned an invalid response.');
        }

        // Normalize generated fields
        const title = typeof taskDetails.title === 'string'
            ? taskDetails.title.trim()
            : '';

        const description = typeof taskDetails.description === 'string'
            ? taskDetails.description.trim()
            : '';

        const priority = normalizePriority(taskDetails.priority);

        const category = normalizeCategory(taskDetails.category);

        const deadline = taskDetails.deadline || '';

        // Validate required fields
        if (!title) {
            throw new Error('Generated task title is missing.');
        }

        if (!priority) {
            throw new Error('Generated task priority is invalid.');
        }

        if (!category) {
            throw new Error(
                `Generated task category is invalid: ${taskDetails.category}`
            );
        }

        if (
            typeof deadline !== 'string' ||
            (deadline !== '' && !/^\d{4}-\d{2}-\d{2}$/.test(deadline))
        ) {
            throw new Error('Generated task deadline is invalid.');
        }

        // Final task object
        const finalTask = {
            title,
            description,
            priority,
            deadline,
            category
        };

        console.log('FINAL GENERATED TASK:', finalTask);

        // Send response to Angular
        return res.status(200).json({
            success: true,
            message: 'Task details generated successfully.',
            data: finalTask
        });

    } catch (error) {
        console.error('AI TASK GENERATION ERROR:', error.message);

        return res.status(500).json({
            success: false,
            message: 'Unable to generate task details. Please try again.',
            error: error.message
        });
    }
};

module.exports = {
    generateTask
};
