import { collection, doc, setDoc, getDoc, updateDoc, serverTimestamp, arrayUnion, onSnapshot, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase/config';

class CallService {
    constructor() {
        this.callsCollection = collection(db, 'calls');
    }

    // Initialize a call
    async initializeCall(callerId, receiverId, type = 'video') {
        try {
            const callDoc = doc(this.callsCollection);
            const callData = {
                id: callDoc.id,
                callerId,
                receiverId,
                type,
                status: 'initializing',
                startedAt: serverTimestamp(),
                endedAt: null,
                offer: null,
                answer: null,
                iceCandidates: {
                    caller: [],
                    receiver: [],
                },
            };

            await setDoc(callDoc, callData);
            return callData;
        } catch (error) {
            console.error('Call initialization error:', error);
            throw error;
        }
    }

    // Set call offer
    async setOffer(callId, offer) {
        try {
            await updateDoc(doc(this.callsCollection, callId), {
                offer,
                status: 'offering',
            });
        } catch (error) {
            console.error('Set offer error:', error);
            throw error;
        }
    }

    // Set call to ringing status
    async setRinging(callId) {
        try {
            await updateDoc(doc(this.callsCollection, callId), {
                status: 'ringing',
            });
        } catch (error) {
            console.error('Set ringing error:', error);
            throw error;
        }
    }

    // Set call answer
    async setAnswer(callId, answer) {
        try {
            await updateDoc(doc(this.callsCollection, callId), {
                answer,
                status: 'active',
            });
        } catch (error) {
            console.error('Set answer error:', error);
            throw error;
        }
    }

    // Add ICE candidate
    async addIceCandidate(callId, candidate, role) {
        try {
            const field = `iceCandidates.${role}`;
            await updateDoc(doc(this.callsCollection, callId), {
                [field]: arrayUnion(candidate),
            });
        } catch (error) {
            console.error('Add ICE candidate error:', error);
            throw error;
        }
    }

    // End call
    async endCall(callId) {
        try {
            await updateDoc(doc(this.callsCollection, callId), {
                status: 'ended',
                endedAt: serverTimestamp(),
            });
        } catch (error) {
            console.error('End call error:', error);
            throw error;
        }
    }

    // Get call data
    async getCall(callId) {
        try {
            const callDoc = await getDoc(doc(this.callsCollection, callId));
            return callDoc.exists() ? callDoc.data() : null;
        } catch (error) {
            console.error('Get call error:', error);
            throw error;
        }
    }

    // Listen to call changes
    listenToCall(callId, callback) {
        return onSnapshot(doc(this.callsCollection, callId), (doc) => {
            if (doc.exists()) {
                callback(doc.data());
            }
        });
    }

    // Listen for the most recent incoming call for a user
    listenForIncomingCalls(userId, callback) {
        if (!userId) {
            console.warn('listenForIncomingCalls: userId is null or undefined');
            return () => { }; // Return a no-op unsubscribe function
        }

        console.log('Setting up incoming call listener for user:', userId);

        // Simplified query to avoid composite index requirement
        const q = query(
            this.callsCollection,
            where('receiverId', '==', userId),
            where('status', 'in', ['initializing', 'offering', 'ringing'])
        );

        return onSnapshot(q, (snapshot) => {
            console.log('Incoming call snapshot:', snapshot.docs.length, 'calls');

            // Process all calls and find the most recent one
            let mostRecentCall = null;
            let mostRecentTime = null;

            snapshot.docChanges().forEach((change) => {
                if (change.type === 'added' || change.type === 'modified') {
                    const callData = { id: change.doc.id, ...change.doc.data() };

                    // Convert startedAt to comparable timestamp
                    const callTime = callData.startedAt?.toDate?.() || callData.startedAt || new Date(0);

                    if (!mostRecentCall || callTime > mostRecentTime) {
                        mostRecentCall = callData;
                        mostRecentTime = callTime;
                    }
                }
            });

            // Only trigger callback for the most recent call
            if (mostRecentCall) {
                console.log('Most recent incoming call detected:', mostRecentCall);
                callback(mostRecentCall);
            }
        }, (error) => {
            console.error('Error listening for incoming calls:', error);
        });
    }

    // Note: Actual WebRTC implementation would go here
    // This is just the signaling part
    // The actual call setup would involve:
    // 1. Creating RTCPeerConnection
    // 2. Managing media streams
    // 3. Handling ICE candidates
    // 4. Managing call state
}

export default new CallService();
