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
    removeParent,
    getProgressItems,
    addProgressItem,
    updateProgressItem,
    deleteProgressItem,
    extractIEP
} = require('../controllers/projectController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.use(protect); // Protect all routes

// Static routes MUST come before parameterized routes
router.route('/')
    .get(authorize('teacher'), getProjects)
    .post(authorize('teacher'), createProject);

// IEP extraction route
router.route('/extract-iep')
    .post(authorize('teacher'), upload.single('file'), extractIEP);

// Analysis route (static path)
router.route('/analysis')
    .post(authorize('teacher'), generateAnalysis);

// Parameterized routes come after static routes
router.route('/:id')
    .get(getProject)
    .put(authorize('teacher'), updateProject)
    .delete(authorize('teacher'), deleteProject);

router.route('/:id/documents')
    .post(authorize('teacher'), uploadDocument);

router.route('/:id/documents/:documentId')
    .delete(authorize('teacher'), deleteDocument);

router.route('/:id/analysis')
    .post(authorize('teacher'), generateProjectAnalysis);

router.route('/:id/parents')
    .post(authorize('teacher'), addParent);

router.route('/:id/parents/:parentId')
    .delete(authorize('teacher'), removeParent);

router.route('/:id/progress-item')
    .get(getProgressItems)
    .post(authorize('teacher'), addProgressItem);

router.route('/:id/progress-item/:itemId')
    .put(authorize('teacher'), updateProgressItem)
    .delete(authorize('teacher'), deleteProgressItem);

module.exports = router;
