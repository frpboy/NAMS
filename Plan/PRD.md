Product Requirements Document (PRD): NAMS
Project Name: Nutrition Assessment Management System (NAMS)
Status: Initial Draft
Target Platform: Web (Next.js / Vercel)
1. Problem/Opportunity
The Problem:
Currently, the nutrition add-on service for Sahakar Smart Clinic is managed via generic Google Forms. This results in three major inefficiencies:
Administrative Friction: Data is "static." Nutritionists have to re-enter patient details for every visit, even for returning clients, and manually calculate BMI.
Lack of Scalability: As the number of outlets grows beyond the current five, managing a list of hardcoded clinics and a massive, unorganized list of lab tests in a form becomes unmanageable.
Reporting Silos: Generating professional, patient-specific, or outlet-specific reports requires manual "data cleaning" in Excel. There is no automated way to export only the clinical data relevant to a specific patient.
The Opportunity:
By building NAMS, we provide a "Smart Clinical Layer." This system transforms the data collection from a passive form into an active clinical tool that remembers patients, automates calculations, and allows the Admin to scale the service across an unlimited number of Sahakar Smart Clinic locations.
2. Target Users & Use Cases
The Nutritionist:
Use Case: Rapidly logs assessment data during or after a patient consultation.
Need: Needs to see if a patient has been there before to avoid typing, needs auto-calculated BMI to save time, and needs to pick tests from organized categories.
The Admin:
Use Case: Onboards new staff and new clinic outlets. Updates the list of available medical tests.
Need: Needs to generate "clean" reports for business analysis and audit the work across multiple locations.
3. Current Journey
Today:
Patient completes a test at a Sahakar Smart Clinic.
Data is shared with the Nutritionist.
Nutritionist opens a Google Form.
Nutritionist types the Contact Number, then manually types Name/Age/Sex (even if they know the patient).
Nutritionist uses a calculator to find the BMI.
Nutritionist scrolls through 60+ unsorted checkboxes to find the 3-4 tests conducted.
Submission goes to a flat Google Sheet.
Admin manually filters the sheet to create a report.
4. Proposed Solution / Elevator Pitch
NAMS (Nutrition Assessment Management System) is a purpose-built clinical ERP for nutritionists. It features a "Smart-Lookup" entry system that auto-fills patient history, an "Auto-Calc" biometric engine, and a "Dynamic Settings" panel for managing an expanding list of outlets and lab tests.
Top 3 MVP Value Props:
Instant Recall: Enter a phone number; get the patient's identity and history immediately.
Clean Export Engine: Generate Excel/PDF reports that only show the tests conducted, not a sea of empty checkboxes.
Dynamic Scaling: Add new outlets and test categories on the fly without touching code.
5. Goals/Measurable Outcomes
Efficiency: Reduce the "Time-to-Entry" for a return patient by 60% via auto-fill.
Accuracy: Eliminate 100% of human error in BMI calculations.
Reporting: Reduce the time to generate a monthly outlet-wise report from 1 hour to 1 click.
6. MVP / Functional Requirements
[P0] User & Outlet Management
User Management: Admin can create, edit, and deactivate Nutritionist accounts.
Dynamic Outlets: Admin can add/edit clinic outlet names (e.g., "Outlet 6 - Calicut"). These appear in the nutritionist's dropdown.
RBAC: Secure login for both roles.
[P1] The Smart Assessment Form
Patient Lookup: Upon entering a 10-digit contact number, the system queries the database. If found, it pre-fills: Name, Age, Sex, Occupation, and Place.
Automated Biometrics:
Inputs: Height (cm), Weight (kg).
Automatic Output: BMI (Height/Weight formula) displayed in real-time.
Categorized Lab Tests:
Admin can group tests (e.g., "Liver Function" contains SGOT, SGPT).
Nutritionist sees an accordion/tabbed view of tests, making the long list easy to navigate.
Date-Time Pickers: Professional selectors for "Result Received" and "Patient Interaction."
[P2] Data Migration & Reporting
Legacy Data Importer: A tool for the Admin to upload the existing Google Sheets data (CSV) to ensure no patient history is lost.
Selective Exporting:
Full Export: Excel file of all records.
Filtered Export: Ability to filter by Outlet, Date Range, or Customer.
Dynamic Columns: The Excel output for "Tests Conducted" should only list the tests that were actually selected for those patients (no empty columns).
7. Design Concepts (Mockups)
Dashboard: A high-level view showing the number of assessments done per outlet this month.
Entry Stepper:
Step 1: Identity (Phone number search).
Step 2: Vitals (Height/Weight -> BMI).
Step 3: Lab Results (Categorized checkboxes).
Step 4: Consultation (Diet plan, Remarks, Need for Diet Plan dropdown).
Admin Settings: Two tables—one for managing "Clinic Outlets" and one for managing "Test Master List" (with Category grouping).
8. Success Metrics (KPIs)
Active Outlets: Successful data logging from all currently active outlets.
Return Patient Rate: Percentage of entries where "Auto-fill" was utilized.
Report Accuracy: Admin confirmation that exported reports require zero manual formatting.
9. Appendix

**Tech Stack:** Next.js 14 (App Router), Prisma ORM, PostgreSQL (Supabase), Tailwind CSS + Shadcn UI.
**Analytics:** Microsoft Clarity — session recordings, heatmaps, and usage analytics to understand how nutritionists interact with the assessment form and dashboard.
**Deployment:** Hosted on Vercel for high availability and easy scaling.
**Data Integrity:** Phone number serves as the Unique Identifier (UID) for patients.
**Migration Note:** The historical data cleaning will involve converting any "N/A", ".", or "not known" values in the Google Sheet into proper Null/Zero values for the database.

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
04/11/2025 | sabah     | 69 | Male | not known | mkp | not known | not known | 9249504531 | ALBUMIN (SERUM), urine albumin, urine creatinine, albumin creatinine ratio | | no need | No    | no need diet plans
05/11/2025 | abdurahman| 68 | Male | not known | mkp | not known | not known | 7034578970 | LFT, RFT, FASTING BLOOD SUGAR, POSTPRANDIAL SUGAR, LIPID, TSH               | | healthy plate | No | completed
```
