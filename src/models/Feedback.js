const mongoose = require('mongoose');

const FeedbackSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    userRole: {
        type: String,
        enum: ['teacher', 'parent', 'admin'],
        required: true,
    },
    type: {
        type: String,
        enum: ['general', 'bug', 'feature', 'improvement', 'question'],
        required: [true, 'Feedback type is required'],
    },
    rating: {
        type: Number,
        min: [1, 'Rating must be at least 1'],
        max: [5, 'Rating cannot be more than 5'],
    },
    message: {
        type: String,
        required: [true, 'Feedback message is required'],
        minlength: [10, 'Feedback message must be at least 10 characters'],
        maxlength: [2000, 'Feedback message cannot exceed 2000 characters'],
    },
    email: {
        type: String,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email',
        ],
    },
    allowContact: {
        type: Boolean,
        default: false,
    },
    status: {
        type: String,
        enum: ['pending', 'reviewed', 'in-progress', 'resolved', 'closed'],
        default: 'pending',
    },
    response: {
        type: String,
    },
    respondedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    respondedAt: {
        type: Date,
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('Feedback', FeedbackSchema);
