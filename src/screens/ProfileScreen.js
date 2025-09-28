import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Modal } from 'react-native';
import { Avatar, Text, Button, Surface, useTheme, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import authService from '../services/authService';
import mediaService from '../services/mediaService';
import AccountSwitcher from '../components/AccountSwitcher';

const ProfileScreen = ({ navigation }) => {
    const theme = useTheme();
    const [user, setUser] = useState(null);
    const [savedAccounts, setSavedAccounts] = useState({});
    const [showAccountSwitcher, setShowAccountSwitcher] = useState(false);
    
    // Format date for 'Member since' display
    const formatDate = (timestamp) => {
        if (!timestamp) return 'Unknown';
        return new Date(timestamp).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long'
        });
    };
    
    useEffect(() => {
        const unsubscribe = authService.initAuthStateListener((userData) => {
            setUser(userData);
        });

        loadSavedAccounts();

        return () => unsubscribe();
    }, []);

    const loadSavedAccounts = async () => {
        const accounts = await authService.getSavedAccounts();
        setSavedAccounts(accounts);
    };

    const handleUpdateAvatar = async () => {
        try {
            const result = await mediaService.pickImage();
            if (!result.canceled) {
                const url = await mediaService.uploadProfileImage(result.assets[0].uri);
                await authService.updateProfile({ avatar: url });
            }
        } catch (error) {
            console.error('Error updating avatar:', error);
        }
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
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Profile Header */}
                <Surface style={styles.headerCard} elevation={2}>
                    <View style={styles.headerContent}>
                        <View style={styles.avatarSection}>
                            <View style={styles.avatarContainer}>
                                <Avatar.Image
                                    size={100}
                                    source={
                                        user?.profile?.avatar
                                            ? { uri: user.profile.avatar }
                                            : require('../../assets/favicon.png')
                                    }
                                />
                                <IconButton
                                    icon="camera"
                                    size={20}
                                    iconColor="white"
                                    style={styles.cameraButton}
                                    onPress={handleUpdateAvatar}
                                />
                                {user?.online && (
                                    <View style={styles.onlineIndicator} />
                                )}
                            </View>
                        </View>
                        
                        <View style={styles.userInfo}>
                            <Text variant="headlineSmall" style={styles.name}>
                                {user?.profile?.username || 'No Name'}
                            </Text>
                            <Text variant="bodyMedium" style={styles.email}>
                                {user?.email}
                            </Text>
                            <Text variant="bodySmall" style={styles.memberSince}>
                                Member since {formatDate(user?.profile?.createdAt)}
                            </Text>
                        </View>

                        <View style={styles.accountSwitcher}>
                            <IconButton
                                icon="account-switch"
                                size={24}
                                onPress={() => setShowAccountSwitcher(true)}
                                mode="contained"
                                containerColor={theme.colors.primaryContainer}
                            />
                            <View style={styles.accountBadge}>
                                <Text style={styles.accountCount}>
                                    {Object.keys(savedAccounts).length}
                                </Text>
                            </View>
                        </View>
                    </View>
                </Surface>

                {/* Quick Actions */}
                <Surface style={styles.actionsCard} elevation={2}>
                    <Text variant="titleMedium" style={styles.sectionTitle}>Quick Actions</Text>
                    <View style={styles.actionButtons}>
                        <Button
                            mode="contained"
                            icon="account-edit"
                            onPress={() => navigation.navigate('EditProfile')}
                            style={styles.actionButton}
                        >
                            Edit Profile
                        </Button>
                        <Button
                            mode="contained-tonal"
                            icon="cog"
                            onPress={() => navigation.navigate('Settings')}
                            style={styles.actionButton}
                        >
                            Settings
                        </Button>
                        <Button
                            mode="contained-tonal"
                            icon="bell"
                            onPress={() => navigation.navigate('Notifications')}
                            style={styles.actionButton}
                        >
                            Notifications
                        </Button>
                    </View>
                </Surface>

                {/* Account Stats */}
                <Surface style={styles.accountStatsCard} elevation={2}>
                    <Text variant="titleMedium" style={styles.sectionTitle}>Account Stats</Text>
                    <View style={styles.accountStats}>
                        <View style={styles.stat}>
                            <Text variant="headlineMedium">{Object.keys(savedAccounts).length}</Text>
                            <Text variant="bodyMedium">Accounts</Text>
                        </View>
                        <View style={styles.stat}>
                            <Text variant="headlineMedium">
                                {user?.online ? 'Online' : 'Offline'}
                            </Text>
                            <Text variant="bodyMedium">Status</Text>
                        </View>
                    </View>
                </Surface>

                {/* About Section */}
                <Surface style={styles.aboutCard} elevation={2}>
                    <View style={styles.sectionHeader}>
                        <Text variant="titleMedium" style={styles.sectionTitle}>About</Text>
                        <IconButton
                            icon="pencil"
                            size={20}
                            onPress={() => navigation.navigate('EditProfile')}
                        />
                    </View>
                    <Text variant="bodyMedium" style={styles.bio}>
                        {user?.profile?.bio || 'No bio added yet. Tell us about yourself!'}
                    </Text>
                </Surface>

                {/* Account Section */}
                <Surface style={styles.accountCard} elevation={2}>
                    <Text variant="titleMedium" style={styles.sectionTitle}>Account</Text>
                    <Button
                        mode="outlined"
                        icon="logout"
                        onPress={handleLogout}
                        textColor={theme.colors.error}
                        style={styles.signOutButton}
                    >
                        Sign Out
                    </Button>
                </Surface>
            </ScrollView>

            {/* Account Switcher Modal */}
            <Modal
                visible={showAccountSwitcher}
                transparent
                animationType="slide"
                onRequestClose={() => setShowAccountSwitcher(false)}
            >
                <View style={styles.modalContainer}>
                    <AccountSwitcher onClose={() => setShowAccountSwitcher(false)} />
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const ProfileScreen = ({ navigation }) => {
    const theme = useTheme();
    const [user, setUser] = useState(null);
    const [savedAccounts, setSavedAccounts] = useState({});
    const [showAccountSwitcher, setShowAccountSwitcher] = useState(false);
    
    // Format date for 'Member since' display
    const formatDate = (timestamp) => {
        if (!timestamp) return 'Unknown';
        return new Date(timestamp).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long'
        });
    };
    
    useEffect(() => {
        const unsubscribe = authService.initAuthStateListener((userData) => {
            setUser(userData);
        });

        loadSavedAccounts();

        return () => unsubscribe();
    }, []);

    const loadSavedAccounts = async () => {
        const accounts = await authService.getSavedAccounts();
        setSavedAccounts(accounts);
    };

    const handleUpdateAvatar = async () => {
        try {
            const result = await mediaService.pickImage();
            if (!result.canceled) {
                const url = await mediaService.uploadProfileImage(result.assets[0].uri);
                await authService.updateProfile({ avatar: url });
            }
        } catch (error) {
            console.error('Error updating avatar:', error);
        }
    };

    const handleLogout = async () => {
        try {
            await authService.signOut();
            navigation.replace('Auth');
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.colors.background,
        },
        headerCard: {
            margin: 16,
            borderRadius: 12,
            overflow: 'hidden',
        },
        headerContent: {
            padding: 16,
            position: 'relative',
        },
        avatarSection: {
            alignItems: 'center',
            marginBottom: 16,
        },
        avatarContainer: {
            position: 'relative',
        },
        cameraButton: {
            position: 'absolute',
            bottom: 0,
            right: 0,
            backgroundColor: theme.colors.primary,
            borderRadius: 15,
        },
        onlineIndicator: {
            position: 'absolute',
            bottom: 5,
            right: 5,
            width: 12,
            height: 12,
            borderRadius: 6,
            backgroundColor: '#4CAF50',
            borderWidth: 2,
            borderColor: 'white',
        },
        userInfo: {
            alignItems: 'center',
            marginTop: 8,
        },
        name: {
            fontWeight: 'bold',
            marginBottom: 4,
            color: theme.colors.onSurface,
        },
        email: {
            color: theme.colors.secondary,
            marginBottom: 4,
        },
        memberSince: {
            color: theme.colors.outline,
        },
        accountSwitcher: {
            position: 'absolute',
            top: 16,
            right: 16,
        },
        accountBadge: {
            position: 'absolute',
            top: -5,
            right: -5,
            backgroundColor: theme.colors.error,
            borderRadius: 10,
            width: 20,
            height: 20,
            justifyContent: 'center',
            alignItems: 'center',
        },
        accountCount: {
            color: 'white',
            fontSize: 12,
        },
        actionsCard: {
            margin: 16,
            marginTop: 0,
            padding: 16,
            borderRadius: 12,
        },
        accountStatsCard: {
            margin: 16,
            marginTop: 0,
            padding: 16,
            borderRadius: 12,
        },
        accountStats: {
            flexDirection: 'row',
            justifyContent: 'space-around',
            marginTop: 8,
        },
        stat: {
            alignItems: 'center',
        },
        aboutCard: {
            margin: 16,
            marginTop: 0,
            padding: 16,
            borderRadius: 12,
        },
        accountCard: {
            margin: 16,
            marginTop: 0,
            padding: 16,
            borderRadius: 12,
            marginBottom: 32,
        },
        sectionHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 8,
        },
        sectionTitle: {
            fontWeight: '600',
            marginBottom: 16,
            color: theme.colors.onSurface,
        },
        actionButtons: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 8,
        },
        actionButton: {
            flex: 1,
            minWidth: '30%',
        },
        bio: {
            lineHeight: 20,
            color: theme.colors.onSurfaceVariant,
        },
        signOutButton: {
            borderColor: theme.colors.error,
            marginTop: 8,
        },
        modalContainer: {
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'flex-end',
        },
    });


    useEffect(() => {
        const unsubscribe = authService.initAuthStateListener((userData) => {
            setUser(userData);
        });

        loadSavedAccounts();

        return () => unsubscribe();
    }, []);

    const loadSavedAccounts = async () => {
        const accounts = await authService.getSavedAccounts();
        setSavedAccounts(accounts);
    };

    const handleUpdateAvatar = async () => {
        try {
            const result = await mediaService.pickImage();
            if (!result.canceled) {
                const url = await mediaService.uploadProfileImage(result.assets[0].uri);
                await authService.updateProfile({ avatar: url });
            }
        } catch (error) {
            console.error('Error updating avatar:', error);
        }
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
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Profile Header */}
                <Surface style={styles.headerCard} elevation={2}>
                    <View style={styles.headerContent}>
                        <View style={styles.avatarSection}>
                            <View style={styles.avatarContainer}>
                                <Avatar.Image
                                    size={100}
                                    source={
                                        user?.profile?.avatar
                                            ? { uri: user.profile.avatar }
                                            : require('../../assets/favicon.png')
                                    }
                                />
                                <IconButton
                                    icon="camera"
                                    size={20}
                                    iconColor="white"
                                    style={styles.cameraButton}
                                    onPress={handleUpdateAvatar}
                                />
                                {user?.online && (
                                    <View style={styles.onlineIndicator} />
                                )}
                            </View>
                        </View>
                        
                        <View style={styles.userInfo}>
                            <Text variant="headlineSmall" style={styles.name}>
                                {user?.profile?.username || 'No Name'}
                            </Text>
                            <Text variant="bodyMedium" style={styles.email}>
                                {user?.email}
                            </Text>
                            <Text variant="bodySmall" style={styles.memberSince}>
                                Member since {formatDate(user?.profile?.createdAt)}
                            </Text>
                        </View>

                        <View style={styles.accountSwitcher}>
                            <IconButton
                                icon="account-switch"
                                size={24}
                                onPress={() => setShowAccountSwitcher(true)}
                                mode="contained"
                                containerColor={theme.colors.primaryContainer}
                            />
                            <View style={styles.accountBadge}>
                                <Text style={styles.accountCount}>
                                    {Object.keys(savedAccounts).length}
                                </Text>
                            </View>
                        </View>
                    </View>
                </Surface>

                {/* Quick Actions */}
                <Surface style={styles.actionsCard} elevation={2}>
                    <Text variant="titleMedium" style={styles.sectionTitle}>Quick Actions</Text>
                    <View style={styles.actionButtons}>
                        <Button
                            mode="contained"
                            icon="account-edit"
                            onPress={() => navigation.navigate('EditProfile')}
                            style={styles.actionButton}
                        >
                            Edit Profile
                        </Button>
                        <Button
                            mode="contained-tonal"
                            icon="cog"
                            onPress={() => navigation.navigate('Settings')}
                            style={styles.actionButton}
                        >
                            Settings
                        </Button>
                        <Button
                            mode="contained-tonal"
                            icon="bell"
                            onPress={() => navigation.navigate('Notifications')}
                            style={styles.actionButton}
                        >
                            Notifications
                        </Button>
                    </View>
                </Surface>

                {/* Account Stats */}
                <Surface style={styles.accountStatsCard} elevation={2}>
                    <Text variant="titleMedium" style={styles.sectionTitle}>Account Stats</Text>
                    <View style={styles.accountStats}>
                        <View style={styles.stat}>
                            <Text variant="headlineMedium">{Object.keys(savedAccounts).length}</Text>
                            <Text variant="bodyMedium">Accounts</Text>
                        </View>
                        <View style={styles.stat}>
                            <Text variant="headlineMedium">
                                {user?.online ? 'Online' : 'Offline'}
                            </Text>
                            <Text variant="bodyMedium">Status</Text>
                        </View>
                    </View>
                </Surface>

                {/* About Section */}
                <Surface style={styles.aboutCard} elevation={2}>
                    <View style={styles.sectionHeader}>
                        <Text variant="titleMedium" style={styles.sectionTitle}>About</Text>
                        <IconButton
                            icon="pencil"
                            size={20}
                            onPress={() => navigation.navigate('EditProfile')}
                        />
                    </View>
                    <Text variant="bodyMedium" style={styles.bio}>
                        {user?.profile?.bio || 'No bio added yet. Tell us about yourself!'}
                    </Text>
                </Surface>

                {/* Account Section */}
                <Surface style={styles.accountCard} elevation={2}>
                    <Text variant="titleMedium" style={styles.sectionTitle}>Account</Text>
                    <Button
                        mode="outlined"
                        icon="logout"
                        onPress={handleLogout}
                        textColor={theme.colors.error}
                        style={styles.signOutButton}
                    >
                        Sign Out
                    </Button>
                </Surface>
            </ScrollView>

            {/* Account Switcher Modal */}
            <Modal
                visible={showAccountSwitcher}
                transparent
                animationType="slide"
                onRequestClose={() => setShowAccountSwitcher(false)}
            >
                <View style={styles.modalContainer}>
                    <AccountSwitcher onClose={() => setShowAccountSwitcher(false)} />
                </View>
            </Modal>
        </SafeAreaView>
    );
                            <View style={styles.avatarContainer}>
                                <Avatar.Image
                                    size={100}
                                    source={
                                        user?.profile?.avatar
                                            ? { uri: user.profile.avatar }
                                            : require('../../assets/favicon.png')
                                    }
                                />
                                <IconButton
                                    icon="camera"
                                    size={20}
                                    iconColor="white"
                                    style={styles.cameraButton}
                                    onPress={handleUpdateAvatar}
                                />
                            </View>
                            {user?.online && (
                                <View style={[styles.onlineIndicator, { backgroundColor: theme.colors.primary }]} />
                            )}
                        </View>
                        
                        <View style={styles.userInfo}>
                            <Text variant="headlineSmall" style={styles.name}>
                                {user?.profile?.username || 'No Name'}
                            </Text>
                            <Text variant="bodyMedium" style={styles.email}>
                                {user?.email}
                            </Text>
                            <Text variant="bodySmall" style={styles.memberSince}>
                                Member since {formatDate(user?.profile?.createdAt)}
                            </Text>
                        </View>

                        <View style={styles.accountSwitcher}>
                            <IconButton
                                icon="account-switch"
                                size={24}
                                onPress={() => setShowAccountSwitcher(true)}
                                mode="contained"
                                containerColor={theme.colors.primaryContainer}
                            />
                            <View style={styles.accountBadge}>
                                <Text style={styles.accountCount}>
                                    {Object.keys(savedAccounts).length}
                                </Text>
                            </View>
                        </View>
                    </View>
                </Surface>

                {/* Quick Actions */}
                <Surface style={styles.actionsCard} elevation={2}>
                    <Text variant="titleMedium" style={styles.sectionTitle}>Quick Actions</Text>
                    <View style={styles.actionButtons}>
                        <Button
                            mode="contained"
                            icon="account-edit"
                            onPress={() => navigation.navigate('EditProfile')}
                            style={styles.actionButton}
                        >
                            Edit Profile
                        </Button>
                        <Button
                            mode="contained-tonal"
                            icon="theme-light-dark"
                            onPress={() => {/* Toggle theme */}}
                            style={styles.actionButton}
                        >
                            Dark Mode
                        </Button>
                    </View>
                </Surface>

                {/* About Section */}
                <Surface style={styles.aboutCard} elevation={2}>
                    <Text variant="titleMedium" style={styles.sectionTitle}>About</Text>
                    <Text variant="bodyMedium" style={styles.bio}>
                        {user?.profile?.bio || 'No bio added yet. Tell us about yourself!'}
                    </Text>
                </Surface>

                {/* Account Section */}
                <Surface style={styles.accountCard} elevation={2}>
                    <Text variant="titleMedium" style={styles.sectionTitle}>Account</Text>
                    <Button
                        mode="outlined"
                        icon="logout"
                        onPress={handleLogout}
                        textColor={theme.colors.error}
                        style={styles.signOutButton}
                    >
                        Sign Out
                    </Button>
                </Surface>
                    </Text>
                </Surface>

                <Surface style={styles.infoSection} elevation={2}>
                    <View style={styles.sectionHeader}>
                        <Text variant="titleMedium" style={styles.sectionTitle}>
                            Bio
                        </Text>
                        <IconButton
                            icon="pencil"
                            size={20}
                            onPress={() => navigation.navigate('EditProfile')}
                        />
                    </View>
                    <Text variant="bodyMedium" style={styles.bio}>
                        {user?.profile?.bio || 'No bio added yet'}
                    </Text>
                </Surface>

                <Surface style={styles.infoSection} elevation={2}>
                    <Text variant="titleMedium" style={styles.sectionTitle}>
                        Quick Actions
                    </Text>
                    <View style={styles.quickActions}>
                        <Button
                            mode="contained-tonal"
                            icon="cog"
                            onPress={() => navigation.navigate('Settings')}
                            style={styles.actionButton}
                        >
                            Settings
                        </Button>
                        <Button
                            mode="contained-tonal"
                            icon="bell"
                            onPress={() => navigation.navigate('Notifications')}
                            style={styles.actionButton}
                        >
                            Notifications
                        </Button>
                    </View>
                </Surface>

                <Surface style={styles.infoSection} elevation={2}>
                    <Text variant="titleMedium" style={styles.sectionTitle}>
                        Account
                    </Text>
                    <View style={styles.accountStats}>
                        <View style={styles.stat}>
                            <Text variant="headlineMedium">{Object.keys(savedAccounts).length}</Text>
                            <Text variant="bodyMedium">Accounts</Text>
                        </View>
                        <View style={styles.stat}>
                            <Text variant="headlineMedium">
                                {user?.online ? 'Online' : 'Offline'}
                            </Text>
                            <Text variant="bodyMedium">Status</Text>
                        </View>
                    </View>
                </Surface>

                <Button
                    mode="outlined"
                    onPress={handleLogout}
                    style={styles.signOutButton}
                    textColor={theme.colors.error}
                    icon="logout"
                >
                    Sign Out
                </Button>
            </ScrollView>

            <Modal
                visible={showAccountSwitcher}
                transparent
                animationType="slide"
                onRequestClose={() => setShowAccountSwitcher(false)}
            >
                <View style={styles.modalContainer}>
                    <AccountSwitcher onClose={() => setShowAccountSwitcher(false)} />
                </View>
            </Modal>
        </SafeAreaView>
    );
};


export default ProfileScreen;
