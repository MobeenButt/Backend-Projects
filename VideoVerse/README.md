# VideoVerse

A full-stack YouTube clone built with the MERN stack. Users can register, upload videos, watch, like, comment, subscribe to channels, manage playlists, and view a creator dashboard with analytics. Deployed to production on Vercel and Railway.

**Live:** https://vidtube-frontend-ochre.vercel.app  
**Backend:** https://backend-projects-production-e244.up.railway.app/api/v1/health

---

## Tech Stack

**Frontend**
- React 18 + Vite
- React Router DOM v6
- Zustand (state management)
- Axios (HTTP client with interceptors)
- Tailwind CSS
- Framer Motion

**Backend**
- Node.js + Express.js v5
- MongoDB + Mongoose
- JWT (access + refresh tokens)
- Cloudinary (media storage)
- Multer (file uploads)
- bcryptjs, helmet, express-rate-limit

---

## Project Structure

```
Project/
├── frontend/               # React app → deployed on Vercel
│   └── src/
│       ├── components/     # Navbar, Sidebar, VideoCard, etc.
│       ├── pages/          # 14 pages (Home, Watch, Upload, Channel, etc.)
│       ├── services/       # API service files (one per resource)
│       ├── store/          # Zustand auth store
│       └── utils/          # helpers.js, formatters.js
│
├── backend/                # Express API → deployed on Railway
│   └── src/
│       ├── controllers/    # 8 controllers
│       ├── models/         # 7 Mongoose models
│       ├── routes/         # 8 route files
│       ├── middlewares/    # auth, multer, error handler, logger
│       └── utils/          # ApiError, ApiResponse, cloudinary, cookieOptions
│
├── vercel.json             # React Router SPA rewrites
└── README.md
```

---

## Local Setup

**Prerequisites:** Node.js 18+, MongoDB Atlas account, Cloudinary account

**Backend**
```bash
cd backend
npm install
cp .env.example .env
# Fill in .env with your credentials
npm run dev
# Runs on http://localhost:8000
```

**Frontend**
```bash
cd frontend
npm install
# Create frontend/.env
echo "VITE_API_URL=http://localhost:8000/api/v1" > .env
npm run dev
# Runs on http://localhost:5173
```

---

## Environment Variables

**Backend** (`backend/.env`)
```
PORT=8000
NODE_ENV=development
MONGODB_URI=mongodb+srv://...
CORS_ORIGIN=http://localhost:5173
ACCESS_TOKEN_SECRET=<64-char random string>
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=<different 64-char random string>
REFRESH_TOKEN_EXPIRY=10d
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
COOKIE_SECURE=false
```

**Frontend** (`frontend/.env`)
```
VITE_API_URL=http://localhost:8000/api/v1
```

---

## API Endpoints

Base URL: `/api/v1`

| Resource | Endpoints |
|---|---|
| Users | register, login, logout, refresh-token, current-user, change-password, update-account, avatar, cover-image, c/:username, history |
| Videos | CRUD, toggle-publish, views |
| Likes | toggle video / comment / tweet, get liked videos |
| Comments | CRUD per video |
| Subscriptions | toggle, get subscribers, get subscribed channels |
| Playlists | CRUD, add/remove video |
| Tweets | CRUD |
| Dashboard | stats, videos, subscriber analytics, video analytics, watch history |

Full list: 40+ endpoints across 8 resource domains.

---

## Features

- Register and login with avatar + cover image upload
- Browse and search videos
- Watch page with video player, likes, subscribe, comments
- Channel profile with banner, tabs (Videos / Playlists / About)
- Upload videos with thumbnail
- Creator dashboard: total views, subscribers, likes, per-video stats
- Playlists: create, add/remove videos
- Watch history
- Liked videos feed
- Subscriptions feed
- Trending page
- Mobile-responsive with bottom navigation

---

## Deployment

**Backend → Railway**

Set these environment variables in Railway dashboard:
```
NODE_ENV=production
COOKIE_SECURE=true
CORS_ORIGIN=https://your-frontend.vercel.app
# ... rest same as local but with production values
```
Railway auto-deploys from GitHub on push. Start command: `npm start`

**Frontend → Vercel**

Set in Vercel dashboard:
```
VITE_API_URL=https://your-backend.railway.app/api/v1
```
`vercel.json` in the frontend root handles React Router SPA rewrites so direct URL access works.

---

## Production Notes

**Cross-origin authentication**  
Frontend (Vercel) and backend (Railway) are on different domains. Modern browsers block third-party cookies in this configuration (Chrome Privacy Sandbox, Safari ITP). The app uses dual-mode authentication: tokens are set as httpOnly cookies AND returned in the response body. The frontend stores them in localStorage and sends them as `Authorization: Bearer` headers on every request. This works regardless of browser cookie settings.

**Media URLs**  
All Cloudinary uploads are forced to HTTPS via `secure: true` in the config. The Axios response interceptor also normalises any legacy `http://` URLs in the database to `https://` automatically.

**Rate limiting**  
300 requests / 15 min on all API routes. 20 requests / 15 min on login and register specifically.

---

## Author

Mobeen Butt
