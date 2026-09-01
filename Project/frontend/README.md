# 🎬 VidTube Frontend

A stunning, modern video platform frontend built with React, featuring a beautiful dark theme with neon accents.

## ✨ Features

### 🎨 **World-Class UI/UX**
- **Sleek Dark Theme** - Modern dark interface (#0A0A0F) with white text and neon accents
- **Glassmorphism Effects** - Frosted glass cards with subtle blur
- **Smooth Animations** - Floating elements, fade-ins, and slide-ups
- **Neon Glow Effects** - Purple/blue neon shadows on interactive elements
- **Gradient Accents** - Beautiful purple-to-indigo gradients
- **Responsive Design** - Perfect on mobile, tablet, and desktop

### 🚀 **Core Features**
- **Video Browsing** - Grid layout with beautiful thumbnails
- **Video Player** - Full-featured HTML5 video player
- **Authentication** - Login and registration with validation
- **Search** - Real-time video search
- **Comments** - Comment on videos with like functionality
- **Likes & Subscriptions** - Engage with content and channels
- **User Profiles** - Channel pages with stats
- **Responsive Navbar** - Search, upload, and user menu

### 🛠️ **Technical Stack**
- **React 18** - Latest React features
- **React Router** - Client-side routing
- **Zustand** - Simple state management
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **React Hot Toast** - Beautiful notifications
- **Vite** - Lightning-fast build tool

## 🎨 Design System

### Color Palette
```css
Background: #0A0A0F (Rich dark blue-black)
Cards: #13131A (Slightly lighter dark)
Hover: #1A1A24 (Interactive states)
Border: #2A2A35 (Subtle borders)
Accent: #6366F1 (Vibrant purple-blue)

Neon Colors:
- Blue: #00F0FF (Cyan glow)
- Purple: #B794F6 (Lavender)
- Pink: #FF6B9D (Hot pink)
- Green: #00FFA3 (Mint)
```

### Typography
- **Font**: Inter (Google Fonts)
- **Headings**: Bold, large sizes
- **Body**: Regular weight
- **Accents**: Semibold

### Components
- **Glass Cards** - Backdrop blur with border glow
- **Buttons** - Gradient primary, ghost secondary
- **Inputs** - Dark with focus glow
- **Avatars** - Gradient fallbacks
- **Modals** - Centered with backdrop

## 📦 Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🔧 Configuration

### API Base URL
Edit `src/utils/api.js`:
```javascript
const API_BASE_URL = 'http://localhost:8000/api/v1';
```

### Vite Proxy
Already configured in `vite.config.js` to proxy `/api` to backend.

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── common/          # Reusable components
│   │   │   ├── Avatar.jsx
│   │   │   ├── Button.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Loader.jsx
│   │   │   └── Modal.jsx
│   │   ├── layout/          # Layout components
│   │   │   ├── Navbar.jsx
│   │   │   └── Sidebar.jsx
│   │   └── video/           # Video components
│   │       ├── CommentSection.jsx
│   │       ├── VideoCard.jsx
│   │       └── VideoPlayer.jsx
│   ├── pages/               # Page components
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   └── Watch.jsx
│   ├── services/            # API services
│   │   ├── auth.service.js
│   │   ├── channel.service.js
│   │   └── video.service.js
│   ├── store/               # State management
│   │   └── useAuthStore.js
│   ├── utils/               # Utilities
│   │   ├── api.js
│   │   └── helpers.js
│   ├── App.jsx              # Main app component
│   ├── main.jsx             # Entry point
│   └── index.css            # Global styles
├── public/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

## 🎯 Key Components

### **Button Component**
```jsx
<Button variant="primary" size="md" loading={false}>
  Click Me
</Button>
```
Variants: `primary`, `secondary`, `outline`, `ghost`, `danger`

### **Input Component**
```jsx
<Input
  label="Email"
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  error={error}
  icon={MailIcon}
/>
```

### **VideoCard Component**
```jsx
<VideoCard video={videoData} />
```
Displays thumbnail, title, channel info, views, and upload time.

### **Avatar Component**
```jsx
<Avatar
  src={user.avatar}
  alt={user.fullName}
  size="md"
  fallback={user.fullName}
/>
```
Auto-generates gradient with initials if no image.

## 🎨 Styling Guide

### Custom Classes
```css
.glass - Glassmorphism effect
.glass-hover - Glass with hover
.btn-primary - Primary button
.btn-secondary - Secondary button
.input-field - Input field
.card - Glass card
.neon-text - Gradient text
```

### Animations
```css
animate-float - Floating effect
animate-glow - Pulsing glow
animate-slide-up - Slide up entrance
animate-fade-in - Fade in entrance
```

### Gradients
```css
bg-gradient-primary - Purple-to-indigo
bg-gradient-accent - Pink-to-red
bg-gradient-dark - Dark gradient
bg-gradient-glow - Radial glow
```

## 🚀 Features to Implement

### Current Pages
- ✅ Home (Video grid)
- ✅ Login
- ✅ Register
- ✅ Watch (Video player)

### Upcoming Pages
- 🔄 Upload video
- 🔄 User profile
- 🔄 Channel page
- 🔄 Dashboard
- 🔄 Search results
- 🔄 Playlists
- 🔄 History
- 🔄 Liked videos
- 🔄 Subscriptions
- 🔄 Settings

## 💡 Development Tips

### Hot Reload
Vite provides instant hot module replacement. Save and see changes immediately.

### Component Development
Create components in `src/components/` and import where needed.

### State Management
Use Zustand stores for global state:
```javascript
import useAuthStore from './store/useAuthStore';
const { user, login, logout } = useAuthStore();
```

### API Calls
Use service files:
```javascript
import { videoService } from './services/video.service';
const videos = await videoService.getAllVideos();
```

## 🎨 Customization

### Change Theme Colors
Edit `tailwind.config.js`:
```javascript
colors: {
  dark: {
    bg: '#0A0A0F',      // Your custom color
    accent: '#6366F1',   // Your custom accent
  }
}
```

### Add Custom Animations
Edit `tailwind.config.js` keyframes section.

### Modify Fonts
Edit `index.html` Google Fonts link and `tailwind.config.js` fontFamily.

## 📱 Responsive Design

- **Mobile** - Single column layout
- **Tablet** - 2-column grid
- **Desktop** - 3-4 column grid with sidebar
- **Navbar** - Collapsible on mobile
- **Sidebar** - Hidden on mobile, visible on desktop

## 🔒 Security

- JWT tokens stored in localStorage
- HTTP-only cookies supported
- CORS configured
- Input validation
- XSS protection

## 🌟 Best Practices

- **Component Reusability** - DRY principle
- **Code Splitting** - React.lazy() for routes
- **Performance** - React.memo for expensive renders
- **Accessibility** - Semantic HTML and ARIA labels
- **SEO** - Meta tags and proper headings

## 🚀 Deployment

```bash
# Build for production
npm run build

# Deploy dist/ folder to:
# - Vercel
# - Netlify
# - GitHub Pages
# - Your server
```

## 🎓 Learning Resources

- **React Docs**: https://react.dev
- **Tailwind CSS**: https://tailwindcss.com
- **Zustand**: https://github.com/pmndrs/zustand
- **React Router**: https://reactrouter.com
- **Framer Motion**: https://www.framer.com/motion/

---

**Built with ❤️ and lots of ☕**

**Version**: 1.0.0  
**Author**: Mobeen Butt
