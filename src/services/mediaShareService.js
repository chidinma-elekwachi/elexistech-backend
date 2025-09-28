import { collection, doc, addDoc, query, where, orderBy, onSnapshot, getDocs, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import authService from './authService';

class MediaShareService {
    constructor() {
        this.mediaMessagesCollection = collection(db, 'mediaMessages');
        this.senderProfileCache = new Map();
    }

    // Send a media message
    async sendMediaMessage({ senderId, receiverId, mediaUrl, mediaType, fileName, message = '' }) {
        try {
            const messageData = {
                senderId,
                receiverId,
                mediaUrl,
                mediaType,
                fileName,
                message,
                timestamp: serverTimestamp(),
                senderName: null, // Will be populated by listener
                senderAvatar: null, // Will be populated by listener
            };

            const docRef = await addDoc(this.mediaMessagesCollection, messageData);
            return { id: docRef.id, ...messageData };
        } catch (error) {
            console.error('Error sending media message:', error);
            throw error;
        }
    }

    // Get media messages for a user (both sent and received)
    async getMediaMessages(userId) {
        try {
            // Get messages where user is receiver
            const receivedQuery = query(
                this.mediaMessagesCollection,
                where('receiverId', '==', userId)
            );

            // Get messages sent to 'all'
            const allQuery = query(
                this.mediaMessagesCollection,
                where('receiverId', '==', 'all')
            );

            const [receivedSnapshot, allSnapshot] = await Promise.all([
                getDocs(receivedQuery),
                getDocs(allQuery)
            ]);

            const messages = [];

            // Process received messages
            receivedSnapshot.forEach((doc) => {
                messages.push({
                    id: doc.id,
                    ...doc.data(),
                });
            });

            // Process 'all' messages
            allSnapshot.forEach((doc) => {
                messages.push({
                    id: doc.id,
                    ...doc.data(),
                });
            });

            // Enrich with sender profiles
            const enriched = await this.enrichMessagesWithSenderProfiles(messages);

            // Sort by timestamp on client side
            enriched.sort((a, b) => {
                const timestampA = a.timestamp?.toDate?.() || a.timestamp || new Date(0);
                const timestampB = b.timestamp?.toDate?.() || b.timestamp || new Date(0);
                return timestampB - timestampA; // Descending order
            });

            return enriched;
        } catch (error) {
            console.error('Error getting media messages:', error);
            throw error;
        }
    }

    // Listen to media messages in real-time
    listenToMediaMessages(userId, callback) {
        // Create separate listeners for user-specific and 'all' messages
        const receivedQuery = query(
            this.mediaMessagesCollection,
            where('receiverId', '==', userId)
        );

        const allQuery = query(
            this.mediaMessagesCollection,
            where('receiverId', '==', 'all')
        );

        let receivedMessages = [];
        let allMessages = [];

        const receivedUnsubscribe = onSnapshot(receivedQuery, (snapshot) => {
            receivedMessages = [];
            snapshot.forEach((doc) => {
                receivedMessages.push({
                    id: doc.id,
                    ...doc.data(),
                });
            });
            mergeAndCallback();
        });

        const allUnsubscribe = onSnapshot(allQuery, (snapshot) => {
            allMessages = [];
            snapshot.forEach((doc) => {
                allMessages.push({
                    id: doc.id,
                    ...doc.data(),
                });
            });
            mergeAndCallback();
        });

        const mergeAndCallback = async () => {
            const allMessagesCombined = [...receivedMessages, ...allMessages];

            // Enrich with sender profiles
            const enriched = await this.enrichMessagesWithSenderProfiles(allMessagesCombined);

            // Sort by timestamp on client side
            enriched.sort((a, b) => {
                const timestampA = a.timestamp?.toDate?.() || a.timestamp || new Date(0);
                const timestampB = b.timestamp?.toDate?.() || b.timestamp || new Date(0);
                return timestampB - timestampA; // Descending order
            });

            callback(enriched);
        };

        // Return cleanup function
        return () => {
            receivedUnsubscribe();
            allUnsubscribe();
        };
    }

    // Get media messages between two specific users
    async getMediaMessagesBetweenUsers(userId1, userId2) {
        try {
            // Query for messages from user1 to user2
            const query1 = query(
                this.mediaMessagesCollection,
                where('senderId', '==', userId1),
                where('receiverId', '==', userId2)
            );

            // Query for messages from user2 to user1
            const query2 = query(
                this.mediaMessagesCollection,
                where('senderId', '==', userId2),
                where('receiverId', '==', userId1)
            );

            const [snapshot1, snapshot2] = await Promise.all([
                getDocs(query1),
                getDocs(query2)
            ]);

            const messages = [];

            snapshot1.forEach((doc) => {
                messages.push({
                    id: doc.id,
                    ...doc.data(),
                });
            });

            snapshot2.forEach((doc) => {
                messages.push({
                    id: doc.id,
                    ...doc.data(),
                });
            });

            // Enrich with sender profiles
            const enriched = await this.enrichMessagesWithSenderProfiles(messages);

            // Sort by timestamp on client side
            enriched.sort((a, b) => {
                const timestampA = a.timestamp?.toDate?.() || a.timestamp || new Date(0);
                const timestampB = b.timestamp?.toDate?.() || b.timestamp || new Date(0);
                return timestampB - timestampA; // Descending order
            });

            return enriched;
        } catch (error) {
            console.error('Error getting media messages between users:', error);
            throw error;
        }
    }

    // Enrich messages with sender profile data, with simple in-memory cache
    async enrichMessagesWithSenderProfiles(messages) {
        try {
            const uniqueSenderIds = Array.from(new Set(messages.map(m => m.senderId).filter(Boolean)));

            const fetchPromises = uniqueSenderIds
                .filter(uid => !this.senderProfileCache.has(uid))
                .map(async (uid) => {
                    const profile = await authService.getUserProfile(uid);
                    this.senderProfileCache.set(uid, profile || null);
                });

            if (fetchPromises.length > 0) {
                await Promise.all(fetchPromises);
            }

            return messages.map(msg => {
                const profile = this.senderProfileCache.get(msg.senderId) || {};
                return {
                    ...msg,
                    senderName: profile?.name || msg.senderName || 'Unknown User',
                    senderAvatar: profile?.avatar || msg.senderAvatar || null,
                };
            });
        } catch (e) {
            console.error('Failed to enrich messages:', e);
            return messages;
        }
    }

    // Delete a media message
    async deleteMediaMessage(messageId) {
        try {
            await deleteDoc(doc(this.mediaMessagesCollection, messageId));
        } catch (error) {
            console.error('Error deleting media message:', error);
            throw error;
        }
    }
}

export default new MediaShareService();
