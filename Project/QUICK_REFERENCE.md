# 🚀 Quick Reference Guide

## API Endpoints Summary

### 📝 Authentication (`/api/v1/users`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/register` | ❌ | Register new user |
| POST | `/login` | ❌ | Login user |
| POST | `/logout` | ✅ | Logout user |
| POST | `/refresh-token` | ❌ | Refresh access token |
| GET | `/current` | ✅ | Get current user |
| POST | `/change-password` | ✅ | Change password |
| PATCH | `/update-account` | ✅ | Update user details |
| PATCH | `/avatar` | ✅ | Update avatar |
| PATCH | `/cover-image` | ✅ | Update cover image |

### 🎥 Videos (`/api/v1/videos`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/` | ✅ | Upload video |
| GET | `/` | ❌ | Get all videos (with filters) |
| GET | `/:videoId` | ❌ | Get single video |
| PATCH | `/:videoId` | ✅ | Update video (owner) |
| DELETE | `/:videoId` | ✅ | Delete video (owner) |
| PATCH | `/:videoId/toggle-publish` | ✅ | Toggle publish status |
| POST | `/:videoId/views` | ❌ | Increment views |

### ❤️ Likes (`/api/v1/likes`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/toggle/v/:videoId` | ✅ | Like/unlike video |
| POST | `/toggle/c/:commentId` | ✅ | Like/unlike comment |
| POST | `/toggle/t/:tweetId` | ✅ | Like/unlike tweet |
| GET | `/videos` | ✅ | Get liked videos |

### 💬 Comments (`/api/v1/comments`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/:videoId` | ✅ | Add comment |
| GET | `/:videoId` | ❌ | Get video comments |
| PATCH | `/c/:commentId` | ✅ | Update comment (owner) |
| DELETE | `/c/:commentId` | ✅ | Delete comment (owner) |

### 🔔 Subscriptions (`/api/v1/subscriptions`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/c/:channelId` | ✅ | Subscribe/unsubscribe |
| GET | `/c/:channelId` | ❌ | Get channel subscribers |
| GET | `/u/:subscriberId` | ❌ | Get subscribed channels |

### 📚 Playlists (`/api/v1/playlists`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/` | ✅ | Create playlist |
| GET | `/user/:userId` | ❌ | Get user playlists |
| GET | `/:playlistId` | ❌ | Get playlist by ID |
| PATCH | `/:playlistId` | ✅ | Update playlist (owner) |
| DELETE | `/:playlistId` | ✅ | Delete playlist (owner) |
| PATCH | `/add/:playlistId/:videoId` | ✅ | Add video to playlist |
| PATCH | `/remove/:playlistId/:videoId` | ✅ | Remove video |

### 🐦 Tweets (`/api/v1/tweets`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/` | ✅ | Create tweet |
| GET | `/` | ❌ | Get all tweets (feed) |
| GET | `/user/:userId` | ❌ | Get user tweets |
| PATCH | `/:tweetId` | ✅ | Update tweet (owner) |
| DELETE | `/:tweetId` | ✅ | Delete tweet (owner) |

### 📊 Dashboard (`/api/v1/dashboard`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/stats` | ✅ | Get channel statistics |
| GET | `/videos` | ✅ | Get channel videos |
| GET | `/subscribers/analytics` | ✅ | Subscriber analytics |
| GET | `/videos/analytics` | ✅ | Video analytics |
| GET | `/history` | ✅ | Get watch history |
| DELETE | `/history` | ✅ | Clear watch history |

---

## 🔑 Core Concepts Explained

### 1. asyncHandler
Wraps async functions to catch errors automatically.

```javascript
const asyncHandler = (fn) => async (req, res, next) => {
  try {
    await fn(req, res, next);
  } catch (error) {
    next(error);
  }
};
```

**Usage:**
```javascript
const myController = asyncHandler(async (req, res) => {
  // Your code here
  // No need for try-catch!
});
```

### 2. ApiResponse
Standardized response format.

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

**Usage:**
```javascript
return res.status(200).json(
  new ApiResponse(200, userData, "Success message")
);
```

