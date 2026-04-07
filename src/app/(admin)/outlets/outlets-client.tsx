"use client";

import { useState } from "react";
import { createOutlet, updateOutlet, deleteOutlet } from "@/lib/actions/outlets";
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Outlets</h1>
          <p className="text-muted-foreground">Manage Sahakar Smart Clinic locations</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary/90"
        >
          + Add Outlet
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-lg border border-border bg-white p-5 space-y-4">
          {error && <p className="rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</p>}
          <div>
            <label className="block text-sm font-medium">Outlet Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="e.g., Outlet 6 - Calicut"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="e.g., Calicut, Kerala"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? "Saving..." : editingId ? "Update" : "Create"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="rounded-md border border-border px-4 py-2 text-sm font-medium transition hover:bg-muted"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="rounded-lg border border-border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="px-4 py-2 text-left font-medium">Name</th>
              <th className="px-4 py-2 text-left font-medium">Location</th>
              <th className="px-4 py-2 text-left font-medium">Assessments</th>
              <th className="px-4 py-2 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {initialOutlets.map((o) => (
              <tr key={o.id} className="hover:bg-muted/50">
                <td className="px-4 py-2 font-medium">{o.name}</td>
                <td className="px-4 py-2 text-muted-foreground">{o.location || "—"}</td>
                <td className="px-4 py-2">
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                    {o._count.assessments}
                  </span>
                </td>
                <td className="px-4 py-2 text-right space-x-2">
                  <button onClick={() => handleEdit(o)} className="text-sm text-primary hover:underline">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(o.id)} className="text-sm text-red-600 hover:underline">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {initialOutlets.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                  No outlets yet. Click &quot;Add Outlet&quot; to create one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
