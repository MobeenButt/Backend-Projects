# 🎥 Video Platform Backend

A complete, production-ready YouTube-like video platform backend built with Node.js, Express, MongoDB, and Cloudinary.

## 🌟 Features

### Phase 1-2: Foundation ✅
- User authentication (Register, Login, Logout)
- JWT token management (Access & Refresh tokens)
- Profile management (Avatar, Cover Image)
- Password management

### Phase 3: Video Management ✅
- Video upload with Cloudinary integration
- Video CRUD operations
- Video search and filtering
- Pagination and sorting
- Views tracking
- Publish/Unpublish videos

### Phase 4: Engagement ✅
- Like/Unlike system (Videos, Comments, Tweets)
- Comments system (Add, Update, Delete)
- Subscribe/Unsubscribe to channels
- Get subscribers and subscriptions lists

### Phase 5: Advanced Features ✅
- Playlist management (Create, Update, Delete)
- Add/Remove videos from playlists
- Watch history tracking
- Community posts (Tweets)
- Advanced search with filters

### Phase 6: Analytics & Dashboard ✅
- Channel statistics (views, subscribers, likes)
- Subscriber growth analytics
- Video performance metrics
- Engagement rate calculations
- Watch history management

## 🛠️ Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT (jsonwebtoken)
- **File Upload:** Multer + Cloudinary
- **Password Hashing:** bcryptjs
- **Environment:** dotenv
- **Dev Tools:** Nodemon, Prettier

## 📁 Project Structure

```
├── src/
│   ├── controllers/        # Request handlers
│   │   ├── user.controller.js
│   │   ├── video.controller.js
│   │   ├── like.controller.js
│   │   ├── comment.controller.js
│   │   ├── subscription.controller.js
│   │   ├── playlist.controller.js
│   │   ├── tweet.controller.js
│   │   └── dashboard.controller.js
│   ├── models/            # Database models
│   │   ├── user.model.js
│   │   ├── video.model.js
│   │   ├── likes.model.js
│   │   ├── comments.model.js
│   │   ├── subscription.model.js
│   │   ├── playlists.model.js
│   │   └── tweets.model.js
│   ├── routes/            # API routes
│   │   ├── user.routes.js
│   │   ├── video.routes.js
│   │   ├── like.routes.js
│   │   ├── comment.routes.js
│   │   ├── subscription.routes.js
│   │   ├── playlist.routes.js
│   │   ├── tweet.routes.js
│   │   └── dashboard.routes.js
│   ├── middlewares/       # Custom middlewares
│   │   ├── auth.middleware.js
│   │   ├── multer.middleware.js
│   │   └── errorHandler.middleware.js
│   ├── utils/            # Utility functions
│   │   ├── asyncHandler.js
│   │   ├── ApiError.js
│   │   ├── ApiResponse.js
│   │   └── cloudinary.js
│   ├── db/               # Database connection
│   ├── app.js           # Express app setup
│   └── index.js         # Entry point
├── public/temp/         # Temporary file storage
├── .env                 # Environment variables
├── API_DOCUMENTATION.md # Complete API docs
├── QUICK_REFERENCE.md   # Quick reference guide
├── test.http           # API testing file
└── package.json

```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- Cloudinary account

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd Project
```

2. Install dependencies
```bash
npm install
```

3. Create `.env` file
```env
PORT=8000
MONGODB_URI=mongodb://localhost:27017/videoPlatform
CORS_ORIGIN=*

ACCESS_TOKEN_SECRET=your-secret-key-here
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your-refresh-secret-key
REFRESH_TOKEN_EXPIRY=10d

CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

4. Start the server
```bash
# Development mode
npm run dev

# Production mode
npm start
```

Server will run on `http://localhost:8000`

## 📡 API Endpoints

### Base URL: `/api/v1`

### Authentication
- `POST /users/register` - Register new user
- `POST /users/login` - Login user
- `POST /users/logout` - Logout user
- `POST /users/refresh-token` - Refresh access token

### Videos
- `POST /videos` - Upload video
- `GET /videos` - Get all videos (with filters)
- `GET /videos/:videoId` - Get single video
- `PATCH /videos/:videoId` - Update video
- `DELETE /videos/:videoId` - Delete video
- `POST /videos/:videoId/views` - Increment views

