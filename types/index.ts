export type User = {
    id: string
    name: string
    avatar: string
    email: string
    online?: boolean
    lastSeen?: number | null
  }
  
  export type Message = {
    id: string
    text?: string
    senderId: string
    createdAt?: any
    mediaUrl?: string
    mediaType?: "image" | "video"
    status?: "sent" | "pending" | "failed" | "delivered" | "read"
    replyToMessageId?: string | null
    reactions?: Record<string, string>
    readBy?: string[]
  }
  
  export type Chat = {
    id: string
    members: string[]
    groupName?: string
    isGroup?: boolean
    groupAvatar?: string
    lastMessage?: {
      text: string
      createdAt: any
      senderId: string
      readBy?: string[]
    }
  }
  
  export type StoredAccount = {
    uid: string
    email: string
    name: string
    avatar: string
    refreshToken?: string
  }
  
  export type CallData = {
    id: string
    callerId: string
    receiverId: string
    type: "audio" | "video"
    status: "calling" | "accepted" | "rejected" | "ended"
    createdAt: any
    offer?: any
    answer?: any
    iceCandidates?: any[]
  }
  