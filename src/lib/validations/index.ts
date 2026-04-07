import { z } from "zod";

// ─── Patient Validation ──────────────────────────────────────────

export const patientSchema = z.object({
  contactNumber: z.string().length(10, "Contact number must be exactly 10 digits"),
  name: z.string().min(1, "Name is required").trim(),
  age: z.coerce.number().int().min(1, "Age must be at least 1").max(120, "Age must be 120 or less"),
  sex: z.enum(["MALE", "FEMALE", "OTHER"]),
  occupation: z.string().optional().nullable(),
  place: z.string().min(1, "Place is required").trim(),
});

// ─── Assessment Validation ───────────────────────────────────────

const testResultSchema = z.union([
  z.string(),
  z.object({ name: z.string(), value: z.string().optional() }),
]);

export const assessmentSchema = z.object({
  patientId: z.string().cuid(),
  outletId: z.string().cuid("Please select an outlet"),
  height: z.coerce
    .number()
    .min(1, "Height is required")
    .max(300, "Height must be 300 cm or less"),
  weight: z.coerce
    .number()
    .min(1, "Weight is required")
    .max(500, "Weight must be 500 kg or less"),
  selectedTests: z.array(testResultSchema).min(1, "Select at least one test"),
  needsDietPlan: z.enum(["Yes", "No", "Maybe"]),
  variationResults: z.string().optional().nullable(),
  dietPlanNotes: z.string().optional().nullable(),
  remarks: z.string().optional().nullable(),
  resultReceivedAt: z.coerce.date(),
  interactionAt: z.coerce.date(),
});

// ─── Patient Lookup ──────────────────────────────────────────────

export const patientLookupSchema = z.object({
  contactNumber: z.string().length(10, "Enter a valid 10-digit phone number"),
});

// ─── Outlet Validation ───────────────────────────────────────────

export const outletSchema = z.object({
  name: z.string().min(1, "Outlet name is required").trim(),
  location: z.string().optional().nullable(),
});

// ─── Master Test Validation ──────────────────────────────────────

export const masterTestSchema = z.object({
  name: z.string().min(1, "Test name is required").trim(),
  category: z.string().min(1, "Category is required").trim(),
  isActive: z.boolean().default(true),
});

// ─── User Validation ─────────────────────────────────────────────

export const userSchema = z.object({
  name: z.string().min(1, "Name is required").trim(),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["ADMIN", "NUTRITIONIST"]),
});

// ─── Export Filters ──────────────────────────────────────────────

export const exportFilterSchema = z.object({
  outletId: z.string().optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  patientName: z.string().optional().nullable(),
});
