require('dotenv').config();
require('express-async-errors');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const session = require('express-session');

const s3Routes = require('./routes/s3.routes');
const { router: authRoutes, passport } = require('./routes/auth.routes');
const { errorHandler } = require('./middleware/errorHandler');
const { requireAuth } = require('./middleware/authMiddleware');

const app = express();
const PORT = process.env.PORT || 3001;

// Trust proxy is required for secure cookies behind a load balancer (Heroku, AWS ELB, etc.)
app.set('trust proxy', 1);

// Middleware
app.use(helmet({
    contentSecurityPolicy: false, // Disable CSP to allow cross-origin media
}));
app.use(morgan('dev'));
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:8080',
    credentials: true
}));
app.use(express.json());

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'dev-secret-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // Required for cross-origin cookies
    },
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Health check endpoint (public)
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 's3-prism-backend'
    });
});

// Auth routes (public)
app.use('/api/auth', authRoutes);

// Protected API Routes
app.use('/api/s3', requireAuth, s3Routes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: `Cannot ${req.method} ${req.path}`
    });
});

// Error handler (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
    console.log(`🚀 S3 Prism Backend running on port ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌍 CORS enabled for: ${process.env.CORS_ORIGIN || 'http://localhost:8080'}`);
    console.log(`🔐 Google OAuth enabled${process.env.ALLOWED_EMAIL_DOMAIN ? ` for @${process.env.ALLOWED_EMAIL_DOMAIN} accounts` : ' for all domains'}`);
});

module.exports = app;
