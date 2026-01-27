/**
 * Authentication middleware to protect routes
 */

const requireAuth = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }

    res.status(401).json({
        error: 'Unauthorized',
        message: 'You must be logged in to access this resource',
    });
};

module.exports = { requireAuth };
