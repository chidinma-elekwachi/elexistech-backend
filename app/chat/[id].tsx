"use client"

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native"
import { useRouter, useLocalSearchParams } from "expo-router"
import { useState, useEffect, useRef } from "react"
import { authService } from "../../services/authService"
import { chatService } from "../../services/chatService"
import { MediaPicker } from "../../components/MediaPicker"
// import { CallModal } from "../../components/CallModal"
import CallModal from "../../components/CallModal"
import type { User, Message } from "../../types"

export default function ChatConversationScreen() {
  const router = useRouter()
  const { id } = useLocalSearchParams()
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [showMediaPicker, setShowMediaPicker] = useState(false)
  const [showCallModal, setShowCallModal] = useState(false)
  const [callType, setCallType] = useState<"audio" | "video">("audio")
  const flatListRef = useRef<FlatList>(null)

  useEffect(() => {
    const user = authService.getCurrentUser()
    if (!user) {
      router.replace("/")
      return
    }

    setCurrentUser(user)

    // Subscribe to chat messages
    const unsubscribe = chatService.subscribeToMessages(id as string, (chatMessages) => {
      setMessages(chatMessages)
      setLoading(false)
      // Scroll to bottom when new messages arrive
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true })
      }, 100)
    })

    return unsubscribe
  }, [id])

  const sendMessage = async () => {
    if (!newMessage.trim() || !currentUser) return

    try {
     await chatService.sendMessage(
  id as string,
  currentUser.id,
  newMessage.trim(),
)
      setNewMessage("")
    } catch (error) {
      Alert.alert("Error", "Failed to send message")
    }
  }

  const handleMediaSelect = async (mediaUri: string, mediaType: "image" | "video" | "audio") => {
    if (!currentUser) return

    try {
     await chatService.sendMessage(
  id as string,
  currentUser.id,
  "",             
  mediaUri,        
mediaType as "image" | "video")
      setShowMediaPicker(false)
    } catch (error) {
      Alert.alert("Error", "Failed to send media")
    }
  }

  const startCall = (type: "audio" | "video") => {
    setCallType(type)
    setShowCallModal(true)
  }

  const formatMessageTime = (timestamp: any) => {
    if (!timestamp) return ""
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const renderMessage = ({ item }: { item: Message }) => {
    const isOwnMessage = item.senderId === currentUser?.id

    return (
      <View style={[styles.messageContainer, isOwnMessage ? styles.ownMessage : styles.otherMessage]}>
        <View style={[styles.messageBubble, isOwnMessage ? styles.ownBubble : styles.otherBubble]}>
          {item.type === "text" ? (
            <Text style={[styles.messageText, isOwnMessage ? styles.ownText : styles.otherText]}>{item.text}</Text>
          ) : (
            <View>
              <Text style={[styles.mediaLabel, isOwnMessage ? styles.ownText : styles.otherText]}>
                {item.type === "image" ? "📷 Photo" : item.type === "video" ? "🎥 Video" : "🎵 Audio"}
              </Text>
              {item.text && (
                <Text style={[styles.messageText, isOwnMessage ? styles.ownText : styles.otherText]}>{item.text}</Text>
              )}
            </View>
          )}
          <Text style={[styles.timestamp, isOwnMessage ? styles.ownTimestamp : styles.otherTimestamp]}>
            {formatMessageTime(item.createdAt)}
          </Text>
        </View>
      </View>
    )
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading messages...</Text>
      </View>
    )
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chat</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.callButton} onPress={() => startCall("audio")}>
            <Text style={styles.callButtonText}>📞</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.callButton} onPress={() => startCall("video")}>
            <Text style={styles.callButtonText}>📹</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContent}
      />

      {/* Input Area */}
      <View style={styles.inputContainer}>
        <TouchableOpacity style={styles.mediaButton} onPress={() => setShowMediaPicker(true)}>
          <Text style={styles.mediaButtonText}>📎</Text>
        </TouchableOpacity>
        <TextInput
          style={styles.textInput}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Type a message..."
          multiline
          maxLength={1000}
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage} disabled={!newMessage.trim()}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>

      {/* Media Picker Modal */}
      <MediaPicker
        visible={showMediaPicker}
        onClose={() => setShowMediaPicker(false)}
        onMediaSelect={handleMediaSelect}
      />

      {/* Call Modal */}
      <CallModal
        visible={showCallModal}
        onClose={() => setShowCallModal(false)}
        callType={callType}
        chatId={id as string}
        currentUser={currentUser}
      />
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    paddingTop: 60,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backButton: {
    marginRight: 15,
  },
  backButtonText: {
    fontSize: 24,
    color: "#007AFF",
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  headerActions: {
    flexDirection: "row",
    gap: 10,
  },
  callButton: {
    padding: 8,
  },
  callButtonText: {
    fontSize: 20,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: 15,
  },
  messageContainer: {
    marginBottom: 10,
  },
  ownMessage: {
    alignItems: "flex-end",
  },
  otherMessage: {
    alignItems: "flex-start",
  },
  messageBubble: {
    maxWidth: "80%",
    padding: 12,
    borderRadius: 18,
  },
  ownBubble: {
    backgroundColor: "#007AFF",
  },
  otherBubble: {
    backgroundColor: "white",
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  ownText: {
    color: "white",
  },
  otherText: {
    color: "#333",
  },
  mediaLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 11,
    marginTop: 4,
  },
  ownTimestamp: {
    color: "rgba(255, 255, 255, 0.7)",
  },
  otherTimestamp: {
    color: "#999",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: 15,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  mediaButton: {
    padding: 10,
    marginRight: 10,
  },
  mediaButtonText: {
    fontSize: 20,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    maxHeight: 100,
    fontSize: 16,
  },
  sendButton: {
    marginLeft: 10,
    backgroundColor: "#007AFF",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  sendButtonText: {
    color: "white",
    fontWeight: "500",
  },
})
