"use client";

import { useState } from "react";
import { 
  createDietPlan, 
  updateDietPlan, 
  deleteDietPlan, 
  toggleDietPlan 
} from "@/lib/actions/diet-plans";
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Power, 
  PowerOff, 
  Loader2, 
  X, 
  Check,
  ClipboardList,
  IndianRupee
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/cn";

type DietPlan = {
  id: string;
  name: string;
  price: number;
  description: string | null;
  whatsIncluded: string | null;
  isActive: boolean;
};

export default function DietPlansClient({ 
  initialPlans, 
  isAdmin 
}: { 
  initialPlans: DietPlan[]; 
  isAdmin: boolean;
}) {
  const [plans, setPlans] = useState(initialPlans);
  const [isModalOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingPlan, setEditingPlan] = useState<DietPlan | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [whatsIncluded, setWhatsIncluded] = useState("");

  const resetForm = () => {
    setName("");
    setPrice("");
    setDescription("");
    setWhatsIncluded("");
    setEditingPlan(null);
  };

  const handleOpenModal = (plan?: DietPlan) => {
    if (plan) {
      setEditingPlan(plan);
      setName(plan.name);
      setPrice(String(plan.price));
      setDescription(plan.description || "");
      setWhatsIncluded(plan.whatsIncluded || "");
    } else {
      resetForm();
    }
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const data = { 
        name, 
        price: parseFloat(price), 
        description, 
        whatsIncluded,
        isActive: editingPlan ? editingPlan.isActive : true 
      };

      const res = editingPlan 
        ? await updateDietPlan(editingPlan.id, data)
        : await createDietPlan(data);

      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(editingPlan ? "Plan updated" : "Plan created");
        setIsOpen(false);
        resetForm();
        // Simplified refresh
        window.location.reload();
      }
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (id: string) => {
    const res = await toggleDietPlan(id);
    if (res.error) toast.error(res.error);
    else window.location.reload();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    const res = await deleteDietPlan(id);
    if (res.error) toast.error(res.error);
    else window.location.reload();
  };

  return (
    <div className="space-y-4">
      {isAdmin && (
        <div className="flex justify-end">
          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-teal-100 transition hover:bg-teal-700"
          >
            <Plus className="h-4 w-4" />
            Add New Plan
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {plans.map((plan) => (
          <div 
            key={plan.id} 
            className={cn(
              "group relative rounded-2xl border bg-white p-5 shadow-sm transition-all hover:shadow-md",
              plan.isActive ? "border-slate-200" : "border-slate-100 opacity-60"
            )}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="space-y-1">
                <h3 className="font-bold text-slate-900">{plan.name}</h3>
                <div className="flex items-center gap-1 text-teal-600 font-bold">
                  <IndianRupee className="h-3.5 w-3.5" />
                  <span>{plan.price}</span>
                </div>
              </div>
              <div className={cn(
                "h-2 w-2 rounded-full",
                plan.isActive ? "bg-green-500 animate-pulse" : "bg-slate-300"
              )} />
            </div>

            <p className="text-xs text-slate-500 line-clamp-2 mb-4 h-8">
              {plan.description || "No description provided."}
            </p>

            <div className="space-y-2 mb-6">
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Includes</p>
              <p className="text-xs text-slate-700 leading-relaxed italic">
                {plan.whatsIncluded || "Standard clinical support"}
              </p>
            </div>

            {isAdmin && (
              <div className="flex items-center gap-2 pt-4 border-t border-slate-50">
                <button
                  onClick={() => handleOpenModal(plan)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-slate-50 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  <Pencil className="h-3 w-3" />
                  Edit
                </button>
                <button
                  onClick={() => handleToggle(plan.id)}
                  title={plan.isActive ? "Deactivate" : "Activate"}
                  className={cn(
                    "p-2 rounded-lg transition-colors",
                    plan.isActive ? "text-amber-600 hover:bg-amber-50" : "text-green-600 hover:bg-green-50"
                  )}
                >
                  {plan.isActive ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                </button>
                <button
                  onClick={() => handleDelete(plan.id)}
                  className="p-2 rounded-lg text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {plans.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-slate-100 rounded-3xl bg-slate-50/30 text-center">
          <ClipboardList className="h-10 w-10 text-slate-200 mb-3" />
          <p className="text-sm font-bold text-slate-400">No diet plans found</p>
          {isAdmin && <p className="text-xs text-slate-300 mt-1">Create your first plan to start associating them with assessments</p>}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">
                {editingPlan ? "Edit Diet Plan" : "Create New Diet Plan"}
              </h2>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Plan Name *</label>
                <input
                  required
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:bg-white focus:ring-4 focus:ring-teal-50 outline-none transition-all"
                  placeholder="e.g. Weight Loss Basic"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Price (₹) *</label>
                <div className="relative">
                  <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    required
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2.5 text-sm focus:bg-white focus:ring-4 focus:ring-teal-50 outline-none transition-all font-bold"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:bg-white focus:ring-4 focus:ring-teal-50 outline-none transition-all resize-none"
                  placeholder="Brief overview of the plan..."
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">What's Included</label>
                <textarea
                  value={whatsIncluded}
                  onChange={(e) => setWhatsIncluded(e.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:bg-white focus:ring-4 focus:ring-teal-50 outline-none transition-all resize-none italic"
                  placeholder="List items included in the plan..."
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 rounded-xl bg-teal-600 py-3 text-sm font-bold text-white shadow-lg shadow-teal-100 hover:bg-teal-700 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Saving...</span>
                    </div>
                  ) : (
                    <span>{editingPlan ? "Update Plan" : "Create Plan"}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
