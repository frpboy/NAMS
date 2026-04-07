"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { outletSchema } from "@/lib/validations";

export async function getOutlets() {
  return db.outlet.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { assessments: true } } },
  });
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
