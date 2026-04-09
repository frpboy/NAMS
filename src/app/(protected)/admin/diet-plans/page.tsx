import { getDietPlans } from "@/lib/actions/diet-plans";
import DietPlansClient from "./diet-plans-client";
import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";

export default async function DietPlansPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const plans = await getDietPlans();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Diet Plans</h1>
        <p className="mt-0.5 text-sm text-slate-500">
          Manage clinical diet plans and pricing
        </p>
      </div>

      <DietPlansClient initialPlans={plans} isAdmin={session.user.role === "ADMIN"} />
    </div>
  );
}
