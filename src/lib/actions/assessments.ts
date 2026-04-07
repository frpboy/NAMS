"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { assessmentSchema } from "@/lib/validations";
import { calculateBMI } from "@/lib/utils/bmi-calculator";

export async function createAssessment(data: {
  patientId: string;
  outletId: string;
  height: number;
  weight: number;
  selectedTests: string[];
  needsDietPlan: string;
  variationResults?: string;
  dietPlanNotes?: string;
  remarks?: string;
  resultReceivedAt: Date;
  interactionAt: Date;
}) {
  const result = assessmentSchema.safeParse(data);
  if (!result.success) {
    return { error: result.error.errors[0].message };
  }

  const bmi = calculateBMI(data.height, data.weight);

  const assessment = await db.assessment.create({
    data: {
      ...result.data,
      bmi,
      selectedTests: data.selectedTests,
    },
  });

  revalidatePath("/");
  revalidatePath("/dashboard");
  return { success: true, assessmentId: assessment.id };
}

export async function updateAssessment(
  id: string,
  data: Partial<{
    outletId: string;
    height: number;
    weight: number;
    selectedTests: string[];
    needsDietPlan: string;
    variationResults?: string;
    dietPlanNotes?: string;
    remarks?: string;
    resultReceivedAt: Date;
    interactionAt: Date;
  }>
) {
  const bmi =
    data.height && data.weight
      ? calculateBMI(data.height, data.weight)
      : undefined;

  await db.assessment.update({
    where: { id },
    data: {
      ...data,
      ...(bmi !== undefined && { bmi }),
    },
  });

  revalidatePath("/");
  revalidatePath("/dashboard");
  revalidatePath(`/assessment/${id}`);
  return { success: true };
}

export async function deleteAssessment(id: string) {
  await db.assessment.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function getAssessment(id: string) {
  return db.assessment.findUnique({
    where: { id },
    include: {
      patient: true,
      outlet: true,
    },
  });
}

export async function getAssessments(filters?: {
  outletId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  patientName?: string;
}) {
  const where: Record<string, unknown> = {};

  if (filters?.outletId) {
    where.outletId = filters.outletId;
  }
  if (filters?.dateFrom || filters?.dateTo) {
    where.date = {};
    if (filters.dateFrom) (where.date as Record<string, unknown>).gte = filters.dateFrom;
    if (filters.dateTo) (where.date as Record<string, unknown>).lte = filters.dateTo;
  }
  if (filters?.patientName) {
    where.patient = {
      name: { contains: filters.patientName, mode: "insensitive" },
    };
  }

  return db.assessment.findMany({
    where,
    include: {
      patient: { select: { name: true, contactNumber: true, age: true, sex: true } },
      outlet: { select: { name: true } },
    },
    orderBy: { date: "desc" },
  });
}
