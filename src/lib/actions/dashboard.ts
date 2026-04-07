"use server";

import { db } from "@/lib/db";

export async function getDashboardStats() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const [
    totalAssessments,
    thisMonthAssessments,
    todayAssessments,
    outlets,
    needsDietPlan,
  ] = await Promise.all([
    db.assessment.count(),
    db.assessment.count({ where: { date: { gte: startOfMonth } } }),
    db.assessment.count({ where: { date: { gte: startOfDay } } }),
    db.outlet.findMany({
      include: { _count: { select: { assessments: true } } },
      orderBy: { name: "asc" },
    }),
    db.assessment.count({ where: { needsDietPlan: "Yes" } }),
  ]);

  return {
    totalAssessments,
    thisMonthAssessments,
    todayAssessments,
    outlets,
    needsDietPlan,
  };
}
