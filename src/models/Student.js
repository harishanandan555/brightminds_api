const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
    studentName: {
        type: String,
        required: [true, 'Please add a student name'],
    },
    studentAge: {
        type: Number,
        required: [true, 'Please add student age'],
    },
    gradeLevel: {
        type: String,
        required: [true, 'Please add grade level'],
    },
    eligibilityStatus: {
        type: String,
        enum: ['Eligible', 'Ineligible', 'Pending evaluation'],
        default: 'Pending evaluation',
    },
    eligibilityDate: {
        type: Date,
    },
    // Array of parents who manage this student account
    parents: [{
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    }],
    parentSurvey: {
        type: String,
    },
    currentPerformance: {
        type: String,
    },
}, {
    timestamps: true
});

module.exports = mongoose.model('Student', StudentSchema);
