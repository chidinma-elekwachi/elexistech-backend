// services/mediaService.js
import * as ImagePicker from 'expo-image-picker';
import { storage } from '../firebase';
import { ref as sRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import * as FileSystem from 'expo-file-system';

/**
 * pickMedia() -> opens picker, returns { uri, type('image'|'video'), name }
 */
export async function pickMedia() {
  // ask permission & allow both images & videos
  const res = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.All,
    quality: 0.8,
    allowsMultipleSelection: false,
  });
  if (res.cancelled) return null;
  const mediaType = res.type === 'video' ? 'video' : 'image';
  const uri = res.uri;
  const name = uri.split('/').pop();
  return { uri, mediaType, name };
}

/**
 * uploadMedia(uri, filename, mimeType) -> returns downloadURL
 */
export async function uploadMedia(uri, filename, mimeType = 'application/octet-stream') {
  // Read file into base64
  const base64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
  const blob = b64toBlob(base64, mimeType);

  const path = `chat_media/${Date.now()}_${filename}`;
  const sreference = sRef(storage, path);
  const uploadTaskSnapshot = await uploadBytesResumable(sreference, blob);
  const url = await getDownloadURL(uploadTaskSnapshot.ref);
  return url;
}

// helper: convert base64 -> Blob (works in RN with global atob)
function b64toBlob(b64Data, contentType = '', sliceSize = 512) {
  // atob may not exist in older RN; use alternative if needed
  const binaryString = global.atob ? global.atob(b64Data) : Buffer.from(b64Data, 'base64').toString('binary');
  const byteNumbers = new Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    byteNumbers[i] = binaryString.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: contentType });
}
