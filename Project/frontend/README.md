# VideoVerse — Frontend

React frontend for a full-stack YouTube clone. Built with Vite, Tailwind CSS, and Zustand. Deployed on Vercel.

**Live:** https://vidtube-frontend-ochre.vercel.app

---

## Tech Stack

- **React 18** + Vite
- **React Router DOM v6** — client-side routing
- **Zustand** — global auth state
- **Axios** — HTTP client with request/response interceptors
- **Tailwind CSS** — utility-first styling
- **Framer Motion** — animations
- **React Hot Toast** — notifications
- **React Icons**

---

## Setup

```bash
npm install

# Create .env file
echo "VITE_API_URL=http://localhost:8000/api/v1" > .env

npm run dev        # http://localhost:5173
npm run build      # production build → dist/
npm run preview    # preview production build
```

---

## Environment Variables

```env
# Development
VITE_API_URL=http://localhost:8000/api/v1

# Production (set in Vercel dashboard)
VITE_API_URL=https://backend-projects-production-e244.up.railway.app/api/v1
```

---

## Project Structure

```
src/
├── App.jsx                 Router setup, auth restore on mount, layout
├── main.jsx
├── index.css               Tailwind directives, custom CSS classes
│
├── pages/
│   ├── Home.jsx            Video feed with filter chips
│   ├── Watch.jsx           Video player, likes, subscribe, comments
│   ├── Upload.jsx          Drag-and-drop video upload with thumbnail
│   ├── Channel.jsx         Channel profile: banner, avatar, tabs
│   ├── Dashboard.jsx       Creator stats + video management
│   ├── Search.jsx          Query-based results
│   ├── Subscriptions.jsx   Feed from subscribed channels
│   ├── Trending.jsx        Most-viewed videos
│   ├── History.jsx         Watch history with clear option
│   ├── Liked.jsx           Liked videos
│   ├── Playlists.jsx       Playlist grid + create modal
│   ├── PlaylistDetail.jsx  Playlist contents, remove videos
│   ├── Login.jsx
│   └── Register.jsx        With avatar + cover image upload
│
├── components/
│   ├── layout/
│   │   ├── Navbar.jsx      Search, upload icon, user menu, mobile search
│   │   └── Sidebar.jsx     Desktop fixed sidebar + mobile drawer + bottom nav
│   ├── video/
│   │   ├── VideoCard.jsx   Thumbnail, title, channel, views, time
│   │   ├── VideoGrid.jsx   Responsive grid with skeleton and empty states
│   │   ├── VideoPlayer.jsx HTML5 video with loading indicator
│   │   ├── CommentSection.jsx  Add / list / delete / like comments
│   │   ├── LikeButton.jsx  Toggle with count
│   │   └── SubscribeButton.jsx Toggle with count
│   └── common/
│       ├── AuthGuard.jsx   Redirects to /login if not authenticated
│       ├── Avatar.jsx      Image with initials fallback
│       ├── Button.jsx      primary / secondary / ghost / outlined variants
│       ├── Input.jsx       Label + error display
│       ├── Loader.jsx      Spinner
│       ├── Modal.jsx       Centered overlay
│       ├── SkeletonCard.jsx Loading placeholder
│       ├── EmptyState.jsx  Icon + title + description + optional action
│       ├── VideoPage.jsx   VideoGrid and PageHeader shared layout
│       ├── Tooltip.jsx
│       └── Dropdown.jsx
│
├── services/
│   ├── api.js              Axios instance, interceptors, token store
│   ├── auth.service.js     login, register, logout, getCurrentUser
│   ├── video.service.js    CRUD, views, like, comments
│   ├── channel.service.js  Profile, dashboard, history, analytics
│   ├── comment.service.js
│   ├── like.service.js
│   ├── subscription.service.js
│   ├── playlist.service.js
│   ├── tweet.service.js
│   └── dashboard.service.js
│
├── store/
│   └── useAuthStore.js     Zustand store: login, register, logout, loadUser
│
├── hooks/
│   ├── useDebounce.js
│   └── useInfiniteScroll.js
│
└── utils/
    ├── helpers.js          formatViews, formatDuration, formatTimeAgo, validateEmail, getInitials
    └── formatters.js       toHttps, formatSubscribers, formatDate
```

---

## Authentication

The app uses dual-mode authentication to handle cross-origin deployments (Vercel frontend + Railway backend on different domains).

Modern browsers block third-party cookies between different domains. The solution:
- After login or register, the backend returns `accessToken` and `refreshToken` in the response body
- The frontend stores these in `localStorage` via `tokenStore`
- Every Axios request attaches `Authorization: Bearer <accessToken>` header
- When a 401 is received, the interceptor sends the `refreshToken` in the request body to get a new token pair, then retries the original request

httpOnly cookies are still set for browsers that support them, but the app never depends on them.

**tokenStore API** (in `services/api.js`):
```js
tokenStore.setTokens(accessToken, refreshToken)  // called after login
tokenStore.getAccess()                            // used by request interceptor
tokenStore.clear()                                // called on logout
```

---

## Key Patterns

**All API calls go through service files** — never call axios directly in a component.
```js
import { videoService } from '../services/video.service';
const response = await videoService.getAllVideos({ limit: 24, sortBy: 'views' });
const videos = response.data?.docs || [];
```

**Axios response interceptor unwraps the ApiResponse wrapper** so `response.data` is the actual payload, not the `{ statusCode, data, message, success }` envelope.

**All errors come back as `new Error(message)`** from the interceptor. Use `error.message` in catch blocks, not `error.response?.data?.message`.
```js
} catch (error) {
  toast.error(error.message || 'Something went wrong');
}
```

**`loadUser()` runs on every app mount** to validate the stored token with the server. It short-circuits immediately if no token exists, so unauthenticated visitors don't see any console errors.

---

## Responsive Breakpoints

| Screen | Layout |
|---|---|
| Mobile `< 640px` | Single column, bottom navigation bar |
| Tablet `640px–1024px` | 2–3 column grid, sidebar hidden |
| Desktop `> 1024px` | 4 column grid, fixed sidebar (240px) |

---

## Design

Dark theme matching YouTube's aesthetic.

```
Background:       #0f0f0f
Surface:          #212121
Hover:            #3f3f3f
Border:           #3f3f3f
Primary text:     #ffffff
Secondary text:   #aaaaaa
Accent / brand:   #ff0000
```

Custom Tailwind classes: `.card-surface`, `.btn`, `.btn-primary`, `.btn-outlined`, `.icon-btn`, `.chip`, `.chip-active`, `.input-field`, `.no-scrollbar`, `.avatar-gradient`

---

## Deployment (Vercel)

`vercel.json` in the project root handles React Router SPA routing — all paths rewrite to `index.html` so direct URL access and page refresh work correctly.

Set `VITE_API_URL` in Vercel dashboard → Project Settings → Environment Variables.

Vercel auto-deploys from GitHub on push to main.

---

## Author

Mobeen Butt
