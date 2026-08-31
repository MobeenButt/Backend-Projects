# 🎥 Video Platform API Documentation

Complete API documentation for a YouTube-like video platform backend built with Node.js, Express, MongoDB, and Cloudinary.

## 📋 Table of Contents

- [Overview](#overview)
- [Core Concepts](#core-concepts)
- [Phase 3: Video Management](#phase-3-video-management)
- [Phase 4: Engagement](#phase-4-engagement)
- [Phase 5: Advanced Features](#phase-5-advanced-features)
- [Phase 6: Analytics & Dashboard](#phase-6-analytics--dashboard)
- [Testing Guide](#testing-guide)

---

## 🎯 Overview

This API provides a complete backend solution for a video-sharing platform with features including:

- **User Management**: Registration, login, profile management
- **Video Management**: Upload, update, delete, view videos
- **Engagement**: Likes, comments, subscriptions
- **Advanced Features**: Playlists, watch history, community posts (tweets)
- **Analytics**: Channel statistics, subscriber analytics, video performance

### Base URL
```
http://localhost:8000/api/v1
```

### Authentication
Most endpoints require JWT authentication via:
- Cookie: `accessToken`
- Header: `Authorization: Bearer <token>`

---

## 🧠 Core Concepts

### 1. **Asynchronous Request Handling**

**asyncHandler** - A utility wrapper that catches errors in async functions and passes them to Express error middleware.

```javascript
const asyncHandler = (fn) => async (req, res, next) => {
  try {
    await fn(req, res, next);
  } catch (error) {
    next(error);
  }
};
```

**Why?** Eliminates try-catch blocks in every controller, centralizes error handling.

### 2. **API Response Pattern**

**ApiResponse** - Standardized response structure for all API endpoints.

```javascript
class ApiResponse {
  constructor(statusCode, data, message = "Success") {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;
  }
}
```

**Example Usage:**
```javascript
return res.status(200).json(
  new ApiResponse(200, userData, "User fetched successfully")
);
```

### 3. **Error Handling**

**ApiError** - Custom error class extending JavaScript Error.

```javascript
class ApiError extends Error {
  constructor(statusCode, message, errors = [], stack = "") {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.success = false;
  }
}
```

**Usage:**
```javascript
if (!video) {
  throw new ApiError(404, "Video not found");
}
```

### 4. **Authentication Middleware**

**verifyJWT** - Validates JWT token and attaches user to request.

```javascript
export const verifyJWT = async (req, res, next) => {
  const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
  
  if (!token) throw new ApiError(401, "Unauthorized");
  
  const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  const user = await User.findById(decoded._id).select("-password -refreshToken");
  
  req.user = user;
  next();
};
```

**verifyJWTOptional** - Like verifyJWT but doesn't fail if no token (for public + private content).

### 5. **File Upload (Multer + Cloudinary)**

**Multer** - Handles multipart/form-data for file uploads.
**Cloudinary** - Cloud storage for videos, images, thumbnails.

**Flow:**
1. Multer saves file temporarily to `/public/temp`
2. Cloudinary uploads from local path
3. Returns secure URL
4. Local temp file is deleted

```javascript
const uploadOnCloudinary = async (localFilePath) => {
  const result = await cloudinary.uploader.upload(localFilePath, {
    resource_type: "auto",
  });
  fs.unlinkSync(localFilePath); // Delete temp file
  return result;
};
```

### 6. **MongoDB Aggregation Pipeline**

Used for complex queries with joins, filtering, sorting, and pagination.

**Example: Get video with owner details and likes count**
```javascript
const video = await Video.aggregate([
  { $match: { _id: new mongoose.Types.ObjectId(videoId) } },
  {
    $lookup: {
      from: "users",
      localField: "owner",
      foreignField: "_id",
      as: "owner",
    }
  },
  { $unwind: "$owner" },
  {
    $lookup: {
      from: "likes",
      localField: "_id",
      foreignField: "video",
      as: "likes",
    }
  },
  { $addFields: { likesCount: { $size: "$likes" } } },
]);
```

**Pipeline Stages:**
- `$match`: Filter documents
- `$lookup`: Join collections (like SQL JOIN)
- `$unwind`: Deconstruct array field
- `$addFields`: Add computed fields
- `$project`: Select/exclude fields
- `$sort`: Sort results
- `$skip` / `$limit`: Pagination

### 7. **Pagination**

**mongoose-aggregate-paginate-v2** - Plugin for paginated aggregation results.

```javascript
const options = {
  page: parseInt(page),
  limit: parseInt(limit),
};

const videos = await Video.aggregatePaginate(aggregate, options);
```

**Response:**
```json
{
  "docs": [...],
  "totalDocs": 100,
  "limit": 10,
  "page": 1,
  "totalPages": 10,
  "hasNextPage": true,
  "hasPrevPage": false
}
```

---

## 📹 Phase 3: Video Management

### Upload Video

**Endpoint:** `POST /api/v1/videos`  
**Auth:** Required  
**Content-Type:** `multipart/form-data`

**Request Body:**
```javascript
{
  title: "My First Video",
  description: "This is an amazing video about coding",
  videoFile: <File>,      // Video file (MP4, AVI, etc.)
  thumbnail: <File>       // Thumbnail image (JPG, PNG)
}
```

**Response:**
```json
{
  "statusCode": 201,
  "data": {
    "_id": "64abc123...",
    "videoFile": "https://cloudinary.com/...",
    "thumbnail": "https://cloudinary.com/...",
    "title": "My First Video",
    "description": "This is an amazing video about coding",
    "duration": 125.5,
    "views": 0,
    "isPublished": true,
    "owner": "64xyz789...",
    "createdAt": "2026-01-15T10:30:00.000Z",
    "updatedAt": "2026-01-15T10:30:00.000Z"
  },
  "message": "Video uploaded successfully",
  "success": true
}
```

**Key Concepts:**
- Uses `multer` to handle multipart form data
- Uploads both video and thumbnail to Cloudinary
- Cloudinary provides duration automatically
- Owner is automatically set from JWT token

---

### Get All Videos

**Endpoint:** `GET /api/v1/videos`  
**Auth:** Not Required  
**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 10)
- `query` (search in title/description)
- `sortBy` (default: "createdAt")
- `sortType` ("asc" or "desc", default: "desc")
- `userId` (filter by owner)

**Example Request:**
```
GET /api/v1/videos?page=1&limit=10&query=javascript&sortBy=views&sortType=desc
```

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "docs": [
      {
        "_id": "64abc123...",
        "videoFile": "https://cloudinary.com/...",
        "thumbnail": "https://cloudinary.com/...",
        "title": "JavaScript Tutorial",
        "description": "Learn JavaScript basics",
        "duration": 600,
        "views": 1500,
        "isPublished": true,
        "owner": {
          "_id": "64xyz789...",
          "username": "johndoe",
          "fullName": "John Doe",
          "avatar": "https://cloudinary.com/..."
        },
        "createdAt": "2026-01-10T08:00:00.000Z"
      }
    ],
    "totalDocs": 25,
    "limit": 10,
    "page": 1,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPrevPage": false
  },
  "message": "Videos fetched successfully",
  "success": true
}
```

**Key Concepts:**
- Uses MongoDB aggregation for complex queries
- `$lookup` joins with users collection for owner details
- Case-insensitive search using regex
- Pagination using `mongoose-aggregate-paginate-v2`

---

### Get Single Video

**Endpoint:** `GET /api/v1/videos/:videoId`  
**Auth:** Not Required

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "_id": "64abc123...",
    "videoFile": "https://cloudinary.com/...",
    "thumbnail": "https://cloudinary.com/...",
    "title": "JavaScript Tutorial",
    "description": "Learn JavaScript basics",
    "duration": 600,
    "views": 1500,
    "isPublished": true,
    "owner": {
      "_id": "64xyz789...",
      "username": "johndoe",
      "fullName": "John Doe",
      "avatar": "https://cloudinary.com/...",
      "coverImage": "https://cloudinary.com/..."
    },
    "likesCount": 45,
    "createdAt": "2026-01-10T08:00:00.000Z",
    "updatedAt": "2026-01-10T08:00:00.000Z"
  },
  "message": "Video fetched successfully",
  "success": true
}
```

---

### Update Video

**Endpoint:** `PATCH /api/v1/videos/:videoId`  
**Auth:** Required (Owner only)  
**Content-Type:** `multipart/form-data` (if updating thumbnail) or `application/json`

**Request Body:**
```javascript
{
  title: "Updated Title",
  description: "Updated description",
  thumbnail: <File>  // Optional
}
```

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "_id": "64abc123...",
    "title": "Updated Title",
    "description": "Updated description",
    "thumbnail": "https://cloudinary.com/new-thumbnail.jpg",
    ...
  },
  "message": "Video updated successfully",
  "success": true
}
```

**Key Concepts:**
- Only video owner can update
- Old thumbnail is deleted from Cloudinary when updating
- Partial updates supported (only send fields to update)

---

### Delete Video

**Endpoint:** `DELETE /api/v1/videos/:videoId`  
**Auth:** Required (Owner only)

**Response:**
```json
{
  "statusCode": 200,
  "data": {},
  "message": "Video deleted successfully",
  "success": true
}
```

**Key Concepts:**
- Deletes video file and thumbnail from Cloudinary
- Removes document from MongoDB
- Authorization check ensures only owner can delete

---

### Toggle Publish Status

**Endpoint:** `PATCH /api/v1/videos/:videoId/toggle-publish`  
**Auth:** Required (Owner only)

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "_id": "64abc123...",
    "isPublished": false,
    ...
  },
  "message": "Video unpublished successfully",
  "success": true
}
```

---

### Increment Views

**Endpoint:** `POST /api/v1/videos/:videoId/views`  
**Auth:** Optional (adds to watch history if logged in)

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "views": 1501
  },
  "message": "View counted",
  "success": true
}
```

**Key Concepts:**
- Public endpoint (anyone can increment views)
- If user is logged in, adds video to watch history
- Uses `$inc` operator to increment atomically
- Uses `$addToSet` to prevent duplicate entries in watch history

---

## 💬 Phase 4: Engagement

### Like/Unlike Video

**Endpoint:** `POST /api/v1/likes/toggle/v/:videoId`  
**Auth:** Required

**Response (Liked):**
```json
{
  "statusCode": 201,
  "data": {
    "isLiked": true
  },
  "message": "Video liked successfully",
  "success": true
}
```

**Response (Unliked):**
```json
{
  "statusCode": 200,
  "data": {
    "isLiked": false
  },
  "message": "Video unliked successfully",
  "success": true
}
```

**Key Concepts:**
- Toggle mechanism: check if like exists, if yes delete, if no create
- Prevents duplicate likes (user can only like once)
- Same pattern for comments and tweets

---

### Like/Unlike Comment

**Endpoint:** `POST /api/v1/likes/toggle/c/:commentId`  
**Auth:** Required

---

### Like/Unlike Tweet

**Endpoint:** `POST /api/v1/likes/toggle/t/:tweetId`  
**Auth:** Required

---

### Get Liked Videos

**Endpoint:** `GET /api/v1/likes/videos`  
**Auth:** Required

**Response:**
```json
{
  "statusCode": 200,
  "data": [
    {
      "_id": "64like123...",
      "video": {
        "_id": "64abc123...",
        "title": "JavaScript Tutorial",
        "thumbnail": "https://cloudinary.com/...",
        "views": 1500,
        "duration": 600,
        "owner": {
          "username": "johndoe",
          "fullName": "John Doe",
          "avatar": "https://cloudinary.com/..."
        }
      },
      "createdAt": "2026-01-15T10:30:00.000Z"
    }
  ],
  "message": "Liked videos fetched successfully",
  "success": true
}
```

---

### Add Comment

**Endpoint:** `POST /api/v1/comments/:videoId`  
**Auth:** Required  
**Content-Type:** `application/json`

**Request Body:**
```json
{
  "content": "Great video! Really helpful."
}
```

**Response:**
```json
{
  "statusCode": 201,
  "data": {
    "_id": "64comment123...",
    "content": "Great video! Really helpful.",
    "video": "64abc123...",
    "owner": {
      "_id": "64xyz789...",
      "username": "johndoe",
      "fullName": "John Doe",
      "avatar": "https://cloudinary.com/..."
    },
    "createdAt": "2026-01-15T10:35:00.000Z",
    "updatedAt": "2026-01-15T10:35:00.000Z"
  },
  "message": "Comment added successfully",
  "success": true
}
```

---

### Get Video Comments

**Endpoint:** `GET /api/v1/comments/:videoId`  
**Auth:** Not Required  
**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 10)

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "docs": [
      {
        "_id": "64comment123...",
        "content": "Great video! Really helpful.",
        "video": "64abc123...",
        "owner": {
          "username": "johndoe",
          "fullName": "John Doe",
          "avatar": "https://cloudinary.com/..."
        },
        "likesCount": 5,
        "createdAt": "2026-01-15T10:35:00.000Z"
      }
    ],
    "totalDocs": 50,
    "limit": 10,
    "page": 1,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPrevPage": false
  },
  "message": "Comments fetched successfully",
  "success": true
}
```

