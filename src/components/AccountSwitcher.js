import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { List, Avatar, IconButton, Text, Surface, useTheme, Button } from 'react-native-paper';
import authService from '../services/authService';

const AccountSwitcher = ({ onClose, currentUser, savedAccounts, onAddAccount }) => {
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
                {Object.entries(savedAccounts || {}).map(([uid, account]) => (
                    <TouchableOpacity
                        key={uid}
                        onPress={() => uid !== currentUser?.uid && handleSwitchAccount(uid)}
                        disabled={uid === currentUser?.uid}
                        style={[
                            styles.accountItem,
                            uid === currentUser?.uid && styles.activeAccountItem
                        ]}
                    >
                        <View style={styles.accountContent}>
                            <Avatar.Image
                                size={40}
                                source={
                                    account.profile?.avatar
                                        ? { uri: account.profile.avatar }
                                        : require('../../assets/favicon.png')
                                }
                            />
                            <View style={styles.accountInfo}>
                                <Text variant="titleMedium" style={styles.accountTitle}>
                                    {account.profile?.name || account.email}
                                </Text>
                                <Text variant="bodySmall" style={styles.accountEmail}>
                                    {account.email}
                                </Text>
                            </View>
                            <View style={styles.accountActions}>
                                {uid === currentUser?.uid && (
                                    <Text variant="bodySmall" style={[styles.activeText, { color: theme.colors.primary }]}>
                                        Active
                                    </Text>
                                )}
                                {uid !== currentUser?.uid && (
                                    <IconButton
                                        icon="account-switch"
                                        size={20}
                                        iconColor={theme.colors.primary}
                                        onPress={() => handleSwitchAccount(uid)}
                                    />
                                )}
                                <IconButton
                                    icon="delete-outline"
                                    size={20}
                                    iconColor={theme.colors.error}
                                    onPress={() => handleRemoveAccount(uid)}
                                />
                            </View>
                        </View>
                    </TouchableOpacity>
                ))}
                {Object.keys(savedAccounts || {}).length === 0 && (
                    <View style={styles.emptyState}>
                        <Text variant="bodyMedium" style={{ textAlign: 'center', color: theme.colors.onSurfaceVariant }}>
                            No saved accounts found
                        </Text>
                    </View>
                )}
            </ScrollView>

            <View style={styles.buttonContainer}>
                <Button
                    mode="contained"
                    icon="account-plus"
                    onPress={onAddAccount}
                    style={styles.addButton}
                    contentStyle={{ paddingVertical: 4 }}
                >
                    Add Account
                </Button>
                <Button
                    mode="outlined"
                    onPress={onClose}
                    style={styles.closeButton}
                >
                    Close
                </Button>
            </View>
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
    accountItem: {
        marginVertical: 4,
        borderRadius: 8,
        backgroundColor: 'white',
    },
    activeAccountItem: {
        backgroundColor: '#f0f8ff',
        borderWidth: 1,
        borderColor: '#e3f2fd',
    },
    accountContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
    },
    accountInfo: {
        flex: 1,
        marginLeft: 12,
    },
    accountTitle: {
        fontWeight: '500',
    },
    accountEmail: {
        opacity: 0.7,
        marginTop: 2,
    },
    accountActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    activeText: {
        fontWeight: '500',
        marginRight: 8,
    },
    emptyState: {
        padding: 20,
        alignItems: 'center',
    },
    buttonContainer: {
        padding: 16,
        gap: 12,
    },
    addButton: {
        marginBottom: 8,
    },
    closeButton: {
        marginTop: 0,
    },
});

export default AccountSwitcher;
