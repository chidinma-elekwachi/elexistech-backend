import { initializeApp } from 'firebase/app';
import { initializeAuth, browserSessionPersistence } from 'firebase/auth';
import { getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import {
    FIREBASE_API_KEY,
    FIREBASE_AUTH_DOMAIN,
    FIREBASE_PROJECT_ID,
    FIREBASE_STORAGE_BUCKET,
    FIREBASE_MESSAGING_SENDER_ID,
    FIREBASE_APP_ID,
    FIREBASE_DATABASE_URL,
} from '@env';

const firebaseConfig = {
    apiKey: FIREBASE_API_KEY,
    authDomain: FIREBASE_AUTH_DOMAIN,
    projectId: FIREBASE_PROJECT_ID,
    storageBucket: FIREBASE_STORAGE_BUCKET,
    messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
    appId: FIREBASE_APP_ID,
    databaseURL: FIREBASE_DATABASE_URL,
};


console.log('Firebase Config:', firebaseConfig);

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services with platform-specific persistence
const persistence = Platform.OS === 'web'
    ? browserSessionPersistence
    : getReactNativePersistence(AsyncStorage);

const auth = initializeAuth(app, { persistence });
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };


