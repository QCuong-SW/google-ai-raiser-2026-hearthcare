# LifeLink AI — System Configuration & Deployment Guide

Technical handoff guide for configuring and deploying the complete **LifeLink AI** fullstack system (NestJS Backend API + React Frontend + Neon PostgreSQL Database).

---

## 1. Neon PostgreSQL Database Configuration

### Step 1: Execute Schema DDL Script in Neon
The database schema DDL script is located at: `server/neon_schema.sql`.

Run the complete contents of `server/neon_schema.sql` on the **Neon SQL Editor** to create all tables and indexes:
- `users` (User accounts, RBAC roles, Google OAuth integration)
- `medical_profiles` (Patient medical profile records)
- `chat_sessions` & `chat_messages` (AI Triage conversation history)
- `hospitals` (Bình Thạnh hospital records & GPS coordinates)
- `feedbacks` (User feedback submissions)
- `email_verification_tokens`, `password_reset_tokens`, `refresh_tokens`

---

## 2. Environment Variables Configuration

### Backend (`server/.env`)
```env
PORT=3001
JWT_SECRET=lifelink_super_secret_jwt_key_2026
GEMINI_API_KEY=your_gemini_api_key_here

# Google OAuth 2.0
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com

# Gmail SMTP Email Verification Dispatch
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password_here

# Neon PostgreSQL Database Connection
DB_HOST=ep-xxxx.ap-southeast-1.aws.neon.tech
DB_PORT=5432
DB_USERNAME=neondb_owner
DB_PASSWORD=your_neon_password_here
DB_NAME=neondb
```

### Frontend (`client/.env`)
```env
VITE_API_BASE_URL=https://your-backend-domain.com/api
```

---

## 3. Build & Execution Commands

### Backend (NestJS Server)
```bash
cd server
npm install
npm run build
npm run start:prod
```

### Frontend (Vite React Client)
```bash
cd client
npm install
npm run build
```
*(Build artifact directory: `client/dist/`)*

---

## 4. Recommended Infrastructure & Deployment Providers
- **Database**: [Neon.tech](https://neon.tech) (Serverless PostgreSQL).
- **Backend API**: [Google Cloud Run](https://cloud.google.com/run) / [Render.com](https://render.com) / [Fly.io](https://fly.io) (Containerized Node.js Server).
- **Frontend SPA**: [Google AI Studio](https://ai.dev) / [Vercel](https://vercel.com) / [Netlify](https://netlify.com) (Single Page Application).