### 3. ApiError
Custom error class for consistent error handling.

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
if (!user) {
  throw new ApiError(404, "User not found");
}
```

### 4. JWT Authentication

**Access Token:**
- Short-lived (1 day)
- Sent with every request
- Contains user info

**Refresh Token:**
- Long-lived (10 days)
- Stored in database
- Used to get new access token

**Flow:**
```
1. User logs in
2. Server generates both tokens
3. Tokens sent in cookies
4. Client sends accessToken with requests
5. When accessToken expires, use refreshToken
6. Get new accessToken
```

### 5. File Upload Flow

```
Client → Multer (temp storage) → Cloudinary → URL → Database
```

**Steps:**
1. Multer receives file, saves to `/public/temp`
2. Cloudinary upload function reads from temp
3. File uploaded to cloud, URL returned
4. URL saved to database
5. Temp file deleted

### 6. MongoDB Aggregation

**Common Stages:**

**$match** - Filter documents
```javascript
{ $match: { isPublished: true } }
```

**$lookup** - Join collections
```javascript
{
  $lookup: {
    from: "users",
    localField: "owner",
    foreignField: "_id",
    as: "owner"
  }
}
```

**$unwind** - Deconstruct arrays
```javascript
{ $unwind: "$owner" }
```

**$addFields** - Add computed fields
```javascript
{ $addFields: { likesCount: { $size: "$likes" } } }
```

**$project** - Select fields
```javascript
{ $project: { password: 0 } }
```

**$sort** - Sort results
```javascript
{ $sort: { createdAt: -1 } }
```

**$group** - Group by field
```javascript
{
  $group: {
    _id: "$owner",
    totalViews: { $sum: "$views" }
  }
}
```

### 7. Pagination

**Manual Pagination:**
```javascript
const skip = (page - 1) * limit;
const results = await Model.find().skip(skip).limit(limit);
const total = await Model.countDocuments();
```

**With Plugin:**
```javascript
const options = { page: 1, limit: 10 };
const result = await Model.aggregatePaginate(aggregate, options);
```

**Response Structure:**
```javascript
{
  docs: [...],
  totalDocs: 100,
  limit: 10,
  page: 1,
  totalPages: 10,
  hasNextPage: true,
  hasPrevPage: false
}
```

### 8. Toggle Pattern

**Used for:** Likes, Subscriptions

```javascript
const existing = await Model.findOne({ user, target });

if (existing) {
  await Model.deleteOne({ _id: existing._id });
  return { isActive: false };
} else {
  await Model.create({ user, target });
  return { isActive: true };
}
```

### 9. Authorization Checks

**Owner-only operations:**
```javascript
if (resource.owner.toString() !== req.user._id.toString()) {
  throw new ApiError(403, "You are not authorized");
}
```

**Why toString()?**
MongoDB ObjectIds are objects, not strings. Must convert for comparison.

### 10. Query Parameters

**Common patterns:**

**Pagination:**
```
?page=1&limit=10
```

**Search:**
```
?query=javascript
```

**Sorting:**
```
?sortBy=views&sortType=desc
```

**Filtering:**
```
?userId=64abc123...
```

**Combined:**
```
?page=1&limit=10&query=tutorial&sortBy=views&sortType=desc
```

---

## 🧪 Testing Tips

### 1. Test Order
```
1. Register → 2. Login → 3. Protected Routes
```

### 2. Save Tokens
After login, copy:
- `accessToken` from response/cookie
- `refreshToken` for refresh endpoint

### 3. File Upload Testing
Use Postman/Thunder Client for multipart/form-data.

Can't easily test in `.http` files.

### 4. Test Authorization
```http
# Should fail (401)
GET /api/v1/dashboard/stats

