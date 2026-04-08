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

### Server Actions Created
| File | Functions |
|---|---|
| `lib/actions/outlets.ts` | `getOutlets`, `createOutlet`, `updateOutlet`, `deleteOutlet` |
| `lib/actions/master-tests.ts` | `getMasterTests`, `getMasterTestsByCategory`, `createMasterTest`, `updateMasterTest`, `toggleMasterTest`, `deleteMasterTest` |
| `lib/actions/users.ts` | `getUsers`, `createUser` (bcrypt), `updateUserRole`, `deleteUser` |
| `lib/actions/patients.ts` | `lookupPatientByPhone` (with history), `createOrUpdatePatient`, `getPatients`, `getUniquePlaces` |  
| `lib/actions/assessments.ts` | `createAssessment`, `updateAssessment`, `deleteAssessment`, `getAssessment`, `getAssessments` |
| `lib/actions/diet-plans.ts` | `getDietPlans`, `getActiveDietPlans`, `createDietPlan`, `updateDietPlan`, `toggleDietPlan`, `deleteDietPlan` |
| `lib/actions/audit.ts` | `createLog`, `getAuditLogs` |

## 2026-04-09 05:00 — Performance Audit & Architectural Refinement

### Changes Made
- **Parallel Fetching:** Implemented `Promise.all` for dashboard data fetches.
- **Data Capping:** Added `take: 100` limit to assessment lists.
- **DB Indexing:** Added index to `needsDietPlan` for faster metric calculation.

## 2026-04-09 06:30 — Diet Plan System & Report Fidelity Improvements

### Changes Made
- **Diet Plans:** New `DietPlan` model and admin management module.
- **Role Update:** Nutritionists granted access to Outlets, Tests, and Diet Plans.
- **PDF Fidelity:** Switched to professional table format with interpreted status flags.

## 2026-04-09 07:15 — Mandatory Place Field & Intelligent Autocomplete

### Changes Made
- **Data Quality:** Made `place` field required in schema and validation.
- **Autocomplete:** Real-time database search for unique places during intake.

## 2026-04-09 08:45 — Advanced Reports, Audit Logs & Historical PDF Reports

### Changes Made
- **Reports Module:** New `/reports` page with customizable columns (including Place) and sorting.
- **Audit Logs:** System-wide tracking of assessment mutations (Admin only).
- **Patient History:** PDF exports now include a complete historical summary linked by phone number.

## 2026-04-09 09:15 — Infrastructure Optimization: Prisma Accelerate

### Changes Made
- **Accelerate Integration:** Integrated `@prisma/extension-accelerate` for edge-optimized queries.
- **DB Client Refactor:** Updated `src/lib/db.ts` to use `$extends(withAccelerate())`.
- **Performance:** Reduced latency for all clinical data lookups via Prisma's global edge network.
