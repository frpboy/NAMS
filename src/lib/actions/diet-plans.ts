"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { z } from "zod";

const dietPlanSchema = z.object({
  name: z.string().min(1, "Name is required"),
  price: z.number().min(0, "Price must be positive"),
  description: z.string().optional(),
  whatsIncluded: z.string().optional(),
  isActive: z.boolean().optional(),
});

export async function getDietPlans() {
  return db.dietPlan.findMany({
    orderBy: { name: "asc" },
  });
}

export async function getActiveDietPlans() {
  return db.dietPlan.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });
}

export async function createDietPlan(data: z.infer<typeof dietPlanSchema>) {
  const result = dietPlanSchema.safeParse(data);
  if (!result.success) {
    return { error: result.error.errors[0].message };
  }
  await db.dietPlan.create({ data: result.data });
  revalidatePath("/admin/diet-plans");
  return { success: true };
}

export async function updateDietPlan(id: string, data: z.infer<typeof dietPlanSchema>) {
  const result = dietPlanSchema.safeParse(data);
  if (!result.success) {
    return { error: result.error.errors[0].message };
  }
  await db.dietPlan.update({ where: { id }, data: result.data });
  revalidatePath("/admin/diet-plans");
  return { success: true };
}

export async function toggleDietPlan(id: string) {
  const plan = await db.dietPlan.findUnique({ where: { id } });
  if (!plan) return { error: "Plan not found" };
  await db.dietPlan.update({
    where: { id },
    data: { isActive: !plan.isActive },
  });
  revalidatePath("/admin/diet-plans");
  return { success: true };
}

export async function deleteDietPlan(id: string) {
  const count = await db.assessment.count({ where: { dietPlanId: id } });
  if (count > 0) {
    return { error: "Cannot delete plan with linked assessments. Deactivate it instead." };
  }
  await db.dietPlan.delete({ where: { id } });
  revalidatePath("/admin/diet-plans");
  return { success: true };
}
