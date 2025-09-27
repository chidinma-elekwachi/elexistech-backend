const { RtcTokenBuilder, RtcRole } = require('agora-token');
const { v4: uuidv4 } = require('uuid');
const Call = require('../models/Call');

class CallService {
  constructor() {
    this.appId = process.env.AGORA_APP_ID;
    this.appCertificate = process.env.AGORA_APP_CERTIFICATE;
    this.calls = new Map(); // In-memory storage for calls
    this.userCalls = new Map(); // Track calls by user ID
  }

  // Generate Agora access token
  generateToken(channelName, uid, role = RtcRole.PUBLISHER, expirationTimeInSeconds = 3600) {
    try {
      if (!this.appId || !this.appCertificate) {
        throw new Error('Agora credentials not configured');
      }

      const currentTimestamp = Math.floor(Date.now() / 1000);
      const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

      const token = RtcTokenBuilder.buildTokenWithUid(
        this.appId,
        this.appCertificate,
        channelName,
        uid,
        role,
        privilegeExpiredTs
      );

      return token;
    } catch (error) {
      console.error('Error generating Agora token:', error);
      throw new Error('Failed to generate access token');
    }
  }

  // Initiate a call
  async initiateCall(callerId, calleeId, callType = 'audio') {
    try {
      // Check if users are already in a call
      if (this.isUserInCall(callerId) || this.isUserInCall(calleeId)) {
        throw new Error('One or both users are already in a call');
      }

      // Create new call
      const call = new Call(callerId, calleeId, callType);
      
      // Generate Agora token for caller
      const callerToken = this.generateToken(call.channelName, callerId);
      call.setAgoraToken(callerToken);

      // Store call
      this.calls.set(call.id, call);
      this.userCalls.set(callerId, call.id);
      this.userCalls.set(calleeId, call.id);

      // Update status to ringing
      call.updateStatus('ringing');

      console.log(`Call initiated: ${call.id} from ${callerId} to ${calleeId}`);

      return {
        success: true,
        call: call.toJSON(),
        message: 'Call initiated successfully'
      };
    } catch (error) {
      console.error('Initiate call error:', error);
      throw new Error(error.message || 'Failed to initiate call');
    }
  }

  // Accept a call
  async acceptCall(callId, userId) {
    try {
      const call = this.calls.get(callId);
      
      if (!call) {
        throw new Error('Call not found');
      }

      if (call.calleeId !== userId) {
        throw new Error('User not authorized to accept this call');
      }

      if (call.status !== 'ringing') {
        throw new Error('Call is not in ringing state');
      }

      // Generate token for callee
      const calleeToken = this.generateToken(call.channelName, userId);
      call.setAgoraToken(calleeToken);

      // Update call status
      call.updateStatus('connected');

      console.log(`Call accepted: ${callId} by ${userId}`);

      return {
        success: true,
        call: call.toJSON(),
        message: 'Call accepted successfully'
      };
    } catch (error) {
      console.error('Accept call error:', error);
      throw new Error(error.message || 'Failed to accept call');
    }
  }

  // Reject a call
  async rejectCall(callId, userId) {
    try {
      const call = this.calls.get(callId);
      
      if (!call) {
        throw new Error('Call not found');
      }

      if (call.calleeId !== userId) {
        throw new Error('User not authorized to reject this call');
      }

      // Update call status
      call.updateStatus('rejected');
      call.updateStatus('ended');

      // Clean up
      this.cleanupCall(callId);

      console.log(`Call rejected: ${callId} by ${userId}`);

      return {
        success: true,
        call: call.toJSON(),
        message: 'Call rejected successfully'
      };
    } catch (error) {
      console.error('Reject call error:', error);
      throw new Error(error.message || 'Failed to reject call');
    }
  }

  // End a call
  async endCall(callId, userId) {
    try {
      const call = this.calls.get(callId);
      
      if (!call) {
        throw new Error('Call not found');
      }

      if (call.callerId !== userId && call.calleeId !== userId) {
        throw new Error('User not authorized to end this call');
      }

      // Update call status
      call.updateStatus('ended');

      // Clean up
      this.cleanupCall(callId);

      console.log(`Call ended: ${callId} by ${userId}`);

      return {
        success: true,
        call: call.toJSON(),
        message: 'Call ended successfully'
      };
    } catch (error) {
      console.error('End call error:', error);
      throw new Error(error.message || 'Failed to end call');
    }
  }

  // Get call status
  async getCallStatus(callId) {
    try {
      const call = this.calls.get(callId);
      
      if (!call) {
        throw new Error('Call not found');
      }

      return {
        success: true,
        call: call.toJSON()
      };
    } catch (error) {
      console.error('Get call status error:', error);
      throw new Error(error.message || 'Failed to get call status');
    }
  }

  // Get user's active call
  async getUserActiveCall(userId) {
    try {
      const callId = this.userCalls.get(userId);
      
      if (!callId) {
        return {
          success: true,
          call: null,
          message: 'No active call found'
        };
      }

      const call = this.calls.get(callId);
      
      if (!call || call.status === 'ended') {
        this.cleanupCall(callId);
        return {
          success: true,
          call: null,
          message: 'No active call found'
        };
      }

      return {
        success: true,
        call: call.toJSON()
      };
    } catch (error) {
      console.error('Get user active call error:', error);
      throw new Error(error.message || 'Failed to get user active call');
    }
  }

  // Check if user is in a call
  isUserInCall(userId) {
    const callId = this.userCalls.get(userId);
    if (!callId) return false;
    
    const call = this.calls.get(callId);
    return call && call.status !== 'ended' && call.status !== 'rejected';
  }

  // Clean up call data
  cleanupCall(callId) {
    const call = this.calls.get(callId);
    if (call) {
      this.userCalls.delete(call.callerId);
      this.userCalls.delete(call.calleeId);
      this.calls.delete(callId);
    }
  }

  // Get all calls (for debugging)
  getAllCalls() {
    return Array.from(this.calls.values()).map(call => call.toJSON());
  }
}

module.exports = new CallService();
