# 🚀 Complete Setup Guide

## 📋 Prerequisites Checklist

Before starting, make sure you have:

- ✅ Node.js installed (v18+ recommended)
- ✅ MongoDB installed (local) or MongoDB Atlas account
- ✅ Cloudinary account (free tier is enough)
- ✅ Git installed
- ✅ VS Code or your favorite code editor

---

## 🎯 Step-by-Step Setup

### Step 1: Project Structure ✅

Your project is already organized:
```
Project/
├── backend/     # Backend server
└── frontend/    # React frontend
```

### Step 2: Backend Setup 🔧

#### 2.1 Navigate to Backend
```bash
cd backend
```

#### 2.2 Install Dependencies
```bash
npm install
```

Expected packages:
- express, mongoose, cloudinary
- jsonwebtoken, bcryptjs
- multer, cookie-parser
- cors, dotenv

#### 2.3 Configure Environment
Create `.env` file in `backend/` directory:

```env
# Server
PORT=8000

# Database
MONGODB_URI=mongodb://localhost:27017/videoPlatform

# CORS
CORS_ORIGIN=http://localhost:3000

# JWT Secrets (Change these!)
ACCESS_TOKEN_SECRET=your-very-secret-access-token-key-change-this
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your-very-secret-refresh-token-key-change-this
REFRESH_TOKEN_EXPIRY=10d

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

#### 2.4 Get Cloudinary Credentials

1. Go to https://cloudinary.com
2. Sign up for free account
3. Go to Dashboard
4. Copy:
   - Cloud Name
   - API Key
   - API Secret
5. Paste into `.env` file

#### 2.5 Setup MongoDB

**Option A: Local MongoDB**
```bash
# Start MongoDB service
mongod

# Or on Windows (if installed as service):
net start MongoDB
```

**Option B: MongoDB Atlas (Cloud)**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free cluster
3. Get connection string
4. Update `MONGODB_URI` in `.env`:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/videoPlatform
```

#### 2.6 Start Backend Server
```bash
npm run dev
```

Expected output:
```
Server is running on port 8000
MongoDB connected!! DB HOST: localhost
```

✅ Backend is ready!

---

### Step 3: Frontend Setup 🎨

#### 3.1 Open New Terminal

Keep backend terminal running, open a new one.

#### 3.2 Navigate to Frontend
```bash
cd frontend
```

#### 3.3 Install Dependencies
```bash
npm install
```

Expected packages:
- react, react-dom, react-router-dom
- vite, tailwindcss
- zustand, axios
- framer-motion, react-hot-toast
- react-icons

#### 3.4 Start Frontend Server
```bash
npm run dev
```

Expected output:
```
  VITE v5.0.8  ready in 500 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

✅ Frontend is ready!

---

## 🧪 Testing Your Setup

### Test 1: Backend Health Check

Open browser or Postman:
```
GET http://localhost:8000/api/v1/users/current
```

Expected: 401 Unauthorized (This is correct! You're not logged in yet)

### Test 2: Frontend Loads

Open browser:
```
http://localhost:3000
```

Expected: Beautiful dark-themed homepage with "VidTube" logo

### Test 3: Register a User

1. Click "Sign Up" button
2. Fill in the form:
   - Full Name: Test User
   - Username: testuser
   - Email: test@example.com
   - Password: password123
3. Click "Create Account"

Expected: Redirected to home page, user menu appears

### Test 4: Upload Video (Backend Test)

Use `backend/test.http` file with VS Code REST Client:

1. Install "REST Client" extension in VS Code
2. Open `backend/test.http`
3. Follow test cases from top to bottom

---

## 🎨 What You Should See

### Homepage
- Dark background (#0A0A0F)
- Purple neon logo
- Search bar in center
- Video grid below
- Glassmorphic cards
- Smooth animations

### Login Page
- Centered form
- Glass effect
- Floating logo animation
- Gradient buttons
- Input fields with icons

### Video Player
- Full-width player
- Video information below
- Channel details
- Like/Subscribe buttons
- Comments section
- Related videos sidebar

---

## 🐛 Troubleshooting

### Backend Issues

#### Error: "Cannot find module..."
**Solution:**
```bash
cd backend
rm -rf node_modules
npm install
```

#### Error: "MongoDB connection failed"
**Solution:**
1. Check MongoDB is running: `mongod`
2. Verify `MONGODB_URI` in `.env`
3. Check firewall settings

#### Error: "Cloudinary upload failed"
**Solution:**
1. Verify Cloudinary credentials in `.env`
2. Check internet connection
3. Ensure API key is active

#### Error: "Port 8000 already in use"
**Solution:**
```bash
# Kill the process using port 8000
# Windows:
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Mac/Linux:
lsof -ti:8000 | xargs kill -9
```

### Frontend Issues

#### Error: "Cannot resolve module..."
**Solution:**
```bash
cd frontend
rm -rf node_modules
npm install
```

#### Error: "Port 3000 already in use"
**Solution:**
Vite will automatically try 3001, 3002, etc.

#### Blank Page
**Solution:**
1. Check browser console for errors
2. Ensure backend is running
3. Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

#### API Calls Failing
**Solution:**
1. Check backend is running on port 8000
2. Verify proxy in `vite.config.js`
3. Check browser console for CORS errors

---

## 📁 File Locations

### Backend Files
```
backend/
├── .env                    # Your configuration (CREATE THIS!)
├── .env.sample            # Template
├── src/
│   ├── index.js           # Entry point
│   ├── app.js             # Express app
│   └── controllers/       # All your logic
├── test.http              # API tests
└── README.md
```

### Frontend Files
```
frontend/
├── src/
│   ├── main.jsx          # Entry point
│   ├── App.jsx           # Main component
│   ├── index.css         # Global styles
│   ├── components/       # UI components
│   ├── pages/            # Page components
│   ├── services/         # API calls
│   └── store/            # State management
├── index.html
├── vite.config.js        # Vite configuration
└── tailwind.config.js    # Tailwind configuration
```

---

## 🎯 Next Steps

Once everything is running:

1. **Explore the Frontend**
   - Browse homepage
   - Register/login
   - Search videos
   - View video player

2. **Test API Endpoints**
   - Use `backend/test.http`
   - Try all CRUD operations
   - Test authentication flow

3. **Customize**
   - Change colors in `tailwind.config.js`
   - Modify components
   - Add new features

4. **Build Additional Pages**
   - Upload page
   - Channel page
   - Dashboard
   - Settings

---

## 📞 Getting Help

### Check Documentation
- `backend/API_DOCUMENTATION.md` - Complete API reference
- `frontend/README.md` - Frontend guide
- `README.md` - Project overview

### Common Commands

**Backend:**
```bash
npm run dev      # Start development server
npm start        # Start production server
```

**Frontend:**
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```

---

## ✅ Setup Checklist

Before starting development, ensure:

- ✅ Node.js installed
- ✅ MongoDB running
- ✅ Backend dependencies installed
- ✅ Backend .env configured
- ✅ Backend server running (port 8000)
- ✅ Frontend dependencies installed
- ✅ Frontend server running (port 3000)
- ✅ Can access http://localhost:3000
- ✅ Can register/login successfully
- ✅ Beautiful dark theme visible

---

## 🎉 You're All Set!

Your stunning video platform is ready for development!

**Backend**: http://localhost:8000  
**Frontend**: http://localhost:3000

Start building amazing features! 🚀

---

**Need help?** Check the documentation or troubleshooting section above.

**Happy Coding!** ☕️
