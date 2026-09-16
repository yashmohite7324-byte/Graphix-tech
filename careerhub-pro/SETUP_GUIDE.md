# CareerHub Pro Upgrade — Setup Guide
## AWS S3 + Premium Dashboards + Bulk Import + Reports

---

## WHAT WAS MISSING — AND IS NOW BUILT

| Gap | Now Delivered |
|---|---|
| No AWS S3 option | `S3StorageProvider.java` with presigned URLs |
| Plain sidebar / layout | `AppLayout.tsx` — role-coloured nav, user menu, notification bell |
| Student dashboard was basic | `StudentDashboard.tsx` — live stats, profile completeness, job feed |
| Admin dashboard was basic | `AdminDashboard.tsx` — KPI cards, trend chart, funnel, activity feeds |
| Recruiter dashboard was basic | `RecruiterDashboard.tsx` — hiring pipeline funnel, per-job performance |
| No settings page | `SettingsPage.tsx` — works for all 5 roles |
| No super admin panel | `SuperAdminPanel.tsx` — user management, suspend, reset password |
| No bulk import | `BulkUploadService.java` + UI — Excel import for students & companies |
| No reports/export | `ExportService.java` — 3 downloadable Excel reports |
| No notification bell | Built into `AppLayout.tsx` with 30-second polling |

---

## PART 1 — AWS S3 SETUP

### Step 1: Create the S3 bucket
1. AWS Console → S3 → **Create bucket**
   - Name: `careerhub-files-prod` (globally unique — add your institute name if taken)
   - Region: **ap-south-1 (Mumbai)** — lowest latency from Pune
   - Block all public access: **ON** (keep it private, we serve via presigned URLs)
   - Click Create

### Step 2: Create an IAM user
1. AWS Console → IAM → Users → **Create user**
   - Name: `careerhub-s3-user`
   - Attach policy: `AmazonS3FullAccess` (or scope it to just your bucket)
2. Select the user → Security credentials → **Create access key**
   - Use case: Application running outside AWS
   - Copy both the Access Key ID and Secret Access Key

### Step 3: Add the Maven dependency
```xml
<dependency>
    <groupId>software.amazon.awssdk</groupId>
    <artifactId>s3</artifactId>
    <version>2.25.27</version>
</dependency>
```

### Step 4: Configure application.properties
```properties
app.storage.provider=s3
aws.s3.bucket=careerhub-files-prod
aws.s3.region=ap-south-1
aws.s3.access-key=AKIAXXXXXXXXXXXXXXXX
aws.s3.secret-key=your_secret_key_here
```

### AWS S3 Free Tier
- First 12 months: **5 GB storage, 20,000 GET, 2,000 PUT requests/month free**
- After that: $0.025/GB/month in Mumbai
- 200 students × 1 MB average = 200 MB → about ₹0.40/month

### Switching providers is one line
```properties
app.storage.provider=s3           # AWS S3
app.storage.provider=cloudinary   # Cloudinary (25 GB free)
app.storage.provider=supabase     # Supabase (1 GB free)
```
No code change needed — `@ConditionalOnProperty` picks the right bean.

---

## PART 2 — BULK IMPORT SETUP

### Add the Apache POI dependency
```xml
<dependency>
    <groupId>org.apache.poi</groupId>
    <artifactId>poi-ooxml</artifactId>
    <version>5.2.5</version>
</dependency>
```

### Student Excel format (Row 1 = headers, skipped)
| A | B | C | D | E | F | G | H |
|---|---|---|---|---|---|---|---|
| Full Name | Email | Mobile | Roll Number | Branch | Batch Year | CGPA | Backlogs |
| Aditya Sharma | aditya@graphix.edu | 9876543210 | GT2024CSE001 | CSE | 2026 | 8.5 | 0 |

### Company Excel format
| A | B | C | D | E | F |
|---|---|---|---|---|---|
| Company Name | Industry | Location | Contact Email | Contact Mobile | Designation |
| Grey Space Computing | IT / Software | Kodhwa, Pune | hr@greyspace.com | 9800000001 | HR Generalist |

Admins can download a pre-formatted template directly from the Super Admin panel — no guessing the column order.

### What happens on import
- Students: user account + student profile created, default password `Student@1234`, status ACTIVE
- Companies: company record created as **PENDING** + recruiter login created with the designation from column F
- Duplicate emails are skipped (not overwritten)
- Row-level errors are reported back without failing the whole import

