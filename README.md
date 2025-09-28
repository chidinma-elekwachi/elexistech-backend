# ElexisTech Chat Application

A comprehensive React Native chat application built with Expo, Firebase, and TypeScript. Features include Firebase authentication with account switching, media sharing, and audio/video calling capabilities.

## Features

### 🔐 Authentication & Account Switching
- **Firebase Authentication** with email and password
- **Multi-account support** - users can save up to 15 accounts
- **Instant account switching** with cached credentials
- **Silent re-login** for seamless user experience
- **Account management** in settings screen

### 📱 Media Upload & Sharing
- **Image and video upload** to Firebase Storage
- **Gallery and camera integration** using Expo Image Picker
- **Real-time media sharing** in chat bubbles
- **Cross-platform support** (iOS & Android)
- **Automatic media type detection**

### 📞 Audio & Video Calls
- **1-to-1 audio and video calling**
- **Firebase-based signaling** for call management
- **Real-time call status updates**
- **Incoming call notifications**
- **Call acceptance/rejection flow**
- **Ready for Agora SDK integration**

### 💬 Chat Features
- **Real-time messaging** with Firestore
- **Media message support** (images/videos)
- **Message status tracking** (sent, delivered, read)
- **Chat list with last message preview**
- **Direct and group chat support**

## Tech Stack

- **Frontend**: React Native with Expo
- **Backend**: Firebase (Auth, Firestore, Storage)
- **Language**: TypeScript
- **Navigation**: React Navigation
- **State Management**: React Hooks
- **Media**: Expo Image Picker, Expo AV
- **Storage**: AsyncStorage for account caching

## Project Structure

```
├── App.tsx                 # Main app component with navigation
├── config/
│   └── firebase.ts         # Firebase configuration
├── services/
│   ├── authService.ts      # Authentication & account switching
│   ├── chatService.ts      # Chat & messaging functionality
│   ├── mediaService.ts     # Media upload & management
│   └── callService.ts      # Call signaling & management
├── screens/
│   ├── LoginScreen.tsx     # User login
│   ├── RegisterScreen.tsx  # User registration
│   ├── AccountSwitchScreen.tsx # Account management
│   ├── ChatListScreen.tsx  # Chat list view
│   ├── ChatScreen.tsx      # Individual chat
│   ├── SettingsScreen.tsx  # User settings
│   └── CallScreen.tsx      # Audio/video call interface
├── types/
│   └── index.ts           # TypeScript type definitions
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator (for iOS development)
- Android Studio (for Android development)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd elexistech-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Firebase Configuration**
   - The project is already configured with Firebase
   - `google-services.json` (Android) and `GoogleService-Info.plist` (iOS) are included
   - Firebase project: `chat-backend-1`

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Run on device/simulator**
   ```bash
   # iOS
   npm run ios
   
   # Android
   npm run android
   ```

## Testing Features

### Authentication Testing

1. **Register a new account**
   - Open the app
   - Tap "Don't have an account? Sign Up"
   - Fill in name, email, and password
   - Account will be saved automatically

2. **Test account switching**
   - Register multiple accounts
   - Use "Quick Login" on login screen
   - Or go to Settings → Manage Accounts
   - Switch between accounts instantly

3. **Test account management**
   - Go to Settings
   - View all saved accounts
   - Remove accounts you don't need
   - Switch to different accounts

### Media Sharing Testing

1. **Send images**
   - Open a chat
   - Tap the camera icon (📷)
   - Choose from gallery or take a photo
   - Image will upload and appear in chat

2. **Send videos**
   - Open a chat
   - Tap the video icon (🎥)
   - Select a video from gallery
   - Video will upload and appear in chat

3. **View media**
   - Tap on images to view full size
   - Tap on videos to play them
   - Media loads from Firebase Storage

### Call Testing

1. **Start a call**
   - In chat list, tap phone icon (📞) for audio call
   - Or tap video icon (📹) for video call
   - Call will be initiated

2. **Receive a call**
   - When someone calls you, you'll see incoming call screen
   - Tap ✓ to accept or ✕ to reject
   - Call will connect (UI only - actual audio/video requires Agora SDK)

3. **End a call**
   - Tap the red ✕ button to end call
   - Call status will update in real-time

### Chat Testing

1. **Send messages**
   - Type in the text input
   - Tap "Send" or press Enter
   - Messages appear in real-time

2. **View chat list**
   - See all your conversations
   - Last message preview
   - Timestamp of last activity

## Firebase Schema

### Users Collection
```typescript
{
  id: string;
  name: string;
  avatar: string;
  email: string;
  online: boolean;
  lastSeen: number;
}
```

### Messages Collection (subcollection of chats)
```typescript
{
  id: string;
  text?: string;
  senderId: string;
  createdAt: timestamp;
  mediaUrl?: string;
  mediaType?: "image" | "video";
  status: "sent" | "pending" | "failed" | "delivered" | "read";
  replyToMessageId?: string;
  reactions: Record<string, string>;
  readBy: string[];
}
```

### Chats Collection
```typescript
{
  id: string;
  members: string[];
  groupName?: string;
  isGroup: boolean;
  groupAvatar?: string;
  lastMessage?: {
    text: string;
    createdAt: timestamp;
    senderId: string;
    readBy: string[];
  };
}
```

### Calls Collection
```typescript
{
  callId: string;
  callerId: string;
  receiverId: string;
  type: "audio" | "video";
  status: "calling" | "accepted" | "rejected" | "ended";
  timestamp: number;
}
```

## Development Notes

### Account Switching Implementation
- Uses AsyncStorage to cache account credentials
- Silent re-login for instant switching
- Automatic cleanup of old accounts (max 15)
- Real-time auth state management

### Media Upload Flow
1. User selects media (image/video)
2. File is uploaded to Firebase Storage
3. Download URL is stored in Firestore message
4. Other users see media in real-time

### Call Signaling
- Uses Firestore for call signaling
- Real-time listeners for call status
- Automatic call cleanup after 5 minutes
- Ready for Agora SDK integration

## Future Enhancements

1. **Agora SDK Integration**
   - Replace call UI with actual audio/video
   - Add screen sharing
   - Group calling support

2. **Push Notifications**
   - Firebase Cloud Messaging
   - Background call notifications
   - Message notifications

3. **Advanced Chat Features**
   - Message reactions
   - Message replies
   - File sharing
   - Voice messages

4. **UI/UX Improvements**
   - Dark mode
   - Custom themes
   - Animations
   - Better media viewer

## Troubleshooting

### Common Issues

1. **Firebase connection issues**
   - Check internet connection
   - Verify Firebase project configuration
   - Ensure proper API keys

2. **Media upload failures**
   - Check Firebase Storage rules
   - Verify file permissions
   - Check file size limits

3. **Account switching not working**
   - Clear AsyncStorage: `AsyncStorage.clear()`
   - Re-login to all accounts
   - Check Firebase Auth state

4. **Call issues**
   - Check Firestore rules for calls collection
   - Verify user permissions
   - Check call cleanup timers

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review Firebase console for errors
3. Check Expo logs for runtime errors
4. Verify all dependencies are installed

## License

This project is licensed under the 0BSD License.