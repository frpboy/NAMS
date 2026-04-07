
For NAMS, the QA phase ensures that clinical data is 100% accurate and the system is easy for nutritionists to use in a fast-paced clinic environment. Since you are dealing with medical data (BMI, blood sugar, etc.), there is zero room for calculation errors.
Here is the 5-step Testing & QA plan for NAMS.
1. Functional Logic Testing (The "Calculator" Check)
We must verify that the automated clinical logic works exactly as intended.
BMI Accuracy: Test multiple Height/Weight combinations (e.g., 170cm/70kg = 24.22) against a manual calculator.
Validation Rules:
Ensure the "Contact Number" field rejects 9-digit or 11-digit numbers.
Ensure the form cannot be submitted if "Outlet" or "Date" is missing.
Dynamic Test List: Verify that if the Admin adds "Vitamin K" in settings, it immediately appears in Step 3 of the assessment form.
2. Integration Testing (The "Lookup" Check)
This ensures the app talks to the database correctly.
Search Performance: Type a contact number from the old data (e.g., 9633435228 for Deepa).
Pass Criteria: All details (Name, Age, Sex, Place) must auto-fill within 1 second.
History Link: After saving a new assessment for an existing patient, verify that the dashboard shows two entries for that patient (the old migrated record and the new one).
3. Data Integrity & Migration QA
We must audit the "Bridge" we built in the previous step.
Legacy Audit: Randomly pick 5 patients from the PDF/Google Sheet (e.g., "Umesh Kumar", page 1).
Check: Does NAMS show his exact tests (cbc, esr), result (esr high), and date (03/03/2026)?
Selective Export Test: Generate an Excel report for one outlet.
Check: If a patient only had "HBA1C" done, does the Excel "Tests" column show only "HBA1C" or is it a mess of empty cells? (It must be clean).
4. Cross-Device & Performance Testing
Nutritionists at Sahakar Smart Clinics might use different devices.
Tablet/Mobile Check: The "Categorized Accordions" for lab tests must be easy to tap with a finger. The table must scroll horizontally on small screens.
Long-Form Speed: With 60+ tests available, the form must not "lag" when checking boxes. We use Debounced Inputs to ensure smooth typing.
Vercel Deployment Check: Ensure the SSL certificate is active (HTTPS) and the database responds quickly from the India region.
5. User Acceptance Testing (UAT)
This is where the Nutritionist and Admin give the final "Green Light."
The "Clinic Speed" Test: Have a nutritionist log a mock assessment.
Goal: Can they finish a full entry in under 3 minutes?
Admin Report Audit: Have the Admin generate a full export for all 5 outlets.
Goal: Does the data look ready for a business meeting without any manual cleaning?
6. Edge Case "Stress" Testing
We push the system to see where it might break:
Double Submission: What happens if the nutritionist clicks "Submit" three times quickly? (Solution: Disable the button after the first click).
Missing Biometrics: If height/weight are unknown, does the BMI show "0" or does the app crash? (Solution: It should show "N/A" gracefully).
Deleted Tests: If the Admin deactivates "Vitamin D," do the old records for "Sreeraj" still show that he had Vitamin D tested? (Solution: Yes, old data must remain frozen).
Summary of QA Tools for NAMS:
Jest/Vitest: For testing the BMI formula automatically.
Playwright: To simulate a nutritionist clicking through the 4-step form.
Prisma Studio: To visually inspect the data rows after migration.
