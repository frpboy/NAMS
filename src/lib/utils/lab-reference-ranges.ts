export type Gender = "MALE" | "FEMALE" | "OTHER";

export interface LabReferenceRange {
  id: string;
  name: string;
  category: string;
  unit: string;
  description: string;
  lowImplication: string;
  highImplication: string;
  lowAdvice: string;
  highAdvice: string;
  procedure: string;
  ranges: {
    min: number;
    max: number;
    gender?: Gender;
  }[];
  isPanel?: boolean;
}

export const LAB_TESTS: LabReferenceRange[] = [
  // General Health
  {
    id: "hemoglobin",
    name: "Hemoglobin",
    category: "General Health",
    unit: "g/dL",
    description: "Hemoglobin is a protein in red blood cells that carries oxygen. It's a key indicator of overall blood health and oxygen-carrying capacity.",
    lowImplication: "Low levels (Anemia) mean your body isn't getting enough oxygen, leading to fatigue, dizziness, and pale skin.",
    highImplication: "High levels can indicate dehydration, smoking, lung disease, or a bone marrow disorder.",
    lowAdvice: "Eat iron-rich foods (lean meats, spinach, lentils). Pair with Vitamin C (lemons, oranges) to boost absorption.",
    highAdvice: "Stay hydrated and avoid smoking. Consult a doctor to rule out underlying respiratory or bone marrow issues.",
    procedure: "A small sample of blood is drawn from a vein in your arm.",
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
    description: "White blood cells (leukocytes) are the body's primary defense system against infections and foreign substances.",
    lowImplication: "Leukopenia means your immune system is compromised, making you more susceptible to infections.",
    highImplication: "Leukocytosis usually signals an active infection, inflammation, stress, or an immune response.",
    lowAdvice: "Eat a protein-rich diet and ensure adequate rest. Practice good hygiene to avoid infections while levels are low.",
    highAdvice: "Identify the source of infection or stress. Anti-inflammatory foods (turmeric, berries) may help reduce general inflammation.",
    procedure: "Standard venous blood sample collection.",
    ranges: [{ min: 4000, max: 11000 }],
  },
  {
    id: "platelet_count",
    name: "Platelet Count",
    category: "General Health",
    unit: "Lakhs/cu.mm",
    description: "Platelets (thrombocytes) are essential for blood clotting. They aggregate at injury sites to stop bleeding.",
    lowImplication: "Thrombocytopenia increases the risk of internal bleeding and excessive bruising even from minor impacts.",
    highImplication: "Thrombocytosis can cause spontaneous blood clots (thrombosis), which may block blood flow to vital organs.",
    lowAdvice: "Include folate-rich foods and Vitamin B12. Avoid activities with high injury risk.",
    highAdvice: "Increase water intake and consult a hematologist to check for bone marrow or inflammatory conditions.",
    procedure: "Standard venous blood draw.",
    ranges: [{ min: 1.5, max: 4.5 }],
  },
  // Metabolic / Sugar
  {
    id: "fasting_blood_sugar",
    name: "Fasting Blood Sugar",
    category: "Metabolic / Sugar",
    unit: "mg/dL",
    description: "Measures blood glucose after 8-12 hours of fasting. It's the primary screen for diabetes and insulin resistance.",
    lowImplication: "Hypoglycemia can cause sudden hunger, sweating, heart palpitations, and confusion.",
    highImplication: "Hyperglycemia indicates Prediabetes (100-125) or Diabetes (126+). It damages blood vessels over time.",
    lowAdvice: "Eat regular, balanced meals. Always carry a small snack if you are prone to low sugar.",
    highAdvice: "Switch to whole grains (oats, brown rice), eliminate sugary drinks, and increase daily walking/exercise.",
    procedure: "Blood sample taken in the morning before eating anything.",
    ranges: [{ min: 70, max: 100 }],
  },
  {
    id: "hba1c",
    name: "HbA1c",
    category: "Metabolic / Sugar",
    unit: "%",
    description: "The '3-month average' sugar test. It measures the percentage of hemoglobin coated with sugar.",
    lowImplication: "Very low levels are rare but can occur in certain blood disorders or chronic liver disease.",
    highImplication: "High levels (6.5%+) indicate poorly managed diabetes and high risk of kidney or eye complications.",
    lowAdvice: "Discuss with a doctor if you have symptoms of chronic fatigue or anemia.",
    highAdvice: "Consistent low-carb diet, portion control, and regular HbA1c monitoring every 3 months.",
    procedure: "Venous blood draw; does not require fasting.",
    ranges: [{ min: 4.0, max: 5.6 }],
  },
  // Lipid Profile
  {
    id: "total_cholesterol",
    name: "Total Cholesterol",
    category: "Organ Function",
    unit: "mg/dL",
    description: "A measurement of all types of cholesterol in the blood. While essential for cells, too much is harmful.",
    lowImplication: "Abnormally low levels may be linked to malnutrition, malabsorption, or hyperthyroidism.",
    highImplication: "Hypercholesterolemia leads to plaque buildup in arteries, increasing the risk of heart attacks.",
    lowAdvice: "Ensure a nutrient-dense diet with healthy fats (nuts, seeds, eggs).",
    highAdvice: "Reduce saturated fats (butter, fatty meats) and fried foods. Increase soluble fiber (beans, apples).",
    procedure: "Fasting blood sample (9-12 hours fasting).",
    ranges: [{ min: 100, max: 200 }],
  },
  {
    id: "triglycerides",
    name: "Triglycerides",
    category: "Organ Function",
    unit: "mg/dL",
    description: "Unused calories are stored as triglycerides. High levels often reflect high sugar/alcohol intake.",
    lowImplication: "Rare; may indicate a very low-fat diet or malabsorption issues.",
    highImplication: "Extremely high levels (500+) can cause acute pancreatitis (inflammation of the pancreas).",
    lowAdvice: "Ensure you are consuming enough healthy calories for your energy needs.",
    highAdvice: "Strictly avoid alcohol and refined sugars. Include Omega-3 (fish oil, walnuts) in your diet.",
    procedure: "Fasting blood sample required.",
    ranges: [{ min: 0, max: 150 }],
  },
  {
    id: "hdl_cholesterol",
    name: "HDL Cholesterol",
    category: "Organ Function",
    unit: "mg/dL",
    description: "The 'Good' cholesterol. It picks up excess cholesterol and takes it back to the liver for disposal.",
    lowImplication: "Low HDL (<40) increases your cardiovascular risk even if your total cholesterol is normal.",
    highImplication: "High HDL is protective. It effectively 'cleans' your arteries.",
    lowAdvice: "Exercise regularly (aerobic) and include olive oil, fatty fish, and avocados in your diet.",
    highAdvice: "Maintain your healthy lifestyle; high levels are generally a sign of good heart health.",
    procedure: "Standard lipid profile blood draw.",
    ranges: [
      { min: 40, max: 60, gender: "MALE" },
      { min: 50, max: 60, gender: "FEMALE" },
      { min: 40, max: 60, gender: "OTHER" },
    ],
  },
  // Liver & Kidney
  {
    id: "serum_creatinine",
    name: "Creatinine",
    category: "Organ Function",
    unit: "mg/dL",
    description: "A waste product from muscle metabolism. It's the most reliable marker for kidney filtration capacity.",
    lowImplication: "Can indicate low muscle mass (common in elderly or those with muscle-wasting diseases).",
    highImplication: "Signals that the kidneys aren't filtering waste properly. May indicate kidney disease or severe dehydration.",
    lowAdvice: "Increase protein intake and resistance training to build muscle mass.",
    highAdvice: "Control blood pressure, stay hydrated, and limit high-protein diets if kidney damage is confirmed.",
    procedure: "Standard blood draw.",
    ranges: [
      { min: 0.7, max: 1.3, gender: "MALE" },
      { min: 0.6, max: 1.1, gender: "FEMALE" },
      { min: 0.6, max: 1.3, gender: "OTHER" },
    ],
  },
  {
    id: "sgpt",
    name: "SGPT",
    category: "Organ Function",
    unit: "U/L",
    description: "Also called ALT. This enzyme is mostly found in the liver. It's a specific indicator of liver cell damage.",
    lowImplication: "Low levels are normal and usually indicate a healthy liver.",
    highImplication: "Indicates liver inflammation or damage (fatty liver, hepatitis, or alcohol-related damage).",
    lowAdvice: "Continue maintaining a healthy lifestyle.",
    highAdvice: "Reduce alcohol, lose weight if overweight, and avoid unnecessary medications/supplements that stress the liver.",
    procedure: "Standard blood draw.",
    ranges: [{ min: 7, max: 56 }],
  },
  // Thyroid
  {
    id: "tsh",
    name: "TSH",
    category: "Organ Function",
    unit: "uIU/mL",
    description: "Thyroid Stimulating Hormone. It tells your thyroid how much hormone to produce.",
    lowImplication: "Hyperthyroidism (Overactive thyroid). Your metabolism may be too fast.",
    highImplication: "Hypothyroidism (Underactive thyroid). Your metabolism is likely slow.",
    lowAdvice: "Avoid excess iodine. Consult an endocrinologist for thyroid-regulating medication.",
    highAdvice: "Include selenium and zinc-rich foods. Medical thyroid hormone replacement is often necessary.",
    procedure: "Standard blood draw.",
    ranges: [{ min: 0.45, max: 4.5 }],
  },
  // Vitamins
  {
    id: "vitamin_d",
    name: "Vitamin D",
    category: "Vitamins & Minerals",
    unit: "ng/mL",
    description: "The 'Sunshine Vitamin'. Essential for calcium absorption, bone strength, and immune regulation.",
    lowImplication: "Increases risk of bone fractures, frequent infections, and mood disorders like depression.",
    highImplication: "Excessive levels (Toxicity) can cause dangerously high calcium levels, leading to kidney stones.",
    lowAdvice: "Safe sun exposure (15 mins), fatty fish, egg yolks, and Vitamin D3 supplements.",
    highAdvice: "Immediately stop high-dose supplements and monitor calcium levels.",
    procedure: "Standard blood draw.",
    ranges: [{ min: 30, max: 100 }],
  },
  {
    id: "vitamin_b12",
    name: "Vitamin B12",
    category: "Vitamins & Minerals",
    unit: "pg/mL",
    description: "Required for proper red blood cell formation, neurological function, and DNA synthesis.",
    lowImplication: "Causes nerve damage (tingling), memory loss, and a specific type of anemia.",
    highImplication: "Rarely toxic; high levels may be incidental or linked to liver/blood conditions.",
    lowAdvice: "Include dairy, meat, or B12 supplements. Essential for vegetarians and vegans.",
    highAdvice: "Stop excessive supplement use. Consult a doctor if levels are high without supplementation.",
    procedure: "Standard blood draw.",
    ranges: [{ min: 200, max: 900 }],
  },
  {
    id: "ferritin",
    name: "Ferritin",
    category: "Vitamins & Minerals",
    unit: "ng/mL",
    description: "A protein that stores iron. It's the best marker for your body's total iron 'savings account'.",
    lowImplication: "Iron deficiency (even if hemoglobin is normal). You're running out of iron stores.",
    highImplication: "Iron overload or chronic inflammation. Can damage the liver and heart over time.",
    lowAdvice: "Focus on iron-rich foods and avoid tea/coffee with meals as they block absorption.",
    highAdvice: "Limit red meat and iron-fortified foods. Regular blood donation may be recommended by a doctor.",
    procedure: "Standard blood draw.",
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
