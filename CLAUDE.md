# Healio.in — Telehealth Platform

## Architecture

```
healio/
├── apps/
│   ├── backend/          # NestJS API (Express adapter)
│   ├── web/              # Next.js (Admin dashboard + Doctor portal + Landing page)
│   └── mobile/           # Expo React Native (Patient + Doctor app)
├── packages/
│   ├── tsconfig/         # Shared TypeScript configs
│   └── shared/           # Shared types (future)
├── docker-compose.yml    # PostgreSQL, Redis, LiveKit, Coturn
├── turbo.json            # Turborepo config
└── pnpm-workspace.yaml   # Monorepo workspaces
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | NestJS + Express |
| Database | PostgreSQL (Neon for prod) |
| ORM | Prisma |
| Cache | Redis (Upstash for prod) |
| Queue | BullMQ (Redis-based) |
| Storage | Cloudflare R2 (S3-compatible) |
| Video | LiveKit (self-hosted or Cloud) |
| Realtime | Socket.io + Redis adapter |
| Payments | Razorpay (UPI + Wallet only) |
| Mobile | Expo (React Native) |
| Web | Next.js 16 + Tailwind v4 |
| Monorepo | pnpm + Turborepo |

## Backend Modules (apps/backend/src/)

| Module | Purpose |
|--------|---------|
| auth/ | Patient OTP + Doctor email/password + Admin + JWT |
| users/ | Patient profile, family members, favourites, conversations |
| doctors/ | Profile, slots, categories, documents, earnings, payouts |
| bookings/ | Instant + scheduled, reschedule, extend, cancel, for-member |
| wallet/ | Balance (₹25K limit), add money, transactions |
| plans/ | Plan purchase + redemption, family plan sharing |
| payments/ | Razorpay orders, verification, auto-payouts (weekly) |
| reports/ | Upload (with expiry window), doctor voice reply |
| prescriptions/ | Text + file + voice note prescriptions |
| reviews/ | Star ratings + comments + anonymous + moderation |
| video/ | LiveKit token generation |
| chat/ | WebSocket gateway (messages, typing, read receipts, status) |
| notifications/ | In-app notifications, unread count |
| categories/ | Specialists + Symptoms/Diseases + public content |
| admin/ | Dashboard, doctor/patient management, plans, coupons, CMS, roles |
| storage/ | Cloudflare R2 file upload + signed URLs |
| redis/ | Doctor online status, OTP, active sessions |
| queue/ | BullMQ processors (auto-cancel, refund, session-end) |

## Database Models (Prisma)

Users: User, Patient, Doctor, FamilyMember, FavouriteDoctor
Medical: Category (Specialists), Symptom, SymptomSpecialist, DoctorCategory, DoctorDocument, DoctorSlot
Bookings: Booking, Report, Prescription, Review, Message
Financial: Wallet, Transaction, Plan, PatientPlan, Coupon, RazorpayOrder, DoctorPayout
Admin: AppConfig, Faq, CmsPage, Banner, Notification, AdminPermission, AuditLog

## Key Business Rules

- **Pricing**: Plan-based only (no per-doctor fee). Admin sets plan prices.
- **Plans**: Single (₹399), Family 3-member (₹1000), Family 5-member (₹1500), Yearly (₹5999)
- **Family**: Max 5 members (3 adults + 3 children). Children auto-verified, 18+ need OTP.
- **Child discount**: 10% off flat rate for child bookings only
- **Family plan sharing**: Wife registers → auto-linked → shares husband's plan consultations
- **Commission**: 70% doctor / 30% platform (configurable)
- **Payouts**: Weekly (Friday) via Razorpay to doctor's UPI
- **Wallet limit**: ₹25,000 max balance
- **Consultation**: 15 min default, +5 min extension (doctor only, once)
- **Reschedule**: Once only, disabled if <15 min remaining
- **Report upload**: Configurable window (default 10 days after consultation)
- **Doctor reply**: Voice note within 24 hours
- **Age**: Computed from DOB dynamically (never stored as static)
- **Rejection**: Mandatory reason, shown to doctor, allows re-application
- **Suspension**: No re-application allowed
- **Payment methods**: UPI + Wallet only (no cards/netbanking)
- **Coupons**: Flat / Percentage / Up-to-₹X. Can be linked to specific plans.
- **Multi-category doctors**: One doctor can be Cardiologist + Gynecologist
- **Search**: Matches doctor name, specialization, qualifications, or any linked category

## Running Locally

```bash
# Prerequisites: Node.js, pnpm, PostgreSQL, Redis

# Install
pnpm install

# Database
cd apps/backend
cp .env.example .env
npx prisma db push
npx prisma db seed

# Backend (port 3000)
npx ts-node -r tsconfig-paths/register src/main.ts

# Admin dashboard (port 3001)
cd apps/web && npx next dev -p 3001

# Mobile (Expo Go)
cd apps/mobile && npx expo start
```

## Credentials (Dev)

| Role | Login | Password |
|------|-------|----------|
| Admin | admin@healio.in | admin123 |
| Doctor 1 | doctor@healio.in | doctor123 |
| Doctor 2 | derma@healio.in | doctor123 |
| Patient | +919876543210 (OTP: 123456) | — |

## API Docs

Swagger: http://localhost:3000/api/docs

## Branding

Healio — a venture of Web Accuracy Pvt. Ltd.
Website: webaccuracy.com
