"use client"

import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Image, Alert } from "react-native"
import { useRouter } from "expo-router"
import { useState, useEffect } from "react"
import { authService } from "../services/authService"
import { chatService } from "../services/chatService"
import type { User } from "../types"

export default function SearchUsersScreen() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<User[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const user = authService.getCurrentUser()
    if (!user) {
      router.replace("/")
      return
    }
    setCurrentUser(user)
  }, [])

  const handleSearch = async (query: string) => {
    setSearchQuery(query)

    if (query.trim().length < 2) {
      setSearchResults([])
      return
    }

    setLoading(true)
    try {
      const results = await chatService.searchUsers(query, currentUser?.id || "")
      setSearchResults(results)
    } catch (error: any) {
      Alert.alert("Search Error", error.message || "Failed to search users")
    } finally {
      setLoading(false)
    }
  }

  const handleStartChat = async (user: User) => {
    try {
      const chatId = await chatService.getOrCreateDirectChat(currentUser?.id || "", user.id)
      // router.replace(`/chat/${chatId}`)
      router.push(`/chat/${chatId}`)

    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to start chat")
    }
  }

  const renderUserItem = ({ item }: { item: User }) => (
    <TouchableOpacity style={styles.userItem} onPress={() => handleStartChat(item)}>
      <Image source={{ uri: item.avatar }} style={styles.userAvatar} />
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.name}</Text>
        <Text style={styles.userEmail}>{item.email}</Text>
        {item.online && (
          <View style={styles.onlineIndicator}>
            <Text style={styles.onlineText}>Online</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  )

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>New Chat</Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search users by name or email..."
          value={searchQuery}
          onChangeText={handleSearch}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      {loading && (
        <View style={styles.loadingContainer}>
          <Text>Searching...</Text>
        </View>
      )}

      {searchResults.length > 0 && (
        <FlatList
          data={searchResults}
          renderItem={renderUserItem}
          keyExtractor={(item) => item.id}
          style={styles.resultsList}
        />
      )}

      {searchQuery.length >= 2 && !loading && searchResults.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No users found</Text>
        </View>
      )}

      {searchQuery.length < 2 && (
        <View style={styles.instructionState}>
          <Text style={styles.instructionText}>Type at least 2 characters to search for users</Text>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    paddingTop: 60,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backButton: {
    marginRight: 15,
  },
  backButtonText: {
    fontSize: 16,
    color: "#007AFF",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  searchContainer: {
    padding: 20,
    backgroundColor: "white",
  },
  searchInput: {
    backgroundColor: "#f8f9fa",
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  loadingContainer: {
    padding: 20,
    alignItems: "center",
  },
  resultsList: {
    flex: 1,
  },
  userItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  onlineIndicator: {
    backgroundColor: "#34C759",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    alignSelf: "flex-start",
  },
  onlineText: {
    color: "white",
    fontSize: 10,
    fontWeight: "500",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
  },
  instructionState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  instructionText: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
  },
})
