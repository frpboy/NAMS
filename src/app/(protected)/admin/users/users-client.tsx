"use client";

import { useState } from "react";
import { createUser, updateUserRole, deleteUser } from "@/lib/actions/users";
import { Plus, User, Mail, Shield, Calendar, Trash2, X, Check, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/cn";
import type { Role } from "@prisma/client";

type UserData = { id: string; name: string; email: string; role: Role; createdAt: Date };

export default function UsersClient({ users }: { users: UserData[] }) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<"ADMIN" | "NUTRITIONIST">("NUTRITIONIST");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const resetForm = () => { 
    setName(""); 
    setEmail(""); 
    setPassword(""); 
    setRole("NUTRITIONIST"); 
    setShowForm(false); 
    setError(""); 
    setShowPassword(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await createUser({ name, email, password, role });
    setLoading(false);
    if (result.error) { 
      setError(result.error); 
    } else { 
      resetForm(); 
      window.location.reload(); 
    }
  };

  const handleRoleChange = async (id: string, newRole: Role) => { 
    await updateUserRole(id, newRole); 
    window.location.reload(); 
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure? This will permanently remove this user account.")) return;
    const result = await deleteUser(id);
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
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">User Management</h1>
          <p className="text-sm text-slate-500 mt-1">Control access for nutritionists and system administrators</p>
        </div>
        <button 
          onClick={() => { resetForm(); setShowForm(true); }} 
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-teal-100 transition-all hover:bg-teal-700 active:scale-95"
        >
          <Plus className="h-4 w-4" />
          Create New User
        </button>
      </div>

      {showForm && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm ring-1 ring-slate-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-900">Add Account</h2>
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
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Full Name *</label>
                <div className="relative group">
                   <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-teal-600 transition-colors" />
                   <input 
                    type="text" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    required 
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm transition-all focus:bg-white focus:outline-none focus:ring-4 focus:ring-teal-50"
                    placeholder="John Doe"
                  />
                </div>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Email Address *</label>
                <div className="relative group">
                   <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-teal-600 transition-colors" />
                   <input 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm transition-all focus:bg-white focus:outline-none focus:ring-4 focus:ring-teal-50"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Password *</label>
                <div className="relative group">
                   <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-teal-600 transition-colors" />
                   <input 
                    type={showPassword ? "text" : "password"} 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                    minLength={8} 
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-12 text-sm transition-all focus:bg-white focus:outline-none focus:ring-4 focus:ring-teal-50"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Access Level *</label>
                <select 
                  value={role} 
                  onChange={(e) => setRole(e.target.value as "ADMIN" | "NUTRITIONIST")} 
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-4 text-sm transition-all focus:bg-white focus:outline-none focus:ring-4 focus:ring-teal-50 appearance-none"
                >
                  <option value="NUTRITIONIST">Nutritionist (Standard Access)</option>
                  <option value="ADMIN">Administrator (Full Control)</option>
                </select>
              </div>
            </div>
            
            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-slate-800 disabled:opacity-50 active:scale-95"
              >
                <Check className="h-4 w-4" />
                {loading ? "Creating..." : "Confirm & Create"}
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
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Team Member</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Access Level</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Joined Date</th>
                <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">Manage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-100 text-teal-700 font-bold text-xs group-hover:scale-110 transition-transform">
                        {u.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 truncate">{u.name}</p>
                        <p className="text-xs text-slate-400 truncate">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <select 
                      value={u.role} 
                      onChange={(e) => handleRoleChange(u.id, e.target.value as Role)} 
                      className={cn(
                        "rounded-lg border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider transition-colors focus:outline-none focus:ring-2",
                        u.role === "ADMIN" 
                          ? "bg-amber-50 text-amber-700 border-amber-100 focus:ring-amber-100" 
                          : "bg-teal-50 text-teal-700 border-teal-100 focus:ring-teal-100"
                      )}
                    >
                      <option value="ADMIN">Admin</option>
                      <option value="NUTRITIONIST">Nutritionist</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-slate-500">
                      <Calendar className="h-3.5 w-3.5" />
                      <span className="tabular-nums">{new Date(u.createdAt).toLocaleDateString("en-GB")}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleDelete(u.id)} 
                      className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                      title="Delete User"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                    No users registered in the system.
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
