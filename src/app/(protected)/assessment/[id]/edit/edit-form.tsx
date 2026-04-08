"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createOrUpdatePatient } from "@/lib/actions/patients";
import { updateAssessment } from "@/lib/actions/assessments";
import { calculateBMI, getBMICategory, getBMIColor } from "@/lib/utils/bmi-calculator";
import { getReferenceRange, getLabStatus, type Gender } from "@/lib/utils/lab-reference-ranges";
import { toast } from "sonner";
import { 
  User, Activity, FlaskConical, ClipboardList, 
  ChevronRight, ChevronLeft, Check, Info, 
  AlertCircle, Lightbulb, X, Search, Plus, Trash2 
} from "lucide-react";
import { cn } from "@/lib/cn";
import type { Outlet, MasterTest, Assessment, Patient } from "@prisma/client";

type Props = {
  assessment: Assessment & { patient: Patient; outlet: Outlet };
  outlets: Outlet[];
  testsByCategory: Record<string, MasterTest[]>;
};

const STEPS = [
  { label: "Patient", icon: User },
  { label: "Vitals", icon: Activity },
  { label: "Lab Tests", icon: FlaskConical },
  { label: "Summary", icon: ClipboardList },
];

export default function AssessmentEditForm({ assessment, outlets, testsByCategory }: Props) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  // Step 1
  const [phone] = useState(assessment.patient.contactNumber);
  const [name, setName] = useState(assessment.patient.name);
  const [age, setAge] = useState(String(assessment.patient.age));
  const [sex, setSex] = useState(assessment.patient.sex);
  const [occupation, setOccupation] = useState(assessment.patient.occupation || "");
  const [place, setPlace] = useState(assessment.patient.place || "");

  // Step 2
  const [height, setHeight] = useState(assessment.height?.toString() || "");
  const [weight, setWeight] = useState(assessment.weight?.toString() || "");
  const bmi = (height && weight) ? calculateBMI(Number(height), Number(weight)) : null;

  // Step 3
  const [selectedTests, setSelectedTests] = useState<{ name: string; value?: string }[]>(
    Array.isArray(assessment.selectedTests) ? (assessment.selectedTests as any) : []
  );
  
  const allMasterTests = useMemo(() => 
    Object.values(testsByCategory).flat().filter(t => t.isActive),
    [testsByCategory]
  );

  const toggleTest = (testName: string) => {
    setSelectedTests((prev) =>
      prev.find((t) => t.name === testName)
        ? prev.filter((t) => t.name !== testName)
        : [...prev, { name: testName, value: "" }]
    );
  };

  const addCustomTest = (testName: string) => {
    if (!testName.trim()) return;
    if (selectedTests.find(t => t.name.toLowerCase() === testName.toLowerCase())) {
      toast.error("Test already added");
      return;
    }
    setSelectedTests(prev => [...prev, { name: testName, value: "" }]);
  };

  const updateTestValue = (testName: string, value: string) => {
    setSelectedTests((prev) =>
      prev.map((t) => (t.name === testName ? { ...t, value } : t))
    );
  };

  const removeTest = (testName: string) => {
    setSelectedTests(prev => prev.filter(t => t.name !== testName));
  };

  // Step 4
  const [outletId, setOutletId] = useState(assessment.outletId);
  const [needsDietPlan, setNeedsDietPlan] = useState(assessment.needsDietPlan);
  const [variationResults, setVariationResults] = useState(assessment.variationResults || "");
  const [dietPlanNotes, setDietPlanNotes] = useState(assessment.dietPlanNotes || "");
  const [remarks, setRemarks] = useState(assessment.remarks || "");
  
  const [resultReceivedAt, setResultReceivedAt] = useState(
    new Date(assessment.resultReceivedAt).toISOString().slice(0, 16)
  );
  const [interactionAt, setInteractionAt] = useState(
    new Date(assessment.interactionAt).toISOString().slice(0, 16)
  );

  const canProceed = () => {
    if (step === 0) return name.trim() && age;
    if (step === 1) return true;
    if (step === 2) return selectedTests.length > 0;
    if (step === 3) return !!outletId && !!resultReceivedAt && !!interactionAt;
    return false;
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      await createOrUpdatePatient({
        contactNumber: phone,
        name: name.trim(),
        age: parseInt(age),
        sex,
        occupation: occupation || undefined,
        place: place.trim() || null,
      });

      const result = await updateAssessment(assessment.id, {
        outletId,
        height: height ? Number(height) : null,
        weight: weight ? Number(weight) : null,
        selectedTests,
        needsDietPlan,
        variationResults: variationResults || undefined,
        dietPlanNotes: dietPlanNotes || undefined,
        remarks: remarks || undefined,
        resultReceivedAt: new Date(resultReceivedAt),
        interactionAt: new Date(interactionAt),
      });
      
      if (result.success) {
        toast.success("Assessment updated successfully");
        router.push(`/assessment/${assessment.id}`);
        router.refresh();
      } else {
        toast.error("Failed to update assessment");
      }
    } catch (err) {
      console.error(err);
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Edit Assessment</h1>
          <p className="mt-0.5 text-sm text-slate-500">Updating record for {assessment.patient.name}</p>
        </div>
        <button
          onClick={() => router.back()}
          className="text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-1"
        >
          <X className="h-4 w-4" /> Cancel
        </button>
      </div>

      <div className="flex items-center gap-0">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const done = i < step;
          const active = i === step;
          return (
            <div key={s.label} className="flex flex-1 items-center">
              <div className="flex flex-col items-center flex-1">
                <div className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-all",
                  done ? "bg-teal-600 text-white" : 
                  active ? "bg-teal-600 text-white ring-4 ring-teal-100" : 
                  "bg-slate-100 text-slate-400"
                )}>
                  {done ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                </div>
                <span className={cn(
                  "mt-1 text-[10px] font-bold uppercase tracking-wider",
                  active ? "text-teal-700" : done ? "text-slate-600" : "text-slate-400"
                )}>
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={cn(
                  "mb-5 h-0.5 flex-1 transition-all",
                  i < step ? "bg-teal-600" : "bg-slate-200"
                )} />
              )}
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm ring-1 ring-slate-100 min-h-[400px]">
        {step === 0 && (
          <Step1Patient
            phone={phone}
            name={name} setName={setName}
            age={age} setAge={setAge}
            sex={sex} setSex={setSex}
            occupation={occupation} setOccupation={setOccupation}
            place={place} setPlace={setPlace}
          />
        )}
        {step === 1 && (
          <Step2Vitals height={height} setHeight={setHeight} weight={weight} setWeight={setWeight} bmi={bmi} />
        )}
        {step === 2 && (
          <Step3Tests 
            allMasterTests={allMasterTests}
            selectedTests={selectedTests} 
            toggleTest={toggleTest}
            addCustomTest={addCustomTest}
            updateTestValue={updateTestValue}
            removeTest={removeTest}
            gender={sex as Gender} 
          />
        )}
        {step === 3 && (
          <Step4Clinical
            outlets={outlets} outletId={outletId} setOutletId={setOutletId}
            needsDietPlan={needsDietPlan} setNeedsDietPlan={setNeedsDietPlan}
            variationResults={variationResults} setVariationResults={setVariationResults}
            dietPlanNotes={dietPlanNotes} setDietPlanNotes={setDietPlanNotes}
            remarks={remarks} setRemarks={setRemarks}
            resultReceivedAt={resultReceivedAt} setResultReceivedAt={setResultReceivedAt}
            interactionAt={interactionAt} setInteractionAt={setInteractionAt}
          />
        )}
      </div>

      <div className="flex justify-between items-center">
        <button
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-6 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" /> Back
        </button>
        {step < 3 ? (
          <button
            onClick={() => canProceed() && setStep((s) => s + 1)}
            disabled={!canProceed()}
            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-8 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:bg-slate-800 disabled:opacity-40"
          >
            Next <ChevronRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={!canProceed() || loading}
            className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-10 py-2.5 text-sm font-bold text-white shadow-lg shadow-teal-100 transition hover:bg-teal-700 disabled:opacity-40"
          >
            {loading ? "Updating..." : "Update Assessment"}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Reused Components ───────────────────────────────────────────

function Step1Patient({
  phone, name, setName, age, setAge, sex, setSex, occupation, setOccupation, place, setPlace,
}: {
  phone: string; name: string; setName: any; age: string; setAge: any; 
  sex: string; setSex: any; occupation: string; setOccupation: any; place: string; setPlace: any;
}) {
  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <h2 className="text-base font-semibold text-slate-800">Patient Identity</h2>
      <div>
        <label className={LABEL}>Contact Number (Locked)</label>
        <input type="text" value={phone} disabled className={`${INPUT} bg-slate-100 cursor-not-allowed opacity-60`} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={LABEL}>Full Name *</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={INPUT} />
        </div>
        <div>
          <label className={LABEL}>Age *</label>
          <input type="number" value={age} onChange={(e) => setAge(e.target.value)} className={INPUT} />
        </div>
      </div>
      <div>
        <label className={LABEL}>Sex *</label>
        <div className="mt-2 flex gap-2">
          {["MALE", "FEMALE", "OTHER"].map((s) => (
            <button
              key={s} type="button"
              onClick={() => setSex(s)}
              className={cn(
                "flex-1 rounded-xl border py-2 text-xs font-semibold transition",
                sex === s ? "border-teal-600 bg-teal-50 text-teal-700" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
              )}
            >
              {s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={LABEL}>Occupation</label>
          <input type="text" value={occupation} onChange={(e) => setOccupation(e.target.value)} className={INPUT} placeholder="Optional" />
        </div>
        <div>
          <label className={LABEL}>Place</label>
          <input type="text" value={place} onChange={(e) => setPlace(e.target.value)} className={INPUT} placeholder="Optional" />
        </div>
      </div>
    </div>
  );
}

function Step2Vitals({ height, setHeight, weight, setWeight, bmi }: any) {
  const category = bmi ? getBMICategory(bmi) : "";
  const colorClass = bmi ? getBMIColor(bmi) : "";
  const bgClass =
    !bmi ? "bg-slate-50 border-slate-100"
    : bmi < 18.5 ? "bg-blue-50 border-blue-100"
    : bmi < 25 ? "bg-green-50 border-green-100"
    : bmi < 30 ? "bg-amber-50 border-amber-100"
    : "bg-red-50 border-red-100 shadow-lg shadow-red-100";

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <h2 className="text-base font-semibold text-slate-800">Vitals & Measurements</h2>
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className={LABEL}>Height (cm)</label>
            <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} className={INPUT} placeholder="Optional" />
          </div>
          <div>
            <label className={LABEL}>Weight (kg)</label>
            <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} step="0.1" className={INPUT} placeholder="Optional" />
          </div>
        </div>
        <div className={cn(
          "rounded-3xl border-2 p-6 flex flex-col items-center justify-center transition-all duration-500",
          bgClass
        )}>
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">BMI SCORE</span>
          <div className="my-2 relative">
            <span className={cn(
              "text-5xl font-black tabular-nums",
              !bmi ? "text-slate-200" : "text-slate-900",
              colorClass
            )}>
              {bmi ? bmi.toFixed(1) : "—"}
            </span>
          </div>
          {bmi && (
            <span className={cn(
              "text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider",
              bmi < 18.5 ? "bg-blue-100 text-blue-700" :
              bmi < 25 ? "bg-green-100 text-green-700" :
              bmi < 30 ? "bg-amber-100 text-amber-700" :
              "bg-red-100 text-red-700"
            )}>
              {category}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function Step3Tests({
  allMasterTests, selectedTests, toggleTest, addCustomTest, updateTestValue, removeTest, gender,
}: any) {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const filteredMaster = useMemo(() => {
    if (!search) return [];
    return allMasterTests
      .filter((t: any) => t.name.toLowerCase().includes(search.toLowerCase()))
      .slice(0, 5);
  }, [allMasterTests, search]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-800">Lab Test Results</h2>
        <span className="rounded-full bg-teal-50 px-3 py-1 text-[10px] font-bold uppercase text-teal-700 border border-teal-100">
          {selectedTests.length} Parameters
        </span>
      </div>

      <div className="relative group">
        <label className={LABEL}>Search or Add New Test</label>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-teal-600 transition-colors" />
          <input
            type="text" value={search}
            onChange={(e) => { setSearch(e.target.value); setIsOpen(true); }}
            onFocus={() => setIsOpen(true)}
            placeholder="e.g. Hemoglobin, Vitamin D..."
            className={`${INPUT} pl-11 pr-12`}
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {isOpen && (search || filteredMaster.length > 0) && (
          <div className="absolute z-50 mt-2 w-full rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-2 space-y-1">
              {filteredMaster.map((t: any) => {
                const isSelected = !!selectedTests.find((st: any) => st.name === t.name);
                return (
                  <button
                    key={t.id}
                    onClick={() => { toggleTest(t.name); setSearch(""); setIsOpen(false); }}
                    className={cn(
                      "flex w-full items-center justify-between rounded-xl px-4 py-3 text-left transition-all",
                      isSelected ? "bg-teal-50 text-teal-700" : "hover:bg-slate-50 text-slate-700"
                    )}
                  >
                    <div>
                      <p className="text-sm font-bold">{t.name}</p>
                      <p className="text-[10px] font-medium opacity-60 uppercase tracking-tighter">{t.category}</p>
                    </div>
                    {isSelected ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4 opacity-30" />}
                  </button>
                );
              })}
              {search && !filteredMaster.find((t: any) => t.name.toLowerCase() === search.toLowerCase()) && (
                <button
                  onClick={() => { addCustomTest(search); setSearch(""); setIsOpen(false); }}
                  className="flex w-full items-center gap-3 rounded-xl bg-slate-900 px-4 py-3 text-left text-white"
                >
                  <Plus className="h-4 w-4" />
                  <div>
                    <p className="text-sm font-bold">Add Custom: "{search}"</p>
                    <p className="text-[10px] opacity-60 uppercase tracking-tighter">New Parameter</p>
                  </div>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="space-y-3">
        {selectedTests.map((st: any) => {
          const master = allMasterTests.find((m: any) => m.name === st.name);
          const isFemale = gender === "FEMALE";
          const min = master ? (isFemale ? master.femaleMin : master.maleMin) : null;
          const max = master ? (isFemale ? master.femaleMax : master.maleMax) : null;
          const val = parseFloat(st.value || "");
          const isLow = !isNaN(val) && min !== null && val < min;
          const isHigh = !isNaN(val) && max !== null && val > max;

          return (
            <div key={st.name} className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:border-teal-200 transition-all animate-in slide-in-from-left-2 duration-300">
              <div className="flex items-center justify-between gap-4 mb-3">
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-slate-800 truncate">{st.name}</h3>
                  {master && <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{master.category}</p>}
                </div>
                <button onClick={() => removeTest(st.name)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <input
                    type="number" step="0.01" value={st.value || ""}
                    onChange={(e) => updateTestValue(st.name, e.target.value)}
                    className={cn(
                      "w-28 rounded-xl border px-3 py-2 text-sm font-bold focus:outline-none transition-all",
                      isLow ? "bg-blue-50 border-blue-200 text-blue-700" :
                      isHigh ? "bg-red-50 border-red-200 text-red-700" : "bg-slate-50 border-slate-200"
                    )}
                  />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{master?.unit || "—"}</span>
                </div>
                {min !== null && (
                  <div className="flex items-center gap-2">
                    <span className="bg-slate-100 text-slate-500 px-2 py-1 rounded-lg text-[10px] font-bold">REF: {min}-{max}</span>
                    {isLow && <span className="bg-blue-600 text-white px-2 py-1 rounded-lg text-[10px] font-black uppercase">LOW</span>}
                    {isHigh && <span className="bg-red-600 text-white px-2 py-1 rounded-lg text-[10px] font-black uppercase">HIGH</span>}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Step4Clinical({ outlets, outletId, setOutletId, needsDietPlan, setNeedsDietPlan, ...rest }: any) {
  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <h2 className="text-base font-semibold text-slate-800">Finalization</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={LABEL}>Outlet *</label>
          <select value={outletId} onChange={(e) => setOutletId(e.target.value)} className={INPUT}>
            {outlets.map((o: any) => (<option key={o.id} value={o.id}>{o.name}</option>))}
          </select>
        </div>
        <div>
          <label className={LABEL}>Needs Diet Plan? *</label>
          <div className="mt-2 flex gap-2">
            {["Yes", "No", "Maybe"].map((v) => (
              <button
                key={v} type="button"
                onClick={() => setNeedsDietPlan(v)}
                className={cn(
                  "flex-1 rounded-xl border py-2 text-[10px] font-bold uppercase transition-all",
                  needsDietPlan === v ? "bg-teal-600 text-white border-teal-600 shadow-md shadow-teal-100" : "bg-white text-slate-400 border-slate-200"
                )}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={LABEL}>Result Received *</label>
          <input type="datetime-local" value={rest.resultReceivedAt} onChange={(e) => rest.setResultReceivedAt(e.target.value)} className={INPUT} />
        </div>
        <div>
          <label className={LABEL}>Interaction *</label>
          <input type="datetime-local" value={rest.interactionAt} onChange={(e) => rest.setInteractionAt(e.target.value)} className={INPUT} />
        </div>
      </div>
      <div>
        <label className={LABEL}>Variation in Results</label>
        <textarea value={rest.variationResults} onChange={(e) => rest.setVariationResults(e.target.value)} rows={2} className={`${INPUT} resize-none`} />
      </div>
      <div>
        <label className={LABEL}>Dietary Advice</label>
        <textarea value={rest.dietPlanNotes} onChange={(e) => rest.setDietPlanNotes(e.target.value)} rows={2} className={`${INPUT} resize-none`} />
      </div>
      <div>
        <label className={LABEL}>Remarks</label>
        <textarea value={rest.remarks} onChange={(e) => rest.setRemarks(e.target.value)} rows={2} className={`${INPUT} resize-none`} />
      </div>
    </div>
  );
}

const INPUT = "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:ring-4 focus:ring-teal-50 transition-all";
const LABEL = "block text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1 mb-1.5";
