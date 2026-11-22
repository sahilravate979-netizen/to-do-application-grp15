
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

        const decoded = verifyToken(token);

        req.user = decoded;

        next();

    } catch (error) {

        return res.status(401).json({
            message: 'Invalid or expired token.'
        });

    }
};

module.exports = authMiddleware;
