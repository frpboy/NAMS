"use server";

import { db } from "@/lib/db";
import { startOfMonth, startOfDay } from "date-fns";

export async function getDashboardStats() {
  const now = new Date();
  const monthStart = startOfMonth(now);
  const dayStart = startOfDay(now);

  const [
    totalAssessments,
    thisMonthAssessments,
    todayAssessments,
    needsDietPlan,
    outlets,
  ] = await Promise.all([
    db.assessment.count(),
    db.assessment.count({ where: { date: { gte: monthStart } } }),
    db.assessment.count({ where: { date: { gte: dayStart } } }),
    db.assessment.count({ where: { needsDietPlan: "Yes" } }),
    db.outlet.findMany({
      select: {
        id: true,
        name: true,
        _count: {
          select: { assessments: true },
        },
      },
      orderBy: { name: "asc" },
    }),
  ]);

  return {
    totalAssessments,
    thisMonthAssessments,
    todayAssessments,
    needsDietPlan,
    outlets,
  };
}
