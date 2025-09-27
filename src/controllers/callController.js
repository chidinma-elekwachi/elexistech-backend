const callService = require('../services/callService');

class CallController {
  // Initiate a call
  async initiateCall(req, res) {
    try {
      const { calleeId, callType = 'audio' } = req.body;
      const callerId = req.user.uid;

      if (!calleeId) {
        return res.status(400).json({
          success: false,
          error: 'Callee ID is required'
        });
      }

      if (calleeId === callerId) {
        return res.status(400).json({
          success: false,
          error: 'Cannot call yourself'
        });
      }

      if (!['audio', 'video'].includes(callType)) {
        return res.status(400).json({
          success: false,
          error: 'Call type must be audio or video'
        });
      }

      const result = await callService.initiateCall(callerId, calleeId, callType);
      
      res.status(201).json(result);
    } catch (error) {
      console.error('Initiate call controller error:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // Accept a call
  async acceptCall(req, res) {
    try {
      const { callId } = req.params;
      const userId = req.user.uid;

      if (!callId) {
        return res.status(400).json({
          success: false,
          error: 'Call ID is required'
        });
      }

      const result = await callService.acceptCall(callId, userId);
      
      res.status(200).json(result);
    } catch (error) {
      console.error('Accept call controller error:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // Reject a call
  async rejectCall(req, res) {
    try {
      const { callId } = req.params;
      const userId = req.user.uid;

      if (!callId) {
        return res.status(400).json({
          success: false,
          error: 'Call ID is required'
        });
      }

      const result = await callService.rejectCall(callId, userId);
      
      res.status(200).json(result);
    } catch (error) {
      console.error('Reject call controller error:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // End a call
  async endCall(req, res) {
    try {
      const { callId } = req.params;
      const userId = req.user.uid;

      if (!callId) {
        return res.status(400).json({
          success: false,
          error: 'Call ID is required'
        });
      }

      const result = await callService.endCall(callId, userId);
      
      res.status(200).json(result);
    } catch (error) {
      console.error('End call controller error:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // Get call status
  async getCallStatus(req, res) {
    try {
      const { callId } = req.params;

      if (!callId) {
        return res.status(400).json({
          success: false,
          error: 'Call ID is required'
        });
      }

      const result = await callService.getCallStatus(callId);
      
      res.status(200).json(result);
    } catch (error) {
      console.error('Get call status controller error:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // Get user's active call
  async getUserActiveCall(req, res) {
    try {
      const userId = req.user.uid;

      const result = await callService.getUserActiveCall(userId);
      
      res.status(200).json(result);
    } catch (error) {
      console.error('Get user active call controller error:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // Get all calls (for debugging)
  async getAllCalls(req, res) {
    try {
      const calls = callService.getAllCalls();
      
      res.status(200).json({
        success: true,
        calls,
        count: calls.length
      });
    } catch (error) {
      console.error('Get all calls controller error:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = new CallController();
