# Graphix TechHire (CareerHub Pro) 🚀

**Graphix TechHire** is an enterprise-grade campus placement and recruitment ecosystem designed to seamlessly connect students, recruiters, placement administrators, and corporate trainers. 

Built with Java 21, Spring Boot 3, React 18, Tailwind CSS, PostgreSQL, and Expo SDK 57 React Native for mobile cross-platform accessibility.

---

## 🌟 Key Features

### 🔐 Authentication & Security
- **Multi-Role RBAC:** Dedicated portals for `STUDENT`, `RECRUITER`, `ADMIN`, and `TRAINER`.
- **Protected System Admin Access:** Secure routes (`/admin/*`) guarded by role-based authorization checks (`@PreAuthorize("hasRole('ADMIN')")`).
- **Resend Email OTP:** Transactional email verification for secure login and account validation.
- **Google OAuth 2.0:** One-tap sign-in integration with Google accounts.
- **Zero Secrets in Code:** Environment variable externalization for all API keys, OAuth secrets, and database credentials.

### 💼 Recruiter & ATS Pipeline
- **Candidate Pipeline Kanban:** Drag-and-drop / stage management across `Applied`, `Under Review`, `Shortlisted`, `Interview`, and `Selected`.
- **Job Posting & Eligibility Rules:** Set cut-off criteria (CGPA, allowed branches, backlogs count, batch year).
- **Interview Scheduling:** Online/Offline interview scheduling with venue details, panel members, and meeting links.

### 🎓 Student Experience & AI Tools
- **Gemini AI Resume Scoring:** Automated matching score comparing candidate profiles against job requirements.
- **One-Click Job Application:** Instant profile submission with real-time status tracking.
- **Cross-Platform Mobile App:** Expo SDK 57 React Native mobile application for Android/iOS with QR code testing on Expo Go.

### 📊 Placement Office Admin & Analytics
- **Placement Dashboard:** Analytics charts for CTC distributions, sector pie breakdowns, and monthly recruitment trends.
- **Company Management:** Approval workflows for registered employers (`Pending`, `Approved`, `Rejected`).
- **Audit Logging:** Enterprise activity tracking with color-coded audit trails for login, registration, and application actions.

---

## 🛠️ Tech Stack & Architecture

| Layer | Technologies Used |
| :--- | :--- |
| **Backend** | Java 21 LTS, Spring Boot 3, Spring Security (JWT), Spring Data JPA, Hibernate, Maven |
| **Database** | PostgreSQL 16 (HikariCP connection pool with low-memory JVM optimization) |
| **Web Frontend** | React 18 (TypeScript), Vite 5, Tailwind CSS, Lucide Icons, Recharts, React Router v6 |
| **Mobile App** | React Native (Expo SDK 57), React Navigation, Axios |
| **AI Integration** | Google Gemini API (Resume Parsing & Skill Gap Analysis) |
| **Transactional Email** | Resend API / HTTP Client |
| **Containerization** | Docker, Docker Compose, Eclipse Temurin 21 JRE |

---

## 📁 Repository Structure

```text
Graphix-tech/
├── careerhub-backend/       # Spring Boot 3 REST API Service (Java 21)
│   ├── Dockerfile           # Optimized multi-stage Docker build for Render/Koyeb
│   ├── pom.xml              # Maven configuration & dependencies
│   └── src/                 # Controllers, Services, Entities, Security filters
├── frontend/                # Vite React 18 SPA Frontend
│   ├── vercel.json          # Single Page Application routing rewrite rules
│   ├── package.json         # Node dependencies (Vite, Tailwind, Recharts)
│   └── src/                 # Components, Admin/Recruiter/Student pages, Contexts
├── mobile/                  # Expo SDK 57 Cross-Platform Mobile App
│   ├── App.tsx              # Navigation & Auth Flow
│   ├── app.json             # Expo configuration
│   └── src/                 # Student & Admin mobile screens
├── docker-compose.yml       # Full-stack Docker deployment (Backend + PostgreSQL)
└── README.md                # Documentation & Setup Guide
```

