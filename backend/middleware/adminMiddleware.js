
const adminMiddleware = (req, res, next) => {

    // Check whether the logged-in user is an Admin
    if (!req.user || req.user.role !== 'Admin') {
        return res.status(403).json({
            message: 'Access denied. Admin privileges required.'
        });
    }

    next();
};

module.exports = adminMiddleware;
