import React, { useState } from 'react';
import { View, StyleSheet, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, Surface, TextInput, IconButton, Avatar, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

const ChatScreen = ({ route, navigation }) => {
    const { user } = route.params;
    const theme = useTheme();
    const [message, setMessage] = useState('');

    // Mock messages - replace with actual data
    const [messages, setMessages] = useState([
        {
            id: '1',
            text: 'Hi there!',
            sender: 'them',
            timestamp: '10:00 AM',
        },
        {
            id: '2',
            text: 'Hello! How are you?',
            sender: 'me',
            timestamp: '10:01 AM',
        },
    ]);

    const sendMessage = () => {
        if (message.trim()) {
            setMessages([
                ...messages,
                {
                    id: Date.now().toString(),
                    text: message.trim(),
                    sender: 'me',
                    timestamp: new Date().toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                    }),
                },
            ]);
            setMessage('');
        }
    };

    const renderMessage = ({ item }) => (
        <Surface
            style={[
                styles.messageBubble,
                item.sender === 'me'
                    ? styles.myMessage
                    : styles.theirMessage,
            ]}
            elevation={1}
        >
            <Text style={styles.messageText}>{item.text}</Text>
            <Text style={styles.timestamp}>{item.timestamp}</Text>
        </Surface>
    );

    return (
        <SafeAreaView style={styles.container}>
            <Surface style={styles.header} elevation={2}>
                <IconButton
                    icon="arrow-left"
                    size={24}
                    onPress={() => navigation.goBack()}
                />
                <Avatar.Image
                    size={40}
                    source={
                        user.avatar
                            ? { uri: user.avatar }
                            : require('../../assets/favicon.png')
                    }
                />
                <View style={styles.headerInfo}>
                    <Text variant="titleMedium" style={styles.headerName}>
                        {user.name}
                    </Text>
                    <Text variant="bodySmall" style={styles.headerStatus}>
                        {user.lastSeen}
                    </Text>
                </View>
            </Surface>

            <FlatList
                data={messages}
                renderItem={renderMessage}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.messageList}
                inverted
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <Surface style={styles.inputContainer} elevation={4}>
                    <TextInput
                        value={message}
                        onChangeText={setMessage}
                        placeholder="Type a message..."
                        mode="outlined"
                        style={styles.input}
                        right={
                            <TextInput.Icon
                                icon="send"
                                onPress={sendMessage}
                                disabled={!message.trim()}
                            />
                        }
                    />
                </Surface>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
        backgroundColor: 'white',
    },
    headerInfo: {
        marginLeft: 12,
        flex: 1,
    },
    headerName: {
        fontWeight: 'bold',
    },
    headerStatus: {
        opacity: 0.6,
    },
    messageList: {
        padding: 16,
        flexGrow: 1,
    },
    messageBubble: {
        maxWidth: '80%',
        padding: 12,
        borderRadius: 16,
        marginVertical: 4,
    },
    myMessage: {
        alignSelf: 'flex-end',
        backgroundColor: '#e3f2fd',
    },
    theirMessage: {
        alignSelf: 'flex-start',
        backgroundColor: 'white',
    },
    messageText: {
        fontSize: 16,
    },
    timestamp: {
        fontSize: 12,
        opacity: 0.6,
        marginTop: 4,
        alignSelf: 'flex-end',
    },
    inputContainer: {
        padding: 8,
        backgroundColor: 'white',
    },
    input: {
        backgroundColor: 'white',
    },
});

export default ChatScreen;
