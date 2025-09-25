# Job Test - Expo Chat Prototype

## Overview
This app demonstrates:
- Firebase email/password auth with multiple account support (up to 15) and instant switching.
- Media upload (images/videos) to Firebase Storage; media URL saved in Firestore message object.
- 1:1 audio/video calling via WebRTC in a WebView using Firestore for signaling.

## Setup
1. Create a test Firebase project (do NOT use production).
2. Enable Authentication (Email/Password), Firestore, and Storage.
3. Replace `firebase.js` config with your Firebase project's config.
4. Install deps:
```
expo install firebase expo-secure-store expo-image-picker expo-av react-native-webview
npm install @react-navigation/native @react-navigation/stack
expo install react-native-gesture-handler react-native-reanimated react-native-screens react-native-safe-area-context
```

5. Start app:
```
expo start
```

Open with Expo Go on mobile devices.

## How to test features
- **Auth / Account switching**
- Open Auth screen, register or login to add account. The account is saved locally (SecureStore).
- Open Settings to see up to 15 saved accounts (avatar + username).
- Tap an account to switch instantly (silent re-login in background).

- **Media Upload & Sharing**
- Navigate to Chat screen.
- Use "Attach" to pick image or video. The file is uploaded to Firebase Storage and a message with `mediaUrl` is stored in `chats/{chatId}/messages`.
- Open the app on another device (another account) to see incoming media inside chat bubble.

- **Audio/Video Calls**
- Host `webrtc-client.html` (or embed as HTML) and set `WEBRTC_CLIENT_URL` in `screens/CallScreen.js`.
- Use Call screen: Caller creates call doc and opens WebView (caller role). Callee, when receiving ring, accepts and opens WebView (callee role).
- WebRTC SDP/ICE exchange happens via `calls/{callId}/signals`.

## Security Notes
- For this test we persist email/passwords in `expo-secure-store` to enable instant switching. This is **only for prototype/testing**. In production use secure token refresh mechanisms and never store plaintext passwords.

## Known limitations
- WebRTC in WebView requires a hosted HTML client and may need TURN for NAT traversal.
- This is minimal UI (assignment requirement). Focus is on integration and logic, not styling.

