# SIGNBRIDGE AI — Production Deployment Guide

## 1. Architecture Overview
- **Frontend:** Single Page Application (React, Vite, Tailwind CSS) deployed to **Vercel** or **Netlify**.
- **Backend API:** Node.js Express server deployed to **Render**, **Railway**, or **Google Cloud Run**.
- **Database & Auth:** **Supabase PostgreSQL** with Row Level Security.
- **Model Assets:** Hosted statically in `/public/models/asl-static-v1/` or Supabase Storage.

## 2. Environment Variables Configuration
Set the following environment variables on your deployment providers:

### Server (Render / Railway / Cloud Run)
```env
NODE_ENV=production
PORT=5000
CLIENT_URL=https://your-signbridge-app.vercel.app
API_BASE_URL=https://your-api.onrender.com/api/v1

SUPABASE_URL=https://xyzcompany.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1Ni...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1Ni...

GEMINI_API_KEY=AIzaSy...
GEMINI_MODEL=gemini-2.5-flash

RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=120
```

### Client (Vercel)
```env
VITE_API_URL=https://your-api.onrender.com/api/v1
```

## 3. Database Migration
Execute `supabase/migrations/20261113000000_init_signbridge.sql` in the Supabase SQL Editor.
Follow with `supabase/seed.sql` to populate all 26 verified ASL alphabet entries and active model registry data.

## 4. Build Commands
```bash
# Frontend build
npm run build --workspace=apps/client

# Backend build
npm run build --workspace=apps/server
```