**Key Concepts:**
- Uses aggregation to join with users and likes
- Calculates `likesCount` for each comment
- Sorted by newest first

---

### Update Comment

**Endpoint:** `PATCH /api/v1/comments/c/:commentId`  
**Auth:** Required (Owner only)

**Request Body:**
```json
{
  "content": "Updated comment text"
}
```

---

### Delete Comment

**Endpoint:** `DELETE /api/v1/comments/c/:commentId`  
**Auth:** Required (Owner only)

---

### Subscribe/Unsubscribe

**Endpoint:** `POST /api/v1/subscriptions/c/:channelId`  
**Auth:** Required

**Response (Subscribed):**
```json
{
  "statusCode": 201,
  "data": {
    "isSubscribed": true
  },
  "message": "Subscribed successfully",
  "success": true
}
```

**Response (Unsubscribed):**
```json
{
  "statusCode": 200,
  "data": {
    "isSubscribed": false
  },
  "message": "Unsubscribed successfully",
  "success": true
}
```

**Key Concepts:**
- Cannot subscribe to yourself
- Toggle mechanism like likes
- Unique index on (subscriber, channel) prevents duplicates

---

### Get Channel Subscribers

**Endpoint:** `GET /api/v1/subscriptions/c/:channelId`  
**Auth:** Not Required

