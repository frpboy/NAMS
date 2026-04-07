"use client";

import { useState } from "react";
import { createMasterTest, updateMasterTest, toggleMasterTest, deleteMasterTest } from "@/lib/actions/master-tests";
import { Plus, FlaskConical, Pencil, Trash2, X, Check, Power, PowerOff } from "lucide-react";
import { cn } from "@/lib/cn";
import type { MasterTest } from "@prisma/client";

export default function TestsClient({ tests: initialTests }: { tests: MasterTest[] }) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const categories = [...new Set(initialTests.map((t) => t.category))];

  const resetForm = () => { setName(""); setCategory(""); setShowForm(false); setEditingId(null); setError(""); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = editingId
      ? await updateMasterTest(editingId, { name, category, isActive: true })
      : await createMasterTest({ name, category, isActive: true });
    setLoading(false);
    if (result.error) { setError(result.error); } else { resetForm(); window.location.reload(); }
  };

  const handleEdit = (test: MasterTest) => { setName(test.name); setCategory(test.category); setEditingId(test.id); setShowForm(true); };
  const handleToggle = async (id: string) => { await toggleMasterTest(id); window.location.reload(); };
  const handleDelete = async (id: string) => { if (!confirm("Are you sure?")) return; await deleteMasterTest(id); window.location.reload(); };

  const grouped: Record<string, MasterTest[]> = {};
  for (const test of initialTests) { if (!grouped[test.category]) grouped[test.category] = []; grouped[test.category].push(test); }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Test Master List</h1>
          <p className="text-sm text-slate-500 mt-1">Manage lab tests, reference ranges, and availability</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-teal-100 transition-all hover:bg-teal-700 active:scale-95"
        >
          <Plus className="h-4 w-4" />
          Add New Test
        </button>
      </div>

      {showForm && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm ring-1 ring-slate-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-900">{editingId ? "Edit Test" : "Create New Test"}</h2>
            <button onClick={resetForm} className="text-slate-400 hover:text-slate-600 transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-xl bg-red-50 border border-red-100 p-4 text-sm text-red-600 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-red-600" />
                {error}
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Test Name *</label>
                <div className="relative group">
                   <FlaskConical className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-teal-600 transition-colors" />
                   <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm transition-all focus:bg-white focus:outline-none focus:ring-4 focus:ring-teal-50"
                    placeholder="e.g., Vitamin D"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Category *</label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                  list="cats"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-4 text-sm transition-all focus:bg-white focus:outline-none focus:ring-4 focus:ring-teal-50"
                  placeholder="e.g., Vitamins & Minerals"
                />
                <datalist id="cats">{categories.map((c) => (<option key={c} value={c} />))}</datalist>
              </div>
            </div>
            
            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-slate-800 disabled:opacity-50 active:scale-95"
              >
                <Check className="h-4 w-4" />
                {loading ? "Saving..." : editingId ? "Update Test" : "Confirm Test"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="rounded-xl border border-slate-200 px-6 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).map(([cat, catTests]) => (
          <div key={cat} className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col h-fit">
            <div className="bg-slate-50/80 border-b border-slate-100 px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900">{cat}</h3>
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mt-0.5">{catTests.length} Tests</p>
              </div>
              <div className="h-8 w-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400">
                <FlaskConical className="h-4 w-4" />
              </div>
            </div>
            <div className="divide-y divide-slate-50">
              {catTests.map((test) => (
                <div key={test.id} className={cn(
                  "flex items-center justify-between px-6 py-3.5 group transition-colors",
                  !test.isActive ? "bg-slate-50/50" : "hover:bg-slate-50/30"
                )}>
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "h-2 w-2 rounded-full",
                      test.isActive ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" : "bg-slate-300"
                    )} />
                    <span className={cn(
                      "text-sm font-semibold transition-colors",
                      test.isActive ? "text-slate-700" : "text-slate-400"
                    )}>{test.name}</span>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-2 group-hover:translate-x-0">
                    <button 
                      onClick={() => handleToggle(test.id)} 
                      className={cn(
                        "p-2 rounded-lg transition-colors",
                        test.isActive ? "text-slate-400 hover:text-amber-600 hover:bg-amber-50" : "text-teal-600 hover:bg-teal-50"
                      )}
                      title={test.isActive ? "Deactivate" : "Activate"}
                    >
                      {test.isActive ? <PowerOff className="h-3.5 w-3.5" /> : <Power className="h-3.5 w-3.5" />}
                    </button>
                    <button 
                      onClick={() => handleEdit(test)} 
                      className="p-2 rounded-lg text-slate-400 hover:text-teal-600 hover:bg-teal-50 transition-colors"
                      title="Edit"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button 
                      onClick={() => handleDelete(test.id)} 
                      className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {initialTests.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 p-12 text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-4">
            <FlaskConical className="h-6 w-6" />
          </div>
          <p className="text-sm font-medium text-slate-500">No tests configured yet. Start by adding your first lab test.</p>
        </div>
      )}
    </div>
  );
}
