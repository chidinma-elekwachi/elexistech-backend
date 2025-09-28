import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Avatar, TextInput, Button, Surface, useTheme, IconButton, Text, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import authService from '../services/authService';
import mediaService from '../services/mediaService';

const EditProfileScreen = ({ navigation }) => {
    const theme = useTheme();
    const [saving, setSaving] = useState(false);
    const [user, setUser] = useState(null);
    const [formData, setFormData] = useState({
        username: '',
        bio: '',
        avatar: null,
    });
    const [errors, setErrors] = useState({});

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.colors.background,
        },
        scrollContainer: {
            flexGrow: 1,
        },
        // Header Section
        headerSection: {
            paddingTop: 20,
            paddingBottom: 20,
            paddingHorizontal: 20,
        },
        gradientHeader: {
            borderRadius: 20,
            padding: 24,
            marginBottom: 20,
            overflow: 'hidden',
        },
        headerTop: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 20,
        },
        headerTitle: {
            color: 'white',
            fontWeight: 'bold',
        },
        avatarSection: {
            alignItems: 'center',
            marginBottom: 20,
        },
        avatarContainer: {
            position: 'relative',
            marginBottom: 16,
        },
        avatar: {
            borderWidth: 4,
            borderColor: 'rgba(255, 255, 255, 0.3)',
        },
        cameraButton: {
            position: 'absolute',
            bottom: 0,
            right: 0,
            backgroundColor: theme.colors.primary,
            borderRadius: 20,
            width: 40,
            height: 40,
        },
        changeAvatarButton: {
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 8,
        },
        changeAvatarText: {
            color: 'white',
            fontWeight: '500',
        },
        // Form Section
        formSection: {
            paddingHorizontal: 20,
            paddingBottom: 20,
        },
        formCard: {
            backgroundColor: theme.colors.surface,
            borderRadius: 16,
            marginBottom: 16,
            overflow: 'hidden',
        },
        formHeader: {
            paddingHorizontal: 20,
            paddingVertical: 16,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.surfaceVariant,
        },
        formTitle: {
            fontWeight: '600',
            color: theme.colors.onSurface,
        },
        formContent: {
            padding: 20,
        },
        input: {
            marginBottom: 16,
            backgroundColor: 'transparent',
        },
        errorText: {
            color: theme.colors.error,
            fontSize: 12,
            marginTop: -12,
            marginBottom: 8,
        },
        // Action Buttons
        actionSection: {
            paddingHorizontal: 20,
            paddingBottom: 30,
        },
        buttonRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 16,
        },
        button: {
            flex: 1,
            marginHorizontal: 8,
            borderRadius: 12,
        },
        saveButton: {
            backgroundColor: theme.colors.primary,
        },
        cancelButton: {
            borderColor: theme.colors.outline,
        },
    });

    useEffect(() => {
        const initializeUser = async () => {
            try {
                const currentUser = await authService.getCurrentUser();
                if (currentUser) {
                    const userProfile = await authService.getUserProfile(currentUser.uid);
                    const userData = { ...currentUser, profile: userProfile };
                    setUser(userData);
                    setFormData({
                        username: userProfile?.name || '',
                        bio: userProfile?.bio || '',
                        avatar: userProfile?.avatar || null,
                    });
                } else {
                    Alert.alert('Error', 'No user is currently signed in');
                    navigation.goBack();
                }
            } catch (error) {
                console.error('Error initializing user:', error);
                Alert.alert('Error', 'Failed to load user data');
                navigation.goBack();
            }
        };

        initializeUser();

        const unsubscribe = authService.initAuthStateListener((userData) => {
            setUser(userData);
            if (userData) {
                setFormData({
                    username: userData.profile?.name || '',
                    bio: userData.profile?.bio || '',
                    avatar: userData.profile?.avatar || null,
                });
            }
        });

        return () => unsubscribe();
    }, []);

    const validateForm = () => {
        const newErrors = {};

        if (!formData.username.trim()) {
            newErrors.username = 'Username is required';
        } else if (formData.username.trim().length < 2) {
            newErrors.username = 'Username must be at least 2 characters';
        }

        if (formData.bio && formData.bio.length > 500) {
            newErrors.bio = 'Bio must be less than 500 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const pickImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!result.canceled) {
                setFormData(prev => ({
                    ...prev,
                    avatar: result.assets[0].uri,
                }));
            }
        } catch (error) {
            console.error('Error picking image:', error);
            Alert.alert('Error', 'Failed to pick image');
        }
    };

    const handleSave = async () => {
        if (!validateForm()) {
            return;
        }

        setSaving(true);
        try {
            const updates = {
                name: formData.username.trim(),
                bio: formData.bio.trim(),
            };

            // Upload avatar if changed
            if (formData.avatar && formData.avatar !== user?.profile?.avatar) {
                try {
                    const uploadResult = await mediaService.uploadProfileImage(formData.avatar);
                    updates.avatar = uploadResult.url;
                } catch (error) {
                    console.error('Error uploading avatar:', error);
                    Alert.alert('Warning', 'Profile updated but avatar upload failed');
                }
            }

            await authService.updateProfile(updates);
            navigation.goBack();
        } catch (error) {
            console.error('Error saving profile:', error);
            Alert.alert('Error', error.message || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        Alert.alert(
            'Discard Changes',
            'Are you sure you want to discard your changes?',
            [
                { text: 'Keep Editing', style: 'cancel' },
                { text: 'Discard', style: 'destructive', onPress: () => navigation.goBack() }
            ]
        );
    };

    if (!user) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                    <Text style={{ marginTop: 16 }}>Loading profile...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView
                    style={styles.scrollContainer}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Header Section */}
                    <View style={styles.headerSection}>
                        <LinearGradient
                            colors={[theme.colors.primary, theme.colors.secondary]}
                            style={styles.gradientHeader}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <View style={styles.headerTop}>
                                <IconButton
                                    icon="arrow-left"
                                    size={24}
                                    iconColor="white"
                                    onPress={() => navigation.goBack()}
                                />
                                <Text variant="headlineSmall" style={styles.headerTitle}>
                                    Edit Profile
                                </Text>
                                <View style={{ width: 48 }} />
                            </View>

                            {/* Avatar Section */}
                            <View style={styles.avatarSection}>
                                <View style={styles.avatarContainer}>
                                    <Avatar.Image
                                        size={100}
                                        source={
                                            formData.avatar
                                                ? { uri: formData.avatar }
                                                : user?.profile?.avatar
                                                    ? { uri: user.profile.avatar }
                                                    : require('../../assets/favicon.png')
                                        }
                                        style={styles.avatar}
                                    />
                                    <IconButton
                                        icon="camera"
                                        size={20}
                                        iconColor="white"
                                        style={styles.cameraButton}
                                        onPress={pickImage}
                                    />
                                </View>
                                <Button
                                    mode="text"
                                    onPress={pickImage}
                                    style={styles.changeAvatarButton}
                                    textColor="white"
                                >
                                    Change Avatar
                                </Button>
                            </View>
                        </LinearGradient>
                    </View>

                    {/* Form Section */}
                    <View style={styles.formSection}>
                        <Surface style={styles.formCard} elevation={2}>
                            <View style={styles.formHeader}>
                                <Text variant="titleMedium" style={styles.formTitle}>
                                    Profile Information
                                </Text>
                            </View>
                            <View style={styles.formContent}>
                                <TextInput
                                    label="Username"
                                    value={formData.username}
                                    onChangeText={(text) => setFormData(prev => ({ ...prev, username: text }))}
                                    mode="outlined"
                                    style={styles.input}
                                    error={!!errors.username}
                                    left={<TextInput.Icon icon="account" />}
                                />
                                {errors.username && (
                                    <Text style={styles.errorText}>{errors.username}</Text>
                                )}

                                <TextInput
                                    label="Bio"
                                    value={formData.bio}
                                    onChangeText={(text) => setFormData(prev => ({ ...prev, bio: text }))}
                                    mode="outlined"
                                    multiline
                                    numberOfLines={4}
                                    style={styles.input}
                                    error={!!errors.bio}
                                    left={<TextInput.Icon icon="text" />}
                                    placeholder="Tell us about yourself..."
                                />
                                {errors.bio && (
                                    <Text style={styles.errorText}>{errors.bio}</Text>
                                )}
                                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'right' }}>
                                    {formData.bio.length}/500 characters
                                </Text>
                            </View>
                        </Surface>
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.actionSection}>
                        <View style={styles.buttonRow}>
                            <Button
                                mode="outlined"
                                onPress={handleCancel}
                                style={styles.button}
                                textColor={theme.colors.onSurface}
                                icon="close"
                                disabled={saving}
                            >
                                Cancel
                            </Button>
                            <Button
                                mode="contained"
                                onPress={handleSave}
                                style={[styles.button, styles.saveButton]}
                                loading={saving}
                                disabled={saving}
                                icon="check"
                            >
                                {saving ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default EditProfileScreen;
