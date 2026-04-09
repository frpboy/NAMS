"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { createMasterTest, updateMasterTest, toggleMasterTest, deleteMasterTest } from "@/lib/actions/master-tests";
import { Plus, FlaskConical, Pencil, Trash2, X, Check, Power, PowerOff, Info, ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";
import type { MasterTest } from "@prisma/client";

function getVisiblePages(current: number, total: number): Array<number | "..."> {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  if (current <= 3) return [1, 2, 3, 4, "...", total];
  if (current >= total - 2) return [1, "...", total - 3, total - 2, total - 1, total];
  return [1, "...", current - 1, current, current + 1, "...", total];
}

export default function TestsClient({
  tests: initialTests,
  page,
  pageSize,
  total,
}: {
  tests: MasterTest[];
  page: number;
  pageSize: number;
  total: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedTest, setExpandedTest] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const visiblePages = getVisiblePages(page, totalPages);

  const setPage = (nextPage: number) => {
    const target = Math.min(totalPages, Math.max(1, nextPage));
    const params = new URLSearchParams(searchParams.toString());
    if (target === 1) params.delete("page");
    else params.set("page", String(target));
    router.push(params.toString() ? `${pathname}?${params.toString()}` : pathname);
  };

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    unit: "",
    description: "",
    maleMin: "",
    maleMax: "",
    femaleMin: "",
    femaleMax: "",
    lowImplication: "",
    highImplication: "",
    lowAdvice: "",
    highAdvice: "",
    procedure: "",
  });

  const categories = [...new Set(initialTests.map((t) => t.category))];

  const resetForm = () => {
    setFormData({
      name: "",
      category: "",
      unit: "",
      description: "",
      maleMin: "",
      maleMax: "",
      femaleMin: "",
      femaleMax: "",
      lowImplication: "",
      highImplication: "",
      lowAdvice: "",
      highAdvice: "",
      procedure: "",
    });
    setShowForm(false);
    setEditingId(null);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const data = {
      ...formData,
      maleMin: formData.maleMin ? parseFloat(formData.maleMin) : null,
      maleMax: formData.maleMax ? parseFloat(formData.maleMax) : null,
      femaleMin: formData.femaleMin ? parseFloat(formData.femaleMin) : null,
      femaleMax: formData.femaleMax ? parseFloat(formData.femaleMax) : null,
    };

    const result = editingId
      ? await updateMasterTest(editingId, { ...data, isActive: true })
      : await createMasterTest({ ...data, isActive: true });

    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      resetForm();
      window.location.reload();
    }
  };

  const handleEdit = (test: MasterTest) => {
    setFormData({
      name: test.name,
      category: test.category,
      unit: test.unit || "",
      description: test.description || "",
      maleMin: test.maleMin?.toString() || "",
      maleMax: test.maleMax?.toString() || "",
      femaleMin: test.femaleMin?.toString() || "",
      femaleMax: test.femaleMax?.toString() || "",
      lowImplication: test.lowImplication || "",
      highImplication: test.highImplication || "",
      lowAdvice: test.lowAdvice || "",
      highAdvice: test.highAdvice || "",
      procedure: test.procedure || "",
    });
    setEditingId(test.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleToggle = async (id: string) => { await toggleMasterTest(id); window.location.reload(); };
  const handleDelete = async (id: string) => { if (!confirm("Are you sure?")) return; await deleteMasterTest(id); window.location.reload(); };

  const grouped: Record<string, MasterTest[]> = {};
  for (const test of initialTests) { if (!grouped[test.category]) grouped[test.category] = []; grouped[test.category].push(test); }

  return (
    <div className="space-y-5 sm:space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Test Master List</h1>
          <p className="text-sm text-slate-500 mt-1">Configure lab parameters, reference ranges, and clinical guidance</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-teal-100 transition-all hover:bg-teal-700 active:scale-95"
        >
          <Plus className="h-4 w-4" />
          Add New Parameter
        </button>
      </div>

      {showForm && (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm ring-1 ring-slate-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-900">{editingId ? "Edit Test Details" : "New Test Configuration"}</h2>
            <button onClick={resetForm} className="text-slate-400 hover:text-slate-600 transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded-xl bg-red-50 border border-red-100 p-4 text-sm text-red-600 flex items-center gap-2">
                <Check className="h-4 w-4" />
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Test Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-4 text-sm transition-all focus:bg-white focus:outline-none focus:ring-4 focus:ring-teal-50"
                  placeholder="e.g., Hemoglobin"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Category *</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                  list="cats"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-4 text-sm transition-all focus:bg-white focus:outline-none focus:ring-4 focus:ring-teal-50"
                  placeholder="e.g., General Health"
                />
                <datalist id="cats">{categories.map((c) => (<option key={c} value={c} />))}</datalist>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Unit</label>
                <input
                  type="text"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-4 text-sm transition-all focus:bg-white focus:outline-none focus:ring-4 focus:ring-teal-50"
                  placeholder="e.g., g/dL"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-4 text-sm transition-all focus:bg-white focus:outline-none focus:ring-4 focus:ring-teal-50 min-h-[80px]"
                placeholder="What does this test measure?"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-blue-500" /> Male Ranges
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-slate-400">Min Value</label>
                    <input
                      type="number" step="0.01"
                      value={formData.maleMin}
                      onChange={(e) => setFormData({ ...formData, maleMin: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 bg-white py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-slate-400">Max Value</label>
                    <input
                      type="number" step="0.01"
                      value={formData.maleMax}
                      onChange={(e) => setFormData({ ...formData, maleMax: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 bg-white py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-pink-500" /> Female Ranges
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-slate-400">Min Value</label>
                    <input
                      type="number" step="0.01"
                      value={formData.femaleMin}
                      onChange={(e) => setFormData({ ...formData, femaleMin: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 bg-white py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-slate-400">Max Value</label>
                    <input
                      type="number" step="0.01"
                      value={formData.femaleMax}
                      onChange={(e) => setFormData({ ...formData, femaleMax: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 bg-white py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-blue-600">If Result is LOW</label>
                  <textarea
                    value={formData.lowImplication}
                    onChange={(e) => setFormData({ ...formData, lowImplication: e.target.value })}
                    className="w-full rounded-xl border border-blue-100 bg-blue-50/30 py-2.5 px-4 text-sm transition-all focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-50 min-h-[60px]"
                    placeholder="Clinical implications of low value..."
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-blue-600">Advice for LOW</label>
                  <textarea
                    value={formData.lowAdvice}
                    onChange={(e) => setFormData({ ...formData, lowAdvice: e.target.value })}
                    className="w-full rounded-xl border border-blue-100 bg-blue-50/30 py-2.5 px-4 text-sm transition-all focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-50 min-h-[60px]"
                    placeholder="How to increase this value..."
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-red-600">If Result is HIGH</label>
                  <textarea
                    value={formData.highImplication}
                    onChange={(e) => setFormData({ ...formData, highImplication: e.target.value })}
                    className="w-full rounded-xl border border-red-100 bg-red-50/30 py-2.5 px-4 text-sm transition-all focus:bg-white focus:outline-none focus:ring-4 focus:ring-red-50 min-h-[60px]"
                    placeholder="Clinical implications of high value..."
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-red-600">Advice for HIGH</label>
                  <textarea
                    value={formData.highAdvice}
                    onChange={(e) => setFormData({ ...formData, highAdvice: e.target.value })}
                    className="w-full rounded-xl border border-red-100 bg-red-50/30 py-2.5 px-4 text-sm transition-all focus:bg-white focus:outline-none focus:ring-4 focus:ring-red-50 min-h-[60px]"
                    placeholder="How to decrease this value..."
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Test Procedure</label>
              <textarea
                value={formData.procedure}
                onChange={(e) => setFormData({ ...formData, procedure: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-4 text-sm transition-all focus:bg-white focus:outline-none focus:ring-4 focus:ring-teal-50 min-h-[60px]"
                placeholder="How is this test conducted?"
              />
            </div>
            
            <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-200 transition-all hover:bg-slate-800 disabled:opacity-50 active:scale-95"
              >
                <Check className="h-4 w-4" />
                {loading ? "Saving..." : editingId ? "Update Parameter" : "Save Configuration"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="rounded-xl border border-slate-200 px-8 py-3 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).map(([cat, catTests]) => (
          <div key={cat} className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col h-fit">
            <div className="bg-slate-50/80 border-b border-slate-100 px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900">{cat}</h3>
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mt-0.5">{catTests.length} Parameters</p>
              </div>
              <div className="h-8 w-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400">
                <FlaskConical className="h-4 w-4" />
              </div>
            </div>
            <div className="divide-y divide-slate-100">
              {catTests.map((test) => {
                const isExpanded = expandedTest === test.id;
                return (
                  <div key={test.id} className={cn(
                    "flex flex-col group transition-all duration-300",
                    !test.isActive ? "bg-slate-50/50" : "hover:bg-slate-50/30"
                  )}>
                    <div className="flex items-center justify-between px-6 py-4 cursor-pointer" onClick={() => setExpandedTest(isExpanded ? null : test.id)}>
                      <div className="flex items-center gap-4 min-w-0 flex-1">
                        <div className={cn(
                          "h-2 w-2 shrink-0 rounded-full transition-shadow duration-300",
                          test.isActive ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" : "bg-slate-300"
                        )} />
                        <div className="min-w-0">
                          <span className={cn(
                            "text-sm font-bold truncate block",
                            test.isActive ? "text-slate-800" : "text-slate-400"
                          )}>{test.name}</span>
                          {test.unit && <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{test.unit}</span>}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 sm:gap-4">
                        <div className="hidden sm:flex items-center gap-3 text-[11px] font-medium text-slate-400">
                          {test.maleMin !== null && (
                            <div className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 border border-blue-100">
                              M: {test.maleMin}-{test.maleMax}
                            </div>
                          )}
                          {test.femaleMin !== null && (
                            <div className="px-2 py-0.5 rounded-md bg-pink-50 text-pink-600 border border-pink-100">
                              F: {test.femaleMin}-{test.femaleMax}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleToggle(test.id); }} 
                            className={cn(
                              "p-2 rounded-lg transition-colors",
                              test.isActive ? "text-slate-400 hover:text-amber-600 hover:bg-amber-50" : "text-teal-600 hover:bg-teal-50"
                            )}
                            title={test.isActive ? "Deactivate" : "Activate"}
                          >
                            {test.isActive ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleEdit(test); }} 
                            className="p-2 rounded-lg text-slate-400 hover:text-teal-600 hover:bg-teal-50 transition-colors"
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleDelete(test.id); }} 
                            className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                          <div className="p-2 text-slate-300">
                            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </div>
                        </div>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="px-4 sm:px-16 pb-4 sm:pb-6 pt-2 animate-in slide-in-from-top-2 duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
                          <div className="space-y-4">
                            <div>
                              <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 flex items-center gap-1.5">
                                <Info className="h-3 w-3" /> About Test
                              </h4>
                              <p className="text-slate-600 leading-relaxed italic">&quot;{test.description || "No description available."}&quot;</p>
                            </div>
                            
                            {test.procedure && (
                              <div>
                                <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Procedure</h4>
                                <p className="text-slate-600 leading-relaxed">{test.procedure}</p>
                              </div>
                            )}
                          </div>

                          <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="rounded-xl p-3 bg-blue-50/50 border border-blue-100">
                                <h5 className="text-[10px] font-bold text-blue-600 uppercase mb-2">If Low</h5>
                                <p className="text-xs text-blue-800 font-medium mb-2">{test.lowImplication || "—"}</p>
                                <div className="pt-2 border-t border-blue-100 text-[11px] text-blue-700">
                                  <span className="font-bold">Advice:</span> {test.lowAdvice || "Consult physician."}
                                </div>
                              </div>
                              <div className="rounded-xl p-3 bg-red-50/50 border border-red-100">
                                <h5 className="text-[10px] font-bold text-red-600 uppercase mb-2">If High</h5>
                                <p className="text-xs text-red-800 font-medium mb-2">{test.highImplication || "—"}</p>
                                <div className="pt-2 border-t border-red-100 text-[11px] text-red-700">
                                  <span className="font-bold">Advice:</span> {test.highAdvice || "Consult physician."}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {initialTests.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 p-12 text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-4">
            <FlaskConical className="h-6 w-6" />
          </div>
          <p className="text-sm font-medium text-slate-500">No parameters configured yet. Start by adding your first lab test.</p>
        </div>
      )}

      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4">
        <p className="text-xs sm:text-sm text-slate-500">
          Showing <span className="font-semibold text-slate-700">{initialTests.length === 0 ? 0 : (page - 1) * pageSize + 1}</span>
          {" "}-{" "}
          <span className="font-semibold text-slate-700">{Math.min(page * pageSize, total)}</span>
          {" "}of{" "}
          <span className="font-semibold text-slate-700">{total}</span>
        </p>
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page <= 1}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs sm:text-sm font-semibold text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" />
            Prev
          </button>
          <div className="flex items-center gap-1">
            {visiblePages.map((p, idx) =>
              p === "..." ? (
                <span key={`ellipsis-${idx}`} className="px-1 text-xs sm:text-sm text-slate-400">
                  ...
                </span>
              ) : (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={cn(
                    "min-w-8 rounded-md border px-2 py-1 text-xs sm:text-sm font-semibold",
                    p === page
                      ? "border-teal-600 bg-teal-600 text-white"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  )}
                >
                  {p}
                </button>
              )
            )}
          </div>
          <button
            onClick={() => setPage(page + 1)}
            disabled={page >= totalPages}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs sm:text-sm font-semibold text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
