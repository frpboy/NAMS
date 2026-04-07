# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Project

**NAMS** (Nutrition Assessment Management System) — a clinical ERP replacing Google Forms for nutritionists at Sahakar Smart Clinic. The planning phase is complete (`Plan/` directory). The application code has not been built yet; the repo is currently a fresh Next.js scaffold.

---

## Commands

```bash
# Development
npm run dev          # Start Next.js dev server (http://localhost:3000)
npm run build        # Production build
npm run lint         # ESLint (eslint-config-next/core-web-vitals + typescript)

# Database
npm run db:push      # Push Prisma schema to Neon (use DIRECT_URL)
npm run db:migrate   # Run Prisma migrations (use DIRECT_URL)
npm run db:generate  # Regenerate Prisma client after schema changes
npm run db:studio    # Open Prisma Studio visual DB browser
```

There are no tests yet. The plan calls for **Vitest** (unit) and **Playwright** (E2E) — add them before writing tests.

---

## PWA & Device Support

NAMS is a **Progressive Web App (PWA)**. It is designed **primarily for mobile and tablet use** — nutritionists at Sahakar Smart Clinic typically enter assessments on phones or tablets at the clinic. Desktop/PC use is also fully supported.

- `public/manifest.json` — `display: standalone`, `orientation: portrait-primary`
- `theme_color: #0d9488` — teal chrome bar on Android
- `src/app/icon.svg` — auto-detected favicon by Next.js App Router
- `public/logo-icon.svg` — apple-touch-icon for iOS home screen

When designing UI, **mobile-first** layouts take priority. The assessment stepper and dashboard must work well on a 375 px viewport.

---

## Architecture

### Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript 5** (strict mode)
- **Tailwind CSS v4** + **Shadcn UI** (Radix primitives)
- **Prisma 5** ORM + **Neon** (Serverless PostgreSQL)
- **NextAuth.js v5** (beta) — JWT sessions, credentials provider
- **React Hook Form** + **Zod** — form state and validation
- **ExcelJS** (Excel export) + **jsPDF** + **html2canvas** (PDF export)
- Path alias: `@/*` → `./src/*`

### Planned folder structure

```
src/
  app/
    (auth)/              # Public — login page; redirects if already authenticated
    (dashboard)/         # NUTRITIONIST + ADMIN — main table, filters, search
      assessment/
        new/             # 4-step stepper form
        [id]/            # View / edit existing assessment
    (admin)/             # ADMIN only — middleware blocks NUTRITIONIST
      outlets/
      tests/
      users/
  components/
    forms/               # PatientStep, VitalsStep, LabTestsStep, ClinicalSummaryStep
    ui/                  # Shadcn UI components
  lib/
    actions/             # Next.js Server Actions (assessment.ts, patient.ts, auth.ts)
    validations/         # Zod schemas (patient.schema.ts, assessment.schema.ts)
    utils/               # bmi-calculator.ts, excel-export.ts, pdf-export.ts
scripts/
  migrate.ts             # One-time: Google Sheets CSV → Neon via Prisma upsert
```

### Database connections (two URLs required)

| Variable | Connection | Used for |
|---|---|---|
| `DATABASE_URL` | Neon connection pooling (built-in) | Runtime queries |
| `DIRECT_URL` | Neon direct connection | `prisma migrate` / `prisma db push` |

Neon provides a serverless Postgres. Both URLs point to the same Neon endpoint with `?sslmode=require`.

### Core data model

- **Patient** — static details; `contactNumber` (10-digit) is the `@unique` UID
- **Assessment** — links Patient + Outlet; `selectedTests` is a `Json` field (array of test name strings)
- **MasterTest** — Admin-managed test catalog with `category` grouping and `isActive` flag
- **Outlet** — Admin-managed clinic locations
- **User** — `Role` enum: `ADMIN` | `NUTRITIONIST`

Full Prisma schema: [Plan/Technical Architecture Design.md](Plan/Technical%20Architecture%20Design.md#22-prisma-schema)

### Key logic rules

- **Patient lookup**: triggered `onChange` after exactly 10 digits; debounced; calls a Server Action
- **BMI**: `weight / (height/100)²` — computed client-side, stored as `Float`, field is read-only
- **selectedTests**: saved as JSON array of strings; export renders only present tests (no empty columns)
- **Frozen history**: deactivating a `MasterTest` must not remove it from existing assessments
- **Double-submit guard**: disable submit button after first click
- **Legacy outlet**: imported CSV records are assigned to a dedicated `"Legacy/Imported"` outlet

### Route protection (NextAuth middleware)

| Route group | Who can access |
|---|---|
| `(auth)` | Public; redirect to `/dashboard` if session exists |
| `(dashboard)` | Any authenticated user |
| `(admin)` | `ADMIN` role only |

### BMI color coding convention

| Range | Color |
|---|---|
| 18.5 – 24.9 | Green (Normal) |
| 25 – 29.9 | Amber (Overweight) |
| ≥ 30 | Red (Obese) |

---

## Environment variables

```env
DATABASE_URL="postgresql://<user>:<password>@<project-id>-pooler.<region>.aws.neon.tech/<dbname>?sslmode=require"
DIRECT_URL="postgresql://<user>:<password>@<project-id>-pooler.<region>.aws.neon.tech/<dbname>?sslmode=require"
NEXTAUTH_SECRET="<openssl rand -base64 32>"
NEXTAUTH_URL="http://localhost:3000"
```

---

## Planning documents

All requirements and design decisions live in `Plan/`:

| File | Contents |
|---|---|
| `PRD.md` | Business problem, user stories, MVP feature list, KPIs |
| `Technical Architecture Design.md` | Prisma schema, folder structure, logic flows, security |
| `Tech Stack.md` | Every dependency mapped to a PRD requirement |
| `Development Phase.md` | 5 sprint breakdown with implementation notes |
| `UI-UX Wireframing.md` | Stepper layout, component choices, color tokens |
| `Data Migration.md` | CSV field mapping, migration script, edge cases |
| `Environment Setup.md` | Step-by-step local setup |
