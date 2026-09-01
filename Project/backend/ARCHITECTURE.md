# 🏗️ Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT                               │
│  (Browser, Mobile App, Postman, etc.)                       │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP/HTTPS Requests
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                      EXPRESS SERVER                          │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                    MIDDLEWARES                        │  │
│  │  • cors()          • express.json()                  │  │
│  │  • cookieParser()  • express.urlencoded()            │  │
│  │  • express.static() • errorHandler()                 │  │
│  └──────────────────────────────────────────────────────┘  │
│                         │                                    │
│                         ▼                                    │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                     ROUTERS                           │  │
│  │  /api/v1/users        /api/v1/videos                 │  │
│  │  /api/v1/likes        /api/v1/comments               │  │
│  │  /api/v1/subscriptions /api/v1/playlists            │  │
│  │  /api/v1/tweets       /api/v1/dashboard              │  │
│  └──────────────────────────────────────────────────────┘  │
│                         │                                    │
│                         ▼                                    │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              AUTHENTICATION MIDDLEWARE                │  │
│  │  • verifyJWT (required auth)                         │  │
│  │  • verifyJWTOptional (optional auth)                 │  │
│  └──────────────────────────────────────────────────────┘  │
│                         │                                    │
│                         ▼                                    │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                   CONTROLLERS                         │  │
│  │  • Business Logic                                     │  │
│  │  • Request Validation                                 │  │
│  │  • Response Formatting                                │  │
│  └──────────────────────────────────────────────────────┘  │
│                         │                                    │
└─────────────────────────┼────────────────────────────────────┘
                          │
              ┌───────────┴───────────┐
              ▼                       ▼
┌──────────────────────┐  ┌─────────────────────┐
│      MONGODB         │  │    CLOUDINARY       │
│   (Database)         │  │  (File Storage)     │
│                      │  │                     │
│  • users             │  │  • Videos           │
│  • videos            │  │  • Thumbnails       │
│  • likes             │  │  • Avatars          │
│  • comments          │  │  • Cover Images     │
│  • subscriptions     │  │                     │
│  • playlists         │  └─────────────────────┘
│  • tweets            │
└──────────────────────┘
```

---

## Request Flow

### 1. Authentication Flow
```
User → Register → Password Hashed → User Created
                                           ↓
User → Login → Credentials Verified → JWT Generated
                                           ↓
                    Access Token (1 day) + Refresh Token (10 days)
                                           ↓
                              Cookies Set in Response
                                           ↓
Subsequent Requests → Authorization Header/Cookie → JWT Verified
                                           ↓
                           User Object Attached to req.user
```

### 2. Video Upload Flow
```
Client → Form Data (title, description, videoFile, thumbnail)
            ↓
         Multer Middleware
            ↓
    Save to /public/temp
            ↓
    Upload to Cloudinary
            ↓
  Get URL + Duration
            ↓
  Save to MongoDB
            ↓
  Delete Temp Files
            ↓
   Return Response
```

### 3. Like Toggle Flow
```
Client → POST /likes/toggle/v/:videoId
            ↓
     Verify JWT
            ↓
Check if Like Exists
     ↙          ↘
  Yes           No
   ↓             ↓
Delete Like   Create Like
   ↓             ↓
isLiked:false isLiked:true
```

### 4. Aggregation Query Flow
```
GET /videos?query=javascript&sortBy=views
            ↓
  Build Match Conditions
            ↓
  Create Aggregation Pipeline
    • $match (filter)
    • $lookup (join users)
    • $unwind (flatten owner)
    • $sort (sort results)
    • $skip/$limit (pagination)
            ↓
  Execute Aggregation
            ↓
  Return Paginated Results
