import { getAssessments } from "@/lib/actions/assessments";
import { getOutlets } from "@/lib/actions/outlets";
import { getDashboardStats } from "@/lib/actions/dashboard";
import Link from "next/link";
import DashboardWithFilters from "./dashboard-content";
import { Activity, CalendarDays, Calendar, Salad, Building2 } from "lucide-react";

export default async function DashboardPage() {
  const stats = await getDashboardStats();
  const [assessments, outlets] = await Promise.all([
    getAssessments(),
    getOutlets(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Dashboard</h1>
        <p className="mt-0.5 text-sm text-slate-500">
          Overview of assessments across all outlets
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Total Assessments"
          value={stats.totalAssessments}
          icon={Activity}
          color="teal"
        />
        <MetricCard
          label="This Month"
          value={stats.thisMonthAssessments}
          icon={Calendar}
          color="blue"
        />
        <MetricCard
          label="Today"
          value={stats.todayAssessments}
          icon={CalendarDays}
          color="violet"
        />
        <MetricCard
          label="Diet Plans Needed"
          value={stats.needsDietPlan}
          icon={Salad}
          color="amber"
        />
      </div>

      {/* Outlet Summary */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-3.5">
          <Building2 className="h-4 w-4 text-slate-400" />
          <h2 className="text-sm font-semibold text-slate-700">Outlets</h2>
        </div>
        <div className="divide-y divide-slate-50">
          {stats.outlets.map((outlet) => (
            <div
              key={outlet.id}
              className="flex items-center justify-between px-5 py-3 hover:bg-slate-50/50 transition-colors"
            >
              <span className="text-sm font-medium text-slate-700">
                {outlet.name}
              </span>
              <span className="rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-medium text-teal-700">
                {outlet._count.assessments}
              </span>
            </div>
          ))}
          {stats.outlets.length === 0 && (
            <p className="px-5 py-8 text-center text-sm text-slate-400">
              No outlets configured.{" "}
              <Link href="/admin/outlets" className="text-teal-600 hover:underline">
                Add one
              </Link>
            </p>
          )}
        </div>
      </div>

      {/* Assessments Table */}
      <DashboardWithFilters
        initialAssessments={assessments}
        outlets={outlets.map((o) => ({ id: o.id, name: o.name }))}
      />
    </div>
  );
}

const colorMap = {
  teal: "bg-teal-50 text-teal-600",
  blue: "bg-blue-50 text-blue-600",
  violet: "bg-violet-50 text-violet-600",
  amber: "bg-amber-50 text-amber-600",
};

function MetricCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  color: keyof typeof colorMap;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{label}</p>
        <span className={`rounded-lg p-2 ${colorMap[color]}`}>
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-3 text-3xl font-bold text-slate-900">{value}</p>
    </div>
  );
}
