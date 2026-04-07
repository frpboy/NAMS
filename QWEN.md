# NAMS - Nutrition Assessment Management System

## Project Overview

**NAMS** is a purpose-built clinical ERP (Enterprise Resource Planning) web application for nutritionists working at **Sahakar Smart Clinic** locations. It replaces legacy Google Forms-based workflows with a "Smart Clinical Layer" that provides:

- **Patient Auto-Fill**: Instant recall of patient identity and history via 10-digit phone number lookup
- **Auto-Calculated Biometrics**: Real-time BMI calculation from height/weight inputs
- **Dynamic Test Catalog**: Categorized, accordion-based lab test selection managed by Admin
- **Clean Export Engine**: Generate Excel/PDF reports showing only conducted tests (no empty columns)
- **Multi-Outlet Scalability**: Manage unlimited clinic locations without code changes

**Status**: Planning complete. Ready for development.

---

## Technology Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 14+ (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS + Shadcn UI |
| **Database** | **Supabase** PostgreSQL | Supabase
| **ORM** | Prisma |
| **Authentication** | NextAuth.js (Auth.js) |
| **Form Handling** | React Hook Form + Zod |
| **Export (Excel)** | ExcelJS |
| **Export (PDF)** | jsPDF + html2canvas |
| **Deployment** | Vercel |

---

## Application Architecture

### User Roles (RBAC)
- **ADMIN**: Full access — manage outlets, test catalog, users, view/export all assessments
- **NUTRITIONIST**: Create/view assessments, filter by outlet, export data, edit entries

### Database Schema (Core Entities)
- **User**: Authenticated staff (name, email, password, role)
- **Outlet**: Clinic locations (id, name, location)
- **Patient**: Patient static details (id, contactNumber [UID], name, age, sex, occupation, place)
- **Assessment**: Clinical records (linked to patient + outlet, biometrics, selectedTests as JSON, clinical notes, timestamps)
- **MasterTest**: Dynamic test catalog (name, category, isActive)

### Key Logic Flows
1. **Patient Lookup**: 10-digit phone → DB query → auto-fill Name/Age/Sex/Place/Occupation
2. **BMI Auto-Calc**: `BMI = Weight(kg) / (Height(m)²)` — real-time, read-only, color-coded
3. **Selective Export**: Excel output dynamically includes only conducted tests per patient
4. **Data Migration**: CSV → PostgreSQL via TypeScript migration script with upsert logic

---

## Project Structure (Planned)

```
/app
  /(auth)              # Login/Sign-up routes
  /(dashboard)         # Main Table, Search, Filters
    /assessment        # /new (Stepper Form), /[id] (Details)
  /(admin)             # ADMIN-only routes
    /outlets           # Manage clinic locations
    /tests             # Manage Test Master List & Categories
    /users             # Manage Nutritionist accounts
/components
  /forms               # Reusable Step components (PatientStep, VitalsStep, etc.)
  /ui                  # Shadcn UI base components
/lib
  /actions             # Server Actions (db.assessment.create, etc.)
  /validations         # Zod schemas (phone regex, BMI logic)
  /utils               # Export scripts (ExcelJS logic)
/scripts
  migrate.ts           # Legacy Google Sheets → PostgreSQL migration
```

---

## Development Phases

### Phase 1: Data Foundation (Skeleton)
- Prisma schema setup + `db push`
- Seed data (5 outlets, basic test list)
- NextAuth login + middleware protection

### Phase 2: Admin Control Panel (Settings)
- Test Master List Manager (add tests, assign categories)
- Outlet Manager (CRUD for clinic locations)
- User Management (create/deactivate nutritionists)

### Phase 3: Smart Assessment Engine (Heart)
- 4-step stepper: Identity → Biometrics → Lab Tests → Clinical Summary
- Patient lookup with auto-fill
- Real-time BMI calculation with color coding
- Categorized accordion test selection
- Server Actions for secure submission

### Phase 4: Dashboard & Reporting (Brain)
- Master review table with pagination
- Dynamic filtering (outlet, date range, status, BMI category)
- Excel export engine (ExcelJS)
- Patient PDF generator (jsPDF)

### Phase 5: Data Migration (Legacy Import)
- CSV parser script for Google Sheets data
- Field mapping, normalization, edge case handling
- Import audit & verification

---

## Environment Setup

### Prerequisites
- Node.js v18.17+ (LTS recommended)
- Git
- **Supabase** PostgreSQL database

