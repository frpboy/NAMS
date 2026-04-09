import { getAssessment } from "@/lib/actions/assessments";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import AssessmentDetailClient from "./assessment-detail-client";
import { Suspense } from "react";

export default async function AssessmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  const { id } = await params;
  const assessment = await getAssessment(id);

  if (!assessment) {
    notFound();
  }

  // Security: Sanitize data passed to client to avoid exposing internal DB fields
  const safeAssessment = {
    id: assessment.id,
    date: assessment.date.toISOString(),
    height: assessment.height,
    weight: assessment.weight,
    bmi: assessment.bmi,
    selectedTests: assessment.selectedTests,
    variationResults: assessment.variationResults,
    dietPlanNotes: assessment.dietPlanNotes,
    remarks: assessment.remarks,
    needsDietPlan: assessment.needsDietPlan,
    resultReceivedAt: assessment.resultReceivedAt.toISOString(),
    interactionAt: assessment.interactionAt.toISOString(),
    patient: {
      name: assessment.patient.name,
      age: assessment.patient.age,
      sex: assessment.patient.sex,
      contactNumber: assessment.patient.contactNumber,
      occupation: assessment.patient.occupation,
      place: assessment.patient.place,
    },
    outlet: {
      name: assessment.outlet.name,
    },
  };

  return (
    <Suspense fallback={<AssessmentDetailSkeleton />}>
      <AssessmentDetailClient assessment={safeAssessment} />
    </Suspense>
  );
}

function AssessmentDetailSkeleton() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="h-8 w-32 animate-pulse rounded-lg bg-slate-200" />
        <div className="h-10 w-32 animate-pulse rounded-xl bg-slate-200" />
      </div>
      <div className="h-96 animate-pulse rounded-3xl bg-white border border-slate-200 shadow-sm" />
    </div>
  );
}
