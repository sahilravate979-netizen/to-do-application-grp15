
const jwt = require('jsonwebtoken');

// Generate JWT token
const generateToken = (userId, role) => {
    return jwt.sign(
        {
            id: userId,
            role: role
        },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
    );
};

// Verify JWT token
const verifyToken = (token) => {
    return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = {
    generateToken,
    verifyToken
};