**Response:**
```json
{
  "statusCode": 200,
  "data": [
    {
      "_id": "64sub123...",
      "subscriber": {
        "_id": "64user123...",
        "username": "johndoe",
        "fullName": "John Doe",
        "avatar": "https://cloudinary.com/..."
      },
      "createdAt": "2026-01-10T08:00:00.000Z"
    }
  ],
  "message": "Subscribers fetched successfully",
  "success": true
}
```

---

### Get Subscribed Channels

**Endpoint:** `GET /api/v1/subscriptions/u/:subscriberId`  
**Auth:** Not Required

**Response:**
```json
{
  "statusCode": 200,
  "data": [
    {
      "_id": "64sub123...",
      "channel": {
        "_id": "64channel123...",
        "username": "techguru",
        "fullName": "Tech Guru",
        "avatar": "https://cloudinary.com/...",
        "subscribersCount": 50000
      },
      "createdAt": "2026-01-10T08:00:00.000Z"
    }
  ],
  "message": "Subscribed channels fetched successfully",
  "success": true
}
```

**Key Concepts:**
- Uses nested aggregation to calculate subscriber count for each channel
- Sorted by subscription date (newest first)

---

## 🚀 Phase 5: Advanced Features

### Create Playlist

**Endpoint:** `POST /api/v1/playlists`  
**Auth:** Required

