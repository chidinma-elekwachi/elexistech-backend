import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { auth } from '../firebase/config';

class MediaService {
    constructor() {
        this.storage = getStorage();
    }

    // Upload media file
    async uploadMedia(file, type = 'image') {
        try {
            if (!auth.currentUser) {
                throw new Error('User must be authenticated to upload media');
            }

            const userId = auth.currentUser.uid;
            const timestamp = Date.now();
            const fileExtension = file.uri.split('.').pop();
            const filename = `${userId}_${timestamp}.${fileExtension}`;
            const path = `${type}s/${userId}/${filename}`;

            // Create blob from file URI
            const response = await fetch(file.uri);
            const blob = await response.blob();

            // Create storage reference
            const storageRef = ref(this.storage, path);

            // Upload file
            const uploadTask = uploadBytesResumable(storageRef, blob);

            return new Promise((resolve, reject) => {
                uploadTask.on(
                    'state_changed',
                    (snapshot) => {
                        // Handle progress
                        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                        console.log('Upload progress:', progress);
                    },
                    (error) => {
                        // Handle error
                        console.error('Upload error:', error);
                        reject(error);
                    },
                    async () => {
                        // Handle success
                        try {
                            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                            resolve({
                                url: downloadURL,
                                path,
                                type,
                                name: filename,
                                size: file.size,
                            });
                        } catch (error) {
                            reject(error);
                        }
                    }
                );
            });
        } catch (error) {
            console.error('Media upload error:', error);
            throw error;
        }
    }

    // Upload avatar
    async uploadAvatar(file) {
        try {
            return await this.uploadMedia(file, 'avatar');
        } catch (error) {
            console.error('Avatar upload error:', error);
            throw error;
        }
    }

    // Upload chat media
    async uploadChatMedia(file, type = 'image') {
        try {
            return await this.uploadMedia(file, type);
        } catch (error) {
            console.error('Chat media upload error:', error);
            throw error;
        }
    }

    // Delete media
    async deleteMedia(path) {
        try {
            const storageRef = ref(this.storage, path);
            await deleteObject(storageRef);
        } catch (error) {
            console.error('Media deletion error:', error);
            throw error;
        }
    }
}

export default new MediaService();
