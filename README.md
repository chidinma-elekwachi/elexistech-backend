# ElexisTech Chat Backend API

A Node.js/Express.js backend API for a chat application with authentication and media upload capabilities.

## 🚀 Features Implemented

### ✅ Task 1: Authentication + Account Switching
- **Firebase Authentication** with email + password
- **Multi-account management** (up to 15 accounts per user)
- **Account switching** with instant login
- **JWT token-based** session management
- **In-memory account storage** for fast switching

### ✅ Task 2: Media Upload & Sharing
- **Media file upload** (images/videos) to Supabase Storage
- **File type validation** (images: jpg, png, gif, webp; videos: mp4, mov, avi, webm)
- **File size validation** (10MB maximum)
- **Image processing** with Sharp (compression, resizing)
- **Public URL generation** for media access
- **File management** (info retrieval, deletion)

### ✅ Task 3: Audio & Video Calls
- **1-to-1 audio and video calling** with Agora SDK
- **Call management** (initiate, accept, reject, end)
- **Real-time call states** (initiating, ringing, connected, ended)
- **Agora token generation** for secure connections
- **Cross-platform support** (iOS + Android ready)
- **Call history and status tracking**

## 🚫 Limitations Due to Project Access

### ❌ Missing Features (Firestore Access Required)
The following features require Firestore database access, which is not available due to project permission restrictions:

1. **Message Storage** - Cannot save messages to Firestore
2. **Chat Management** - Cannot create or manage chat rooms
3. **Media-Message Integration** - Cannot link media URLs to messages
4. **Real-time Messaging** - Cannot implement real-time message delivery

### 🔧 Technical Limitations
- **Firestore Database**: Not accessible due to project owner permissions
- **Message Routes**: Removed to prevent errors
- **Chat Functionality**: Cannot be tested without database access

## 🛠️ Technology Stack

- **Backend**: Node.js, Express.js
- **Authentication**: Firebase Admin SDK
- **File Storage**: Supabase Storage
- **Image Processing**: Sharp
- **File Upload**: Multer
- **Video/Audio Calls**: Agora SDK
- **Security**: Helmet, CORS
- **Validation**: Joi

## 📦 Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd elexistech-backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp env.sample .env
```

4. **Configure Firebase credentials**
   - Add your Firebase service account credentials to `.env`
   - Ensure Firebase Authentication is enabled

5. **Configure Supabase credentials**
   - Add your Supabase URL and service role key to `.env`
   - Create a `media` bucket in Supabase Storage
   - Set bucket to public with appropriate policies

6. **Configure Agora credentials**
   - Create an Agora account at https://console.agora.io/
   - Create a new project and get App ID + App Certificate
   - Add credentials to `.env` file

7. **Start the server**
```bash
npm start
# or for development
npm run dev
```

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/accounts` - Get user accounts
- `POST /api/auth/switch` - Switch active account
- `POST /api/auth/add-account` - Add new account
- `DELETE /api/auth/remove-account/:uid` - Remove account

### Media Upload
- `POST /api/media/upload` - Upload media file
- `GET /api/media/info/*` - Get file information
- `DELETE /api/media/delete/*` - Delete media file

### Audio/Video Calls
- `POST /api/calls/initiate` - Initiate a call
- `POST /api/calls/:callId/accept` - Accept a call
- `POST /api/calls/:callId/reject` - Reject a call
- `POST /api/calls/:callId/end` - End a call
- `GET /api/calls/status/:callId` - Get call status
- `GET /api/calls/active` - Get user's active call
- `GET /api/calls/debug/all` - Get all calls (debug)

### Messages (Limited)
- `GET /api/messages` - Info about message limitations

## 🧪 Testing with Postman

### 1. Authentication Test
```bash
# Register
POST http://localhost:3000/api/auth/register
{
  "email": "test@example.com",
  "password": "password123",
  "username": "TestUser",
  "avatar": "https://example.com/avatar.jpg"
}

# Login
POST http://localhost:3000/api/auth/login
{
  "email": "test@example.com",
  "password": "password123"
}
```

