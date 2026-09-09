# VideoVerse — Backend

REST API for a full-stack YouTube clone. Built with Node.js, Express.js v5, MongoDB, and Cloudinary. Deployed on Railway.

**Live API:** https://backend-projects-production-e244.up.railway.app/api/v1  
**Health check:** https://backend-projects-production-e244.up.railway.app/api/v1/health

---

## Tech Stack

- **Runtime:** Node.js 18+
- **Framework:** Express.js v5
- **Database:** MongoDB (Atlas) + Mongoose
- **Auth:** JWT — access tokens (1d) + refresh tokens (10d)
- **Media:** Cloudinary + Multer
- **Security:** helmet, express-rate-limit, bcryptjs, cookie-parser
- **Dev:** nodemon, prettier

---

## Setup

```bash
npm install
cp .env.example .env
# Fill in .env
npm run dev        # development (nodemon)
npm start          # production
```

Server starts on `http://localhost:8000`

---

## Environment Variables

```env
PORT=8000
NODE_ENV=development

MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net

CORS_ORIGIN=http://localhost:5173

ACCESS_TOKEN_SECRET=<64 random chars>
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=<different 64 random chars>
REFRESH_TOKEN_EXPIRY=10d

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Set to "true" in production — enables Secure + SameSite=None on cookies
COOKIE_SECURE=false
```

Generate secrets:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## API Reference

### Base URL: `/api/v1`

**Auth**
```
POST   /users/register          multipart: fullName, email, username, password, avatar, coverImage?
POST   /users/login             { email|username, password }
POST   /users/logout            protected
POST   /users/refresh-token     cookie or body: { refreshToken }
GET    /users/current-user      protected
POST   /users/change-password   protected — { currentPassword, newPassword }
PATCH  /users/update-account    protected — { fullName?, email? }
PATCH  /users/avatar            protected — multipart: avatar
PATCH  /users/cover-image       protected — multipart: coverImage
GET    /users/c/:username       public — channel profile
GET    /users/history           protected — watch history
```

**Videos**
```
GET    /videos                  ?page, limit, query, sortBy, sortType, userId
POST   /videos                  protected — multipart: videoFile, thumbnail, title, description
GET    /videos/:videoId
PATCH  /videos/:videoId         protected (owner)
DELETE /videos/:videoId         protected (owner)
PATCH  /videos/:videoId/toggle-publish   protected (owner)
POST   /videos/:videoId/views   public (optional auth for history tracking)
```

**Likes**
```
POST   /likes/toggle/v/:videoId     protected
POST   /likes/toggle/c/:commentId   protected
POST   /likes/toggle/t/:tweetId     protected
GET    /likes/videos                protected — all videos liked by current user
```

**Comments**
```
GET    /comments/:videoId           ?page, limit
POST   /comments/:videoId           protected
PATCH  /comments/c/:commentId       protected (owner)
DELETE /comments/c/:commentId       protected (owner)
```

**Subscriptions**
```
POST   /subscriptions/c/:channelId      protected — toggle subscribe
GET    /subscriptions/c/:channelId      subscriber list
GET    /subscriptions/u/:subscriberId   channels the user subscribed to
```

**Playlists**
```
POST   /playlists                           protected
GET    /playlists/user/:userId
GET    /playlists/:playlistId
PATCH  /playlists/:playlistId               protected (owner)
DELETE /playlists/:playlistId               protected (owner)
PATCH  /playlists/add/:playlistId/:videoId  protected (owner)
PATCH  /playlists/remove/:playlistId/:videoId  protected (owner)
```

**Tweets (Community Posts)**
```
GET    /tweets                  public feed
GET    /tweets/user/:userId
POST   /tweets                  protected
PATCH  /tweets/:tweetId         protected (owner)
DELETE /tweets/:tweetId         protected (owner)
```

