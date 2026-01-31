const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
    teacher: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
    },
    student: {
        type: mongoose.Schema.ObjectId,
        ref: 'Student',
    },
    studentName: {
        type: String,
        // required: [true, 'Please add a student name'], // Make optional as we migrate to Student model
    },
    studentAge: {
        type: Number,
        // required: [true, 'Please add student age'],
    },
    gradeLevel: {
        type: String,
        // required: [true, 'Please add grade level'],
    },
    // Eligibility fields moved to Student model
    // Structured IEP Data
    studentProfile: {
        strengths: [String],
        needs: [String],
        interests: [String],
    },
    presentLevels: {
        academic: String,
        functional: String,
        socialEmotional: String,
        behavioral: String,
        // Legacy fallback
        general: String
    },
    goals: [{
        area: String, // e.g., Reading, Math, Behavior
        description: String,
        baseline: String,
        target: String,
        timeline: String,
    }],
    accommodations: [{
        category: String, // e.g., Instruction, Environment, Assessment
        description: String,
    }],
    relatedServices: [{
        serviceType: String, // e.g., Speech-Language, OT
        frequency: String,
        duration: String,
        location: String,
    }],

    // Structured AI Analysis
    aiAnalysis: {
        summary: String,
        instructionalFocus: [{
            area: String,
            details: String
        }],
        strategies: {
            academic: [String],
            cognitive: [String],
            behavioral: [String]
        },
        shortTermGoals: [String],
        longTermGoals: [String],
        accommodations: [String],
        services: [String],
        progressMonitoring: String,
        familyCollaboration: String,
        // Legacy fallback
        rawText: String
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
