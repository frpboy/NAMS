"use server";

import type { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { assessmentSchema } from "@/lib/validations";
import { calculateBMI } from "@/lib/utils/bmi-calculator";
import { createLog } from "./audit";

type AssessmentWithRelations = Prisma.AssessmentGetPayload<{
  include: {
    patient: {
      include: {
        assessments: {
          orderBy: {
            date: "desc";
          };
          include: {
            outlet: {
              select: {
                name: true;
              };
            };
          };
        };
      };
    };
    outlet: true;
    dietPlan: true;
  };
}>;

type AssessmentListItem = Prisma.AssessmentGetPayload<{
  include: {
    patient: {
      select: {
        name: true;
        contactNumber: true;
        age: true;
        sex: true;
        place: true;
      };
    };
    outlet: {
      select: {
        name: true;
      };
    };
  };
}>;

export async function createAssessment(data: {
  patientId: string;
  outletId: string;
  dietPlanId?: string | null;
  height?: number | null;
  weight?: number | null;
  selectedTests: { name: string; value?: string }[];
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

  const bmi = (data.height && data.weight) ? calculateBMI(data.height, data.weight) : null;

  const assessment = await db.assessment.create({
    data: {
      ...result.data,
      bmi,
      selectedTests: data.selectedTests as any, // Cast to any for Prisma JSON field
    },
  });

  await createLog({
    action: "CREATE_ASSESSMENT",
    entity: "Assessment",
    entityId: assessment.id,
    details: `Created assessment for patient ${data.patientId}`,
  });

  revalidatePath("/");
  revalidatePath("/dashboard");
  return { success: true, assessmentId: assessment.id };
}

export async function updateAssessment(
  id: string,
  data: Partial<{
    outletId: string;
    dietPlanId?: string | null;
    height?: number | null;
    weight?: number | null;
    selectedTests: { name: string; value?: string }[];
    needsDietPlan: string;
    variationResults?: string;
    dietPlanNotes?: string;
    remarks?: string;
    resultReceivedAt: Date;
    interactionAt: Date;
  }>
) {
  const bmi =
    (data.height && data.weight)
      ? calculateBMI(data.height, data.weight)
      : (data.height === null || data.weight === null) ? null : undefined;

  await db.assessment.update({
    where: { id },
    data: {
      ...data,
      ...(bmi !== undefined && { bmi }),
      selectedTests: data.selectedTests as any,
    },
  });

  await createLog({
    action: "UPDATE_ASSESSMENT",
    entity: "Assessment",
    entityId: id,
    details: `Updated assessment details`,
  });

  revalidatePath("/");
  revalidatePath("/dashboard");
  revalidatePath(`/assessment/${id}`);
  return { success: true };
}

export async function deleteAssessment(id: string) {
  await db.assessment.delete({ where: { id } });
  
  await createLog({
    action: "DELETE_ASSESSMENT",
    entity: "Assessment",
    entityId: id,
  });

  revalidatePath("/");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function getAssessment(
  id: string
): Promise<AssessmentWithRelations | null> {
  const assessment = await db.assessment.findUnique({
    where: { id },
    include: {
      patient: {
        include: {
          assessments: {
            orderBy: { date: "desc" },
            include: { outlet: { select: { name: true } } }
          }
        }
      },
      outlet: true,
      dietPlan: true,
    },
  });

  return assessment as unknown as AssessmentWithRelations | null;
}

export async function getAssessments(filters?: {
  outletId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  patientName?: string;
  take?: number;
}): Promise<AssessmentListItem[]> {
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

  const assessments = await db.assessment.findMany({
    where,
    include: {
      patient: { select: { name: true, contactNumber: true, age: true, sex: true, place: true } },
      outlet: { select: { name: true } },
    },
    orderBy: { date: "desc" },
    take: filters?.take ?? 20,
  });

  return assessments as unknown as AssessmentListItem[];
}
