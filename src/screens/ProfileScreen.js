import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Avatar, Text, Button, Surface, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

const ProfileScreen = ({ navigation }) => {
    const theme = useTheme();
    const user = {
        name: 'John Doe',
        email: 'john.doe@example.com',
        avatar: null,
        bio: 'Software Developer | React Native Enthusiast',
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView>
                <Surface style={styles.header} elevation={4}>
                    <Avatar.Image
                        size={120}
                        source={
                            user.avatar
                                ? { uri: user.avatar }
                                : require('../../assets/favicon.png')
                        }
                    />
                    <Text variant="headlineMedium" style={styles.name}>
                        {user.name}
                    </Text>
                    <Text variant="bodyLarge" style={styles.email}>
                        {user.email}
                    </Text>
                </Surface>

                <Surface style={styles.bioSection} elevation={2}>
                    <Text variant="titleMedium" style={styles.sectionTitle}>
                        Bio
                    </Text>
                    <Text variant="bodyMedium" style={styles.bio}>
                        {user.bio}
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
                    onPress={() => navigation.replace('Auth')}
                    style={styles.signOutButton}
                    textColor={theme.colors.error}
                >
                    Sign Out
                </Button>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
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

export default ProfileScreen;
