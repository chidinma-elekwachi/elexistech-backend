import { Cloudinary } from '@cloudinary/url-gen';
import { upload } from 'cloudinary-react-native';
import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } from '@env';

// Initialize Cloudinary instance
const cld = new Cloudinary({
    cloud: {
        cloudName: CLOUDINARY_CLOUD_NAME
    },
    url: {
        secure: true
    }
});

// Helper to upload image file to Cloudinary using unsigned preset
export async function uploadAvatarToCloudinary({ fileUri, publicId, folder = 'avatars' }) {
    if (!CLOUDINARY_UPLOAD_PRESET || !CLOUDINARY_CLOUD_NAME) {
        throw new Error('Cloudinary environment variables are missing');
    }

    console.log('Uploading file:', fileUri);

    // Ensure fileUri is a string
    const filePath = typeof fileUri === 'string' ? fileUri : fileUri.uri || fileUri.path;

    if (!filePath) {
        throw new Error('Invalid file URI provided');
    }

    console.log('Processing file path:', filePath);

    // For React Native, we need to create a proper file object
    let fileToUpload;

    if (filePath.startsWith('blob:')) {
        // Handle blob URLs by fetching and converting to file
        try {
            const response = await fetch(filePath);
            const blob = await response.blob();

            // Create a file object from the blob
            fileToUpload = {
                uri: filePath,
                type: blob.type || 'image/jpeg',
                name: `${publicId || 'avatar'}_${Date.now()}.jpg`,
            };
        } catch (error) {
            console.error('Error processing blob URL:', error);
            throw new Error('Failed to process image file');
        }
    } else {
        // Handle regular file paths
        fileToUpload = filePath;
    }

    const options = {
        upload_preset: CLOUDINARY_UPLOAD_PRESET,
        unsigned: true,
        folder: folder,
        ...(publicId && { public_id: publicId })
    };

    return new Promise((resolve, reject) => {
        upload(cld, {
            file: fileToUpload,
            options: options,
            callback: (error, response) => {
                if (error) {
                    console.error('Cloudinary upload error:', error);
                    reject(new Error(`Cloudinary upload failed: ${error.message || error}`));
                } else {
                    console.log('Cloudinary upload success:', response);
                    resolve(response.secure_url);
                }
            }
        });
    });
}

// Helper to upload media files to Cloudinary
export async function uploadMediaToCloudinary({ fileUri, publicId, folder = 'media-share' }) {
    if (!CLOUDINARY_UPLOAD_PRESET || !CLOUDINARY_CLOUD_NAME) {
        throw new Error('Cloudinary environment variables are missing');
    }

    console.log('Uploading media file:', fileUri);

    // Ensure fileUri is a string
    const filePath = typeof fileUri === 'string' ? fileUri : fileUri.uri || fileUri.path;

    if (!filePath) {
        throw new Error('Invalid file URI provided');
    }

    console.log('Processing media file path:', filePath);

    // For React Native, we need to create a proper file object
    let fileToUpload;

    if (filePath.startsWith('blob:')) {
        // Handle blob URLs by fetching and converting to file
        try {
            const response = await fetch(filePath);
            const blob = await response.blob();

            // Create a file object from the blob
            fileToUpload = {
                uri: filePath,
                type: blob.type || 'image/jpeg',
                name: `${publicId || 'media'}_${Date.now()}.jpg`,
            };
        } catch (error) {
            console.error('Error processing blob URL:', error);
            throw new Error('Failed to process media file');
        }
    } else {
        // Handle regular file paths
        fileToUpload = filePath;
    }

    const options = {
        upload_preset: CLOUDINARY_UPLOAD_PRESET,
        unsigned: true,
        folder: folder,
        ...(publicId && { public_id: publicId })
    };

    return new Promise((resolve, reject) => {
        upload(cld, {
            file: fileToUpload,
            options: options,
            callback: (error, response) => {
                if (error) {
                    console.error('Cloudinary media upload error:', error);
                    reject(new Error(`Cloudinary upload failed: ${error.message || error}`));
                } else {
                    console.log('Cloudinary media upload success:', response);
                    resolve(response.secure_url);
                }
            }
        });
    });
}

export default { uploadAvatarToCloudinary, uploadMediaToCloudinary };

