const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);

    // AWS SDK errors
    if (err.name === 'NoSuchBucket') {
        return res.status(404).json({
            error: 'Bucket Not Found',
            message: 'The specified bucket does not exist'
        });
    }

    if (err.name === 'NoSuchKey') {
        return res.status(404).json({
            error: 'Object Not Found',
            message: 'The specified object does not exist'
        });
    }

    if (err.name === 'AccessDenied' || err.name === 'InvalidAccessKeyId') {
        return res.status(403).json({
            error: 'Access Denied',
            message: 'You do not have permission to access this resource'
        });
    }

    if (err.name === 'CredentialsError') {
        return res.status(500).json({
            error: 'Configuration Error',
            message: 'AWS credentials are not properly configured'
        });
    }

    // Validation errors
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            error: 'Validation Error',
            message: err.message
        });
    }

    // Default error
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        error: err.name || 'Internal Server Error',
        message: err.message || 'An unexpected error occurred',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

module.exports = { errorHandler };
