# Deployment & Onboarding — NAMS

> **Document Type:** Deployment & Onboarding Guide
> **Project:** Nutrition Assessment Management System (NAMS)
> **Status:** Final
> **Last Updated:** 2026-04-08
> **Related:** [Environment Setup.md](./Environment%20Setup.md) | [Data Migration.md](./Data%20Migration.md) | [Technical Architecture Design.md](./Technical%20Architecture%20Design.md)

---

## Table of Contents

1. [Production Deployment](#1-production-deployment-the-launch)
2. [Admin Onboarding](#2-admin-onboarding-the-setup)
3. [Nutritionist Onboarding](#3-nutritionist-onboarding-the-training)
4. [Post-Launch Hyper-Care](#4-post-launch-hyper-care-week-1-2)
5. [Growth & Scaling](#5-growth--scaling-future-proofing)
6. [Project Summary](#6-project-summary)

---

## 1. Production Deployment *(The "Launch")*

NAMS is hosted on **Vercel**, optimized for Next.js with high performance in India.

### Step 1: Database Provisioning

1. Initialize the production **Neon** (Serverless PostgreSQL) project
2. Run `npx prisma db push` to create all tables in the live environment
   - Use `DIRECT_URL` (direct connection) for migrations
   - The runtime `DATABASE_URL` uses Neon built-in connection pooling

### Step 2: Environment Variables

Configure the following variables in the **Vercel Project Settings → Environment Variables**:

| Variable | Value |
|---|---|
| `DATABASE_URL` | Neon connection pooler connection string |
| `DIRECT_URL` | Neon direct connection string |
| `NEXTAUTH_SECRET` | Generated via `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Production URL (e.g., `https://nams.sahakarclinic.com`) |
| `NEXT_PUBLIC_APP_URL` | Same as above |

### Step 3: Custom Domain

1. Connect the professional domain (e.g., `nams.sahakarclinic.com`) in Vercel settings
2. Vercel automatically provisions an **SSL certificate (HTTPS)** for medical data security

### Step 4: Final Data Migration

Run the migration script one final time to pull the very latest data from Google Sheets, ensuring the system starts with 100% up-to-date patient history.

```bash
npx ts-node scripts/migrate.ts
```

> Migration details: [Data Migration.md](./Data%20Migration.md)

---

## 2. Admin Onboarding *(The "Setup")*

Before nutritionists log in, the Admin must configure the system's core data.

### Setup Checklist

- [ ] **Outlet Configuration** — Add the 5+ Sahakar Smart Clinic locations (Makkaraparamba, Manjeri, etc.)
- [ ] **Test Master List** — Categorize all tests under groups (e.g., Blood, Vitamins, Liver) so nutritionists see an organized form
- [ ] **Nutritionist Accounts** — Create login credentials for all staff at each outlet

---

## 3. Nutritionist Onboarding *(The "Training")*

**Goal:** Show nutritionists how NAMS makes their work faster and easier compared to Google Forms.

### The "Speed" Training *(~30 minutes)*

| Topic | Demonstration |
|---|---|
| **The Lookup Advantage** | Type a phone number (e.g., `9633435228` for Deepa) — her full history appears instantly |
| **The BMI Cheat-Sheet** | Show how the app calculates BMI automatically — no calculator needed |
| **The Tabbed Form** | Show how to quickly find tests like "HBA1C" or "Lipid Profile" within their category accordion |

### Device Setup

- Help nutritionists **"Add to Home Screen"** on tablets or mobile phones so NAMS looks and feels like a native app
- Ensure browser **auto-fill is disabled** for clinical fields to prevent accidental data entry errors

---

## 4. Post-Launch Hyper-Care *(Week 1–2)*

Active monitoring during the first two weeks after go-live.

| Activity | Frequency | Details |
|---|---|---|
| **Daily Sync** | Daily | 5-minute check-in to verify no medical tests are missing from the Master List |
| **Data Audit** | Once (Day 3) | Admin checks the first 50 entries to ensure BMI and Outlet tagging are 100% correct |
| **Legacy Cleanup** | As needed | If old patient data was imported with errors (e.g., misspelled names), the nutritionist uses the "Edit Patient" feature to correct it |

---

## 5. Growth & Scaling *(Future Proofing)*

As Sahakar Smart Clinic expands:

| Scenario | How to Handle |
|---|---|
| **New Outlet** | Adding "Outlet 6" or "Outlet 10" takes ~10 seconds in the Admin panel — no code changes required |
| **New Test** | Admin adds "Food Allergy Panel" to the Master List — it is immediately available at all outlets |
| **Quarterly Analytics** | Admin exports a "Full Master Report" to see which clinic has the most assessments and which BMI categories are most frequent |

---

## 6. Project Summary

| Phase | Document |
|---|---|
| **PRD** | Defined the business problem and the "Smart Clinic" solution |
| **Architecture** | Built a scalable Next.js + Neon (Serverless PostgreSQL) foundation |
| **UI/UX** | Designed a 4-step stepper to end "Form Fatigue" |
| **Migration** | Built a bridge to preserve historical Google Sheets data |
| **QA** | Ensured clinical accuracy of BMI and test results |
| **Deployment** | Professional deployment on Vercel with role-based access |

**NAMS is now ready for production.**