### 2. Media Upload Test
```bash
# Upload media
POST http://localhost:3000/api/media/upload
Headers: Authorization: Bearer YOUR_JWT_TOKEN
Body: form-data
- Key: media
- Type: File
- Value: [Select image/video file]
```

### 3. File Management Test
```bash
# Get file info
GET http://localhost:3000/api/media/info/{userId}/{filename}

# Delete file
DELETE http://localhost:3000/api/media/delete/{userId}/{filename}
```

### 4. Audio/Video Call Test
```bash
# Initiate call
POST http://localhost:3000/api/calls/initiate
{
  "calleeId": "other-user-uid",
  "callType": "audio"
}

# Accept call
POST http://localhost:3000/api/calls/{callId}/accept

# Get call status
GET http://localhost:3000/api/calls/status/{callId}

# End call
POST http://localhost:3000/api/calls/{callId}/end
```

## 📁 Project Structure

```
elexistech-backend/
├── config/
│   ├── database.js          # Firebase configuration
│   └── supabase.js          # Supabase configuration
├── src/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── mediaController.js
│   │   └── callController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── upload.js
│   ├── models/
│   │   ├── User.js
│   │   └── Call.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── media.js
│   │   ├── calls.js
│   │   └── messages.js (limited)
│   └── services/
│       ├── authService.js
│       ├── mediaService.js
│       └── callService.js
├── index.js
├── package.json
└── README.md
```

## 🔒 Security Features

- **JWT Authentication** for all protected routes
- **File type validation** to prevent malicious uploads
- **File size limits** to prevent abuse
- **Agora token security** for call authentication
- **Input validation** with Joi
- **CORS protection** and security headers

## 🚀 Performance Features

- **Image compression** with Sharp
- **Efficient file storage** with Supabase
- **In-memory account caching** for fast switching
- **Optimized file processing** pipeline
- **Real-time call management** with Agora
- **Efficient token generation** for calls

## 📝 Notes for Job Test

### What Works Perfectly
1. **Authentication system** - Complete with multi-account support
2. **Media upload** - Full functionality with validation and processing
3. **File management** - Upload, info retrieval, deletion
4. **Audio/Video calls** - Complete call flow with Agora integration
5. **Call management** - Initiate, accept, reject, end calls
6. **API design** - Clean, RESTful endpoints
7. **Error handling** - Comprehensive error responses

### What Would Work with Full Access
1. **Message storage** - Would save media URLs in Firestore messages
2. **Chat functionality** - Would create and manage chat rooms
3. **Real-time messaging** - Would implement WebSocket connections
4. **Media sharing** - Would display media in chat bubbles

### Technical Decisions
- **Supabase over Firebase Storage** - Better free tier for job test
- **Agora SDK over WebRTC** - Faster implementation, production-ready
- **In-memory account storage** - Faster than database queries
- **In-memory call storage** - Efficient for job test scope
- **Modular architecture** - Easy to extend and maintain
- **Comprehensive error handling** - Production-ready code

## 🤝 Contributing

This is a job test project. The codebase is designed to demonstrate:
- Backend API development skills
- Authentication implementation
- File upload and processing
- Real-time communication (audio/video calls)
- Clean, maintainable code structure
- Problem-solving with limited resources

## 🎯 Call Flow Example

### Complete Call Flow:
1. **User A initiates call** → `POST /api/calls/initiate`
2. **System generates Agora token** → Returns channel name + token
3. **User B receives call notification** → Check `/api/calls/active`
4. **User B accepts call** → `POST /api/calls/{callId}/accept`
5. **Both users join Agora channel** → Use tokens in mobile app
6. **Audio/Video connection established** → Agora handles WebRTC
7. **Call ends** → `POST /api/calls/{callId}/end`

### Mobile Integration:
- Use **Agora SDK** for iOS/Android
- Pass **channel name** and **token** to Agora
- Implement call UI (incoming/outgoing screens)
- Handle call states and notifications

## 📄 AUTHOR

NOAH LUCKY
