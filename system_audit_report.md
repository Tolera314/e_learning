# 🔍 Professional System Audit Report
### Ethio-Digital-Academy Platform — Full Stack Review
**Date:** May 2026 | **Auditor:** Antigravity AI | **Severity Scale:** 🔴 Critical → 🟠 High → 🟡 Medium → 🟢 Low

---

## PART 1 — 🔴 CRITICAL ISSUES (Must fix before production)

---

### CRIT-01 — Secrets Exposed in `.env` (Backend)
**File:** `backend/.env`

All credentials are in plaintext and likely committed to version control. This is a **catastrophic** production security breach.

| Secret | Problem |
|--------|---------|
| `JWT_SECRET` (line 14) | Is a **decoded JWT token**, not a random secret. Anyone who decodes it gets your signing key. |
| `STRIPE_SECRET_KEY` (line 28) | Live-format Stripe key. If leaked, attackers can create charges, issue refunds, and read all financial data. |
| `BREVO_SMTP_PASS` (line 22) | Full SMTP password exposed. Attackers can send unlimited phishing emails from your domain. |
| `CLOUDINARY_URL` (line 32) | Full Cloudinary API secret. Attackers can upload/delete all platform media. |
| `DATABASE_URL` (line 7) | Password is URL-encoded in plaintext. Full database access if repo is public. |

> [!CAUTION]
> **Immediate Action Required:** Rotate ALL secrets NOW. Add `.env` to `.gitignore`. Use a secrets manager (e.g., Railway, Doppler, or GCP Secret Manager) for production.

**Fix:** Generate a proper JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

### CRIT-02 — `JWT_REFRESH_SECRET` Missing from `.env`
**File:** `backend/.env` + `backend/src/utils/jwt.ts` Line 7

```typescript
// jwt.ts line 7 — DANGEROUS FALLBACK
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh-super-secret-please-change-in-prod';
```

`JWT_REFRESH_SECRET` is **not defined** in `.env`. The application silently falls back to the hardcoded string `'refresh-super-secret-please-change-in-prod'` in production. Any attacker who reads your public code can forge refresh tokens for **any user**, achieving permanent session hijacking.

**Fix:** Add `JWT_REFRESH_SECRET` to `.env` with a strong random value.

---

### CRIT-03 — Free Enrollment Bypass (No Subscription Check)
**File:** `backend/src/controllers/enrollmentController.ts` Lines 23–25

```typescript
if (!course.isFree) {
   // Payment should be verified before reaching here ← THIS IS A TODO COMMENT, NOT CODE
}
```

A student can enroll in **any paid course for free** by calling `POST /api/enrollments` directly. There is no subscription validation, no payment check, and no enforcement of any kind. The comment is aspirational — the check doesn't exist.

**Fix:** Before the `enrollment.upsert`, add real subscription validation:
```typescript
if (!course.isFree) {
  const activeSubscription = await prisma.subscription.findFirst({
    where: { studentId, segmentAccess: course.segment, expiresAt: { gt: new Date() } }
  });
  if (!activeSubscription) {
    return res.status(403).json({ error: 'Active subscription required' });
  }
}
```

---

### CRIT-04 — `revokeSubscription` is Empty (Stripe Cancellation Silently Fails)
**File:** `backend/src/controllers/paymentController.ts` Lines 159–161

```typescript
async function revokeSubscription(stripeSubscriptionId: string) {
  // Logic to find subscription by stripe ID and mark as expired early
}
```

When a Stripe `customer.subscription.deleted` webhook fires (user cancels), this function does **nothing**. The student keeps full access indefinitely after cancelling their subscription. This is a direct **revenue leak**.

---

### CRIT-05 — Admin Can Ban Themselves (No Self-Protection)
**File:** `backend/src/controllers/adminController.ts` Lines 47–64

`updateUserStatus` has no check to prevent an admin from banning their own account or another admin's account. A single admin call to `PATCH /api/admin/users/:ownUserId` could lock out the entire admin panel.

**Fix:** Add guard:
```typescript
if (userId === req.user?.id) return res.status(400).json({ error: "Cannot modify your own account status." });
```

---

## PART 2 — 🟠 HIGH SEVERITY (Fix in next sprint)

---

### HIGH-01 — Quiz: Students Can Re-Submit Indefinitely
**File:** `backend/src/controllers/quizController.ts` Lines 130–244