### Likes
- `POST /likes/toggle/v/:videoId` - Like/unlike video
- `POST /likes/toggle/c/:commentId` - Like/unlike comment
- `POST /likes/toggle/t/:tweetId` - Like/unlike tweet
- `GET /likes/videos` - Get liked videos

### Comments
- `POST /comments/:videoId` - Add comment
- `GET /comments/:videoId` - Get video comments
- `PATCH /comments/c/:commentId` - Update comment
- `DELETE /comments/c/:commentId` - Delete comment

### Subscriptions
- `POST /subscriptions/c/:channelId` - Subscribe/unsubscribe
- `GET /subscriptions/c/:channelId` - Get subscribers
- `GET /subscriptions/u/:subscriberId` - Get subscriptions

### Playlists
- `POST /playlists` - Create playlist
- `GET /playlists/user/:userId` - Get user playlists
- `GET /playlists/:playlistId` - Get playlist
- `PATCH /playlists/:playlistId` - Update playlist
- `DELETE /playlists/:playlistId` - Delete playlist
- `PATCH /playlists/add/:playlistId/:videoId` - Add video
- `PATCH /playlists/remove/:playlistId/:videoId` - Remove video

### Tweets (Community Posts)
- `POST /tweets` - Create tweet
- `GET /tweets` - Get all tweets
- `GET /tweets/user/:userId` - Get user tweets
- `PATCH /tweets/:tweetId` - Update tweet
- `DELETE /tweets/:tweetId` - Delete tweet

### Dashboard
- `GET /dashboard/stats` - Channel statistics
- `GET /dashboard/videos` - Channel videos
- `GET /dashboard/subscribers/analytics` - Subscriber analytics
- `GET /dashboard/videos/analytics` - Video analytics
- `GET /dashboard/history` - Watch history
- `DELETE /dashboard/history` - Clear watch history

## 📖 Documentation

- **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)** - Complete API documentation with examples and core concepts
- **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** - Quick reference guide with common operations
- **[test.http](./test.http)** - API testing file for VS Code REST Client

## 🧪 Testing

1. Install REST Client extension in VS Code
2. Open `test.http`
3. Update variables at the top
4. Click "Send Request" above each endpoint

Or use Postman/Thunder Client/Insomnia with the documented endpoints.

## 🔑 Key Concepts

### asyncHandler
Wraps async functions to automatically catch errors.

### ApiResponse
Standardized response format for all endpoints.

### ApiError
Custom error class for consistent error handling.

### JWT Authentication
- Access tokens (short-lived)
- Refresh tokens (long-lived)
- Cookie-based storage

### File Upload Flow
Multer → Temporary Storage → Cloudinary → URL → Database

### MongoDB Aggregation
Complex queries with joins, filtering, sorting, and pagination.

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- HTTP-only cookies
- CORS configuration
- Input validation
- Owner-based authorization
- Cloudinary secure uploads

## 📊 Database Models

### User
- Authentication & profile
- Watch history
- Relationships with all content

### Video
- Video metadata
- Owner reference
- Views tracking
- Publish status

### Like (Polymorphic)
- Videos, Comments, Tweets
- User reference
- Timestamps

### Comment
- Video reference
- Owner reference
- Content

### Subscription
- Subscriber-Channel relationship
- Unique constraint

### Playlist
- Video collection
- Owner reference
- Video array

### Tweet
- Community posts
- Owner reference
- Content

## 🎯 Features Implemented

✅ User registration & authentication  
✅ Video upload, update, delete  
✅ Video search & filtering  
✅ Like/unlike system  
✅ Comments CRUD  
✅ Subscribe/unsubscribe  
✅ Playlists management  
✅ Watch history  
✅ Community posts (tweets)  
✅ Channel analytics  
✅ Subscriber analytics  
✅ Video performance metrics  

## 🚧 Future Enhancements

- [ ] Video recommendations algorithm
- [ ] Real-time notifications
- [ ] Live streaming support
- [ ] Video transcoding
- [ ] Advanced search with Elasticsearch
- [ ] Rate limiting
- [ ] Caching with Redis
- [ ] Email verification
- [ ] Social media integration
- [ ] Video quality options
- [ ] Closed captions
- [ ] Monetization features

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

ISC

## 👨‍💻 Author

**Mobeen Butt**

---

**Note:** This is an educational project demonstrating backend development with Node.js, Express, and MongoDB. For production use, additional security measures and optimizations should be implemented. 