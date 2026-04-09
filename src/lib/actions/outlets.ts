"use server";

import type { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { outletSchema } from "@/lib/validations";

type OutletWithAssessmentCount = Prisma.OutletGetPayload<{
  include: {
    _count: {
      select: {
        assessments: true;
      };
    };
  };
}>;

export async function getOutlets(): Promise<OutletWithAssessmentCount[]> {
  const outlets = await db.outlet.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { assessments: true } } },
  });

  return outlets as unknown as OutletWithAssessmentCount[];
}

export async function getOutletsPage(page: number, pageSize: number): Promise<{ outlets: OutletWithAssessmentCount[]; total: number }> {
  const [outlets, total] = await Promise.all([
    db.outlet.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { assessments: true } } },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.outlet.count(),
  ]);

  return { outlets: outlets as unknown as OutletWithAssessmentCount[], total };
}

export async function createOutlet(data: { name: string; location?: string }) {
  const result = outletSchema.safeParse(data);
  if (!result.success) {
    return { error: result.error.errors[0].message };
  }
  await db.outlet.create({ data: result.data });
  revalidatePath("/admin/outlets");
  return { success: true };
}

export async function updateOutlet(
  id: string,
  data: { name: string; location?: string }
) {
  const result = outletSchema.safeParse(data);
  if (!result.success) {
    return { error: result.error.errors[0].message };
  }
  await db.outlet.update({ where: { id }, data: result.data });
  revalidatePath("/admin/outlets");
  return { success: true };
}

export async function deleteOutlet(id: string) {
  const count = await db.assessment.count({ where: { outletId: id } });
  if (count > 0) {
    return { error: `Cannot delete — ${count} assessment(s) linked to this outlet` };
  }
  await db.outlet.delete({ where: { id } });
  revalidatePath("/admin/outlets");
  return { success: true };
}
