import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Alert, Dimensions, Platform } from 'react-native';
import { Text, Surface, IconButton, Avatar, useTheme, ActivityIndicator, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import createAgoraRtcEngine from 'react-native-agora';
import authService from '../services/authService';
import callService from '../services/callService';
import agoraService from '../services/agoraService';
import { requestCameraAndAudioPermission, requestAudioPermission } from '../services/permissions';

const { width, height } = Dimensions.get('window');

const CallScreen = ({ route, navigation }) => {
    const { user, incoming = false, callId: incomingCallId } = route.params;
    const theme = useTheme();
    const [currentUser, setCurrentUser] = useState(null);
    const [callState, setCallState] = useState('idle'); // idle, calling, ringing, active, ended
    const [callType, setCallType] = useState('video'); // video or audio
    const [callId, setCallId] = useState(null);
    const [callDuration, setCallDuration] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoEnabled, setIsVideoEnabled] = useState(true);
    const [isSpeakerOn, setIsSpeakerOn] = useState(false);
    const [isCameraFront, setIsCameraFront] = useState(true);
    const [agoraInitialized, setAgoraInitialized] = useState(false);
    const [permissionsGranted, setPermissionsGranted] = useState(false);
    const callDurationRef = useRef(null);

    useEffect(() => {
        initializeUser();
        initializeAgora();
        return () => {
            if (callDurationRef.current) {
                clearInterval(callDurationRef.current);
            }
            cleanupAgora();
        };
    }, []);

    // Re-initialize when active user changes
    useEffect(() => {
        const unsubscribe = authService.initAuthStateListener((userData) => {
            if (userData && userData.uid !== currentUser?.uid) {
                setCurrentUser(userData);
                endCurrentCall();
            }
        });

        return () => unsubscribe();
    }, [currentUser]);

    const initializeUser = async () => {
        try {
            const activeUser = await authService.getCurrentUser();
            if (!activeUser) {
                navigation.goBack();
                return;
            }
            setCurrentUser(activeUser);
        } catch (error) {
            console.error('Error initializing user:', error);
            navigation.goBack();
        }
    };

    const initializeAgora = async () => {
        try {
            // Request permissions first
            const hasPermissions = callType === 'video'
                ? await requestCameraAndAudioPermission()
                : await requestAudioPermission();

            if (!hasPermissions) {
                Alert.alert('Permissions Required', 'Camera and microphone permissions are required for calling');
                navigation.goBack();
                return;
            }

            setPermissionsGranted(true);

            // Initialize Agora
            await agoraService.initialize();
            setAgoraInitialized(true);

            // Set up Agora event callbacks
            agoraService.setCallbacks({
                onUserJoined: (uid) => {
                    console.log('Remote user joined:', uid);
                    if (callState === 'ringing') {
                        setCallState('active');
                        startCallTimer();
                    }
                },
                onUserOffline: (uid, reason) => {
                    console.log('Remote user offline:', uid, reason);
                    endCall();
                },
                onJoinChannelSuccess: (channel, uid) => {
                    console.log('Joined channel successfully:', channel, uid);
                    if (callState === 'calling') {
                        setCallState('ringing');
                    }
                },
                onLeaveChannel: () => {
                    console.log('Left channel');
                    setCallState('ended');
                },
                onError: (error) => {
                    console.error('Agora error:', error);
                    Alert.alert('Call Error', 'An error occurred during the call');
                    endCall();
                }
            });

        } catch (error) {
            console.error('Error initializing Agora:', error);
            Alert.alert('Initialization Error', 'Failed to initialize calling service');
            navigation.goBack();
        }
    };

    const cleanupAgora = async () => {
        try {
            if (agoraInitialized) {
                await agoraService.release();
            }
        } catch (error) {
            console.error('Error cleaning up Agora:', error);
        }
    };

    useEffect(() => {
        // If navigated due to incoming call, set state accordingly
        if (incoming && incomingCallId) {
            setCallId(incomingCallId);
            setCallState('ringing');
        }
    }, [incoming, incomingCallId]);

    const startCall = async (type) => {
        if (!currentUser || !agoraInitialized) return;

        try {
            setCallType(type);
            setCallState('calling');

            // Create channel name based on user IDs
            const channelName = `call_${currentUser.uid}_${user.id}`;

            const callData = await callService.initializeCall(currentUser.uid, user.id, type);
            setCallId(callData.id);

            // Join Agora channel
            await agoraService.joinChannel(channelName);

            // Start call duration timer
            startCallTimer();

        } catch (error) {
            console.error('Error starting call:', error);
            setCallState('idle');
            Alert.alert('Error', 'Failed to start call');
        }
    };

    const answerCall = async () => {
        if (!callId || !agoraInitialized) return;

        try {
            setCallState('active');

            // Join the same channel as the caller
            const channelName = `call_${user.id}_${currentUser.uid}`;
            await agoraService.joinChannel(channelName);

            startCallTimer();
        } catch (error) {
            console.error('Error answering call:', error);
            Alert.alert('Error', 'Failed to answer call');
        }
    };

    const endCall = async () => {
        try {
            // Leave Agora channel
            if (agoraInitialized && agoraService.isInCall()) {
                await agoraService.leaveChannel();
            }

            // End call in Firestore
            if (callId) {
                await callService.endCall(callId);
            }

            setCallState('ended');
            setCallDuration(0);

            if (callDurationRef.current) {
                clearInterval(callDurationRef.current);
                callDurationRef.current = null;
            }

            // Navigate back after a short delay
            setTimeout(() => {
                navigation.goBack();
            }, 2000);

        } catch (error) {
            console.error('Error ending call:', error);
            navigation.goBack();
        }
    };

    const endCurrentCall = () => {
        if (callId) {
            endCall();
        }
    };

    const startCallTimer = () => {
        callDurationRef.current = setInterval(() => {
            setCallDuration(prev => prev + 1);
        }, 1000);
    };

    const formatDuration = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const toggleMute = async () => {
        try {
            const newMutedState = !isMuted;
            await agoraService.enableLocalAudio(!newMutedState);
            setIsMuted(newMutedState);
        } catch (error) {
            console.error('Error toggling mute:', error);
        }
    };

    const toggleVideo = async () => {
        try {
            const newVideoState = !isVideoEnabled;
            await agoraService.enableLocalVideo(newVideoState);
            setIsVideoEnabled(newVideoState);
        } catch (error) {
            console.error('Error toggling video:', error);
        }
    };

    const toggleSpeaker = () => {
        setIsSpeakerOn(!isSpeakerOn);
        // Note: Speaker control would need additional Agora configuration
    };

    const switchCamera = async () => {
        try {
            await agoraService.switchCamera();
            setIsCameraFront(!isCameraFront);
        } catch (error) {
            console.error('Error switching camera:', error);
        }
    };

    const renderCallControls = () => {
        if (callState === 'idle') {
            return (
                <View style={styles.callControls}>
                    <IconButton
                        icon="phone"
                        size={40}
                        iconColor="white"
                        style={[styles.controlButton, styles.audioCallButton]}
                        onPress={() => startCall('audio')}
                    />
                    <IconButton
                        icon="video"
                        size={40}
                        iconColor="white"
                        style={[styles.controlButton, styles.videoCallButton]}
                        onPress={() => startCall('video')}
                    />
                </View>
            );
        }

        if (callState === 'calling' || callState === 'ringing') {
            return (
                <View style={styles.callControls}>
                    <IconButton
                        icon="phone-hangup"
                        size={40}
                        iconColor="white"
                        style={[styles.controlButton, styles.hangupButton]}
                        onPress={endCall}
                    />
                    {callState === 'ringing' && (
                        <IconButton
                            icon="phone"
                            size={40}
                            iconColor="white"
                            style={[styles.controlButton, styles.answerButton]}
                            onPress={answerCall}
                        />
                    )}
                </View>
            );
        }

        if (callState === 'active') {
            return (
                <View style={styles.activeCallControls}>
                    <View style={styles.topControls}>
                        <IconButton
                            icon={isMuted ? "microphone-off" : "microphone"}
                            size={30}
                            iconColor="white"
                            style={[styles.controlButton, isMuted ? styles.mutedButton : styles.unmutedButton]}
                            onPress={toggleMute}
                        />
                        <IconButton
                            icon={isVideoEnabled ? "video" : "video-off"}
                            size={30}
                            iconColor="white"
                            style={[styles.controlButton, isVideoEnabled ? styles.videoOnButton : styles.videoOffButton]}
                            onPress={toggleVideo}
                        />
                        {callType === 'video' && (
                            <IconButton
                                icon="camera-flip"
                                size={30}
                                iconColor="white"
                                style={[styles.controlButton, styles.cameraButton]}
                                onPress={switchCamera}
                            />
                        )}
                        <IconButton
                            icon={isSpeakerOn ? "volume-high" : "volume-low"}
                            size={30}
                            iconColor="white"
                            style={[styles.controlButton, styles.speakerButton]}
                            onPress={toggleSpeaker}
                        />
                    </View>
                    <View style={styles.bottomControls}>
                        <IconButton
                            icon="phone-hangup"
                            size={50}
                            iconColor="white"
                            style={[styles.controlButton, styles.hangupButton]}
                            onPress={endCall}
                        />
                    </View>
                </View>
            );
        }

        if (callState === 'ended') {
            return (
                <View style={styles.callControls}>
                    <Text style={styles.callEndedText}>Call Ended</Text>
                    <Text style={styles.callDurationText}>
                        Duration: {formatDuration(callDuration)}
                    </Text>
                </View>
            );
        }

        return null;
    };

    const renderVideoView = () => {
        if (callType === 'video' && callState === 'active' && agoraInitialized) {
            return (
                <View style={styles.videoContainer}>
                    {/* Remote Video */}
                    <View style={styles.remoteVideo}>
                        <RtcRemoteView.SurfaceView
                            style={styles.remoteVideoSurface}
                            uid={agoraService.getRemoteUid()}
                            channelId={agoraService.getChannelName()}
                            renderMode={VideoRenderMode.Hidden}
                        />
                        {!agoraService.getRemoteUid() && (
                            <View style={styles.noRemoteVideo}>
                                <Avatar.Image
                                    size={120}
                                    source={
                                        user.avatar
                                            ? { uri: user.avatar }
                                            : require('../../assets/favicon.png')
                                    }
                                />
                                <Text style={styles.waitingText}>Waiting for {user.name}...</Text>
                            </View>
                        )}
                    </View>

                    {/* Local Video */}
                    <View style={styles.localVideo}>
                        <RtcLocalView.SurfaceView
                            style={styles.localVideoSurface}
                            channelId={agoraService.getChannelName()}
                            renderMode={VideoRenderMode.Hidden}
                        />
                        <View style={styles.localVideoOverlay}>
                            <Text style={styles.localVideoLabel}>You</Text>
                        </View>
                    </View>
                </View>
            );
        }
        return null;
    };

    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient
                colors={callState === 'active' ? ['#1a1a1a', '#2d2d2d'] : ['#2196F3', '#1976D2']}
                style={styles.gradient}
            >
                {/* Header */}
                <View style={styles.header}>
                    <IconButton
                        icon="arrow-left"
                        size={24}
                        iconColor="white"
                        onPress={() => {
                            if (callState === 'active') {
                                Alert.alert(
                                    'End Call',
                                    'Are you sure you want to end the call?',
                                    [
                                        { text: 'Cancel', style: 'cancel' },
                                        { text: 'End Call', style: 'destructive', onPress: endCall }
                                    ]
                                );
                            } else {
                                navigation.goBack();
                            }
                        }}
                    />
                    <View style={styles.headerInfo}>
                        <Text variant="titleLarge" style={styles.headerName}>
                            {user.name}
                        </Text>
                        <Text variant="bodyMedium" style={styles.headerStatus}>
                            {callState === 'calling' ? 'Calling...' :
                                callState === 'ringing' ? 'Incoming call' :
                                    callState === 'active' ? 'Connected' :
                                        callState === 'ended' ? 'Call ended' :
                                            'Ready to call'}
                        </Text>
                        {callState === 'active' && (
                            <Text variant="bodySmall" style={styles.durationText}>
                                {formatDuration(callDuration)}
                            </Text>
                        )}
                    </View>
                </View>

                {/* User Avatar */}
                <View style={styles.avatarContainer}>
                    <Avatar.Image
                        size={callState === 'active' ? 100 : 150}
                        source={
                            user.avatar
                                ? { uri: user.avatar }
                                : require('../../assets/favicon.png')
                        }
                    />
                </View>

                {/* Video View */}
                {renderVideoView()}

                {/* Call Controls */}
                <View style={styles.controlsContainer}>
                    {renderCallControls()}
                </View>
            </LinearGradient>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    gradient: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        paddingTop: 8,
    },
    headerInfo: {
        marginLeft: 12,
        flex: 1,
    },
    headerName: {
        color: 'white',
        fontWeight: 'bold',
    },
    headerStatus: {
        color: 'white',
        opacity: 0.8,
    },
    durationText: {
        color: 'white',
        opacity: 0.7,
        marginTop: 4,
    },
    avatarContainer: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    videoContainer: {
        flex: 1,
        position: 'relative',
        margin: 16,
    },
    remoteVideo: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 12,
        overflow: 'hidden',
    },
    remoteVideoSurface: {
        flex: 1,
    },
    noRemoteVideo: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    waitingText: {
        color: 'white',
        fontSize: 16,
        marginTop: 16,
        textAlign: 'center',
    },
    localVideo: {
        position: 'absolute',
        top: 16,
        right: 16,
        width: 120,
        height: 160,
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    localVideoSurface: {
        flex: 1,
    },
    localVideoOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.7)',
        paddingVertical: 4,
        paddingHorizontal: 8,
    },
    localVideoLabel: {
        color: 'white',
        fontSize: 12,
        textAlign: 'center',
    },
    controlsContainer: {
        padding: 20,
        paddingBottom: 40,
    },
    callControls: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 30,
    },
    activeCallControls: {
        alignItems: 'center',
    },
    topControls: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 30,
        gap: 20,
    },
    bottomControls: {
        alignItems: 'center',
    },
    controlButton: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    audioCallButton: {
        backgroundColor: '#4CAF50',
    },
    videoCallButton: {
        backgroundColor: '#2196F3',
    },
    hangupButton: {
        backgroundColor: '#F44336',
        width: 70,
        height: 70,
        borderRadius: 35,
    },
    answerButton: {
        backgroundColor: '#4CAF50',
    },
    mutedButton: {
        backgroundColor: '#F44336',
    },
    unmutedButton: {
        backgroundColor: '#4CAF50',
    },
    videoOnButton: {
        backgroundColor: '#2196F3',
    },
    videoOffButton: {
        backgroundColor: '#FF9800',
    },
    speakerButton: {
        backgroundColor: '#9C27B0',
    },
    cameraButton: {
        backgroundColor: '#FF5722',
    },
    callEndedText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 8,
    },
    callDurationText: {
        color: 'white',
        fontSize: 16,
        textAlign: 'center',
        opacity: 0.8,
    },
});

export default CallScreen;
