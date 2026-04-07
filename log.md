# NAMS Development Log

> **LOG RULES — DO NOT VIOLATE**
> - This file is **append-only**. Never delete or replace existing entries.
> - Every entry must include a **date and time** (`YYYY-MM-DD HH:MM`).
> - Add new entries at the **bottom** of the file.
> - Entries are permanent historical records. If something was wrong, add a correction entry — do not edit the original.

## 2026-04-08 — Project Setup & Foundation

### Project Initialization
- Initialized Next.js 16.2.2 project via `create-next-app` with TypeScript, Tailwind CSS 4, App Router, src dir
- Configured package name as `nams-web`
- Set up `postcss.config.mjs`, `eslint.config.mjs`, `next.config.ts`, `tsconfig.json`

### Database Configuration
- **Provider:** Neon (Serverless PostgreSQL)
- Created `prisma/schema.prisma` with 5 models:
  - `User` — Admin/Nutritionist auth with bcrypt passwords
  - `Outlet` — Dynamic clinic locations
  - `MasterTest` — Categorized lab test catalog
  - `Patient` — Patient details, `contactNumber` as unique UID
  - `Assessment` — Core clinical record with biometrics, tests, notes
- Configured `.env` with Neon connection string (PgBouncer pooling, `sslmode=require`)
- Both `DATABASE_URL` and `DIRECT_URL` point to same Neon endpoint
- Created `prisma/seed.ts` with 2 users, 5 outlets + legacy, 38 tests in 6 categories
- Prisma v5.22.0 client generated successfully

### Dependencies Installed
| Category | Packages |
|---|---|
| **Core** | next 16.2.2, react 19.2.4, react-dom 19.2.4 |
| **Database** | @prisma/client 5.11.0, prisma 5.11.0 |
| **Auth** | next-auth 5.0.0-beta.25, bcryptjs, @types/bcryptjs |
| **Forms** | react-hook-form 7.51.0, zod 3.22.4, @hookform/resolvers 3.3.4 |
| **UI** | tailwindcss 4, lucide-react 0.510.0, tailwind-merge, clsx |
| **Export** | exceljs 4.4.0, jspdf 2.5.1, html2canvas 1.4.1 |
| **Utils** | date-fns 3.3.1 |
| **Dev** | typescript 5, ts-node 10.9.2, eslint 9, @tailwindcss/postcss 4 |

### Authentication
- NextAuth v5 with Credentials provider
- bcrypt password hashing
- JWT session strategy with role in token
- Custom session/user type augmentation (`src/types/next-auth.d.ts`)
- Login page at `/login` with error handling
- Middleware protecting all routes except `/login`, `/api`, static assets

### Server Actions Created
| File | Functions |
|---|---|
| `lib/actions/outlets.ts` | `getOutlets`, `createOutlet`, `updateOutlet`, `deleteOutlet` |
| `lib/actions/master-tests.ts` | `getMasterTests`, `getMasterTestsByCategory`, `createMasterTest`, `updateMasterTest`, `toggleMasterTest`, `deleteMasterTest` |
| `lib/actions/users.ts` | `getUsers`, `createUser` (bcrypt), `updateUserRole`, `deleteUser` |
| `lib/actions/patients.ts` | `lookupPatientByPhone` (with history), `createOrUpdatePatient`, `getPatients` |
| `lib/actions/assessments.ts` | `createAssessment` (auto-BMI), `updateAssessment`, `deleteAssessment`, `getAssessment`, `getAssessments` (with filters) |
| `lib/actions/dashboard.ts` | `getDashboardStats` (total, monthly, daily, per-outlet, diet plan count) |

### Utilities Created
| File | Purpose |
|---|---|
| `lib/utils/bmi-calculator.ts` | `calculateBMI()`, `getBMICategory()`, `getBMIColor()` |
| `lib/utils/excel-export.ts` | ExcelJS workbook with styled headers, BMI conditional color formatting |
| `lib/utils/pdf-export.ts` | jsPDF branded patient report with sections (patient info, biometrics, tests, clinical notes) |
| `lib/validations/index.ts` | Zod schemas for patient, assessment, outlet, master test, user, export filters |
| `lib/db.ts` | Prisma singleton with dev logging |
| `lib/cn.ts` | Tailwind class merge utility |

## 2026-04-08 — Phase 2: Admin Panel (Complete)