```

---

## Data Flow Diagrams

### Video Creation & Retrieval
```
┌────────┐    POST /videos    ┌────────────┐
│ Client │ ─────────────────> │ Controller │
└────────┘                     └──────┬─────┘
                                      │
                           1. Validate Data
                                      │
                           2. Upload Files ──────> Cloudinary
                                      │                 │
                                      │ <───────────────┘
                           3. Create Document    (URLs)
                                      │
                                      ▼
                               ┌──────────┐
                               │ MongoDB  │
                               └────┬─────┘
                                    │
GET /videos                         │
┌────────┐                          │
│ Client │ ◄────────────────────────┘
└────────┘      (Video List)
```

### Engagement Flow (Likes, Comments, Subscriptions)
```
         Like Video                Comment on Video
            ↓                            ↓
    Toggle Pattern               Create Comment
            ↓                            ↓
    Check Existing               Save to DB
      ↙        ↘                        ↓
   Delete    Create            Link to Video
            ↓                            ↓
    Update Video Stats         Update Video Stats
            ↓                            ↓
       Response                     Response
```

---

## Database Schema Relationships

```
┌──────────────┐
│     User     │
│──────────────│
│ _id          │◄─────┐
│ username     │      │
│ email        │      │
│ password     │      │ owner
│ watchHistory │──┐   │
└──────────────┘  │   │
                  │   │
┌─────────────────┼───┼────────────────────────┐
│                 │   │                        │
│                 ▼   │                        │
│           ┌──────────────┐                   │
│           │    Video     │                   │
│           │──────────────│                   │
│           │ _id          │◄──────┐           │
│           │ title        │       │           │
│           │ videoFile    │       │ video     │
│           │ thumbnail    │       │           │
│           │ views        │       │           │
│           │ owner        │───────┘           │
│           └──────────────┘                   │
│                 │                            │
│      ┌──────────┼──────────┐                │
│      │          │          │                │
│      ▼          ▼          ▼                │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐        │
│ │  Like   │ │Comment  │ │Playlist │        │
│ └─────────┘ └─────────┘ └─────────┘        │
│                                             │
│           ┌──────────────┐                  │
│           │Subscription  │                  │
│           │──────────────│                  │
│           │ subscriber   │──────────────────┘
│           │ channel      │──────────────────┐
│           └──────────────┘                  │
│                                             │
└─────────────────────────────────────────────┘
```

---

## Middleware Chain

```
Request Received
      ↓
┌─────────────────┐
│ Global Middleware│
│ • cors()         │
│ • express.json() │
│ • cookieParser() │
└────────┬─────────┘
         ↓
┌─────────────────┐
│ Route Matching  │
│ /api/v1/videos  │
└────────┬─────────┘
         ↓
┌─────────────────┐
│Authentication   │
│ verifyJWT()     │ ─── If no token ──> 401 Error
└────────┬─────────┘
         ↓ (req.user attached)
┌─────────────────┐
│ File Upload     │
│ multer.fields() │ (if needed)
└────────┬─────────┘
         ↓
┌─────────────────┐
│  Controller     │
│ Business Logic  │
└────────┬─────────┘
         ↓
┌─────────────────┐
│  Response Sent  │
│ ApiResponse()   │
└─────────────────┘
         │
         │ (If error thrown)
         ↓
┌─────────────────┐
│ Error Handler   │
│ errorHandler()  │
└────────┬─────────┘
         ↓
┌─────────────────┐
│ Error Response  │
│ ApiError()      │
└─────────────────┘
```

---

## Technology Stack Layers

```
┌─────────────────────────────────────────┐
│          PRESENTATION LAYER              │
│  (Not in this project - Frontend)       │
└─────────────────────────────────────────┘
                    ↕
┌─────────────────────────────────────────┐
│          APPLICATION LAYER               │
│  • Express.js (Web Framework)           │
│  • Controllers (Business Logic)         │
│  • Routes (API Endpoints)               │
│  • Middlewares (Request Processing)     │
└─────────────────────────────────────────┘
                    ↕
