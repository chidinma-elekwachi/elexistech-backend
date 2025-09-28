import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Modal, Dimensions, TouchableOpacity } from 'react-native';
import { Avatar, Text, Button, Surface, useTheme, IconButton, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import authService from '../services/authService';
import AccountSwitcher from '../components/AccountSwitcher';
import { useFocusEffect } from '@react-navigation/native';
import callService from '../services/callService';

const { width } = Dimensions.get('window');

const ProfileScreen = ({ navigation }) => {
    const theme = useTheme();
    const [user, setUser] = useState(null);
    const [savedAccounts, setSavedAccounts] = useState({});
    const [showAccountSwitcher, setShowAccountSwitcher] = useState(false);

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.colors.background,
        },
        scrollContainer: {
            flexGrow: 1,
        },
        // Header Section with Gradient
        headerSection: {
            paddingTop: 20,
            paddingBottom: 30,
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
            alignItems: 'flex-start',
            marginBottom: 20,
        },
        accountSwitcher: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            borderRadius: 25,
            paddingHorizontal: 12,
            paddingVertical: 8,
        },
        accountBadge: {
            backgroundColor: theme.colors.error,
            borderRadius: 10,
            width: 20,
            height: 20,
            justifyContent: 'center',
            alignItems: 'center',
            marginLeft: 8,
        },
        accountCount: {
            color: 'white',
            fontSize: 12,
            fontWeight: 'bold',
        },
        profileInfo: {
            alignItems: 'center',
        },
        avatarContainer: {
            position: 'relative',
            marginBottom: 16,
        },
        avatar: {
            borderWidth: 4,
            borderColor: 'rgba(255, 255, 255, 0.3)',
        },
        onlineIndicator: {
            position: 'absolute',
            bottom: 8,
            right: 8,
            width: 16,
            height: 16,
            borderRadius: 8,
            borderWidth: 3,
            borderColor: 'white',
        },
        userName: {
            color: 'white',
            fontWeight: 'bold',
            marginBottom: 4,
        },
        userEmail: {
            color: 'rgba(255, 255, 255, 0.8)',
            fontSize: 16,
        },
        // Content Sections
        contentSection: {
            paddingHorizontal: 20,
            paddingBottom: 20,
        },
        sectionCard: {
            backgroundColor: theme.colors.surface,
            borderRadius: 16,
            marginBottom: 16,
            overflow: 'hidden',
        },
        sectionHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 20,
            paddingVertical: 16,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.surfaceVariant,
        },
        sectionTitle: {
            fontWeight: '600',
            color: theme.colors.onSurface,
        },
        sectionContent: {
            padding: 20,
        },
        bioText: {
            lineHeight: 24,
            color: theme.colors.onSurfaceVariant,
        },
        // Quick Actions
        quickActions: {
            flexDirection: 'row',
            justifyContent: 'space-around',
            paddingVertical: 8,
        },
        actionButton: {
            flex: 1,
            marginHorizontal: 8,
            borderRadius: 12,
        },
        // Account Stats
        accountStats: {
            flexDirection: 'row',
            justifyContent: 'space-around',
            paddingVertical: 16,
        },
        statItem: {
            alignItems: 'center',
            flex: 1,
        },
        statValue: {
            fontWeight: 'bold',
            marginBottom: 4,
        },
        statLabel: {
            color: theme.colors.onSurfaceVariant,
            fontSize: 14,
        },
        // Sign Out Button
        signOutSection: {
            paddingHorizontal: 20,
            paddingBottom: 30,
        },
        signOutButton: {
            borderRadius: 12,
            borderColor: theme.colors.error,
        },
        // Modal
        modalContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
        },
    });


    useEffect(() => {
        const unsubscribe = authService.initAuthStateListener(async (userData) => {
            try {
                if (userData?.uid) {
                    const profile = await authService.getUserProfile(userData.uid);
                    setUser({ ...userData, profile });
                } else {
                    setUser(null);
                }
            } catch (e) {
                console.error('Failed to load user profile on auth change:', e);
                setUser(userData || null);
            }
        });
        return () => unsubscribe();
    }, []);

    const refreshUser = useCallback(async () => {
        try {
            const currentUser = await authService.getCurrentUser();
            if (currentUser?.uid) {
                const profile = await authService.getUserProfile(currentUser.uid);
                setUser({ ...currentUser, profile });
            } else {
                setUser(null);
            }
        } catch (error) {
            console.error('Failed to refresh user:', error);
        }
    }, []);

    const refreshSavedAccounts = useCallback(async () => {
        try {
            const accounts = await authService.getSavedAccounts();
            setSavedAccounts(accounts);
        } catch (e) {
            console.error('Failed to load saved accounts:', e);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            refreshUser();
            refreshSavedAccounts();

            // Listen for incoming calls
            let unsubscribeCall;
            (async () => {
                const cu = await authService.getCurrentUser();
                if (cu?.uid) {
                    unsubscribeCall = callService.listenForIncomingCalls(cu.uid, (call) => {
                        if (call && (call.status === 'initializing' || call.status === 'offering' || call.status === 'ringing')) {
                            // Navigate to Call screen with caller info minimal
                            navigation.navigate('Call', { user: { id: call.callerId, name: 'Incoming Caller', avatar: null }, incoming: true, callId: call.id });
                        }
                    });
                }
            })();

            return () => {
                if (unsubscribeCall) unsubscribeCall();
            };
        }, [refreshUser, refreshSavedAccounts])
    );

    const loadSavedAccounts = async () => {
        const accounts = await authService.getSavedAccounts();
        setSavedAccounts(accounts);
    };


    const handleLogout = async () => {
        try {
            await authService.signOut();
            navigation.replace('Auth');
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                style={styles.scrollContainer}
                showsVerticalScrollIndicator={false}
            >
                {/* Header Section with Gradient */}
                <View style={styles.headerSection}>
                    <LinearGradient
                        colors={[theme.colors.primary, theme.colors.secondary]}
                        style={styles.gradientHeader}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        {/* Account Switcher */}
                        <View style={styles.headerTop}>
                            <TouchableOpacity
                                style={styles.accountSwitcher}
                                onPress={() => setShowAccountSwitcher(true)}
                                activeOpacity={0.7}
                            >
                                <IconButton
                                    icon="account-switch"
                                    size={20}
                                    iconColor="white"
                                />
                                <Text variant="bodyMedium" style={{ color: 'white', marginRight: 8 }}>
                                    Switch Account
                                </Text>
                                <View style={styles.accountBadge}>
                                    <Text variant="labelSmall" style={styles.accountCount}>
                                        {Object.keys(savedAccounts).length}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        </View>

                        {/* Profile Info */}
                        <View style={styles.profileInfo}>
                            <View style={styles.avatarContainer}>
                                <Avatar.Image
                                    size={100}
                                    source={
                                        user?.profile?.avatar
                                            ? { uri: user.profile.avatar }
                                            : require('../../assets/favicon.png')
                                    }
                                    style={styles.avatar}
                                />
                                {user?.online && (
                                    <View style={[styles.onlineIndicator, { backgroundColor: theme.colors.success }]} />
                                )}
                            </View>

                            <Text variant="headlineSmall" style={styles.userName}>
                                {user?.profile?.name || 'No Name'}
                            </Text>
                            <Text variant="bodyLarge" style={styles.userEmail}>
                                {user?.email}
                            </Text>
                        </View>
                    </LinearGradient>
                </View>

                {/* Content Sections */}
                <View style={styles.contentSection}>
                    {/* Bio Section */}
                    <Surface style={styles.sectionCard} elevation={2}>
                        <View style={styles.sectionHeader}>
                            <Text variant="titleMedium" style={styles.sectionTitle}>
                                About
                            </Text>
                            <IconButton
                                icon="pencil"
                                size={20}
                                iconColor={theme.colors.primary}
                                onPress={() => navigation.navigate('EditProfile')}
                            />
                        </View>
                        <View style={styles.sectionContent}>
                            <Text variant="bodyMedium" style={styles.bioText}>
                                {user?.profile?.bio || 'No bio added yet. Tap the edit button to add one!'}
                            </Text>
                        </View>
                    </Surface>

                    {/* Quick Actions */}
                    <Surface style={styles.sectionCard} elevation={2}>
                        <View style={styles.sectionHeader}>
                            <Text variant="titleMedium" style={styles.sectionTitle}>
                                Quick Actions
                            </Text>
                        </View>
                        <View style={styles.sectionContent}>
                            <View style={styles.quickActions}>
                                <Button
                                    mode="contained-tonal"
                                    icon="account-edit"
                                    onPress={() => navigation.navigate('EditProfile')}
                                    style={styles.actionButton}
                                    contentStyle={{ paddingVertical: 8 }}
                                >
                                    Edit Profile
                                </Button>
                            </View>
                        </View>
                    </Surface>

                    {/* Account Stats */}
                    <Surface style={styles.sectionCard} elevation={2}>
                        <View style={styles.sectionHeader}>
                            <Text variant="titleMedium" style={styles.sectionTitle}>
                                Account Statistics
                            </Text>
                        </View>
                        <View style={styles.sectionContent}>
                            <View style={styles.accountStats}>
                                <View style={styles.statItem}>
                                    <Text variant="headlineMedium" style={styles.statValue}>
                                        {Object.keys(savedAccounts).length}
                                    </Text>
                                    <Text variant="bodyMedium" style={styles.statLabel}>
                                        Saved Accounts
                                    </Text>
                                </View>
                                <Divider style={{ width: 1, height: 40 }} />
                                <View style={styles.statItem}>
                                    <Text variant="headlineMedium" style={[
                                        styles.statValue,
                                        { color: user?.online ? theme.colors.success : theme.colors.error }
                                    ]}>
                                        {user?.online ? 'Online' : 'Offline'}
                                    </Text>
                                    <Text variant="bodyMedium" style={styles.statLabel}>
                                        Current Status
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </Surface>
                </View>

                {/* Sign Out Button */}
                <View style={styles.signOutSection}>
                    <Button
                        mode="outlined"
                        onPress={handleLogout}
                        style={styles.signOutButton}
                        textColor={theme.colors.error}
                        icon="logout"
                        contentStyle={{ paddingVertical: 8 }}
                    >
                        Sign Out
                    </Button>
                </View>
            </ScrollView>

            {/* Account Switcher Modal */}
            <Modal
                visible={showAccountSwitcher}
                transparent
                animationType="slide"
                onRequestClose={() => setShowAccountSwitcher(false)}
            >
                <View style={styles.modalContainer}>
                    <AccountSwitcher
                        onClose={() => setShowAccountSwitcher(false)}
                        currentUser={user}
                        savedAccounts={savedAccounts}
                    />
                </View>
            </Modal>
        </SafeAreaView>
    );
};


export default ProfileScreen;