### Dashboard Layout
- Sidebar with NAMS branding, navigation links, user info, sign-out button
- Role-based menu items (Admin section visible only to ADMIN role)
- Responsive layout with fixed sidebar (w-60) and scrollable main content

### Outlet Management (`/admin/outlets`)
- Server component fetches outlets with assessment counts
- Client component with inline form (name, location)
- Create, edit, delete with confirmation dialogs
- Delete blocked if outlet has linked assessments
- Table with name, location, assessment count, action buttons

### Test Master List (`/admin/tests`)
- Server component fetches all tests ordered by category
- Grouped by category with accordion-style display
- Add test form with name + category (with datalist autocomplete from existing categories)
- Activate/deactivate toggle per test
- Edit and delete per test
- Visual indicator (green dot = active, grey dot = inactive)

### User Management (`/admin/users`)
- Server component fetches users (no password exposure)
- Create form with name, email, password (min 8 chars), role dropdown
- Duplicate email check in server action
- Role switching via inline select dropdown
- Delete with "last user" safety check
- Created date display in GB format

## 2026-04-08 — Phase 3: Smart Assessment Stepper (Complete)

### Stepper Architecture
- 4-step wizard with progress bar indicators
- Step validation before advancing (required fields checked)
- Back/Next navigation with disabled states
- Submit button on final step (Step 4)
- Error display banner for server-side validation errors

### Step 1: Patient Identity
- 10-digit phone input with `onChange` debounce → automatic patient lookup
- Visual badges: "Returning Patient" (blue) or "New Patient" (green)
- Auto-fill: Name, Age, Sex, Occupation, Place from existing patient record
- Required fields: phone (10 digits), name, age, place
- Sex radio buttons: MALE, FEMALE, OTHER

### Step 2: Vitals & BMI
- Two-column layout: inputs (left), BMI display (right)
- Height (cm) and Weight (kg) as number inputs
- Real-time BMI calculation on every keystroke
- Large display box with BMI value and category label
- Color-coded: Blue (Underweight <18.5), Green (Normal 18.5-24.9), Amber (Overweight 25-29.9), Red (Obese ≥30)

### Step 3: Lab Tests
- Tests grouped by category from `MasterTest` table
- Collapsible category sections (all open by default)
- Checkbox grid (2-3 columns responsive)
- Active tests only (inactive filtered out)
- Selection counter in header ("X selected")

### Step 4: Clinical Summary
- Outlet dropdown (defaults to first outlet)
- Needs Diet Plan: segmented radio (Yes / No / Maybe)
- Date-time pickers: Result Received, Patient Interaction
- Textareas: Variation in Results, Dietary Advice, Remarks
- Submit triggers: create/update patient → create assessment with auto-BMI → redirect to dashboard

## 2026-04-08 — Phase 4: Dashboard & Reporting (Complete)

### Dashboard Overview
- 4 metric cards: Total Assessments, This Month, Today, Diet Plans Needed
- Outlet summary list with assessment counts
- Full assessment table with all columns

### Filtering System
- Outlet dropdown filter
- Date range (from/to) filter
- Patient name/phone search (instant client-side)
- Filtered count display
- "No results" empty state

### Master Review Table
- Columns: Date, Patient, Contact, Outlet, BMI (color badge), Tests (truncated), Diet Plan (color badge), Actions
- BMI badges: Green (normal), Blue (underweight), Amber (overweight), Red (obese)
- Diet Plan badges: Green (No), Amber (Maybe), Red (Yes)
- Contact number in monospace font
- Tests column shows first 3 + "..." if more
- Hover states on rows

### Excel Export (ExcelJS)
- Exports filtered data (respects active filters)
- Styled header row (Teal 600 background, white bold text)
- All 16 columns including full test list (comma-separated)
- Conditional BMI cell coloring: Green (normal), Amber (overweight), Red (obese), White (underweight)
- Dynamic filename with date: `nams-export-2026-04-08.xlsx`
- Browser-side download via Blob URL

### PDF Generator (jsPDF)
- Branded header bar (Teal 600) with NAMS branding
- Sections: Patient Information, Biometrics, Tests Conducted, Clinical Notes, Consultation Details
- BMI category label included
- Footer with generation timestamp
- Filename: `assessment-{patientName}-{date}.pdf`

## Build Verification

| Check | Result |
|---|---|
| TypeScript compilation | ✅ Pass |
| Next.js build | ✅ Pass |
| All routes generated | ✅ 8 routes |
| No runtime errors | ✅ Verified |

