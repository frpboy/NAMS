# Plan — NAMS

> **Document Type:** Project Plan Overview
> **Project:** Nutrition Assessment Management System (NAMS)
> **Status:** Active
> **Last Updated:** 2026-04-08
> **Related:** [PRD.md](./PRD.md) | [Tech Stack.md](./Tech%20Stack.md) | [Technical Architecture Design.md](./Technical%20Architecture%20Design.md)

---

## Table of Contents

1. [Technology Stack](#1-technology-stack)
2. [Application Architecture](#2-application-architecture)
3. [Implementation Phases](#3-implementation-phases)

---

## 1. Technology Stack

| Category | Technology |
|---|---|
| **Framework** | Next.js (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS + Shadcn UI |
| **Database** | Neon (Serverless PostgreSQL) (with Prisma ORM) |
| **Authentication** | NextAuth.js (Auth.js) |
| **Form Handling** | React Hook Form + Zod |
| **Exporting** | ExcelJS (Excel) + jspdf/html2canvas (PDF) |

> Full dependency list and version details: [Tech Stack.md](./Tech%20Stack.md)

---

## 2. Application Architecture

### A. User Roles & RBAC

Both Admin and Nutritionist share the same RBAC for the MVP.

| Role | Capabilities |
|---|---|
| **ADMIN** | Create assessments, view all assessments, filter by outlet, export data, edit entries, manage users, manage outlets, manage tests |
| **NUTRITIONIST** | Create assessments, view all assessments, filter by outlet, export data, edit entries |

### B. Database Schema (Entities)

| Entity | Fields |
|---|---|
| **User** | Name, Email, Password, Role, Assigned Outlet (optional) |
| **Outlet** | ID, Name, Location details |
| **Patient** | Name, Age, Sex, Occupation, Contact Number, Place |
| **Assessment** | Patient, Outlet, Date, Biometrics (Height/Weight/BMI), Tests Conducted (JSON array), Timestamps (Result Received, Interaction), Clinical Notes, Status |

> Full Prisma schema: [Technical Architecture Design §2.2](./Technical%20Architecture%20Design.md#22-prisma-schema)

---

## 3. Implementation Phases

### Phase 1: Setup & Auth

- Configure Next.js and database connection
- Implement the login screen
- Create global state/context to track the active outlet per nutritionist session

### Phase 2: The Assessment Form

- **Multi-step form** grouped into four sections: Personal Info → Biometrics → Lab Tests → Clinical Notes
- **BMI Calculator**: auto-calculates in real-time as Height and Weight are entered

> Detailed sprint breakdown: [Development Phase.md](./Development%20Phase.md)

### Phase 3: Dashboard & Review Table

- Master table showing all assessment entries
- **Filters**: Outlet, Date Range, Patient Name
- **Sorting**: by Date, Age, or BMI

### Phase 4: Export Engine

- **Export to Excel**: generates a filtered `.xlsx` spreadsheet from the current filtered view
- **Download Patient PDF**: generates a clean, branded PDF of a single assessment for the patient

> Export implementation details: [Tech Stack §7](./Tech%20Stack.md#7-export--reporting)
