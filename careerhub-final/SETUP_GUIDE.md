# CareerHub Final Setup Guide
## Company Data, 10 Students, Subscription System, Real OTP

---

## COMPANY DATA FROM YOUR EXCEL FILE

All 10 companies are seeded automatically by V9 migration:

| # | Company | Designation | Location | Login Email |
|---|---|---|---|---|
| 1 | LOGICA ENGINEERING & MFG. | HR Executive | Bhosari | hr@logicaengineering.com |
| 2 | Manjushree fab | HR Executive | Bhosari | hr@manjushreefab.com |
| 3 | Avamdharma Consulting | Chief Technology Officer | Pune | cto@avamdharma.com |
| 4 | Powermech | HR Executive | Mumbai | hr@powermech.com |
| 5 | Buildnest | CEO | Bangalore | ceo@buildnest.com |
| 6 | KD Architecture | HR Executive | Pune | hr@kdarchitecture.com |
| 7 | Grey Space Computing | HR Generalist | Kodhwa | hr@greyspacecomputing.com |
| 8 | ULTRA PRECISION INDUSTRIES | CEO | Bhosari | ceo@ultraprecision.com |
| 9 | Sai Nath Engineering | HR Executive | Kharadi | hr@sainathengineering.com |
| 10 | ULC Plast | HR Executive | Bhosari | hr@ulcplast.com |

Default password for all company accounts: **Company@1234**

---

## HOW COMPANY LOGIN WORKS

1. Company is initially PENDING
2. Admin (Graphix Infotech admin panel) approves the company
3. On approval, the recruiter account (email listed above) becomes ACTIVE
4. Recruiter logs in → sees Recruiter Dashboard with their company's designation
5. They can: post jobs, view applicants, shortlist, schedule interviews
6. Students can see their job postings immediately

**The Admin sees this flow:**
- Goes to /admin/companies
- Sees all 10 companies with PENDING/APPROVED/REJECTED badge
- Clicks Approve → recruiter can now login
- Clicks the company card → sees recruiter email, designation, location
- Can reject or revoke at any time

---

## 10 GRAPHIX STUDENTS (From V11 Migration)

All get FREE access automatically:

| Name | Email | Roll No. | Branch | CGPA |
|---|---|---|---|---|
| Aditya Sharma | aditya.sharma@graphix.edu | GT2024CSE001 | CSE | 8.5 |
| Priya Patel | priya.patel@graphix.edu | GT2024IT001 | IT | 7.9 |
| Rohan Mehta | rohan.mehta@graphix.edu | GT2024CSE002 | CSE | 8.1 |
| Sneha Kulkarni | sneha.kulkarni@graphix.edu | GT2024MECH001 | MECH | 7.5 |
| Arjun Nair | arjun.nair@graphix.edu | GT2024ECE001 | ECE | 8.8 |
| Kavya Reddy | kavya.reddy@graphix.edu | GT2024CSE003 | CSE | 9.1 |
| Dev Singh | dev.singh@graphix.edu | GT2024IT002 | IT | 7.2 |
| Ananya Joshi | ananya.joshi@graphix.edu | GT2024CSE004 | CSE | 8.3 |
| Vishal Desai | vishal.desai@graphix.edu | GT2024MECH002 | MECH | 6.9 |
| Pooja Iyer | pooja.iyer@graphix.edu | GT2024ECE002 | ECE | 8.6 |

Default password for all: **Student@1234**

---

## SUBSCRIPTION SYSTEM

### Graphix Institute Students (FREE)
- Email domain: @graphix.edu
- Access tier: GRAPHIX_STUDENT
- Cost: ₹0 (lifetime)
- Admin can grant free access to any student from /admin/students

### External Students (₹1099/year)
- Non-Graphix students
- Must pay ₹1099 to access the portal
- Shows a premium paywall page before they can see any jobs
- After payment: full access for 1 year
- Payment confirmed via Razorpay/UPI gateway callback

### API Endpoints:
```
GET  /api/v1/subscription/my-access          → check if student has access
POST /api/v1/subscription/initiate-payment   → start ₹1099 payment
POST /api/v1/subscription/confirm-payment    → confirm after gateway callback
POST /api/v1/admin/subscription/grant-access → admin grants free access
```

