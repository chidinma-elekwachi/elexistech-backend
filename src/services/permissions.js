import { PermissionsAndroid, Platform } from 'react-native';

/**
 * Request camera and audio permissions for video calling
 */
export const requestCameraAndAudioPermission = async () => {
    if (Platform.OS === 'android') {
        try {
            const granted = await PermissionsAndroid.requestMultiple([
                PermissionsAndroid.PERMISSIONS.CAMERA,
                PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
            ]);

            if (
                granted['android.permission.RECORD_AUDIO'] === PermissionsAndroid.RESULTS.GRANTED &&
                granted['android.permission.CAMERA'] === PermissionsAndroid.RESULTS.GRANTED
            ) {
                console.log('Camera and microphone permissions granted');
                return true;
            } else {
                console.log('Camera and microphone permissions denied');
                return false;
            }
        } catch (err) {
            console.warn('Permission request error:', err);
            return false;
        }
    }
    return true; // iOS permissions are handled differently
};

/**
 * Request microphone permission for audio-only calls
 */
export const requestAudioPermission = async () => {
    if (Platform.OS === 'android') {
        try {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
            );

            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                console.log('Microphone permission granted');
                return true;
            } else {
                console.log('Microphone permission denied');
                return false;
            }
        } catch (err) {
            console.warn('Audio permission request error:', err);
            return false;
        }
    }
    return true; // iOS permissions are handled differently
};
