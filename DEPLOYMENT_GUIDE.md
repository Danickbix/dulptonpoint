# Dulpton Point - External Deployment Guide

## Overview
This is a complete crypto earning platform with Firebase authentication, Firestore database, and 8 interactive games. The project uses React + TypeScript frontend with Express.js backend.

## Prerequisites
- Node.js 18+ and npm
- Firebase project with Firestore and Authentication enabled
- Hosting platform account (Vercel, Netlify, Railway, etc.)

## Firebase Setup
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use existing: `dulpton-point`
3. Enable Authentication with Google and Email/Password sign-in methods
4. Enable Firestore Database
5. Add your deployment domain to Authorized domains in Authentication settings
6. Get your Firebase config values from Project Settings

## Environment Variables
Create a `.env` file with:
```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_APP_ID=your_app_id
```

## Deployment Options

### Option 1: Vercel (Recommended)
1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in project directory
3. Follow prompts to link project
4. Add environment variables in Vercel dashboard
5. Deploy with `vercel --prod`

### Option 2: Netlify
1. Build the project: `npm run build`
2. Upload `dist` folder to Netlify
3. Configure environment variables in site settings
4. Set build command: `npm run build`
5. Set publish directory: `dist`

### Option 3: Railway
1. Connect GitHub repository to Railway
2. Add environment variables in Railway dashboard
3. Railway will auto-deploy on git push

### Option 4: Render
1. Connect repository to Render
2. Set build command: `npm install && npm run build`
3. Set start command: `npm start`
4. Add environment variables

## Build Commands
- Development: `npm run dev`
- Production build: `npm run build`
- Start production: `npm start`

## Post-Deployment
1. Add your deployment URL to Firebase Authorized domains
2. Test authentication flows
3. Verify Firestore database connections
4. Check all game functionality

## Features Included
- Firebase Authentication (Google + Email/Password)
- Real-time Firestore database
- 8 interactive mini-games
- User profiles and progression system
- Task completion system
- Referral system
- Mobile-responsive design
- Dark theme with brand colors

## Support
For deployment issues, check Firebase console logs and browser developer tools for specific error messages.