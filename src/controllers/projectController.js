const Project = require('../models/Project');
const Student = require('../models/Student');
const User = require('../models/User');

// @desc    List all projects (students)
// @route   GET /api/v1/projects
// @access  Private (Teacher)
exports.getProjects = async (req, res) => {
    try {
        const projects = await Project.find({ teacher: req.user.id }).populate('student');
        res.status(200).json(projects);
    } catch (error) {
        console.error('Error in getProjects:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get project details
// @route   GET /api/v1/projects/:id
// @access  Private (Teacher/Parent)
exports.getProject = async (req, res) => {
    try {
        // Validate ID format
        if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(404).json({ message: 'Project not found (Invalid ID)' });
        }

        const project = await Project.findById(req.params.id).populate('student');

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // Check access rights
        if (project.teacher.toString() !== req.user.id) {
            // Check if user is a parent of this project
            if (req.user.role === 'parent') {
                if (!project.parents.map(p => p.toString()).includes(req.user.id)) {
                    return res.status(403).json({ message: 'Not authorized' });
                }
            } else {
                return res.status(403).json({ message: 'Not authorized' });
            }
        }

        res.status(200).json(project);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create new project
// @route   POST /api/v1/projects
// @access  Private (Teacher)
// @desc    Create new project
// @route   POST /api/v1/projects
// @access  Private (Teacher)
exports.createProject = async (req, res) => {
    try {
        // Add user to req.body
        req.body.teacher = req.user.id;

        // Check if studentId is provided
        if (req.body.studentId) {
            const student = await Student.findById(req.body.studentId);
            if (!student) {
                return res.status(404).json({ success: false, message: 'Student not found with id of ' + req.body.studentId });
            }
            req.body.student = req.body.studentId;
        } else if (req.body.projectName) {
            // Create new Student if not provided but details are present
            // Note: Student model still uses studentName, so we map projectName to studentName for student creation
            const student = await Student.create({
                studentName: req.body.projectName,
                studentAge: req.body.studentAge,
                gradeLevel: req.body.gradeLevel,
                // Add other fields if necessary
            });
            req.body.student = student.id;
        }

        const project = await Project.create(req.body);

        res.status(201).json(project);
    } catch (error) {
        console.error('Error in createProject:', error);
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update project
// @route   PUT /api/v1/projects/:id
// @access  Private (Teacher)
exports.updateProject = async (req, res) => {
    try {
        if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(404).json({ message: 'Project not found (Invalid ID)' });
        }

        let project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        if (project.teacher.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to update this project' });
        }

        // Map 'analysis' to 'aiAnalysis' if frontend sends 'analysis'
        const updateData = { ...req.body };
        if (updateData.analysis && !updateData.aiAnalysis) {
            updateData.aiAnalysis = updateData.analysis;
            delete updateData.analysis;
        }

        project = await Project.findByIdAndUpdate(req.params.id, updateData, {
            new: true,
            runValidators: true,
        });

        res.status(200).json(project);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete project
// @route   DELETE /api/v1/projects/:id
// @access  Private (Teacher)
exports.deleteProject = async (req, res) => {
    try {
        if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(404).json({ message: 'Project not found (Invalid ID)' });
        }

        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        if (project.teacher.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to delete this project' });
        }

        await project.deleteOne();

        res.status(200).json({ message: 'Project removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Upload document
// @route   POST /api/v1/projects/:id/documents
// @access  Private (Teacher)
exports.uploadDocument = async (req, res) => {
    // In a real implementation, handle file upload using multer or similar
    res.status(201).json({ message: 'Document uploaded successfully (Mock)' });
};

// @desc    Delete document
// @route   DELETE /api/v1/projects/:id/documents/:documentId
// @access  Private (Teacher)
exports.deleteDocument = async (req, res) => {
    // In a real implementation, delete file from storage and remove from DB array
    res.status(200).json({ message: 'Document deleted successfully (Mock)' });
};

// @desc    Generate AI Analysis
// @route   POST /api/v1/projects/analysis
// @access  Private (Teacher)
// @desc    Generate AI Analysis
// @route   POST /api/v1/projects/analysis
// @access  Private (Teacher)
exports.generateAnalysis = async (req, res) => {
    try {
        const {
            projectName,
            gradeLevel,
            studentAge,
            presentLevels,
            currentPerformance,
            goals,
            accommodations,
            relatedServices
        } = req.body;

        if (!process.env.OPENAI_API_KEY) {
            return res.status(500).json({ message: 'OpenAI API key not configured' });
        }

        const prompt = `Analyze the following student profile for ${projectName}, Grade ${gradeLevel}, Age ${studentAge}.
        
        Present Levels: ${presentLevels}
        Performance: ${currentPerformance}
        Goals: ${goals}
        Accommodations: ${accommodations}
        Services: ${relatedServices ? relatedServices.join(', ') : 'None'}

        Based on this data, generate a detailed Instructional Planning Plan in strictly valid JSON format.
        Do not include markdown formatting (like \`\`\`json). Return ONLY the JSON object.

        The JSON structure must be exactly as follows:
        {
            "summary": "Brief summary of the plan...",
            "instructionalFocus": [
                { "area": "Academic/Cognitive/Functional/Generalization", "details": "Specific details..." }
            ],
            "strategies": {
                "academic": ["Strategy 1", "Strategy 2"],
                "cognitive": ["Strategy 1"],
                "behavioral": ["Strategy 1"]
            },
            "shortTermGoals": ["Goal 1", "Goal 2"],
            "longTermGoals": ["Goal 1", "Goal 2"],
            "accommodations": ["Accommodation 1"],
            "services": ["Service 1"],
            "progressMonitoring": "Plan for monitoring...",
            "familyCollaboration": "Plan for family..."
        }`;

        const OpenAI = require('openai');
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });

        const completion = await openai.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'gpt-3.5-turbo',
            response_format: { type: "json_object" }, // Ensure JSON mode if supported
        });

        let analysisContent = completion.choices[0].message.content;

        // Clean up markdown if present (just in case)
        if (analysisContent.startsWith('```json')) {
            analysisContent = analysisContent.replace(/^```json\n/, '').replace(/\n```$/, '');
        } else if (analysisContent.startsWith('```')) {
            analysisContent = analysisContent.replace(/^```\n/, '').replace(/\n```$/, '');
        }

        let analysis;
        try {
            analysis = JSON.parse(analysisContent);
        } catch (e) {
            console.error('Failed to parse AI response as JSON', analysisContent);
            // Fallback to raw text if parsing fails
            analysis = {
                rawText: analysisContent,
                summary: "Analysis generated but failed parsing. See raw text."
            };
        }

        // If projectId is provided, save to database
        if (req.body.projectId) {
            const project = await Project.findById(req.body.projectId);

            if (project) {
                // Check authorization
                if (project.teacher.toString() === req.user.id) {
                    project.aiAnalysis = analysis;
                    await project.save();
                } else {
                    console.warn(`User ${req.user.id} attempted to save analysis to project ${project._id} without auth`);
                }
            }
        }

        res.status(200).json({
            analysis
        });
    } catch (error) {
        console.error('AI Analysis Error:', error);
        res.status(500).json({ message: 'Failed to generate analysis', error: error.message });
    }
};

// @desc    Generate AI Analysis for a specific project
// @route   POST /api/v1/projects/:id/analysis
// @access  Private (Teacher)
exports.generateProjectAnalysis = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // Check authorization
        if (project.teacher.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        if (!process.env.OPENAI_API_KEY) {
            return res.status(500).json({ message: 'OpenAI API key not configured' });
        }

        const {
            projectName,
            gradeLevel,
            studentAge,
            presentLevels,
            currentPerformance,
            goals,
            accommodations,
            relatedServices
        } = project;

        const prompt = `Analyze the following student profile for ${projectName}, Grade ${gradeLevel}, Age ${studentAge}.
        
        Present Levels: ${presentLevels || 'Not provided'}
        Performance: ${currentPerformance || 'Not provided'}
        Goals: ${goals || 'Not provided'}
        Accommodations: ${accommodations || 'Not provided'}
        Services: ${relatedServices && relatedServices.length > 0 ? relatedServices.join(', ') : 'None'}

        Based on this data, generate a detailed Instructional Planning Plan in strictly valid JSON format.
        Do not include markdown formatting (like \`\`\`json). Return ONLY the JSON object.

        The JSON structure must be exactly as follows:
        {
            "summary": "Brief summary of the plan...",
            "instructionalFocus": [
                { "area": "Academic/Cognitive/Functional/Generalization", "details": "Specific details..." }
            ],
            "strategies": {
                "academic": ["Strategy 1", "Strategy 2"],
                "cognitive": ["Strategy 1"],
                "behavioral": ["Strategy 1"]
            },
            "shortTermGoals": ["Goal 1", "Goal 2"],
            "longTermGoals": ["Goal 1", "Goal 2"],
            "accommodations": ["Accommodation 1"],
            "services": ["Service 1"],
            "progressMonitoring": "Plan for monitoring...",
            "familyCollaboration": "Plan for family...",
            "actionablePoints": [
                {
                    "category": "academic|behavioral|social|communication|motor|self-care",
                    "title": "Short actionable title",
                    "description": "Detailed description of what needs to be achieved",
                    "priority": "high|medium|low",
                    "timeline": "short-term|long-term"
                }
            ]
        }
        
        IMPORTANT: Generate 8-12 actionable points covering all areas of the student's needs. Each actionable point should be specific, measurable, and ready to be tracked as a progress item.`;

        const OpenAI = require('openai');
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });

        const completion = await openai.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'gpt-3.5-turbo',
            response_format: { type: "json_object" },
        });

        let analysisContent = completion.choices[0].message.content;

        // Clean up markdown if present
        if (analysisContent.startsWith('```json')) {
            analysisContent = analysisContent.replace(/^```json\n/, '').replace(/\n```$/, '');
        } else if (analysisContent.startsWith('```')) {
            analysisContent = analysisContent.replace(/^```\n/, '').replace(/\n```$/, '');
        }

        let analysis;
        try {
            analysis = JSON.parse(analysisContent);
        } catch (e) {
            console.error('Failed to parse AI response as JSON', analysisContent);
            analysis = {
                rawText: analysisContent,
                summary: "Analysis generated but failed parsing. See raw text."
            };
        }

        // Save analysis to database
        project.aiAnalysis = analysis;

        // Auto-create progress items from goals
        const progressItems = [];
        const progressHistory = [];
        const now = new Date();
        const mongoose = require('mongoose');

        // Extract short-term goals
        if (analysis.shortTermGoals && Array.isArray(analysis.shortTermGoals)) {
            analysis.shortTermGoals.forEach(goal => {
                const item = {
                    id: new mongoose.Types.ObjectId().toString(),
                    title: `[Short-term] ${goal}`,
                    status: 'pending',
                    notes: '',
                    createdAt: now,
                    updatedAt: now
                };
                progressItems.push(item);
                progressHistory.push({
                    action: 'created',
                    itemTitle: item.title,
                    notes: 'Auto-created from AI analysis',
                    timestamp: now
                });
            });
        }

        // Extract long-term goals
        if (analysis.longTermGoals && Array.isArray(analysis.longTermGoals)) {
            analysis.longTermGoals.forEach(goal => {
                const item = {
                    id: new mongoose.Types.ObjectId().toString(),
                    title: `[Long-term] ${goal}`,
                    status: 'pending',
                    notes: '',
                    createdAt: now,
                    updatedAt: now
                };
                progressItems.push(item);
                progressHistory.push({
                    action: 'created',
                    itemTitle: item.title,
                    notes: 'Auto-created from AI analysis',
                    timestamp: now
                });
            });
        }

        // Update project with progress items (replace existing if re-running analysis)
        project.progressItems = progressItems;
        project.progressHistory = [...(project.progressHistory || []), ...progressHistory];

        await project.save();

        // Add actionable points from AI analysis directly to progressItems
        if (analysis.actionablePoints && Array.isArray(analysis.actionablePoints)) {
            analysis.actionablePoints.forEach((point) => {
                const item = {
                    id: new mongoose.Types.ObjectId().toString(),
                    title: `[${point.priority ? point.priority.charAt(0).toUpperCase() + point.priority.slice(1) : 'Medium'}] ${point.title}`,
                    status: 'pending',
                    notes: `Category: ${point.category || 'General'}\nTimeline: ${point.timeline || 'Not specified'}\n${point.description || ''}`,
                    createdAt: now,
                    updatedAt: now
                };
                progressItems.push(item);
                progressHistory.push({
                    action: 'created',
                    itemTitle: item.title,
                    notes: 'Auto-created from AI analysis actionable points',
                    timestamp: now
                });
            });
        }

        // Update project with progress items (replace existing if re-running analysis)
        project.progressItems = progressItems;
        project.progressHistory = [...(project.progressHistory || []), ...progressHistory];

        await project.save();

        // Build point-wise goals response
        const points = [];

        // Add summary as the first point
        if (analysis.summary) {
            points.push({
                type: 'summary',
                priority: 'info',
                text: analysis.summary
            });
        }

        // Add short-term goals
        if (analysis.shortTermGoals && Array.isArray(analysis.shortTermGoals)) {
            analysis.shortTermGoals.forEach(goal => {
                points.push({
                    type: 'short-term-goal',
                    priority: 'high',
                    text: goal
                });
            });
        }

        // Add long-term goals
        if (analysis.longTermGoals && Array.isArray(analysis.longTermGoals)) {
            analysis.longTermGoals.forEach(goal => {
                points.push({
                    type: 'long-term-goal',
                    priority: 'medium',
                    text: goal
                });
            });
        }

        // Add actionable points
        if (analysis.actionablePoints && Array.isArray(analysis.actionablePoints)) {
            analysis.actionablePoints.forEach(point => {
                points.push({
                    type: 'action',
                    category: point.category || 'general',
                    priority: point.priority || 'medium',
                    timeline: point.timeline || 'short-term',
                    text: point.title,
                    description: point.description
                });
            });
        }

        // Add accommodations
        if (analysis.accommodations && Array.isArray(analysis.accommodations)) {
            analysis.accommodations.forEach(acc => {
                points.push({
                    type: 'accommodation',
                    priority: 'medium',
                    text: acc
                });
            });
        }

        // Add strategies as points
        if (analysis.strategies) {
            ['academic', 'cognitive', 'behavioral'].forEach(strategyType => {
                if (analysis.strategies[strategyType] && Array.isArray(analysis.strategies[strategyType])) {
                    analysis.strategies[strategyType].forEach(strategy => {
                        points.push({
                            type: 'strategy',
                            category: strategyType,
                            priority: 'medium',
                            text: strategy
                        });
                    });
                }
            });
        }

        res.status(200).json({
            summary: analysis.summary,
            points,
            progressItems: project.progressItems,
            progressHistory: project.progressHistory,
            // Keep full analysis for reference
            fullAnalysis: analysis
        });
    } catch (error) {
        console.error('AI Analysis Error:', error);
        res.status(500).json({ message: 'Failed to generate analysis', error: error.message });
    }
};

// @desc    Add parent to project
// @route   POST /api/v1/projects/:id/parents
// @access  Private (Teacher)
exports.addParent = async (req, res) => {
    try {
        const { email } = req.body;
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // Check if user is the teacher of the project
        if (project.teacher.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to add parents to this project' });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.role !== 'parent') {
            return res.status(400).json({ message: 'User is not a parent' });
        }

        // Check if already added
        if (project.parents.includes(user._id)) {
            return res.status(400).json({ message: 'Parent already added to project' });
        }

        project.parents.push(user._id);
        await project.save();

        res.status(200).json({ message: 'Parent added', parents: project.parents });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Remove parent from project
// @route   DELETE /api/v1/projects/:id/parents/:parentId
// @access  Private (Teacher)
exports.removeParent = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // Check if user is the teacher of the project
        if (project.teacher.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to remove parents from this project' });
        }

        // Remove parent
        project.parents = project.parents.filter(
            (parent) => parent.toString() !== req.params.parentId
        );

        await project.save();

        res.status(200).json({ message: 'Parent removed', parents: project.parents });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all progress items for a project
// @route   GET /api/v1/projects/:id/progress-item
// @access  Private (Teacher/Parent)
exports.getProgressItems = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found' });
        }

        // Check authorization - teacher or parent can view
        const isTeacher = project.teacher && project.teacher.toString() === req.user.id;
        const isParent = project.parents && project.parents.includes(req.user.id);

        if (!isTeacher && !isParent) {
            return res.status(403).json({ success: false, message: 'Not authorized to view this project' });
        }

        res.status(200).json({
            success: true,
            progressItems: project.progressItems || [],
            progressHistory: project.progressHistory || [],
            count: (project.progressItems || []).length
        });
    } catch (error) {
        console.error('Error getting progress items:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Add progress items (array of items)
// @route   POST /api/v1/projects/:id/progress-item
// @access  Private (Teacher)
exports.addProgressItem = async (req, res) => {
    try {
        let { items } = req.body;
        const mongoose = require('mongoose');

        console.log('addProgressItem called with body:', JSON.stringify(req.body));
        console.log('Project ID:', req.params.id);

        // Validate project ID format
        if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ success: false, message: 'Invalid project ID format' });
        }

        // Support backward compatibility: if 'title' is provided directly, convert to items array
        if (!items && req.body.title) {
            items = [{ title: req.body.title, status: req.body.status, notes: req.body.notes }];
        }

        // Validate items array
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Items array is required. Example: { "items": [{ "title": "Goal 1" }, { "title": "Goal 2" }] }'
            });
        }

        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found' });
        }

        // Check authorization
        if (project.teacher.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        // Initialize arrays if not present
        if (!project.progressItems) {
            project.progressItems = [];
        }
        if (!project.progressHistory) {
            project.progressHistory = [];
        }

        const now = new Date();
        const addedItems = [];

        for (const item of items) {
            if (!item.title) {
                continue; // Skip items without title
            }

            const newItem = {
                id: new mongoose.Types.ObjectId().toString(),
                title: item.title,
                status: item.status || 'pending',
                notes: item.notes || '',
                createdAt: now,
                updatedAt: now
            };

            project.progressItems.push(newItem);
            addedItems.push(newItem);

            project.progressHistory.push({
                action: 'created',
                itemTitle: item.title,
                notes: item.notes || '',
                timestamp: now
            });
        }

        if (addedItems.length === 0) {
            return res.status(400).json({ success: false, message: 'No valid items to add (title is required for each item)' });
        }

        await project.save();

        console.log('Successfully added', addedItems.length, 'progress items');

        res.status(201).json({
            success: true,
            progressItems: addedItems,
            addedCount: addedItems.length
        });
    } catch (error) {
        console.error('Error adding progress item:', error.message);
        console.error('Stack:', error.stack);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update a progress item
// @route   PUT /api/v1/projects/:id/progress-item/:itemId
// @access  Private (Teacher)
exports.updateProgressItem = async (req, res) => {
    try {
        // Support itemId from path parameter or body (backward compatible)
        const itemId = req.params.itemId || req.body.itemId;
        const { title, status, notes } = req.body;

        if (!itemId) {
            return res.status(400).json({ success: false, message: 'Item ID is required' });
        }

        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found' });
        }

        // Check authorization
        if (project.teacher.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        // Find the progress item
        const itemIndex = project.progressItems?.findIndex(item => item.id === itemId);

        if (itemIndex === -1 || itemIndex === undefined) {
            return res.status(404).json({ success: false, message: 'Progress item not found' });
        }

        const item = project.progressItems[itemIndex];
        const previousStatus = item.status;

        // Update fields
        if (title !== undefined) item.title = title;
        if (status !== undefined) item.status = status;
        if (notes !== undefined) item.notes = notes;
        item.updatedAt = new Date();

        // Determine action for history
        let action = 'updated';
        if (status === 'completed' && previousStatus !== 'completed') {
            action = 'completed';
        }

        // Add history entry
        if (!project.progressHistory) {
            project.progressHistory = [];
        }
        project.progressHistory.push({
            action,
            itemTitle: item.title,
            notes: notes || '',
            timestamp: new Date()
        });

        await project.save();

        res.status(200).json({
            success: true,
            progressItem: project.progressItems[itemIndex]
        });
    } catch (error) {
        console.error('Error updating progress item:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete a progress item
// @route   DELETE /api/v1/projects/:id/progress-item/:itemId
// @access  Private (Teacher)
exports.deleteProgressItem = async (req, res) => {
    try {
        const { itemId } = req.params;

        if (!itemId) {
            return res.status(400).json({ success: false, message: 'Item ID is required' });
        }

        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found' });
        }

        // Check authorization
        if (project.teacher.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        // Find the progress item
        const itemIndex = project.progressItems?.findIndex(item => item.id === itemId);

        if (itemIndex === -1 || itemIndex === undefined) {
            return res.status(404).json({ success: false, message: 'Progress item not found' });
        }

        const deletedItem = project.progressItems[itemIndex];

        // Remove the item
        project.progressItems.splice(itemIndex, 1);

        // Add history entry
        if (!project.progressHistory) {
            project.progressHistory = [];
        }
        project.progressHistory.push({
            action: 'deleted',
            itemTitle: deletedItem.title,
            notes: '',
            timestamp: new Date()
        });

        await project.save();

        res.status(200).json({
            success: true,
            message: 'Progress item deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting progress item:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Extract IEP from uploaded PDF/DOCX file
// @route   POST /api/v1/projects/extract-iep
// @access  Private (Teacher)
exports.extractIEP = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded. Please upload a PDF or DOCX file.'
            });
        }

        const file = req.file;
        let extractedText = '';

        // Extract text based on file type
        if (file.mimetype === 'application/pdf') {
            const pdfParse = require('pdf-parse');
            const pdfData = await pdfParse(file.buffer);
            extractedText = pdfData.text;
        } else if (
            file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
            file.mimetype === 'application/msword'
        ) {
            const mammoth = require('mammoth');
            const result = await mammoth.extractRawText({ buffer: file.buffer });
            extractedText = result.value;
        } else {
            return res.status(400).json({
                success: false,
                message: 'Unsupported file type. Only PDF and DOCX are supported.'
            });
        }

        if (!extractedText || extractedText.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Could not extract text from the file. The file may be empty or corrupted.'
            });
        }

        // Use OpenAI to parse the IEP text into structured format
        if (!process.env.OPENAI_API_KEY) {
            return res.status(500).json({
                success: false,
                message: 'OpenAI API key not configured'
            });
        }

        const OpenAI = require('openai');
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });

        const prompt = `You are an expert at parsing IEP (Individualized Education Program) documents. 
        
Analyze the following IEP document text and extract structured information. Return ONLY a valid JSON object with no markdown formatting.

IEP Document Text:
${extractedText.substring(0, 15000)}

Extract and return the following JSON structure (use null for fields that cannot be determined):
{
    "studentName": "Full name of the student",
    "projectName": "Full name of the student (used as Project Name)",
    "gradeLevel": "Grade level (e.g., '6th grade')",
    "studentAge": null,
    "eligibility": {
        "status": "Eligible/Ineligible/Pending",
        "category": "Primary disability category (e.g., 'Intellectual Disability', 'Autism', etc.)",
        "fieDate": "Full Individual Evaluation date if mentioned"
    },
    "meetingInfo": {
        "date": "ARD/IEP meeting date",
        "type": "Type of meeting (Annual, Initial, etc.)",
        "participants": ["List of participants"]
    },
    "studentProfile": {
        "strengths": ["List of student strengths"],
        "needs": ["List of student needs/challenges"],
        "interests": ["Student interests if mentioned"]
    },
    "presentLevels": {
        "academic": "Academic performance summary",
        "functional": "Functional performance",
        "behavioral": "Behavioral observations",
        "socialEmotional": "Social/emotional status"
    },
    "goals": [
        {
            "area": "Goal area (Academic, Behavioral, etc.)",
            "description": "Goal description",
            "baseline": "Current baseline if mentioned",
            "target": "Target/objective",
            "timeline": "Timeline if mentioned"
        }
    ],
    "accommodations": [
        {
            "category": "Daily/Testing/Classroom",
            "description": "Accommodation description"
        }
    ],
    "relatedServices": [
        {
            "serviceType": "Type of service",
            "frequency": "How often",
            "duration": "Duration",
            "location": "Where provided"
        }
    ],
    "scheduleOfServices": {
        "generalEducation": "Percentage or description of gen ed participation",
        "specialEducation": "SPED setting details",
        "esy": "Extended School Year status"
    },
    "assessments": {
        "stateAssessments": ["List of state assessments like STAAR"],
        "withAccommodations": true
    },
    "additionalInfo": {
        "ssesId": "SSES unique ID if mentioned",
        "homeCampus": "Home school/campus",
        "transportation": "Special transportation needs"
    }
}`;

        const completion = await openai.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'gpt-3.5-turbo',
            response_format: { type: "json_object" },
        });

        let iepContent = completion.choices[0].message.content;

        // Clean up markdown if present
        if (iepContent.startsWith('```json')) {
            iepContent = iepContent.replace(/^```json\n/, '').replace(/\n```$/, '');
        } else if (iepContent.startsWith('```')) {
            iepContent = iepContent.replace(/^```\n/, '').replace(/\n```$/, '');
        }

        let iepData;
        try {
            iepData = JSON.parse(iepContent);
        } catch (e) {
            console.error('Failed to parse AI response as JSON', iepContent);
            return res.status(500).json({
                success: false,
                message: 'Failed to parse IEP data. Please try again.',
                rawText: iepContent
            });
        }

        // Map to Project-compatible format for easy project creation
        const projectData = {
            projectName: iepData.studentName, // Use student name as project name
            gradeLevel: iepData.gradeLevel,
            studentAge: iepData.studentAge,
            studentProfile: iepData.studentProfile,
            presentLevels: iepData.presentLevels,
            goals: iepData.goals,
            accommodations: iepData.accommodations,
            relatedServices: iepData.relatedServices
        };

        res.status(200).json({
            success: true,
            message: 'IEP extracted successfully',
            iepData: iepData,
            projectData: projectData,
            extractedTextLength: extractedText.length
        });

    } catch (error) {
        console.error('IEP Extraction Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to extract IEP',
            error: error.message
        });
    }
};
