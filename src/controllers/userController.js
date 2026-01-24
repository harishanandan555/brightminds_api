const User = require('../models/User');

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