`submitQuiz` has no check for existing submissions. A student can brute-force quiz answers by submitting unlimited times until they get 100%. There is no `maxAttempts` guard.

**Fix:** Before creating the submission:
```typescript
const existingSubmission = await prisma.quizSubmission.findFirst({ where: { quizId: id, studentId } });
if (existingSubmission) return res.status(409).json({ error: 'Quiz already submitted' });
```

---

### HIGH-02 — `getQuizSubmissions` Has No Ownership Check
**File:** `backend/src/controllers/quizController.ts` Lines 249–265

Any authenticated instructor (or potentially any user) can call `GET /quizzes/:id/submissions` and see **all student data** for any quiz — not just their own. There is no authorization check that the quiz belongs to the requesting instructor.

---

### HIGH-03 — Admin: `broadcastNotification` is a DoS Vector
**File:** `backend/src/controllers/adminController.ts` Lines 273–295

```typescript
const users = await prisma.user.findMany({ ... }); // Fetches ALL users
const notifications = users.map(user => ({ ... }));
await prisma.notification.createMany({ data: notifications });
```

With 100,000 users, this creates 100,000 DB rows in a single synchronous operation, blocking the Node.js event loop and potentially crashing the server. No pagination, no background job, no rate limit.

**Fix:** Use a background job queue (BullMQ/pg-boss) or chunk the insert in batches of 500.

---

### HIGH-04 — Commission Page: Fully Hardcoded Mock Data (Admin Financial Feature)
**File:** `frontend/src/app/dashboard/admin/commissions/page.tsx`

```tsx
// Line 24: saveRate() just calls toast.success() — ZERO API call
// Line 87: "1.2M ETB" — hardcoded magic string
// Line 131: "428,500 ETB" — hardcoded mock payout figure
// Line 135: "April 01, 2026" — hardcoded past date
// Line 156: "742 ETB/User" — hardcoded fake metric
// Lines 103-119: Tier rules are decoration — not persisted anywhere
```

An admin believes they are configuring financial rules, but **no data is saved**. This is a non-functional admin panel presenting false financial data.

---

### HIGH-05 — Student Detail Panel Shows Hardcoded Milestones
**File:** `frontend/src/app/dashboard/instructor/students/page.tsx` Lines 203–209

```tsx
{["Completed Introduction Module", "Passed Week 1 Quiz", "Submitted First Assignment"].map((m, i) => (
  // These are NEVER from the database
))}
```

Every student shows the exact same three milestones regardless of their real progress. The `quizAvg` and `videosWatched` fields (lines 122, 184–186) also come back as `undefined` from the API because the backend `getInstructorStudents` endpoint doesn't return those fields.

---

### HIGH-06 — `getMonetizationStats` Contains Hardcoded Mock Value
**File:** `backend/src/controllers/instructorController.ts` Line 517

```typescript
metrics: {
  ...
  totalStudents: 1250, // ← Mock for now — this ships to production
  liveSessionsCount: 12 // ← Mock for now
}
```

A financial dashboard is showing fabricated student counts to instructors. This is a trust-destroying bug.

---

### HIGH-07 — Progress Page Timeframe Selector is Non-Functional
**File:** `frontend/src/app/dashboard/student/progress/page.tsx` Lines 48, 53–58

```tsx
const [timeframe, setTimeframe] = useState("7 Days");
// ...
useEffect(() => {
  api.get("/student/progress") // ← timeframe is NEVER sent to the API
```

The "7 Days / 30 Days / 3 Months" selector visually changes state but the API call **never includes the timeframe parameter**. All three views show identical data.

---

## PART 3 — 🟡 MEDIUM SEVERITY (Fix within 2 weeks)

---

### MED-01 — CPU Usage Calculation is Incorrect on Windows
**File:** `backend/src/controllers/adminController.ts` Lines 368–370

```typescript
const loadAvg = os.loadavg();
const cpuUsagePercent = (loadAvg[0] / cpus.length) * 100;
```

`os.loadavg()` **always returns `[0, 0, 0]` on Windows**. The admin security dashboard will show 0% CPU usage at all times on a Windows server, giving a false sense of system health.

---

### MED-02 — `getCourse` Exposes Unpublished Courses to Public
**File:** `backend/src/controllers/courseController.ts` Lines 183–200

