# LifeLink AI — Guide Cấu Hình & Deploy Hệ Thống

Tài liệu bàn giao quy trình cấu hình và triển khai (Deploy) toàn bộ ứng dụng **LifeLink AI** (NestJS Backend + React Frontend + Neon PostgreSQL Database).

---

## 1. Cấu Hình Cơ Sở Dữ Liệu Neon PostgreSQL

### Bước 1: Nạp Schema vào Neon
File schema SQL chuẩn đã được khởi tạo tại: `server/neon_schema.sql`.

Chạy nội dung file `server/neon_schema.sql` trên **Neon SQL Editor** để tạo đầy đủ các bảng:
- `users` (Tài khoản người dùng, phân quyền, Google OAuth)
- `medical_profiles` (Hồ sơ y tế cá nhân)
- `chat_sessions` & `chat_messages` (Lịch sử hội thoại AI Triage)
- `hospitals` (Danh sách bệnh viện & vị trí GPS)
- `feedbacks` (Góp ý từ người dùng)
- `email_verification_tokens`, `password_reset_tokens`, `refresh_tokens`

---

## 2. Biến Môi Trường (Environment Variables)

### Backend (`server/.env`)
```env
PORT=3001
JWT_SECRET=lifelink_super_secret_jwt_key_2026
GEMINI_API_KEY=your_gemini_api_key_here

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com

# Gmail SMTP Email Verification
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password_here

# Neon PostgreSQL Database Connection
DB_HOST=ep-xxxx.ap-southeast-1.aws.neon.tech
DB_PORT=5432
DB_USERNAME=neondb_owner
DB_PASSWORD=mật_khẩu_neon
DB_NAME=neondb
```

### Frontend (`client/.env`)
```env
VITE_API_BASE_URL=https://your-backend-domain.com/api
```

---

## 3. Lệnh Biên Dịch & Khởi Chạy (Build & Run Commands)

### Phía Backend (NestJS Server)
```bash
cd server
npm install
npm run build
npm run start:prod
```

### Phía Frontend (Vite React Client)
```bash
cd client
npm install
npm run build
```
*(Thư mục đầu ra sản phẩm: `client/dist/`)*

---

## 4. Gợi Ý Hạ Tầng Deploy (Deployment Providers)
- **Database**: [Neon.tech](https://neon.tech) (PostgreSQL Serverless).
- **Backend**: [Render.com](https://render.com) / [Railway.app](https://railway.app) / [Fly.io](https://fly.io) (NestJS Node.js Server).
- **Frontend**: [Vercel](https://vercel.com) / [Netlify](https://netlify.com) / [Cloudflare Pages](https://pages.cloudflare.com) (Single Page Application).