**Request Body:**
```json
{
  "name": "JavaScript Tutorials",
  "description": "Collection of JavaScript learning videos"
}
```

**Response:**
```json
{
  "statusCode": 201,
  "data": {
    "_id": "64playlist123...",
    "name": "JavaScript Tutorials",
    "description": "Collection of JavaScript learning videos",
    "owner": "64user123...",
    "videos": [],
    "createdAt": "2026-01-15T11:00:00.000Z",
    "updatedAt": "2026-01-15T11:00:00.000Z"
  },
  "message": "Playlist created successfully",
  "success": true
}
```

---

### Get User Playlists

**Endpoint:** `GET /api/v1/playlists/user/:userId`  
**Auth:** Not Required

**Response:**
```json
{
  "statusCode": 200,
  "data": [
    {
      "_id": "64playlist123...",
      "name": "JavaScript Tutorials",
      "description": "Collection of JavaScript learning videos",
      "totalVideos": 15,
      "firstVideoThumbnail": "https://cloudinary.com/...",
      "createdAt": "2026-01-15T11:00:00.000Z",
      "updatedAt": "2026-01-20T14:30:00.000Z"
    }
  ],
  "message": "Playlists fetched successfully",
  "success": true
}
```

**Key Concepts:**
- Shows thumbnail from first video in playlist
- Calculates total video count
- Sorted by last updated

---

### Get Playlist by ID

**Endpoint:** `GET /api/v1/playlists/:playlistId`  
**Auth:** Not Required

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "_id": "64playlist123...",
    "name": "JavaScript Tutorials",
    "description": "Collection of JavaScript learning videos",
    "owner": {
      "username": "johndoe",
      "fullName": "John Doe",
      "avatar": "https://cloudinary.com/..."
    },
    "videos": [
      {
        "_id": "64video123...",
        "title": "JS Basics",
        "thumbnail": "https://cloudinary.com/...",
        "duration": 600,
        "views": 1500,
        "owner": {
          "username": "techguru",
          "fullName": "Tech Guru",
          "avatar": "https://cloudinary.com/..."
        }
      }
    ],
    "totalVideos": 15,
    "createdAt": "2026-01-15T11:00:00.000Z",
    "updatedAt": "2026-01-20T14:30:00.000Z"
  },
  "message": "Playlist fetched successfully",
  "success": true
}
```

---

### Add Video to Playlist

**Endpoint:** `PATCH /api/v1/playlists/add/:playlistId/:videoId`  
**Auth:** Required (Owner only)

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "_id": "64playlist123...",
    "name": "JavaScript Tutorials",
    "videos": ["64video1...", "64video2...", "64video3..."],
    ...
  },
  "message": "Video added to playlist successfully",
  "success": true
}
```

**Key Concepts:**
- Checks if video already exists in playlist
- Updates `updatedAt` timestamp

---

### Remove Video from Playlist

**Endpoint:** `PATCH /api/v1/playlists/remove/:playlistId/:videoId`  
**Auth:** Required (Owner only)

---

### Update Playlist

**Endpoint:** `PATCH /api/v1/playlists/:playlistId`  
**Auth:** Required (Owner only)

**Request Body:**
```json
{
  "name": "Updated Playlist Name",
  "description": "Updated description"
}
```

---

### Delete Playlist

**Endpoint:** `DELETE /api/v1/playlists/:playlistId`  
**Auth:** Required (Owner only)

---

