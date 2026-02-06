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
    projectName: {
        type: String,
        // required: [true, 'Please add a project name'], // Make optional as we migrate to Student model
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
    // Goals can be array of objects or string (legacy)
    // Structured format: [{ area, description, baseline, target, timeline }]
    // Legacy format: "Goal 1. Goal 2."
    goals: mongoose.Schema.Types.Mixed,

    // Accommodations can be array of objects or string (legacy)
    // Structured format: [{ category, description }]
    // Legacy format: "Accommodation 1, accommodation 2"
    accommodations: mongoose.Schema.Types.Mixed,

    // Related services can be array of objects or string (legacy)
    // Structured format: [{ serviceType, frequency, duration, location }]
    // Legacy format: "Speech Therapy (30 min/week)"
    relatedServices: mongoose.Schema.Types.Mixed,

    // AI Analysis - Using Mixed type to handle various formats
    // Structured format may include: summary, instructionalFocus, strategies, shortTermGoals, longTermGoals, accommodations, services, progressMonitoring, familyCollaboration, actionablePoints, rawText
    aiAnalysis: mongoose.Schema.Types.Mixed,

    // Array of parents who have access to this student's project
    parents: [{
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    }],
    // Progress tracking items derived from AI analysis or manually added
    progressItems: [{
        id: String,
        title: String,
        status: { type: String, enum: ['pending', 'in_progress', 'completed'], default: 'pending' },
        notes: String,
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now }
    }],
    // History log for all progress item changes
    progressHistory: [{
        action: { type: String, enum: ['created', 'updated', 'completed', 'deleted'] },
        itemTitle: String,
        notes: String,
        timestamp: { type: Date, default: Date.now }
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
