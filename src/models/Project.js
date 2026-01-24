const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
    teacher: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
    },
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
    presentLevels: {
        type: String,
    },
    currentPerformance: {
        type: String,
    },
    goals: {
        type: String,
    },
    accommodations: {
        type: String,
    },
    relatedServices: {
        type: [String],
    },
    documents: [
        {
            name: String,
            url: String,
            uploadedAt: {
                type: Date,
                default: Date.now
            }
        }
    ],
    parentSurvey: {
        type: String,
    },
    notes: {
        type: String,
    },
    aiAnalysis: {
        type: String,
    },
    // Array of parents who have access to this student's project
    parents: [{
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    }],
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    }
});

// Update 'updatedAt' on save
// ProjectSchema.pre('save', function () {
//     this.updatedAt = Date.now();
// });

module.exports = mongoose.model('Project', ProjectSchema);
