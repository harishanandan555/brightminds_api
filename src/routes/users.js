const express = require('express');
const { getMe, updateMe } = require('../controllers/userController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect); // Protect all routes

router.get('/me', getMe);
router.put('/me', updateMe);

module.exports = router;
