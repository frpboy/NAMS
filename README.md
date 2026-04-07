# NAMS — Nutrition Assessment Management System

> A purpose-built clinical ERP for nutritionists at **Sahakar Smart Clinic**.

---

## What is NAMS?

NAMS replaces a Google Forms-based nutrition workflow with a **smart clinical tool** that:

| Problem | NAMS Solution |
|---|---|
| Re-entering patient details every visit | **Instant Recall** — type a phone number, get identity + history |
| Manual BMI calculation with a calculator | **Auto-Calc** — real-time BMI from height/weight inputs |
| Scrolling 60+ unsorted test checkboxes | **Categorized Accordions** — grouped, collapsible test categories |
| Manual Excel cleanup for reports | **Clean Export** — one-click Excel with only conducted tests |
| Hardcoded clinic locations | **Dynamic Scaling** — add outlets via Admin panel, zero code changes |

---

## Quick Start

### Prerequisites

- **Node.js** v18.17+ (LTS recommended)
- **Git**
- **Supabase** project (free tier works)

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd nams
npm install
```

### 2. Install Dependencies

```bash
# Database & Auth
npm install prisma @prisma/client next-auth@beta lucide-react

# Form Handling & Validation
npm install react-hook-form zod @hookform/resolvers

# Export & Utilities
npm install exceljs jspdf html2canvas date-fns
```

### 3. Initialize Shadcn UI

```bash
npx shadcn@latest init
npx shadcn@latest add table button input checkbox card dialog tabs accordion \
  skeleton toast select label radio-group textarea form date-picker
```

### 4. Set Up Environment

Create a `.env` file in the project root:

```env
# Supabase - Transaction mode (runtime via Supavisor pooler)
DATABASE_URL="postgres://user:password@aws-0-region.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Supabase - Direct mode (for Prisma migrations)
DIRECT_URL="postgres://user:password@aws-0-region.supabase.co:5432/postgres"

# Authentication
NEXTAUTH_SECRET="your-secret-key"   # Generate: openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"

# Optional
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_ANON_KEY="your-anon-key"
```

### 5. Initialize Database

```bash
npx prisma init
# Copy the schema into prisma/schema.prisma (see Technical Architecture Design)
npx prisma db push
npx prisma studio   # Open visual database browser
```

### 6. Run Development Server

```bash
npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)**.

---

## Project Structure

```
/app
  /(auth)/              # Login & authentication
  /(dashboard)/         # Main dashboard, table, search, filters
    /assessment/        # Stepper form (new) + view/edit (by id)
  /(admin)/             # Admin-only: outlets, tests, users

/components
  /forms/               # Stepper step components
  /ui/                  # Shadcn UI base components

/lib
  /actions/             # Server Actions (database operations)
  /validations/         # Zod schemas
  /utils/               # Excel/PDF export, BMI calculator

/scripts/
  migrate.ts            # Google Sheets → Supabase migration
```

---

## Documentation

All planning documents are in [`/Plan`](./Plan/):

| Document | Description |
|---|---|
| [PRD](./Plan/PRD.md) | Product Requirements — problems, users, MVP features, KPIs |
| [Tech Stack](./Plan/Tech%20Stack.md) | Every technology choice mapped to PRD requirements |
| [Technical Architecture Design](./Plan/Technical%20Architecture%20Design.md) | Full system blueprint — schema, flows, security, deployment |
| [Development Phase](./Plan/Development%20Phase.md) | 5-sprint development breakdown |
| [Environment Setup](./Plan/Environment%20Setup.md) | Step-by-step local development setup |
| [UI-UX Wireframing](./Plan/UI-UX%20Wireframing.md) | Wireframes, stepper design, color palette, interactions |
| [Data Migration](./Plan/Data%20Migration.md) | Google Sheets → Supabase migration plan |
| [Testing & QA](./Plan/Testing%20&%20Quality%20Assurance%20(QA).md) | QA plan — functional, integration, UAT, edge cases |
| [Deployment & Onboarding](./Plan/Deployment%20&%20Onboarding.md) | Production deployment and user onboarding |

**Recommended reading order:**
1. [PRD](./Plan/PRD.md) — Understand the problem
2. [Tech Stack](./Plan/Tech%20Stack.md) — See how technology addresses each requirement
3. [Technical Architecture Design](./Plan/Technical%20Architecture%20Design.md) — Understand the system blueprint
4. [Environment Setup](./Plan/Environment%20Setup.md) — Get coding

---

## User Roles

| Role | Permissions |
|---|---|
| **Admin** | Manage users, outlets, test catalog + all nutritionist capabilities |
| **Nutritionist** | Create/view assessments, filter by outlet, export data, edit entries |

---

## Key Features

### Patient Lookup
Enter a 10-digit phone number → system auto-fills Name, Age, Sex, Occupation, Place if the patient exists.

### Auto-Calculated BMI
Enter Height (cm) + Weight (kg) → BMI appears in real-time with color-coded categories (Green/Amber/Red).

### Categorized Lab Tests
60+ medical tests organized into collapsible accordions (General Health, Metabolic, Organ Function, Vitamins).

### Clean Export Engine
One-click Excel export that shows **only** conducted tests per patient — no empty checkbox columns.

### Legacy Data Migration
Import historical Google Sheets data with a TypeScript migration script — patients upserted by phone number, tests parsed into JSON arrays.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14+ (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + Shadcn UI |
| Database | **Supabase** PostgreSQL |
| ORM | Prisma |
| Authentication | NextAuth.js (Auth.js) |
| Forms | React Hook Form + Zod |
| Export | ExcelJS + jsPDF |
| Deployment | Vercel |

See the full [Tech Stack](./Plan/Tech%20Stack.md) document for details.

---

## License

Private — Sahakar Smart Clinic internal project.
