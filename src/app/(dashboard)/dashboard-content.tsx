"use client";

import { useState } from "react";
import { getAssessments } from "@/lib/actions/assessments";
import { exportToExcel } from "@/lib/utils/excel-export";
import { generatePatientPDF } from "@/lib/utils/pdf-export";
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

  // Filter client-side for instant feedback
  const filtered = initialAssessments.filter((a) => {
    if (outletFilter && a.outletId !== outletFilter) return false;
    if (patientSearch && !a.patient.name.toLowerCase().includes(patientSearch.toLowerCase())) return false;
    if (dateFrom) {
      const d = new Date(a.date);
      if (d < new Date(dateFrom)) return false;
    }
    if (dateTo) {
      const d = new Date(a.date);
      if (d > new Date(dateTo + "T23:59:59")) return false;
    }
    return true;
  });

  const handleExport = async () => {
    setExporting(true);
    const { buffer, filename } = await exportToExcel(filtered);
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    setExporting(false);
  };

  const handleViewPDF = (a: AssessmentWithRelations) => {
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
      selectedTests: Array.isArray(a.selectedTests) ? (a.selectedTests as string[]) : [],
      variationResults: a.variationResults,
      dietPlanNotes: a.dietPlanNotes,
      remarks: a.remarks,
      needsDietPlan: a.needsDietPlan,
      resultReceivedAt: new Date(a.resultReceivedAt).toLocaleDateString("en-GB"),
      interactionAt: new Date(a.interactionAt).toLocaleDateString("en-GB"),
    });
    pdf.save(`assessment-${a.patient.name}-${new Date(a.date).toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">{filtered.length} assessment(s) found</p>
        </div>
        <button
          onClick={handleExport}
          disabled={exporting || filtered.length === 0}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary/90 disabled:opacity-50"
        >
          {exporting ? "Exporting..." : "↓ Export to Excel"}
        </button>
      </div>

      {/* Filters */}
      <div className="rounded-lg border border-border bg-white p-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div>
            <label className="block text-sm font-medium">Outlet</label>
            <select value={outletFilter} onChange={(e) => setOutletFilter(e.target.value)}
              className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none">
              <option value="">All Outlets</option>
              {outlets.map((o) => (<option key={o.id} value={o.id}>{o.name}</option>))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Date From</label>
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
              className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium">Date To</label>
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
              className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium">Search Patient</label>
            <input type="text" value={patientSearch} onChange={(e) => setPatientSearch(e.target.value)}
              placeholder="Name or phone..."
              className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none" />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-2 text-left font-medium">Date</th>
                <th className="px-4 py-2 text-left font-medium">Patient</th>
                <th className="px-4 py-2 text-left font-medium">Contact</th>
                <th className="px-4 py-2 text-left font-medium">Outlet</th>
                <th className="px-4 py-2 text-left font-medium">BMI</th>
                <th className="px-4 py-2 text-left font-medium">Tests</th>
                <th className="px-4 py-2 text-left font-medium">Diet Plan</th>
                <th className="px-4 py-2 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((a) => (
                <tr key={a.id} className="hover:bg-muted/50">
                  <td className="px-4 py-2">{new Date(a.date).toLocaleDateString("en-GB")}</td>
                  <td className="px-4 py-2 font-medium">{a.patient.name}</td>
                  <td className="px-4 py-2 font-mono text-xs">{a.patient.contactNumber}</td>
                  <td className="px-4 py-2">{a.outlet.name}</td>
                  <td className="px-4 py-2"><BMIBadge bmi={a.bmi} /></td>
                  <td className="px-4 py-2 text-xs">
                    {Array.isArray(a.selectedTests)
                      ? (a.selectedTests as string[]).slice(0, 3).join(", ") +
                        ((a.selectedTests as string[]).length > 3 ? "..." : "")
                      : ""}
                  </td>
                  <td className="px-4 py-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      a.needsDietPlan === "Yes" ? "bg-red-50 text-red-700" :
                      a.needsDietPlan === "Maybe" ? "bg-amber-50 text-amber-700" :
                      "bg-green-50 text-green-700"
                    }`}>
                      {a.needsDietPlan}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <button
                      onClick={() => handleViewPDF(a)}
                      className="text-xs text-primary hover:underline"
                    >
                      PDF
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
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
  if (!bmi) return <span className="text-muted-foreground">N/A</span>;
  const color =
    bmi < 18.5 ? "text-blue-700 bg-blue-50" :
    bmi < 25 ? "text-green-700 bg-green-50" :
    bmi < 30 ? "text-amber-700 bg-amber-50" :
    "text-red-700 bg-red-50";
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${color}`}>
      {bmi.toFixed(1)}
    </span>
  );
}
