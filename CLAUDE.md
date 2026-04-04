# BlinkCure (formerly Healio.in) — Telehealth Platform

## Company
- **Brand**: BlinkCure
- **Domain**: blinkcure.com
- **Parent Company**: Web Accuracy Pvt. Ltd.
- **Website**: webaccuracy.com

## Architecture

```
healio/
├── apps/
│   ├── backend/          # NestJS API (Express adapter)
│   ├── web/              # Next.js (Admin + Doctor dashboard + Landing page)
│   └── mobile/           # Expo React Native (Patient + Doctor app)
├── packages/
│   ├── tsconfig/         # Shared TypeScript configs
│   └── shared/           # Shared types (future)
├── docker-compose.yml    # Local dev: PostgreSQL, Redis, LiveKit, Coturn
├── turbo.json            # Turborepo config
└── pnpm-workspace.yaml   # Monorepo workspaces
```

## Production Server

| | Details |
|--|--------|
| **Provider** | ManageServer.in |
| **Hostname** | vm892189754.manageserver.in |
| **IP** | 45.196.196.154 |
| **OS** | Ubuntu 24.04 |
| **Specs** | 1 vCPU, 2GB RAM, 30GB NVMe SSD |
| **Username** | root |
| **Password** | Eq6XozEbsM0ZyCNs (CHANGE IN PRODUCTION) |
| **Location** | India |
| **Cost** | ₹294/mo (incl. tax) |

### Services Running (PM2)

| Service | Port | PM2 Name |
|---------|------|----------|
| NestJS API | 3000 | healio-api |
| Next.js Web | 3002 | healio-web |
| PostgreSQL | 5432 | system service |
| Redis | 6379 | system service |
| Nginx | 80 | system service |

### PM2 Commands
```bash
pm2 status                    # Check all services
pm2 restart healio-api        # Restart API
pm2 restart healio-web        # Restart web
pm2 logs healio-api           # View API logs
pm2 logs healio-web           # View web logs
```

### Deploy Updates
```bash
ssh root@45.196.196.154
cd /root/Healio.in
git pull
cd apps/backend && npx prisma generate && npx prisma db push
cd ../web && npx next build
pm2 restart all
```

## Live URLs

| URL | Purpose |
|-----|---------|
| https://blinkcure.com | Landing page |
| https://blinkcure.com/auth/login | Admin + Doctor login |
| https://blinkcure.com/auth/doctor-register | Doctor registration |
| https://blinkcure.com/admin/dashboard | Admin panel |
| https://blinkcure.com/doctor/dashboard | Doctor portal |
| https://cdn.blinkcure.com | CDN for uploaded files |
| https://blinkcure.com/api/docs | Swagger API docs |
| http://45.196.196.154 | Direct IP access |

## Cloudflare

| | Details |
|--|--------|
| **Account** | Cloudflare Free plan |
| **DNS** | blinkcure.com → 45.196.196.154 (Proxied) |
| **Subdomains** | www, api, admin, cdn — all proxied |
| **SSL Mode** | Flexible (Cloudflare handles HTTPS, connects to server via HTTP) |
| **CDN** | cdn.blinkcure.com → R2 bucket `blinkcure` |

### DNS Records
| Type | Name | Content | Proxy |
|------|------|---------|-------|
| A | @ | 45.196.196.154 | Proxied |
| A | www | 45.196.196.154 | Proxied |
| A | api | 45.196.196.154 | Proxied |
| A | admin | 45.196.196.154 | Proxied |
| CNAME | cdn | blinkcure (R2) | Proxied |

## Cloudflare R2 (File Storage)

