
const { GoogleGenAI } = require('@google/genai');

// Initialize Gemini using the API key stored in backend/.env
const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

// Structured response schema
const taskSchema = {
    type: 'OBJECT',
    properties: {
        title: {
            type: 'STRING',
            description: 'A short, clear title describing the task.'
        },
        description: {
            type: 'STRING',
            description: 'A useful description explaining what needs to be done.'
        },
        priority: {
            type: 'STRING',
            enum: ['High', 'Medium', 'Low'],
            description: 'The priority of the task.'
        },
        deadline: {
            type: 'STRING',
            description: 'Deadline in YYYY-MM-DD format. Return an empty string if no deadline is mentioned.'
        },
        category: {
            type: 'STRING',
            enum: ['Work', 'Personal', 'Study'],
            description: 'Classify the task into Work, Personal, or Study.'
        }
    },
    required: [
        'title',
        'description',
        'priority',
        'deadline',
        'category'
    ],
    propertyOrdering: [
        'title',
        'description',
        'priority',
        'deadline',
        'category'
    ]
};

// Generate task details using Gemini
const generateTaskDetails = async (userInput) => {

    // Check API key
    if (!process.env.GEMINI_API_KEY) {
        throw new Error('Gemini API key is missing. Check your backend .env file.');
    }

    // Validate user input
    if (
        typeof userInput !== 'string' ||
        !userInput.trim()
    ) {
        throw new Error('Please provide a valid task description.');
    }

    // Limit input length
    if (userInput.length > 1000) {
        throw new Error('Task description must not exceed 1000 characters.');
    }

    // Current date in India
    const today = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).format(new Date());

    // Prompt for Gemini
    const prompt = `
You are an intelligent task creation assistant.

Your job is to convert the user's natural language into structured task details.

Today's date is ${today} (India time).

USER INPUT:
"${userInput.trim()}"

Generate the following five fields:

1. TITLE:
   - Create a short, meaningful task title.
   - Do not simply copy the entire user sentence.

2. DESCRIPTION:
   - Explain the task clearly.
   - Keep it concise and useful.
   - Do not invent unnecessary details.

3. PRIORITY:
   - Return exactly one of: High, Medium, Low.
   - Use High if the user explicitly says urgent, important, or high priority.
   - Use Low if the user explicitly says low priority.
   - Otherwise use Medium.

4. DEADLINE:
   - Return the date in YYYY-MM-DD format.
   - Interpret relative dates using today's date.
   - For example, if today is 2026-11-26, tomorrow is 2026-11-27.
   - If the user does not mention a deadline, return an empty string.
   - Never invent a deadline.

5. CATEGORY:
   - Return exactly one of: Work, Personal, Study.
   - Use Study for assignments, exams, homework, learning, and academic tasks.
   - Use Work for office work, jobs, projects, and professional tasks.
   - Use Personal for household activities, shopping, appointments, and personal activities.
   - Choose the most appropriate category based on the task.

IMPORTANT:
- Return all five fields.
- Follow the JSON response schema exactly.
- Do not include explanations outside the JSON.
`;

    try {

        console.log('Generating task details with Gemini...');

        const response = await ai.models.generateContent({
            model: 'gemini-3.5-flash-lite',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseJsonSchema: taskSchema,
                temperature: 0.2
            }
        });

        if (!response.text) {
            throw new Error('Gemini returned an empty response.');
        }

        // Convert JSON response into JavaScript object
        const taskDetails = JSON.parse(response.text);

        // Validate title
        if (
            typeof taskDetails.title !== 'string' ||
            !taskDetails.title.trim()
        ) {
            throw new Error('Generated task title is invalid.');
        }

        // Validate description
        if (typeof taskDetails.description !== 'string') {
            throw new Error('Generated task description is invalid.');
        }

        // Validate priority
        if (!['High', 'Medium', 'Low'].includes(taskDetails.priority)) {
            throw new Error('Generated task priority is invalid.');
        }

        // Validate deadline
        if (
            typeof taskDetails.deadline !== 'string' ||
            (
                taskDetails.deadline !== '' &&
                !/^\d{4}-\d{2}-\d{2}$/.test(taskDetails.deadline)
            )
        ) {
            throw new Error('Generated task deadline is invalid.');
        }

        // Validate category
        if (!['Work', 'Personal', 'Study'].includes(taskDetails.category)) {
            throw new Error('Generated task category is invalid.');
        }

        // Return all five validated fields
        const finalTask = {
            title: taskDetails.title.trim(),
            description: taskDetails.description.trim(),
            priority: taskDetails.priority,
            deadline: taskDetails.deadline,
            category: taskDetails.category
        };

        console.log('GEMINI GENERATED TASK:', finalTask);

        return finalTask;

    } catch (error) {

        console.error('GEMINI SERVICE ERROR:', error.message);

        throw error;
    }
};

module.exports = {
    generateTaskDetails
};
