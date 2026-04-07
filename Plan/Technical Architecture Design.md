# Technical Architecture Design — NAMS

> **Document Type:** Technical Architecture Design (TAD)  
> **Project:** Nutrition Assessment Management System (NAMS)  
> **Status:** Final  
> **Last Updated:** 2026-04-08

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Data Architecture](#2-data-architecture)
3. [Application Architecture](#3-application-architecture)
4. [Critical Logic Flows](#4-critical-logic-flows)
5. [Security & RBAC](#5-security--rbac)
6. [Deployment & Infrastructure](#6-deployment--infrastructure)
7. [Data Migration Plan](#7-data-migration-plan)

---

## 1. System Overview

NAMS is a **full-stack web application** built using a **monolithic architecture** (Next.js) for simplicity and rapid deployment on Vercel. It focuses on three core pillars:

| Pillar | Description |
|---|---|
| **Scalability** | Support unlimited Sahakar Smart Clinic outlets without code changes |
| **Data Integrity** | Automated BMI calculations, validated inputs, type-safe queries |
| **Performance** | Next.js App Router, Server Actions, optimized client-side rendering |

### Architecture Layers

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | React (Next.js App Router) | Dashboard, multi-step assessment forms, admin panels |
| **Backend** | Next.js Server Actions | Server-side logic without a separate API layer |
| **Database** | PostgreSQL via **Neon** (Serverless PostgreSQL) | Relational data management for patients, assessments, outlets |
| **ORM** | Prisma | Type-safe database queries and schema management |

---

## 2. Data Architecture

The database schema is designed to handle **dynamic outlets** and **dynamic test catalogs**, enabling the system to scale as the Sahakar Smart Clinic network grows.

### 2.1 Entity Relationship Overview

```
User ────────────────────────────────── (Authentication & Roles)
                                          
Outlet ─────────┐
                ├──< Assessment >── Patient
MasterTest ─────┘         │
                          └── Clinical Records (Biometrics, Tests, Notes)
```

### 2.2 Prisma Schema

#### User

Authenticated users (nutritionists and admins).

```prisma
model User {
  id        String   @id @default(cuid())
  name      String
  email     String   @unique
  password  String   // Hashed
  role      Role     @default(NUTRITIONIST)
  createdAt DateTime @default(now())
}

enum Role {
  ADMIN
  NUTRITIONIST
}
```

#### Outlet

Dynamic Sahakar Smart Clinic locations managed by the Admin.

```prisma
model Outlet {
  id          String       @id @default(cuid())
  name        String       @unique
  location    String?
  assessments Assessment[]
}
```

#### MasterTest

Dynamic test catalog — Admin manages available tests and their categories.

```prisma
model MasterTest {
  id        String   @id @default(cuid())
  name      String   @unique
  category  String   // e.g., "Liver Function", "Vitamins"
  isActive  Boolean  @default(true) // Admin can deactivate
}
```

#### Patient

Static patient details. The **10-digit contact number** serves as the unique identifier.

```prisma
model Patient {
  id            String       @id @default(cuid())
  contactNumber String       @unique // 10-digit UID
  name          String
  age           Int
  sex           String
  occupation    String?
  place         String
  assessments   Assessment[]
}
```

#### Assessment

The core clinical transaction — links a patient to an outlet with biometrics, lab tests, and clinical notes.

```prisma
model Assessment {
  id                String   @id @default(cuid())
  date              DateTime @default(now())
  patientId         String
  patient           Patient  @relation(fields: [patientId], references: [id])
  outletId          String
  outlet            Outlet   @relation(fields: [outletId], references: [id])

  // Biometrics
  height            Float    // cm
  weight            Float    // kg
  bmi               Float    // Auto-calculated

  // Dynamic Selected Tests (JSON array for flexible reporting)
  selectedTests     Json

  // Clinical Notes
  variationResults  String?  @db.Text
  dietPlanNotes     String?  @db.Text
  remarks           String?  @db.Text
  needsDietPlan     String   // Yes/No/Maybe

  resultReceivedAt  DateTime
  interactionAt     DateTime
  createdAt         DateTime @default(now())
}
```

---

## 3. Application Architecture

### 3.1 Folder Structure

Follows the Next.js App Router conventions with route groups, server actions, and reusable components.

```
/app
  /(auth)/                 # Login & authentication routes
  /(dashboard)/            # Main dashboard, table, search, filters
    /assessment/
      /new/                # Stepper form for new assessments
      /[id]/               # View/edit existing assessment
  /(admin)/                # Restricted to ADMIN role only
    /outlets/              # Manage clinic outlet locations
    /tests/                # Manage Master Test List & categories
    /users/                # Manage nutritionist accounts

/components
  /forms/                  # Reusable step components
    PatientStep.tsx
    VitalsStep.tsx
    LabTestsStep.tsx
    ClinicalSummaryStep.tsx
  /ui/                     # Shadcn UI base components

/lib
  /actions/                # Server Actions
    db.ts
    assessment.ts
    patient.ts
    auth.ts
  /validations/            # Zod schemas
    patient.schema.ts
    assessment.schema.ts
  /utils/                  # Export utilities
    excel-export.ts
    pdf-export.ts
    bmi-calculator.ts

/scripts/
  migrate.ts               # Legacy Google Sheets → Neon migration
```

### 3.2 Route Protection

| Route Group | Access | Middleware |
|---|---|---|
| `/(auth)` | Public | Redirects to `/dashboard` if authenticated |
| `/(dashboard)` | Authenticated (ADMIN, NUTRITIONIST) | Redirects to `/login` if unauthenticated |
| `/(admin)` | ADMIN only | Checks role; redirects if not ADMIN |

---

## 4. Critical Logic Flows

### 4.1 Patient Lookup (Efficiency)

```
Nutritionist types 10-digit contact number
    → Server Action queries Patient table
    → If match found:
        form.reset() pre-fills Name, Age, Sex, Occupation, Place
    → If no match:
        Fields remain blank for new patient entry
```

**Key Implementation Details:**
- Triggered `onChange` after 10 digits are entered
- Debounced to avoid excessive queries
- Loading skeleton shown during lookup

### 4.2 Automated BMI Calculation (Accuracy)

```
Inputs: Height (cm), Weight (kg)
    → Client-side listener on both fields
    → Formula: BMI = Weight(kg) / (Height(m) × Height(m))
    → BMI field is read-only, updates in real-time
    → Color-coded display:
        • Normal (18.5–24.9):   Green
        • Overweight (25–29.9): Amber
        • Obese (≥30):           Red
```

### 4.3 Export Engine (Reporting)

```
Admin applies filters (Outlet, Date Range, Patient)
    → Query fetches matching assessments with where clause
    → ExcelJS utility transforms selectedTests (JSON array)
      into comma-separated string per row
    → Clean .xlsx file downloaded directly in browser
```

**Example Output:**
| Date | Patient | Outlet | BMI | Tests Conducted |
|---|---|---|---|---|
| 2026-03-01 | Deepa | Manjeri | 26.4 | CBC, Lipid Profile, HBA1C |

Only conducted tests appear — no empty columns.

---

## 5. Security & RBAC

### 5.1 Authentication

| Aspect | Implementation |
|---|---|
| Provider | NextAuth.js (Auth.js) — Credentials Provider |
| Method | Email + Password (bcrypt hashed) |
| Session | JWT-based, stored in HTTP-only cookie |

### 5.2 Authorization

| Role | Permissions |
|---|---|
| **NUTRITIONIST** | Create assessments, view all assessments, filter by outlet, export data, edit entries |
| **ADMIN** | All nutritionist permissions + manage outlets, manage test catalog, manage users |

### 5.3 Data Validation

| Layer | Tool | Purpose |
|---|---|---|
| Client-side | React Hook Form + Zod | Instant feedback, 10-digit phone regex, required fields |
| Server-side | Zod (re-validated in Server Actions) | Prevent tampered requests |

### 5.4 Data Protection

- All environment variables stored in `.env` (never committed)
- HTTPS enforced via Vercel auto-provisioned SSL
- Passwords hashed with bcrypt
- Neon built-in connection pooling via PgBouncer

---

## 6. Deployment & Infrastructure

### 6.1 Infrastructure Diagram

```
┌──────────────────────────────────────────────────────┐
│                     GitHub (Main)                     │
└──────────────────────┬───────────────────────────────┘
                       │ Push
                       ▼
┌──────────────────────────────────────────────────────┐
│                    Vercel (Hosting)                   │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────┐  │
│  │ Next.js SSR │  │ Static Files │  │ Edge/Server  │  │
│  └─────────────┘  └──────────────┘  └──────┬──────┘  │
└──────────────────────────────────────────────┼────────┘
                                               │
                                               ▼
┌──────────────────────────────────────────────────────┐
│              Neon (Serverless PostgreSQL)             │
│  ┌──────────────────┐  ┌──────────────────────────┐  │
│  │  Built-in Pooler │  │   Neon Console           │  │
│  │  (PgBouncer)     │  │   (DB Inspection)        │  │
│  └──────────────────┘  └──────────────────────────┘  │
└──────────────────────────────────────────────────────┘
```

### 6.2 Environment Variables

| Variable | Source | Purpose |
|---|---|---|
| `DATABASE_URL` | Neon connection pooler | Runtime database connection via built-in pooling |
| `DIRECT_URL` | Neon direct connection | Prisma migrations and `db push` |
| `NEXTAUTH_SECRET` | Generated (`openssl rand -base64 32`) | NextAuth session encryption |
| `NEXTAUTH_URL` | Local: `http://localhost:3000` | Auth callback URL |
| `NEXT_PUBLIC_APP_URL` | Deployment URL | Link generation in the app |

### 6.3 CI/CD Pipeline

```
git push origin main
    → Vercel detects change
    → Runs build (Next.js)
    → Runs type check (TypeScript)
    → Deploys to production
    → SSL certificate auto-provisioned
```

---

## 7. Data Migration Plan

Migrating historical data from Google Sheets to Neon (Serverless PostgreSQL).

### 7.1 Process Overview

```
1. Export Google Sheets as CSV (legacy_data.csv)
2. Run migration script (/scripts/migrate.ts)
3. Script processes each row:
   a. Parse and normalize data
   b. Upsert Patient record (by contact number)
   c. Create Assessment record linked to patient
   d. Parse test names into JSON array
4. Audit: verify counts, spot-check records
```

### 7.2 Field Mapping

This is the **exact** column mapping from the legacy Google Sheet (source: [`PRD.md §9`](./PRD.md)). All 18 columns are accounted for.

| # | Google Sheet Column | NAMS Database Target | Transformation |
|---|---|---|---|
| 1 | `Timestamp` | *(discard)* | Auto-generated by Google Forms — not needed; NAMS uses `createdAt` |
| 2 | `DATE` | `Assessment.date` | Parse `DD/MM/YYYY` into ISO DateTime |
| 3 | `NAME` | `Patient.name` | Standard string; trim whitespace |
| 4 | `AGE` | `Patient.age` | Parse as Integer |
| 5 | `SEX` | `Patient.sex` | Normalize to uppercase: `MALE`, `FEMALE`, `OTHER` |
| 6 | `OCCUPATION` | `Patient.occupation` | Nullable string |
| 7 | `PLACE` | `Patient.place` | Standard string |
| 8 | `HIGHT` | `Assessment.height` | Parse as Float; `"not known"` → `0` |
| 9 | `WEIGHT` | `Assessment.weight` | Parse as Float; `"not known"` → `0` |
| 10 | `BMI` | `Assessment.bmi` | Recalculate from height/weight; `"not known"` → `0` |
| 11 | `CONTACT NUMBER` | `Patient.contactNumber` | 10-digit UID; strip spaces/dashes |
| 12 | `NAMES OF TEST CONDUCTED` | `Assessment.selectedTests` | Split comma-separated string → JSON array |
| 13 | `VARIATION IN RESULTS` | `Assessment.variationResults` | Nullable text |
| 14 | `DIET` | `Assessment.dietPlanNotes` | Nullable text — dietary advice given |
| 15 | `DO THEY NEED DIET PLAN` | `Assessment.needsDietPlan` | Map `Yes`/`No` to string; add `Maybe` option in NAMS |
| 16 | `REMARKS` | `Assessment.remarks` | Nullable text |
| 17 | `Result Received` | `Assessment.resultReceivedAt` | Parse into DateTime |
| 18 | `Patient Interaction` | `Assessment.interactionAt` | Parse into DateTime |

### 7.3 Edge Case Handling

| Scenario | Resolution |
|---|---|
| **Unknown Outlet** (legacy data has no outlet info) | Assign to a special `Legacy/Imported` outlet |
| **Duplicate Entries** | Check timestamp — skip exact duplicates |
| **Missing Biometrics** | Set height/weight to `0`, BMI to `0`; allow later update |
| **Empty Values** (`.`, `N/A`, `nil`, `"not known"`, `""`) | Convert to `null` or `0` in database |

### 7.4 Verification & Audit

After migration, perform these checks:

1. **Count Check**: Does the Google Sheet row count match NAMS assessment count?
2. **Lookup Check**: Search for known patients (e.g., "Sreeraj", "Deepa") — verify full history appears
3. **Export Check**: Generate a filtered report from NAMS and compare against the original sheet

---
