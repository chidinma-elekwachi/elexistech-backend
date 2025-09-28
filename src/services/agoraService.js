import agora, {
    RtcEngine,
    RtcLocalView,
    RtcRemoteView,
    VideoRenderMode,
    ChannelProfile,
    ClientRole
} from 'react-native-agora';
import { AGORA_APP_ID } from '@env';

console.log('Imported RtcEngine:', RtcEngine);
console.log('RtcEngine type:', typeof RtcEngine);
console.log('agora:', agora);

class AgoraService {
    constructor() {
        this.engine = null;
        this.isInitialized = false;
        this.isInChannel = false;
        this.channelName = null;
        this.localUid = null;
        this.remoteUid = null;
        this.callbacks = {
            onUserJoined: null,
            onUserOffline: null,
            onJoinChannelSuccess: null,
            onLeaveChannel: null,
            onError: null,
        };
    }

    /**
     * Initialize Agora RTC Engine
     */
    async initialize() {
        try {
            if (this.isInitialized) {
                console.log('Agora already initialized');
                return true;
            }

            if (!AGORA_APP_ID) {
                throw new Error('Agora App ID is not configured');
            }

            console.log('RtcEngine:', RtcEngine);
            console.log('RtcEngine.create:', RtcEngine.create);
            this.engine = await RtcEngine.create(AGORA_APP_ID);
            await this.engine.enableVideo();
            await this.engine.setChannelProfile(ChannelProfile.Communication);
            await this.engine.setClientRole(ClientRole.Broadcaster);

            this.setupEventListeners();
            this.isInitialized = true;

            console.log('Agora RTC Engine initialized successfully');
            return true;
        } catch (error) {
            console.error('Failed to initialize Agora:', error);
            throw error;
        }
    }

    /**
     * Setup event listeners for Agora events
     */
    setupEventListeners() {
        this.engine.addListener('Warning', (warn) => {
            console.log('Agora Warning:', warn);
        });

        this.engine.addListener('Error', (err) => {
            console.error('Agora Error:', err);
            if (this.callbacks.onError) {
                this.callbacks.onError(err);
            }
        });

        this.engine.addListener('UserJoined', (uid, elapsed) => {
            console.log('User joined:', uid, elapsed);
            this.remoteUid = uid;
            if (this.callbacks.onUserJoined) {
                this.callbacks.onUserJoined(uid);
            }
        });

        this.engine.addListener('UserOffline', (uid, reason) => {
            console.log('User offline:', uid, reason);
            if (uid === this.remoteUid) {
                this.remoteUid = null;
            }
            if (this.callbacks.onUserOffline) {
                this.callbacks.onUserOffline(uid, reason);
            }
        });

        this.engine.addListener('JoinChannelSuccess', (channel, uid, elapsed) => {
            console.log('Join channel success:', channel, uid, elapsed);
            this.localUid = uid;
            this.isInChannel = true;
            if (this.callbacks.onJoinChannelSuccess) {
                this.callbacks.onJoinChannelSuccess(channel, uid);
            }
        });

        this.engine.addListener('LeaveChannel', (stats) => {
            console.log('Leave channel:', stats);
            this.isInChannel = false;
            this.localUid = null;
            this.remoteUid = null;
            if (this.callbacks.onLeaveChannel) {
                this.callbacks.onLeaveChannel(stats);
            }
        });
    }

    /**
     * Join a channel for video/audio call
     */
    async joinChannel(channelName, token = null) {
        try {
            if (!this.isInitialized) {
                await this.initialize();
            }

            if (this.isInChannel) {
                console.log('Already in channel');
                return;
            }

            this.channelName = channelName;
            await this.engine.joinChannel(token, channelName, null, 0);

            console.log('Joining channel:', channelName);
        } catch (error) {
            console.error('Failed to join channel:', error);
            throw error;
        }
    }

    /**
     * Leave the current channel
     */
    async leaveChannel() {
        try {
            if (!this.isInChannel) {
                console.log('Not in any channel');
                return;
            }

            await this.engine.leaveChannel();
            this.channelName = null;

            console.log('Left channel');
        } catch (error) {
            console.error('Failed to leave channel:', error);
            throw error;
        }
    }

    /**
     * Enable/disable local video
     */
    async enableLocalVideo(enabled) {
        try {
            await this.engine.enableLocalVideo(enabled);
            console.log('Local video', enabled ? 'enabled' : 'disabled');
        } catch (error) {
            console.error('Failed to toggle local video:', error);
            throw error;
        }
    }

    /**
     * Enable/disable local audio
     */
    async enableLocalAudio(enabled) {
        try {
            await this.engine.enableLocalAudio(enabled);
            console.log('Local audio', enabled ? 'enabled' : 'disabled');
        } catch (error) {
            console.error('Failed to toggle local audio:', error);
            throw error;
        }
    }

    /**
     * Switch camera (front/back)
     */
    async switchCamera() {
        try {
            await this.engine.switchCamera();
            console.log('Camera switched');
        } catch (error) {
            console.error('Failed to switch camera:', error);
            throw error;
        }
    }

    /**
     * Set event callbacks
     */
    setCallbacks(callbacks) {
        this.callbacks = { ...this.callbacks, ...callbacks };
    }

    /**
     * Get current channel name
     */
    getChannelName() {
        return this.channelName;
    }

    /**
     * Check if in channel
     */
    isInCall() {
        return this.isInChannel;
    }

    /**
     * Get local UID
     */
    getLocalUid() {
        return this.localUid;
    }

    /**
     * Get remote UID
     */
    getRemoteUid() {
        return this.remoteUid;
    }

    /**
     * Destroy the engine
     */
    async destroy() {
        try {
            if (this.isInChannel) {
                await this.leaveChannel();
            }

            if (this.engine) {
                await this.engine.destroy();
                this.engine = null;
                this.isInitialized = false;
            }

            console.log('Agora engine destroyed');
        } catch (error) {
            console.error('Failed to destroy Agora engine:', error);
            throw error;
        }
    }
}

export default new AgoraService();
