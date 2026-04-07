1. Technology Stack
Framework: Next.js (App Router)
Language: TypeScript (for data integrity)
Styling: Tailwind CSS + Shadcn UI (for a professional dashboard look)
Database: PostgreSQL (with Prisma ORM) — Best for the relational nature of Outlets and Patient records.
Authentication: NextAuth.js (Auth.js)
Form Handling: React Hook Form + Zod (to handle the long list of medical tests)
Exporting: ExcelJS (for Excel) and jspdf/html2canvas (for PDF reports)
2. Application Architecture
A. User Roles & RBAC
Since you mentioned both Admin and Nutritionist have the same RBAC for now:
Roles: ADMIN, NUTRITIONIST.
Capabilities: Create Assessment, View All Assessments, Filter by Outlet, Export Data, Edit Entries.
B. Database Schema (Entities)
User: Name, Email, Password, Role, Assigned Outlet (optional).
Outlet: ID, Name (The 5 locations), Location details.
Patient: Name, Age, Sex, Occupation, Contact Number, Place.
Assessment:
Linked to Patient and Outlet.
Date of Assessment.
Biometrics (Height, Weight, BMI).
Tests Conducted (Stored as an array or JSON).
Timestamps (Result Received, Interaction Time).
Clinical Notes (Variation in Results, Diet, Remarks).
Status (Needs Diet Plan: Yes/No/Maybe).
3. Implementation Phases
Phase 1: Setup & Auth
Configure Next.js and Database connection.
Implement Login screen.
Create a "Global State" or "Context" to track which Outlet the Nutritionist is currently logged into or working for.
Phase 2: The Assessment Form
Multi-step Form: Because the "Tests Conducted" list is extremely long (as seen in screenshots 3 & 4), we should group the form into sections (Personal Info -> Biometrics -> Lab Tests -> Clinical Notes) so the user doesn't have to scroll too much.
BMI Calculator: Auto-calculate BMI in real-time as Height/Weight are entered.
Phase 3: Dashboard & Review Table
A "Master Table" showing all entries.
Filters: Top-level filters for Outlet, Date Range, and Patient Name.
Sorting: Ability to sort by Date, Age, or BMI.
Phase 4: Export Engine
Button 1: "Export to Excel": Generates a spreadsheet based on the current filtered view.
Button 2: "Download Patient PDF": Generates a clean, branded PDF of a single assessment for the patient.
