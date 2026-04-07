# UI/UX Wireframing — NAMS

> **Document Type:** UI/UX Design Specification
> **Project:** Nutrition Assessment Management System (NAMS)
> **Status:** Final
> **Last Updated:** 2026-04-08
> **Related:** [PRD.md §7](./PRD.md#7-design-concepts-mockups) | [Tech Stack §6](./Tech%20Stack.md#6-ui-component-library)

---

## Device Context & PWA

NAMS is a **Progressive Web App (PWA)** designed **primarily for mobile and tablet use**. Nutritionists at Sahakar Smart Clinic enter assessments on their phones or clinic tablets — the app must work well at 375 px (iPhone SE) and 768 px (tablet) viewports. Desktop/PC use is also supported (nutritionists reviewing records, admins managing the system).

| Context | Device | Priority |
|---|---|---|
| Assessment entry (at clinic) | Mobile / Tablet | **Primary** |
| Dashboard review, export | PC / Desktop | Secondary |
| Admin panel | Any | Secondary |

All layouts use **mobile-first CSS** (min-width breakpoints). The stepper occupies full screen width on small devices; the sidebar collapses or hides on mobile.

The app can be installed to the home screen via the PWA manifest (`display: standalone`, portrait orientation, teal theme). This avoids the browser chrome and feels like a native app.

---

## Design Philosophy

This design focuses on reducing **"Form Fatigue."** Instead of one long scrolling page, NAMS uses a **Progressive Disclosure** pattern (a Stepper) to help the Nutritionist focus on one data category at a time.

---

## Table of Contents

1. [Global Navigation & Dashboard](#1-global-navigation--dashboard)
2. [New Assessment Stepper](#2-the-new-assessment-stepper-the-core-ui)
3. [Admin: Master Test Management](#3-admin-master-test-management)
4. [Color Palette & Accessibility](#4-color-palette--accessibility)
5. [Interaction Patterns](#5-interaction-patterns)

---

## 1. Global Navigation & Dashboard

The "Command Center" where the Nutritionist starts their day and the Admin monitors all 5+ outlets.

### Top Bar

| Position | Element |
|---|---|
| Left | NAMS Logo |
| Center | Global Search (Search by Patient Name or Phone) |
| Right | Outlet Switcher (Dropdown) + Profile / Logout |

### Metric Cards

| Card | Description |
|---|---|
| Total Assessments (Today) | Count of assessments submitted today |
| Patients Waiting | Entries saved as "Draft" |
| Diet Plans Needed | Assessments with `needsDietPlan = "Yes"` |

### Main Content Area

**Filter Bar:**

```
[ Date Range ]  [ Outlet Selection ]  [ BMI Category ]  [ Export to Excel ]
```

**The Assessment Table (Shadcn `Table`):**

| Column | Details |
|---|---|
| Date | Assessment date |
| Patient Name | Full name |
| Contact | Phone number |
| Outlet | Clinic location |
| BMI | Color-coded badge: Green (Normal), Amber (Overweight), Red (Obese) |
| Status | Complete / Draft |
| Action | View / Edit buttons |

---

## 2. The "New Assessment" Stepper *(The Core UI)*

A 4-step wizard that handles the long Google Form data efficiently.

### Step 1: Patient Identity & Context

**Card Header:** *"Step 1: Who is the Patient?"*

| Component | Behavior |
|---|---|
| **Contact Number (Input)** | Large input field. As soon as 10 digits are typed, a "Searching..." spinner appears. If a match is found, a **"Returning Patient"** badge appears and fields below auto-fill. |
| **Name, Age, Sex** | Auto-filled from database on lookup; editable for new patients |
| **Occupation, Place** | Auto-filled from database on lookup; editable for new patients |
| **Outlet (Dropdown)** | Defaults to the nutritionist's currently assigned outlet |

### Step 2: Biometrics *(The Auto-Calc Zone)*

**Card Header:** *"Step 2: Vitals & Measurements"*

**Two-column layout:**

| Left Column | Right Column |
|---|---|
| Height (cm) input | Large, read-only **BMI Display Box** |
| Weight (kg) input | Dynamic color coding + category label |

**BMI Dynamic Logic:**

| BMI Value | Box Color | Label |
|---|---|---|
| 18.5 – 24.9 | Green | "Category: Normal" |
| 25 – 29.9 | Amber | "Category: Overweight" |
| ≥ 30 | Red | "Category: Obese" |

### Step 3: Lab Test Results *(The Organized List)*

**Card Header:** *"Step 3: Medical Tests Conducted"*

**UI Pattern:** Categorized Accordions (avoids the 60-item scroll problem)

```
[+] General Health         (CBC, ESR, HB, RBC...)
[+] Metabolic / Sugar      (FBS, PPBS, HBA1C, GTT...)
[+] Organ Function         (LFT, RFT, Lipid Profile, UREA...)
[+] Vitamins & Minerals    (Vit D, Vit B12, Iron, Calcium...)
```

**Behavior:** The Nutritionist clicks a category to expand it, then checks the relevant tests. Only checked tests are saved.

### Step 4: Clinical Summary & Interaction

**Card Header:** *"Step 4: Diet Plan & Remarks"*

| Component | Description |
|---|---|
| **Result Received At** | Date picker |
| **Patient Interaction At** | Date picker |
| **Variation in Results** | Textarea — "Describe any abnormalities" |
| **Dietary Advice** | Textarea — "Recommended food changes" |
| **Needs Diet Plan?** | Segmented control: `[ YES ]` `[ NO ]` `[ MAYBE ]` |

**Action Bar:**

```
[ Save as Draft ]    [ Submit Assessment ]
```

---

## 3. Admin: Master Test Management

A clean interface to scale the system without developer involvement.

### Test List Table

| Column | Description |
|---|---|
| Test Name | Name of the lab test |
| Category | Group (e.g., Liver Function, Vitamins) |
| Status | Active / Inactive toggle |

**Actions:**
- `[ + Add New Test ]` button opens a modal
- **Add Test Modal:** Name → `"Vitamin K"`, Category → `"Vitamins"`, Status → `Active`
- **Immediate Effect:** The new test appears in Step 3 for all nutritionists across all outlets

---

## 4. Color Palette & Accessibility

Health-focused design tokens:

| Token | Hex | Usage |
|---|---|---|
| **Primary** | `#0D9488` (Teal 600) | Buttons, links, active states — represents health and medical care |
| **Background** | `#F1F5F9` (Slate 100) | Page background — clean, non-cluttered |
| **Normal BMI** | Green | BMI badge and text |
| **High BMI / Sugar** | Red | BMI badge and text |
| **Returning Patient** | Blue | Patient lookup success badge |
| **Font** | Inter (Sans-serif) | All text — optimized for clinical number readability |

---

## 5. Interaction Patterns

| Pattern | Description |
|---|---|
| **Skeleton Screens** | While the dashboard or patient lookup is loading, show grey shimmer `Skeleton` rows to make the app feel fast and responsive |
| **Toast Notifications** | Success: *"Assessment for Sreeraj saved successfully!"* (bottom-right pop-up, 3-second timeout) |
| **Confirmation Modals** | Destructive actions (e.g., delete assessment) show: *"Are you sure you want to delete this assessment? This cannot be undone."* |
