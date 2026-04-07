# Nutrition Assessment Form — Field Structure Reference

> **Source:** `nutrtion assessment.pdf` — This is the **Google Form template** used at each Sahakar Smart Clinic outlet. There are currently **5–6 outlets and growing**, and each outlet runs its **own separate copy** of this Google Form (e.g., "MAKKARAPARAMBA - NUTRITION ASSESMENT FORM", "MANJERI - NUTRITION ASSESMENT FORM", etc.). Each form saves responses to its **own separate Google Sheet**.
>
> **Why there is no Outlet column:** Because each outlet has a dedicated form and sheet, the outlet is never written as a field — it is implied by which form the nutritionist opened. During migration, the outlet is determined by which sheet (i.e., which form's export) a row came from. This is why NAMS must have an **Outlet** field that legacy data doesn't contain natively.
>
> **Migration Note:** Every field below must be mapped exactly to the NAMS database. The field order and names match the Google Sheet column headers used in [`NUTRITION ASSESMENT DATA.md`](./NUTRITION%20ASSESMENT%20DATA.md) and the migration mapping in [`Plan/Data Migration.md`](./Plan/Data%20Migration.md).

---

## Form Fields (17 Questions)

| # | Field Name | Required | Type | Notes |
|---|---|---|---|---|
| 1 | `DATE` | Yes | Text (date) | Patient assessment date. Format: `DD/MM/YYYY` or free text like "7 January 2019". Must be parsed to ISO DateTime. |
| 2 | `NAME` | Yes | Text | Patient's full name. Often inconsistent casing; trim whitespace. |
| 3 | `AGE` | Yes | Text (number) | Patient's age in years. Parse as Integer. |
| 4 | `SEX` | Yes | Radio | Options: `Male`, `Female`, `Other` (free text). Normalize to `MALE`/`FEMALE`/`OTHER`. |
| 5 | `OCCUPATION` | No | Text | Patient's occupation. Often blank or "not known" — store as `null`. |
| 6 | `PLACE` | Yes | Text | Patient's place of residence (e.g., "Manjeri", "MKP"). **Not the outlet.** |
| 7 | `HIGHT` | No | Text (number) | Height in cm. Often blank or "not known" — store as `0` or `null`. Note the typo — this is the actual column name in the sheet. |
| 8 | `WEIGHT` | No | Text (number) | Weight in kg. Same handling as HIGHT. |
| 9 | `BMI` | No | Text (number) | Pre-filled BMI from form. Often blank — NAMS **recalculates** this from HIGHT/WEIGHT. |
| 10 | `CONTACT NUMBER` | Yes | Text | 10-digit phone number — serves as the **Patient UID**. Strip spaces/dashes. Often invalid in legacy data (wrong digit count). |
| 11 | `NAMES OF TEST CONDUCTED` | Yes | Checkboxes (multi-select) | 60+ lab tests. Saved as a comma-separated string in the sheet. Split into JSON array for NAMS. See full test list below. |
| 12 | `Result Received` | Yes | Text (datetime) | Date/time the lab results were received. Format: `DD/MM/YYYY, HH.MM a.m./p.m.` |
| 13 | `Patient Interaction` | Yes | Text (datetime) | Date/time of nutritionist–patient interaction. Same format. |
| 14 | `VARIATION IN RESULTS` | Yes | Long text | Free-text clinical notes on abnormal results (e.g., "tg high", "esr elevated"). Often blank in practice. |
| 15 | `DIET` | Yes | Long text | Dietary advice given (e.g., "low fat diet", "dm diet"). |
| 16 | `DO THEY NEED DIET PLAN` | Yes | Radio | Options: `Yes`, `No`, `Maybe`, `Other`. Map directly — add `Maybe` support in NAMS. |
| 17 | `REMARKS` | No | Long text | General remarks (e.g., "completed", "not answering", "call me later"). |

---

## NAMES OF TEST CONDUCTED — Full Checkbox List

These are the **exact test names** as they appear in the Google Form. The migration script must match against these names (case-insensitive) when importing legacy comma-separated test strings.

**Blood Count / General**
`FULL BODY CHECKUP`, `CBC`, `TOTAL COUNT TC`, `NEU (Neutrophil)`, `LYM (Lymphocyte)`, `MONO (Monocyte)`, `EOS (Eosinophil)`, `BASO(Basophil)`, `RBC COUNT`, `HEMOGLOBIN`, `PCV (PACKED CELL VOLUME)`, `PLATELET COUNT`, `ESR`, `BLOOD ROUTINE`

**Liver Function (LFT)**
`LFT`, `BILIRUBIN DIRECT`, `BILIRUBIN`, `BILIRUBIN INDIRECT`, `SGOT/AST`, `SGPT/ALT`, `ALKALINE PHOSPHATASE`, `PROTEIN - TOTAL`, `ALBUMIN (SERUM)`, `GLOBULIN(SERUM)`

**Kidney Function (RFT)**
`RFT`, `UREA (SERUM`, `CREATININE (SERUM`, `URIC ACID(SERUM`, `UREA-URINE`, `CREATININE-URINE`, `URIC ACID-URINE`, `BUN`

**Electrolytes**
`ELECTROLYTES`, `SODIUM`, `POTTASIUM`, `CALCIUM (SERUM)`

**Urine**
`URINE ROUTINE`, `URINE ANALYSIS`, `PROTIEN-URINE`

**Blood Sugar / Diabetes**
`FASTING BLOOD SUGAR`, `POSTPRANDIAL SUGAR`, `RANDOM BLOOD SUGAR`, `GRBS (GLUCOMETER SUGAR)`, `GTT (Glucose Tolerance Test)`, `HBA1C`

**Lipid Profile**
`LIPID`, `LDL`, `HDL`, `VLDL`, `TOTAL CHOLESTROLE`, `TRYGLYCERIDES`

**Thyroid**
`TFT (THYROID FUNCTION TEST)`, `TSH`, `T4`, `THYROGLOBULIN`, `THYROID PROFILE 1`

**Infectious Disease / Serology**
`HIV 1&2 ANTIBODIES ECLIA`, `HBsAg`, `VDRL`, `HCV`, `WIDAL (SLIDE TEST)`, `DENGUE`, `BETA HCG`

**Inflammatory / Immune**
`CRP`, `RA FACTOR`, `ANA`, `ASA (ANTI-STREPTOLYSIN O)`, `TISSUE TRANSGLUTAMINASE -IgA`, `TISSUE TRANSGLUTAMINASE -IgG`

**Hormones**
`TESTOSTERON-TOTAL`

**Vitamins & Minerals**
`VITAMIN D`, `VITAMIN B12`, `IRON STUDIES (SERUM)`, `VITAMIN-A`, `VITAMIN B COMPLEX PROFILE(B1,B2,B3,B5,B6,B7,B9)`

**Coagulation / Other**
`PROTHROMBIN TIME (PT)`, `D-DIMER`, `TROPONIN I`

**Free-text option:** `Other` (nutritionist types a custom test name)
