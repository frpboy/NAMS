import { getAssessments } from "@/lib/actions/assessments";
import { getOutlets } from "@/lib/actions/outlets";
import { getDashboardStats } from "@/lib/actions/dashboard";
import Link from "next/link";
import DashboardWithFilters from "./dashboard-content";

export default async function DashboardPage() {
  const stats = await getDashboardStats();
  const [assessments, outlets] = await Promise.all([
    getAssessments(),
    getOutlets(),
  ]);

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

      {/* Assessments Table with Filters & Export */}
      <DashboardWithFilters
        initialAssessments={assessments}
        outlets={outlets.map((o) => ({ id: o.id, name: o.name }))}
      />
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
