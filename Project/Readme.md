# 🎥 VidTube - Complete Video Platform

A full-stack YouTube-like video platform with stunning UI and powerful features.

## 📁 Project Structure

```
Project/
├── backend/           # Node.js + Express + MongoDB
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middlewares/
│   │   └── utils/
│   ├── public/
│   ├── package.json
│   └── README.md
│
└── frontend/          # React + Vite + Tailwind
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   ├── services/
    │   ├── store/
    │   └── utils/
    ├── package.json
    └── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js v14+ (v18+ recommended)
- MongoDB (local or Atlas)
- Cloudinary account

### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.sample .env

# Edit .env with your credentials:
# - MongoDB URI
# - Cloudinary credentials
# - JWT secrets

# Start server
npm run dev
```

Backend runs on http://localhost:8000

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend runs on http://localhost:3000

## ✨ Features

### Backend (44+ API Endpoints)
- ✅ User authentication (JWT)
- ✅ Video upload & management
- ✅ Like/unlike system
- ✅ Comments CRUD
- ✅ Subscribe/unsubscribe
- ✅ Playlists
- ✅ Watch history
- ✅ Community posts (tweets)
- ✅ Channel analytics
- ✅ Subscriber analytics

### Frontend (Beautiful Dark Theme)
- ✅ Stunning dark UI (#0A0A0F)
- ✅ Glassmorphism effects
- ✅ Neon glow animations
- ✅ Responsive design
- ✅ Video player
- ✅ Search functionality
- ✅ User authentication
- ✅ Comments section
- ✅ Like & subscribe

## 🎨 Design Highlights

### Color Scheme
- **Background**: #0A0A0F (Deep dark)
- **Cards**: #13131A (Elevated dark)
- **Accent**: #6366F1 (Vibrant purple-blue)
- **Neon Effects**: Cyan, Purple, Pink, Green

### UI Components
- Glass-morphic cards
- Gradient buttons
- Smooth animations
- Floating effects
- Neon shadows
- Responsive grid

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB + Mongoose
- **Authentication**: JWT + bcrypt
- **File Upload**: Multer + Cloudinary
- **Validation**: Custom validators

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State**: Zustand
- **Routing**: React Router
- **Animations**: Framer Motion
- **Notifications**: React Hot Toast
- **Icons**: React Icons

## 📖 Documentation

### Backend Documentation
See `backend/API_DOCUMENTATION.md` for:
- Complete API reference
- Request/response examples
- Core concepts explained
- Testing guide
- 49 test cases

### Frontend Documentation
See `frontend/README.md` for:
- Component library
- Styling guide
- State management
- Development tips

## 🧪 Testing

### Backend
```bash
cd backend
# Use test.http file with VS Code REST Client
# Or import into Postman
```

### Frontend
```bash
cd frontend
npm run dev
# Open http://localhost:3000
```

## 🌐 Environment Variables

### Backend (.env)
```env
PORT=8000
MONGODB_URI=mongodb://localhost:27017/videoPlatform
CORS_ORIGIN=http://localhost:3000

ACCESS_TOKEN_SECRET=your-secret-here
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your-refresh-secret
REFRESH_TOKEN_EXPIRY=10d

CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### Frontend
Automatically proxies API calls to backend via Vite config.

## 🚀 Deployment

### Backend
- Deploy to Heroku, Railway, or Render
- Set environment variables
- Connect MongoDB Atlas
- Configure Cloudinary

### Frontend
- Build: `npm run build`
- Deploy `dist/` folder to:
  - Vercel (recommended)
  - Netlify
  - GitHub Pages

## 📊 Project Stats

- **Total Files**: 50+
- **Backend Endpoints**: 44+
- **Frontend Components**: 15+
- **Lines of Code**: ~10,000+
- **Documentation Pages**: 7

## 🎯 Completed Features

### Phase 1-2: Foundation ✅
- User authentication
- Profile management

### Phase 3: Videos ✅
- Upload, update, delete
- Views counter
- Search & filters

### Phase 4: Engagement ✅
- Likes
- Comments
- Subscriptions

### Phase 5: Advanced ✅
- Playlists
- Watch history
- Community posts

### Phase 6: Analytics ✅
- Channel stats
- Subscriber analytics
- Video performance

### Frontend ✅
- Beautiful dark theme
- Responsive design
- All core pages
- Smooth animations

## 🔮 Future Enhancements

- [ ] Video upload page
- [ ] Dashboard page
- [ ] Channel page
- [ ] Playlists page
- [ ] Settings page
- [ ] Video recommendations
- [ ] Real-time notifications
- [ ] Live streaming
- [ ] Video transcoding
- [ ] Advanced search

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open pull request

## 📝 License

ISC

## 👨‍💻 Author

**Mobeen Butt**

---

## 🎓 Key Learning Outcomes

### Backend Development
- RESTful API design
- MongoDB aggregation
- JWT authentication
- File upload handling
- Error handling patterns

### Frontend Development
- React best practices
- State management
- Responsive design
- Animation techniques
- Component architecture

### Full-Stack Integration
- API integration
- Authentication flow
- File upload flow
- Real-time updates

---

**🌟 Star this project if you found it helpful!**

**Built with ❤️ and lots of ☕**

**Version**: 1.0.0
