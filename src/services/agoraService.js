import createAgoraRtcEngine, {
    RtcSurfaceView,
    RtcTextureView,
    ChannelProfileType,
    ClientRoleType,
    UserOfflineReasonType,
    VideoSourceType,
    VideoViewSetupMode
} from 'react-native-agora';
import { AGORA_APP_ID } from '@env';


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

            console.log('Initializing Agora engine with App ID:', AGORA_APP_ID);
            this.engine = createAgoraRtcEngine();
            console.log('Agora engine created:', !!this.engine);

            await this.engine.initialize({
                appId: AGORA_APP_ID,
                channelProfile: ChannelProfileType.ChannelProfileCommunication
            });
            console.log('Agora engine initialized successfully');

            this.engine.enableVideo();
            console.log('Video enabled');

            this.engine.setClientRole(ClientRoleType.ClientRoleBroadcaster);
            console.log('Client role set to broadcaster');

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
        this.engine.registerEventHandler({
            onJoinChannelSuccess: (connection, elapsed) => {
                console.log('Join channel success:', connection.channelId, elapsed);
                this.channelName = connection.channelId;
                this.localUid = connection.localUid;
                this.isInChannel = true;
                if (this.callbacks.onJoinChannelSuccess) {
                    this.callbacks.onJoinChannelSuccess(connection.channelId, connection.localUid);
                }
            },
            onUserJoined: (connection, remoteUid, elapsed) => {
                console.log('User joined:', remoteUid, elapsed);
                this.remoteUid = remoteUid;
                if (this.callbacks.onUserJoined) {
                    this.callbacks.onUserJoined(remoteUid);
                }
            },
            onUserOffline: (connection, remoteUid, reason) => {
                console.log('User offline:', remoteUid, reason);
                if (remoteUid === this.remoteUid) {
                    this.remoteUid = null;
                }
                if (this.callbacks.onUserOffline) {
                    this.callbacks.onUserOffline(remoteUid, reason);
                }
            },
            onLeaveChannel: (connection, stats) => {
                console.log('Leave channel:', stats);
                this.channelName = null;
                this.localUid = null;
                this.remoteUid = null;
                this.isInChannel = false;
                if (this.callbacks.onLeaveChannel) {
                    this.callbacks.onLeaveChannel();
                }
            },
            onError: (err, msg) => {
                console.error('Agora Error:', err, msg);
                if (this.callbacks.onError) {
                    this.callbacks.onError(err);
                }
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

            console.log('Joining channel:', channelName);
            this.channelName = channelName;
            this.engine.joinChannel(
                token || '',
                channelName,
                0, // uid (0 for auto-assign)
                {
                    clientRoleType: ClientRoleType.ClientRoleBroadcaster,
                }
            );
            console.log('Join channel request sent');
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
            this.isInChannel = false;

            console.log('Left channel');
        } catch (error) {
            console.error('Failed to leave channel:', error);
            throw error;
        }
    }

    /**
     * Release the RTC engine
     */
    async release() {
        try {
            if (this.engine) {
                await this.engine.release();
                this.engine = null;
                this.isInitialized = false;
                this.isInChannel = false;
                this.channelName = null;
                this.localUid = null;
                this.remoteUid = null;
                console.log('Agora RTC Engine released');
            }
        } catch (error) {
            console.error('Failed to release engine:', error);
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
     * Get video components for rendering
     */
    getVideoComponents() {
        return {
            RtcSurfaceView,
            RtcTextureView,
            VideoSourceType,
            VideoViewSetupMode
        };
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
     * Get video rendering components
     */
    getVideoComponents() {
        return {
            RtcSurfaceView,
            RtcTextureView
        };
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
                await this.engine.release();
                this.engine = null;
                this.isInitialized = false;
                this.isInChannel = false;
                this.channelName = null;
                this.localUid = null;
                this.remoteUid = null;
            }

            console.log('Agora engine destroyed');
        } catch (error) {
            console.error('Failed to destroy Agora engine:', error);
            throw error;
        }
    }
}

export default new AgoraService();