| | Details |
|--|--------|
| **Bucket Name** | blinkcure |
| **Region** | Asia Pacific (APAC) |
| **Custom Domain** | cdn.blinkcure.com |
| **Account ID** | 49d407078e35702b56690c5aa85fd607 |
| **Access Key ID** | a0f0bd6de4a0a4eb35c5c3c620048cf7 |
| **Secret Access Key** | 2512927949627b77f80c26a06a1fc7b4df273c7d7d38e4d8169335fe7bb24402 |
| **Endpoint** | https://49d407078e35702b56690c5aa85fd607.r2.cloudflarestorage.com |
| **Public URL** | https://cdn.blinkcure.com |
| **Free Tier** | 10GB storage, 10M reads/mo, unlimited egress |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | NestJS + Express |
| Database | PostgreSQL 16 (on server) |
| ORM | Prisma 5.22 |
| Cache | Redis 7 (on server) |
| Queue | BullMQ (Redis-based) |
| Storage | Cloudflare R2 (S3-compatible) |
| CDN | cdn.blinkcure.com |
| Video | LiveKit Cloud (free 5,000 min/mo) → self-hosted later |
| Realtime | Socket.io + Redis adapter |
| Payments | Razorpay (UPI + Wallet only) |
| Mobile | Expo (React Native) |
| Web | Next.js 16 + Tailwind v4 |
| Monorepo | pnpm + Turborepo |
| Process Manager | PM2 |
| Reverse Proxy | Nginx |
| SSL | Cloudflare Flexible (free) |
| DNS | Cloudflare (free) |

## Backend Modules (apps/backend/src/)

| Module | Purpose |
|--------|---------|
| auth/ | Patient OTP + Doctor email/password + Admin + JWT |
| users/ | Patient profile, family members, favourites, conversations |
| doctors/ | Profile, slots, categories, documents, earnings, payouts, onboarding |
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
| categories/ | Specialists + Symptoms/Diseases + public content (FAQ, CMS, banners) |
| admin/ | Dashboard, doctor/patient management, plans, coupons, CMS, roles, payouts |
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
- **Doctor onboarding**: Wizard (Welcome → Profile → Specializations → Documents → Submit → Admin approves)
- **Locked dashboard**: Bookings + Earnings locked until doctor approved

## Credentials

### Production (blinkcure.com)
| Role | Login | Password |
|------|-------|----------|
| Admin | admin@healio.in | admin123 |
| Doctor (Approved) | doctor@healio.in | doctor123 |
| Doctor 2 (Approved) | derma@healio.in | doctor123 |
| Doctor (New/Pending) | newdoctor@healio.in | test123 |
| Patient | +919876543210 (OTP: 123456) | — |

### Database (Production)
| | |
|--|--|
| Host | localhost (on server) |
| Port | 5432 |
| Database | healio |
| User | healio |
| Password | healio_prod_2026 |
| Connection | postgresql://healio:healio_prod_2026@localhost:5432/healio |

### JWT (Production)
| | |
|--|--|
| Expires | 24 hours |
| Refresh expires | 7 days |
| Secret | Auto-generated on deploy (check .env on server) |

### Razorpay (Not yet configured)
| | |
|--|--|
| Key ID | — (add when ready) |
| Key Secret | — |
| Mode | UPI + Wallet only |

## Running Locally

```bash
# Prerequisites: Node.js, pnpm, PostgreSQL, Redis
brew services start postgresql@16 && brew services start redis

# Install
pnpm install

# Database
cd apps/backend
cp .env.example .env
npx prisma generate
npx prisma db push
npx ts-node prisma/seed.ts

# Backend (port 3000)
npx ts-node -r tsconfig-paths/register src/main.ts

# Admin dashboard (port 3002)
cd apps/web && npx next dev -p 3002

# Mobile (Expo Go)
cd apps/mobile && npx expo start
```

## Future Integrations

### Video Calling (Phase 2)
- Separate server: 8 vCPU / 16-24GB RAM
- Self-hosted LiveKit → video.blinkcure.com
- Just change LIVEKIT_API_URL in .env

### Lab Tests (Thyrocare B2B)
- Partner with Thyrocare for blood test ordering
- B2B pricing: 60-70% discount off MRP
- Revenue: ₹400-800 per test
- White-label: patient sees BlinkCure, not Thyrocare
- Doctor orders tests → home collection → report auto-uploaded
- Also allow patients to self-book tests from app

### Scaling Path
| Milestone | Action |
|-----------|--------|
| 0-50K patients | Current ₹294/mo server |
| 50K-300K | Upgrade to 4GB RAM server |
| 300K+ | Upgrade to $15/mo (8 Core/24GB) |
| Video calls needed | Add 2nd server for LiveKit |
| 1M+ patients | Kubernetes cluster |

## GitHub

| | |
|--|--|
| Repo | https://github.com/Jhalakdev/healio.git |
| Branch | main |
