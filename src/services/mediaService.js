import * as ImagePicker from 'expo-image-picker';
import authService from './authService';
import { uploadAvatarToCloudinary } from '../cloudinary/config';

class MediaService {
    constructor() { }

    // Pick image from gallery
    async pickImage() {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                throw new Error('Permission to access media library is required');
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });
            return result;
        } catch (error) {
            console.error('Image picker error:', error);
            throw error;
        }
    }

    // Upload profile image using Supabase
    async uploadProfileImage(imageUri) {
        try {
            const currentUser = await authService.getCurrentUser();
            if (!currentUser) throw new Error('User must be authenticated to upload media');

            const uploadedUrl = await uploadAvatarToCloudinary({
                fileUri: imageUri,
                publicId: currentUser.uid,
                folder: 'avatars',
            });
            return {
                url: uploadedUrl,
                path: uploadedUrl,
                name: `${currentUser.uid}`,
            };
        } catch (error) {
            console.error('Profile image upload error:', error);
            throw error;
        }
    }

    // Upload avatar using Supabase
    async uploadAvatar(file) {
        try {
            return await this.uploadProfileImage(file.uri);
        } catch (error) {
            console.error('Avatar upload error:', error);
            throw error;
        }
    }

    // Upload media file (keeping for compatibility)
    async uploadMedia(file, type = 'image') {
        try {
            // For now, redirect to avatar upload for profile images
            if (type === 'avatar') {
                return await this.uploadAvatar(file);
            }

            // For other media types, you might want to implement separate Supabase buckets
            throw new Error('Media upload not implemented for type: ' + type);
        } catch (error) {
            console.error('Media upload error:', error);
            throw error;
        }
    }

    // Upload chat media (keeping for compatibility)
    async uploadChatMedia(file, type = 'image') {
        try {
            return await this.uploadMedia(file, type);
        } catch (error) {
            console.error('Chat media upload error:', error);
            throw error;
        }
    }

    // Delete media (keeping for compatibility)
    async deleteMedia(path) {
        // Optional: Implement Cloudinary deletion via authenticated endpoint if needed
        console.warn('deleteMedia not implemented for Cloudinary client-side');
    }
}

export default new MediaService();