### How to wrap a student page with the paywall:
```tsx
import SubscriptionGate from './SubscriptionGate';

// In your student dashboard or jobs page:
<SubscriptionGate>
  <StudentDashboard />
</SubscriptionGate>
```
The gate checks access tier automatically. Graphix students pass through immediately. External students without payment see the ₹1099 paywall.

---

## FREE SMS OTP OPTIONS

### Option 1: Fast2SMS (RECOMMENDED — India, free to start)
- FREE ₹50 credit on signup (~15-20 SMS)
- Paid: ₹200 for 1,000 SMS (₹0.20/SMS)
- No monthly fee
- Setup: https://fast2sms.com → Sign Up → Dev API → copy key

```properties
app.otp.provider=fast2sms
fast2sms.api-key=YOUR_KEY_FROM_FAST2SMS
```

### Option 2: MSG91 (India, professional)
- Free trial available
- Requires TRAI DLT registration for production
- Best for high volume

```properties
app.otp.provider=msg91
msg91.auth-key=YOUR_KEY
msg91.template-id=YOUR_TEMPLATE_ID
```

### Option 3: Twilio (International)
- $15 free trial credit
- Works worldwide
- $0.0075 per SMS after trial

```properties
app.otp.provider=twilio
twilio.account-sid=YOUR_SID
twilio.auth-token=YOUR_TOKEN
twilio.from-number=+1XXXXXXXXXX
```

### Option 4: Mock (Development only)
OTP printed to IntelliJ console — default if no provider configured:
```properties
app.otp.provider=mock
```

---

## FILES TO ADD

### Backend (Spring Boot):
```
src/main/java/com/graphix/careerhub/
├── auth/
│   └── Fast2SmsOtpProvider.java       → add to auth package
├── subscription/
│   ├── StudentAccess.java
│   ├── SubscriptionPlan.java
│   ├── PaymentTransaction.java
│   ├── StudentAccessRepository.java
│   ├── SubscriptionPlanRepository.java
│   ├── PaymentTransactionRepository.java
│   ├── SubscriptionService.java
│   └── SubscriptionController.java
```

### Migrations:
```
src/main/resources/db/migration/
├── V9__seed_companies_recruiters.sql
├── V10__subscription_and_access_control.sql
└── V11__seed_10_graphix_students.sql
```

### Frontend:
```
src/pages/
├── admin/
│   └── AdminCompanyPanel.tsx
└── student/
    └── SubscriptionGate.tsx
```

### Add to App.tsx:
```tsx
import AdminCompanyPanel from './pages/admin/AdminCompanyPanel';
import SubscriptionGate from './pages/student/SubscriptionGate';

// Replace admin companies route:
<Route path="/admin/companies" element={
  <PrivateRoute allowedRoles={['PLACEMENT_ADMIN','SUPER_ADMIN']}>
    <AdminCompanyPanel />
  </PrivateRoute>
} />

// Wrap student dashboard with gate:
<Route path="/student/dashboard" element={
  <PrivateRoute allowedRoles={['STUDENT']}>
    <SubscriptionGate>
      <StudentDashboard />
    </SubscriptionGate>
  </PrivateRoute>
} />
```

---

## COMPLETE LOGIN REFERENCE

| Role | Email | Password |
|---|---|---|
| Super Admin | superadmin@graphixtechnologies.com | Admin@1234 |
| Placement Admin (TPO) | tpo@graphixtechnologies.com | Admin@1234 |
| Trainer | trainer@graphixtechnologies.com | Admin@1234 |
| Logica Engineering HR | hr@logicaengineering.com | Company@1234 |
| Manjushree fab HR | hr@manjushreefab.com | Company@1234 |
| Avamdharma CTO | cto@avamdharma.com | Company@1234 |
| Powermech HR | hr@powermech.com | Company@1234 |
| Buildnest CEO | ceo@buildnest.com | Company@1234 |
| KD Architecture HR | hr@kdarchitecture.com | Company@1234 |
| Grey Space HR | hr@greyspacecomputing.com | Company@1234 |
| Ultra Precision CEO | ceo@ultraprecision.com | Company@1234 |
| Sai Nath HR | hr@sainathengineering.com | Company@1234 |
| ULC Plast HR | hr@ulcplast.com | Company@1234 |
| Student 1 | aditya.sharma@graphix.edu | Student@1234 |
| Student 2 | priya.patel@graphix.edu | Student@1234 |
| (all 10 students) | *@graphix.edu | Student@1234 |
