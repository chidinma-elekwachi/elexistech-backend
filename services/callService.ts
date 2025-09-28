import {
    collection,
    doc,
    addDoc,
    updateDoc,
    onSnapshot,
    query,
    where,
    orderBy,
    serverTimestamp,
    getDoc,
  } from "firebase/firestore"
  import { db } from "../config/firebase"
  import type { CallData } from "../types"
  
  // Note: This is a simplified WebRTC implementation for demo purposes
  // In a production app, you'd use a more robust solution like Agora SDK
  
  class CallService {
    private localStream: MediaStream | null = null
    private remoteStream: MediaStream | null = null
    private peerConnection: RTCPeerConnection | null = null
    private currentCallId: string | null = null
  
    private readonly iceServers = [{ urls: "stun:stun.l.google.com:19302" }, { urls: "stun:stun1.l.google.com:19302" }]
  
    // Initialize WebRTC peer connection
    private initializePeerConnection(): RTCPeerConnection {
      const pc = new RTCPeerConnection({ iceServers: this.iceServers })
  
      pc.onicecandidate = (event) => {
        if (event.candidate && this.currentCallId) {
          this.addIceCandidate(this.currentCallId, event.candidate)
        }
      }
  
      pc.ontrack = (event) => {
        this.remoteStream = event.streams[0]
      }
  
      return pc
    }
  
    // Start a call
    async startCall(callerId: string, receiverId: string, type: "audio" | "video"): Promise<string> {
      try {
        // Create call document
        const callData: Omit<CallData, "id"> = {
          callerId,
          receiverId,
          type,
          status: "calling",
          createdAt: serverTimestamp(),
        }
  
        const docRef = await addDoc(collection(db, "calls"), callData)
        this.currentCallId = docRef.id
  
        // Get user media
        const constraints = {
          audio: true,
          video: type === "video",
        }
  
        this.localStream = await navigator.mediaDevices.getUserMedia(constraints)
        this.peerConnection = this.initializePeerConnection()
  
        // Add local stream to peer connection
        this.localStream.getTracks().forEach((track) => {
          if (this.peerConnection && this.localStream) {
            this.peerConnection.addTrack(track, this.localStream)
          }
        })
  
        // Create offer
        const offer = await this.peerConnection.createOffer()
        await this.peerConnection.setLocalDescription(offer)
  
        // Save offer to Firestore
        await updateDoc(doc(db, "calls", docRef.id), {
          offer: {
            type: offer.type,
            sdp: offer.sdp,
          },
        })
  
        return docRef.id
      } catch (error) {
        console.error("Start call error:", error)
        throw error
      }
    }
  
    // Answer a call
    async answerCall(callId: string): Promise<void> {
      try {
        this.currentCallId = callId
  
        // Get user media
        const callDoc = await this.getCallData(callId)
        const constraints = {
          audio: true,
          video: callDoc.type === "video",
        }
  
        this.localStream = await navigator.mediaDevices.getUserMedia(constraints)
        this.peerConnection = this.initializePeerConnection()
  
        // Add local stream to peer connection
        this.localStream.getTracks().forEach((track) => {
          if (this.peerConnection && this.localStream) {
            this.peerConnection.addTrack(track, this.localStream)
          }
        })
  
        // Set remote description from offer
        if (callDoc.offer) {
          await this.peerConnection.setRemoteDescription(new RTCSessionDescription(callDoc.offer))
        }
  
        // Create answer
        const answer = await this.peerConnection.createAnswer()
        await this.peerConnection.setLocalDescription(answer)
  
        // Save answer to Firestore
        await updateDoc(doc(db, "calls", callId), {
          answer: {
            type: answer.type,
            sdp: answer.sdp,
          },
          status: "accepted",
        })
      } catch (error) {
        console.error("Answer call error:", error)
        throw error
      }
    }
  
    // Reject a call
    async rejectCall(callId: string): Promise<void> {
      try {
        await updateDoc(doc(db, "calls", callId), {
          status: "rejected",
        })
      } catch (error) {
        console.error("Reject call error:", error)
        throw error
      }
    }
  
    // End a call
    async endCall(callId: string): Promise<void> {
      try {
        await updateDoc(doc(db, "calls", callId), {
          status: "ended",
        })
  
        this.cleanup()
      } catch (error) {
        console.error("End call error:", error)
        throw error
      }
    }
  
    // Listen for incoming calls
    subscribeToIncomingCalls(userId: string, callback: (call: CallData | null) => void): () => void {
      const q = query(
        collection(db, "calls"),
        where("receiverId", "==", userId),
        where("status", "==", "calling"),
        orderBy("createdAt", "desc"),
      )
  
      return onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const callDoc = snapshot.docs[0]
          const callData = { id: callDoc.id, ...callDoc.data() } as CallData
          callback(callData)
        } else {
          callback(null)
        }
      })
    }
  
    // Listen for call status changes
    subscribeToCallStatus(callId: string, callback: (call: CallData) => void): () => void {
      return onSnapshot(doc(db, "calls", callId), (doc) => {
        if (doc.exists()) {
          const callData = { id: doc.id, ...doc.data() } as CallData
          callback(callData)
  
          // Handle answer
          if (callData.status === "accepted" && callData.answer && this.peerConnection) {
            this.peerConnection.setRemoteDescription(new RTCSessionDescription(callData.answer))
          }
        }
      })
    }
  
    // Add ICE candidate
    private async addIceCandidate(callId: string, candidate: RTCIceCandidate): Promise<void> {
      try {
        const callRef = doc(db, "calls", callId)
        await updateDoc(callRef, {
          iceCandidates: [...((await this.getCallData(callId)).iceCandidates || []), candidate.toJSON()],
        })
      } catch (error) {
        console.error("Add ICE candidate error:", error)
      }
    }
  
    // Get call data
    private async getCallData(callId: string): Promise<CallData> {
        const callRef = doc(db, "calls", callId)
        const callSnap = await getDoc(callRef)
        
        if (!callSnap.exists()) {
          throw new Error("Call not found")
        }
        return { id: callSnap.id, ...callSnap.data() } as CallData
      }
  
    // Cleanup resources
    private cleanup(): void {
      if (this.localStream) {
        this.localStream.getTracks().forEach((track) => track.stop())
        this.localStream = null
      }
  
      if (this.peerConnection) {
        this.peerConnection.close()
        this.peerConnection = null
      }
  
      this.remoteStream = null
      this.currentCallId = null
    }
  
    // Get local stream for UI
    getLocalStream(): MediaStream | null {
      return this.localStream
    }
  
    // Get remote stream for UI
    getRemoteStream(): MediaStream | null {
      return this.remoteStream
    }
  
    // Toggle audio
    toggleAudio(): boolean {
      if (this.localStream) {
        const audioTrack = this.localStream.getAudioTracks()[0]
        if (audioTrack) {
          audioTrack.enabled = !audioTrack.enabled
          return audioTrack.enabled
        }
      }
      return false
    }
  
    // Toggle video
    toggleVideo(): boolean {
      if (this.localStream) {
        const videoTrack = this.localStream.getVideoTracks()[0]
        if (videoTrack) {
          videoTrack.enabled = !videoTrack.enabled
          return videoTrack.enabled
        }
      }
      return false
    }
  }
  
  export const callService = new CallService()
  