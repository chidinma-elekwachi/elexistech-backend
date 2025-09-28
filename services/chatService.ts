import {
    collection,
    doc,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit,
    onSnapshot,
    getDocs,
    serverTimestamp,
    arrayUnion,
    getDoc,
  } from "firebase/firestore"
  import { db } from "../config/firebase"
  import type { Chat, Message, User } from "../types"
  
  class ChatService {
    // Create a new chat between users
    async createChat(members: string[], isGroup = false, groupName?: string): Promise<string> {
      try {
        const chatData: Omit<Chat, "id"> = {
          members,
          isGroup,
          groupName,
          lastMessage: undefined,
        }
  
        const docRef = await addDoc(collection(db, "chats"), chatData)
        return docRef.id
      } catch (error) {
        console.error("Create chat error:", error)
        throw error
      }
    }
  
    // Get user's chats
    subscribeToUserChats(userId: string, callback: (chats: Chat[]) => void): () => void {
      const q = query(
        collection(db, "chats"),
        where("members", "array-contains", userId),
        orderBy("lastMessage.createdAt", "desc"),
      )
  
      return onSnapshot(q, (snapshot) => {
        const chats: Chat[] = []
        snapshot.forEach((doc) => {
          chats.push({ id: doc.id, ...doc.data() } as Chat)
        })
        callback(chats)
      })
    }
  
    // Send a message
    async sendMessage(
      chatId: string,
      senderId: string,
      text?: string,
      mediaUrl?: string,
      mediaType?: "image" | "video",
    ): Promise<void> {
      try {
        const messageData: Omit<Message, "id"> = {
          text,
          senderId,
          createdAt: serverTimestamp(),
          mediaUrl,
          mediaType,
          status: "sent",
          readBy: [senderId],
        }
  
        // Add message to messages subcollection
        await addDoc(collection(db, "chats", chatId, "messages"), messageData)
  
        // Update chat's last message
        const lastMessageData = {
          text: text || (mediaType === "image" ? "📷 Image" : "🎥 Video"),
          createdAt: serverTimestamp(),
          senderId,
          readBy: [senderId],
        }
  
        await updateDoc(doc(db, "chats", chatId), {
          lastMessage: lastMessageData,
        })
      } catch (error) {
        console.error("Send message error:", error)
        throw error
      }
    }
  
    // Subscribe to messages in a chat
    subscribeToMessages(chatId: string, callback: (messages: Message[]) => void): () => void {
      const q = query(collection(db, "chats", chatId, "messages"), orderBy("createdAt", "asc"), limit(100))
  
      return onSnapshot(q, (snapshot) => {
        const messages: Message[] = []
        snapshot.forEach((doc) => {
          messages.push({ id: doc.id, ...doc.data() } as Message)
        })
        callback(messages)
      })
    }
  
    // Mark messages as read
    async markMessagesAsRead(chatId: string, userId: string): Promise<void> {
      try {
        const q = query(collection(db, "chats", chatId, "messages"), where("readBy", "not-in", [[userId]]))
  
        const snapshot = await getDocs(q)
        const batch: Promise<void>[] = []
  
        snapshot.forEach((doc) => {
          batch.push(
            updateDoc(doc.ref, {
              readBy: arrayUnion(userId),
            }),
          )
        })
  
        await Promise.all(batch)
  
        // Update last message read status
        const chatDoc = await getDoc(doc(db, "chats", chatId))
        if (chatDoc.exists()) {
          const chatData = chatDoc.data() as Chat
          if (chatData.lastMessage) {
            await updateDoc(doc(db, "chats", chatId), {
              "lastMessage.readBy": arrayUnion(userId),
            })
          }
        }
      } catch (error) {
        console.error("Mark as read error:", error)
        throw error
      }
    }
  
    // Delete a message
    async deleteMessage(chatId: string, messageId: string): Promise<void> {
      try {
        await deleteDoc(doc(db, "chats", chatId, "messages", messageId))
      } catch (error) {
        console.error("Delete message error:", error)
        throw error
      }
    }
  
    // Get or create direct chat between two users
    async getOrCreateDirectChat(userId1: string, userId2: string): Promise<string> {
      try {
        // Check if chat already exists
        const q = query(
          collection(db, "chats"),
          where("members", "==", [userId1, userId2].sort()),
          where("isGroup", "==", false),
        )
  
        const snapshot = await getDocs(q)
  
        if (!snapshot.empty) {
          return snapshot.docs[0].id
        }
  
        // Create new chat
        return await this.createChat([userId1, userId2].sort(), false)
      } catch (error) {
        console.error("Get or create chat error:", error)
        throw error
      }
    }
  
    // Search users
    async searchUsers(query: string, currentUserId: string): Promise<User[]> {
      try {
        // In a real app, you'd implement proper search
        // For now, we'll get all users and filter client-side
        const snapshot = await getDocs(collection(db, "users"))
        const users: User[] = []
  
        snapshot.forEach((doc) => {
          const userData = { id: doc.id, ...doc.data() } as User
          if (
            userData.id !== currentUserId &&
            (userData.name.toLowerCase().includes(query.toLowerCase()) ||
              userData.email.toLowerCase().includes(query.toLowerCase()))
          ) {
            users.push(userData)
          }
        })
  
        return users.slice(0, 10) // Limit results
      } catch (error) {
        console.error("Search users error:", error)
        throw error
      }
    }
  }
  
  export const chatService = new ChatService()
  