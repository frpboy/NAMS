import { getAssessment } from "@/lib/actions/assessments";
import { getOutlets } from "@/lib/actions/outlets";
import { getMasterTestsByCategory } from "@/lib/actions/master-tests";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import AssessmentEditForm from "./edit-form";

export default async function AssessmentEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  const { id } = await params;
  
  const [assessment, outlets, testsByCategory] = await Promise.all([
    getAssessment(id),
    getOutlets(),
    getMasterTestsByCategory(),
  ]);

  if (!assessment) {
    notFound();
  }

  return (
    <AssessmentEditForm 
      assessment={assessment} 
      outlets={outlets} 
      testsByCategory={testsByCategory} 
    />
  );
}
