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
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get project details
// @route   GET /api/v1/projects/:id
// @access  Private (Teacher/Parent)
exports.getProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id).populate('student');

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // Check access rights
        if (project.teacher.toString() !== req.user.id) {
            // Check if user is a parent of this project
            if (req.user.role === 'parent') {
                if (!project.parents.includes(req.user.id)) {
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
        } else if (req.body.studentName) {
            // Create new Student if not provided but details are present
            const student = await Student.create({
                studentName: req.body.studentName,
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
        let project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        if (project.teacher.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to update this project' });
        }

        project = await Project.findByIdAndUpdate(req.params.id, req.body, {
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
            studentName,
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

        const prompt = `Analyze the following student profile for ${studentName}, Grade ${gradeLevel}, Age ${studentAge}.
        
        Present Levels: ${presentLevels}
        Performance: ${currentPerformance}
        Goals: ${goals}
        Accommodations: ${accommodations}
        Services: ${relatedServices ? relatedServices.join(', ') : 'None'}

        Based on this data, generate a detailed Instructional Planning Plan structured strictly as follows:

        1. Instructional Focus Areas
           - Based on present levels and current performance data, prioritize:
             * Academic skill development with structured support
             * Cognitive engagement and independent task completion
             * Functional skills including attention, organization, and self-regulation
             * Generalization of skills across settings

        2. Instructional Strategies
           - Academic Instruction: Explicit instruction, small steps, visual supports, small-group/1:1, immediate feedback.
           - Cognitive & Executive Function Support: Visual schedules, task initiation strategies, cues, processing time.
           - Functional & Behavioral Instruction: Teach expectations, reinforce positive behaviors, structured routines, self-monitoring.

        3. Goal-Aligned Instruction
           - Short-Term Instructional Plan: Practice frequency, embedding in routines, progress monitoring tools (weekly data, logs, samples).
           - Long-Term Instructional Plan: Increasing independence, fading prompts, generalization, future expectations.

        4. Accommodations & Supports Implementation
           - Detail specific supports (extended time, preferential seating, visual aids, modified assignments, assistive tech) and ensure consistent use.

        5. Related Services Integration
           - Align with classroom instruction: Speech-Language, OT, Behavior Intervention, Counseling, Assistive Tech, Transportation.

        6. Progress Monitoring & Review Plan
           - Monthly review, goal adjustment, strategy revision, documentation.

        7. Family Collaboration Plan
           - Regular updates, home strategies, feedback during meetings, consistent communication.

        8. AI Analysis & Summary (Planning Rationale)
           - Provide a summary explaining how this plan builds on strengths and addresses needs to promote growth.`;

        const OpenAI = require('openai');
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });

        const completion = await openai.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'gpt-3.5-turbo',
        });

        const analysis = completion.choices[0].message.content;

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
            studentName,
            gradeLevel,
            studentAge,
            presentLevels,
            currentPerformance,
            goals,
            accommodations,
            relatedServices
        } = project;

        const prompt = `Analyze the following student profile for ${studentName}, Grade ${gradeLevel}, Age ${studentAge}.
        
        Present Levels: ${presentLevels || 'Not provided'}
        Performance: ${currentPerformance || 'Not provided'}
        Goals: ${goals || 'Not provided'}
        Accommodations: ${accommodations || 'Not provided'}
        Services: ${relatedServices && relatedServices.length > 0 ? relatedServices.join(', ') : 'None'}

        Based on this data, generate a detailed Instructional Planning Plan structured strictly as follows:

        1. Instructional Focus Areas
           - Based on present levels and current performance data, prioritize:
             * Academic skill development with structured support
             * Cognitive engagement and independent task completion
             * Functional skills including attention, organization, and self-regulation
             * Generalization of skills across settings

        2. Instructional Strategies
           - Academic Instruction: Explicit instruction, small steps, visual supports, small-group/1:1, immediate feedback.
           - Cognitive & Executive Function Support: Visual schedules, task initiation strategies, cues, processing time.
           - Functional & Behavioral Instruction: Teach expectations, reinforce positive behaviors, structured routines, self-monitoring.

        3. Goal-Aligned Instruction
           - Short-Term Instructional Plan: Practice frequency, embedding in routines, progress monitoring tools (weekly data, logs, samples).
           - Long-Term Instructional Plan: Increasing independence, fading prompts, generalization, future expectations.

        4. Accommodations & Supports Implementation
           - Detail specific supports (extended time, preferential seating, visual aids, modified assignments, assistive tech) and ensure consistent use.

        5. Related Services Integration
           - Align with classroom instruction: Speech-Language, OT, Behavior Intervention, Counseling, Assistive Tech, Transportation.

        6. Progress Monitoring & Review Plan
           - Monthly review, goal adjustment, strategy revision, documentation.

        7. Family Collaboration Plan
           - Regular updates, home strategies, feedback during meetings, consistent communication.

        8. AI Analysis & Summary (Planning Rationale)
           - Provide a summary explaining how this plan builds on strengths and addresses needs to promote growth.`;

        const OpenAI = require('openai');
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });

        const completion = await openai.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'gpt-3.5-turbo',
        });

        const analysis = completion.choices[0].message.content;

        // Save to database
        project.aiAnalysis = analysis;
        await project.save();

        res.status(200).json({
            analysis
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
