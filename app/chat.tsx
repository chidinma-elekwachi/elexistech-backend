"use client"

import { View, Text, TouchableOpacity, StyleSheet, FlatList, Image } from "react-native"
import { useRouter } from "expo-router"
import { useState, useEffect } from "react"
import { authService } from "../services/authService"
import { chatService } from "../services/chatService"
import type { User, Chat } from "../types"

export default function ChatListScreen() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [chats, setChats] = useState<Chat[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const user = authService.getCurrentUser()
    if (!user) {
      router.replace("/")
      return
    }

    setCurrentUser(user)

    const unsubscribe = chatService.subscribeToUserChats(user.id, (userChats) => {
      setChats(userChats || [])
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const formatLastMessageTime = (timestamp: any) => {
    if (!timestamp) return ""

    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()

    if (diff < 60000) return "now"
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`
    return `${Math.floor(diff / 86400000)}d`
  }

  const getChatName = (chat: Chat) => {
    if (chat.isGroup) return chat.groupName || "Group Chat"
    return "Direct Chat"
  }

  const renderChatItem = ({ item }: { item: Chat }) => {
    const chatName = getChatName(item)
    const lastMessageText = item.lastMessage?.text || "No messages yet"
    const lastMessageTime = formatLastMessageTime(item.lastMessage?.createdAt)
    const isUnread = item.lastMessage && !item.lastMessage.readBy?.includes(currentUser?.id || "")

    return (
      <TouchableOpacity
        style={styles.chatItem}
        onPress={() => {
          console.log("Tapped chat id:", item.id)
          if (item.id) router.push(`/chat/${item.id}`)
        }}
      >
        <View style={styles.chatAvatar}>
          <Text style={styles.avatarText}>{chatName.charAt(0).toUpperCase()}</Text>
        </View>

        <View style={styles.chatInfo}>
          <Text style={styles.chatName}>{chatName}</Text>
          <Text style={styles.lastMessage} numberOfLines={1}>
            {lastMessageText}
          </Text>
        </View>

        <View style={styles.chatMeta}>
          <Text style={styles.timestamp}>{lastMessageTime}</Text>
          {isUnread && <View style={styles.unreadBadge} />}
        </View>
      </TouchableOpacity>
    )
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading chats...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Chats</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton} onPress={() => router.push("/search-users")}>
            <Text style={styles.headerButtonText}>+</Text>
          </TouchableOpacity>
          {currentUser?.avatar ? (
            <TouchableOpacity style={styles.headerButton} onPress={() => router.push("/settings")}>
              <Image source={{ uri: currentUser.avatar }} style={styles.profileImage} />
            </TouchableOpacity>
          ) : (
            <View style={[styles.profileImage, { backgroundColor: "#ccc" }]} />
          )}
        </View>
      </View>

      {chats.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No chats yet</Text>
          <TouchableOpacity style={styles.startChatButton} onPress={() => router.push("/search-users")}>
            <Text style={styles.startChatText}>Start a conversation</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={chats}
          renderItem={renderChatItem}
          keyExtractor={(item) => item.id || Math.random().toString()}
          style={styles.chatList}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingTop: 60,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  title: { fontSize: 24, fontWeight: "bold", color: "#333" },
  headerActions: { flexDirection: "row", gap: 10 },
  headerButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#007AFF", justifyContent: "center", alignItems: "center" },
  headerButtonText: { color: "white", fontSize: 20, fontWeight: "bold" },
  profileImage: { width: 40, height: 40, borderRadius: 20 },
  chatList: { flex: 1 },
  chatItem: { flexDirection: "row", alignItems: "center", padding: 15, backgroundColor: "white", borderBottomWidth: 1, borderBottomColor: "#f0f0f0" },
  chatAvatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: "#007AFF", justifyContent: "center", alignItems: "center", marginRight: 15 },
  avatarText: { color: "white", fontSize: 18, fontWeight: "bold" },
  chatInfo: { flex: 1 },
  chatName: { fontSize: 16, fontWeight: "600", color: "#333", marginBottom: 4 },
  lastMessage: { fontSize: 14, color: "#666" },
  chatMeta: { alignItems: "flex-end" },
  timestamp: { fontSize: 12, color: "#999", marginBottom: 4 },
  unreadBadge: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#007AFF" },
  emptyState: { flex: 1, justifyContent: "center", alignItems: "center", padding: 40 },
  emptyText: { fontSize: 18, color: "#666", marginBottom: 20 },
  startChatButton: { backgroundColor: "#007AFF", paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8 },
  startChatText: { color: "white", fontSize: 16, fontWeight: "500" },
})
