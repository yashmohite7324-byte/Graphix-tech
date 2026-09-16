# Graphix TechHire 🚀

Graphix TechHire (CareerHub Pro) is an enterprise-grade campus placement and recruitment platform designed to seamlessly connect students, recruiters, and institute administrators.

## ✨ Features

- **Role-Based Portals:** Dedicated dashboards for Students, Recruiters, Placement Admins, and Trainers.
- **Applicant Tracking System (ATS):** A fully-featured pipeline for recruiters to manage candidates from "Applied" to "Offered".
- **AI Resume Scoring:** Automated matching scores to help students see how well their resumes align with job descriptions.
- **Modern UI/UX:** Built with a custom design system featuring dynamic dark mode, semantic variables, and sleek glassmorphism components.
- **Secure File Storage:** AWS S3 integration for robust, secure uploading of student resumes and profile photos.
- **Admin Oversight:** Comprehensive analytics, job tracking, and application monitoring for the placement office.

## 🛠️ Tech Stack

### Frontend
- **React 18** (TypeScript)
- **Vite** for fast building and HMR
- **Tailwind CSS** (Custom Redesign Theme)
- **React Router** for protected role-based navigation
- **React Query** for server-state management

### Backend
- **Java 17+** & **Spring Boot 3**
- **Spring Security** (JWT Authentication)
- **Spring Data JPA** (Hibernate)
- **PostgreSQL** Database
- **AWS SDK** for S3 bucket integration

## 🚀 Getting Started

### 1. Backend Setup
1. Ensure you have **Java 17+** and **PostgreSQL** installed.
2. Create a database named `careerhub_db` in PostgreSQL.
3. In `careerhub-backend/src/main/resources/application.properties`, configure your database credentials.
4. Provide your AWS and Twilio secrets via Environment Variables:
   ```env
   AWS_ACCESS_KEY_ID=your_access_key
   AWS_SECRET_ACCESS_KEY=your_secret_key
   ```
5. Open the project in IntelliJ IDEA (or your preferred Java IDE) and run `CareerhubApplication`. The backend will start on port `8081`.

### 2. Frontend Setup
1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Access the application at `http://localhost:5173`.

## 🔒 Security Note
This repository does not contain any sensitive API keys or seeded production data. Ensure you set up your own AWS S3 bucket and environment variables before deploying.
