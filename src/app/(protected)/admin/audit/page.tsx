import { getAuditLogs } from "@/lib/actions/audit";
import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { History, User, Activity, Clock } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AuditLogsPage() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/");

  const logs = await getAuditLogs();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Audit Logs</h1>
        <p className="mt-0.5 text-sm text-slate-500">
          Track system activity and user actions
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-500">Timestamp</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-500">User</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-500">Action</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-500">Entity</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-500">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3 text-slate-500 tabular-nums">
                    {new Date(log.createdAt).toLocaleString("en-GB")}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900">{log.user?.name}</span>
                      <span className="text-[10px] text-slate-400">{log.user?.email}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{log.entity}</td>
                  <td className="px-4 py-3 text-slate-500 italic max-w-xs truncate" title={log.details || ""}>
                    {log.details || "—"}
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-slate-400">No logs found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
