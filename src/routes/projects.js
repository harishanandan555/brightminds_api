const express = require('express');
const {
    getProjects,
    getProject,
    createProject,
    updateProject,
    deleteProject,
    uploadDocument,
    deleteDocument,
    generateAnalysis,
    generateProjectAnalysis,
    addParent,
    removeParent
} = require('../controllers/projectController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect); // Protect all routes

router.route('/')
    .get(authorize('teacher'), getProjects)
    .post(authorize('teacher'), createProject);

router.route('/:id')
    .get(getProject)
    .put(authorize('teacher'), updateProject)
    .delete(authorize('teacher'), deleteProject);

router.route('/:id/documents')
    .post(authorize('teacher'), uploadDocument);

router.route('/:id/documents/:documentId')
    .delete(authorize('teacher'), deleteDocument);

router.route('/analysis')
    .post(authorize('teacher'), generateAnalysis);

router.route('/:id/analysis')
    .post(authorize('teacher'), generateProjectAnalysis);

router.route('/:id/parents')
    .post(authorize('teacher'), addParent);

router.route('/:id/parents/:parentId')
    .delete(authorize('teacher'), removeParent);

module.exports = router;
