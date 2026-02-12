const express = require('express');
const {
    acceptBeta,
    declineBeta,
    getBetaStatus,
    confirmationSeen
} = require('../controllers/betaController');

const router = express.Router();

const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/accept', acceptBeta);
router.post('/decline', declineBeta);
router.get('/status', getBetaStatus);
router.patch('/confirmation-seen', confirmationSeen);

module.exports = router;