---

## 🚀 Running Locally

### Option 1: Using Docker Compose (Recommended)

Run the backend and PostgreSQL database together with a single command:

```bash
# Set your environment variables (optional for local testing)
export RESEND_API_KEY="your_resend_key"
export GEMINI_API_KEY="your_gemini_key"

# Build and start containers
docker-compose up --build -d
```
The backend will be available at `http://localhost:8081` and PostgreSQL on `localhost:5432`.

---

### Option 2: Manual Development Setup

#### 1. Backend (Spring Boot)
1. Ensure **Java 21** and **PostgreSQL** are installed.
2. Create a PostgreSQL database named `careerhub_db`.
3. Set environment variables or configure `careerhub-backend/src/main/resources/application.properties`:
   ```env
   RESEND_API_KEY=your_resend_api_key
   GEMINI_API_KEY=your_gemini_api_key
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   ```
4. Build and run:
   ```bash
   cd careerhub-backend
   mvn clean package -DskipTests
   java -jar target/careerhub-backend-0.1.0.jar
   ```

#### 2. Web Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

#### 3. Mobile App (Expo SDK 57)
```bash
cd mobile
npm install
npx expo start --clear
```
Scan the generated QR code using the **Expo Go** app on Android or iOS.

---

## 🌐 Production Deployment Guide

### Backend & Database Deployment on Render

1. **Database:**
   - Create a **New PostgreSQL Instance** on Render.
   - Note the Internal/External Database URL, Username, and Password.

2. **Backend Web Service:**
   - Connect your GitHub repository `yashmohite7324-byte/Graphix-tech`.
   - Set **Root Directory** to `careerhub-backend`.
   - Environment: **Docker**.
   - Under **Environment Variables**, add:
     ```env
     SPRING_DATASOURCE_URL=jdbc:postgresql://<RENDER_HOST>:5432/<DB_NAME>?sslmode=require
     SPRING_DATASOURCE_USERNAME=<DB_USER>
     SPRING_DATASOURCE_PASSWORD=<DB_PASS>
     RESEND_API_KEY=<YOUR_RESEND_KEY>
     GEMINI_API_KEY=<YOUR_GEMINI_KEY>
     GOOGLE_CLIENT_ID=<YOUR_GOOGLE_CLIENT_ID>
     GOOGLE_CLIENT_SECRET=<YOUR_GOOGLE_CLIENT_SECRET>
     JAVA_TOOL_OPTIONS=-Xms128m -Xmx256m -XX:+UseG1GC
     ```

---

### Frontend Deployment on Vercel

1. Import `yashmohite7324-byte/Graphix-tech` into Vercel.
2. Set **Root Directory** to `frontend`.
3. Framework Preset: **Vite**.
4. Under **Environment Variables**, set:
   ```env
   VITE_API_BASE_URL=https://<your-render-backend-url>.onrender.com
   ```
5. Deploy! Vercel will automatically use `frontend/vercel.json` for client-side routing.

---

## 🔑 Required Environment Variables

| Variable | Description | Default / Fallback |
| :--- | :--- | :--- |
| `SPRING_DATASOURCE_URL` | PostgreSQL JDBC Connection URL | `jdbc:postgresql://localhost:5432/careerhub_db` |
| `SPRING_DATASOURCE_USERNAME` | Database username | `careerhub_user` |
| `SPRING_DATASOURCE_PASSWORD` | Database password | `CareerHub@123` |
| `RESEND_API_KEY` | Resend API Key for Email OTPs | Required for OTP Emails |
| `RESEND_FROM_EMAIL` | Sender address for transactional emails | `onboarding@resend.dev` |
| `GEMINI_API_KEY` | Google Gemini API key for AI features | Required for AI Resume Scoring |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID | Required for Google Auth |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret | Required for Google Auth |

---

## 🛡️ License & Credits

Developed for **Graphix TechHire Placement Portal**. All rights reserved.
