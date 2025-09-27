const express = require('express');
const router = express.Router();

// Note: Message routes removed due to Firestore access limitations
// This would normally include:
// - Chat creation and management
// - Message sending with media URLs
// - Message retrieval and status updates
// 
// These features require Firestore database access which is not available
// in the current Firebase project due to permission restrictions.

// Placeholder route to indicate the limitation
router.get('/', (req, res) => {
  res.json({
    message: 'Message routes not available',
    reason: 'Firestore access required but not available due to project permissions',
    note: 'Media upload functionality is fully working and available at /api/media'
  });
});

module.exports = router;
