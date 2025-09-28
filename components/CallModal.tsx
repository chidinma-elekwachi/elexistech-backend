"use client"

import { View, Text, TouchableOpacity, StyleSheet, Modal, Alert } from "react-native"
import { useState, useEffect } from "react"
import { callService } from "../services/callService"
import type { CallData, User } from "../types"

interface CallModalProps {
  visible: boolean
  call: CallData | null
  currentUser: User
  onClose: () => void
}

export default function CallModal({ visible, call, currentUser, onClose }: CallModalProps) {
  const [callStatus, setCallStatus] = useState<string>("calling")
  const [audioEnabled, setAudioEnabled] = useState(true)
  const [videoEnabled, setVideoEnabled] = useState(true)
  const [duration, setDuration] = useState(0)

  useEffect(() => {
    if (!call) return

    const unsubscribe = callService.subscribeToCallStatus(call.id, (updatedCall) => {
      setCallStatus(updatedCall.status)

      if (updatedCall.status === "ended" || updatedCall.status === "rejected") {
        setTimeout(onClose, 1000)
      }
    })

    return unsubscribe
  }, [call])

  useEffect(() => {
    let interval: NodeJS.Timeout

    if (callStatus === "accepted") {
      interval = setInterval(() => {
        setDuration((prev) => prev + 1)
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [callStatus])

  const handleAnswer = async () => {
    if (!call) return

    try {
      await callService.answerCall(call.id)
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to answer call")
    }
  }

  const handleReject = async () => {
    if (!call) return

    try {
      await callService.rejectCall(call.id)
      onClose()
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to reject call")
    }
  }

  const handleEndCall = async () => {
    if (!call) return

    try {
      await callService.endCall(call.id)
      onClose()
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to end call")
    }
  }

  const toggleAudio = () => {
    const enabled = callService.toggleAudio()
    setAudioEnabled(enabled)
  }

  const toggleVideo = () => {
    const enabled = callService.toggleVideo()
    setVideoEnabled(enabled)
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const isIncoming = call?.receiverId === currentUser.id
  const isOutgoing = call?.callerId === currentUser.id

  if (!call) return null

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.callType}>{call.type === "video" ? "Video Call" : "Audio Call"}</Text>
          {callStatus === "accepted" && <Text style={styles.duration}>{formatDuration(duration)}</Text>}
        </View>

        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{isIncoming ? "Caller" : "Calling"}</Text>
          </View>
          <Text style={styles.userName}>{isIncoming ? "Incoming Call" : "Outgoing Call"}</Text>
          <Text style={styles.callStatus}>
            {callStatus === "calling" && isIncoming && "Incoming call..."}
            {callStatus === "calling" && isOutgoing && "Calling..."}
            {callStatus === "accepted" && "Connected"}
            {callStatus === "rejected" && "Call rejected"}
            {callStatus === "ended" && "Call ended"}
          </Text>
        </View>

        {call.type === "video" && callStatus === "accepted" && (
          <View style={styles.videoContainer}>
            <View style={styles.remoteVideo}>
              <Text style={styles.videoPlaceholder}>Remote Video</Text>
            </View>
            <View style={styles.localVideo}>
              <Text style={styles.videoPlaceholder}>Local Video</Text>
            </View>
          </View>
        )}

        <View style={styles.controls}>
          {callStatus === "calling" && isIncoming && (
            <View style={styles.incomingControls}>
              <TouchableOpacity style={styles.rejectButton} onPress={handleReject}>
                <Text style={styles.controlText}>Decline</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.answerButton} onPress={handleAnswer}>
                <Text style={styles.controlText}>Answer</Text>
              </TouchableOpacity>
            </View>
          )}

          {callStatus === "accepted" && (
            <View style={styles.activeControls}>
              <TouchableOpacity
                style={[styles.controlButton, !audioEnabled && styles.controlButtonDisabled]}
                onPress={toggleAudio}
              >
                <Text style={styles.controlText}>{audioEnabled ? "Mute" : "Unmute"}</Text>
              </TouchableOpacity>

              {call.type === "video" && (
                <TouchableOpacity
                  style={[styles.controlButton, !videoEnabled && styles.controlButtonDisabled]}
                  onPress={toggleVideo}
                >
                  <Text style={styles.controlText}>{videoEnabled ? "Video Off" : "Video On"}</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity style={styles.endButton} onPress={handleEndCall}>
                <Text style={styles.controlText}>End Call</Text>
              </TouchableOpacity>
            </View>
          )}

          {callStatus === "calling" && isOutgoing && (
            <TouchableOpacity style={styles.endButton} onPress={handleEndCall}>
              <Text style={styles.controlText}>Cancel</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a1a",
    justifyContent: "space-between",
  },
  header: {
    alignItems: "center",
    paddingTop: 60,
    paddingBottom: 20,
  },
  callType: {
    fontSize: 18,
    color: "white",
    fontWeight: "500",
  },
  duration: {
    fontSize: 16,
    color: "#ccc",
    marginTop: 5,
  },
  userInfo: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#333",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  avatarText: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },
  userName: {
    fontSize: 24,
    color: "white",
    fontWeight: "600",
    marginBottom: 10,
  },
  callStatus: {
    fontSize: 16,
    color: "#ccc",
  },
  videoContainer: {
    flex: 1,
    position: "relative",
  },
  remoteVideo: {
    flex: 1,
    backgroundColor: "#333",
    justifyContent: "center",
    alignItems: "center",
  },
  localVideo: {
    position: "absolute",
    top: 20,
    right: 20,
    width: 120,
    height: 160,
    backgroundColor: "#555",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  videoPlaceholder: {
    color: "white",
    fontSize: 14,
  },
  controls: {
    paddingBottom: 50,
    paddingHorizontal: 40,
  },
  incomingControls: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  activeControls: {
    flexDirection: "row",
    justifyContent: "space-around",
    flexWrap: "wrap",
    gap: 20,
  },
  controlButton: {
    backgroundColor: "#333",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 25,
    minWidth: 80,
    alignItems: "center",
  },
  controlButtonDisabled: {
    backgroundColor: "#666",
  },
  answerButton: {
    backgroundColor: "#34C759",
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  rejectButton: {
    backgroundColor: "#FF3B30",
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  endButton: {
    backgroundColor: "#FF3B30",
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  controlText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
})
