# CareerHub Part 4 — Setup Guide
## Admin Pages + Recruiter Pages + Backend Modules

---

## BACKEND — 2 New Modules

### 1. Analytics Module
Copy `analytics/AnalyticsService.java` and `analytics/AnalyticsController.java`
into: `src/main/java/com/graphix/careerhub/analytics/`

This adds:
- GET `/api/v1/admin/analytics/summary` — total students, companies, jobs, placements
- GET `/api/v1/admin/analytics/placements` — avg CTC, highest CTC, total count

### 2. Announcements Module
Copy all 4 files from `announcements/` folder into:
`src/main/java/com/graphix/careerhub/announcements/`

This adds:
- POST `/api/v1/announcements` — admin creates announcement
- GET `/api/v1/announcements` — get all active announcements
- GET `/api/v1/announcements/my` — get announcements for current user's role
- DELETE `/api/v1/announcements/{id}` — admin removes announcement

New table auto-created: `announcements`

### Restart the backend after adding files.

---

## FRONTEND — 9 New Pages

### Where to put them:

```
careerhub-frontend/src/pages/
├── admin/
│   ├── AdminCompaniesPage.tsx      ← Company list, approve/reject
│   ├── AdminStudentsPage.tsx        ← Student list with search/filter
│   ├── AdminPlacementsPage.tsx      ← Record offers, view placement list
│   ├── AdminAnalyticsPage.tsx       ← Full analytics with Recharts
│   ├── AdminAuditPage.tsx           ← Audit log viewer with filters
│   └── AdminAnnouncementsPage.tsx   ← Create/manage announcements
└── recruiter/
    ├── RecruiterPostJobPage.tsx         ← Full job posting form
    ├── RecruiterCandidatePipelinePage.tsx ← Kanban pipeline by status
    └── RecruiterInterviewsPage.tsx      ← Schedule and manage interviews
```

### Update App.tsx:
Open `ROUTES_TO_ADD.tsx` and replace 9 ComingSoon routes with real components.
Follow the comments inside that file exactly.

---

## What Each Page Does

### Admin Pages:

| Page | Key Features |
|---|---|
| AdminCompaniesPage | Table with approve/reject buttons, search, status filter, stats cards |
| AdminStudentsPage | Full student table, CGPA color coding, branch filter, search by name/email |
| AdminPlacementsPage | Record placement modal, stats (total/avg/highest CTC), full placement table |
| AdminAnalyticsPage | Area chart, bar charts, pie chart, CTC distribution, top companies, branch table |
| AdminAuditPage | Color-coded action badges, search by actor/action, time-ago display |
| AdminAnnouncementsPage | Create modal with target role/branch/year, delete announcements |

### Recruiter Pages:

| Page | Key Features |
|---|---|
| RecruiterPostJobPage | Full form, branch multi-select, eligibility preview, real API call |
| RecruiterCandidatePipelinePage | Job selector, kanban columns per stage, click card to move candidates |
| RecruiterInterviewsPage | Schedule modal (mode/link/venue/panel), upcoming vs past split, round display |

---

## Testing Each Page

### Admin — Companies page
1. Login as PLACEMENT_ADMIN
2. Go to `/admin/companies`
3. See all companies in table
4. Click Approve on a PENDING company → status changes to APPROVED
5. Check `audit_logs` table — COMPANY_APPROVED entry logged

### Admin — Analytics page
1. Go to `/admin/analytics`
2. Charts render with live stats from `/api/v1/placements/stats`
3. Branch table shows static breakdown (replace with real DB queries later)

### Admin — Announcements
1. Go to `/admin/announcements`
2. Click New Announcement → fill title/message/target role
3. Click Publish → appears in list
4. Students can see it at `/announcements/my`

### Recruiter — Post Job
1. Login as RECRUITER
2. Go to `/recruiter/jobs`
3. Fill in job details + select eligible branches
4. Submit → job appears in PostgreSQL `jobs` and `job_eligibility` tables
5. Students can now see it on `/student/jobs`

### Recruiter — Candidate Pipeline
1. Go to `/recruiter/candidates`
2. Select a job from the job selector
3. See all applicants in kanban columns
4. Click a candidate card → action menu appears
5. Click "Shortlisted" → card moves to Shortlisted column
6. Check `applications` and `application_status_history` tables

### Recruiter — Interviews
1. Go to `/recruiter/interviews`
2. Click Schedule Interview
3. Enter Application ID (get from pgAdmin `applications` table)
4. Set date/time, mode, meeting link
5. Click Schedule → interview created, application moves to INTERVIEW_SCHEDULED
6. Student sees it at `/student/interviews`

---

## What Remains After Part 4

Backend:
- Excel bulk student upload endpoint
- Student search API for admin (currently returns placeholder)

Frontend:
- Trainer pages (mark attendance, create assessment, score entry)
- Admin Jobs management page
- Admin Interviews page
- Recruiter applications list page
- Chat inbox page (list of all conversations)

---

## Full Feature Status

| Module | Status |
|---|---|
| Auth (register, OTP, login, JWT, refresh tokens) | ✅ Done |
| Student profile builder | ✅ Done |
| Browse jobs + apply with eligibility check | ✅ Done |
| Application status tracker with timeline | ✅ Done |
| Student interviews page | ✅ Done |
| Student training page | ✅ Done |
| Student notifications page | ✅ Done |
| WebSocket real-time chat | ✅ Done |
| Admin dashboard with charts | ✅ Done |
| Admin company management + approval | ✅ Done |
| Admin student management | ✅ Done |
| Admin placements recording | ✅ Done |
| Admin analytics with Recharts | ✅ Done |
| Admin audit log viewer | ✅ Done |
| Admin announcements | ✅ Done |
| Recruiter post job form | ✅ Done |
| Recruiter candidate kanban pipeline | ✅ Done |
| Recruiter interview scheduler | ✅ Done |
| Trainer pages | 🔲 Next |
| Excel bulk upload | 🔲 Next |
| Admin jobs + interviews pages | 🔲 Next |
