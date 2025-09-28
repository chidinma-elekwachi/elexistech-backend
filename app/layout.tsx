"use client"

import { Stack } from "expo-router"
import { useEffect, useState } from "react"
import { authService } from "../services/authService"
import type { User } from "../types"

export default function RootLayout() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await authService.initialize()
        const currentAccount = await authService.getCurrentAccount()
        if (currentAccount) {
          // Try to restore session
          const userData = authService.getCurrentUser()
          setUser(userData)
        }
      } catch (error) {
        console.error("Auth initialization error:", error)
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()
  }, [])

  if (loading) {
    return null // Add loading screen if needed
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="chat" />
      <Stack.Screen name="settings" />
    </Stack>
  )
}
