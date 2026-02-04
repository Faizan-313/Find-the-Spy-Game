# Spy Game - Deployment Guide

## Overview
This is a multiplayer spy game with a Node.js/Express backend and React/Vite frontend.

- **Backend**: Deployed on Render
- **Frontend**: Deployed on Vercel

## Backend Deployment (Render)

### Prerequisites
- Render account
- GitHub repository with code pushed

### Steps

1. **Create a new Web Service on Render**
   - Go to [render.com](https://render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the backend directory (or leave blank if root)

2. **Configure Environment Variables**
   In Render dashboard, add:
   ```
   NODE_ENV=production
   FRONTEND_URL=https://your-vercel-app.vercel.app
   ```
   (Replace with your actual Vercel frontend URL)

3. **Build Command**
   ```
   npm run build
   ```

4. **Start Command**
   ```
   npm start
   ```

5. **Deploy**
   - Render will automatically deploy on git push
   - Your backend URL will be something like: `https://your-app.onrender.com`

## Frontend Deployment (Vercel)

### Prerequisites
- Vercel account
- GitHub repository with code pushed

### Steps

1. **Import Project on Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New..." → "Project"
   - Import your GitHub repository

2. **Configure Project**
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Install Command: `npm install`
   - Output Directory: `dist`

3. **Environment Variables**
   In Vercel dashboard, add for Production:
   ```
   VITE_API_URL=https://your-render-app.onrender.com
   ```
   (Replace with your actual Render backend URL)

4. **Deploy**
   - Vercel will automatically deploy on git push
   - Your frontend URL will be something like: `https://your-app.vercel.app`

## Important Notes

1. **CORS Configuration**
   - The backend automatically configures CORS based on `NODE_ENV`
   - In production, it reads `FRONTEND_URL` from environment variables
   - Update both `.env.production` files with actual URLs after getting them from Render and Vercel

2. **Port Configuration**
   - Backend listens on the PORT provided by Render (or 3000 locally)
   - Ensure Socket.IO connections work properly in production

3. **First Time Setup**
   1. Deploy backend first to get the backend URL
   2. Update frontend `.env.production` with backend URL
   3. Deploy frontend with updated URL
   4. Update backend `.env` in Render with frontend URL if needed

## Local Development

**Backend:**
```bash
cd backend
npm install
npm run dev
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

The frontend will connect to `http://localhost:3000` (from `.env`)

## Troubleshooting

**CORS Errors**: Make sure `FRONTEND_URL` in Render matches your Vercel URL exactly
**Connection Issues**: Check that both URLs are correct in environment variables
**Build Fails**: Run `npm run build` locally to test before pushing