### Create Tweet (Community Post)

**Endpoint:** `POST /api/v1/tweets`  
**Auth:** Required

**Request Body:**
```json
{
  "content": "Just uploaded a new video about React hooks! Check it out!"
}
```

**Response:**
```json
{
  "statusCode": 201,
  "data": {
    "_id": "64tweet123...",
    "content": "Just uploaded a new video about React hooks! Check it out!",
    "owner": {
      "_id": "64user123...",
      "username": "johndoe",
      "fullName": "John Doe",
      "avatar": "https://cloudinary.com/..."
    },
    "createdAt": "2026-01-15T12:00:00.000Z",
    "updatedAt": "2026-01-15T12:00:00.000Z"
  },
  "message": "Tweet created successfully",
  "success": true
}
```

---

### Get All Tweets (Feed)

**Endpoint:** `GET /api/v1/tweets`  
**Auth:** Not Required  
**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 20)

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "docs": [
      {
        "_id": "64tweet123...",
        "content": "Just uploaded a new video about React hooks!",
        "owner": {
          "username": "johndoe",
          "fullName": "John Doe",
          "avatar": "https://cloudinary.com/..."
        },
        "likesCount": 25,
        "createdAt": "2026-01-15T12:00:00.000Z"
      }
    ],
    "totalDocs": 100,
    "page": 1,
    "limit": 20,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPrevPage": false
  },
  "message": "Tweets fetched successfully",
  "success": true
}
```

---

### Get User Tweets

**Endpoint:** `GET /api/v1/tweets/user/:userId`  
**Auth:** Not Required

---

### Update Tweet

**Endpoint:** `PATCH /api/v1/tweets/:tweetId`  
**Auth:** Required (Owner only)

---

### Delete Tweet

**Endpoint:** `DELETE /api/v1/tweets/:tweetId`  
**Auth:** Required (Owner only)

---

## 📊 Phase 6: Analytics & Dashboard

### Get Channel Statistics

**Endpoint:** `GET /api/v1/dashboard/stats`  
**Auth:** Required

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "totalVideos": 45,
    "totalViews": 125000,
    "totalSubscribers": 5000,
    "totalLikes": 8500
  },
  "message": "Channel statistics fetched successfully",
  "success": true
}
```

**Key Concepts:**
- Aggregates data from multiple collections
- Uses `$sum` to calculate total views
- Counts documents efficiently

---

### Get Channel Videos

**Endpoint:** `GET /api/v1/dashboard/videos`  
**Auth:** Required  
**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 10)
- `sortBy` (default: "createdAt")
- `sortType` ("asc" or "desc")

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "docs": [
      {
        "_id": "64video123...",
        "title": "JavaScript Tutorial",
        "thumbnail": "https://cloudinary.com/...",
        "views": 1500,
        "likesCount": 45,
        "commentsCount": 12,
        "isPublished": true,
        "createdAt": "2026-01-10T08:00:00.000Z"
      }
    ],
    "totalDocs": 45,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  },
  "message": "Channel videos fetched successfully",
  "success": true
}
```

**Key Concepts:**
- Shows owner's videos only (from JWT)
- Includes engagement metrics (likes, comments)
- Supports multiple sort options

---

### Get Subscriber Analytics

**Endpoint:** `GET /api/v1/dashboard/subscribers/analytics`  
**Auth:** Required  
**Query Parameters:**
- `period` ("day", "week", "month", "year")

**Example:** `GET /api/v1/dashboard/subscribers/analytics?period=month`

**Response:**
```json
{
  "statusCode": 200,
  "data": [
    {
      "_id": { "year": 2026, "month": 1 },
      "count": 450
    },
    {
      "_id": { "year": 2026, "month": 2 },
      "count": 520
    },
    {
      "_id": { "year": 2026, "month": 3 },
      "count": 680
    }
  ],
  "message": "Subscriber analytics fetched successfully",
  "success": true
}
```

**Key Concepts:**
- Groups subscriptions by time period
- Uses MongoDB date operators (`$year`, `$month`, `$week`, `$dayOfMonth`)
- Useful for creating growth charts

---

### Get Video Analytics

**Endpoint:** `GET /api/v1/dashboard/videos/analytics`  
**Auth:** Required

**Response:**
```json
{
  "statusCode": 200,
  "data": [
    {
      "_id": "64video123...",
      "title": "JavaScript Tutorial",
      "views": 15000,
      "likesCount": 450,
      "commentsCount": 120,
      "engagementRate": 3.0,
      "createdAt": "2026-01-10T08:00:00.000Z",
      "isPublished": true
    }
  ],
  "message": "Video analytics fetched successfully",
  "success": true
}
```

**Key Concepts:**
- Shows top 10 performing videos
- Calculates engagement rate: (likes / views) * 100
- Sorted by views (highest first)

---

### Get Watch History

**Endpoint:** `GET /api/v1/dashboard/history`  
**Auth:** Required

**Response:**
```json
{
  "statusCode": 200,
  "data": [
    {
      "_id": "64video123...",
      "title": "JavaScript Tutorial",
      "thumbnail": "https://cloudinary.com/...",
      "duration": 600,
      "views": 1500,
      "owner": {
        "username": "techguru",
        "fullName": "Tech Guru",
        "avatar": "https://cloudinary.com/..."
      }
    }
  ],
  "message": "Watch history fetched successfully",
  "success": true
}
```

**Key Concepts:**
- Stored in User model as array of video IDs
- Uses `$lookup` to populate video details
- Maintains order of watch history

---

### Clear Watch History

**Endpoint:** `DELETE /api/v1/dashboard/history`  
**Auth:** Required

**Response:**
```json
{
  "statusCode": 200,
  "data": {},
  "message": "Watch history cleared successfully",
  "success": true
}
```

---

## 🧪 Testing Guide

### Setting Up for Testing

1. **Install REST Client**
   - VS Code: Install "REST Client" extension
   - Or use Postman/Thunder Client/Insomnia

2. **Environment Variables**
   Create `.env` file:
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

3. **Start Server**
   ```bash
   npm run dev
   ```

---

### Test Cases

Create a file `test.http` in project root:

```http
### VARIABLES
@baseURL = http://localhost:8000/api/v1
@token = your-access-token-here