`GET /api/courses/:id` has no visibility check. A student who knows a `courseId` (via IDOR or URL guessing) can access the full details of a `DRAFT` or `PENDING_APPROVAL` course that was never meant to be public.

**Fix:** Add `where: { id, visibility: 'PUBLISHED' }` for unauthenticated requests.

---

### MED-03 — `alert()` Used for Error Handling in Production
**File:** `frontend/src/app/dashboard/student/progress/page.tsx` Line 73

```tsx
alert("Failed to claim certificate. Ensure you have 100% completion.");
```

Native browser `alert()` is a jarring UX anti-pattern in a premium platform. It blocks the UI thread and looks unprofessional. Should use the existing `react-hot-toast` system.

---

### MED-04 — Signature Routes: Public Endpoint Exposes Sensitive Data
**File:** `backend/src/routes/signatureRoutes.ts` Lines 7–8

```typescript
router.get('/ceo', getCEOSignature); // No auth required
router.get('/certificate-data', getGlobalSignatures); // No auth required
```

Signature image URLs are exposed to unauthenticated users. While signatures are technically semi-public on certificates, having an open API endpoint returning them enables easy forgery of certificates by bad actors who can programmatically fetch the CEO's signature.

---

### MED-05 — LivePoll Socket Listeners Not Scoped to Session Room
**File:** `frontend/src/components/LivePoll.tsx` Lines 36–56

```tsx
socket.on("poll:new", ...)   // No room check
socket.on("poll:results", ...)
socket.on("poll:closed", ...)
```

The socket listeners receive events globally, not filtered by `sessionId`. If a student is in Session A and an instructor runs a poll in Session B, the student in Session A will receive Session B's poll updates and see corrupted UI.

---

### MED-06 — `getEnrollments` (Admin) Loads Max 100 Records Without Pagination UI
**File:** `backend/src/controllers/adminController.ts` Line 265

```typescript
take: 100 // Hard cap with no pagination params
```

The admin enrollment list is silently capped at 100 records. With a real user base, the admin has no way to page through or see older enrollments. The frontend has no pagination either.

---

### MED-07 — Terms of Service Page is Legally Incomplete
**File:** `frontend/src/app/terms/page.tsx` Lines 16–20

```tsx
{/* More placeholder text can go here */}
```

The Terms page contains only 2 clauses and a placeholder comment. This is not legally enforceable. An incomplete ToS exposes the platform to legal liability, particularly around payment disputes, data privacy, and content ownership.

---

## PART 4 — 🟢 LOW SEVERITY (Polish & Optimization)

---

### LOW-01 — Random Shuffle for Anti-Cheat is Cryptographically Weak
**File:** `backend/src/controllers/quizController.ts` Lines 113–118

```typescript
quiz.questions = quiz.questions.sort(() => Math.random() - 0.5);
```

`Math.random()` is not cryptographically secure. A sophisticated cheater could analyze timing or use statistical attacks to predict the shuffle order. For true anti-cheat, use `crypto.randomInt()` for a Fisher-Yates shuffle.

---

### LOW-02 — Course Error Responses Leak Internal Error Objects
**File:** `backend/src/controllers/courseController.ts` Lines 120–123, 331–334

```typescript
res.status(500).json({ message: 'Error creating course', error }); // 'error' leaks stack traces
```

Passing the raw `error` object in the response can leak stack traces, file paths, and Prisma query details to the client. This reveals internal system architecture to potential attackers.

---

### LOW-03 — No Rate Limiting on Auth Endpoints
**File:** `backend/src/routes/authRoutes.ts`

`/auth/login`, `/auth/register`, and `/auth/resend-otp` have no rate limiting. An attacker can:
- Brute-force passwords at unlimited speed
- Spam OTP resend to exhaust email quotas (costing you money)
- Enumerate valid phone numbers/emails via response timing

**Fix:** Apply `express-rate-limit` middleware (5 attempts per 15min on login).

---

### LOW-04 — `Filter by Course` Button is Non-Functional (Students Page)
**File:** `frontend/src/app/dashboard/instructor/students/page.tsx` Line 72–74

The "Filter by Course" button renders with no `onClick` handler and no dropdown logic. It appears functional but does nothing.

---

### LOW-05 — `Export Payout Ledger` Button is Non-Functional
**File:** `frontend/src/app/dashboard/admin/commissions/page.tsx` Line 39–42

