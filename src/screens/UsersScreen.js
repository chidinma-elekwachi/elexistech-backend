import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Avatar, Text, Surface, TouchableRipple, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

const UsersScreen = ({ navigation }) => {
    const theme = useTheme();

    // Mock data - replace with actual data
    const users = [
        {
            id: '1',
            name: 'Alice Johnson',
            bio: 'UI/UX Designer',
            avatar: null,
            lastSeen: '2 min ago',
        },
        {
            id: '2',
            name: 'Bob Smith',
            bio: 'Full Stack Developer',
            avatar: null,
            lastSeen: 'Online',
        },
        // Add more mock users as needed
    ];

    const renderUser = ({ item }) => (
        <TouchableRipple
            onPress={() => navigation.navigate('Chat', { user: item })}
            style={styles.userCard}
        >
            <Surface style={styles.userCardInner} elevation={1}>
                <Avatar.Image
                    size={60}
                    source={
                        item.avatar
                            ? { uri: item.avatar }
                            : require('../../assets/favicon.png')
                    }
                />
                <View style={styles.userInfo}>
                    <Text variant="titleMedium" style={styles.userName}>
                        {item.name}
                    </Text>
                    <Text variant="bodyMedium" style={styles.userBio}>
                        {item.bio}
                    </Text>
                    <Text variant="bodySmall" style={styles.lastSeen}>
                        {item.lastSeen}
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