### Initialization Commands
```bash
# Create Next.js app
npx create-next-app@latest nams
# Select: TypeScript, ESLint, Tailwind, src/, App Router, @/* alias

# Install dependencies
npm install prisma @prisma/client next-auth@beta lucide-react
npm install react-hook-form zod @hookform/resolvers
npm install exceljs jspdf html2canvas date-fns

# Initialize Shadcn UI
npx shadcn-ui@latest init
npx shadcn-ui@latest add table button input checkbox card dialog tabs accordion

# Initialize Prisma
npx prisma init
```

### Environment Variables (.env)
```env
# Supabase - Transaction mode (Supavisor pooler) - for runtime
DATABASE_URL="postgres://user:password@aws-0-region.pooler.supabase.com:6543/postgres?pgbouncer=true"
# Supabase - Direct connection (session mode) - for Prisma migrations
DIRECT_URL="postgres://user:password@aws-0-region.supabase.co:5432/postgres"
NEXTAUTH_SECRET="<generate with: openssl rand -base64 32>"
NEXTAUTH_URL="http://localhost:3000"
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_ANON_KEY="your-anon-key"
```

### Database Sync
```bash
# Use DIRECT_URL for migrations
npx prisma db push --schema=prisma/schema.prisma
npx prisma studio   # Open DB viewer (uses DATABASE_URL)
```

---

## Key Design Decisions

- **Phone Number as Patient UID**: 10-digit contact number serves as unique identifier
- **selectedTests as JSON**: Stored as array of test names for flexible reporting
- **Legacy/Imported Outlet**: Imported historical data assigned to a default outlet for clean filtering
- **Frozen Historical Data**: Deactivating a test doesn't remove it from old assessments
- **Read-Only BMI**: Calculated client-side, not user-editable, to eliminate human error

---

## Color Palette (Health-Focused)
- **Primary**: `#0D9488` (Teal 600) — health/professional medical
- **Secondary**: `#F1F5F9` (Slate 100) — clean, non-cluttered background
- **Status Badges**: Green (Normal BMI), Red (High BMI/Sugar), Blue (Returning Patient)
- **Typography**: Inter (Sans-serif)

---

## QA & Testing Strategy

| Test Type | Tools | Focus |
|---|---|---|
| Unit/Functional | Jest/Vitest | BMI formula, validation rules |
| Integration | Playwright | Patient lookup, form submission flow |
| Data Integrity | Prisma Studio | Migration audit, export accuracy |
| Cross-Device | Manual | Tablet/mobile touch, form responsiveness |
| UAT | End Users | "Clinic Speed" test (<3 min per entry) |
| Edge Cases | Manual | Double-submit prevention, missing biometrics |

---

## Deployment

1. Push to GitHub repository
2. Create/configure **Supabase** project for production
3. Import into Vercel, configure environment variables (`DATABASE_URL`, `DIRECT_URL`, `NEXTAUTH_SECRET`, `SUPABASE_URL`)
4. Run `npx prisma db push` on production **Supabase** database (use `DIRECT_URL`)
5. Connect custom domain (e.g., `nams.sahakarclinic.com`)
6. Run final data migration from Google Sheets
7. Admin onboarding: configure outlets, tests, users

---

## Key Files in This Directory

| File | Description |
|---|---|
| `PRD.md` | Product Requirements Document — problem, users, MVP features, KPIs |
| `Plan.md` | Tech stack, architecture, DB schema, implementation phases |
| `This Technical Architecture Design.md` | Detailed system architecture, Prisma schema, logic flows, security |
| `Development Phase.md` | 5-sprint development breakdown with technical pro-tips |
| `Environment Setup.md` | Step-by-step local dev, dependencies, DB provisioning |
| `UI-UX Wireframing.md` | High-fidelity wireframes, stepper design, color palette, interactions |
| `Data Migration.md` | 5-step migration plan from Google Sheets to PostgreSQL |
| `Testing & Quality Assurance (QA).md` | QA plan — functional, integration, data integrity, UAT, edge cases |
| `Deployment & Onboarding.md` | Production deployment, admin/nutritionist onboarding, scaling |

---

## Notes for Development

- Use **Server Actions** for form submissions (secure, works on slow Wi-Fi)
- Apply **Zod validation** rigorously (e.g., `z.string().length(10)` for phones)
- Use **Shadcn Skeleton** components for loading states
- Implement **optimistic updates** for perceived performance
- **Disable submit button** after first click to prevent double submissions
- Handle **missing biometrics** gracefully (show "N/A" for BMI, don't crash)
