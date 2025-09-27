/**
 * Call Model - Represents a call between two users
 * 
 * This model defines the structure for call data stored in memory
 * In a production app, this would be stored in a database
 */

class Call {
  constructor(callerId, calleeId, callType = 'audio') {
    this.id = this.generateId();
    this.callerId = callerId;
    this.calleeId = calleeId;
    this.callType = callType; // 'audio' or 'video'
    this.status = 'initiating'; // 'initiating', 'ringing', 'connected', 'ended', 'rejected'
    this.channelName = this.generateChannelName();
    this.agoraToken = null;
    this.createdAt = new Date();
    this.startedAt = null;
    this.endedAt = null;
    this.duration = 0; // in seconds
  }

  generateId() {
    return `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  generateChannelName() {
    // Create a unique channel name for Agora
    const sortedIds = [this.callerId, this.calleeId].sort();
    return `channel_${sortedIds.join('_')}_${Date.now()}`;
  }

  updateStatus(status) {
    this.status = status;
    
    if (status === 'connected' && !this.startedAt) {
      this.startedAt = new Date();
    }
    
    if (status === 'ended' && !this.endedAt) {
      this.endedAt = new Date();
      if (this.startedAt) {
        this.duration = Math.floor((this.endedAt - this.startedAt) / 1000);
      }
    }
  }

  setAgoraToken(token) {
    this.agoraToken = token;
  }

  toJSON() {
    return {
      id: this.id,
      callerId: this.callerId,
      calleeId: this.calleeId,
      callType: this.callType,
      status: this.status,
      channelName: this.channelName,
      agoraToken: this.agoraToken,
      createdAt: this.createdAt,
      startedAt: this.startedAt,
      endedAt: this.endedAt,
      duration: this.duration
    };
  }
}

module.exports = Call;
