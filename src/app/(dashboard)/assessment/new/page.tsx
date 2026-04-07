import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth.config";
import { getOutlets } from "@/lib/actions/outlets";
import { getMasterTestsByCategory } from "@/lib/actions/master-tests";
import AssessmentForm from "./assessment-form";

export default async function NewAssessmentPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const [outlets, testsByCategory] = await Promise.all([
    getOutlets(),
    getMasterTestsByCategory(),
  ]);

  return (
    <AssessmentForm
      outlets={outlets}
      testsByCategory={testsByCategory}
      mode="create"
    />
  );
}
