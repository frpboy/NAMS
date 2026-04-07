# Product Requirements Document — NAMS

> **Document Type:** Product Requirements Document (PRD)
> **Project:** Nutrition Assessment Management System (NAMS)
> **Status:** Initial Draft
> **Target Platform:** Web (Next.js / Vercel)
> **Last Updated:** 2026-04-08

---

## Table of Contents

1. [Problem / Opportunity](#1-problem--opportunity)
2. [Target Users & Use Cases](#2-target-users--use-cases)
3. [Current Journey](#3-current-journey)
4. [Proposed Solution / Elevator Pitch](#4-proposed-solution--elevator-pitch)
5. [Goals / Measurable Outcomes](#5-goals--measurable-outcomes)
6. [MVP / Functional Requirements](#6-mvp--functional-requirements)
7. [Design Concepts (Mockups)](#7-design-concepts-mockups)
8. [Success Metrics (KPIs)](#8-success-metrics-kpis)
9. [Appendix](#9-appendix)

---

## 1. Problem / Opportunity

### The Problem

Currently, the nutrition add-on service for Sahakar Smart Clinic is managed via generic Google Forms. This results in three major inefficiencies:

| Problem | Description |
|---|---|
| **Administrative Friction** | Data is "static." Nutritionists re-enter patient details for every visit, even for returning clients, and manually calculate BMI. |
| **Lack of Scalability** | As the number of outlets grows beyond the current five, managing a list of hardcoded clinics and a massive, unorganized list of lab tests becomes unmanageable. |
| **Reporting Silos** | Generating professional, patient-specific, or outlet-specific reports requires manual "data cleaning" in Excel. There is no automated way to export only the clinical data relevant to a specific patient. |

### The Opportunity

By building NAMS, we provide a **"Smart Clinical Layer."** This system transforms data collection from a passive form into an active clinical tool that remembers patients, automates calculations, and allows the Admin to scale the service across an unlimited number of Sahakar Smart Clinic locations.

---

## 2. Target Users & Use Cases

### The Nutritionist

- **Use Case:** Rapidly logs assessment data during or after a patient consultation.
- **Need:** Needs to see if a patient has been there before to avoid retyping, needs auto-calculated BMI to save time, and needs to pick tests from organized categories.

### The Admin

- **Use Case:** Onboards new staff and new clinic outlets. Updates the list of available medical tests.
- **Need:** Needs to generate "clean" reports for business analysis and audit the work across multiple locations.

---

## 3. Current Journey

```
Patient completes a test at a Sahakar Smart Clinic
    → Nutritionist opens a Google Form
    → Nutritionist types Contact Number
    → Manually types Name/Age/Sex (even for known patients)
    → Uses a calculator to find BMI
    → Scrolls through 60+ unsorted checkboxes for 3–4 tests
    → Submission goes to a flat Google Sheet
    → Admin manually filters the sheet to create a report
```

---

## 4. Proposed Solution / Elevator Pitch

NAMS (Nutrition Assessment Management System) is a purpose-built clinical ERP for nutritionists. It features a **"Smart-Lookup"** entry system that auto-fills patient history, an **"Auto-Calc"** biometric engine, and a **"Dynamic Settings"** panel for managing an expanding list of outlets and lab tests.

### Top 3 MVP Value Props

| # | Value Prop | Description |
|---|---|---|
| 1 | **Instant Recall** | Enter a phone number; get the patient's identity and history immediately. |
| 2 | **Clean Export Engine** | Generate Excel/PDF reports that only show the tests conducted — not a sea of empty checkboxes. |
| 3 | **Dynamic Scaling** | Add new outlets and test categories on the fly without touching code. |

---

## 5. Goals / Measurable Outcomes

| Goal | Metric | Target |
|---|---|---|
| **Efficiency** | Time-to-Entry for a return patient | Reduce by **60%** via auto-fill |
| **Accuracy** | BMI calculation errors | Eliminate **100%** of human error |
| **Reporting** | Time to generate a monthly outlet-wise report | From **1 hour → 1 click** |

---

## 6. MVP / Functional Requirements

### [P0] User & Outlet Management

- **User Management:** Admin can create, edit, and deactivate Nutritionist accounts.
- **Dynamic Outlets:** Admin can add/edit clinic outlet names (e.g., "Outlet 6 — Calicut"). These appear in the nutritionist's dropdown.
- **RBAC:** Secure login for both roles.

### [P1] The Smart Assessment Form

- **Patient Lookup:** Upon entering a 10-digit contact number, the system queries the database. If found, it pre-fills: Name, Age, Sex, Occupation, and Place.
- **Automated Biometrics:**
  - Inputs: Height (cm), Weight (kg)
  - Automatic Output: BMI displayed in real-time
- **Categorized Lab Tests:**
  - Admin can group tests (e.g., "Liver Function" contains SGOT, SGPT)
  - Nutritionist sees an accordion/tabbed view of tests, making the long list easy to navigate
- **Date-Time Pickers:** Professional selectors for "Result Received" and "Patient Interaction."

### [P2] Data Migration & Reporting

- **Legacy Data Importer:** A tool for the Admin to upload the existing Google Sheets data (CSV) to ensure no patient history is lost.
- **Selective Exporting:**
  - Full Export: Excel file of all records
  - Filtered Export: Filter by Outlet, Date Range, or Customer
  - Dynamic Columns: The Excel output for "Tests Conducted" lists only the tests that were actually selected — no empty columns

---

## 7. Design Concepts (Mockups)

| Screen | Description |
|---|---|
| **Dashboard** | High-level view showing the number of assessments done per outlet this month |
| **Entry Stepper — Step 1** | Identity: Phone number search and auto-fill |
| **Entry Stepper — Step 2** | Vitals: Height/Weight → real-time BMI |
| **Entry Stepper — Step 3** | Lab Results: Categorized checkboxes |
| **Entry Stepper — Step 4** | Consultation: Diet plan, Remarks, Needs Diet Plan dropdown |
| **Admin Settings** | Two tables — Clinic Outlets and Test Master List (with Category grouping) |

> Full wireframe breakdown: [UI-UX Wireframing.md](./UI-UX%20Wireframing.md)

---

## 8. Success Metrics (KPIs)

| KPI | Definition |
|---|---|
| **Active Outlets** | Successful data logging from all currently active outlets |
| **Return Patient Rate** | Percentage of entries where "Auto-fill" was utilized |
| **Report Accuracy** | Admin confirmation that exported reports require zero manual formatting |

---

## 9. Appendix

| Item | Detail |
|---|---|
| **Tech Stack** | Next.js 14 (App Router), Prisma ORM, PostgreSQL (Neon), Tailwind CSS + Shadcn UI |
| **Analytics** | Microsoft Clarity — session recordings, heatmaps, and usage analytics |
| **Deployment** | Hosted on Vercel for high availability and easy scaling |
| **Data Integrity** | Phone number serves as the Unique Identifier (UID) for patients |
| **Migration Note** | Historical data cleaning will involve converting "N/A", ".", or "not known" values into proper Null/Zero values for the database |

### Current Google Sheet — Actual Field Structure

The legacy Google Form outputs to a flat Google Sheet with the following columns. This is the exact structure that the NAMS database and migration script must replicate and improve upon:

| # | Google Sheet Column | NAMS Database Target | Transformation Notes |
|---|---|---|---|
| 1 | `Timestamp` | *(discard — auto-generated by Google Forms)* | Not needed; NAMS uses `createdAt` |
| 2 | `DATE` | `Assessment.date` | Parse `DD/MM/YYYY` into ISO DateTime |
| 3 | `NAME` | `Patient.name` | Standard string; trim whitespace |
| 4 | `AGE` | `Patient.age` | Parse as Integer |
| 5 | `SEX` | `Patient.sex` | Normalize to uppercase: `MALE`, `FEMALE`, `OTHER` |
| 6 | `OCCUPATION` | `Patient.occupation` | Nullable string |
| 7 | `PLACE` | `Patient.place` | Standard string |
| 8 | `HIGHT` | `Assessment.height` | Parse as Float; "not known" → `0` |
| 9 | `WEIGHT` | `Assessment.weight` | Parse as Float; "not known" → `0` |
| 10 | `BMI` | `Assessment.bmi` | Recalculate from height/weight; "not known" → `0` |
| 11 | `CONTACT NUMBER` | `Patient.contactNumber` | 10-digit UID; strip spaces/dashes |
| 12 | `NAMES OF TEST CONDUCTED` | `Assessment.selectedTests` | Split comma-separated string into JSON array |
| 13 | `VARIATION IN RESULTS` | `Assessment.variationResults` | Nullable text |
| 14 | `DIET` | `Assessment.dietPlanNotes` | Nullable text — dietary advice given |
| 15 | `DO THEY NEED DIET PLAN` | `Assessment.needsDietPlan` | Map `Yes`/`No` to string; add `Maybe` in NAMS |
| 16 | `REMARKS` | `Assessment.remarks` | Nullable text — e.g., "no need diet plans" |
| 17 | `Result Received` | `Assessment.resultReceivedAt` | Parse into DateTime |
| 18 | `Patient Interaction` | `Assessment.interactionAt` | Parse into DateTime |

### Sample Legacy Data Rows

```
04/11/2025 | sabah      | 69 | Male | not known | mkp | not known | not known | 9249504531 | ALBUMIN (SERUM), urine albumin, urine creatinine, albumin creatinine ratio | | no need | No    | no need diet plans
05/11/2025 | abdurahman | 68 | Male | not known | mkp | not known | not known | 7034578970 | LFT, RFT, FASTING BLOOD SUGAR, POSTPRANDIAL SUGAR, LIPID, TSH               | | healthy plate | No | completed
```
