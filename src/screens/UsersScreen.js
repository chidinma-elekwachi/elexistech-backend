import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Avatar, Text, Surface, TouchableRipple, useTheme, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import { formatDistanceToNow } from 'date-fns';

const UsersScreen = ({ navigation }) => {
    const theme = useTheme();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, orderBy('lastSeen', 'desc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const usersList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                lastSeen: doc.data().lastSeen ? formatDistanceToNow(doc.data().lastSeen.toDate(), { addSuffix: true }) : 'Never'
            }));
            setUsers(usersList);
            setLoading(false);
        }, (error) => {
            console.error('Error fetching users:', error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    if (loading) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </SafeAreaView>
        );
    }

    const renderUser = ({ item }) => (
        <TouchableRipple
            onPress={() => navigation.navigate('Chat', { user: item })}
            style={styles.userCard}
        >
            <Surface style={styles.userCardInner} elevation={1}>
                <View style={styles.avatarContainer}>
                    <Avatar.Image
                        size={60}
                        source={
                            item.avatar
                                ? { uri: item.avatar }
                                : require('../../assets/favicon.png')
                        }
                    />
                    {item.online && <View style={[styles.onlineIndicator, { backgroundColor: theme.colors.primary }]} />}
                </View>
                <View style={styles.userInfo}>
                    <Text variant="titleMedium" style={styles.userName}>
                        {item.name}
                    </Text>
                    <Text variant="bodyMedium" style={styles.userBio}>
                        {item.bio || 'No bio added yet'}
                    </Text>
                    <Text variant="bodySmall" style={[
                        styles.lastSeen,
                        item.online && { color: theme.colors.primary }
                    ]}>
                        {item.online ? 'Online' : `Last seen ${item.lastSeen}`}
                    </Text>
                </View>
            </Surface>
        </TouchableRipple>
    );

    return (
        <SafeAreaView style={styles.container}>
            <Surface style={styles.header} elevation={2}>
                <Text variant="headlineSmall" style={styles.headerTitle}>
                    Available Users
                </Text>
            </Surface>

            <FlatList
                data={users}
                renderItem={renderUser}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContainer}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        padding: 16,
        backgroundColor: 'white',
        marginBottom: 8,
    },
    headerTitle: {
        fontWeight: 'bold',
    },
    listContainer: {
        padding: 8,
    },
    userCard: {
        marginBottom: 8,
        borderRadius: 10,
        overflow: 'hidden',
    },
    userCardInner: {
        flexDirection: 'row',
        padding: 12,
        backgroundColor: 'white',
        alignItems: 'center',
    },
    userInfo: {
        marginLeft: 16,
        flex: 1,
    },
    userName: {
        fontWeight: 'bold',
    },
    userBio: {
        opacity: 0.7,
        marginTop: 2,
    },
    lastSeen: {
        marginTop: 4,
        opacity: 0.5,
    },
});

export default UsersScreen;
