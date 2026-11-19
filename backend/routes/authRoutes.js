
const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');
const db = require('../config/db');

const { hashPassword, comparePassword } = require('../utils/passwordUtils');
const { generateToken } = require('../utils/tokenUtils');

const {
    isValidEmail,
    isValidPassword,
    isValidName
} = require('../utils/validationUtils');


// USER REGISTRATION API
router.post('/register', async (req, res) => {

    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({
            message: 'Please provide name, email and password'
        });
    }

    if (typeof name !== 'string' || !isValidName(name)) {
        return res.status(400).json({
            message: 'Please provide a valid name'
        });
    }

    if (typeof email !== 'string' || !isValidEmail(email)) {
        return res.status(400).json({
            message: 'Please provide a valid email'
        });
    }

    if (typeof password !== 'string' || !isValidPassword(password)) {
        return res.status(400).json({
            message: 'Password must contain at least 8 characters, one letter and one number'
        });
    }

    try {

        const cleanName = name.trim();
        const cleanEmail = email.trim().toLowerCase();

        // Check whether email already exists
        const [existingUsers] = await db.execute(
            'SELECT user_id FROM users WHERE email = ?',
            [cleanEmail]
        );

        if (existingUsers.length > 0) {
            return res.status(409).json({
                message: 'Email is already registered'
            });
        }

        // Hash password
        const hashedPassword = await hashPassword(password);

        // Insert user into database
        const [result] = await db.execute(
            'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
            [cleanName, cleanEmail, hashedPassword]
        );

        return res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: result.insertId,
                name: cleanName,
                email: cleanEmail
            }
        });

    } catch (error) {

        console.error('Registration Error:', error.message);

        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                message: 'Email is already registered'
            });
        }

        return res.status(500).json({
            message: 'Server error during registration'
        });
    }

});


// USER LOGIN API
router.post('/login', async (req, res) => {

    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            message: 'Please provide email and password'
        });
    }

    if (typeof email !== 'string' || !isValidEmail(email)) {
        return res.status(400).json({
            message: 'Please provide a valid email'
        });
    }

    if (typeof password !== 'string' || password.length < 8) {
        return res.status(400).json({
            message: 'Invalid password'
        });
    }

    try {

        const cleanEmail = email.trim().toLowerCase();

        // Find user in database
        const [users] = await db.execute(
            'SELECT user_id, name, email, password_hash FROM users WHERE email = ?',
            [cleanEmail]
        );

        if (users.length === 0) {
            return res.status(401).json({
                message: 'Invalid email or password'
            });
        }

        const user = users[0];

        // Compare entered password with stored password hash
        const isPasswordValid = await comparePassword(
            password,
            user.password_hash
        );

        if (!isPasswordValid) {
            return res.status(401).json({
                message: 'Invalid email or password'
            });
        }

        // Generate JWT token
        const token = generateToken(user.user_id);

        return res.status(200).json({
            message: 'Login successful',
            token: token,
            user: {
                id: user.user_id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {

        console.error('Login Error:', error.message);

        return res.status(500).json({
            message: 'Server error during login'
        });
    }

});


// PROTECTED TEST API
router.get('/test-protected', authMiddleware, (req, res) => {

    res.status(200).json({
        message: 'You have accessed a protected route!',
        user: req.user
    });

});


// USER PROFILE API
router.get('/profile', authMiddleware, async (req, res) => {

    try {

        // Fetch authenticated user's details from database
        const [users] = await db.execute(
            'SELECT user_id, name, email, created_at FROM users WHERE user_id = ?',
            [req.user.id]
        );

        if (users.length === 0) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        return res.status(200).json({
            message: 'User profile fetched successfully',
            user: users[0]
        });

    } catch (error) {

        console.error('Profile Error:', error.message);

        return res.status(500).json({
            message: 'Server error while fetching profile'
        });
    }

});


module.exports = router;
