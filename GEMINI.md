# GEMINI — Nutrition Assessment Management System (NAMS)

> **Document Type:** Instructional Context
> **Project:** NAMS Clinical ERP
> **Status:** Active
> **Last Updated:** 2026-04-08

## 1. Project Overview
NAMS is a modern clinical ERP designed for nutritionists to streamline patient assessments, track clinical measurements, and manage lab test results. It is built as a mobile-primary PWA to support clinicians in fast-paced environments.

### Core Technologies
- **Framework:** Next.js 16.2.2 (App Router, Turbopack)
- **Language:** TypeScript 5.8
- **UI/UX:** React 19, Tailwind CSS 4, Lucide React
- **Database:** Neon PostgreSQL (Serverless)
- **ORM:** Prisma 5.22.0
- **Auth:** NextAuth.js v5 (Beta 30)
- **Reporting:** ExcelJS, jsPDF

## 2. Architecture & Data Model
The project uses a structured route group pattern:
- `src/app/(auth)`: Public authentication routes.
- `src/app/(protected)`: Shared layout with a global, collapsible sidebar containing:
  - **Dashboard:** Filtered analytics and clinical record list.
  - **Assessment:** 4-step wizard for patient intake, vitals, lab results, and clinical notes.
  - **Admin:** Management of Outlets, Master Tests, and Users.

### Key Models
- **Patient:** Unique identification by 10-digit `contactNumber`.
- **Assessment:** Clinical records linked to patients and outlets. Lab tests are stored as a JSON array of `{ name, value }` objects.
- **MasterTest:** A rich catalog of lab parameters including gender-specific reference ranges and management advice.

## 3. Building and Running

### Development Commands
- `npm run dev`: Starts the development server with Turbopack.
- `npm run build`: Generates the Prisma client and creates a production Next.js build.
- `npm run db:push`: Synchronizes the Prisma schema with the Neon database.
- `npm run db:seed`: Populates the database with clinical data and system administrators.
- `npm run db:import`: Executes the legacy migration script (`src/scripts/import-legacy.ts`).

## 4. Development Conventions

### UI/UX Standards
- **Color Palette:** Primary: Teal (`teal-600`), Background: Slate (`bg-[#f8fafc]`), Borders: Slate (`border-slate-200`).
- **Sidebar:** Collapsible "icon-only" mode on small screens; persistent on large desktops.
- **Forms:** Always use Zod (`src/lib/validations`) for schema validation with human-friendly error messages.
- **Icons:** Standardize on Lucide React for all system actions and navigation.

### Implementation Guidelines
- **Server Actions:** All data mutations and complex retrievals must live in `src/lib/actions`.
- **Dynamic Data:** Pages requiring real-time data (like Admin lists or New Assessments) should use `export const dynamic = "force-dynamic"`.
- **Lab Intelligence:** Use `src/lib/utils/lab-reference-ranges.ts` for clinical status calculations and reference range lookups.
- **Context Preservation:** Always update `log.md` with significant architectural or feature changes.

## 5. Deployment
- **Platform:** Vercel
- **Environment Variables:** Requires `DATABASE_URL`, `DIRECT_URL`, and `AUTH_SECRET`.
- **Build Step:** Ensure `prisma generate` runs before `next build` (configured in `package.json`).
