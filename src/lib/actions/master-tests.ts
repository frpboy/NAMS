"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { masterTestSchema } from "@/lib/validations";

export async function getMasterTests() {
  return db.masterTest.findMany({
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });
}

export async function getMasterTestsPage(page: number, pageSize: number) {
  const [tests, total] = await Promise.all([
    db.masterTest.findMany({
      orderBy: [{ category: "asc" }, { name: "asc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.masterTest.count(),
  ]);

  return { tests, total };
}

export async function getMasterTestsByCategory() {
  const tests = await db.masterTest.findMany({
    where: { isActive: true },
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });

  const grouped: Record<string, typeof tests> = {};
  for (const test of tests) {
    if (!grouped[test.category]) grouped[test.category] = [];
    grouped[test.category].push(test);
  }
  return grouped;
}

export async function createMasterTest(data: {
  name: string;
  category: string;
  isActive?: boolean;
  unit?: string | null;
  description?: string | null;
  maleMin?: number | null;
  maleMax?: number | null;
  femaleMin?: number | null;
  femaleMax?: number | null;
  lowImplication?: string | null;
  highImplication?: string | null;
  lowAdvice?: string | null;
  highAdvice?: string | null;
  procedure?: string | null;
}) {
  const result = masterTestSchema.safeParse(data);
  if (!result.success) {
    return { error: result.error.errors[0].message };
  }
  await db.masterTest.create({ data: result.data });
  revalidatePath("/admin/tests");
  return { success: true };
}

export async function updateMasterTest(
  id: string,
  data: {
    name: string;
    category: string;
    isActive?: boolean;
    unit?: string | null;
    description?: string | null;
    maleMin?: number | null;
    maleMax?: number | null;
    femaleMin?: number | null;
    femaleMax?: number | null;
    lowImplication?: string | null;
    highImplication?: string | null;
    lowAdvice?: string | null;
    highAdvice?: string | null;
    procedure?: string | null;
  }
) {
  const result = masterTestSchema.safeParse(data);
  if (!result.success) {
    return { error: result.error.errors[0].message };
  }
  await db.masterTest.update({ where: { id }, data: result.data });
  revalidatePath("/admin/tests");
  return { success: true };
}

export async function toggleMasterTest(id: string) {
  const test = await db.masterTest.findUnique({ where: { id } });
  if (!test) return { error: "Test not found" };
  await db.masterTest.update({
    where: { id },
    data: { isActive: !test.isActive },
  });
  revalidatePath("/admin/tests");
  return { success: true };
}

export async function deleteMasterTest(id: string) {
  await db.masterTest.delete({ where: { id } });
  revalidatePath("/admin/tests");
  return { success: true };
}
