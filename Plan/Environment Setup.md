To set up the NAMS (Nutrition Assessment Management System) environment correctly for a Next.js 14+ project, follow these technical steps. This setup ensures that your development, staging, and production (Vercel) environments are identical.
1. Local Development Requirements
Before running commands, ensure your machine has:
Node.js: v18.17 or later (LTS recommended).
Git: For version control and Vercel deployment.
Database Viewer: Prisma Studio (built-in) or DBeaver to see your patient data clearly.
2. Project Initialization
Open your terminal and run the following command to create the Next.js foundation:
code
Bash
npx create-next-app@latest nams
Select these options during setup:
TypeScript: Yes
ESLint: Yes
Tailwind CSS: Yes
src/ directory: Yes
App Router: Yes
Import alias (@/*): Yes
3. Install Core Dependencies
Navigate into your folder (cd nams) and install the specific libraries required for NAMS:
A. Database & Auth
code
Bash
npm install prisma @prisma/client next-auth@beta lucide-react
B. Form Handling & Validation (Crucial for the 60+ Tests)
code
Bash
npm install react-hook-form zod @hookform/resolvers
C. UI Components (Shadcn UI)
Initialize the UI library that gives NAMS its professional clinical look:
code
Bash
npx shadcn-ui@latest init
# Select "Slate" or "Stone" for a clean medical feel.
Now install the specific parts we need for the Assessment Form:
code
Bash
npx shadcn-ui@latest add table button input checkbox card dialog tabs accordion
D. Export & Utility
code
Bash
npm install exceljs jspdf html2canvas date-fns
4. Database Provisioning (Supabase PostgreSQL)
The database for NAMS will be hosted on **Supabase**.
Action: Create a Supabase project and grab your Connection Strings from Settings → Database.
  - **Connection String (Transaction mode)**: Use for `DATABASE_URL` (uses Supavisor pooling)
  - **Connection String (Session mode / Direct)**: Use for `DIRECT_URL` (needed for Prisma migrations)
5. Environment Variables (.env)
Create a .env file in your root folder. This file stores your "secrets" and prevents them from being leaked on GitHub.
code
Env
# Database Connection (from Supabase)
# Transaction mode (Supavisor pooler) - for runtime
DATABASE_URL="postgres://user:password@aws-0-region.pooler.supabase.com:6543/postgres?pgbouncer=true"
# Direct connection (session mode) - for Prisma migrations
DIRECT_URL="postgres://user:password@aws-0-region.supabase.co:5432/postgres"

# Authentication (Generate a secret with: openssl rand -base64 32)
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Supabase (Optional - for future Supabase client features)
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_ANON_KEY="your-anon-key"

# Sahakar Smart Clinic Integration (Optional Future Proofing)
SAHAKAR_API_KEY="your-api-key"
6. Prisma Initialization (The Schema)
Initialize Prisma to connect your code to your Supabase PostgreSQL database:
code
Bash
npx prisma init
Important: When running migrations (`npx prisma migrate dev`), use the `DIRECT_URL` environment variable.
The `DATABASE_URL` (transaction mode with Supavisor pooling) is used at runtime.
Next step: Copy the Prisma Schema code I provided in the Technical Architecture section into your prisma/schema.prisma file.
7. Version Control & Deployment Setup
GitHub: Create a private repository named nams-web.
Push Code:
code
Bash
git add .
git commit -m "Initial NAMS setup with Shadcn and Prisma"
git remote add origin <your-github-url>
git push -u origin main
Vercel:
Go to Vercel.com and click "Add New Project."
Import your nams-web repository.
Add your .env variables into the Vercel Project Settings.
Click Deploy.
8. Pro-Tip: Data Migration Environment
Since you are moving data from Google Sheets, create a folder called scripts/ in your root.
Place your CSV export of the current data there.
Later, we will create a migrate.ts file here to "bulk upload" Sreeraj, Bebi Anitha, and others into your new NAMS system.
