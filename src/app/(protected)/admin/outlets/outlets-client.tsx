"use client";

import { useState } from "react";
import { createOutlet, updateOutlet, deleteOutlet } from "@/lib/actions/outlets";
import { Plus, MapPin, Building2, Pencil, Trash2, X, Check } from "lucide-react";
import { cn } from "@/lib/cn";
import type { Outlet } from "@prisma/client";

type OutletWithCount = Outlet & { _count: { assessments: number } };

export default function OutletsClient({ outlets: initialOutlets }: { outlets: OutletWithCount[] }) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const resetForm = () => {
    setName("");
    setLocation("");
    setShowForm(false);
    setEditingId(null);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = editingId
      ? await updateOutlet(editingId, { name, location: location || undefined })
      : await createOutlet({ name, location: location || undefined });

    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      resetForm();
      window.location.reload();
    }
  };

  const handleEdit = (outlet: OutletWithCount) => {
    setName(outlet.name);
    setLocation(outlet.location || "");
    setEditingId(outlet.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure? This cannot be undone.")) return;
    const result = await deleteOutlet(id);
    if (result.error) {
      alert(result.error);
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Clinic Outlets</h1>
          <p className="text-sm text-slate-500 mt-1">Manage Sahakar Smart Clinic locations and view assessment activity</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-teal-100 transition-all hover:bg-teal-700 active:scale-95"
        >
          <Plus className="h-4 w-4" />
          Add New Outlet
        </button>
      </div>

      {showForm && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm ring-1 ring-slate-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-900">{editingId ? "Edit Outlet" : "Create New Outlet"}</h2>
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
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Outlet Name *</label>
                <div className="relative group">
                   <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-teal-600 transition-colors" />
                   <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm transition-all focus:bg-white focus:outline-none focus:ring-4 focus:ring-teal-50"
                    placeholder="e.g., Outlet 6 - Calicut"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Location</label>
                <div className="relative group">
                   <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-teal-600 transition-colors" />
                   <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm transition-all focus:bg-white focus:outline-none focus:ring-4 focus:ring-teal-50"
                    placeholder="e.g., Calicut, Kerala"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-slate-800 disabled:opacity-50 active:scale-95"
              >
                <Check className="h-4 w-4" />
                {loading ? "Saving..." : editingId ? "Save Changes" : "Confirm Outlet"}
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

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50/80 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Outlet Details</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Activity</th>
                <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">Manage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {initialOutlets.map((o) => (
                <tr key={o.id} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 group-hover:bg-teal-50 group-hover:text-teal-600 transition-colors">
                        <Building2 className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 truncate">{o.name}</p>
                        <div className="flex items-center gap-1.5 mt-0.5 text-slate-400">
                          <MapPin className="h-3 w-3" />
                          <span className="text-xs truncate">{o.location || "No location set"}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                       <span className="text-lg font-bold text-slate-900 tabular-nums">{o._count.assessments}</span>
                       <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">Assessments</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleEdit(o)} 
                        className="p-2 rounded-lg text-slate-400 hover:text-teal-600 hover:bg-teal-50 transition-all"
                        title="Edit Outlet"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(o.id)} 
                        className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"
                        title="Delete Outlet"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {initialOutlets.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="p-3 rounded-full bg-slate-50 text-slate-300">
                        <Building2 className="h-8 w-8" />
                      </div>
                      <p className="text-sm font-medium text-slate-400">No outlets found. Start by adding your first clinic location.</p>
                    </div>
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