#############################################
# USER AUTHENTICATION
#############################################

### 1. Register User
POST {{baseURL}}/users/register
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW

------WebKitFormBoundary7MA4YWxkTrZu0gW
Content-Disposition: form-data; name="fullName"

John Doe
------WebKitFormBoundary7MA4YWxkTrZu0gW
Content-Disposition: form-data; name="email"

john@example.com
------WebKitFormBoundary7MA4YWxkTrZu0gW
Content-Disposition: form-data; name="username"

johndoe
------WebKitFormBoundary7MA4YWxkTrZu0gW
Content-Disposition: form-data; name="password"

password123
------WebKitFormBoundary7MA4YWxkTrZu0gW--

### 2. Login User
POST {{baseURL}}/users/login
Content-Type: application/json

{
  "username": "johndoe",
  "password": "password123"
}

### 3. Get Current User
GET {{baseURL}}/users/current
Authorization: Bearer {{token}}

### 4. Logout User
POST {{baseURL}}/users/logout
Authorization: Bearer {{token}}

### 5. Refresh Access Token
POST {{baseURL}}/users/refresh-token
Content-Type: application/json

{
  "refreshToken": "your-refresh-token"
}

#############################################
# VIDEO MANAGEMENT
#############################################

### 6. Upload Video (Use Postman/Thunder Client for this)
# POST {{baseURL}}/videos
# Form Data:
# - title: "My First Video"
# - description: "This is a test video"
# - videoFile: <select file>
# - thumbnail: <select file>
# Authorization: Bearer {{token}}

### 7. Get All Videos
GET {{baseURL}}/videos?page=1&limit=10

### 8. Get All Videos with Search
GET {{baseURL}}/videos?query=javascript&sortBy=views&sortType=desc

### 9. Get All Videos by User
GET {{baseURL}}/videos?userId=64abc123...

### 10. Get Single Video
GET {{baseURL}}/videos/64abc123...

### 11. Update Video
PATCH {{baseURL}}/videos/64abc123...
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "title": "Updated Video Title",
  "description": "Updated description"
}

### 12. Toggle Publish Status
PATCH {{baseURL}}/videos/64abc123.../toggle-publish
Authorization: Bearer {{token}}

### 13. Delete Video
DELETE {{baseURL}}/videos/64abc123...
Authorization: Bearer {{token}}

### 14. Increment Video Views
POST {{baseURL}}/videos/64abc123.../views

#############################################
# LIKES
#############################################

### 15. Like/Unlike Video
POST {{baseURL}}/likes/toggle/v/64abc123...
Authorization: Bearer {{token}}

### 16. Like/Unlike Comment
POST {{baseURL}}/likes/toggle/c/64comment123...
Authorization: Bearer {{token}}

### 17. Like/Unlike Tweet
POST {{baseURL}}/likes/toggle/t/64tweet123...
Authorization: Bearer {{token}}

### 18. Get Liked Videos
GET {{baseURL}}/likes/videos
Authorization: Bearer {{token}}

#############################################
# COMMENTS
#############################################

### 19. Add Comment to Video
POST {{baseURL}}/comments/64abc123...
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "content": "Great video! Really helpful."
}

### 20. Get Video Comments
GET {{baseURL}}/comments/64abc123...?page=1&limit=10

### 21. Update Comment
PATCH {{baseURL}}/comments/c/64comment123...
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "content": "Updated comment text"
}

### 22. Delete Comment
DELETE {{baseURL}}/comments/c/64comment123...
Authorization: Bearer {{token}}

