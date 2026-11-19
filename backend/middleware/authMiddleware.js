
const { verifyToken } = require('../utils/tokenUtils');

const authMiddleware = (req, res, next) => {

    const authHeader = req.headers.authorization;

    // Check whether token is provided
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            message: 'Access denied. No token provided.'
        });
    }

    const token = authHeader.split(' ')[1];

    try {

        // Verify JWT token
        const decoded = verifyToken(token);

        // Store user ID and role
        req.user = {
            id: decoded.id,
            role: decoded.role
        };

        next();

    } catch (error) {

        return res.status(401).json({
            message: 'Invalid or expired token.'
        });

    }
};

module.exports = authMiddleware;
