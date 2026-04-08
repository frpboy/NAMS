import { getAssessments } from "@/lib/actions/assessments";
import { getOutlets } from "@/lib/actions/outlets";
import ReportsContent from "./reports-content";
import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const [assessments, outlets] = await Promise.all([
    getAssessments(),
    getOutlets(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Advanced Reports</h1>
        <p className="mt-0.5 text-sm text-slate-500">
          Generate, filter and customize clinical assessment reports
        </p>
      </div>

      <ReportsContent 
        initialAssessments={assessments} 
        outlets={outlets.map(o => ({ id: o.id, name: o.name }))} 
      />
    </div>
  );
}
