# LifeLink AI - System Triage Y Tế & Xếp Hạng Bệnh Viện 24/7 (Quận Bình Thạnh)

> **LifeLink AI** là hệ thống phân loại triệu chứng y tế khẩn cấp thông minh sử dụng **Google Gemini 3.6 Flash Multimodal Vision AI** kết hợp với **Thuật toán xếp hạng 5 yếu tố bệnh viện** tối ưu riêng cho địa bàn **Quận Bình Thạnh, TP. Hồ Chí Minh**.

---

## 1. Tính Năng Nổi Bật (Key Features)

### 1.1. Google Gemini 3.6 Flash Multimodal Vision AI Triage
- **3 Chế độ AI độc lập (Animated Model Picker Dropdown)**:
  - **Tìm nơi khám & Bệnh viện**: Phân loại mức độ Triage và gợi ý bệnh viện phù hợp nhất.
  - **Phân tích triệu chứng**: Chẩn đoán lâm sàng sâu, nguyên nhân rủi ro và khuyên dùng bác sĩ chuyên khoa.
  - **Sơ cứu với triệu chứng**: Hướng dẫn thao tác sơ cứu khẩn cấp từng bước (`Bước 1`, `Bước 2`, `Bước 3`) & chống chỉ định nguy hiểm.
- **Tích hợp Vision AI đa phương thức**: Hỗ trợ dán ảnh trực tiếp từ Clipboard (`Ctrl + V`) hoặc tải ảnh lâm sàng (Mẩn ngứa, vết thương, toa thuốc, kết quả xét nghiệm).
- **Bộ nhớ AI 5-Turn Context Memory**: Tự động lưu và duy trì ngữ cảnh 5 câu hội thoại gần nhất trong Database giúp AI phản hồi liền mạch.

### 1.2. Thuật Toán Xếp Hạng 5 Yếu Tố Bệnh Viện Bình Thạnh
Xếp hạng danh sách 8 Bệnh viện tuyến đầu tại Quận Bình Thạnh (Nhân dân Gia Định, Vinmec Central Park, Ung Bướu TP.HCM, Bệnh viện Quận Bình Thạnh...) dựa trên công thức trọng số 5 yếu tố:
$$\text{Score} = (w_1 \cdot \text{Khoảng cách GPS}) + (w_2 \cdot \text{Cấp cứu 24/7}) + (w_3 \cdot \text{Khớp Chuyên khoa}) + (w_4 \cdot \text{Đánh giá ⭐}) + (w_5 \cdot \text{BHYT})$$

### 1.3. Cấp Cứu Khẩn Cấp 1-Tap Bypass
- Tự động phát hiện các triệu chứng đe dọa tính mạng (Đau ngực dữ dội, Đột quỵ, Khó thở, Tê nửa người...) để kích hoạt giao diện **Cấp cứu khẩn cấp 1-Tap**, hiển thị số hotline bệnh viện và nút chỉ đường tức thì.

### 1.4. Định Vị GPS Vị Trí Thực & Bản Đồ Google Maps
- Tích hợp HTML5 High Accuracy Geolocation lấy vị trí GPS thực tế trên thiết bị của người dùng.
- Bản đồ Vector HD (Google Maps Vector, Vệ Tinh, Dark Mode) với chức năng 1-Click dẫn đường sang Google Maps.

### 1.5. Giao Diện ChatGPT-Style & Quản Lý Đoạn Chat
- Dropdown chuyển đổi chế độ AI với hiệu ứng nảy `Spring Pop-out` (`cubic-bezier(0.34, 1.56, 0.64, 1)`).
- Tự động đặt tên đoạn chat trên Sidebar theo Prompt đầu tiên của người dùng.
- Cây thư mục đoạn chat trên Sidebar cho phép xem lại lịch sử hoặc xóa cuộc hội thoại.

---

## 2. Công Nghệ Sử Dụng (Tech Stack)

