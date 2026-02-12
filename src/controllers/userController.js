const User = require('../models/User');

// @desc    Get all users (SuperAdmin only)
// @route   GET /api/v1/users
// @access  Private/SuperAdmin
exports.getAllUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        let limit = parseInt(req.query.limit, 10) || 10;
        const roleFilter = req.query.role;

        // Cap limit at 100
        if (limit > 100) limit = 100;

        const query = {};

        // Add role filter if provided
        if (roleFilter && ['teacher', 'parent', 'superadmin'].includes(roleFilter)) {
            query.role = roleFilter;
        }

        const total = await User.countDocuments(query);
        const totalPages = Math.ceil(total / limit);
        const skip = (page - 1) * limit;

        const users = await User.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .select('email firstName lastName role createdAt');

        res.status(200).json({
            success: true,
            data: {
                users: users.map(u => ({
                    id: u._id,
                    email: u.email,
                    firstName: u.firstName,
                    lastName: u.lastName,
                    role: u.role,
                    createdAt: u.createdAt,
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
        console.error('Get All Users Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve users',
        });
    }
};

// @desc    Get current user profile
// @route   GET /api/v1/users/me
// @access  Private
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user profile
// @route   PUT /api/v1/users/me
// @access  Private
exports.updateMe = async (req, res) => {
    try {
        const fieldsToUpdate = {
            firstName: req.body.firstName,
            lastName: req.body.lastName
        };

        const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
            new: true,
            runValidators: true,
        });

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