┌─────────────────────────────────────────┐
│           SERVICE LAYER                  │
│  • Authentication (JWT)                  │
│  • File Upload (Multer + Cloudinary)    │
│  • Validation (Custom + Mongoose)       │
│  • Error Handling (Custom Classes)      │
└─────────────────────────────────────────┘
                    ↕
┌─────────────────────────────────────────┐
│            DATA LAYER                    │
│  • MongoDB (Database)                    │
│  • Mongoose (ODM)                        │
│  • Models (Schema Definitions)           │
│  • Aggregation (Complex Queries)         │
└─────────────────────────────────────────┘
                    ↕
┌─────────────────────────────────────────┐
│         EXTERNAL SERVICES                │
│  • Cloudinary (File Storage)             │
│  • MongoDB Atlas (Cloud DB - optional)   │
└─────────────────────────────────────────┘
```

---

## Security Layers

```
┌─────────────────────────────────────────┐
│         CLIENT REQUEST                   │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│    LAYER 1: CORS Protection              │
│    • Origin validation                   │
│    • Credentials handling                │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│    LAYER 2: JWT Authentication           │
│    • Token verification                  │
│    • User identification                 │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│    LAYER 3: Authorization                │
│    • Ownership verification              │
│    • Permission checks                   │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│    LAYER 4: Input Validation             │
│    • Required fields                     │
│    • Data types                          │
│    • ObjectId format                     │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│    LAYER 5: Business Logic               │
│    • Duplicate checks                    │
│    • Resource existence                  │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│         SECURE RESPONSE                  │
│    • No sensitive data exposure          │
│    • Standardized format                 │
└─────────────────────────────────────────┘
```

---

## File Structure Organization

```
Project Root
│
├── src/                          (Source code)
│   ├── controllers/              (Request handlers)
│   │   ├── user.controller.js
│   │   ├── video.controller.js
│   │   ├── like.controller.js
│   │   ├── comment.controller.js
│   │   ├── subscription.controller.js
│   │   ├── playlist.controller.js
│   │   ├── tweet.controller.js
│   │   └── dashboard.controller.js
│   │
│   ├── models/                   (Database schemas)
│   │   ├── user.model.js
│   │   ├── video.model.js
│   │   ├── likes.model.js
│   │   ├── comments.model.js
│   │   ├── subscription.model.js
│   │   ├── playlists.model.js
│   │   └── tweets.model.js
│   │
│   ├── routes/                   (API endpoints)
│   │   ├── user.routes.js
│   │   ├── video.routes.js
│   │   ├── like.routes.js
│   │   ├── comment.routes.js
│   │   ├── subscription.routes.js
│   │   ├── playlist.routes.js
│   │   ├── tweet.routes.js
│   │   └── dashboard.routes.js
│   │
│   ├── middlewares/              (Request processors)
│   │   ├── auth.middleware.js
│   │   ├── multer.middleware.js
│   │   └── errorHandler.middleware.js
│   │
│   ├── utils/                    (Helper functions)
│   │   ├── asyncHandler.js
│   │   ├── ApiError.js
│   │   ├── ApiResponse.js
│   │   ├── cloudinary.js
│   │   └── fileHandler.js
│   │
│   ├── db/                       (Database config)
│   │   └── index.js
│   │
│   ├── app.js                    (Express setup)
│   └── index.js                  (Entry point)
│
├── public/                       (Static files)
│   └── temp/                     (Temporary uploads)
│
├── Documentation/
│   ├── API_DOCUMENTATION.md      (Complete API docs)
│   ├── QUICK_REFERENCE.md        (Quick lookup)
│   ├── IMPLEMENTATION_SUMMARY.md (What was built)
│   └── ARCHITECTURE.md           (This file)
│
├── test.http                     (API tests)
├── .env                          (Environment variables)
├── .gitignore                    (Git ignore rules)
├── package.json                  (Dependencies)
└── README.md                     (Project overview)
```

---

## API Endpoint Organization

```
/api/v1
│
├── /users                        (Authentication & Profile)
│   ├── POST   /register
│   ├── POST   /login
│   ├── POST   /logout
│   ├── POST   /refresh-token
│   ├── GET    /current
│   ├── POST   /change-password
│   └── PATCH  /update-account
│
├── /videos                       (Video Management)
│   ├── POST   /
│   ├── GET    /
│   ├── GET    /:videoId
│   ├── PATCH  /:videoId
│   ├── DELETE /:videoId
│   ├── PATCH  /:videoId/toggle-publish
│   └── POST   /:videoId/views
│
├── /likes                        (Engagement - Likes)
│   ├── POST   /toggle/v/:videoId
│   ├── POST   /toggle/c/:commentId
│   ├── POST   /toggle/t/:tweetId
│   └── GET    /videos
│
├── /comments                     (Engagement - Comments)
│   ├── POST   /:videoId
│   ├── GET    /:videoId
│   ├── PATCH  /c/:commentId
│   └── DELETE /c/:commentId
│
├── /subscriptions                (Engagement - Subscriptions)
│   ├── POST   /c/:channelId
│   ├── GET    /c/:channelId
│   └── GET    /u/:subscriberId
│
├── /playlists                    (Content Organization)
│   ├── POST   /
│   ├── GET    /user/:userId
│   ├── GET    /:playlistId
│   ├── PATCH  /:playlistId
│   ├── DELETE /:playlistId
│   ├── PATCH  /add/:playlistId/:videoId
│   └── PATCH  /remove/:playlistId/:videoId
│
├── /tweets                       (Community Posts)
│   ├── POST   /
│   ├── GET    /
│   ├── GET    /user/:userId
│   ├── PATCH  /:tweetId
│   └── DELETE /:tweetId
│
└── /dashboard                    (Analytics)
    ├── GET    /stats
    ├── GET    /videos
    ├── GET    /subscribers/analytics
    ├── GET    /videos/analytics
    ├── GET    /history
    └── DELETE /history