**Dashboard**
```
GET    /dashboard/stats                   protected — total views, subscribers, likes, video count
GET    /dashboard/videos                  protected — paginated list of your videos with stats
GET    /dashboard/subscribers/analytics   protected — subscriber growth over time
GET    /dashboard/videos/analytics        protected — top 10 videos by views
GET    /dashboard/history                 protected — watch history
DELETE /dashboard/history                 protected — clear watch history
```

**Health**
```
GET    /api/v1/health   → { status, uptime, env }
```

---

## Project Structure

```
src/
├── app.js              CORS, middleware, route mounting, error handler
├── index.js            DB connect, server start
├── constants.js        DB_NAME
│
├── controllers/
│   ├── user.controller.js
│   ├── video.controller.js
│   ├── like.controller.js
│   ├── comment.controller.js
│   ├── subscription.controller.js
│   ├── playlist.controller.js
│   ├── tweet.controller.js
│   └── dashboard.controller.js
│
├── models/
│   ├── user.model.js         bcrypt hooks, JWT methods, watch history
│   ├── video.model.js        aggregatePaginate plugin
│   ├── likes.model.js        polymorphic (video / comment / tweet)
│   ├── comments.model.js
│   ├── subscription.model.js unique index on subscriber+channel
│   ├── playlists.model.js
│   └── tweets.model.js
│
├── routes/
│   ├── user.routes.js
│   ├── video.routes.js
│   ├── like.routes.js
│   ├── comment.routes.js
│   ├── subscription.routes.js
│   ├── playlist.routes.js
│   ├── tweet.routes.js
│   └── dashboard.routes.js
│
├── middlewares/
│   ├── auth.middleware.js       verifyJWT (cookie or Authorization header)
│   ├── multer.middleware.js     MIME type validation, 100MB limit
│   ├── errorHandler.middleware.js  global error → ApiError format
│   └── logger.middleware.js     dev-only request logger, redacts passwords
│
└── utils/
    ├── ApiError.js          extends Error, carries statusCode
    ├── ApiResponse.js       { statusCode, data, message, success }
    ├── asyncHandler.js      wraps async controllers, forwards to next(err)
    ├── cloudinary.js        upload (secure:true, cleanup on failure), delete
    └── cookieOptions.js     httpOnly, Secure, SameSite=None in production
```

---

## Authentication Flow

**Login / Register**
1. Validate credentials
2. Generate access token (1d) + refresh token (10d)
3. Set both as httpOnly cookies
4. Also return both in the JSON response body

Step 4 is the key production requirement — browsers on different domains (Vercel → Railway) block third-party cookies. Sending tokens in the body lets the frontend store them in localStorage and attach them as `Authorization: Bearer` headers, which always works regardless of cookie settings.

**Refresh**
- POST `/users/refresh-token` accepts token from cookie OR `req.body.refreshToken`
- Verifies against the stored refresh token in the database
- Issues a new token pair (rotation)

**verifyJWT middleware**
- Reads from `req.cookies.accessToken` first
- Falls back to `Authorization: Bearer <token>` header
- Attaches user to `req.user`

---

## Security

- Passwords hashed with bcrypt (cost factor 10)
- JWT secrets read from env — never hardcoded
- Rate limiting: 300 req/15min globally, 20 req/15min on auth endpoints
- Helmet security headers on all responses
- Request logger redacts password fields completely in production logging is disabled
- Stack traces stripped from error responses in production
- Input validation on every endpoint (required fields, lengths, email format, username charset)
- File upload: whitelist of MIME types, 100MB max, temp files always cleaned up

---

## Deployment (Railway)

Required environment variables on Railway:

```
NODE_ENV=production
COOKIE_SECURE=true
PORT=8000
MONGODB_URI=...
CORS_ORIGIN=https://your-frontend.vercel.app
ACCESS_TOKEN_SECRET=...
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=...
REFRESH_TOKEN_EXPIRY=10d
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

Railway auto-deploys from GitHub. The `start` script in `package.json` runs `node src/index.js`.

---

## Author

Mobeen Butt