---

## PART 3 — FILES TO ADD

### Backend → `src/main/java/com/graphix/careerhub/`
```
storage/
  └── S3StorageProvider.java          (new — AWS S3)
admin/
  ├── BulkUploadService.java          (new — Excel import)
  ├── BulkUploadController.java       (new — upload + template + export endpoints)
  └── ExportService.java              (new — Excel report generation)
```

### Frontend → `src/`
```
layouts/
  └── AppLayout.tsx                   (REPLACE your existing layout)
pages/
  ├── student/StudentDashboard.tsx    (REPLACE)
  ├── admin/AdminDashboard.tsx        (REPLACE)
  ├── admin/SuperAdminPanel.tsx       (new)
  ├── recruiter/RecruiterDashboard.tsx(REPLACE)
  └── shared/SettingsPage.tsx         (new)
```

### Routes to add in App.tsx
```tsx
import SuperAdminPanel from './pages/admin/SuperAdminPanel';
import SettingsPage from './pages/shared/SettingsPage';

// Super admin panel
<Route path="/admin/system" element={
  <PrivateRoute allowedRoles={['SUPER_ADMIN']}><SuperAdminPanel /></PrivateRoute>
} />

// Settings — one page, all roles
<Route path="/student/settings"   element={<PrivateRoute allowedRoles={['STUDENT']}><SettingsPage /></PrivateRoute>} />
<Route path="/recruiter/settings" element={<PrivateRoute allowedRoles={['RECRUITER']}><SettingsPage /></PrivateRoute>} />
<Route path="/admin/settings"     element={<PrivateRoute allowedRoles={['PLACEMENT_ADMIN','SUPER_ADMIN']}><SettingsPage /></PrivateRoute>} />
<Route path="/trainer/settings"   element={<PrivateRoute allowedRoles={['TRAINER']}><SettingsPage /></PrivateRoute>} />
```

---

## PART 4 — NEW API ENDPOINTS

| Method | Endpoint | Role | Purpose |
|---|---|---|---|
| POST | /admin/bulk/students | Admin | Import students from Excel |
| POST | /admin/bulk/companies | Admin | Import companies + recruiters |
| GET | /admin/bulk/template/students | Admin | Download student template |
| GET | /admin/bulk/template/companies | Admin | Download company template |
| GET | /admin/export/students | Admin | Student master list (.xlsx) |
| GET | /admin/export/placements | Admin | Placement report with CTC stats |
| GET | /admin/export/applications | Admin | Full application log |

### Backend endpoints you still need to implement
These are called by the new UI — add them to your existing controllers:
```
GET   /api/v1/admin/users                    → list all users
PATCH /api/v1/admin/users/{id}/status        → suspend/activate
POST  /api/v1/admin/users/{id}/reset-password
GET   /api/v1/notifications/unread-count
POST  /api/v1/notifications/mark-all-read
PATCH /api/v1/users/me                       → update name/mobile
POST  /api/v1/auth/change-password
POST  /api/v1/auth/logout-all
GET   /api/v1/jobs/my                        → recruiter's own jobs
GET   /api/v1/applications/recruiter         → applications to recruiter's jobs
GET   /api/v1/interviews/recruiter
GET   /api/v1/recruiters/me
```

---

## WHAT THE DASHBOARDS NOW SHOW

### Student Dashboard
Greeting that changes by time of day, 4 gradient stat cards, a profile-completeness bar that only appears when under 80%, application timeline with colour-coded status dots, notification preview, AI resume score prompt, and a 4-job opportunity grid.

### Admin Dashboard
4 clickable KPI cards, an alert row (pending approvals, active companies, placement rate), a placement trend area chart, an application funnel pie chart, and two live activity feeds side by side.

### Recruiter Dashboard
Company header with their designation, 4 stats, a horizontal hiring funnel showing candidate counts at each stage, an applications-per-job bar chart, upcoming interviews list, and all job postings with live applicant counts.

### Super Admin Panel
Three tabs — user management with suspend/activate/reset actions, bulk import with drag-drop and per-row error reporting, and a reports tab with three one-click Excel downloads.

---

## STILL OPTIONAL (not blocking launch)

- React Native mobile app
- WhatsApp Business API notifications
- Redis for distributed OTP rate limiting (currently in-memory, fine for single instance)
- RabbitMQ async email/SMS queue (currently synchronous)
- Razorpay live integration (currently mock order flow)