### Frontend (Client)
- **Core**: React 18, TypeScript, Vite
- **Styling**: Vanilla CSS, TailwindCSS, Glassmorphism Design
- **Icons & Maps**: Lucide React, Leaflet, React-Leaflet

### Backend (Server)
- **Framework**: NestJS (Kiến trúc Package-by-Feature)
- **AI Engine**: `@google/genai` SDK (Google Gemini 3.6 Flash Vision AI)
- **Authentication**: Passport JWT (Mã JWT hạn 7 ngày), Bcrypt password hashing
- **Security & Authorization**: Custom Decorators (`@Roles()`), RolesGuard (Admin / User)

### Database & Containerization
- **Database**: PostgreSQL 16 (Hỗ trợ SQLite `better-sqlite3` fallback zero-config)
- **ORM**: TypeORM v0.3
- **Container**: Docker, Docker-Compose

---

## 3. Cấu Trúc Thư Mục Dự Án (Project Structure)

```text
lifelink-ai/
├── docker-compose.yml          # Containerization cho PostgreSQL & NestJS
├── README.md                   # Tài liệu hướng dẫn dự án
│
├── client/                     # Frontend React (Vite)
│   ├── src/
│   │   ├── components/         # MapView, Navbar, Sidebar, EmergencyModal, ScoreBreakdownModal
│   │   ├── pages/              # ChatPage, HospitalsPage, ProfilePage, ContactPage
│   │   ├── services/           # api.ts (Fetch & Triage API Client)
│   │   └── App.tsx                # Main Layout & Tab Routing
│   └── package.json
│
└── server/                     # Backend NestJS (Package-by-Feature)
    ├── .env                    # GEMINI_API_KEY, PORT=3001, JWT_SECRET
    ├── init-schema.sql         # PostgreSQL DDL & Seed Data 8 Bệnh viện Bình Thạnh
    ├── src/
    │   ├── main.ts             # NestJS Bootstrap (Port 3001)
    │   ├── app.module.ts       # Root Module & TypeORM DB Config
    │   ├── auth/               # Register, Login, JWT Strategy, RolesGuard
    │   ├── gemini/             # Google Gemini 3.6 Flash Vision AI Service
    │   ├── chat/               # ChatSession, ChatMessage, 5-Turn Memory
    │   ├── triage/             # TriageController (/api/triage/analyze)
    │   ├── hospital/           # HospitalEntity, 5-Factor Ranking Algorithm
    │   ├── user/               # User Entity, MedicalProfile Entity
    │   └── feedback/           # Feedback Controller & Service
    └── package.json
```

---

## 4. Hướng Dẫn Cài Đặt & Khởi Chạy (Getting Started)

### Yêu cầu môi trường (Prerequisites)
- **Node.js**: v18.0.0 trở lên
- **npm**: v9.0.0 trở lên
- **Google Gemini API Key** (Lấy miễn phí tại [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey))

---

### Cách 1: Khởi chạy Cục bộ (Local Development)

#### 1. Khởi chạy Backend (NestJS Server):
```bash
cd server
npm install
npm run start
```
*Server API sẽ chạy tại:* `http://localhost:3001`

#### 2. Khởi chạy Frontend (React Client):
Mở một cửa sổ Terminal mới:
```bash
cd client
npm install
npm run dev
```
*Giao diện Web sẽ chạy tại:* `http://localhost:5173`

---

### Cách 2: Khởi chạy bằng Docker (Docker Compose)

Khởi chạy đồng thời **PostgreSQL Database** và **NestJS Backend**:
```bash
docker-compose up --build
```

---

## 5. Tài Khoản Thử Nghiệm (Default Test Accounts)

| Vai trò (Role) | Email | Mật khẩu (Password) | Quyền hạn |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@lifelink.ai` | `123456` | Toàn quyền Thêm/Sửa Bệnh viện & Xem Ý kiến phản hồi |
| **User** | `user@lifelink.ai` | `123456` | Người dùng Y tế, Chat AI Triage, Lưu Hồ sơ Y tế |

---
