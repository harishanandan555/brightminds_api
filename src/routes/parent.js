const express = require('express');
const { getChildren, getChild, updateChild, shareWithTeacher, addChild } = require('../controllers/parentController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('parent'));

router.post('/children', addChild);
router.get('/children', getChildren);
router.get('/children/:id', getChild);
router.put('/children/:id', updateChild);
router.post('/children/:id/share', shareWithTeacher);

module.exports = router;
