import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { getOutlets } from "@/lib/actions/outlets";
import { getMasterTestsByCategory } from "@/lib/actions/master-tests";
import { getActiveDietPlans } from "@/lib/actions/diet-plans";
import AssessmentForm from "./assessment-form";

export const dynamic = "force-dynamic";

export default async function NewAssessmentPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const [outlets, testsByCategory, dietPlans] = await Promise.all([
    getOutlets(),
    getMasterTestsByCategory(),
    getActiveDietPlans(),
  ]);

  return (
    <AssessmentForm
      outlets={outlets}
      testsByCategory={testsByCategory}
      dietPlans={dietPlans}
      mode="create"
    />
  );
}
