import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
} from 'firebase/auth';
import {
    doc,
    setDoc,
    getDoc,
    updateDoc,
    serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
    SAVED_ACCOUNTS: '@saved_accounts',
    ACTIVE_USER: '@active_user',
};

class AuthService {
    // Initialize auth state listener
    initAuthStateListener(callback) {
        return onAuthStateChanged(auth, async (user) => {
            if (user) {
                const userDoc = await this.getUserProfile(user.uid);
                callback({ ...user, profile: userDoc });
            } else {
                callback(null);
            }
        });
    }

    // Sign up new user
    async signUp(email, password, name) {
        try {
            const { user } = await createUserWithEmailAndPassword(auth, email, password);

            // Create user profile
            await setDoc(doc(db, 'users', user.uid), {
                id: user.uid,
                name,
                email,
                avatar: '',
                online: false,
                lastSeen: null,
            });

            // Save account info
            await this.saveAccount(user, { email, password });
            await this.setActiveUser(user.uid);

            return user;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Sign in user
    async signIn(email, password) {
        try {
            const { user } = await signInWithEmailAndPassword(auth, email, password);

            // Update online status
            await updateDoc(doc(db, 'users', user.uid), {
                online: false,
                lastSeen: null,
            });

            // Save account info
            await this.saveAccount(user, { email, password });
            await this.setActiveUser(user.uid);

            return user;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Sign out user
    async signOut() {
        try {
            const user = auth.currentUser;
            if (user) {
                await updateDoc(doc(db, 'users', user.uid), {
                    online: false,
                    lastSeen: Date.now(),
                });
            }
            await signOut(auth);
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Switch to another account
    async switchAccount(uid) {
        try {
            const accounts = await this.getSavedAccounts();
            const account = accounts[uid];

            if (!account) {
                throw new Error('Account not found');
            }

            // Sign out current user if exists
            if (auth.currentUser) {
                await this.signOut();
            }

            // Sign in with saved credentials
            return await this.signIn(account.credentials.email, account.credentials.password);
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Get user profile
    async getUserProfile(uid) {
        try {
            const userDoc = await getDoc(doc(db, 'users', uid));
            return userDoc.exists() ? userDoc.data() : null;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Save account info to storage
    async saveAccount(user, credentials) {
        try {
            const accounts = await this.getSavedAccounts();
            accounts[user.uid] = {
                uid: user.uid,
                email: user.email,
                credentials,
            };
            await AsyncStorage.setItem(STORAGE_KEYS.SAVED_ACCOUNTS, JSON.stringify(accounts));
        } catch (error) {
            console.error('Error saving account:', error);
        }
    }

    // Get saved accounts from storage
    async getSavedAccounts() {
        try {
            const accounts = await AsyncStorage.getItem(STORAGE_KEYS.SAVED_ACCOUNTS);
            return accounts ? JSON.parse(accounts) : {};
        } catch (error) {
            console.error('Error getting saved accounts:', error);
            return {};
        }
    }

    // Set active user
    async setActiveUser(uid) {
        try {
            await AsyncStorage.setItem(STORAGE_KEYS.ACTIVE_USER, uid);
        } catch (error) {
            console.error('Error setting active user:', error);
        }
    }

    // Get active user
    async getActiveUser() {
        try {
            const uid = await AsyncStorage.getItem(STORAGE_KEYS.ACTIVE_USER);
            if (!uid) return null;

            const accounts = await this.getSavedAccounts();
            return accounts[uid] || null;
        } catch (error) {
            console.error('Error getting active user:', error);
            return null;
        }
    }

    // Remove saved account
    async removeSavedAccount(uid) {
        try {
            const accounts = await this.getSavedAccounts();
            delete accounts[uid];
            await AsyncStorage.setItem(STORAGE_KEYS.SAVED_ACCOUNTS, JSON.stringify(accounts));
        } catch (error) {
            console.error('Error removing account:', error);
        }
    }

    // Handle Firebase errors
    handleError(error) {
        console.error('Auth error:', error);

        const errorMessages = {
            'auth/email-already-in-use': 'This email is already registered',
            'auth/invalid-email': 'Invalid email address',
            'auth/operation-not-allowed': 'Operation not allowed',
            'auth/weak-password': 'Password is too weak',
            'auth/user-disabled': 'This account has been disabled',
            'auth/user-not-found': 'User not found',
            'auth/wrong-password': 'Invalid password',
            "auth/too-many-requests": "Too many attempts. Please try again later.",
            'auth/network-request-failed': 'Network error. Please check your connection',
            'auth/api-key-not-valid.-please-pass-a-valid-api-key.': 'Invalid API key',
            'auth/argument-error': 'Invalid argument provided',
            'auth/credential-already-in-use': 'This credential is already associated with a different user',
            'auth/requires-recent-login': 'Please log in again and try this operation',

        };

        return new Error(errorMessages[error.code] || error.message);
    }
}

const authService = new AuthService()
export default authService;
