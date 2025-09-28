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

    console.log('Uploading file:', filePath);

    const options = {
        upload_preset: CLOUDINARY_UPLOAD_PRESET,
        unsigned: true,
        folder: folder,
        ...(publicId && { public_id: publicId })
    };

    return new Promise((resolve, reject) => {
        upload(cld, {
            file: filePath,
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

export default { uploadAvatarToCloudinary };

