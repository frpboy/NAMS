"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { lookupPatientByPhone, createOrUpdatePatient } from "@/lib/actions/patients";
import { createAssessment } from "@/lib/actions/assessments";
import { calculateBMI, getBMICategory, getBMIColor } from "@/lib/utils/bmi-calculator";
import { getReferenceRange, getLabStatus, type Gender } from "@/lib/utils/lab-reference-ranges";
import { toast } from "sonner";
import { 
  User, Activity, FlaskConical, ClipboardList, 
  ChevronRight, ChevronLeft, Check, Info, 
  AlertCircle, Lightbulb, X, Search, Plus, Trash2 
} from "lucide-react";
import { cn } from "@/lib/cn";
import type { Outlet, MasterTest } from "@prisma/client";

type Props = {
  outlets: (Outlet & { _count: { assessments: number } })[];
  testsByCategory: Record<string, MasterTest[]>;
  mode: "create";
};

const STEPS = [
  { label: "Patient", icon: User },
  { label: "Vitals", icon: Activity },
  { label: "Lab Tests", icon: FlaskConical },
  { label: "Summary", icon: ClipboardList },
];

export default function AssessmentForm({ outlets, testsByCategory }: Props) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Step 1
  const [phone, setPhone] = useState("");
  const [lookingUp, setLookingUp] = useState(false);
  const [existingPatient, setExistingPatient] = useState<{
    id: string; name: string; age: number; sex: string; occupation: string | null; place: string | null;
  } | null>(null);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [sex, setSex] = useState("MALE");
  const [occupation, setOccupation] = useState("");
  const [place, setPlace] = useState("");

  // Step 2
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const bmi = (height && weight) ? calculateBMI(Number(height), Number(weight)) : null;

  // Step 3
  const [selectedTests, setSelectedTests] = useState<{ name: string; value?: string }[]>([]);
  
  // Flatten tests for search
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
  const [outletId, setOutletId] = useState(outlets[0]?.id || "");
  const [needsDietPlan, setNeedsDietPlan] = useState("No");
  const [variationResults, setVariationResults] = useState("");
  const [dietPlanNotes, setDietPlanNotes] = useState("");
  const [remarks, setRemarks] = useState("");
  const [resultReceivedAt, setResultReceivedAt] = useState("");
  const [interactionAt, setInteractionAt] = useState("");

  const lookupPatient = useCallback(async () => {
    if (phone.length !== 10) return;
    setLookingUp(true);
    const result = await lookupPatientByPhone(phone);
    setLookingUp(false);
    if (result.found && result.patient) {
      const p = result.patient;
      setExistingPatient({ id: p.id, name: p.name, age: p.age, sex: p.sex, occupation: p.occupation, place: p.place });
      setName(p.name);
      setAge(String(p.age));
      setSex(p.sex);
      setOccupation(p.occupation || "");
      setPlace(p.place || "");
    } else {
      setExistingPatient(null);
    }
  }, [phone]);

  useEffect(() => {
    if (phone.length === 10) lookupPatient();
  }, [phone, lookupPatient]);

  const canProceed = () => {
    if (step === 0) return phone.length === 10 && name.trim() && age;
    if (step === 1) return true;
    if (step === 2) return selectedTests.length > 0;
    if (step === 3) return !!outletId && !!resultReceivedAt && !!interactionAt;
    return false;
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError("");
      const patient = await createOrUpdatePatient({
        contactNumber: phone,
        name: name.trim(),
        age: parseInt(age),
        sex,
        occupation: occupation || undefined,
        place: place.trim() || null,
      });
      const result = await createAssessment({
        patientId: patient.id,
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
      
      if (result.error) {
        setError(result.error);
        toast.error(result.error);
      } else {
        toast.success("Assessment submitted successfully");
        router.push("/");
        router.refresh();
      }
    } catch (err) {
      console.error(err);
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Page title */}
      <div>
        <h1 className="text-xl font-semibold text-slate-900">New Assessment</h1>
        <p className="mt-0.5 text-sm text-slate-500">Complete all 4 steps to submit</p>
      </div>

      {/* Step bar */}
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

      {error && (
        <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Step content */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm ring-1 ring-slate-100 min-h-[400px]">
        {step === 0 && (
          <Step1Patient
            phone={phone} setPhone={setPhone}
            lookingUp={lookingUp} existingPatient={existingPatient}
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

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-6 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </button>
        {step < 3 ? (
          <button
            onClick={() => canProceed() && setStep((s) => s + 1)}
            disabled={!canProceed()}
            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-8 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:bg-slate-800 disabled:opacity-40"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={!canProceed() || loading}
            className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-10 py-2.5 text-sm font-bold text-white shadow-lg shadow-teal-100 transition hover:bg-teal-700 disabled:opacity-40"
          >
            <Check className="h-4 w-4" />
            {loading ? "Submitting…" : "Submit Assessment"}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Shared Styles ───────────────────────────────────────────────
const INPUT = "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:ring-4 focus:ring-teal-50 transition-all";
const LABEL = "block text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1 mb-1.5";

// ─── Step 1 ───────────────────────────────────────────────────────
function Step1Patient({
  phone, setPhone, lookingUp, existingPatient,
  name, setName, age, setAge, sex, setSex, occupation, setOccupation, place, setPlace,
}: {
  phone: string; setPhone: (v: string) => void;
  lookingUp: boolean; existingPatient: any;
  name: string; setName: (v: string) => void;
  age: string; setAge: (v: string) => void;
  sex: string; setSex: (v: string) => void;
  occupation: string; setOccupation: (v: string) => void;
  place: string; setPlace: (v: string) => void;
}) {
  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <h2 className="text-lg font-bold text-slate-800">Patient Identity</h2>

      <div>
        <label className={LABEL}>Contact Number</label>
        <div className="relative mt-1.5">
          <input
            type="tel" maxLength={10} value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
            className={`${INPUT} font-mono text-base pr-36`}
            placeholder="10-digit number"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2">
            {lookingUp && (
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500 uppercase">Searching…</span>
            )}
            {existingPatient && !lookingUp && (
              <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 uppercase">Returning ✓</span>
            )}
            {phone.length === 10 && !existingPatient && !lookingUp && (
              <span className="rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-bold text-green-700 uppercase">New Patient</span>
            )}
          </span>
        </div>
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
                "flex-1 rounded-xl border py-2.5 text-xs font-bold uppercase tracking-wider transition-all",
                sex === s ? "border-teal-600 bg-teal-50 text-teal-700 shadow-sm" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
              )}
            >
              {s}
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

// ─── Step 2 ───────────────────────────────────────────────────────
function Step2Vitals({
  height, setHeight, weight, setWeight, bmi,
}: {
  height: string; setHeight: (v: string) => void;
  weight: string; setWeight: (v: string) => void;
  bmi: number | null;
}) {
  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <h2 className="text-lg font-bold text-slate-800">Vitals & Measurements</h2>
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className={LABEL}>Height (cm)</label>
            <input type="number" value={height} onChange={(e) => setHeight(e.target.value)}
              className={`${INPUT} text-lg font-semibold`} placeholder="e.g. 165" />
          </div>
          <div>
            <label className={LABEL}>Weight (kg)</label>
            <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} step="0.1"
              className={`${INPUT} text-lg font-semibold`} placeholder="e.g. 62.5" />
          </div>
        </div>

        <div className={cn(
          "rounded-3xl border-2 p-6 flex flex-col items-center justify-center transition-all duration-500",
          !bmi ? "bg-slate-50 border-slate-100" : 
          bmi < 18.5 ? "bg-blue-50 border-blue-100" : 
          bmi < 25 ? "bg-green-50 border-green-100" : 
          bmi < 30 ? "bg-amber-50 border-amber-100" : 
          "bg-red-50 border-red-100 shadow-lg shadow-red-100"
        )}>
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">BMI SCORE</span>
          <div className="my-2 relative">
            <span className={cn(
              "text-5xl font-black tabular-nums",
              !bmi ? "text-slate-200" : "text-slate-900"
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
              {getBMICategory(bmi)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Step 3 ───────────────────────────────────────────────────────
function Step3Tests({
  allMasterTests, selectedTests, toggleTest, addCustomTest, updateTestValue, removeTest, gender,
}: {
  allMasterTests: MasterTest[];
  selectedTests: { name: string; value?: string }[];
  toggleTest: (name: string) => void;
  addCustomTest: (name: string) => void;
  updateTestValue: (name: string, value: string) => void;
  removeTest: (name: string) => void;
  gender: Gender;
}) {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const filteredMaster = useMemo(() => {
    if (!search) return [];
    return allMasterTests
      .filter(t => t.name.toLowerCase().includes(search.toLowerCase()))
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

      {/* Searchable Dropdown */}
      <div className="relative group">
        <label className={LABEL}>Search or Add New Test</label>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-teal-600 transition-colors" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setIsOpen(true); }}
            onFocus={() => setIsOpen(true)}
            placeholder="e.g. Hemoglobin, Vitamin D..."
            className={`${INPUT} pl-11 pr-12`}
          />
          {search && (
            <button 
              onClick={() => setSearch("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {isOpen && (search || filteredMaster.length > 0) && (
          <div className="absolute z-50 mt-2 w-full rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-2 space-y-1">
              {filteredMaster.map(t => {
                const isSelected = !!selectedTests.find(st => st.name === t.name);
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
              
              {search && !filteredMaster.find(t => t.name.toLowerCase() === search.toLowerCase()) && (
                <button
                  onClick={() => { addCustomTest(search); setSearch(""); setIsOpen(false); }}
                  className="flex w-full items-center gap-3 rounded-xl bg-slate-900 px-4 py-3 text-left text-white transition-transform active:scale-[0.98]"
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

      {/* Selected Tests List */}
      <div className="space-y-3 pt-2">
        {selectedTests.map((st, idx) => {
          const master = allMasterTests.find(m => m.name === st.name);
          const isFemale = gender === "FEMALE";
          const min = master ? (isFemale ? master.femaleMin : master.maleMin) : null;
          const max = master ? (isFemale ? master.femaleMax : master.maleMax) : null;
          
          const val = parseFloat(st.value || "");
          const isLow = !isNaN(val) && min !== null && val < min;
          const isHigh = !isNaN(val) && max !== null && val > max;

          return (
            <div key={st.name} className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-teal-200 hover:shadow-md animate-in slide-in-from-left-2 duration-300">
              <div className="flex items-center justify-between gap-4 mb-3">
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-slate-800 truncate">{st.name}</h3>
                  {master && <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{master.category}</p>}
                </div>
                <button 
                  onClick={() => removeTest(st.name)}
                  className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <input
                    type="number" step="0.01" value={st.value || ""}
                    onChange={(e) => updateTestValue(st.name, e.target.value)}
                    placeholder="Value"
                    className={cn(
                      "w-28 rounded-xl border px-3 py-2 text-sm font-bold focus:outline-none focus:ring-4 transition-all",
                      isLow ? "bg-blue-50 border-blue-200 text-blue-700 focus:ring-blue-100" :
                      isHigh ? "bg-red-50 border-red-200 text-red-700 focus:ring-red-100" :
                      "bg-slate-50 border-slate-200 focus:ring-teal-50"
                    )}
                  />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{master?.unit || "—"}</span>
                </div>

                {min !== null && (
                  <div className="flex items-center gap-2">
                    <span className="bg-slate-100 text-slate-500 px-2 py-1 rounded-lg text-[10px] font-bold border border-slate-200">
                      REF: {min}-{max}
                    </span>
                    {isLow && <span className="bg-blue-600 text-white px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter">LOW</span>}
                    {isHigh && <span className="bg-red-600 text-white px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter">HIGH</span>}
                    {!isNaN(val) && !isLow && !isHigh && <span className="bg-green-500 text-white px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter">OK</span>}
                  </div>
                )}
              </div>

              {(isLow || isHigh) && master && (
                <div className={cn(
                  "mt-4 rounded-xl p-3 text-[11px] space-y-2 border animate-in fade-in duration-500",
                  isLow ? "bg-blue-50 border-blue-100 text-blue-800" : "bg-red-50 border-red-100 text-red-800"
                )}>
                  <div className="flex gap-2">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    <p className="leading-relaxed"><strong>Implication:</strong> {isLow ? master.lowImplication : master.highImplication}</p>
                  </div>
                  <div className="flex gap-2 pt-2 border-t border-current/10 font-medium">
                    <Lightbulb className="h-3.5 w-3.5 shrink-0 text-amber-500" />
                    <p className="leading-relaxed"><strong>Advice:</strong> {isLow ? master.lowAdvice : master.highAdvice}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {selectedTests.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-slate-100 rounded-3xl bg-slate-50/30 text-center">
            <div className="p-4 rounded-full bg-white shadow-sm mb-3">
              <FlaskConical className="h-8 w-8 text-slate-200" />
            </div>
            <p className="text-sm font-bold text-slate-400">No tests selected yet</p>
            <p className="text-xs text-slate-300 mt-1 max-w-[200px]">Search for a medical parameter above to record its values</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Step 4 ───────────────────────────────────────────────────────
function Step4Clinical({
  outlets, outletId, setOutletId,
  needsDietPlan, setNeedsDietPlan,
  variationResults, setVariationResults,
  dietPlanNotes, setDietPlanNotes,
  remarks, setRemarks,
  resultReceivedAt, setResultReceivedAt,
  interactionAt, setInteractionAt,
}: {
  outlets: any[];
  outletId: string; setOutletId: (v: string) => void;
  needsDietPlan: string; setNeedsDietPlan: (v: string) => void;
  variationResults: string; setVariationResults: (v: string) => void;
  dietPlanNotes: string; setDietPlanNotes: (v: string) => void;
  remarks: string; setRemarks: (v: string) => void;
  resultReceivedAt: string; setResultReceivedAt: (v: string) => void;
  interactionAt: string; setInteractionAt: (v: string) => void;
}) {
  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <h2 className="text-lg font-bold text-slate-800">Finalization</h2>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={LABEL}>Outlet *</label>
          <select value={outletId} onChange={(e) => setOutletId(e.target.value)} className={INPUT}>
            {outlets.map((o) => (<option key={o.id} value={o.id}>{o.name}</option>))}
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
                  "flex-1 rounded-xl border py-2.5 text-[10px] font-bold uppercase tracking-widest transition-all",
                  needsDietPlan === v
                    ? v === "Yes" ? "bg-red-600 text-white border-red-600" :
                      v === "Maybe" ? "bg-amber-500 text-white border-amber-500" :
                      "bg-green-600 text-white border-green-600"
                    : "bg-white text-slate-400 border-slate-200"
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
          <input type="datetime-local" value={resultReceivedAt} onChange={(e) => setResultReceivedAt(e.target.value)} className={INPUT} />
        </div>
        <div>
          <label className={LABEL}>Interaction *</label>
          <input type="datetime-local" value={interactionAt} onChange={(e) => setInteractionAt(e.target.value)} className={INPUT} />
        </div>
      </div>

      <div>
        <label className={LABEL}>Variation in Results</label>
        <textarea value={variationResults} onChange={(e) => setVariationResults(e.target.value)} rows={2} className={`${INPUT} resize-none`} placeholder="..." />
      </div>
      <div>
        <label className={LABEL}>Dietary Advice</label>
        <textarea value={dietPlanNotes} onChange={(e) => setDietPlanNotes(e.target.value)} rows={2} className={`${INPUT} resize-none`} placeholder="..." />
      </div>
      <div>
        <label className={LABEL}>Remarks</label>
        <textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} rows={2} className={`${INPUT} resize-none`} />
      </div>
    </div>
  );
}

function getBMICategory(bmi: number) {
  if (bmi < 18.5) return "Underweight";
  if (bmi < 25) return "Healthy";
  if (bmi < 30) return "Overweight";
  return "Obese";
}
