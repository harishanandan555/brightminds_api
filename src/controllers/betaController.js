const User = require('../models/User');

// @desc    Accept Beta Program
// @route   POST /api/v1/beta/accept
// @access  Private
exports.acceptBeta = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (user.betaProgram && user.betaProgram.hasAccepted) {
            return res.status(409).json({
                success: false,
                message: 'User has already accepted the beta program invitation.'
            });
        }

        user.betaProgram = {
            hasAccepted: true,
            hasDeclined: false,
            acceptedAt: new Date(),
            hasSeenConfirmation: false,
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
        };

        await user.save();

        res.status(200).json({
            success: true,
            message: 'Beta program terms accepted successfully.',
            data: {
                userId: user._id,
                betaProgram: user.betaProgram
            }
        });
    } catch (error) {
        console.error('Accept Beta Error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Decline Beta Program
// @route   POST /api/v1/beta/decline
// @access  Private
exports.declineBeta = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (user.betaProgram && (user.betaProgram.hasAccepted || user.betaProgram.hasDeclined)) {
            return res.status(409).json({
                success: false,
                message: 'User has already responded to the beta program invitation.'
            });
        }

        user.betaProgram = {
            hasAccepted: false,
            hasDeclined: true,
            declinedAt: new Date(),
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
        };

        await user.save();

        res.status(200).json({
            success: true,
            message: 'You have declined. Login access is blocked for the beta program.',
            data: {
                userId: user._id,
                betaProgram: user.betaProgram
            }
        });
    } catch (error) {
        console.error('Decline Beta Error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get Beta Program Status
// @route   GET /api/v1/beta/status
// @access  Private
exports.getBetaStatus = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const betaStatus = user.betaProgram || {
            hasAccepted: false,
            hasDeclined: false,
            hasSeenConfirmation: false
        };

        res.status(200).json({
            success: true,
            data: betaStatus
        });
    } catch (error) {
        console.error('Get Beta Status Error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Mark Confirmation Page as Seen
// @route   PATCH /api/v1/beta/confirmation-seen
// @access  Private
exports.confirmationSeen = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (!user.betaProgram || !user.betaProgram.hasAccepted) {
            return res.status(400).json({
                success: false,
                message: 'User has not accepted the beta program terms yet.'
            });
        }

        user.betaProgram.hasSeenConfirmation = true;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Confirmation page marked as seen.',
            data: {
                hasSeenConfirmation: true
            }
        });
    } catch (error) {
        console.error('Confirmation Seen Error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
