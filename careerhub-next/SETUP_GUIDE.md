# CareerHub — Next Part Setup Guide
## Student Pages + WebSocket Chat

---

## BACKEND — 4 New Files to Add

### Where to put them:
Copy these files into your existing Spring Boot project:

```
careerhub-backend/src/main/java/com/graphix/careerhub/
└── messaging/           ← CREATE this new folder
    ├── Conversation.java
    ├── ConversationRepository.java
    ├── Message.java
    ├── MessageRepository.java
    ├── ChatMessagePayload.java
    ├── ChatService.java
    └── ChatController.java

└── config/              ← already exists, ADD this file
    └── WebSocketConfig.java
```

### Add WebSocket dependency to pom.xml:
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-websocket</artifactId>
</dependency>
```

### Add to SecurityConfig.java — permit WebSocket endpoint:
Find the authorizeHttpRequests section and add:
```java
.requestMatchers("/ws/**").permitAll()
.requestMatchers("/api/v1/chat/**").authenticated()
```

### Restart the backend.
New tables auto-created: conversations, messages

---

## FRONTEND — 6 New Pages + 1 Component

### Where to put them:
```
careerhub-frontend/src/
├── pages/student/
│   ├── StudentJobsPage.tsx         ← Browse jobs + apply
│   ├── StudentApplicationsPage.tsx  ← Application tracker with timeline
│   ├── StudentProfilePage.tsx       ← Full profile builder with tabs
│   ├── StudentTrainingPage.tsx      ← Training programs + attendance
│   ├── StudentInterviewsPage.tsx    ← Interview schedule + details
│   └── StudentNotificationsPage.tsx ← Notification inbox
└── components/
    └── ChatWindow.tsx               ← Real-time WebSocket chat
```

### Install WebSocket libraries (for chat):
```bash
npm install @stomp/stompjs sockjs-client
npm install --save-dev @types/sockjs-client
```

### Update App.tsx:
Open ROUTES_TO_ADD.tsx and follow the instructions inside.
Replace 6 ComingSoon routes with the real page components.

### Also update api/index.ts — add interviewApi:
```typescript
export const interviewApi = {
  getAll: () => api.get('/interviews'),
  schedule: (data: any) => api.post('/interviews', data),
  updateResult: (id: number, result: string, feedback: string) =>
    api.patch(`/interviews/${id}/result`, { result, feedback }),
};
```

---

## Testing Each New Page

After running both backend and frontend:

1. **Jobs page** → http://localhost:5173/student/jobs
   - Should show all open jobs
   - Eligibility check shown on each job card
   - Apply button works (check applications table in pgAdmin)

2. **Applications page** → http://localhost:5173/student/applications
   - Shows all your applications with status timeline
   - Applied → Under Review → Shortlisted → Interview → Selected

3. **Profile page** → http://localhost:5173/student/profile
   - Fill in all tabs (Personal, Academic, Skills, Resume)
   - Click Save Profile — updates student_profiles table
   - Completion percentage bar updates live

4. **Training page** → http://localhost:5173/student/training
   - Shows training programs from training_programs table
   - Empty state if no programs created yet

5. **Interviews page** → http://localhost:5173/student/interviews
   - Shows scheduled interviews
   - Join Meeting button for online interviews
   - Empty state if none scheduled yet

6. **Notifications page** → http://localhost:5173/student/notifications
   - Shows all notifications from notifications table
   - Mark all read button
   - Unread notifications highlighted

7. **Chat** → use ChatWindow component inside any page
   - Backend must be running with WebSocket enabled
   - Opens real-time connection to ws://localhost:8080/ws

---

## What's Still Remaining After This

Backend:
- Admin analytics aggregation APIs
- Announcements broadcast module
- Excel bulk upload (students/companies)
- Company self-registration endpoint

Frontend:
- Admin pages (Companies, Students, Placements, Analytics, Audit)
- Recruiter pages (Post Job form, Candidate Pipeline, Interview Scheduler)
- Trainer pages (Mark Attendance, Create Assessment, Score Entry)
- Chat inbox page (list of conversations)
- Admin Announcements page
