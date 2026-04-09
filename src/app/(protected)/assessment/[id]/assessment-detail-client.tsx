"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { generatePatientPDF } from "@/lib/utils/pdf-export";
import { getLabStatus, getReferenceRange, type Gender } from "@/lib/utils/lab-reference-ranges";
import { 
  ChevronLeft, 
  Printer, 
  Download, 
  User, 
  Activity, 
  FlaskConical, 
  ClipboardList, 
  Calendar, 
  MapPin, 
  Briefcase,
  AlertCircle,
  Lightbulb,
  ArrowLeft,
  Pencil,
  IndianRupee
} from "lucide-react";
import { cn } from "@/lib/cn";
import { toast } from "sonner";
import Link from "next/link";
import { formatDateGB, formatLongDateGB } from "@/lib/utils/date-format";

type AssessmentDetailProps = {
  assessment: any;
};

export default function AssessmentDetailClient({ assessment }: AssessmentDetailProps) {
  const router = useRouter();
  const [exporting, setExporting] = useState(false);

  const handleDownloadPDF = () => {
    try {
      setExporting(true);
      const pdf = generatePatientPDF({
        date: formatDateGB(assessment.date),
        patientName: assessment.patient.name,
        age: assessment.patient.age,
        sex: assessment.patient.sex,
        contactNumber: assessment.patient.contactNumber,
        occupation: assessment.patient.occupation,
        place: assessment.patient.place,
        outletName: assessment.outlet.name,
        height: assessment.height,
        weight: assessment.weight,
        bmi: assessment.bmi,
        selectedTests: assessment.selectedTests,
        variationResults: assessment.variationResults,
        dietPlanNotes: assessment.dietPlanNotes,
        remarks: assessment.remarks,
        needsDietPlan: assessment.needsDietPlan,
        resultReceivedAt: formatDateGB(assessment.resultReceivedAt),
        interactionAt: formatDateGB(assessment.interactionAt),
        history: assessment.patient.assessments,
      });
      pdf.save(`assessment-${assessment.patient.name}-${new Date(assessment.date).toISOString().slice(0, 10)}.pdf`);
      toast.success("PDF generated successfully");
    } catch (err) {
      toast.error("Failed to generate PDF");
    } finally {
      setExporting(false);
    }
  };

  const tests = Array.isArray(assessment.selectedTests) 
    ? (assessment.selectedTests as { name: string; value?: string }[]) 
    : [];

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-20">
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="group flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 group-hover:bg-slate-100 transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </div>
          <span className="text-sm font-semibold">Back to Dashboard</span>
        </button>

        <div className="flex items-center gap-3">
          <Link
            href={`/assessment/${assessment.id}/edit`}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition-all hover:bg-slate-50"
          >
            <Pencil className="h-4 w-4" />
            Edit Assessment
          </Link>
          <button
            onClick={handleDownloadPDF}
            disabled={exporting}
            className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-teal-100 transition-all hover:bg-teal-700 disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            {exporting ? "Generating..." : "Download PDF"}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden ring-1 ring-slate-100">
        <div className="bg-slate-900 px-8 py-10 text-white relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 bg-teal-500/20 text-teal-300 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-teal-500/30">
                  <Calendar className="h-3 w-3" />
                  Assessment Date: {formatLongDateGB(assessment.date)}
                </div>
                <h1 className="text-4xl font-extrabold tracking-tight uppercase">{assessment.patient.name}</h1>
                <div className="flex flex-wrap items-center gap-4 text-slate-400 text-sm font-medium">
                  <span className="flex items-center gap-1.5"><User className="h-4 w-4" /> {assessment.patient.age}y, {assessment.patient.sex}</span>
                  <span className="h-1 w-1 rounded-full bg-slate-700" />
                  <span className="flex items-center gap-1.5 uppercase"><MapPin className="h-4 w-4" /> {assessment.patient.place}</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1 text-right">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Clinic Outlet</p>
                <p className="text-xl font-bold text-teal-400 uppercase">{assessment.outlet.name}</p>
              </div>
            </div>
          </div>
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl" />
        </div>

        <div className="p-8 space-y-10">
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-teal-600" />
              <h2 className="text-lg font-bold text-slate-900">Vitals & Measurements</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <VitalCard label="Height" value={assessment.height} unit="cm" />
              <VitalCard label="Weight" value={assessment.weight} unit="kg" />
              <div className={cn(
                "rounded-2xl p-5 border-2 flex flex-col items-center justify-center",
                !assessment.bmi ? "bg-slate-50 border-slate-100" :
                assessment.bmi < 18.5 ? "bg-blue-50 border-blue-100" :
                assessment.bmi < 25 ? "bg-green-50 border-green-100" :
                assessment.bmi < 30 ? "bg-amber-50 border-amber-100" :
                "bg-red-50 border-red-100"
              )}>
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">BMI SCORE</span>
                <span className="text-3xl font-black text-slate-900 my-1">{assessment.bmi?.toFixed(1) || "—"}</span>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <FlaskConical className="h-5 w-5 text-teal-600" />
              <h2 className="text-lg font-bold text-slate-900">Lab Test Results</h2>
            </div>
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 text-left font-bold text-slate-500 uppercase tracking-wider text-[10px]">Parameter</th>
                    <th className="px-6 py-4 text-left font-bold text-slate-500 uppercase tracking-wider text-[10px]">Result Value</th>
                    <th className="px-6 py-4 text-left font-bold text-slate-500 uppercase tracking-wider text-[10px]">Ref. Range</th>
                    <th className="px-6 py-4 text-right font-bold text-slate-500 uppercase tracking-wider text-[10px]">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tests.map((t, idx) => {
                    // Handle both object {name, value} and legacy string formats
                    const testName = typeof t === "string" ? t : t.name;
                    const testValue = typeof t === "string" ? undefined : t.value;

                    const status = testValue ? getLabStatus(testValue, testName, assessment.patient.sex as Gender) : null;
                    const ref = getReferenceRange(testName, assessment.patient.sex as Gender);
                    return (
                      <tr key={idx} className="group hover:bg-slate-50/50">
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-800">{testName}</div>
                          {ref?.description && <div className="text-[10px] text-slate-400 font-medium leading-tight mt-0.5 max-w-xs italic">{ref.description}</div>}
                        </td>
                        <td className="px-6 py-4 font-mono font-medium text-slate-600">
                          {testValue || "—"} <span className="text-[10px] text-slate-400 font-sans">{ref?.unit}</span>
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-400 font-medium italic">
                          {ref ? `${ref.activeRange.min} - ${ref.activeRange.max}` : "No reference"}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {status && status.status !== "NONE" ? (
                            <span className={cn(
                              "inline-flex px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter ring-1 ring-inset",
                              status.status === "LOW" ? "bg-blue-50 text-blue-700 ring-blue-200" :
                              status.status === "HIGH" ? "bg-red-50 text-red-700 ring-red-200" :
                              "bg-green-50 text-green-700 ring-green-200"
                            )}>
                              {status.label}
                            </span>
                          ) : <span className="text-slate-300 text-[10px] font-bold italic">N/A</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          {assessment.needsDietPlan === "Yes" && assessment.dietPlan && (
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-teal-600" />
                <h2 className="text-lg font-bold text-slate-900">Associated Diet Plan</h2>
              </div>
              <div className="rounded-2xl border border-teal-100 bg-teal-50/20 p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="text-xl font-black text-slate-900">{assessment.dietPlan.name}</h3>
                    <p className="text-sm text-slate-500">{assessment.dietPlan.description || "Comprehensive clinical dietary support."}</p>
                  </div>
                  <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-teal-100 flex items-center gap-1">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Plan Fee:</span>
                    <IndianRupee className="h-3.5 w-3.5 text-teal-600" />
                    <span className="text-xl font-black text-teal-700">{assessment.dietPlan.price}</span>
                  </div>
                </div>
                {assessment.dietPlan.whatsIncluded && (
                  <div className="mt-4 pt-4 border-t border-teal-100/50">
                    <p className="text-[10px] font-black uppercase text-teal-600 tracking-[0.2em] mb-2">What's Included</p>
                    <p className="text-xs text-teal-800 leading-relaxed italic">{assessment.dietPlan.whatsIncluded}</p>
                  </div>
                )}
              </div>
            </section>
          )}

          <section className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-teal-600" />
                <h3 className="text-base font-bold text-slate-900">Clinical Observations</h3>
              </div>
              <div className="rounded-2xl bg-slate-50 p-5 border border-slate-100 min-h-[120px]">
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{assessment.variationResults || "No variations recorded."}</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-teal-600" />
                  <h3 className="text-base font-bold text-slate-900">Dietary Advice</h3>
                </div>
                <span className={cn(
                  "px-3 py-1 rounded-full text-[10px] font-bold uppercase border",
                  assessment.needsDietPlan === "Yes" ? "bg-red-50 text-red-700 border-red-100" :
                  assessment.needsDietPlan === "Maybe" ? "bg-amber-50 text-amber-700 border-amber-100" :
                  "bg-green-50 text-green-700 border-green-100"
                )}>Plan Needed: {assessment.needsDietPlan}</span>
              </div>
              <div className="rounded-2xl bg-teal-50/30 p-5 border border-teal-100 min-h-[120px]">
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{assessment.dietPlanNotes || "No specific dietary advice recorded."}</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function VitalCard({ label, value, unit }: any) {
  return (
    <div className="rounded-2xl bg-slate-50 p-5 border border-slate-100 flex flex-col items-center justify-center">
      <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">{label}</span>
      <div className="flex items-baseline gap-1 mt-1">
        <span className="text-3xl font-black text-slate-900">{value || "—"}</span>
        <span className="text-xs font-bold text-slate-400 uppercase">{unit}</span>
      </div>
    </div>
  );
}