#############################################
# SUBSCRIPTIONS
#############################################

### 23. Subscribe/Unsubscribe to Channel
POST {{baseURL}}/subscriptions/c/64channel123...
Authorization: Bearer {{token}}

### 24. Get Channel Subscribers
GET {{baseURL}}/subscriptions/c/64channel123...

### 25. Get Subscribed Channels
GET {{baseURL}}/subscriptions/u/64user123...

#############################################
# PLAYLISTS
#############################################

### 26. Create Playlist
POST {{baseURL}}/playlists
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "name": "JavaScript Tutorials",
  "description": "Collection of JavaScript learning videos"
}

### 27. Get User Playlists
GET {{baseURL}}/playlists/user/64user123...

### 28. Get Playlist by ID
GET {{baseURL}}/playlists/64playlist123...

### 29. Add Video to Playlist
PATCH {{baseURL}}/playlists/add/64playlist123.../64video123...
Authorization: Bearer {{token}}

### 30. Remove Video from Playlist
PATCH {{baseURL}}/playlists/remove/64playlist123.../64video123...
Authorization: Bearer {{token}}

### 31. Update Playlist
PATCH {{baseURL}}/playlists/64playlist123...
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "name": "Updated Playlist Name",
  "description": "Updated description"
}

### 32. Delete Playlist
DELETE {{baseURL}}/playlists/64playlist123...
Authorization: Bearer {{token}}

#############################################
# TWEETS (Community Posts)
#############################################

### 33. Create Tweet
POST {{baseURL}}/tweets
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "content": "Just uploaded a new video about React hooks! Check it out!"
}

### 34. Get All Tweets
GET {{baseURL}}/tweets?page=1&limit=20

### 35. Get User Tweets
GET {{baseURL}}/tweets/user/64user123...?page=1&limit=10

### 36. Update Tweet
PATCH {{baseURL}}/tweets/64tweet123...
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "content": "Updated tweet content"
}

### 37. Delete Tweet
DELETE {{baseURL}}/tweets/64tweet123...
Authorization: Bearer {{token}}

#############################################
# DASHBOARD & ANALYTICS
#############################################

### 38. Get Channel Statistics
GET {{baseURL}}/dashboard/stats
Authorization: Bearer {{token}}

### 39. Get Channel Videos
GET {{baseURL}}/dashboard/videos?page=1&limit=10
Authorization: Bearer {{token}}

### 40. Get Subscriber Analytics (Monthly)
GET {{baseURL}}/dashboard/subscribers/analytics?period=month
Authorization: Bearer {{token}}

### 41. Get Subscriber Analytics (Daily)
GET {{baseURL}}/dashboard/subscribers/analytics?period=day
Authorization: Bearer {{token}}

### 42. Get Video Analytics
GET {{baseURL}}/dashboard/videos/analytics
Authorization: Bearer {{token}}

### 43. Get Watch History
GET {{baseURL}}/dashboard/history
Authorization: Bearer {{token}}

### 44. Clear Watch History
DELETE {{baseURL}}/dashboard/history
Authorization: Bearer {{token}}

#############################################
# ADVANCED QUERIES
#############################################

### 45. Search Videos by Title
GET {{baseURL}}/videos?query=javascript tutorial&page=1&limit=5

### 46. Get Most Viewed Videos
GET {{baseURL}}/videos?sortBy=views&sortType=desc&limit=10

### 47. Get Recent Videos
GET {{baseURL}}/videos?sortBy=createdAt&sortType=desc&limit=10

### 48. Get Videos from Specific User
GET {{baseURL}}/videos?userId=64user123...&page=1&limit=10
```

---

### Testing Workflow

**1. User Registration & Login Flow**
```
1. Register new user → Get user data
2. Login → Get accessToken and refreshToken (in cookies)
3. Copy accessToken for subsequent requests
4. Test protected routes with token
5. Test refresh token endpoint
6. Logout → Clears tokens
```

**2. Video Upload Flow**
```
1. Login first
2. Upload video with thumbnail
3. Get video ID from response
4. Test get single video
5. Test update video
6. Test toggle publish
7. Test delete video
```

**3. Engagement Flow**
```
1. Login as User A
2. Upload video
3. Login as User B
4. Like the video
5. Comment on video
6. Subscribe to User A's channel
7. Verify like/comment/subscription counts
```

**4. Playlist Flow**
```
1. Create playlist
2. Add multiple videos
3. Get playlist details
4. Remove a video
5. Update playlist info
6. Delete playlist
```

**5. Analytics Flow**
```
1. Upload multiple videos
2. Generate some views (call views endpoint)
3. Get likes and comments
4. Check dashboard stats
5. View subscriber analytics
6. Check video analytics
```

---

### Common Test Scenarios

**Test Authorization:**
```http
# Should fail (401 Unauthorized)
GET {{baseURL}}/dashboard/stats

