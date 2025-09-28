"use client"

import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, Alert } from "react-native"
import { useRouter } from "expo-router"
import { useState, useEffect } from "react"
import { authService } from "../services/authService"
import type { User, StoredAccount } from "../types"

export default function SettingsScreen() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [storedAccounts, setStoredAccounts] = useState<StoredAccount[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadAccountData()
  }, [])

  const loadAccountData = async () => {
    const user = authService.getCurrentUser()
    const accounts = authService.getStoredAccounts()
    setCurrentUser(user)
    setStoredAccounts(accounts)
  }

  const handleAccountSwitch = async (accountUid: string) => {
    if (currentUser?.id === accountUid) {
      return // Already current account
    }

    setLoading(true)
    try {
      const user = await authService.switchAccount(accountUid)
      setCurrentUser(user)
      Alert.alert("Success", `Switched to ${user.name}`)
      router.replace("/chat")
    } catch (error: any) {
      Alert.alert("Switch Failed", error.message || "Failed to switch account")
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            await authService.logout()
            router.replace("/")
          } catch (error: any) {
            Alert.alert("Error", error.message || "Failed to logout")
          }
        },
      },
    ])
  }

  const handleAddAccount = () => {
    router.push("/login")
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
      </View>

      {currentUser && (
        <View style={styles.currentUserSection}>
          <Text style={styles.sectionTitle}>Current Account</Text>
          <View style={styles.userCard}>
            <Image source={{ uri: currentUser.avatar }} style={styles.avatar} />
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{currentUser.name}</Text>
              <Text style={styles.userEmail}>{currentUser.email}</Text>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>Active</Text>
              </View>
            </View>
          </View>
        </View>
      )}

      <View style={styles.accountsSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Stored Accounts ({storedAccounts.length}/15)</Text>
          {storedAccounts.length < 15 && (
            <TouchableOpacity style={styles.addButton} onPress={handleAddAccount}>
              <Text style={styles.addButtonText}>+ Add</Text>
            </TouchableOpacity>
          )}
        </View>

        {storedAccounts.map((account) => (
          <TouchableOpacity
            key={account.uid}
            style={[styles.accountCard, currentUser?.id === account.uid && styles.currentAccountCard]}
            onPress={() => handleAccountSwitch(account.uid)}
            disabled={loading || currentUser?.id === account.uid}
          >
            <Image source={{ uri: account.avatar }} style={styles.accountAvatar} />
            <View style={styles.accountInfo}>
              <Text style={styles.accountName}>{account.name}</Text>
              <Text style={styles.accountEmail}>{account.email}</Text>
            </View>
            {currentUser?.id === account.uid && (
              <View style={styles.currentBadge}>
                <Text style={styles.currentBadgeText}>Current</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}

        {storedAccounts.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No stored accounts</Text>
            <TouchableOpacity style={styles.addButton} onPress={handleAddAccount}>
              <Text style={styles.addButtonText}>Add Account</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.actionsSection}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
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
  currentUserSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 15,
  },
  userCard: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
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
    marginBottom: 8,
  },
  statusBadge: {
    backgroundColor: "#34C759",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  statusText: {
    color: "white",
    fontSize: 12,
    fontWeight: "500",
  },
  accountsSection: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  addButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  addButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
  },
  accountCard: {
    backgroundColor: "white",
    padding: 12,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  currentAccountCard: {
    borderWidth: 2,
    borderColor: "#007AFF",
  },
  accountAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  accountInfo: {
    flex: 1,
  },
  accountName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginBottom: 2,
  },
  accountEmail: {
    fontSize: 12,
    color: "#666",
  },
  currentBadge: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  currentBadgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "500",
  },
  emptyState: {
    alignItems: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
  },
  actionsSection: {
    padding: 20,
  },
  logoutButton: {
    backgroundColor: "#FF3B30",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  logoutButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
})
