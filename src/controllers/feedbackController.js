const Feedback = require('../models/Feedback');

// Valid feedback types
const VALID_TYPES = ['general', 'bug', 'feature', 'improvement', 'question'];

// @desc    Submit feedback
// @route   POST /api/v1/feedback
// @access  Private
exports.submitFeedback = async (req, res) => {
    try {
        const { type, rating, message, email, allowContact } = req.body;
        const errors = [];

        // Validate type
        if (!type) {
            errors.push({ field: 'type', message: 'Feedback type is required' });
        } else if (!VALID_TYPES.includes(type)) {
            errors.push({
                field: 'type',
                message: `Invalid feedback type. Must be one of: ${VALID_TYPES.join(', ')}`
            });
        }

        // Validate message
        if (!message) {
            errors.push({ field: 'message', message: 'Feedback message is required and must be at least 10 characters' });
        } else if (message.length < 10) {
            errors.push({ field: 'message', message: 'Feedback message is required and must be at least 10 characters' });
        } else if (message.length > 2000) {
            errors.push({ field: 'message', message: 'Feedback message cannot exceed 2000 characters' });
        }

        // Validate rating if provided
        if (rating !== undefined && rating !== null) {
            if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
                errors.push({ field: 'rating', message: 'Rating must be an integer between 1 and 5' });
            }
        }

        // Validate email if provided
        if (email) {
            const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            if (!emailRegex.test(email)) {
                errors.push({ field: 'email', message: 'Please provide a valid email address' });
            }
        }

        // Return errors if any
        if (errors.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors,
            });
        }

        // Create feedback
        const feedback = await Feedback.create({
            userId: req.user._id,
            userRole: req.user.role,
            type,
            rating,
            message,
            email: email || req.user.email,
            allowContact: allowContact || false,
        });

        res.status(201).json({
            success: true,
            message: 'Feedback submitted successfully',
            data: {
                id: feedback._id,
                type: feedback.type,
                rating: feedback.rating,
                message: feedback.message,
                email: feedback.email,
                allowContact: feedback.allowContact,
                userRole: feedback.userRole,
                userId: feedback.userId,
                status: feedback.status,
                createdAt: feedback.createdAt,
                updatedAt: feedback.updatedAt,
            },
        });
    } catch (error) {
        console.error('Submit Feedback Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to submit feedback',
        });
    }
};

// @desc    Get authenticated user's feedback
// @route   GET /api/v1/feedback/my-feedback
// @access  Private
exports.getMyFeedback = async (req, res) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        let limit = parseInt(req.query.limit, 10) || 10;
        const typeFilter = req.query.type;

        // Cap limit at 50
        if (limit > 50) limit = 50;

        const query = { userId: req.user._id };

        // Add type filter if provided
        if (typeFilter && VALID_TYPES.includes(typeFilter)) {
            query.type = typeFilter;
        }

        const total = await Feedback.countDocuments(query);
        const totalPages = Math.ceil(total / limit);
        const skip = (page - 1) * limit;

        const feedback = await Feedback.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .select('type rating message status response createdAt updatedAt');

        res.status(200).json({
            success: true,
            data: {
                feedback: feedback.map(f => ({
                    id: f._id,
                    type: f.type,
                    rating: f.rating,
                    message: f.message,
                    status: f.status,
                    response: f.response,
                    createdAt: f.createdAt,
                    updatedAt: f.updatedAt,
                })),
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalItems: total,
                    itemsPerPage: limit,
                },
            },
        });
    } catch (error) {
        console.error('Get My Feedback Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve feedback',
        });
    }
};

// @desc    Get all feedback (SuperAdmin only)
// @route   GET /api/v1/feedback
// @access  Private/SuperAdmin
exports.getAllFeedback = async (req, res) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        let limit = parseInt(req.query.limit, 10) || 10;
        const typeFilter = req.query.type;
        const statusFilter = req.query.status;

        // Cap limit at 100
        if (limit > 100) limit = 100;

        const query = {};

        // Add type filter if provided
        if (typeFilter && VALID_TYPES.includes(typeFilter)) {
            query.type = typeFilter;
        }

        // Add status filter if provided
        const validStatuses = ['pending', 'reviewed', 'in-progress', 'resolved', 'closed'];
        if (statusFilter && validStatuses.includes(statusFilter)) {
            query.status = statusFilter;
        }

        const total = await Feedback.countDocuments(query);
        const totalPages = Math.ceil(total / limit);
        const skip = (page - 1) * limit;

        const feedback = await Feedback.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('userId', 'email firstName lastName');

        res.status(200).json({
            success: true,
            data: {
                feedback: feedback.map(f => ({
                    id: f._id,
                    type: f.type,
                    rating: f.rating,
                    message: f.message,
                    email: f.email,
                    allowContact: f.allowContact,
                    userRole: f.userRole,
                    user: f.userId ? {
                        id: f.userId._id,
                        email: f.userId.email,
                        firstName: f.userId.firstName,
                        lastName: f.userId.lastName,
                    } : null,
                    status: f.status,
                    response: f.response,
                    createdAt: f.createdAt,
                    updatedAt: f.updatedAt,
                })),
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalItems: total,
                    itemsPerPage: limit,
                },
            },
        });
    } catch (error) {
        console.error('Get All Feedback Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve feedback',
        });
    }
};
