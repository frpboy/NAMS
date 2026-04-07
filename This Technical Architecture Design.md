
This Technical Architecture Design (TAD) serves as the blueprint for NAMS. It focuses on scalability (adding more Sahakar Smart Clinic outlets), data integrity (automated calculations), and speed (Next.js performance).
1. System Overview
NAMS is a Full-Stack Web Application using a Monolithic Architecture (Next.js) for simplicity and rapid deployment on Vercel.
Frontend: React (Next.js App Router) for the dashboard and multi-step forms.
Backend: Next.js Server Actions (handling logic without the need for a separate API folder).
Database: PostgreSQL (Relational) to manage complex links between Patients, Assessments, and Outlets.
ORM: Prisma (for type-safe database queries).
2. Data Architecture (Database Schema)
The database is designed to handle Dynamic Outlets and Dynamic Test Catalogs.
Core Models (Prisma Schema)
code
Prisma
// 1. Authenticated Users (Nutritionists and Admins)
model User {
  id        String   @id @default(cuid())
  name      String
  email     String   @unique
  password  String   // Hashed
  role      Role     @default(NUTRITIONIST)
  createdAt DateTime @default(now())
}

enum Role {
  ADMIN
  NUTRITIONIST
}

// 2. Dynamic Outlets (Sahakar Smart Clinic locations)
model Outlet {
  id          String       @id @default(cuid())
  name        String       @unique
  location    String?
  assessments Assessment[]
}

// 3. Dynamic Test Catalog (Admin manages this list)
model MasterTest {
  id        String   @id @default(cuid())
  name      String   @unique
  category  String   // e.g., "Liver Function", "Vitamins"
  isActive  Boolean  @default(true) // Admin can deactivate
}

// 4. Patients (Static Details - Linked by Contact Number)
model Patient {
  id            String       @id @default(cuid())
  contactNumber String       @unique // 10-digit UID
  name          String
  age           Int
  sex           String
  occupation    String?
  place         String
  assessments   Assessment[]
}

// 5. The Assessment Transaction (The core clinical record)
model Assessment {
  id                String   @id @default(cuid())
  date              DateTime @default(now())
  patientId         String
  patient           Patient  @relation(fields: [patientId], references: [id])
  outletId          String
  outlet            Outlet   @relation(fields: [outletId], references: [id])
  
  // Biometrics
  height            Float    // cm
  weight            Float    // kg
  bmi               Float    // Calculated
  
  // Dynamic Selected Tests (Stored as a many-to-many relation or JSON)
  selectedTests     Json     // Simple array of test names for specific report generation
  
  // Clinical Notes
  variationResults  String?  @db.Text
  dietPlanNotes     String?  @db.Text
  remarks           String?  @db.Text
  needsDietPlan     String   // Yes/No/Maybe
  
  resultReceivedAt  DateTime
  interactionAt     DateTime
  createdAt         DateTime @default(now())
}
3. Application Architecture (Structure)
The folder structure follows the Next.js App Router pattern.
code
Bash
/app
  /(auth)            # Login/Sign-up routes
  /(dashboard)       # Main Table, Search, and Filters
    /assessment      # /new (The Stepper Form), /[id] (Details)
  /(admin)           # Restricted to ADMIN role
    /outlets         # Manage Sahakar Smart Clinic locations
    /tests           # Manage the Master Test List & Categories
    /users           # Manage Nutritionist accounts
/components
  /forms             # Reusable Step components (PatientStep, VitalsStep, etc.)
  /ui                # Shadcn UI base components
/lib
  /actions           # Server Actions (db.assessment.create, etc.)
  /validations       # Zod schemas (10-digit phone regex, BMI logic)
  /utils             # Export scripts (ExcelJS logic)
4. Critical Logic Flows
A. The Patient Lookup (Efficiency)
Nutritionist types in Contact Number.
On onChange (after 10 digits), a Server Action searches the Patient table.
If a match is found, the React Hook Form reset() function pre-fills the Name, Age, Sex, etc.
B. The Automated BMI (Accuracy)
Client-side logic monitors height and weight fields.
Formula: BMI = Weight(kg) / (Height(m) * Height(m)).
The BMI field is "Read-only" and updates in real-time as they type.
C. The Export Engine (Reporting)
Admin selects filters (e.g., Outlet: "Manjeri", Date: "March 2026").
The query fetches assessments with a where clause.
The ExcelJS utility maps the selectedTests (JSON array) into a single comma-separated string per row to keep the Excel sheet "clean."
5. Security & RBAC
Authentication: NextAuth.js (Auth.js) using Credentials Provider (Email/Password).
Authorization: Middleware checks the user session.
Nutritionist: Can create and view assessments.
Admin: Can create assessments + manage Outlets, Tests, and Users.
Data Validation: Zod library ensures no "broken" data enters the PostgreSQL database.
6. Deployment & Infrastructure
Hosting: Vercel (Production).
Database: Vercel Postgres or Supabase (PostgreSQL).
CI/CD: Automatic deployment from GitHub (Main branch).
Environment Variables:
DATABASE_URL: Production DB link.
NEXTAUTH_SECRET: Security key.
NEXT_PUBLIC_APP_URL: For link generation.
7. Data Migration Plan (Google Sheets to PostgreSQL)
To bring in your historical data (Sreeraj, Bebi Anitha, etc.):
Format: Export Google Sheets as CSV.
Script: A custom Node.js script will:
Create a Patient record if the phone number doesn't exist.
Create an Assessment record linked to that patient.
Parse the NAMES OF TEST CONDUCTED string (e.g., "t.c, t.g") into the selectedTests JSON array.
