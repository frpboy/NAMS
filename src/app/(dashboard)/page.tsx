import { getDashboardStats } from "@/lib/actions/dashboard";
import { getAssessments } from "@/lib/actions/assessments";
import Link from "next/link";

export default async function DashboardPage() {
  const stats = await getDashboardStats();
  const recentAssessments = await getAssessments();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Overview of assessments across all outlets</p>
      </div>

      {/* Metric Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Total Assessments" value={stats.totalAssessments} />
        <MetricCard label="This Month" value={stats.thisMonthAssessments} />
        <MetricCard label="Today" value={stats.todayAssessments} />
        <MetricCard label="Diet Plans Needed" value={stats.needsDietPlan} />
      </div>

      {/* Outlet Summary */}
      <div className="rounded-lg border border-border bg-white">
        <div className="border-b border-border px-6 py-4">
          <h2 className="text-lg font-semibold">Outlets</h2>
        </div>
        <div className="divide-y">
          {stats.outlets.map((outlet) => (
            <div key={outlet.id} className="flex items-center justify-between px-6 py-3">
              <span className="font-medium">{outlet.name}</span>
              <span className="rounded-full bg-primary/10 px-3 py-0.5 text-sm font-medium text-primary">
                {outlet._count.assessments} assessments
              </span>
            </div>
          ))}
          {stats.outlets.length === 0 && (
            <p className="px-6 py-8 text-center text-muted-foreground">
              No outlets configured.{" "}
              <Link href="/admin/outlets" className="text-primary underline">
                Add one
              </Link>
            </p>
          )}
        </div>
      </div>

      {/* Recent Assessments */}
      <div className="rounded-lg border border-border bg-white">
        <div className="border-b border-border px-6 py-4">
          <h2 className="text-lg font-semibold">Recent Assessments</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-2 text-left font-medium">Date</th>
                <th className="px-4 py-2 text-left font-medium">Patient</th>
                <th className="px-4 py-2 text-left font-medium">Outlet</th>
                <th className="px-4 py-2 text-left font-medium">BMI</th>
                <th className="px-4 py-2 text-left font-medium">Tests</th>
                <th className="px-4 py-2 text-left font-medium">Diet Plan</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {recentAssessments.slice(0, 10).map((a) => (
                <tr key={a.id} className="hover:bg-muted/50">
                  <td className="px-4 py-2">{new Date(a.date).toLocaleDateString("en-GB")}</td>
                  <td className="px-4 py-2 font-medium">{a.patient.name}</td>
                  <td className="px-4 py-2">{a.outlet.name}</td>
                  <td className="px-4 py-2">
                    <BMIBadge bmi={a.bmi} />
                  </td>
                  <td className="px-4 py-2">
                    {Array.isArray(a.selectedTests)
                      ? (a.selectedTests as string[]).length
                      : 0}{" "}
                    test(s)
                  </td>
                  <td className="px-4 py-2">{a.needsDietPlan}</td>
                </tr>
              ))}
              {recentAssessments.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                    No assessments yet.{" "}
                    <Link href="/assessment/new" className="text-primary underline">
                      Create your first assessment
                    </Link>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border bg-white p-5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-3xl font-bold">{value}</p>
    </div>
  );
}

function BMIBadge({ bmi }: { bmi: number }) {
  if (!bmi) return <span className="text-muted-foreground">N/A</span>;
  const color =
    bmi < 18.5
      ? "text-blue-600 bg-blue-50"
      : bmi < 25
        ? "text-green-700 bg-green-50"
        : bmi < 30
          ? "text-amber-700 bg-amber-50"
          : "text-red-700 bg-red-50";
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${color}`}>
      {bmi.toFixed(1)}
    </span>
  );
}
