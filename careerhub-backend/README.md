# Graphix CareerHub — Backend (Modular Core)

A properly modularized Spring Boot backend covering **Phases 3–5** of the development guide
(Database, Backend, API). Built following the Master Prompt's rules: separate module packages
(auth/users/students/companies/jobs/applications/audit), Controller→Service→Repository→Entity/DTO
layering, server-side eligibility engine, refresh-token rotation, DB-persisted OTP, application
status history, and audit logging on sensitive actions.

## What's Fully Implemented

| Module | Includes |
|---|---|
| **common** | BaseEntity (auto timestamps), ApiResponse wrapper, custom exceptions, GlobalExceptionHandler |
| **audit** | AuditLog entity + AuditService, called from auth/company/application actions |
| **users** | User entity (5 roles), UserRepository |
| **auth** | Register, OTP verify (DB-persisted, not in-memory), Login, JWT access token, refresh-token rotation, logout-safe design |
| **students** | Student profile CRUD |
| **companies** | Company + Recruiter profile, Admin approve/reject workflow |
| **jobs** | Job posting + JobEligibility rules, EligibilityEngine (server-side only) |
| **applications** | Apply flow (calls eligibility engine), status updates, full ApplicationStatusHistory, audit logging |
| **config** | JWT filter, RBAC route rules for all 5 roles, CORS, security headers |

**Every file has been checked for**: balanced braces, correct package declarations, and every
cross-module class reference resolving to a real file. I could not run an actual `mvn compile`
in this environment (no internet access to Maven Central here), so please run the build once
locally — see Step 4 below — before you trust it fully.

## What's NOT Included Yet (next phases)

Interviews, Placements, Training/Batch/Attendance/Assessments, Notifications delivery (SES/SMS/
WhatsApp/FCM — currently a console-log stub), Messaging/WebSocket chat, Documents/S3 upload,
Analytics dashboards, Flyway migrations (currently using `ddl-auto=update` for simplicity —
see note below), and the entire frontend. Build these next using the exact same pattern shown
in every existing module: **Entity → Repository → Service → Controller (+ DTO where needed)**.

## Setup Steps

### 1. PostgreSQL
Using the setup from earlier in this project — create a fresh database and user:
```sql
CREATE DATABASE careerhub_db;
CREATE USER careerhub_user WITH PASSWORD 'choose_a_strong_password';
GRANT ALL PRIVILEGES ON DATABASE careerhub_db TO careerhub_user;
```

### 2. Open in IntelliJ
- Extract the zip
- `File → Open` → select the extracted `careerhub-backend` folder (the one with `pom.xml`)
- Wait for Maven to download all dependencies (Spring Boot, Security, JWT, springdoc, etc.)

### 3. Configure `application.properties`
Located at `src/main/resources/application.properties`. Update:
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/careerhub_db
spring.datasource.username=careerhub_user
spring.datasource.password=choose_a_strong_password
app.jwt.secret=<replace with a long random string, 32+ characters>
```

### 4. Build and run
In IntelliJ's terminal (or your own terminal, inside the project folder):
```bash
mvn clean compile
```
Fix any errors this reports (there shouldn't be any, but this is the real verification step —
I wrote and checked this code carefully but could not execute a live Maven build myself).

Then run `CareerHubApplication.java` (green Run arrow). Confirm the console shows
`Started CareerHubApplication` with no errors. Tables auto-create in `careerhub_db` on first run.

### 5. Explore the API docs
Once running, open: `http://localhost:8080/swagger-ui.html` — every endpoint is documented
automatically via springdoc-openapi.

## Testing the Core Flow (Postman)

**1. Register a student**
```
POST http://localhost:8080/api/v1/auth/register
{
  "email": "student1@graphix.edu",
  "mobile": "9999999999",
  "password": "Test@1234",
  "role": "STUDENT"
}
```
Check the IntelliJ console for the printed OTP (dev-only stub).