# Should succeed
GET /api/v1/dashboard/stats
Authorization: Bearer your-token
```

### 5. Test Ownership
```
1. User A creates resource
2. User B tries to modify (should fail - 403)
```

### 6. Test Validation
```
1. Send incomplete data
2. Send invalid data types
3. Send malformed IDs
```

---

## 🔧 Common Operations

### Start Server
```bash
npm run dev
```

### Check MongoDB Connection
```javascript
// In terminal after starting server
// Look for: "MongoDB connected!! DB HOST: ..."
```

### Clear Database Collections
```javascript
// In MongoDB shell or Compass
db.videos.deleteMany({})
db.users.deleteMany({})
// etc.
```

### Get User ID After Login
```javascript
// From login response or /current endpoint
{
  "data": {
    "_id": "64abc123...",  // Copy this
    ...
  }
}
```

### Format JSON in VS Code
```
Shift + Alt + F (Windows)
Shift + Option + F (Mac)
```

---

## 📋 Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Success |
| 201 | Created - Resource created |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Missing/invalid token |
| 403 | Forbidden - No permission |
| 404 | Not Found - Resource doesn't exist |
| 409 | Conflict - Duplicate resource |
| 500 | Server Error - Internal error |

---

## 🚨 Common Errors & Solutions

### Error: "Access token is missing"
**Solution:** Include Authorization header or login again

### Error: "Invalid video ID"
**Solution:** Check ID format (24-character hex string)

### Error: "You are not authorized"
**Solution:** You're not the owner of the resource

### Error: "Video already exists in playlist"
**Solution:** Video is already added, can't add twice

### Error: "User with given username or email already exists"
**Solution:** Choose different username/email

### Error: "Cannot subscribe to yourself"
**Solution:** Use different channel ID

### Error: "Cloudinary upload failed"
**Solution:** Check Cloudinary credentials in .env

---

## 💡 Best Practices

### 1. Always Validate Input
```javascript
if (!title?.trim() || !description?.trim()) {
  throw new ApiError(400, "Required fields missing");
}
```

### 2. Check ObjectId Validity
```javascript
if (!mongoose.isValidObjectId(id)) {
  throw new ApiError(400, "Invalid ID");
}
```

### 3. Check Resource Existence
```javascript
const video = await Video.findById(id);
if (!video) {
  throw new ApiError(404, "Video not found");
}
```

### 4. Check Ownership
```javascript
if (video.owner.toString() !== req.user._id.toString()) {
  throw new ApiError(403, "Unauthorized");
}
```

### 5. Select Fields Wisely
```javascript
// Don't expose sensitive data
.select("-password -refreshToken")
```

### 6. Use Indexes
```javascript
// In model
userSchema.index({ email: 1 });
videoSchema.index({ title: "text", description: "text" });
```

### 7. Pagination for Large Data
Always paginate lists to avoid performance issues.

### 8. Clean Up Files
```javascript
// After upload
fs.unlinkSync(localFilePath);
```

---

## 🎯 Implementation Checklist

### Phase 3: Videos ✅
- [x] Upload video
- [x] Get all videos
- [x] Get single video
- [x] Update video
- [x] Delete video
- [x] Views counter

### Phase 4: Engagement ✅
- [x] Like/unlike video
- [x] Like/unlike comment
- [x] Like/unlike tweet
- [x] Add comment
- [x] Get comments
- [x] Update comment
- [x] Delete comment
- [x] Subscribe/unsubscribe
- [x] Get subscribers
- [x] Get subscriptions

### Phase 5: Advanced ✅
- [x] Create playlist
- [x] Get playlists
- [x] Add/remove videos from playlist
- [x] Update/delete playlist
- [x] Watch history
- [x] Search & filters
- [x] Community posts (tweets)

### Phase 6: Analytics ✅
- [x] Channel stats
- [x] Subscriber analytics
- [x] Video analytics
- [x] Watch history management

---

## 📚 Resources

### Documentation
- [Express.js](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/docs/)
- [Mongoose](https://mongoosejs.com/docs/)
- [Cloudinary](https://cloudinary.com/documentation)
- [JWT](https://jwt.io/)

### Tools
- [Postman](https://www.postman.com/)
- [MongoDB Compass](https://www.mongodb.com/products/compass)
- [VS Code REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client)

---

**Happy Coding! 🚀**
