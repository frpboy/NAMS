import { z } from "zod";

// ─── Patient Validation ──────────────────────────────────────────

export const patientSchema = z.object({
  contactNumber: z.string().length(10, "Contact number must be exactly 10 digits"),
  name: z.string().min(1, "Name is required").trim(),
  age: z.coerce.number().int().min(1).max(150),
  sex: z.enum(["MALE", "FEMALE", "OTHER"]),
  occupation: z.string().optional().nullable(),
  place: z.string().min(1, "Place is required").trim(),
});

// ─── Assessment Validation ───────────────────────────────────────

export const assessmentSchema = z.object({
  patientId: z.string().cuid(),
  outletId: z.string().cuid("Outlet is required"),
  height: z.coerce.number().min(0).max(300),
  weight: z.coerce.number().min(0).max(500),
  selectedTests: z.array(z.string()).min(1, "At least one test must be selected"),
  needsDietPlan: z.enum(["Yes", "No", "Maybe"]),
  variationResults: z.string().optional().nullable(),
  dietPlanNotes: z.string().optional().nullable(),
  remarks: z.string().optional().nullable(),
  resultReceivedAt: z.coerce.date(),
  interactionAt: z.coerce.date(),
});

// ─── Patient Lookup (Phone Search) ───────────────────────────────

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
