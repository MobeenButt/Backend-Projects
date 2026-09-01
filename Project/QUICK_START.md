# ⚡ QUICK START - Get Running in 5 Minutes!

## 🎯 Prerequisites
- ✅ Node.js installed
- ✅ MongoDB running
- ✅ Cloudinary account (free)

---

## 🚀 Backend Setup (2 minutes)

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure .env
Create `backend/.env`:
```env
PORT=8000
MONGODB_URI=mongodb://localhost:27017/videoPlatform
CORS_ORIGIN=http://localhost:3000

ACCESS_TOKEN_SECRET=my-secret-access-token-change-this
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=my-secret-refresh-token-change-this
REFRESH_TOKEN_EXPIRY=10d

CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

**Get Cloudinary credentials:**
1. Go to https://cloudinary.com
2. Sign up free
3. Copy from dashboard

### 3. Start Backend
```bash
npm run dev
```

✅ Backend running on http://localhost:8000

---

## 🎨 Frontend Setup (2 minutes)

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Start Frontend
```bash
npm run dev
```

✅ Frontend running on http://localhost:3000

---

## ✨ You're Done!

Open browser: **http://localhost:3000**

You should see:
- 🌑 Beautiful dark theme
- 💜 Purple neon accents
- ✨ Glass-morphic effects
- 🎬 VidTube logo

---

## 🧪 Quick Test

1. Click **"Sign Up"**
2. Create account:
   - Name: Test User
   - Username: testuser
   - Email: test@test.com
   - Password: password123
3. You'll be logged in automatically!

---

## 📁 What You Have

### Backend (44+ APIs)
```
✓ User auth (register, login, logout)
✓ Video management (upload, get, update, delete)
✓ Likes system
✓ Comments
✓ Subscriptions
✓ Playlists
✓ Analytics
```

### Frontend (Stunning UI)
```
✓ Home page (video grid)
✓ Login/Register pages
✓ Video player page
✓ Search functionality
✓ Comments section
✓ Responsive design
```

---

## 🎯 Next Steps

### Explore the Frontend
- Browse videos on homepage
- Use search bar
- Click on a video to watch
- Try login/register
- Check user profile menu

### Test the APIs
- Open `backend/test.http` in VS Code
- Install "REST Client" extension
- Run test cases

### Read Documentation
- `README.md` - Project overview
- `SETUP_GUIDE.md` - Detailed setup
- `backend/API_DOCUMENTATION.md` - All APIs
- `frontend/README.md` - Frontend guide

---

## 🐛 Quick Fixes

### Backend won't start?
```bash
# Kill process on port 8000
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

### MongoDB not connected?
```bash
# Start MongoDB
mongod

# Or check if running
mongo
```

### Cloudinary upload fails?
- Double-check credentials in `.env`
- Make sure all three values are correct

### Frontend shows blank page?
- Check backend is running (port 8000)
- Open browser console (F12)
- Hard refresh (Ctrl+Shift+R)

---

## 📚 Full Documentation

For complete information:
- **Backend**: See `backend/API_DOCUMENTATION.md`
- **Frontend**: See `frontend/README.md`
- **Setup**: See `SETUP_GUIDE.md`
- **Structure**: See `PROJECT_STRUCTURE.md`

---

## 🎨 What Makes This Special?

### Stunning Design
- Modern dark theme (#0A0A0F)
- Neon purple accents (#6366F1)
- Glass-morphism effects
- Smooth animations
- Responsive everywhere

### Professional Code
- Clean architecture
- Best practices
- Well documented
- Production-ready
- Fully tested

### Complete Features
- Full authentication
- Video management
- Social features
- Analytics
- Search & filters

---

## 💡 Pro Tips

1. **Keep both terminals open**
   - One for backend
   - One for frontend

2. **Watch console logs**
   - Backend: See API calls
   - Frontend: See errors

3. **Use test.http file**
   - Test APIs easily
   - No Postman needed

4. **Customize colors**
   - Edit `frontend/tailwind.config.js`
   - Change theme instantly

---

## ⚡ Commands Cheat Sheet

### Backend
```bash
cd backend
npm run dev          # Start development
npm start            # Start production
```

### Frontend
```bash
cd frontend
npm run dev          # Start development
npm run build        # Build for production
npm run preview      # Preview production build
```

---

## 🎉 You're All Set!

Your complete video platform is running!

- Backend: http://localhost:8000
- Frontend: http://localhost:3000

**Start exploring and building! 🚀**

---

**Need Help?**
- Check `SETUP_GUIDE.md` for detailed instructions
- See `PROJECT_STRUCTURE.md` for file locations
- Read `backend/API_DOCUMENTATION.md` for API details

**Happy Coding! ☕️**
