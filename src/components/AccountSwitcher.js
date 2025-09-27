import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { List, Avatar, IconButton, Text, Surface, useTheme, Button } from 'react-native-paper';
import authService from '../services/authService';

const AccountSwitcher = ({ onClose, currentUser, savedAccounts }) => {
    const theme = useTheme();

    const handleSwitchAccount = async (uid) => {
        try {
            await authService.switchAccount(uid);
            onClose();
        } catch (error) {
            console.error('Error switching account:', error);
        }
    };

    const handleRemoveAccount = async (uid) => {
        try {
            await authService.removeSavedAccount(uid);
        } catch (error) {
            console.error('Error removing account:', error);
        }
    };

    return (
        <Surface style={styles.container} elevation={4}>
            <View style={styles.header}>
                <Text variant="titleLarge">Switch Account</Text>
                <IconButton icon="close" onPress={onClose} />
            </View>

            <ScrollView style={styles.accountList}>
                {Object.entries(savedAccounts).map(([uid, account]) => (
                    <List.Item
                        key={uid}
                        title={account.profile?.username || account.email}
                        description={account.email}
                        left={() => (
                            <Avatar.Image
                                size={40}
                                source={
                                    account.profile?.avatar
                                        ? { uri: account.profile.avatar }
                                        : require('../../assets/favicon.png')
                                }
                            />
                        )}
                        right={() => (
                            <View style={styles.accountActions}>
                                {uid === user?.uid && (
                                    <Text variant="bodySmall" style={{ color: theme.colors.primary }}>
                                        Active
                                    </Text>
                                )}
                                <IconButton
                                    icon="account-switch"
                                    disabled={uid === user?.uid}
                                    onPress={() => handleSwitchAccount(uid)}
                                />
                                <IconButton
                                    icon="delete-outline"
                                    onPress={() => handleRemoveAccount(uid)}
                                />
                            </View>
                        )}
                    />
                ))}
            </ScrollView>

            <Button
                mode="outlined"
                onPress={onClose}
                style={styles.closeButton}
            >
                Close
            </Button>
        </Surface>
    );
};

const styles = StyleSheet.create({
    container: {
        maxHeight: '80%',
        width: '90%',
        borderRadius: 12,
        backgroundColor: 'white',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    accountList: {
        paddingHorizontal: 8,
    },
    accountActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    closeButton: {
        margin: 16,
    },
});

export default AccountSwitcher;
