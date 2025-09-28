# ElexisTech Backend - React Native + Firebase Media Sharing & Calling App

A comprehensive React Native application featuring Firebase authentication, account switching, media sharing, and audio/video calling capabilities.

## 📱 Features

- **🔐 Firebase Authentication** - Email/password login with account switching (up to 15 accounts)
- **👤 User Profiles** - Avatar uploads, bio, online status tracking
- **📞 Audio/Video Calls** - 1-to-1 calling with Firebase UID-based signaling
- **📸 Media Sharing** - Timeline interface for sharing photos and files
- **🔄 Real-time Updates** - Live data synchronization across all features
- **☁️ Cloud Storage** - Cloudinary integration for media uploads

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- Bun (recommended) or npm/yarn
- Expo CLI
- Firebase project
- Cloudinary account

### 1. Clone and Install

```bash
git clone https://github.com/chidinma-elekwachi/elexistech-backend
cd elexistech-backend
bun install
```

### 2. Environment Setup

Create a `.env` file in the root directory:

```env
# Firebase Configuration
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
FIREBASE_DATABASE_URL=https://your_project.firebaseio.com

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_UPLOAD_PRESET=your_unsigned_preset
```

### 3. Firebase Setup

#### Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable the following services:
   - **Authentication** → Email/Password
   - **Firestore Database**
   - **Storage** (optional, we use Cloudinary)

#### Configure Firestore Security Rules

```javascript
// Firestore Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow read: if request.auth != null; // Allow reading other users' profiles
    }

    // Media messages collection
    match /mediaMessages/{messageId} {
      allow read, write: if request.auth != null;
    }

    // Calls collection
    match /calls/{callId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

#### Required Environment Variables

Make sure your `.env` file contains all the required variables:

**Firebase Variables:**

- `FIREBASE_API_KEY` - Your Firebase API key
- `FIREBASE_AUTH_DOMAIN` - Your Firebase auth domain
- `FIREBASE_PROJECT_ID` - Your Firebase project ID
- `FIREBASE_STORAGE_BUCKET` - Your Firebase storage bucket
- `FIREBASE_MESSAGING_SENDER_ID` - Your Firebase messaging sender ID
- `FIREBASE_APP_ID` - Your Firebase app ID
- `FIREBASE_DATABASE_URL` - Your Firebase database URL

**Cloudinary Variables:**

- `CLOUDINARY_CLOUD_NAME` - Your Cloudinary cloud name
- `CLOUDINARY_UPLOAD_PRESET` - Your unsigned upload preset name

### 4. Cloudinary Setup

1. Create a [Cloudinary account](https://cloudinary.com/)
2. Create an **unsigned upload preset**:
   - Go to Settings → Upload
   - Add upload preset
   - Set signing mode to "Unsigned"
   - Set folder to "avatars" and "media-share"

### 5. Run the Application

```bash
# Start the development server
bun start

# Or with Expo
expo start
```

## 🧪 Testing Features

### Authentication & Account Switching

1. **Sign Up/Login**

   - Open the app
   - Create a new account with email/password
   - Verify profile creation

2. **Account Switching**

   - Create multiple accounts (up to 15)
   - Use the "Switch Account" button in Profile screen
   - Verify seamless switching without logout

3. **Profile Management**
   - Edit profile information
   - Upload avatar (should upload to Cloudinary)
   - Verify changes persist across account switches

### Media Sharing

1. **Upload Media**

   - Navigate to "Media" tab
   - Tap camera button to select photos/files
   - Add optional message
   - Verify upload to Cloudinary

2. **View Shared Media**
   - Check that media appears in real-time timeline
   - Verify sender name and avatar display
   - Test with multiple users sharing media

### Audio/Video Calls

1. **Initiate Call**

   - Go to "Users" tab
   - Tap on a user to start call
   - Choose audio or video call
   - Verify call initialization in Firestore

2. **Receive Call**

   - Have another user call you
   - Verify incoming call notification
   - Test answer/decline functionality

3. **Call Controls**
   - Test mute/unmute
   - Test video on/off
   - Test speaker toggle
   - Test call end

## 📂 Project Structure

```
src/
├── components/           # Reusable components
│   └── AccountSwitcher.js
├── firebase/            # Firebase configuration
│   ├── config.js
│   ├── AuthContext.js
│   └── userService.js
├── navigation/          # Navigation setup
│   └── Navigation.js
├── screens/            # App screens
│   ├── AuthScreen.js
│   ├── ProfileScreen.js
│   ├── EditProfileScreen.js
│   ├── UsersScreen.js
│   ├── ChatScreen.js (CallScreen)
│   ├── MediaShareScreen.js
│   └── LoadingScreen.js
├── services/           # Business logic
│   ├── authService.js
│   ├── callService.js
│   ├── mediaService.js
│   └── mediaShareService.js
├── cloudinary/         # Cloudinary integration
│   └── config.js
└── theme/             # App theming
    └── theme.js
```

## 🔧 Key Services

### AuthService

- User authentication and session management
- Account switching with credential caching
- Profile management and updates

### CallService

- Firestore-based call signaling
- Call state management
- Real-time call updates

### MediaShareService

- Media message handling
- Real-time media sharing
- Sender profile enrichment

### Cloudinary Integration

- Avatar uploads
- Media file uploads
- Automatic file optimization

## 🗄️ Database Schema

### Users Collection

```javascript
{
  uid: "string",
  email: "string",
  profile: {
    name: "string",
    bio: "string",
    avatar: "string (Cloudinary URL)"
  },
  online: boolean,
  lastSeen: timestamp,
  createdAt: timestamp
}
```

### Media Messages Collection

```javascript
{
  senderId: "string",
  receiverId: "string | 'all'",
  mediaUrl: "string (Cloudinary URL)",
  mediaType: "image | video | file",
  fileName: "string",
  message: "string",
  timestamp: timestamp
}
```

### Calls Collection

```javascript
{
  callerId: "string",
  receiverId: "string",
  type: "audio | video",
  status: "initializing | offering | ringing | active | ended",
  startedAt: timestamp,
  endedAt: timestamp,
  offer: "object",
  answer: "object",
  iceCandidates: {
    caller: ["array"],
    receiver: ["array"]
  }
}
```

## 🐛 Troubleshooting

### Common Issues

1. **Firebase Connection Errors**

   - Verify environment variables
   - Check Firebase project configuration
   - Ensure Firestore rules allow access

2. **Cloudinary Upload Failures**

   - Verify upload preset is unsigned
   - Check Cloudinary credentials
   - Ensure preset allows the file types

3. **Account Switching Issues**

   - Clear AsyncStorage if switching fails
   - Check credential storage in authService

4. **Call Signaling Problems**
   - Verify Firestore rules for calls collection
   - Check call state management
   - Ensure proper cleanup on call end

### Debug Mode

Enable debug logging by adding to your environment:

```env
DEBUG=true
```

## 📱 Platform Support

- **iOS**: Full support
- **Android**: Full support
- **Web**: Limited support (calling features may not work)

## 🔒 Security Considerations

- All Firebase operations require authentication
- Cloudinary uses unsigned presets for client uploads
- User data is isolated by UID
- Call signaling is secured through Firestore rules

## 📈 Performance Notes

- Media files are optimized by Cloudinary
- Real-time listeners are properly cleaned up
- Profile data is cached to reduce API calls
- Images are lazy-loaded in media sharing

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

---

**Note**: This is a demonstration project for ElexisTech. The calling functionality uses Firestore for signaling but would require additional WebRTC implementation for actual media streaming in a production environment.
