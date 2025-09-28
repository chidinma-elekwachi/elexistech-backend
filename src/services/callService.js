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
        const q = query(
            this.callsCollection,
            where('receiverId', '==', userId),
            where('status', 'in', ['initializing', 'offering', 'ringing']),
            orderBy('startedAt', 'desc'),
            limit(1)
        );
        return onSnapshot(q, (snapshot) => {
            if (!snapshot.empty) {
                const data = snapshot.docs[0].data();
                callback(data);
            }
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
