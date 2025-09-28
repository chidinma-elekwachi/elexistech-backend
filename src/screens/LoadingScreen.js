import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { ActivityIndicator, useTheme, Surface } from 'react-native-paper';
import authService from '../services/authService';

const LoadingScreen = ({ navigation }) => {
    const theme = useTheme();

    useEffect(() => {
        checkAuthState();
    }, []);

    const checkAuthState = async () => {
        try {
            const savedAccounts = await authService.getSavedAccounts();
            if (Object.keys(savedAccounts).length > 0) {
                // There are saved accounts, try to get current user (with silent re-login)
                const currentUser = await authService.getCurrentUser();
                if (currentUser) {
                    console.log('User authenticated, navigating to MainTabs');
                    navigation.replace('MainTabs');
                } else {
                    console.log('No current user found, navigating to Auth');
                    navigation.replace('Auth');
                }
            } else {
                // No saved accounts, go to auth screen
                console.log('No saved accounts, navigating to Auth');
                navigation.replace('Auth');
            }
        } catch (error) {
            console.error('Error checking auth state:', error);
            navigation.replace('Auth');
        }
    };

    return (
        <Surface style={styles.container} elevation={0}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
        </Surface>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
});

export default LoadingScreen;
