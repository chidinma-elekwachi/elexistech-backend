import React, { useState } from 'react';
import {
    View,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Image,
    ToastAndroid,
    Alert
} from 'react-native';
import { TextInput, Button, Text, Surface, useTheme, IconButton, Snackbar } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import authService from '../services/authService';

const AuthScreen = ({ navigation }) => {
    const theme = useTheme();
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [visible, setVisible] = useState(false);

    const onDismissSnackBar = () => {
        setVisible(false);
        setError('');
    };

    const showError = (message) => {
        setError(message);
        setVisible(true);
    };

    const showSuccessMessage = (message) => {
        if (Platform.OS === 'android') {
            ToastAndroid.show(message, ToastAndroid.SHORT);
        } else {
            Alert.alert('Success', message);
        }
    };

    const handleSubmit = async () => {
        if (!email || !password) {
            showError('Please fill in all fields');
            return;
        }

        if (!isLogin && !username) {
            showError('Please enter a username');
            return;
        }

        setLoading(true);
        setError('');

        try {
            if (isLogin) {
                await authService.signIn(email, password);
                navigation.replace('MainTabs');
            } else {
                await authService.signUp(email, password, username);
                // Clear the form and switch to login mode
                showSuccessMessage('Account created successfully! Please sign in.');
                setIsLogin(true);
                setUsername('');
                setPassword('');
            }
        } catch (error) {
            if (error instanceof Error) {
                showError(error.message);
            } else {
                console.log('Unexpected error:', error);
                showError('An unexpected error occurred');
            }
        } finally {
            setLoading(false);
        }
    };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.colors.background,
        },
        scrollContainer: {
            flexGrow: 1,
            justifyContent: 'center',
            padding: 20,
        },
        surface: {
            padding: 24,
            borderRadius: theme.roundness,
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            shadowColor: '#000',
            shadowOffset: {
                width: 0,
                height: 2,
            },
            shadowOpacity: 0.1,
            shadowRadius: 3.84,
            elevation: 5,
        },
        title: {
            textAlign: 'center',
            marginBottom: 8,
            color: theme.colors.primary,
            fontWeight: 'bold',
        },
        subtitle: {
            textAlign: 'center',
            marginBottom: 24,
            color: theme.colors.secondary,
        },
        input: {
            marginBottom: 16,
            backgroundColor: 'transparent',
        },
        button: {
            marginTop: 16,
            padding: 4,
            borderRadius: theme.roundness,
        },
        switchButton: {
            marginTop: 16,
        },
        gradientBackground: {
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
        },
        logo: {
            width: 100,
            height: 100,
            alignSelf: 'center',
            marginBottom: 24,
        },
    });

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <LinearGradient
                colors={[theme.colors.primary, theme.colors.accent]}
                style={styles.gradientBackground}
            />
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <Surface style={styles.surface} elevation={4}>
                    <Image
                        source={require('../../assets/favicon.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                    <Text variant="displaySmall" style={styles.title}>
                        Elexistech
                    </Text>
                    <Text variant="titleLarge" style={styles.subtitle}>
                        {isLogin ? 'Welcome Back!' : 'Create Account'}
                    </Text>

                    {!isLogin && (
                        <TextInput
                            label="Username"
                            value={username}
                            onChangeText={setUsername}
                            mode="outlined"
                            style={styles.input}
                            autoCapitalize="none"
                            left={<TextInput.Icon icon="account" />}
                        />
                    )}

                    <TextInput
                        label="Email"
                        value={email}
                        onChangeText={setEmail}
                        mode="outlined"
                        style={styles.input}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        left={<TextInput.Icon icon="email" />}
                    />

                    <TextInput
                        label="Password"
                        value={password}
                        onChangeText={setPassword}
                        mode="outlined"
                        style={styles.input}
                        secureTextEntry
                        left={<TextInput.Icon icon="lock" />}
                        right={<TextInput.Icon icon="eye" />}
                    />

                    <Button
                        mode="contained"
                        onPress={handleSubmit}
                        style={styles.button}
                        contentStyle={{ paddingVertical: 8 }}
                        loading={loading}
                        disabled={loading}
                    >
                        {isLogin ? 'Sign In' : 'Sign Up'}
                    </Button>

                    <Button
                        mode="text"
                        onPress={() => {
                            setIsLogin(!isLogin);
                            setError('');
                            setVisible(false);
                        }}
                        style={styles.switchButton}
                        textColor={theme.colors.secondary}
                    >
                        {isLogin
                            ? "Don't have an account? Sign Up"
                            : 'Already have an account? Sign In'}
                    </Button>
                </Surface>
            </ScrollView>
            <Snackbar
                visible={visible}
                onDismiss={onDismissSnackBar}
                action={{
                    label: 'Close',
                    onPress: onDismissSnackBar,
                }}
                duration={3000}
                style={{ marginBottom: 20 }}
            >
                {error}
            </Snackbar>
        </KeyboardAvoidingView>
    );
};

export default AuthScreen;
