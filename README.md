Lutero Job Test – React Native + Firebase
📌 Overview

This repo is a clean React Native project.
Your task is to:

Set up Firebase authentication (email + password).

Implement account switching (up to 15 accounts).

Add media upload (profile/avatar upload, other users should see it).

Implement audio/video calls (using Agora or WebRTC, with Firebase uid as identifier).

The UI is not important – focus on backend logic + Firebase integration.

🚀 Getting Started
1. Clone the Repo
git clone https://github.com/chidinma-elekwachi/elexistech-backend
cd elexistech-backend

2. Checkout Your Branch

Branch name = your first name

git checkout -b <your-name>

🔥 Firebase Setup
1. Create a Firebase Project

Go to Firebase Console
.

Create a new project.

Enable:

Authentication → Email/Password

Firestore Database

Storage

2. Register iOS + Android Apps

Add iOS app (use bundle ID com.lutero.app)

Add Android app (use package name com.lutero.app)

Download the config files:

iOS → GoogleService-Info.plist → place in ios/ folder.

Android → google-services.json → place in android/app/.

3. Install Firebase Packages
yarn add @react-native-firebase/app @react-native-firebase/auth @react-native-firebase/firestore @react-native-firebase/storage



📂 Firebase Schema

You’ll use Firestore with these collections:

users
{
  "uid": "string",
  "email": "string",
  "username": "string",
  "avatar": "string (downloadURL)",
  "bio": "string",
  "online": true,
  "lastSeen": 1234567890,
  "createdAt": 1234567890
}

chats/{chatId}/messages/{msgId}
{
  "senderId": "string",
  "receiverId": "string",
  "content": "string | mediaURL",
  "type": "text | image | video",
  "timestamp": 1234567890,
  "status": "sent | delivered | read"
}

calls/{callId}
{
  "callerId": "string",
  "receiverId": "string",
  "channelId": "string",
  "status": "ringing | ongoing | ended",
  "timestamp": 1234567890
}

## 🧩 Tasks
✅ Authentication

Implement email + password login with Firebase Auth.

Store user profile in users collection.

✅ Account Switching

Allow multiple accounts (up to 15).

Cache credentials (email + password) in SecureStore/AsyncStorage.

Switching = re-authenticate silently (no logout page).

Display account list with avatar + username.

✅ Media Upload

Add a media picker for profile avatar.

Upload to Firebase Storage → save downloadURL to Firestore.

Other users should see updated profile/avatar.

✅ Calls (Audio/Video)

Use Agora SDK or react-native-webrtc.

Caller/receiver should be linked via users.uid.

Store call metadata in calls collection.


## 📩 Submission

Commit all work to your branch.

Push to origin.

I will pull and test directly on my device.
