const express = require('express');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const router = express.Router();

// Allowed email domain (configurable via env, empty string = allow all domains)
const ALLOWED_DOMAIN = process.env.ALLOWED_EMAIL_DOMAIN || '';

// Callback URL for Google OAuth (must match what's in Google Console)
const CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/api/auth/google/callback';

// Frontend URL for redirect after successful login
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Configure Passport Google Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: CALLBACK_URL,
}, (accessToken, refreshToken, profile, done) => {
    // Extract email from profile
    const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;

    if (!email) {
        return done(null, false, { message: 'No email found in Google profile' });
    }

    // Check if email domain is allowed (skip check if ALLOWED_DOMAIN is empty)
    const emailDomain = email.split('@')[1];
    if (ALLOWED_DOMAIN && emailDomain !== ALLOWED_DOMAIN) {
        return done(null, false, { message: `Only @${ALLOWED_DOMAIN} accounts are allowed` });
    }

    // Create user object
    const user = {
        id: profile.id,
        email: email,
        name: profile.displayName,
        picture: profile.photos && profile.photos[0] ? profile.photos[0].value : null,
    };

    return done(null, user);
}));

// Serialize user to session
passport.serializeUser((user, done) => {
    done(null, user);
});

// Deserialize user from session
passport.deserializeUser((user, done) => {
    done(null, user);
});

// Initiate Google OAuth
router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email'],
}));

// Google OAuth callback
router.get('/google/callback',
    passport.authenticate('google', {
        failureRedirect: '/login?error=unauthorized',
        failureMessage: true,
    }),
    (req, res) => {
        // Successful authentication, redirect to frontend
        res.redirect(FRONTEND_URL);
    }
);

// Get current user profile
router.get('/profile', (req, res) => {
    if (req.isAuthenticated()) {
        res.json({
            authenticated: true,
            user: req.user,
        });
    } else {
        res.json({
            authenticated: false,
            user: null,
        });
    }
});

// Logout
router.post('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to logout' });
        }
        req.session.destroy((err) => {
            if (err) {
                return res.status(500).json({ error: 'Failed to destroy session' });
            }
            res.clearCookie('connect.sid');
            res.json({ success: true, message: 'Logged out successfully' });
        });
    });
});

module.exports = { router, passport };
