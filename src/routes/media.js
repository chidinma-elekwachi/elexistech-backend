const express = require('express');
const router = express.Router();
const mediaController = require('../controllers/mediaController');
const { authenticateToken } = require('../middleware/auth');
const { uploadSingle, handleUploadError } = require('../middleware/upload');

// All routes require authentication
router.use(authenticateToken);

// Upload media file
router.post('/upload', uploadSingle, handleUploadError, mediaController.uploadMedia);

// Get file info
router.get('/info/*', mediaController.getFileInfo);

// Delete media file
router.delete('/delete/*', mediaController.deleteMedia);

module.exports = router;
