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

    const dynamicStyles = {
        accountBadge: {
            position: 'absolute',
            top: -4,
            right: -4,
            backgroundColor: theme.colors.primary,
            borderRadius: 10,
            width: 20,
            height: 20,
            justifyContent: 'center',
            alignItems: 'center',
        }
    };



    const styles = StyleSheet.create({
        modalContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
        },
        accountInfo: {
            position: 'absolute',
            top: 8,
            right: 8,
            flexDirection: 'row',
            alignItems: 'center',
        },
        accountBadge: {
            position: 'absolute',
            top: -4,
            right: -4,
            backgroundColor: theme.colors.primary,
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
        container: {
            flex: 1,
            backgroundColor: '#f5f5f5',
        },
        header: {
            alignItems: 'center',
            padding: 20,
            backgroundColor: 'white',
            margin: 16,
            borderRadius: 10,
        },
        name: {
            marginTop: 16,
            fontWeight: 'bold',
        },
        email: {
            marginTop: 4,
            opacity: 0.7,
        },
        bioSection: {
            margin: 16,
            padding: 16,
            backgroundColor: 'white',
            borderRadius: 10,
        },
        sectionTitle: {
            marginBottom: 8,
            fontWeight: 'bold',
        },
        bio: {
            lineHeight: 22,
        },
        editButton: {
            margin: 16,
        },
        signOutButton: {
            margin: 16,
            borderColor: 'red',
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
            <ScrollView>
                <Surface style={styles.header} elevation={4}>
                    <View style={styles.accountInfo}>
                        <IconButton
                            icon="account-switch"
                            size={24}
                            onPress={() => setShowAccountSwitcher(true)}
                            style={styles.switchButton}
                        />
                        <View style={dynamicStyles.accountBadge}>
                            <Text variant="labelSmall" style={styles.accountCount}>
                                {Object.keys(savedAccounts).length}
                            </Text>
                        </View>
                    </View>
                    <Avatar.Image
                        size={120}
                        source={
                            user?.profile?.avatar
                                ? { uri: user.profile.avatar }
                                : require('../../assets/favicon.png')
                        }
                    />
                    <Text variant="headlineMedium" style={styles.name}>
                        {user?.profile?.username || 'No Name'}
                    </Text>
                    <Text variant="bodyLarge" style={styles.email}>
                        {user?.email}
                    </Text>
                </Surface>

                <Surface style={styles.bioSection} elevation={2}>
                    <Text variant="titleMedium" style={styles.sectionTitle}>
                        Bio
                    </Text>
                    <Text variant="bodyMedium" style={styles.bio}>
                        {user?.profile?.bio || 'No bio added yet'}
                    </Text>
                </Surface>

                <Button
                    mode="contained"
                    onPress={() => navigation.navigate('EditProfile')}
                    style={styles.editButton}
                >
                    Edit Profile
                </Button>

                <Button
                    mode="outlined"
                    onPress={handleLogout}
                    style={styles.signOutButton}
                    textColor={theme.colors.error}
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
