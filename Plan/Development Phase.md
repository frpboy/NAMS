# Development Phase — NAMS

> **Document Type:** Development Sprint Plan
> **Project:** Nutrition Assessment Management System (NAMS)
> **Status:** Active
> **Last Updated:** 2026-04-08
> **Related:** [Plan.md](./Plan.md) | [Technical Architecture Design.md](./Technical%20Architecture%20Design.md) | [Tech Stack.md](./Tech%20Stack.md)

---

## Table of Contents

1. [Phase 1 — Data Foundation](#phase-1-data-foundation-the-skeleton)
2. [Phase 2 — Admin Control Panel](#phase-2-admin-control-panel-the-settings)
3. [Phase 3 — Smart Assessment Engine](#phase-3-smart-assessment-engine-the-heart)
4. [Phase 4 — Dashboard & Reporting](#phase-4-dashboard--reporting-the-brain)
5. [Phase 5 — Data Migration](#phase-5-data-migration-the-legacy-import)
6. [Technical Pro-Tips](#technical-pro-tips)

---

## Phase 1: Data Foundation *(The "Skeleton")*

**Goal:** Set up the database and authentication so users can log in and the system can store data.

### Tasks

- **Apply Prisma Schema**
  - Finalize `schema.prisma` with the models from [Technical Architecture Design §2.2](./Technical%20Architecture%20Design.md#22-prisma-schema)
  - Run `npx prisma db push` to sync the **Neon** (Serverless PostgreSQL) database

- **Seed Data**
  - Create a seed script to add the first 5 Sahakar Smart Clinic outlets
  - Add a basic test list (CBC, Lipid, etc.) so the assessment form is not empty on first run

- **Authentication (NextAuth)**
  - Implement the login page (`/login`)
  - Set up middleware to protect routes (`/dashboard` requires authentication)

---

## Phase 2: Admin Control Panel *(The "Settings")*

**Goal:** Allow the Admin to manage the dynamic parts of NAMS — tests and outlets.

### Tasks

- **Test Master List Manager**
  - Build a UI where the Admin can add tests (e.g., "Vitamin D", "Iron Studies")
  - Implement category grouping (e.g., "Liver Profile" → SGOT, SGPT, SGPT)

- **Outlet Manager**
  - A simple CRUD table to add new Sahakar Clinic locations as the business expands

- **User Management**
  - Invite or deactivate Nutritionist accounts

---

## Phase 3: Smart Assessment Engine *(The "Heart")*

**Goal:** Replace the Google Form with the high-fidelity 4-step Stepper UI.

### Step 1: Identity & Lookup

| Item | Detail |
|---|---|
| **Logic** | When the user types a 10-digit phone number, trigger a server action to fetch existing patient data |
| **Auto-fill** | Use `form.setValue()` to populate Name, Age, Sex, Occupation, and Place instantly |
| **UX** | Show a "Returning Patient" badge on successful lookup |

### Step 2: Biometrics & BMI

| Item | Detail |
|---|---|
| **Logic** | Add an `onChange` listener to the Height and Weight inputs |
| **Formula** | `const bmi = weight / Math.pow(height / 100, 2)` |
| **Display** | Real-time, read-only BMI with color coding |

**BMI Color Coding:**

| Range | Color | Label |
|---|---|---|
| 18.5 – 24.9 | Green | Normal |
| 25 – 29.9 | Amber | Overweight |
| ≥ 30 | Red | Obese |

### Step 3: Categorized Lab Tests

- Fetch all `MasterTest` records from the database
- Map them into **Shadcn Accordions** grouped by category
- Only "checked" tests are saved to the `selectedTests` JSON array

### Step 4: Clinical Submission

- Use **Next.js Server Actions** to save the record
- Ensures data is handled securely even on slow clinic Wi-Fi

---

## Phase 4: Dashboard & Reporting *(The "Brain")*

**Goal:** Review entries and generate professional exports.

### The Master Review Table

- Paginated table showing all assessments
- **Dynamic Filtering:** dropdowns for Outlet, Date Range, and Status
- **Search:** "Search as you type" bar for Patient Name

### Excel Export Engine (ExcelJS)

```
Filter table data
    → Transform selectedTests JSON into readable string
      (e.g., ["CBC", "Lipid Profile", "HBA1C"] → "CBC, Lipid Profile, HBA1C")
    → Download .xlsx file directly in the browser
```

> Export logic details: [Tech Stack §7](./Tech%20Stack.md#7-export--reporting)

### Patient PDF Generator (jsPDF)

- Clean, branded PDF template for a single assessment
- Nutritionist can download and hand it to the patient

---

## Phase 5: Data Migration *(The "Legacy Import")*

**Goal:** Move historical data from Google Sheets into NAMS without losing any clinical history.

### CSV Parser Script

- Script reads `legacy_data.csv` (exported from Google Sheets)
- Looks up each row by "Contact Number"
  - If the patient exists → attach a new Assessment record
  - If the patient is new → create Patient + Assessment records

### Import Audit

After the script runs, it prints a summary:

```
Migration Complete!
Imported: 150 patients, 400 assessments
Skipped:  3 duplicate entries
Errors:   0
```

> Full migration script and field mapping: [Data Migration.md](./Data%20Migration.md)

---

## Technical Pro-Tips

| Tip | Detail |
|---|---|
| **Zod Validation** | Use `z.string().length(10)` for phone numbers to prevent junk data from entering the database |
| **Loading States** | Use Shadcn `Skeleton` components during patient lookup so the nutritionist doesn't think the app is frozen |
| **Optimistic Updates** | Show a success toast immediately on form submission while the database saves in the background |
