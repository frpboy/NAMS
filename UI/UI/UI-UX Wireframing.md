This high-fidelity wireframe design for NAMS focuses on reducing "Form Fatigue." Instead of one long scrolling page, we use a Progressive Disclosure pattern (a Stepper) to help the Nutritionist focus on one data category at a time.
1. The Global Navigation & Dashboard
The "Command Center" where the Nutritionist starts their day and the Admin monitors all 5+ outlets.
Top Bar:
Left: NAMS Logo.
Center: Global Search (Search by Patient Name or Phone).
Right: Outlet Switcher (Dropdown to select current working outlet) + Profile/Logout.
Metric Cards (Top):
Total Assessments (Today) | Patients Waiting | Diet Plans Needed
Main Content Area:
Filter Bar: [ Date Range ] [ Outlet Selection ] [ BMI Category ] [ Export to Excel Button ].
The Table: High-density Shadcn UI Table.
Columns: Date, Patient Name, Contact, Outlet, BMI (with color badges: Green for Normal, Red for High), Status (Complete/Draft), Action (View/Edit).
2. The "New Assessment" Stepper (The Core UI)
A 4-step wizard that handles the long Google Form data efficiently.
Step 1: Patient Identity & Context
Card Header: "Step 1: Who is the Patient?"
UI Components:
Contact Number (Input): Large input. Behavior: As soon as 10 digits are typed, a "Searching..." spinner appears. If found, a success badge says "Returning Patient" and auto-fills fields below.
Name, Age, Sex (Radio Group), Occupation, Place.
Outlet (Dropdown): Defaults to the nutritionist's current outlet.
Step 2: Biometrics (The Auto-Calc Zone)
Card Header: "Step 2: Vitals & Measurements"
UI Components:
Two-column layout:
Left: Height (cm) and Weight (kg) inputs.
Right: A large, read-only BMI Display Box.
Dynamic Logic: If BMI > 25, the box turns Amber; if > 30, it turns Red. A small text label appears: "Category: Overweight" or "Category: Obese".
Step 3: Lab Test Results (The Organized List)
Card Header: "Step 3: Medical Tests Conducted"
UI Pattern: Categorized Accordions (to avoid the 60-item scroll).
[+] General Health (CBC, ESR, HB, RBC...)
[+] Metabolic/Sugar (FBS, PPBS, HBA1C, GTT...)
[+] Organ Function (LFT, RFT, Lipid Profile, UREA...)
[+] Vitamins & Minerals (Vit D, Vit B12, Iron, Calcium...)
Behavior: The Nutritionist simply clicks the category to expand and check the relevant boxes.
Step 4: Clinical Summary & Interaction
Card Header: "Step 4: Diet Plan & Remarks"
UI Components:
Result Received At (Date Picker) & Patient Interaction At (Date Picker).
Variation in Results (Textarea): "Describe any abnormalities."
Dietary Advice (Textarea): "Recommended food changes."
Needs Diet Plan? (Segmented Control): [ YES ] [ NO ] [ MAYBE ].
Action Bar: [ Save as Draft ] [ Submit Assessment ].
3. Admin: Master Test Management
A clean interface to scale the system without developer help.
Table View: Shows all tests.
Columns: Test Name, Category, Status (Active/Inactive).
Action: [ + Add New Test ] button.
Modal: "Add Test" -> Name: Vitamin K, Category: Vitamins, Status: Active.
Immediate Effect: This test now appears in Step 3 for all nutritionists across all outlets.
4. Color Palette & Accessibility (Health-Focused)
Primary: #0D9488 (Teal 600) — Represents health and professional medical care.
Secondary: #F1F5F9 (Slate 100) — Background for a clean, non-cluttered look.
Status Badges:
Normal BMI: Green text/bg.
High BMI/Sugar: Red text/bg.
Returning Patient: Blue badge.
Typography: Inter (Sans-serif) for high readability of clinical numbers.
5. Interaction Patterns
Skeleton Screens: While the dashboard or patient lookup is loading, show grey shimmer "Skeleton" rows to make the app feel faster.
Toast Notifications: "Assessment for Sreeraj saved successfully!" (Bottom right pop-up).
Confirmation Modals: "Are you sure you want to delete this assessment? This cannot be undone."
