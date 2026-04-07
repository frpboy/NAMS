# Environment Setup — NAMS

> **Document Type:** Environment Setup Guide
> **Project:** Nutrition Assessment Management System (NAMS)
> **Status:** Final
> **Last Updated:** 2026-04-08
> **Related:** [Tech Stack.md](./Tech%20Stack.md) | [Technical Architecture Design.md](./Technical%20Architecture%20Design.md)

---

## Table of Contents

1. [Local Development Requirements](#1-local-development-requirements)
2. [Project Initialization](#2-project-initialization)
3. [Install Core Dependencies](#3-install-core-dependencies)
4. [Database Provisioning (Neon)](#4-database-provisioning-neon)
5. [Environment Variables](#5-environment-variables)
6. [Prisma Initialization](#6-prisma-initialization)
7. [Version Control & Deployment Setup](#7-version-control--deployment-setup)
8. [Data Migration Environment](#8-data-migration-environment)

---

## 1. Local Development Requirements

Before running any commands, ensure your machine has the following installed:

| Tool | Version | Purpose |
|---|---|---|
| **Node.js** | v18.17+ (LTS) | Runtime environment required by Next.js |
| **Git** | Latest | Version control and Vercel deployment |
| **Database Viewer** | Prisma Studio (built-in) or DBeaver | Inspect patient data during development |

---

## 2. Project Initialization

Create the Next.js foundation:

```bash
npx create-next-app@latest nams
```

Select the following options during setup:

| Prompt | Answer |
|---|---|
| TypeScript | Yes |
| ESLint | Yes |
| Tailwind CSS | Yes |
| `src/` directory | Yes |
| App Router | Yes |
| Import alias (`@/*`) | Yes |

---

## 3. Install Core Dependencies

Navigate into your project folder first:

```bash
cd nams
```

### A. Database & Auth

```bash
npm install prisma @prisma/client next-auth@beta lucide-react
```

### B. Form Handling & Validation

Critical for managing the 60+ lab test checkboxes.

```bash
npm install react-hook-form zod @hookform/resolvers
```

### C. UI Components (Shadcn UI)

Initialize the UI library that gives NAMS its professional clinical look:

```bash
npx shadcn@latest init
# Select "Slate" or "Stone" for a clean medical feel.
```

Install the specific components needed for the Assessment Form:

```bash
npx shadcn@latest add table button input checkbox card dialog tabs accordion \
  skeleton toast select label radio-group textarea form
```

### D. Export & Utility

```bash
npm install exceljs jspdf html2canvas date-fns
```

---

## 4. Database Provisioning (Neon)

The NAMS database is hosted on **Neon** (Serverless PostgreSQL).

1. Create a new project at [console.neon.tech](https://console.neon.tech)
2. Go to the connection settings and copy the connection string:

| Connection String | Used For |
|---|---|
| **Neon endpoint** | Both `DATABASE_URL` and `DIRECT_URL` — add `?sslmode=require` to each |

Neon provides a serverless Postgres with built-in connection pooling. Both URLs point to the same Neon endpoint.

---

## 5. Environment Variables

Create a `.env` file in your project root. **Never commit this file to GitHub.**

```env
# Database Connection (from Neon)
# Connection pooler — for runtime
DATABASE_URL="postgresql://<user>:<password>@<project-id>-pooler.<region>.aws.neon.tech/<dbname>?sslmode=require"

# Direct connection — for Prisma migrations (same endpoint for Neon)
DIRECT_URL="postgresql://<user>:<password>@<project-id>-pooler.<region>.aws.neon.tech/<dbname>?sslmode=require"

# Authentication (generate a secret with: openssl rand -base64 32)
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Optional future proofing
SAHAKAR_API_KEY="your-api-key"
```

---

## 6. Prisma Initialization

Initialize Prisma to connect your code to the Neon (Serverless PostgreSQL) database:

```bash
npx prisma init
```

> **Important:** When running migrations (`npx prisma migrate dev`), Prisma uses the `DIRECT_URL`. The `DATABASE_URL` (with Neon built-in pooling) is used at runtime only.

Copy the Prisma schema from [Technical Architecture Design §2.2](./Technical%20Architecture%20Design.md#22-prisma-schema) into `prisma/schema.prisma`.

After copying the schema, push it to Neon:

```bash
npx prisma db push
```

---

## 7. Version Control & Deployment Setup

### GitHub

```bash
git add .
git commit -m "Initial NAMS setup with Shadcn and Prisma"
git remote add origin <your-github-url>
git push -u origin main
```

### Vercel

1. Go to [vercel.com](https://vercel.com) and click **"Add New Project"**
2. Import your `nams-web` repository
3. Add all `.env` variables into **Vercel Project Settings → Environment Variables**
4. Click **Deploy**

> Vercel automatically provisions an SSL certificate (HTTPS) on deployment.

---

## 8. Data Migration Environment

Since historical data must be moved from Google Sheets:

1. Create a `scripts/` folder in the project root
2. Place the CSV export of the current Google Sheets data there (`legacy_data.csv`)
3. The migration script (`scripts/migrate.ts`) will be built during the [Data Migration](./Data%20Migration.md) phase

> Full migration plan and script: [Data Migration.md](./Data%20Migration.md)