# Should succeed
GET {{baseURL}}/dashboard/stats
Authorization: Bearer {{token}}
```

**Test Ownership:**
```http
# User A creates video
POST {{baseURL}}/videos (with User A token)

# User B tries to delete User A's video (should fail - 403 Forbidden)
DELETE {{baseURL}}/videos/videoId
Authorization: Bearer {{userBToken}}
```

**Test Pagination:**
```http
GET {{baseURL}}/videos?page=1&limit=2
# Verify: hasNextPage, hasPrevPage, totalPages
```

**Test Search:**
```http
GET {{baseURL}}/videos?query=javascript
# Verify: Only videos with "javascript" in title/description
```

**Test Toggle Behavior:**
```http
# First call: Creates like
POST {{baseURL}}/likes/toggle/v/videoId

# Second call: Removes like
POST {{baseURL}}/likes/toggle/v/videoId
```

---

### Error Cases to Test

```http
### Invalid Video ID (400)
GET {{baseURL}}/videos/invalid-id

### Video Not Found (404)
GET {{baseURL}}/videos/64abc123notexist...

### Unauthorized Access (401)
GET {{baseURL}}/dashboard/stats
# Without token

### Forbidden - Not Owner (403)
DELETE {{baseURL}}/videos/someones-else-video
Authorization: Bearer {{token}}

### Missing Required Fields (400)
POST {{baseURL}}/videos
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "title": "Video without description"
}

### Duplicate Like (Toggle should unlike)
POST {{baseURL}}/likes/toggle/v/videoId
Authorization: Bearer {{token}}
# Call twice, second should unlike

### Subscribe to Self (400)
POST {{baseURL}}/subscriptions/c/your-own-userId
Authorization: Bearer {{token}}
```

---

## 🎓 Key Learning Points

### 1. **RESTful API Design**
- Use proper HTTP methods (GET, POST, PATCH, DELETE)
- Use plural nouns for resources (`/videos`, `/comments`)
- Use nested routes for relationships (`/playlists/add/:playlistId/:videoId`)
- Return appropriate status codes (200, 201, 400, 401, 403, 404, 500)

### 2. **MongoDB Aggregation**
- `$match`: Filter documents (like WHERE in SQL)
- `$lookup`: Join collections (like JOIN in SQL)
- `$unwind`: Flatten arrays
- `$group`: Group by fields (like GROUP BY in SQL)
- `$addFields` / `$project`: Shape output
- `$sort`, `$skip`, `$limit`: Sorting and pagination

### 3. **Authentication & Authorization**
- Authentication: "Who are you?" (JWT token verification)
- Authorization: "What can you do?" (ownership checks)
- Access token: Short-lived (1 day), sent with each request
- Refresh token: Long-lived (10 days), used to get new access token

### 4. **File Upload Pattern**
```
Client → Multer (temp storage) → Cloudinary (cloud storage) → URL returned
```

### 5. **Error Handling Strategy**
```
Controller throws ApiError → asyncHandler catches → errorHandler middleware → Client
```

### 6. **Database Relationships**
- **One-to-Many**: User → Videos (one user has many videos)
- **Many-to-Many**: Users ↔ Subscriptions ↔ Users
- **Polymorphic**: Likes → Video/Comment/Tweet (one model, multiple targets)

### 7. **Pagination Strategy**
- Limit number of results per request
- Provide navigation info (hasNextPage, totalPages)
- Improves performance for large datasets

### 8. **Toggle Pattern**
```javascript
const existing = await Model.findOne({ /* conditions */ });
if (existing) {
  await Model.deleteOne({ _id: existing._id });
  return { isActive: false };
} else {
  await Model.create({ /* data */ });
  return { isActive: true };
}
```

### 9. **Aggregation Performance Tips**
- Put `$match` as early as possible (reduces documents)
- Use indexes on frequently queried fields
- Limit fields in `$project` (reduces data transfer)
- Use `$lookup` wisely (can be expensive)

### 10. **Security Best Practices**
- Never send passwords in responses
- Validate all inputs
- Check ownership before modifications
- Use HTTPS in production
- Sanitize file uploads
- Rate limiting for API endpoints
- CORS configuration

---

## 📝 Summary

You now have a complete video platform backend with:

✅ **Phase 3 - Videos**: Upload, retrieve, update, delete, views tracking  
✅ **Phase 4 - Engagement**: Likes, comments, subscriptions  
✅ **Phase 5 - Advanced**: Playlists, watch history, community posts  
✅ **Phase 6 - Analytics**: Channel stats, subscriber growth, video performance  

**Total Endpoints**: 44+  
**Models**: User, Video, Like, Comment, Subscription, Playlist, Tweet  
**Features**: Auth, File Upload, Pagination, Search, Aggregation, Analytics  

This architecture is production-ready and scalable! 🚀
