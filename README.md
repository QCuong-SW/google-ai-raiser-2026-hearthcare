# LifeLink AI - 24/7 Medical Triage & Hospital Ranking System (Binh Thanh District)

> **LifeLink AI** is an intelligent emergency medical symptom triage system that uses **Google Gemini 3.6 Flash Multimodal Vision AI**, combined with a **5-factor Hospital Ranking Algorithm** optimized specifically for **Binh Thanh District, Ho Chi Minh City**.

---

## 1. Key Features

### 1.1. Google Gemini 3.6 Flash Multimodal Vision AI Triage

* **3 Independent AI Modes (Animated Model Picker Dropdown)**:

  * **Find Medical Facilities & Hospitals**: Classifies the triage severity level and recommends the most suitable hospital.
  * **Symptom Analysis**: Provides in-depth clinical analysis, potential risk causes, and recommends the appropriate medical specialist.
  * **First Aid for Symptoms**: Provides step-by-step emergency first-aid instructions (`Step 1`, `Step 2`, `Step 3`) and dangerous contraindications.
* **Multimodal Vision AI Integration**: Supports directly pasting images from the Clipboard (`Ctrl + V`) or uploading clinical images (rashes, wounds, prescriptions, test results).
* **5-Turn AI Context Memory**: Automatically stores and maintains the context of the 5 most recent conversation turns in the Database to provide continuous and coherent AI responses.

### 1.2. 5-Factor Hospital Ranking Algorithm for Binh Thanh District

Ranks a list of 8 leading hospitals in Binh Thanh District (Gia Dinh People's Hospital, Vinmec Central Park, Ho Chi Minh City Oncology Hospital, Binh Thanh District Hospital...) based on a weighted formula consisting of 5 factors:

$$\text{Score} = (w_1 \cdot \text{GPS Distance}) + (w_2 \cdot \text{24/7 Emergency Service}) + (w_3 \cdot \text{Specialty Match}) + (w_4 \cdot \text{Rating }) + (w_5 \cdot \text{Health Insurance})$$

### 1.3. 1-Tap Emergency Bypass

* Automatically detects life-threatening symptoms (severe chest pain, stroke, difficulty breathing, unilateral numbness...) to activate the **1-Tap Emergency** interface, displaying the hospital emergency hotline and an instant navigation button.

### 1.4. Real-Time GPS Location & Google Maps Integration

* Integrates HTML5 High Accuracy Geolocation to obtain the user's actual GPS location from their device.
* HD Vector Map (Google Maps Vector, Satellite, Dark Mode) with 1-Click navigation to Google Maps.

### 1.5. ChatGPT-Style Interface & Chat Management

* AI mode switching dropdown with a `Spring Pop-out` animation (`cubic-bezier(0.34, 1.56, 0.64, 1)`).
* Automatically generates chat titles in the Sidebar based on the user's first prompt.
* A chat folder tree in the Sidebar allows users to review chat history or delete conversations.

---

## 2. Technology Stack

### Frontend (Client)

* **Core**: React 18, TypeScript, Vite
* **Styling**: Vanilla CSS, TailwindCSS, Glassmorphism Design
* **Icons & Maps**: Lucide React, Leaflet, React-Leaflet

### Backend (Server)

* **Framework**: NestJS (Package-by-Feature Architecture)
* **AI Engine**: `@google/genai` SDK (Google Gemini 3.6 Flash Vision AI)
* **Authentication**: Passport JWT (7-day JWT expiration), Bcrypt password hashing
* **Security & Authorization**: Custom Decorators (`@Roles()`), RolesGuard (Admin / User)

### Database & Containerization

* **Database**: PostgreSQL 16 (Supports SQLite `better-sqlite3` zero-config fallback)
* **ORM**: TypeORM v0.3
* **Container**: Docker, Docker-Compose

---

## 3. Project Structure

```text
lifelink-ai/
├── docker-compose.yml          # Containerization for PostgreSQL & NestJS
├── README.md                   # Project documentation
│
├── client/                     # Frontend React (Vite)
│   ├── src/
│   │   ├── components/         # MapView, Navbar, Sidebar, EmergencyModal, ScoreBreakdownModal
│   │   ├── pages/              # ChatPage, HospitalsPage, ProfilePage, ContactPage
│   │   ├── services/           # api.ts (Fetch & Triage API Client)
│   │   └── App.tsx             # Main Layout & Tab Routing
│   └── package.json
│
└── server/                     # Backend NestJS (Package-by-Feature)
    ├── .env                    # GEMINI_API_KEY, PORT=3001, JWT_SECRET
    ├── init-schema.sql         # PostgreSQL DDL & Seed Data for 8 Binh Thanh District Hospitals
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

## 4. Getting Started

### Prerequisites

* **Node.js**: v18.0.0 or higher
* **npm**: v9.0.0 or higher
* **Google Gemini API Key** (Get one for free at [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey))

---

### Method 1: Local Development

#### 1. Start the Backend (NestJS Server):

```bash
cd server
npm install
npm run start
```

*The Server API will run at:* `http://localhost:3001`

#### 2. Start the Frontend (React Client):

Open a new Terminal window:

```bash
cd client
npm install
npm run dev
```

*The Web Interface will run at:* `http://localhost:5173`

---

### Method 2: Docker (Docker Compose)

Start **PostgreSQL Database** and **NestJS Backend** simultaneously:

```bash
docker-compose up --build
```

---

## 5. Default Test Accounts

| Role      | Email               | Password | Permissions                                           |
| :-------- | :------------------ | :------- | :---------------------------------------------------- |
| **Admin** | `admin@lifelink.ai` | `123456` | Full access to Add/Edit Hospitals & View Feedback     |
| **User**  | `user@lifelink.ai`  | `123456` | Medical User, AI Triage Chat, Medical Profile Storage |

---
