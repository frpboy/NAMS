"use client";

import { useState, useMemo } from "react";
import { exportToExcel } from "@/lib/utils/excel-export";
import { generatePatientPDF } from "@/lib/utils/pdf-export";
import { 
  Download, 
  Search, 
  SlidersHorizontal, 
  Eye, 
  Pencil, 
  ChevronUp, 
  ChevronDown, 
  Settings2,
  Check,
  X
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { cn } from "@/lib/cn";

type AssessmentWithRelations = any; // Simplify for brevity, should use proper type

const ALL_COLUMNS = [
  { id: "date", label: "Date" },
  { id: "patient", label: "Patient" },
  { id: "contact", label: "Contact" },
  { id: "place", label: "Place" },
  { id: "outlet", label: "Outlet" },
  { id: "bmi", label: "BMI" },
  { id: "tests", label: "Tests" },
  { id: "diet", label: "Diet Plan" },
];

export default function ReportsContent({
  initialAssessments,
  outlets,
}: {
  initialAssessments: AssessmentWithRelations[];
  outlets: { id: string; name: string }[];
}) {
  // Filters
  const [outletFilter, setOutletFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [patientSearch, setPatientSearch] = useState("");
  
  // Customization
  const [visibleColumns, setVisibleColumns] = useState(ALL_COLUMNS.map(c => c.id));
  const [showColumnPicker, setShowColumnPicker] = useState(false);
  
  // Sorting
  const [sortField, setSortField] = useState<string>("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const [exporting, setExporting] = useState(false);

  const toggleColumn = (id: string) => {
    setVisibleColumns(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const filteredAndSorted = useMemo(() => {
    let result = initialAssessments.filter((a) => {
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

    // Sort
    result.sort((a, b) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];

      if (sortField === "patient") { valA = a.patient.name; valB = b.patient.name; }
      if (sortField === "contact") { valA = a.patient.contactNumber; valB = b.patient.contactNumber; }
      if (sortField === "place") { valA = a.patient.place; valB = b.patient.place; }
      if (sortField === "outlet") { valA = a.outlet.name; valB = b.outlet.name; }
      if (sortField === "diet") { valA = a.needsDietPlan; valB = b.needsDietPlan; }

      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [initialAssessments, outletFilter, patientSearch, dateFrom, dateTo, sortField, sortOrder]);

  return (
    <div className="space-y-4">
      {/* Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-slate-500">
            <SlidersHorizontal className="h-4 w-4" />
            <span className="text-sm font-medium">{filteredAndSorted.length} Records</span>
          </div>
          
          <div className="relative">
            <button
              onClick={() => setShowColumnPicker(!showColumnPicker)}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              <Settings2 className="h-4 w-4" />
              Columns
            </button>
            
            {showColumnPicker && (
              <div className="absolute left-0 mt-2 z-50 w-48 rounded-xl border border-slate-200 bg-white p-2 shadow-xl animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between px-2 py-1 mb-1 border-b border-slate-50">
                  <span className="text-[10px] font-black uppercase text-slate-400">Toggle Columns</span>
                  <button onClick={() => setShowColumnPicker(false)}><X className="h-3 w-3 text-slate-400" /></button>
                </div>
                {ALL_COLUMNS.map(col => (
                  <button
                    key={col.id}
                    onClick={() => toggleColumn(col.id)}
                    className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-medium hover:bg-slate-50 transition-colors"
                  >
                    <span>{col.label}</span>
                    {visibleColumns.includes(col.id) ? (
                      <Check className="h-3.5 w-3.5 text-teal-600" />
                    ) : (
                      <div className="h-3.5 w-3.5 rounded border border-slate-200" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <button
          onClick={() => {}} // Placeholder for export
          className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-teal-700 transition-all"
        >
          <Download className="h-4 w-4" />
          Export Dataset
        </button>
      </div>

      {/* Filters (Same as Dashboard) */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text" value={patientSearch}
              onChange={(e) => setPatientSearch(e.target.value)}
              placeholder="Search patient or phone..."
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-8 pr-3 text-sm focus:bg-white focus:ring-2 focus:ring-teal-500/20 outline-none"
            />
          </div>
          <select
            value={outletFilter} onChange={(e) => setOutletFilter(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:bg-white"
          >
            <option value="">All Outlets</option>
            {outlets.map((o) => (<option key={o.id} value={o.id}>{o.name}</option>))}
          </select>
          <input
            type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
          />
          <input
            type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
          />
        </div>
      </div>

      {/* Customizable & Sortable Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50/80 border-b border-slate-100">
              <tr>
                {visibleColumns.includes("date") && (
                  <th className="px-4 py-3 text-left">
                    <button onClick={() => handleSort("date")} className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-slate-900 transition-colors">
                      Date {sortField === "date" ? (sortOrder === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />) : <ChevronDown className="h-3 w-3 opacity-20" />}
                    </button>
                  </th>
                )}
                {visibleColumns.includes("patient") && (
                  <th className="px-4 py-3 text-left">
                    <button onClick={() => handleSort("patient")} className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-slate-900 transition-colors">
                      Patient {sortField === "patient" ? (sortOrder === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />) : <ChevronDown className="h-3 w-3 opacity-20" />}
                    </button>
                  </th>
                )}
                {visibleColumns.includes("contact") && (
                  <th className="px-4 py-3 text-left">
                    <button onClick={() => handleSort("contact")} className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-slate-900 transition-colors">
                      Contact {sortField === "contact" ? (sortOrder === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />) : <ChevronDown className="h-3 w-3 opacity-20" />}
                    </button>
                  </th>
                )}
                {visibleColumns.includes("place") && (
                  <th className="px-4 py-3 text-left">
                    <button onClick={() => handleSort("place")} className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-slate-900 transition-colors">
                      Place {sortField === "place" ? (sortOrder === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />) : <ChevronDown className="h-3 w-3 opacity-20" />}
                    </button>
                  </th>
                )}
                {visibleColumns.includes("outlet") && (
                  <th className="px-4 py-3 text-left">
                    <button onClick={() => handleSort("outlet")} className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-slate-900 transition-colors">
                      Outlet {sortField === "outlet" ? (sortOrder === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />) : <ChevronDown className="h-3 w-3 opacity-20" />}
                    </button>
                  </th>
                )}
                {visibleColumns.includes("bmi") && (
                  <th className="px-4 py-3 text-left">
                    <button onClick={() => handleSort("bmi")} className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-slate-900 transition-colors">
                      BMI {sortField === "bmi" ? (sortOrder === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />) : <ChevronDown className="h-3 w-3 opacity-20" />}
                    </button>
                  </th>
                )}
                {visibleColumns.includes("tests") && (
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Tests</th>
                )}
                {visibleColumns.includes("diet") && (
                  <th className="px-4 py-3 text-left">
                    <button onClick={() => handleSort("diet")} className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-slate-900 transition-colors">
                      Diet {sortField === "diet" ? (sortOrder === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />) : <ChevronDown className="h-3 w-3 opacity-20" />}
                    </button>
                  </th>
                )}
                <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredAndSorted.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50/50 transition-colors group">
                  {visibleColumns.includes("date") && <td className="px-4 py-3 text-slate-500">{new Date(a.date).toLocaleDateString("en-GB")}</td>}
                  {visibleColumns.includes("patient") && <td className="px-4 py-3 font-bold text-slate-900 uppercase">{a.patient.name}</td>}
                  {visibleColumns.includes("contact") && <td className="px-4 py-3 font-mono text-xs text-slate-500">{a.patient.contactNumber}</td>}
                  {visibleColumns.includes("place") && <td className="px-4 py-3 text-slate-600 uppercase">{a.patient.place}</td>}
                  {visibleColumns.includes("outlet") && <td className="px-4 py-3 text-slate-600 uppercase">{a.outlet.name}</td>}
                  {visibleColumns.includes("bmi") && <td className="px-4 py-3">{a.bmi ? a.bmi.toFixed(1) : "—"}</td>}
                  {visibleColumns.includes("tests") && (
                    <td className="px-4 py-3 text-xs text-slate-400">
                      {Array.isArray(a.selectedTests)
                        ? a.selectedTests
                            .map((t: any) => {
                              const name = typeof t === "string" ? t : t.name;
                              const value = typeof t === "string" ? undefined : t.value;
                              return `${name}${value ? `: ${value}` : ""}`;
                            })
                            .join(", ")
                        : ""}
                    </td>
                  )}
                  {visibleColumns.includes("diet") && <td className="px-4 py-3">{a.needsDietPlan}</td>}
                  <td className="px-4 py-3 text-right">
                    <Link href={`/assessment/${a.id}`} className="text-teal-600 hover:underline font-medium">View</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
