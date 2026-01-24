const Student = require('../models/Student');
const Project = require('../models/Project'); // Keep Project for teacher interactions if needed, or remove if unused in this controller. 
// However, the task says separate collection. Assuming parents deal with Students mostly.
// But wait, getChild might need to return Student. 
// The plan said: "Import Student model. Update getChildren to query Student model. Update addChild to create Student document instead of Project. Update getChild and updateChild to use Student model."

// @desc    Get all children (Students) for a parent
// @route   GET /api/v1/parent/children
// @access  Private (Parent)
exports.getChildren = async (req, res) => {
    try {
        // Find students where the parent's ID is in the 'parents' array
        const children = await Student.find({ parents: req.user.id });
        res.status(200).json(children);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add a child (Create Student)
// @route   POST /api/v1/parent/children
// @access  Private (Parent)
exports.addChild = async (req, res) => {
    try {
        const { studentName, studentAge, gradeLevel, eligibilityStatus, eligibilityDate } = req.body;

        const child = await Student.create({
            studentName,
            studentAge,
            gradeLevel,
            eligibilityStatus,
            eligibilityDate,
            parents: [req.user.id], // Add current user as parent
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
        const child = await Student.findById(req.params.id);

        if (!child) {
            return res.status(404).json({ message: 'Child/Student not found' });
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
        let child = await Student.findById(req.params.id);

        if (!child) {
            return res.status(404).json({ message: 'Child/Student not found' });
        }

        if (!child.parents.includes(req.user.id)) {
            return res.status(403).json({ message: 'Not authorized to update this child' });
        }

        // Allowed fields for parents
        const fieldsToUpdate = {
            parentSurvey: req.body.parentSurvey,
            currentPerformance: req.body.currentPerformance
        };

        child = await Student.findByIdAndUpdate(req.params.id, fieldsToUpdate, {
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
        const child = await Student.findById(req.params.id);

        if (!child) {
            return res.status(404).json({ message: 'Child/Student not found' });
        }

        if (!child.parents.includes(req.user.id)) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Find projects associated with this student
        // This effectively finds the teachers because projects are owned by teachers
        const projects = await Project.find({ student: child._id }).populate('teacher');

        if (!projects || projects.length === 0) {
            return res.status(404).json({ message: 'No teacher projects found for this student to share with.' });
        }

        // Mock Notification: In a real app, send email or push notification to each teacher
        const teachersNotified = projects.map(p => p.teacher ? p.teacher.email : 'Unknown');

        res.status(200).json({
            message: 'Teacher(s) notified of updates',
            notifiedTeachers: teachersNotified
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
