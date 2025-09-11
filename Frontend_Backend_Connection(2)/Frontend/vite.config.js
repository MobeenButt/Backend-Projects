import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  server:{
    proxy:{
      '/api': 'http://localhost:3000'
    },
  },
  plugins: [react()],
})

// Proxy is use to connect frontend and backend servers
// like frontend server is running on 5173 and backend server is running on 3000 so we need to connect both servers so that we can fetch data from backend server to frontend server
// so we use proxy to connect both servers
// so when we make a request to /api/jokes it will be forwarded to http://localhost:3000/api/jokes



//  IMPORTANT NOTE

// /api sy phly append hojaye ga localhost:3000   or proxy ki wajha sy server chal rha ho ga 5173 or backend server chal rha ho ga 3000 pr yani server ko lgy ga k same origin sy request ai ha yani 5173 sy to wo 5173 pr hi request kray ga or 3000 pr ni kray ga is liya proxy use krty hain taki wo 3000 pr request kray