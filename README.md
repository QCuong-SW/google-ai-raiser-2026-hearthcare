# LifeLink AI — Smart Emergency Medical Triage & Real-Time Hospital Navigation System (Bình Thạnh District, HCMC)

> **LifeLink AI** is an advanced emergency medical triage and clinical decision-support system powered by **Google Gemini Multimodal Vision AI** combined with a **5-Factor Geospatial Hospital Ranking Algorithm** tailored for **Bình Thạnh District, Ho Chi Minh City, Vietnam**.

---

## 1. Key System Features

### 1.1. Google Gemini Multimodal Vision AI Triage Engine
- **3 Distinct AI Execution Modes (ChatGPT-Style Animated Model Picker)**:
  - **Hospital Triage (`triage_hospital`)**: Evaluates emergency severity level and ranks the top nearby hospitals based on real GPS coordinates.
  - **Deep Clinical Symptom Analysis (`analyze_symptom`)**: Performs deep medical analysis of symptoms, visual skin lesions/rashes, medication labels, and prescription OCR while matching patient Medical Profiles.
  - **Emergency First Aid Protocols (`first_aid`)**: Delivers step-by-step emergency first-aid guidelines (`Step 1`, `Step 2`, `Step 3`), action steps, and critical 115 emergency warnings.
- **Multimodal Vision AI & OCR**: Supports image uploads and direct clipboard image pasting (`Ctrl + V`) for visual assessment of skin lesions, wounds, rashes, test results, and medicine labels.
- **5-Turn Conversation Memory**: Maintains context across recent message turns for seamless, continuous medical consultation.

### 1.2. 5-Factor Geospatial Hospital Ranking Algorithm
Ranks 8 top-tier hospitals located within Bình Thạnh District (Nhan Dan Gia Dinh Hospital, Vinmec Central Park International Hospital, Ho Chi Minh City Oncology Hospital, Binh Thanh District Hospital, etc.) based on a weighted multi-factor scoring formula:
$$\text{Score} = (w_1 \cdot \text{Proximity}) + (w_2 \cdot \text{Emergency 24/7}) + (w_3 \cdot \text{Specialty Match}) + (w_4 \cdot \text{User Rating}) + (w_5 \cdot \text{Insurance Acceptance})$$

### 1.3. 1-Tap Emergency Bypass
- Automatically detects life-threatening conditions (chest pain, stroke symptoms, acute dyspnea, severe hemorrhage) to trigger a **1-Tap Emergency Modal**, providing immediate hotline dialing and Google Maps navigation.

### 1.4. Real GPS Distance & Dynamic Travel Time (Haversine Formula)
- Calculates exact spherical distance ($\text{km}$) using the Haversine formula from device GPS coordinates to hospital locations.
- Computes estimated urban travel times ($\text{minutes}$) based on real-time traffic speeds ($22\text{ km/h}$).

### 1.5. Vietnamese Voice-to-Text Speech Recognition
- Web Speech API integration (`vi-VN`) supporting continuous speech input, seamless word concatenation, and auto-stop on submission.

### 1.6. Medical Profile Integration & Personalized Allergy Warnings
- Factors in patient medical records (Blood type, Penicillin allergies, Hypertension, Type 2 Diabetes) to provide personalized, safe medical advisories.

---

## 2. Technology Stack

### Frontend (Client)
- **Framework & Language**: React 18, TypeScript, Vite
- **UI & Styling**: Tailwind CSS, Emerald Green Theme (`#059669`), Glassmorphism Design
- **Icons & Speech**: Lucide React, Web Speech API (`vi-VN`)

### Backend (Server)
- **Framework**: NestJS (Package-by-Feature Modular Architecture)
- **AI SDK**: `@google/genai` (Google Gemini Vision AI)
- **Authentication**: Passport JWT (7-day token expiration), Bcrypt password hashing, Google OAuth 2.0
- **Email Verification**: Nodemailer via Gmail SMTP

### Database & Deployment
- **Database**: Serverless PostgreSQL (Neon Cloud DB) / TypeORM v0.3
- **Containerization**: Multi-Stage Dockerfile, Docker Compose
- **Cloud Hosting**: Google Cloud Run & Google AI Studio (`https://ai.dev`)

---

## 3. Project Directory Structure

```text
lifelink-ai/
├── Dockerfile                  # Multi-stage Fullstack Dockerfile for Google Cloud Run
├── deploy_cloudrun.ps1         # Automated PowerShell Cloud Run deployment script
├── package.json                # Root package configuration for Google AI Studio
├── README.md                   # System Documentation
│
├── client/                     # React Frontend (Vite)
│   ├── src/
│   │   ├── components/         # MapView, Navbar, Sidebar, EmergencyModal, AuthModal, HospitalCard
│   │   ├── pages/              # ChatPage, HospitalsPage, ProfilePage, ContactPage
│   │   ├── services/           # api.ts (Self-Contained Client Triage & API Integration)
│   │   └── App.tsx             # Root Application Layout & State Management
│   └── package.json
│
└── server/                     # NestJS Backend API Server
    ├── neon_schema.sql         # PostgreSQL DDL & Seed Data for Bình Thạnh Hospitals
    ├── src/
    │   ├── main.ts             # NestJS Bootstrap & SPA Static File Serving
    │   ├── auth/               # Passport JWT, Google OAuth, Email Verification
    │   ├── gemini/             # Google Gemini Vision AI Integration Service
    │   ├── chat/               # Session & Message Persistence
    │   ├── triage/             # Triage Controller (/api/triage/analyze)
    │   ├── hospital/           # 5-Factor Hospital Ranking Engine
    │   └── user/               # User Entity & Medical Profile Service
    └── package.json
```

---

## 4. Local Setup & Execution

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Google Gemini API Key**: Obtain from [Google AI Studio](https://ai.dev)

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Configure Environment Variables
Create `server/.env` with the following keys:
```env
PORT=3001
JWT_SECRET=lifelink_super_secret_jwt_key_2026
GEMINI_API_KEY=your_gemini_api_key
GOOGLE_CLIENT_ID=your_google_client_id
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
DB_HOST=ep-xxxx.ap-southeast-1.aws.neon.tech
DB_PORT=5432
DB_USERNAME=neondb_owner
DB_PASSWORD=your_neon_password
DB_NAME=neondb
```

### Step 3: Run Local Server & Client
```bash
# Start NestJS Backend Server (Port 3001)
cd server && npm run start

# Start React Frontend Client (Port 5173) in a new terminal window
cd client && npm run dev
```

---

## 5. Deployment Options

### Option 1: Google AI Studio (`https://ai.dev`) - 1-Click Browser Deployment
1. Go to **[Google AI Studio](https://ai.dev)**.
2. Select **Import App** and choose the `lifelink-ai-aistudio.zip` archive (or repository link).
3. Set build command to `npm run build` and click **Publish**.

### Option 2: Google Cloud Run (Automated Container Deployment)
Run the automated PowerShell deployment script:
```powershell
.\deploy_cloudrun.ps1
```

---

## 6. Default Test Accounts

| Role | Email | Password | Access Privileges |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@lifelink.ai` | `123456` | Hospital CRUD management, feedback logs |
| **User** | `user@lifelink.ai` | `123456` | Emergency Triage, Medical Profile, Chat isolation |

---

## 7. License & Security

- Environment secrets (`.env`) are strictly protected via `.gitignore`.
- Passwords are salted and hashed using `bcrypt` (10 salt rounds).
- All API interactions are secured via Passport JWT & Role-Based Access Control Guards.

---

**LifeLink AI — Every Second Counts.**  
*Developed for Google AI Raiser Vietnam 2026.*
