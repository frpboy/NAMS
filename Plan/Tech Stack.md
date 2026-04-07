# Tech Stack — NAMS

> **Document Type:** Technology Stack Specification  
> **Project:** Nutrition Assessment Management System (NAMS)  
> **Status:** Final  
> **Last Updated:** 2026-04-08  
> **Parent Document:** [PRD.md](./PRD.md)

---

## Table of Contents

1. [Overview](#1-overview)
2. [Core Stack](#2-core-stack)
3. [Database & ORM](#3-database--orm)
4. [Authentication & Authorization](#4-authentication--authorization)
5. [Form Handling & Validation](#5-form-handling--validation)
6. [UI Component Library](#6-ui-component-library)
7. [Export & Reporting](#7-export--reporting)
8. [Utilities & Helpers](#8-utilities--helpers)
9. [Development & Tooling](#9-development--tooling)
10. [Deployment](#10-deployment)
11. [Dependency Installation](#11-dependency-installation)

---

## 1. Overview

This document maps every technology choice in NAMS directly to the **functional requirements** and **measurable outcomes** defined in the [PRD](./PRD.md).

| PRD Goal | Tech Choice | How It Delivers |
|---|---|---|
| Reduce return patient entry time by **60%** | React Hook Form + Server Actions | Instant patient lookup with debounced queries, form `reset()` for auto-fill |
| Eliminate **100%** of BMI calculation errors | Client-side TypeScript logic | Real-time, read-only BMI calculation — no manual input possible |
| Reduce monthly report time from **1 hour to 1 click** | ExcelJS + Supabase filtered queries | One-click filtered export with dynamic column generation |
| Scale to unlimited outlets without code changes | Supabase + Prisma dynamic relations | Admin-managed Outlet and MasterTest tables |
| Zero manual formatting on exports | ExcelJS custom mappers | Only conducted tests appear in output — no empty columns |

---

## 2. Core Stack

| Technology | Version | Purpose | Why |
|---|---|---|---|
| **Next.js** | 14+ | Framework (App Router, Server Actions, SSR/SSG) | Monolithic full-stack — no separate API server needed |
| **TypeScript** | 5.x | Type-safe application logic | Prevents data integrity bugs across 60+ test fields, patient IDs, and assessments |
| **Node.js** | 18.17+ (LTS) | Runtime environment | Required by Next.js; stable LTS support |

### PRD Alignment

- **Target Platform:** Web (Next.js / Vercel) — [PRD §1](./PRD.md)
- **Monolithic Architecture:** Simplifies deployment and scaling — [TAD §1](./Technical%20Architecture%20Design.md#1-system-overview)

---

## 3. Database & ORM

### Supabase (PostgreSQL)

| Aspect | Detail |
|---|---|
| **Provider** | Supabase |
| **Database Engine** | PostgreSQL |
| **Connection Pooling** | Supavisor (Transaction mode on port 6543, Session mode on port 5432) |
| **Dashboard** | Supabase Table Editor for data inspection |
| **Future Capability** | Row Level Security (RLS) for multi-tenant requirements |

### Prisma ORM

| Aspect | Detail |
|---|---|
| **Role** | Type-safe query builder and schema manager |
| **Migration Tool** | `prisma migrate` (uses `DIRECT_URL`) |
| **Development Tool** | `prisma studio` — visual database browser |

### Connection Strategy

```
Runtime (App) ─────► DATABASE_URL (Supavisor Transaction Pooler :6543)
Migrations ─────────► DIRECT_URL (Direct Session Mode :5432)
```

### Models

| Model | PRD Requirement | Description |
|---|---|---|
| `User` | [PRD §6 — P0: User Management](./PRD.md) | Authenticated staff (ADMIN / NUTRITIONIST) |
| `Outlet` | [PRD §6 — P0: Dynamic Outlets](./PRD.md) | Sahakar Smart Clinic locations — Admin managed |
| `Patient` | [PRD §6 — P1: Patient Lookup](./PRD.md) | Static patient details; `contactNumber` as UID |
| `Assessment` | [PRD §6 — P1: Smart Assessment Form](./PRD.md) | Core clinical record — biometrics, tests, notes |
| `MasterTest` | [PRD §6 — P1: Categorized Lab Tests](./PRD.md) | Dynamic test catalog — Admin managed |

### PRD Alignment

- **Data Integrity:** Phone number as Unique Identifier — [PRD §9](./PRD.md)
- **Relational Design:** Complex links between Patients, Assessments, Outlets — [TAD §2](./Technical%20Architecture%20Design.md#2-data-architecture)

---

## 4. Authentication & Authorization

| Technology | Purpose |
|---|---|
| **NextAuth.js (Auth.js) v5** | Session management and role-based route protection |
| **bcrypt** | Password hashing for credentials provider |

### Configuration

| Aspect | Detail |
|---|---|
| **Provider** | Credentials (Email + Password) |
| **Session Strategy** | JWT-based, stored in HTTP-only cookie |
| **Role Check** | Middleware inspects session token for `ADMIN` or `NUTRITIONIST` |
| **Secret** | `NEXTAUTH_SECRET` — generated via `openssl rand -base64 32` |

### PRD Alignment

- **RBAC:** Secure login for both roles — [PRD §6 — P0](./PRD.md)
- **Route Protection:** `/admin` restricted to ADMIN only — [TAD §3.2](./Technical%20Architecture%20Design.md#32-route-protection)

---

## 5. Form Handling & Validation

| Technology | Purpose |
|---|---|
| **React Hook Form** | Performant form state management with minimal re-renders |
| **@hookform/resolvers** | Bridge between Zod and React Hook Form |
| **Zod** | Schema validation for client and server-side input verification |

### Why This Combination

The assessment form contains **60+ lab test checkboxes** across multiple categories. React Hook Form avoids unnecessary re-renders during checkbox toggling, while Zod ensures:

- Contact number is exactly 10 digits: `z.string().length(10)`
- Height/weight are positive numbers
- Required fields (outlet, date) are never empty

### PRD Alignment

- **Patient Lookup:** Auto-fill on 10-digit entry — [PRD §6 — P1](./PRD.md)
- **Categorized Lab Tests:** Accordion-based checkbox groups — [PRD §6 — P1](./PRD.md)
- **Data Validation:** No "broken" data enters Supabase — [TAD §5](./Technical%20Architecture%20Design.md#5-security--rbac)

---

## 6. UI Component Library

| Technology | Purpose |
|---|---|
| **Tailwind CSS** | Utility-first styling |
| **Shadcn UI** | Accessible, composable UI primitives built on Radix UI |
| **Lucide React** | Icon library |

### Shadcn Components Used

| Component | Usage |
|---|---|
| `Table` | Dashboard assessment list, Admin outlet/test management |
| `Accordion` | Categorized lab test groups (Step 3 of assessment) |
| `Tabs` | Alternative navigation for test categories |
| `Input` | Phone lookup, height/weight, patient details |
| `Checkbox` | Lab test selection |
| `Card` | Step containers, metric cards |
| `Dialog` | Modals for add/edit outlet, add/edit test, confirmations |
| `Button` | Form actions, export triggers |
| `Skeleton` | Loading states for patient lookup and dashboard |
| `Toast` | Success/error notifications |
| `DatePicker` | Result received date, interaction date |
| `Select` | Outlet dropdown, sex selection, "Needs Diet Plan" |

### Design Tokens

| Token | Value | Usage |
|---|---|---|
| Primary | `#0D9488` (Teal 600) | Buttons, links, active states |
| Background | `#F1F5F9` (Slate 100) | Page background |
| Normal BMI | Green | BMI badge (18.5–24.9) |
| Overweight BMI | Amber | BMI badge (25–29.9) |
| Obese BMI | Red | BMI badge (≥30) |
| Returning Patient | Blue | Patient lookup success badge |
| Font | Inter (Sans-serif) | All text — clinical number readability |

### PRD Alignment

- **Entry Stepper:** 4-step wizard — [PRD §7](./PRD.md)
- **Dashboard:** Metric cards, filter bar, high-density table — [PRD §7](./PRD.md)
- **Admin Settings:** Two tables for outlets and test catalog — [PRD §7](./PRD.md)

---

## 7. Export & Reporting

### ExcelJS

| Purpose | Detail |
|---|---|
| **Full Export** | All assessments as `.xlsx` |
| **Filtered Export** | Respects active filters (outlet, date range, patient) |
| **Dynamic Columns** | `selectedTests` JSON array → comma-separated string per row |
| **Clean Output** | No empty test columns — only conducted tests appear |

### jsPDF + html2canvas

| Purpose | Detail |
|---|---|
| **Patient PDF** | Single assessment branded PDF for patient handout |
| **Template** | Clean layout with clinic branding, patient details, test results, clinical notes |

### PRD Alignment

- **Clean Export Engine:** Reports show only conducted tests — [PRD §4](./PRD.md)
- **Selective Exporting:** Full, filtered, and dynamic columns — [PRD §6 — P2](./PRD.md)

---

## 8. Utilities & Helpers

| Package | Purpose |
|---|---|
| **date-fns** | Date formatting, parsing, and manipulation across the app |

### Custom Utilities

| File | Purpose |
|---|---|
| `/lib/utils/bmi-calculator.ts` | BMI calculation formula and category classification |
| `/lib/utils/excel-export.ts` | ExcelJS workbook builder with filtered data mapping |
| `/lib/utils/pdf-export.ts` | jsPDF template generator for single assessment |

---

## 9. Development & Tooling

| Tool | Purpose |
|---|---|
| **ESLint** | Code quality and consistency |
| **Prisma Studio** | Visual database browser for development and audit |
| **Supabase Dashboard** | Direct table inspection and SQL editor |

### Recommended Testing Tools (QA Phase)

| Tool | Purpose |
|---|---|
| **Vitest** | Unit tests (BMI formula, validation schemas) |
| **Playwright** | E2E tests (assessment form flow, patient lookup) |

### PRD Alignment

- **Accuracy:** Eliminate 100% of human error in BMI — [PRD §5](./PRD.md)
- **Report Accuracy:** Zero manual formatting — [PRD §8](./PRD.md)

---

## 10. Deployment

| Service | Role |
|---|---|
| **Vercel** | Hosting — optimized for Next.js, automatic SSL, CI/CD from GitHub |
| **Supabase** | PostgreSQL database — managed, pooled connections, dashboard |
| **GitHub** | Source control — pushes to `main` trigger Vercel deployment |

### CI/CD Flow

```
Developer pushes to main
    → Vercel builds Next.js app
    → Runs TypeScript type-check
    → Deploys to production URL
    → SSL certificate auto-renewed
```

### PRD Alignment

- **Deployment:** Hosted on Vercel for high availability — [PRD §9](./PRD.md)

---

## 11. Dependency Installation

### Core Dependencies

```bash
# Database & Auth
npm install prisma @prisma/client next-auth@beta lucide-react

# Form Handling & Validation
npm install react-hook-form zod @hookform/resolvers

# Export & Utilities
npm install exceljs jspdf html2canvas date-fns
```

### Shadcn UI Initialization

```bash
# Initialize
npx shadcn@latest init

# Install required components
npx shadcn@latest add table button input checkbox card dialog tabs accordion \
  skeleton toast select label radio-group textarea form
```

### Prisma Setup

```bash
npx prisma init
```

Then copy the schema from [Technical Architecture Design §2.2](./Technical%20Architecture%20Design.md#22-prisma-schema) into `prisma/schema.prisma`.

### Environment Variables

```env
# Supabase - Transaction mode (runtime)
DATABASE_URL="postgres://user:password@aws-0-region.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Supabase - Direct mode (migrations)
DIRECT_URL="postgres://user:password@aws-0-region.supabase.co:5432/postgres"

# Auth
NEXTAUTH_SECRET="<openssl rand -base64 32>"
NEXTAUTH_URL="http://localhost:3000"

# Optional
NEXT_PUBLIC_APP_URL="https://nams.sahakarclinic.com"
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_ANON_KEY="your-anon-key"
```

---

## Cross-Reference Matrix

| PRD Section | Tech Stack Component | Architecture Section |
|---|---|---|
| §5 — Efficiency (60% faster entry) | React Hook Form + Server Actions | [TAD §4.1](./Technical%20Architecture%20Design.md#41-patient-lookup-efficiency) |
| §5 — Accuracy (zero BMI errors) | TypeScript client-side logic | [TAD §4.2](./Technical%20Architecture%20Design.md#42-automated-bmi-calculation-accuracy) |
| §5 — Reporting (1 hour → 1 click) | ExcelJS + Supabase queries | [TAD §4.3](./Technical%20Architecture%20Design.md#43-export-engine-reporting) |
| §6 — P0: User & Outlet Mgmt | NextAuth + Prisma User/Outlet models | [TAD §2.2](./Technical%20Architecture%20Design.md#22-prisma-schema) |
| §6 — P1: Smart Assessment | React Hook Form + Zod + Shadcn Stepper | [TAD §3.1](./Technical%20Architecture%20Design.md#31-folder-structure) |
| §6 — P2: Data Migration | Node.js migration script + Prisma upsert | [TAD §7](./Technical%20Architecture%20Design.md#7-data-migration-plan) |
| §6 — P2: Selective Exporting | ExcelJS dynamic column mapping | [TAD §4.3](./Technical%20Architecture%20Design.md#43-export-engine-reporting) |
| §8 — KPIs | Supabase analytics queries | Dashboard table + filters |
| §9 — Data Integrity | Phone as UID, Zod validation | [TAD §5](./Technical%20Architecture%20Design.md#5-security--rbac) |

---
