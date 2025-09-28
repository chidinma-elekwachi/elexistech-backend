import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, Alert, Dimensions, TouchableOpacity, Image } from 'react-native';
import { Text, Surface, IconButton, Avatar, useTheme, Button, TextInput, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import authService from '../services/authService';
import mediaShareService from '../services/mediaShareService';
import { uploadMediaToCloudinary } from '../cloudinary/config';

const { width, height } = Dimensions.get('window');

const MediaShareScreen = ({ navigation }) => {
    const theme = useTheme();
    const [currentUser, setCurrentUser] = useState(null);
    const [mediaMessages, setMediaMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [messageText, setMessageText] = useState('');
    const scrollViewRef = useRef(null);

    useEffect(() => {
        initializeUser();
        return () => {
            // Cleanup listeners
        };
    }, []);

    useEffect(() => {
        if (currentUser) {
            loadMediaMessages();
        }
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

    const loadMediaMessages = async () => {
        try {
            setLoading(true);
            const messages = await mediaShareService.getMediaMessages(currentUser.uid);
            setMediaMessages(messages);
        } catch (error) {
            console.error('Error loading media messages:', error);
            Alert.alert('Error', 'Failed to load media messages');
        } finally {
            setLoading(false);
        }
    };

    const pickMedia = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Required', 'Please grant access to your media library');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.All,
                allowsEditing: false,
                quality: 0.8,
                allowsMultipleSelection: true,
            });

            if (!result.canceled && result.assets.length > 0) {
                await uploadMediaFiles(result.assets);
            }
        } catch (error) {
            console.error('Error picking media:', error);
            Alert.alert('Error', 'Failed to pick media files');
        }
    };

    const uploadMediaFiles = async (assets) => {
        setUploading(true);
        try {
            for (const asset of assets) {
                const mediaUrl = await uploadMediaToCloudinary({
                    fileUri: asset.uri,
                    publicId: `${currentUser.uid}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    folder: 'media-share',
                });

                await mediaShareService.sendMediaMessage({
                    senderId: currentUser.uid,
                    receiverId: selectedUser?.id || 'all', // Send to all users if no specific user selected
                    mediaUrl,
                    mediaType: asset.type || 'image',
                    fileName: asset.fileName || `media_${Date.now()}`,
                    message: messageText.trim() || '',
                });
            }

            setMessageText('');
            loadMediaMessages(); // Refresh messages
        } catch (error) {
            console.error('Error uploading media:', error);
            Alert.alert('Error', 'Failed to upload media');
        } finally {
            setUploading(false);
        }
    };

    const renderMediaMessage = (message) => {
        const isOwnMessage = message.senderId === currentUser?.uid;

        return (
            <View key={message.id} style={[
                styles.messageContainer,
                isOwnMessage ? styles.ownMessage : styles.otherMessage
            ]}>
                <View style={styles.messageHeader}>
                    <Avatar.Image
                        size={32}
                        source={
                            message.senderAvatar
                                ? { uri: message.senderAvatar }
                                : require('../../assets/favicon.png')
                        }
                    />
                    <View style={styles.messageInfo}>
                        <Text variant="bodySmall" style={styles.senderName}>
                            {message.senderName || 'Unknown User'}
                        </Text>
                        <Text variant="bodySmall" style={styles.timestamp}>
                            {new Date(message.timestamp?.toDate?.() || message.timestamp).toLocaleTimeString()}
                        </Text>
                    </View>
                </View>

                {message.message && (
                    <Text variant="bodyMedium" style={styles.messageText}>
                        {message.message}
                    </Text>
                )}

                <View style={styles.mediaContainer}>
                    {message.mediaType === 'image' ? (
                        <Image
                            source={{ uri: message.mediaUrl }}
                            style={styles.mediaImage}
                            resizeMode="cover"
                        />
                    ) : (
                        <View style={styles.fileContainer}>
                            <IconButton
                                icon="file"
                                size={40}
                                iconColor={theme.colors.primary}
                            />
                            <Text variant="bodySmall" style={styles.fileName}>
                                {message.fileName}
                            </Text>
                        </View>
                    )}
                </View>
            </View>
        );
    };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.colors.background,
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: 16,
            backgroundColor: theme.colors.surface,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.surfaceVariant,
        },
        headerTitle: {
            flex: 1,
            marginLeft: 12,
        },
        content: {
            flex: 1,
        },
        messagesContainer: {
            flex: 1,
            padding: 16,
        },
        messageContainer: {
            marginBottom: 16,
            maxWidth: '80%',
        },
        ownMessage: {
            alignSelf: 'flex-end',
            alignItems: 'flex-end',
        },
        otherMessage: {
            alignSelf: 'flex-start',
            alignItems: 'flex-start',
        },
        messageHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 8,
        },
        messageInfo: {
            marginLeft: 8,
        },
        senderName: {
            fontWeight: 'bold',
            color: theme.colors.onSurface,
        },
        timestamp: {
            color: theme.colors.onSurfaceVariant,
        },
        messageText: {
            marginBottom: 8,
            color: theme.colors.onSurface,
        },
        mediaContainer: {
            borderRadius: 12,
            overflow: 'hidden',
        },
        mediaImage: {
            width: 200,
            height: 200,
            borderRadius: 12,
        },
        fileContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: theme.colors.surfaceVariant,
            padding: 12,
            borderRadius: 12,
        },
        fileName: {
            marginLeft: 8,
            flex: 1,
        },
        inputContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: 16,
            backgroundColor: theme.colors.surface,
            borderTopWidth: 1,
            borderTopColor: theme.colors.surfaceVariant,
        },
        textInput: {
            flex: 1,
            marginRight: 8,
        },
        actionButtons: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        loadingContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        },
        emptyState: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 32,
        },
        emptyStateText: {
            textAlign: 'center',
            color: theme.colors.onSurfaceVariant,
            marginBottom: 16,
        },
    });

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                    <Text style={{ marginTop: 16 }}>Loading media messages...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <IconButton
                    icon="arrow-left"
                    size={24}
                    iconColor={theme.colors.onSurface}
                    onPress={() => navigation.goBack()}
                />
                <View style={styles.headerTitle}>
                    <Text variant="headlineSmall">Media Share</Text>
                    <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                        Share photos and files with others
                    </Text>
                </View>
            </View>

            {/* Messages */}
            <View style={styles.content}>
                {mediaMessages.length === 0 ? (
                    <View style={styles.emptyState}>
                        <IconButton
                            icon="image-multiple"
                            size={64}
                            iconColor={theme.colors.onSurfaceVariant}
                        />
                        <Text variant="bodyLarge" style={styles.emptyStateText}>
                            No media shared yet
                        </Text>
                        <Text variant="bodyMedium" style={styles.emptyStateText}>
                            Tap the camera button to share your first media file
                        </Text>
                    </View>
                ) : (
                    <ScrollView
                        ref={scrollViewRef}
                        style={styles.messagesContainer}
                        showsVerticalScrollIndicator={false}
                        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
                    >
                        {mediaMessages.map(renderMediaMessage)}
                    </ScrollView>
                )}
            </View>

            {/* Input Area */}
            <View style={styles.inputContainer}>
                <TextInput
                    placeholder="Add a message (optional)"
                    value={messageText}
                    onChangeText={setMessageText}
                    mode="outlined"
                    style={styles.textInput}
                    multiline
                    maxLength={200}
                />
                <View style={styles.actionButtons}>
                    <IconButton
                        icon="camera"
                        size={24}
                        iconColor={theme.colors.primary}
                        onPress={pickMedia}
                        disabled={uploading}
                    />
                    {uploading && (
                        <ActivityIndicator size="small" color={theme.colors.primary} />
                    )}
                </View>
            </View>
        </SafeAreaView>
    );
};

export default MediaShareScreen;
