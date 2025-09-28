import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Alert, Dimensions } from 'react-native';
import { Text, Surface, IconButton, Avatar, useTheme, ActivityIndicator, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import authService from '../services/authService';
import callService from '../services/callService';

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
    const callDurationRef = useRef(null);

    useEffect(() => {
        initializeUser();
        return () => {
            if (callDurationRef.current) {
                clearInterval(callDurationRef.current);
            }
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

    useEffect(() => {
        // If navigated due to incoming call, set state accordingly
        if (incoming && incomingCallId) {
            setCallId(incomingCallId);
            setCallState('ringing');
        }
    }, [incoming, incomingCallId]);

    const startCall = async (type) => {
        if (!currentUser) return;

        try {
            setCallType(type);
            setCallState('calling');

            const callData = await callService.initializeCall(currentUser.uid, user.id, type);
            setCallId(callData.id);

            // Start call duration timer
            startCallTimer();

            // In a real implementation, you would:
            // 1. Create RTCPeerConnection
            // 2. Get user media (camera/microphone)
            // 3. Create offer
            // 4. Set up signaling

            Alert.alert(
                'Call Started',
                `Starting ${type} call with ${user.name}`,
                [{ text: 'OK' }]
            );

        } catch (error) {
            console.error('Error starting call:', error);
            setCallState('idle');
            Alert.alert('Error', 'Failed to start call');
        }
    };

    const answerCall = async () => {
        if (!callId) return;

        try {
            setCallState('active');
            startCallTimer();

            // In a real implementation, you would:
            // 1. Create RTCPeerConnection
            // 2. Get user media
            // 3. Set remote description
            // 4. Create answer

            Alert.alert('Call Answered', 'Call is now active');
        } catch (error) {
            console.error('Error answering call:', error);
            Alert.alert('Error', 'Failed to answer call');
        }
    };

    const endCall = async () => {
        try {
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

    const toggleMute = () => {
        setIsMuted(!isMuted);
        // In real implementation, mute/unmute microphone
    };

    const toggleVideo = () => {
        setIsVideoEnabled(!isVideoEnabled);
        // In real implementation, enable/disable camera
    };

    const toggleSpeaker = () => {
        setIsSpeakerOn(!isSpeakerOn);
        // In real implementation, toggle speaker/earpiece
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
        if (callType === 'video' && callState === 'active') {
            return (
                <View style={styles.videoContainer}>
                    <View style={styles.remoteVideo}>
                        <Avatar.Image
                            size={120}
                            source={
                                user.avatar
                                    ? { uri: user.avatar }
                                    : require('../../assets/favicon.png')
                            }
                        />
                        <Text style={styles.videoLabel}>Remote Video</Text>
                    </View>
                    <View style={styles.localVideo}>
                        <Avatar.Image
                            size={80}
                            source={
                                currentUser?.profile?.avatar
                                    ? { uri: currentUser.profile.avatar }
                                    : require('../../assets/favicon.png')
                            }
                        />
                        <Text style={styles.videoLabel}>You</Text>
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
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 12,
    },
    localVideo: {
        position: 'absolute',
        top: 16,
        right: 16,
        width: 120,
        height: 120,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 8,
    },
    videoLabel: {
        color: 'white',
        fontSize: 12,
        marginTop: 8,
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
