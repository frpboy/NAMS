# Testing & Quality Assurance — NAMS

> **Document Type:** QA Plan
> **Project:** Nutrition Assessment Management System (NAMS)
> **Status:** Active
> **Last Updated:** 2026-04-08
> **Related:** [Development Phase.md](./Development%20Phase.md) | [Technical Architecture Design.md](./Technical%20Architecture%20Design.md)

---

## Overview

For NAMS, the QA phase ensures that clinical data is **100% accurate** and the system is easy for nutritionists to use in a fast-paced clinic environment. Since the system handles medical data (BMI, blood sugar, etc.), there is zero tolerance for calculation errors.

---

## Table of Contents

1. [Functional Logic Testing](#1-functional-logic-testing-the-calculator-check)
2. [Integration Testing](#2-integration-testing-the-lookup-check)
3. [Data Integrity & Migration QA](#3-data-integrity--migration-qa)
4. [Cross-Device & Performance Testing](#4-cross-device--performance-testing)
5. [User Acceptance Testing (UAT)](#5-user-acceptance-testing-uat)
6. [Edge Case Stress Testing](#6-edge-case-stress-testing)
7. [QA Tools Summary](#7-qa-tools-summary)

---

## 1. Functional Logic Testing *(The "Calculator" Check)*

Verify that all automated clinical logic works exactly as intended.

| Test | Pass Criteria |
|---|---|
| **BMI Accuracy** | Test multiple Height/Weight combinations (e.g., 170 cm / 70 kg = 24.22) against a manual calculator |
| **Contact Number Validation** | The field must reject 9-digit and 11-digit numbers; only 10 digits allowed |
| **Required Fields** | The form cannot be submitted if "Outlet" or "Date" is missing |
| **Dynamic Test List** | If the Admin adds "Vitamin K" in settings, it must immediately appear in Step 3 of the assessment form |

---

## 2. Integration Testing *(The "Lookup" Check)*

Ensure the application communicates correctly with the database.

| Test | Pass Criteria |
|---|---|
| **Search Performance** | Type a contact number from the legacy data (e.g., `9633435228` for Deepa) — all details (Name, Age, Sex, Place) must auto-fill within **1 second** |
| **History Link** | After saving a new assessment for an existing patient, the dashboard must show **two** entries for that patient — the migrated record and the new one |

---

## 3. Data Integrity & Migration QA

Audit the data bridge built during the migration phase.

### Legacy Data Audit

1. Randomly pick 5 patients from the original PDF/Google Sheet (e.g., "Umesh Kumar")
2. Verify in NAMS that their exact tests (e.g., CBC, ESR), results (e.g., ESR high), and date (e.g., 03/03/2026) are present and correct

### Selective Export Test

1. Generate an Excel report for one outlet
2. Verify: if a patient only had "HBA1C" done, the Excel "Tests" column shows only `HBA1C` — **no empty columns**

---

## 4. Cross-Device & Performance Testing

Nutritionists at Sahakar Smart Clinics use a range of devices.

| Test | Pass Criteria |
|---|---|
| **Tablet/Mobile** | Categorized Accordions for lab tests must be easy to tap with a finger; the table must scroll horizontally on small screens |
| **Long-Form Speed** | With 60+ tests available, the form must not lag when checking boxes (debounced inputs required) |
| **Vercel Deployment** | SSL certificate is active (HTTPS); database response time is acceptable from the India region |

---

## 5. User Acceptance Testing (UAT)

Final "green light" from the Nutritionist and Admin.

### The "Clinic Speed" Test

> **Goal:** Can the nutritionist complete a full entry in **under 3 minutes?**

Steps:
1. Have a nutritionist log a mock assessment using a known patient phone number
2. Verify auto-fill works and all steps complete smoothly

### Admin Report Audit

> **Goal:** Does the exported data look ready for a business meeting without any manual cleaning?

Steps:
1. Have the Admin generate a full export for all 5 outlets
2. Verify the Excel output has no empty test columns and all outlet filters work correctly

---

## 6. Edge Case Stress Testing

Push the system to identify potential failure points.

| Scenario | Expected Behavior | Solution |
|---|---|---|
| **Double Submission** | Nutritionist clicks "Submit" three times quickly | Disable submit button after the first click |
| **Missing Biometrics** | Height/Weight are unknown or zero | BMI displays "N/A" gracefully — app does not crash |
| **Deleted Tests** | Admin deactivates "Vitamin D" | Old records for patients who had Vitamin D tested still show that test — historical data is frozen and immutable |

---

## 7. QA Tools Summary

| Tool | Purpose |
|---|---|
| **Vitest** | Unit tests — BMI formula, Zod validation schemas |
| **Playwright** | End-to-end tests — simulate a nutritionist clicking through the 4-step assessment form |
| **Prisma Studio** | Visually inspect data rows after migration to catch mapping errors |