### Routes
```
○ /                    → Dashboard (stats + table + filters + export)
○ /login               → Authentication
ƒ /admin/outlets       → Outlet management (Admin only)
ƒ /admin/tests         → Test Master List (Admin only)
ƒ /admin/users         → User management (Admin only)
ƒ /assessment/new      → Smart Assessment Stepper (4 steps)
ƒ /api/auth/[...nextauth] → NextAuth API
```

## Known Notes
- Middleware deprecation warning: "middleware" file convention → use "proxy" in future Next.js versions (non-blocking)
- Audit vulnerabilities: 2 packages (1 moderate, 1 critical) — standard npm advisory, not project-specific
- Phase 5 (Data Migration script) is planned but not yet implemented

## Next Steps
- [ ] Set up Neon database (credentials already in `.env`)
- [ ] Run `npm run db:push` to sync Prisma schema
- [ ] Run `npm run db:seed` to create initial data
- [ ] Implement Phase 5: Google Sheets CSV migration script
- [ ] Add assessment detail/edit view (`/assessment/[id]`)
- [ ] Add loading skeletons for patient lookup
- [ ] Add toast notifications for success/error feedback
- [ ] Add optimistic UI updates on form submission
- [ ] Add E2E tests (Playwright) for assessment flow
- [ ] Add unit tests for BMI calculation and validation schemas

---

## 2026-04-08 ~18:00 — Infrastructure & Tooling Fixes

### Neon DB Connection Fix
- **Problem:** `npm run db:push` failing with P1001 (can't reach database server)
- **Root cause 1:** `prisma/schema.prisma` was missing `directUrl` — Prisma was routing migration traffic through the PgBouncer pooler which doesn't support DDL
- **Root cause 2:** `DIRECT_URL` was pointing to the pooler hostname (`-pooler.`) instead of the direct Neon endpoint
- **Root cause 3:** `channel_binding=require` in both connection strings causes modern Neon endpoints to reject connections
- **Fix:** Added `directUrl = env("DIRECT_URL")` to datasource block; removed `-pooler` from `DIRECT_URL` hostname; removed `channel_binding=require` from both URLs
- **Result:** `The database is already in sync with the Prisma schema.` ✓

### Microsoft Clarity Analytics
- Integrated Clarity (project ID: `w84ybpwfwt`) into `src/app/layout.tsx`
- Used Next.js `<Script strategy="afterInteractive">` — deferred until after hydration to avoid blocking render
- Added `import Script from "next/script"` to root layout

### Branding Assets Created
- `src/app/icon.svg` — square 48×48 teal (#0d9488) rounded-rect with white N monogram; auto-detected as favicon by Next.js App Router
- `public/logo.svg` — full 232×48 horizontal logo: teal icon + "NAMS" bold wordmark + "NUTRITION ASSESSMENT" subtitle
- `public/logo-icon.svg` — 48×48 icon-only variant for apple-touch-icon and PWA manifest
- Applied logo to `src/app/(auth)/login/page.tsx` (replaces plain h1) and `src/app/(dashboard)/layout.tsx` (replaces plain NAMS text span)

### PWA Configuration
- Created `public/manifest.json` — `display: standalone`, `orientation: portrait-primary`, `theme_color: #0d9488`, categories: health/medical/productivity
- Updated `src/app/layout.tsx` with `Viewport` export (`themeColor`, `width`, `initialScale`) and `metadata` (manifest link, appleWebApp, icons)
- App can now be installed to home screen on Android and iOS — functions without browser chrome

### Documentation Updates
- `nutrtion assessment.md` — Created from PDF; documents Google Form template with 17 fields + 60+ test checkboxes organized by category; notes 5–6 separate forms (one per outlet)
- `NUTRITION ASSESMENT DATA.md` — Created from PDF; 18-column legacy data structure, 14 data quality issues catalogued, per-outlet migration commands
- `CLAUDE.md` — Full project guidance added (commands, architecture, data model, route protection, BMI conventions, env vars, planning doc index); PWA + mobile-first section added
- `Plan/UI-UX Wireframing.md` — Added Device Context & PWA section documenting mobile-primary use, 375px priority viewport, sidebar behavior on small screens
- All `Plan/*.md` files reformatted with proper markdown structure (frontmatter, TOC, tables, code blocks)