**2. Verify OTP**
```
POST http://localhost:8080/api/v1/auth/otp/verify
{ "email": "student1@graphix.edu", "otp": "123456" }
```

**3. Login**
```
POST http://localhost:8080/api/v1/auth/login
{ "email": "student1@graphix.edu", "password": "Test@1234" }
```
Response includes `accessToken` and `refreshToken`. Copy the `accessToken`.

**4. Call a protected endpoint**
```
GET http://localhost:8080/api/v1/student/me
Authorization: Bearer <accessToken>
```

**5. Refresh an expired access token**
```
POST http://localhost:8080/api/v1/auth/refresh
{ "refreshToken": "<refreshToken from login>" }
```
This rotates the refresh token — the old one is revoked and a new one is returned, per the
Master Prompt's refresh-token rotation requirement.

**6. Post a job (as a recruiter)** — you'll first need a Company + RecruiterProfile row created
manually in pgAdmin (or build a company-registration endpoint next), then:
```
POST http://localhost:8080/api/v1/recruiter/jobs
Authorization: Bearer <recruiter accessToken>
{
  "title": "Software Engineer",
  "description": "Entry-level SDE role",
  "ctc": 600000,
  "minCgpa": 7.0,
  "maxBacklogs": 0,
  "eligibleBranches": "CSE,IT",
  "eligibleBatchYear": 2026
}
```

**7. Apply to the job (as the student)**
```
POST http://localhost:8080/api/v1/student/jobs/{jobId}/apply
Authorization: Bearer <student accessToken>
```
If the student's CGPA/branch/batch don't satisfy the job's `JobEligibility` rules, this
correctly returns a 400 error naming the specific reason — proving the server-side eligibility
engine is doing real work, not just a frontend check.

**8. View audit trail (as admin)**
```
GET http://localhost:8080/api/v1/admin/audit-logs
Authorization: Bearer <admin accessToken>
```
Shows every register/login/approval/status-change event recorded so far.

## Important Notes Before Production

1. **Flyway:** this build uses `ddl-auto=update` for simplicity and lower error risk while you're
   still developing. Before production, switch to Flyway migrations (add the dependency, write
   `V1__init.sql` etc., set `ddl-auto=validate`) exactly as Phase 3 of the development guide describes.
2. **OTP/notification delivery:** `OtpService` currently logs the OTP to the console instead of
   sending a real email/SMS. Replace this with a RabbitMQ event + AWS SES/SMS provider consumer,
   as planned in your earlier subscription guide.
3. **Redis:** OTP and refresh tokens currently live in PostgreSQL, which is correct and durable,
   but for high-traffic production use, move active session/refresh-token lookups to Redis for
   speed, and add Redis-backed rate limiting on `/auth/login` and `/auth/register`.
4. **First Admin/Trainer account:** there's no self-registration for `SUPER_ADMIN`/`PLACEMENT_ADMIN`/
   `TRAINER` roles (intentionally — only `STUDENT` and `RECRUITER` can self-register). Insert your
   first admin user directly into PostgreSQL, or build a small one-time seeding script.

## Project Structure
```
src/main/java/com/graphix/careerhub/
├── common/          → BaseEntity, ApiResponse, exceptions, GlobalExceptionHandler
├── config/          → SecurityConfig, JwtAuthFilter
├── audit/           → AuditLog, AuditService, AuditController
├── users/           → User entity, UserRepository
├── auth/            → OTP, RefreshToken, JwtService, AuthService, AuthController (+ dto/)
├── students/        → StudentProfile, StudentService, StudentController
├── companies/       → Company, RecruiterProfile, CompanyService, CompanyController
├── jobs/            → Job, JobEligibility, EligibilityEngine, JobService, controllers (+ dto/)
└── applications/     → Application, ApplicationStatusHistory, ApplicationService, ApplicationController (+ dto/)
```
