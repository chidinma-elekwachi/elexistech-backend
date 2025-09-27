const express = require('express');
const router = express.Router();
const callController = require('../controllers/callController');
const { authenticateToken } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// Call management routes
router.post('/initiate', callController.initiateCall);
router.post('/:callId/accept', callController.acceptCall);
router.post('/:callId/reject', callController.rejectCall);
router.post('/:callId/end', callController.endCall);

// Call status routes
router.get('/status/:callId', callController.getCallStatus);
router.get('/active', callController.getUserActiveCall);

// Debug routes (remove in production)
router.get('/debug/all', callController.getAllCalls);

module.exports = router;