```

---

## Design Patterns Used

### 1. MVC Pattern (Modified)
```
Model (MongoDB Schema)
  ↕
Controller (Business Logic)
  ↕
View (JSON Response)
```

### 2. Middleware Pattern
```
Request → Middleware Chain → Controller → Response
```

### 3. Factory Pattern
```javascript
// asyncHandler wraps controllers
asyncHandler(controllerFunction)
```

### 4. Strategy Pattern
```javascript
// Different authentication strategies
verifyJWT vs verifyJWTOptional
```

### 5. Repository Pattern
```javascript
// Mongoose models act as repositories
User.findById(), Video.aggregate()
```

### 6. Singleton Pattern
```javascript
// Database connection
export const connectDB = () => { ... }
```

---

## Scalability Considerations

### Current Implementation:
- ✅ Modular architecture
- ✅ Separate concerns (MVC)
- ✅ Reusable utilities
- ✅ Pagination for large datasets
- ✅ Indexed queries

### Future Enhancements:
- 🔄 Redis caching layer
- 🔄 Load balancing
- 🔄 Database sharding
- 🔄 CDN for static files
- 🔄 Message queues
- 🔄 Microservices architecture

---

## Performance Optimization Points

### Database Level:
```
1. Indexes on frequently queried fields
   - user.email, user.username
   - video.owner, video.isPublished
   - subscription (subscriber, channel)

2. Aggregation pipeline optimization
   - Early $match to filter
   - $project to limit fields
   - Indexes for $lookup

3. Connection pooling
   - Mongoose default pool
```

### Application Level:
```
1. Pagination
   - Prevents large data loads
   - Configurable limits

2. Selective population
   - Only fetch needed fields
   - Avoid circular references

3. Async operations
   - Non-blocking I/O
   - Promise-based
```

### File Storage:
```
1. Cloudinary
   - CDN distribution
   - Auto optimization
   - Format conversion
   - Lazy loading
```

---

**This architecture provides a solid foundation for a scalable video platform! 🚀**
