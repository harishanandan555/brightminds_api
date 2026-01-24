const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', {
        expiresIn: '30d',
    });
};

// @desc    Register new user
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = async (req, res) => {
    try {
        let { email, password, role, firstName, lastName } = req.body;

        // Normalize email and role
        if (email) email = email.toLowerCase();
        if (role) role = role.toLowerCase();

        // Check if user exists
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create user
        const user = await User.create({
            email,
            password,
            role,
            firstName,
            lastName,
        });

        if (user) {
            res.status(201).json({
                token: generateToken(user._id),
                user: {
                    id: user._id,
                    email: user.email,
                    role: user.role,
                    firstName: user.firstName,
                    lastName: user.lastName
                },
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error('Registration Error:', error.message);
        res.status(400).json({ message: error.message });
    }
};

// @desc    Authenticate a user
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check for user email
        const user = await User.findOne({ email }).select('+password');

        if (user && (await user.matchPassword(password))) {
            res.json({
                token: generateToken(user._id),
                user: {
                    id: user._id,
                    email: user.email,
                    role: user.role
                },
            });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Logout user / Clear cookie if used
// @route   POST /api/v1/auth/logout
// @access  Private
exports.logout = (req, res) => {
    res.status(200).json({ message: 'User logged out successfully' });
};

// @desc    Forgot Password (Mock)
// @route   POST /api/v1/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
    // In a real app, send email with reset token
    res.status(200).json({ message: 'Password reset link sent to email' });
};

// @desc    Reset Password (Mock)
// @route   POST /api/v1/auth/reset-password
// @access  Public
exports.resetPassword = async (req, res) => {
    // In a real app, verify token and reset
    res.status(200).json({ message: 'Password has been reset' });
};
