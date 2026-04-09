"use server";

import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { startOfMonth, startOfDay } from "date-fns";

type OutletSummary = Prisma.OutletGetPayload<{
  select: {
    id: true;
    name: true;
    _count: {
      select: {
        assessments: true;
      };
    };
  };
}>;

export async function getDashboardStats(): Promise<{
  totalAssessments: number;
  thisMonthAssessments: number;
  todayAssessments: number;
}> {
  const now = new Date();
  const monthStart = startOfMonth(now);
  const dayStart = startOfDay(now);

  const [totalAssessments, thisMonthAssessments, todayAssessments] = await Promise.all([
    db.assessment.count(),
    db.assessment.count({ where: { date: { gte: monthStart } } }),
    db.assessment.count({ where: { date: { gte: dayStart } } }),
  ]);

  return {
    totalAssessments,
    thisMonthAssessments,
    todayAssessments,
  };
}

export async function getDietPlanNeededCount(): Promise<number> {
  return db.assessment.count({ where: { needsDietPlan: "Yes" } });
}

export async function getOutletSummaries(): Promise<OutletSummary[]> {
  const outlets = await db.outlet.findMany({
    select: {
      id: true,
      name: true,
      _count: {
        select: { assessments: true },
      },
    },
    orderBy: { name: "asc" },
  });

  return outlets as unknown as OutletSummary[];
}
