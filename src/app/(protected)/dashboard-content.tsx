"use client";

import { useState, useMemo } from "react";
import { exportToExcel } from "@/lib/utils/excel-export";
import { generatePatientPDF } from "@/lib/utils/pdf-export";
import { Download, FileText, Search, SlidersHorizontal, Eye, Pencil } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import type { Assessment, Patient, Outlet } from "@prisma/client";

type AssessmentWithRelations = Assessment & {
  patient: Pick<Patient, "name" | "contactNumber" | "age" | "sex">;
  outlet: Pick<Outlet, "name">;
};

export default function DashboardWithFilters({
  initialAssessments,
  outlets,
}: {
  initialAssessments: AssessmentWithRelations[];
  outlets: { id: string; name: string }[];
}) {
  const [outletFilter, setOutletFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [patientSearch, setPatientSearch] = useState("");
  const [exporting, setExporting] = useState(false);

  const filtered = useMemo(() => {
    return initialAssessments.filter((a) => {
      if (outletFilter && a.outletId !== outletFilter) return false;
      if (
        patientSearch &&
        !a.patient.name.toLowerCase().includes(patientSearch.toLowerCase()) &&
        !a.patient.contactNumber.includes(patientSearch)
      )
        return false;
      
      const aDate = new Date(a.date);
      if (dateFrom && aDate < new Date(dateFrom)) return false;
      if (dateTo) {
        const end = new Date(dateTo);
        end.setHours(23, 59, 59, 999);
        if (aDate > end) return false;
      }
      return true;
    });
  }, [initialAssessments, outletFilter, patientSearch, dateFrom, dateTo]);

  const handleExport = async () => {
    try {
      setExporting(true);
      const { buffer, filename } = await exportToExcel(filtered);
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Excel export successful");
    } catch (err) {
      console.error(err);
      toast.error("Failed to export Excel");
    } finally {
      setExporting(false);
    }
  };

  const handleViewPDF = (a: AssessmentWithRelations) => {
    try {
      const pdf = generatePatientPDF({
        date: new Date(a.date).toLocaleDateString("en-GB"),
        patientName: a.patient.name,
        age: a.patient.age,
        sex: a.patient.sex,
        contactNumber: a.patient.contactNumber,
        outletName: a.outlet.name,
        height: a.height,
        weight: a.weight,
        bmi: a.bmi,
        selectedTests: Array.isArray(a.selectedTests)
          ? (a.selectedTests as { name: string; value?: string }[])
          : [],
        variationResults: a.variationResults,
        dietPlanNotes: a.dietPlanNotes,
        remarks: a.remarks,
        needsDietPlan: a.needsDietPlan,
        resultReceivedAt: new Date(a.resultReceivedAt).toLocaleDateString("en-GB"),
        interactionAt: new Date(a.interactionAt).toLocaleDateString("en-GB"),
      });
      pdf.save(`assessment-${a.patient.name}-${new Date(a.date).toISOString().slice(0, 10)}.pdf`);
      toast.success(`PDF for ${a.patient.name} generated`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate PDF");
    }
  };

  return (
    <div className="space-y-4">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-slate-500">
          <SlidersHorizontal className="h-4 w-4" />
          <span className="text-sm font-medium">
            {filtered.length} assessment{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>
        <button
          onClick={handleExport}
          disabled={exporting || filtered.length === 0}
          className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-teal-700 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Download className="h-4 w-4" />
          {exporting ? "Exporting…" : "Export Excel"}
        </button>
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {/* Search */}
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={patientSearch}
              onChange={(e) => setPatientSearch(e.target.value)}
              placeholder="Search patient…"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-8 pr-3 text-sm placeholder:text-slate-400 focus:bg-white"
            />
          </div>
          {/* Outlet */}
          <select
            value={outletFilter}
            onChange={(e) => setOutletFilter(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:bg-white"
          >
            <option value="">All Outlets</option>
            {outlets.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>
          {/* Date from */}
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:bg-white"
          />
          {/* Date to */}
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:bg-white"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Patient
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Contact
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Outlet
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  BMI
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Tests
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Diet Plan
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((a) => (
                <tr
                  key={a.id}
                  className="group hover:bg-slate-50/60 transition-colors"
                >
                  <td className="px-4 py-3 text-slate-500 tabular-nums">
                    {new Date(a.date).toLocaleDateString("en-GB")}
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-900 uppercase">
                    {a.patient.name}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">
                    {a.patient.contactNumber}
                  </td>
                  <td className="px-4 py-3 text-slate-600 uppercase">{a.outlet.name}</td>
                  <td className="px-4 py-3">
                    <BMIBadge bmi={a.bmi} />
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">
                    {Array.isArray(a.selectedTests)
                      ? a.selectedTests
                          .slice(0, 3)
                          .map((t: any) => {
                            const name = typeof t === "string" ? t : t.name;
                            const value = typeof t === "string" ? undefined : t.value;
                            return `${name}${value ? `: ${value}` : ""}`;
                          })
                          .join(", ") +
                        (a.selectedTests.length > 3 ? " …" : "")
                      : ""}
                  </td>
                  <td className="px-4 py-3">
                    <DietBadge value={a.needsDietPlan} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/assessment/${a.id}`}
                        className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-teal-600 transition hover:bg-teal-50"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        View
                      </Link>
                      <Link
                        href={`/assessment/${a.id}/edit`}
                        className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </Link>
                      <button
                        onClick={() => handleViewPDF(a)}
                        className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                      >
                        <FileText className="h-3.5 w-3.5" />
                        PDF
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-12 text-center text-sm text-slate-400"
                  >
                    No assessments match your filters.
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

function BMIBadge({ bmi }: { bmi: number }) {
  if (!bmi) return <span className="text-slate-400">—</span>;
  const cls =
    bmi < 18.5
      ? "bg-blue-50 text-blue-700"
      : bmi < 25
        ? "bg-green-50 text-green-700"
        : bmi < 30
          ? "bg-amber-50 text-amber-700"
          : "bg-red-50 text-red-700";
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${cls}`}
    >
      {bmi.toFixed(1)}
    </span>
  );
}

function DietBadge({ value }: { value: string }) {
  const cls =
    value === "Yes"
      ? "bg-red-50 text-red-700"
      : value === "Maybe"
        ? "bg-amber-50 text-amber-700"
        : "bg-green-50 text-green-700";
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>
      {value}
    </span>
  );
}
