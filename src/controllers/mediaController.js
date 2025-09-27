const mediaService = require('../services/mediaService');

class MediaController {
  // Upload media file
  async uploadMedia(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No file provided'
        });
      }

      const userId = req.user.uid;
      const result = await mediaService.uploadMedia(req.file, userId);

      res.status(200).json(result);
    } catch (error) {
      console.error('Upload media error:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // Get file info
  async getFileInfo(req, res) {
    try {
      // Extract file path from the wildcard parameter
      const filePath = req.params[0]; // req.params[0] gets the wildcard match
      
      const result = await mediaService.getFileInfo(filePath);
      res.status(200).json(result);
    } catch (error) {
      console.error('Get file info error:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // Delete media file
  async deleteMedia(req, res) {
    try {
      // Extract file path from the wildcard parameter
      const filePath = req.params[0]; // req.params[0] gets the wildcard match
      
      const result = await mediaService.deleteMedia(filePath);
      res.status(200).json(result);
    } catch (error) {
      console.error('Delete media error:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = new MediaController();
