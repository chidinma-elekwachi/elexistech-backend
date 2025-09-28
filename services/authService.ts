import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, updateProfile } from "firebase/auth"
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { auth, db } from "../config/firebase"
import type { User, StoredAccount } from "../types"

const ACCOUNTS_STORAGE_KEY = "stored_accounts"
const CURRENT_ACCOUNT_KEY = "current_account"

class AuthService {
  private accounts: StoredAccount[] = []
  private currentUser: User | null = null

  async initialize() {
    try {
      const storedAccounts = await AsyncStorage.getItem(ACCOUNTS_STORAGE_KEY)
      if (storedAccounts) {
        this.accounts = JSON.parse(storedAccounts)
      }
    } catch (error) {
      console.error("Error loading stored accounts:", error)
    }
  }

  async login(email: string, password: string): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const firebaseUser = userCredential.user

      // Get user data from Firestore
      const userDoc = await getDoc(doc(db, "users", firebaseUser.uid))
      let userData: User

      if (userDoc.exists()) {
        userData = { id: firebaseUser.uid, ...userDoc.data() } as User
      } else {
        // Create user document if it doesn't exist
        userData = {
          id: firebaseUser.uid,
          email: firebaseUser.email!,
          name: firebaseUser.displayName || email.split("@")[0],
          avatar: firebaseUser.photoURL || `https://ui-avatars.com/api/?name=${email}&background=random`,
          online: true,
          lastSeen: Date.now(),
        }

        await setDoc(doc(db, "users", firebaseUser.uid), userData)
      }

      // Update online status
      await updateDoc(doc(db, "users", firebaseUser.uid), {
        online: true,
        lastSeen: Date.now(),
      })

      this.currentUser = userData
      await this.storeAccount(userData, password)

      return userData
    } catch (error) {
      console.error("Login error:", error)
      throw error
    }
  }

  async register(email: string, password: string, name: string): Promise<User> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const firebaseUser = userCredential.user

      // Update Firebase Auth profile
      await updateProfile(firebaseUser, {
        displayName: name,
        photoURL: `https://ui-avatars.com/api/?name=${name}&background=random`,
      })

      const userData: User = {
        id: firebaseUser.uid,
        email,
        name,
        avatar: `https://ui-avatars.com/api/?name=${name}&background=random`,
        online: true,
        lastSeen: Date.now(),
      }

      // Create user document in Firestore
      await setDoc(doc(db, "users", firebaseUser.uid), userData)

      this.currentUser = userData
      await this.storeAccount(userData, password)

      return userData
    } catch (error) {
      console.error("Registration error:", error)
      throw error
    }
  }

  async logout(): Promise<void> {
    try {
      if (this.currentUser) {
        // Update offline status
        await updateDoc(doc(db, "users", this.currentUser.id), {
          online: false,
          lastSeen: Date.now(),
        })
      }

      await signOut(auth)
      this.currentUser = null
      await AsyncStorage.removeItem(CURRENT_ACCOUNT_KEY)
    } catch (error) {
      console.error("Logout error:", error)
      throw error
    }
  }

  private async storeAccount(user: User, password: string): Promise<void> {
    try {
      const account: StoredAccount = {
        uid: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
      }

      // Check if account already exists
      const existingIndex = this.accounts.findIndex((acc) => acc.uid === user.id)

      if (existingIndex >= 0) {
        this.accounts[existingIndex] = account
      } else {
        // Limit to 15 accounts
        if (this.accounts.length >= 15) {
          this.accounts.shift() // Remove oldest account
        }
        this.accounts.push(account)
      }

      await AsyncStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(this.accounts))
      await AsyncStorage.setItem(CURRENT_ACCOUNT_KEY, JSON.stringify(account))
    } catch (error) {
      console.error("Error storing account:", error)
    }
  }

  async switchAccount(accountUid: string): Promise<User> {
    try {
      const account = this.accounts.find((acc) => acc.uid === accountUid)
      if (!account) {
        throw new Error("Account not found")
      }

      // Sign out current user silently
      if (auth.currentUser) {
        await signOut(auth)
      }

      // Get stored credentials and re-authenticate
      // Note: In a real app, you'd need to store encrypted credentials or use refresh tokens
      // For this demo, we'll fetch user data directly
      const userDoc = await getDoc(doc(db, "users", accountUid))

      if (!userDoc.exists()) {
        throw new Error("User data not found")
      }

      const userData = { id: accountUid, ...userDoc.data() } as User

      // Update online status
      await updateDoc(doc(db, "users", accountUid), {
        online: true,
        lastSeen: Date.now(),
      })

      this.currentUser = userData
      await AsyncStorage.setItem(CURRENT_ACCOUNT_KEY, JSON.stringify(account))

      return userData
    } catch (error) {
      console.error("Account switch error:", error)
      throw error
    }
  }

  getStoredAccounts(): StoredAccount[] {
    return this.accounts
  }

  getCurrentUser(): User | null {
    return this.currentUser
  }

  async getCurrentAccount(): Promise<StoredAccount | null> {
    try {
      const stored = await AsyncStorage.getItem(CURRENT_ACCOUNT_KEY)
      return stored ? JSON.parse(stored) : null
    } catch (error) {
      console.error("Error getting current account:", error)
      return null
    }
  }
}

export const authService = new AuthService()
