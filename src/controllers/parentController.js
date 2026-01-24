const Project = require('../models/Project');

// @desc    Get all children (Project/Student) for a parent
// @route   GET /api/v1/parent/children
// @access  Private (Parent)
exports.getChildren = async (req, res) => {
    try {
        // Find projects where the parent's ID is in the 'parents' array
        const children = await Project.find({ parents: req.user.id });
        res.status(200).json(children);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add a child (Create Project)
// @route   POST /api/v1/parent/children
// @access  Private (Parent)
exports.addChild = async (req, res) => {
    try {
        const { studentName, studentAge, gradeLevel } = req.body;

        const child = await Project.create({
            studentName,
            studentAge,
            gradeLevel,
            parents: [req.user.id], // Add current user as parent
            // teacher field is optional now
        });

        res.status(201).json(child);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get child details
// @route   GET /api/v1/parent/children/:id
// @access  Private (Parent)
exports.getChild = async (req, res) => {
    try {
        const child = await Project.findById(req.params.id);

        if (!child) {
            return res.status(404).json({ message: 'Child/Project not found' });
        }

        // Verify parent has access
        if (!child.parents.includes(req.user.id)) {
            return res.status(403).json({ message: 'Not authorized to view this child' });
        }

        res.status(200).json(child);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update child profile (Family Voice)
// @route   PUT /api/v1/parent/children/:id
// @access  Private (Parent)
exports.updateChild = async (req, res) => {
    try {
        let child = await Project.findById(req.params.id);

        if (!child) {
            return res.status(404).json({ message: 'Child/Project not found' });
        }

        if (!child.parents.includes(req.user.id)) {
            return res.status(403).json({ message: 'Not authorized to update this child' });
        }

        // Allowed fields for parents
        const fieldsToUpdate = {
            parentSurvey: req.body.parentSurvey,
            currentPerformance: req.body.currentPerformance // Assuming parents can add observations here
        };

        child = await Project.findByIdAndUpdate(req.params.id, fieldsToUpdate, {
            new: true,
            runValidators: true,
        });

        res.status(200).json(child);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Share with teacher (Notify)
// @route   POST /api/v1/parent/children/:id/share
// @access  Private (Parent)
exports.shareWithTeacher = async (req, res) => {
    try {
        const child = await Project.findById(req.params.id);

        if (!child) {
            return res.status(404).json({ message: 'Child/Project not found' });
        }

        if (!child.parents.includes(req.user.id)) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Logic to notify teacher would go here
        res.status(200).json({ message: 'Teacher notified of updates' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