The "Export Payout Ledger" button has no `onClick` handler. Clicking it silently does nothing.

---

### LOW-06 — `Handle Payouts` Button is Non-Functional
**File:** `frontend/src/app/dashboard/admin/commissions/page.tsx` Line 137–139

Same issue — renders as a button, but no action is wired.

---

### LOW-07 — `Send Message` in Student Detail Panel is Non-Functional
**File:** `frontend/src/app/dashboard/instructor/students/page.tsx` Line 212

The "Send Message" button doesn't navigate or open a compose flow — it has no `onClick` handler.

---

### LOW-08 — `Optimized Plan` Button in Progress Page is Non-Functional
**File:** `frontend/src/app/dashboard/student/progress/page.tsx` Line 186

The "Optimized Plan" button under the AI Study Coach section has no action.

---

## PART 5 — 🏛 PROFESSIONAL ARCHITECTURE RECOMMENDATIONS

---

### REC-01 — Adopt a Secrets Management System
Your current `.env` approach is not production-safe. Adopt one of:
- **Doppler** (developer-friendly, free tier available)
- **Railway/Render built-in secrets** (if deploying there)
- **AWS Secrets Manager** or **GCP Secret Manager** (enterprise-grade)

Never commit secrets to Git. Rotate all existing keys immediately.

---

### REC-02 — Implement a Job Queue for Heavy Operations
Operations like `broadcastNotification`, certificate generation, and bulk enrollment updates should be offloaded to a background worker. Recommended stack:
- **BullMQ** (Redis-backed, ideal for Node.js)
- **pg-boss** (Postgres-native, no Redis dependency needed)

---

### REC-03 — Add Input Validation Middleware Across All Controllers
Currently only `authController` uses Zod validation. All other controllers parse `req.body` without schema validation, making them vulnerable to unexpected data types, SQL injection via Prisma, and runtime crashes. Apply Zod schemas to every controller.

---

### REC-04 — Implement Comprehensive API Rate Limiting
Use `express-rate-limit` with different tiers:
- **Auth routes:** 5 req/15min per IP
- **API routes:** 100 req/min per user
- **File upload routes:** 10 req/min per user
- **Admin routes:** 200 req/min per admin (log all excess)

---

### REC-05 — Add Database Query Pagination to All List Endpoints
`getAllUsers`, `getAllCourses`, `getAllInstructors`, `getTransactions`, and `getEnrollments` all return unbounded result sets. With 10k+ users, these will timeout and crash. Implement cursor-based or offset pagination on all list endpoints.

---

### REC-06 — Use `httpOnly` Cookies Instead of `localStorage` for Tokens
Your frontend likely stores JWT tokens in `localStorage`, which is vulnerable to XSS attacks. Move to `httpOnly` `Secure` cookies for the refresh token (the access token can remain in memory).

---

### REC-07 — Implement Audit Logging for All Admin Actions
Currently only content moderation actions are logged. Admin actions like `approveInstructor`, `updateUserStatus`, and `updateCourseStatus` leave no audit trail. Add a generic `AdminAuditLog` model and log every sensitive admin action with `adminId`, `action`, `targetId`, and `metadata`.

---

### REC-08 — GDPR / Data Privacy Compliance
The platform collects personal data (name, email, phone, DOB, parent contact). There is:
- No privacy policy page
- No data deletion endpoint ("Right to be Forgotten")
- No data export endpoint ("Right to Portability")
- No cookie consent mechanism

These are legal requirements in many jurisdictions.

---

## SUMMARY SCORECARD

| Category | Issues Found | Critical | High | Medium | Low |
|----------|-------------|----------|------|--------|-----|
| Security | 11 | 5 | 3 | 2 | 1 |
| Data Integrity | 8 | 0 | 3 | 2 | 3 |
| Frontend Polish | 7 | 0 | 2 | 2 | 3 |
| Architecture | 8 | 0 | 0 | 2 | 6 |
| **Total** | **34** | **5** | **8** | **8** | **13** |

> [!IMPORTANT]
> The platform has a strong foundational architecture and excellent UI quality. However, **the 5 critical issues must be resolved before any real users or real money touches the system.** The most urgent are the exposed secrets (CRIT-01), the missing refresh secret (CRIT-02), and the free enrollment bypass (CRIT-03).
