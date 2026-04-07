export type Gender = "MALE" | "FEMALE" | "OTHER";

export interface LabReferenceRange {
  id: string;
  name: string;
  category: string;
  unit: string;
  ranges: {
    min: number;
    max: number;
    gender?: Gender;
  }[];
  isPanel?: boolean; // If true, it's a collection (like CBC) and might not have a single value
}

export const LAB_TESTS: LabReferenceRange[] = [
  // General Health
  {
    id: "hemoglobin",
    name: "Hemoglobin",
    category: "General Health",
    unit: "g/dL",
    ranges: [
      { min: 13.5, max: 17.5, gender: "MALE" },
      { min: 12.0, max: 15.5, gender: "FEMALE" },
      { min: 12.0, max: 17.5, gender: "OTHER" },
    ],
  },
  {
    id: "total_wbc_count",
    name: "Total WBC Count",
    category: "General Health",
    unit: "cells/cu.mm",
    ranges: [{ min: 4000, max: 11000 }],
  },
  {
    id: "platelet_count",
    name: "Platelet Count",
    category: "General Health",
    unit: "Lakhs/cu.mm",
    ranges: [{ min: 1.5, max: 4.5 }],
  },
  // Metabolic / Sugar
  {
    id: "fasting_blood_sugar",
    name: "Fasting Blood Sugar",
    category: "Metabolic",
    unit: "mg/dL",
    ranges: [{ min: 70, max: 100 }],
  },
  {
    id: "pp_blood_sugar",
    name: "Post Prandial Blood Sugar",
    category: "Metabolic",
    unit: "mg/dL",
    ranges: [{ min: 70, max: 140 }],
  },
  {
    id: "hba1c",
    name: "HbA1c",
    category: "Metabolic",
    unit: "%",
    ranges: [{ min: 4.0, max: 5.6 }],
  },
  // Lipid Profile
  {
    id: "total_cholesterol",
    name: "Total Cholesterol",
    category: "Lipid Profile",
    unit: "mg/dL",
    ranges: [{ min: 100, max: 200 }],
  },
  {
    id: "triglycerides",
    name: "Triglycerides",
    category: "Lipid Profile",
    unit: "mg/dL",
    ranges: [{ min: 0, max: 150 }],
  },
  {
    id: "hdl_cholesterol",
    name: "HDL Cholesterol",
    category: "Lipid Profile",
    unit: "mg/dL",
    ranges: [
      { min: 40, max: 60, gender: "MALE" },
      { min: 50, max: 60, gender: "FEMALE" },
      { min: 40, max: 60, gender: "OTHER" },
    ],
  },
  {
    id: "ldl_cholesterol",
    name: "LDL Cholesterol",
    category: "Lipid Profile",
    unit: "mg/dL",
    ranges: [{ min: 0, max: 100 }],
  },
  // Liver Function
  {
    id: "sgot",
    name: "SGOT (AST)",
    category: "Liver Function",
    unit: "U/L",
    ranges: [{ min: 5, max: 40 }],
  },
  {
    id: "sgpt",
    name: "SGPT (ALT)",
    category: "Liver Function",
    unit: "U/L",
    ranges: [{ min: 7, max: 56 }],
  },
  {
    id: "total_bilirubin",
    name: "Total Bilirubin",
    category: "Liver Function",
    unit: "mg/dL",
    ranges: [{ min: 0.1, max: 1.2 }],
  },
  {
    id: "alkaline_phosphatase",
    name: "Alkaline Phosphatase",
    category: "Liver Function",
    unit: "U/L",
    ranges: [{ min: 44, max: 147 }],
  },
  // Kidney Function
  {
    id: "serum_creatinine",
    name: "Serum Creatinine",
    category: "Kidney Function",
    unit: "mg/dL",
    ranges: [
      { min: 0.7, max: 1.3, gender: "MALE" },
      { min: 0.6, max: 1.1, gender: "FEMALE" },
      { min: 0.6, max: 1.3, gender: "OTHER" },
    ],
  },
  {
    id: "blood_urea",
    name: "Blood Urea",
    category: "Kidney Function",
    unit: "mg/dL",
    ranges: [{ min: 15, max: 45 }],
  },
  {
    id: "uric_acid",
    name: "Uric Acid",
    category: "Kidney Function",
    unit: "mg/dL",
    ranges: [
      { min: 3.4, max: 7.0, gender: "MALE" },
      { min: 2.4, max: 6.0, gender: "FEMALE" },
      { min: 2.4, max: 7.0, gender: "OTHER" },
    ],
  },
  // Thyroid
  {
    id: "tsh",
    name: "TSH",
    category: "Thyroid Profile",
    unit: "uIU/mL",
    ranges: [{ min: 0.45, max: 4.5 }],
  },
  {
    id: "free_t3",
    name: "Free T3",
    category: "Thyroid Profile",
    unit: "pg/mL",
    ranges: [{ min: 2.0, max: 4.4 }],
  },
  {
    id: "free_t4",
    name: "Free T4",
    category: "Thyroid Profile",
    unit: "ng/dL",
    ranges: [{ min: 0.8, max: 1.8 }],
  },
  // Vitamins & Minerals
  {
    id: "vitamin_d",
    name: "Vitamin D",
    category: "Vitamins",
    unit: "ng/mL",
    ranges: [{ min: 30, max: 100 }],
  },
  {
    id: "vitamin_b12",
    name: "Vitamin B12",
    category: "Vitamins",
    unit: "pg/mL",
    ranges: [{ min: 200, max: 900 }],
  },
  {
    id: "ferritin",
    name: "Ferrritin",
    category: "Iron Profile",
    unit: "ng/mL",
    ranges: [
      { min: 20, max: 250, gender: "MALE" },
      { min: 10, max: 120, gender: "FEMALE" },
      { min: 10, max: 250, gender: "OTHER" },
    ],
  },
];

export function getReferenceRange(testName: string, gender: Gender = "OTHER") {
  const test = LAB_TESTS.find((t) => t.name.toLowerCase() === testName.toLowerCase());
  if (!test) return null;

  const range = test.ranges.find((r) => !r.gender || r.gender === gender) || test.ranges[0];
  return { ...test, activeRange: range };
}

export type LabStatus = "LOW" | "NORMAL" | "HIGH" | "CRITICAL" | "NONE";

export function getLabStatus(value: number | string, testName: string, gender: Gender = "OTHER"): { 
  status: LabStatus;
  color: string;
  label: string;
} {
  const numValue = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(numValue)) return { status: "NONE", color: "text-slate-400", label: "No Value" };

  const ref = getReferenceRange(testName, gender);
  if (!ref) return { status: "NONE", color: "text-slate-400", label: "No Ref" };

  const { min, max } = ref.activeRange;

  if (numValue < min) return { status: "LOW", color: "text-blue-600", label: "Low" };
  if (numValue > max) return { status: "HIGH", color: "text-red-600", label: "High" };
  return { status: "NORMAL", color: "text-green-600", label: "Normal" };
}
