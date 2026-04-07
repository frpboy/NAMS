"use client";

import { useState } from "react";
import { createMasterTest, updateMasterTest, toggleMasterTest, deleteMasterTest } from "@/lib/actions/master-tests";
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Test Master List</h1>
          <p className="text-muted-foreground">Manage lab tests and their categories</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary/90">
          + Add Test
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-lg border border-border bg-white p-5 space-y-4">
          {error && <p className="rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</p>}
          <div>
            <label className="block text-sm font-medium">Test Name *</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="e.g., Vitamin D" />
          </div>
          <div>
            <label className="block text-sm font-medium">Category *</label>
            <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} required list="cats" className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="e.g., Vitamins & Minerals" />
            <datalist id="cats">{categories.map((c) => (<option key={c} value={c} />))}</datalist>
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={loading} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary/90 disabled:opacity-50">{loading ? "Saving..." : editingId ? "Update" : "Create"}</button>
            <button type="button" onClick={resetForm} className="rounded-md border border-border px-4 py-2 text-sm font-medium transition hover:bg-muted">Cancel</button>
          </div>
        </form>
      )}

      {Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).map(([cat, catTests]) => (
        <div key={cat} className="rounded-lg border border-border bg-white">
          <div className="border-b border-border px-5 py-3">
            <h3 className="font-semibold">{cat}</h3>
            <p className="text-xs text-muted-foreground">{catTests.length} tests</p>
          </div>
          <div className="divide-y">
            {catTests.map((test) => (
              <div key={test.id} className={`flex items-center justify-between px-5 py-2.5 ${!test.isActive ? "opacity-50" : ""}`}>
                <div className="flex items-center gap-3">
                  <span className={`inline-block h-2.5 w-2.5 rounded-full ${test.isActive ? "bg-green-500" : "bg-gray-300"}`} />
                  <span className="font-medium">{test.name}</span>
                  {!test.isActive && <span className="text-xs text-muted-foreground">(inactive)</span>}
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleToggle(test.id)} className="text-xs text-muted-foreground hover:text-foreground">{test.isActive ? "Deactivate" : "Activate"}</button>
                  <button onClick={() => handleEdit(test)} className="text-xs text-primary hover:underline">Edit</button>
                  <button onClick={() => handleDelete(test.id)} className="text-xs text-red-600 hover:underline">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {initialTests.length === 0 && (
        <div className="rounded-lg border border-border bg-white p-8 text-center text-muted-foreground">No tests configured. Click &quot;Add Test&quot; to create one.</div>
      )}
    </div>
  );
}
