import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Avatar, TextInput, Button, Surface, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';

const EditProfileScreen = ({ navigation }) => {
    const theme = useTheme();
    const [name, setName] = useState('John Doe');
    const [bio, setBio] = useState('Software Developer | React Native Enthusiast');
    const [avatar, setAvatar] = useState(null);

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (!result.canceled) {
            setAvatar(result.assets[0].uri);
        }
    };

    const handleSave = () => {
        // TODO: Implement save functionality
        navigation.goBack();
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView>
                <Surface style={styles.avatarSection} elevation={4}>
                    <Avatar.Image
                        size={120}
                        source={
                            avatar
                                ? { uri: avatar }
                                : require('../../assets/favicon.png')
                        }
                    />
                    <Button
                        mode="contained"
                        onPress={pickImage}
                        style={styles.changeAvatarButton}
                    >
                        Change Avatar
                    </Button>
                </Surface>

                <Surface style={styles.formSection} elevation={2}>
                    <TextInput
                        label="Name"
                        value={name}
                        onChangeText={setName}
                        mode="outlined"
                        style={styles.input}
                    />

                    <TextInput
                        label="Bio"
                        value={bio}
                        onChangeText={setBio}
                        mode="outlined"
                        multiline
                        numberOfLines={4}
                        style={styles.input}
                    />
                </Surface>

                <Button
                    mode="contained"
                    onPress={handleSave}
                    style={styles.saveButton}
                >
                    Save Changes
                </Button>

                <Button
                    mode="outlined"
                    onPress={() => navigation.goBack()}
                    style={styles.cancelButton}
                >
                    Cancel
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
    avatarSection: {
        alignItems: 'center',
        padding: 20,
        backgroundColor: 'white',
        margin: 16,
        borderRadius: 10,
    },
    changeAvatarButton: {
        marginTop: 16,
    },
    formSection: {
        margin: 16,
        padding: 16,
        backgroundColor: 'white',
        borderRadius: 10,
    },
    input: {
        marginBottom: 16,
    },
    saveButton: {
        margin: 16,
    },
    cancelButton: {
        marginHorizontal: 16,
        marginBottom: 16,
    },
});

export default EditProfileScreen;
