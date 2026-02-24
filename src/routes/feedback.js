const express = require('express');
const { submitFeedback, getMyFeedback, getAllFeedback } = require('../controllers/feedbackController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.post('/', protect, submitFeedback);
router.get('/my-feedback', protect, getMyFeedback);
router.get('/', protect, authorize('superadmin'), getAllFeedback);

module.exports = router;
