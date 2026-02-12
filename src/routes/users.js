const express = require('express');
const { getAllUsers, getMe, updateMe } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect); // Protect all routes

router.get('/', authorize('superadmin'), getAllUsers);
router.get('/me', getMe);
router.put('/me', updateMe);

module.exports = router;
