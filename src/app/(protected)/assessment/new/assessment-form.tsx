"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { lookupPatientByPhone, createOrUpdatePatient } from "@/lib/actions/patients";
import { createAssessment } from "@/lib/actions/assessments";
import { calculateBMI, getBMICategory, getBMIColor } from "@/lib/utils/bmi-calculator";
import { getReferenceRange, getLabStatus, type Gender } from "@/lib/utils/lab-reference-ranges";
import { User, Activity, FlaskConical, ClipboardList, ChevronRight, ChevronLeft, Check, Info, AlertCircle, Lightbulb } from "lucide-react";
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
    id: string; name: string; age: number; sex: string; occupation: string | null; place: string;
  } | null>(null);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [sex, setSex] = useState("MALE");
  const [occupation, setOccupation] = useState("");
  const [place, setPlace] = useState("");

  // Step 2
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const bmi = calculateBMI(Number(height) || 0, Number(weight) || 0);

  // Step 3
  const [selectedTests, setSelectedTests] = useState<{ name: string; value?: string }[]>([]);
  const toggleTest = (testName: string) => {
    setSelectedTests((prev) =>
      prev.find((t) => t.name === testName)
        ? prev.filter((t) => t.name !== testName)
        : [...prev, { name: testName, value: "" }]
    );
  };
  const updateTestValue = (testName: string, value: string) => {
    setSelectedTests((prev) =>
      prev.map((t) => (t.name === testName ? { ...t, value } : t))
    );
  };
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>(
    Object.fromEntries(Object.keys(testsByCategory).map((k) => [k, true]))
  );

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
      setPlace(p.place);
    } else {
      setExistingPatient(null);
    }
  }, [phone]);

  useEffect(() => {
    if (phone.length === 10) lookupPatient();
  }, [phone, lookupPatient]);

  const canProceed = () => {
    if (step === 0) return phone.length === 10 && name.trim() && age && place.trim();
    if (step === 1) return Number(height) > 0 && Number(weight) > 0;
    if (step === 2) return selectedTests.length > 0;
    if (step === 3) return !!outletId && !!resultReceivedAt && !!interactionAt;
    return false;
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    const patient = await createOrUpdatePatient({
      contactNumber: phone,
      name: name.trim(),
      age: parseInt(age),
      sex,
      occupation: occupation || undefined,
      place: place.trim(),
    });
    const result = await createAssessment({
      patientId: patient.id,
      outletId,
      height: Number(height),
      weight: Number(weight),
      selectedTests,
      needsDietPlan,
      variationResults: variationResults || undefined,
      dietPlanNotes: dietPlanNotes || undefined,
      remarks: remarks || undefined,
      resultReceivedAt: new Date(resultReceivedAt),
      interactionAt: new Date(interactionAt),
    });
    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      router.push("/");
      router.refresh();
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
                <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-all ${
                  done
                    ? "bg-teal-600 text-white"
                    : active
                      ? "bg-teal-600 text-white ring-4 ring-teal-100"
                      : "bg-slate-100 text-slate-400"
                }`}>
                  {done ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                </div>
                <span className={`mt-1 text-xs font-medium ${active ? "text-teal-700" : done ? "text-slate-600" : "text-slate-400"}`}>
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`mb-5 h-0.5 flex-1 transition-all ${i < step ? "bg-teal-600" : "bg-slate-200"}`} />
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
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
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
            testsByCategory={testsByCategory}
            selectedTests={selectedTests}
            toggleTest={toggleTest}
            updateTestValue={updateTestValue}
            openCategories={openCategories}
            setOpenCategories={setOpenCategories}
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
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </button>
        {step < 3 ? (
          <button
            onClick={() => canProceed() && setStep((s) => s + 1)}
            disabled={!canProceed()}
            className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={!canProceed() || loading}
            className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Check className="h-4 w-4" />
            {loading ? "Submitting…" : "Submit Assessment"}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Shared input class ───────────────────────────────────────────
const INPUT = "w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white";
const LABEL = "block text-xs font-semibold uppercase tracking-wide text-slate-500";

// ─── Step 1 ───────────────────────────────────────────────────────
function Step1Patient({
  phone, setPhone, lookingUp, existingPatient,
  name, setName, age, setAge, sex, setSex, occupation, setOccupation, place, setPlace,
}: {
  phone: string; setPhone: (v: string) => void;
  lookingUp: boolean; existingPatient: { id: string } | null;
  name: string; setName: (v: string) => void;
  age: string; setAge: (v: string) => void;
  sex: string; setSex: (v: string) => void;
  occupation: string; setOccupation: (v: string) => void;
  place: string; setPlace: (v: string) => void;
}) {
  return (
    <div className="space-y-5">
      <h2 className="text-base font-semibold text-slate-800">Who is the patient?</h2>

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
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">Searching…</span>
            )}
            {existingPatient && !lookingUp && (
              <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">Returning ✓</span>
            )}
            {phone.length === 10 && !existingPatient && !lookingUp && (
              <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">New Patient</span>
            )}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={LABEL}>Full Name *</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={`mt-1.5 ${INPUT}`} placeholder="Patient name" />
        </div>
        <div>
          <label className={LABEL}>Age *</label>
          <input type="number" value={age} onChange={(e) => setAge(e.target.value)} min={1} max={150} className={`mt-1.5 ${INPUT}`} placeholder="Years" />
        </div>
      </div>

      <div>
        <label className={LABEL}>Sex *</label>
        <div className="mt-2 flex gap-2">
          {["MALE", "FEMALE", "OTHER"].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSex(s)}
              className={`flex-1 rounded-lg border py-2 text-xs font-semibold transition ${
                sex === s
                  ? "border-teal-600 bg-teal-50 text-teal-700"
                  : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
              }`}
            >
              {s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={LABEL}>Occupation</label>
          <input type="text" value={occupation} onChange={(e) => setOccupation(e.target.value)} className={`mt-1.5 ${INPUT}`} placeholder="Optional" />
        </div>
        <div>
          <label className={LABEL}>Place *</label>
          <input type="text" value={place} onChange={(e) => setPlace(e.target.value)} className={`mt-1.5 ${INPUT}`} placeholder="Home area" />
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
  bmi: number;
}) {
  const category = bmi > 0 ? getBMICategory(bmi) : null;
  const colorClass = bmi > 0 ? getBMIColor(bmi) : "";
  const bgClass =
    bmi <= 0 ? "border-slate-200 bg-slate-50"
    : bmi < 18.5 ? "border-blue-200 bg-blue-50"
    : bmi < 25 ? "border-green-200 bg-green-50"
    : bmi < 30 ? "border-amber-200 bg-amber-50"
    : "border-red-200 bg-red-50";

  return (
    <div className="space-y-5">
      <h2 className="text-base font-semibold text-slate-800">Vitals & Measurements</h2>
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className={LABEL}>Height (cm) *</label>
            <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} min={0}
              className={`mt-1.5 ${INPUT} text-lg`} placeholder="e.g. 165" />
          </div>
          <div>
            <label className={LABEL}>Weight (kg) *</label>
            <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} min={0} step="0.1"
              className={`mt-1.5 ${INPUT} text-lg`} placeholder="e.g. 62" />
          </div>
        </div>

        <div className={`flex flex-col items-center justify-center rounded-xl border-2 p-6 transition-all ${bgClass}`}>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">BMI</p>
          {bmi > 0 ? (
            <>
              <p className={`mt-1 text-5xl font-bold tabular-nums ${colorClass}`}>{bmi.toFixed(1)}</p>
              <p className={`mt-1 text-sm font-semibold ${colorClass}`}>{category}</p>
            </>
          ) : (
            <p className="mt-2 text-4xl font-bold text-slate-300">—</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Step 3 ───────────────────────────────────────────────────────
function Step3Tests({
  testsByCategory, selectedTests, toggleTest, updateTestValue, openCategories, setOpenCategories, gender,
}: {
  testsByCategory: Record<string, MasterTest[]>;
  selectedTests: { name: string; value?: string }[];
  toggleTest: (name: string) => void;
  updateTestValue: (name: string, value: string) => void;
  openCategories: Record<string, boolean>;
  setOpenCategories: (fn: (prev: Record<string, boolean>) => Record<string, boolean>) => void;
  gender: Gender;
}) {
  const [showInfo, setShowInfo] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-800">Medical Tests Conducted</h2>
        <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
          {selectedTests.length} selected
        </span>
      </div>

      <div className="space-y-2">
        {Object.entries(testsByCategory)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([category, tests]) => {
            const activeTests = tests.filter((t) => t.isActive);
            const selectedInCat = activeTests.filter((t) => selectedTests.find(st => st.name === t.name)).length;
            return (
              <div key={category} className="overflow-hidden rounded-lg border border-slate-200">
                <button
                  type="button"
                  onClick={() =>
                    setOpenCategories((prev) => ({ ...prev, [category]: !prev[category] }))
                  }
                  className="flex w-full items-center justify-between bg-slate-50 px-4 py-3 text-left transition hover:bg-slate-100"
                >
                  <span className="text-sm font-semibold text-slate-700">{category}</span>
                  <div className="flex items-center gap-2">
                    {selectedInCat > 0 && (
                      <span className="rounded-full bg-teal-100 px-2 py-0.5 text-xs font-medium text-teal-700">
                        {selectedInCat}
                      </span>
                    )}
                    <span className="text-slate-400">{openCategories[category] ? "▾" : "▸"}</span>
                  </div>
                </button>
                {openCategories[category] && (
                  <div className="border-t border-slate-100 px-4 py-3">
                    <div className="space-y-4">
                      {activeTests.map((test) => {
                        const selected = selectedTests.find(st => st.name === test.name);
                        const isFemale = gender === "FEMALE";
                        const min = isFemale ? test.femaleMin : test.maleMin;
                        const max = isFemale ? test.femaleMax : test.maleMax;
                        
                        const val = parseFloat(selected?.value || "");
                        const isLow = !isNaN(val) && min !== null && val < min;
                        const isHigh = !isNaN(val) && max !== null && val > max;

                        return (
                          <div key={test.id} className="space-y-2">
                            <div className="flex items-center justify-between group">
                              <label className="flex cursor-pointer items-center gap-2.5 rounded py-1 flex-1">
                                <input
                                  type="checkbox"
                                  checked={!!selected}
                                  onChange={() => toggleTest(test.name)}
                                  className="h-4 w-4 rounded border-slate-300 text-teal-600 accent-teal-600"
                                />
                                <span className="text-sm font-medium text-slate-700">{test.name}</span>
                              </label>
                              <button
                                type="button"
                                onClick={() => setShowInfo(showInfo === test.id ? null : test.id)}
                                className="p-1 text-slate-400 hover:text-teal-600 transition-colors"
                              >
                                <Info className="h-4 w-4" />
                              </button>
                            </div>

                            {selected && (
                              <div className="ml-7 space-y-3">
                                <div className="flex flex-wrap items-center gap-3">
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="number"
                                      step="0.01"
                                      value={selected.value || ""}
                                      onChange={(e) => updateTestValue(test.name, e.target.value)}
                                      placeholder="Value"
                                      className={cn(
                                        "w-24 rounded-md border px-2 py-1 text-sm bg-white focus:outline-none focus:ring-2",
                                        isLow ? "border-blue-300 focus:ring-blue-100" : 
                                        isHigh ? "border-red-300 focus:ring-red-100" : 
                                        "border-slate-200 focus:ring-teal-100"
                                      )}
                                    />
                                    <span className="text-xs text-slate-400 font-bold">{test.unit || "—"}</span>
                                  </div>
                                  
                                  {min !== null && max !== null && (
                                    <div className="flex items-center gap-2 text-[11px] font-bold">
                                      <span className="text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">Ref: {min}-{max}</span>
                                      {isLow && <span className="text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded flex items-center gap-1"><AlertCircle className="h-3 w-3" /> LOW</span>}
                                      {isHigh && <span className="text-red-600 bg-red-50 px-1.5 py-0.5 rounded flex items-center gap-1"><AlertCircle className="h-3 w-3" /> HIGH</span>}
                                      {!isNaN(val) && !isLow && !isHigh && <span className="text-green-600 bg-green-50 px-1.5 py-0.5 rounded">NORMAL</span>}
                                    </div>
                                  )}
                                </div>

                                {(isLow || isHigh) && (
                                  <div className={cn(
                                    "rounded-lg p-3 text-xs space-y-2 border animate-in fade-in slide-in-from-top-1 duration-200",
                                    isLow ? "bg-blue-50/50 border-blue-100 text-blue-800" : "bg-red-50/50 border-red-100 text-red-800"
                                  )}>
                                    <div className="flex gap-2">
                                      <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                                      <div>
                                        <p className="font-bold uppercase tracking-wider text-[10px] mb-0.5">Clinical Implication</p>
                                        <p>{isLow ? test.lowImplication : test.highImplication || "Result is outside normal range."}</p>
                                      </div>
                                    </div>
                                    <div className="flex gap-2 pt-2 border-t border-current/10">
                                      <Lightbulb className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                                      <div>
                                        <p className="font-bold uppercase tracking-wider text-[10px] mb-0.5">Management Advice</p>
                                        <p>{isLow ? test.lowAdvice : test.highAdvice || "Please consult a medical professional."}</p>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}

                            {showInfo === test.id && (
                              <div className="ml-7 rounded-xl bg-slate-900 text-white p-4 text-xs space-y-3 shadow-xl animate-in zoom-in-95 duration-200">
                                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                                  <span className="font-bold uppercase tracking-widest text-slate-400">About {test.name}</span>
                                  <button onClick={() => setShowInfo(null)}><X className="h-3 w-3" /></button>
                                </div>
                                <p className="leading-relaxed opacity-90 italic">&quot;{test.description || "No detailed description available."}&quot;</p>
                                {test.procedure && (
                                  <div className="pt-2">
                                    <p className="font-bold text-teal-400 mb-1 uppercase tracking-tighter">Collection Procedure</p>
                                    <p className="opacity-80">{test.procedure}</p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
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
  outlets: { id: string; name: string }[];
  outletId: string; setOutletId: (v: string) => void;
  needsDietPlan: string; setNeedsDietPlan: (v: string) => void;
  variationResults: string; setVariationResults: (v: string) => void;
  dietPlanNotes: string; setDietPlanNotes: (v: string) => void;
  remarks: string; setRemarks: (v: string) => void;
  resultReceivedAt: string; setResultReceivedAt: (v: string) => void;
  interactionAt: string; setInteractionAt: (v: string) => void;
}) {
  return (
    <div className="space-y-5">
      <h2 className="text-base font-semibold text-slate-800">Diet Plan & Remarks</h2>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={LABEL}>Outlet *</label>
          <select value={outletId} onChange={(e) => setOutletId(e.target.value)} className={`mt-1.5 ${INPUT}`}>
            {outlets.map((o) => (<option key={o.id} value={o.id}>{o.name}</option>))}
          </select>
        </div>
        <div>
          <label className={LABEL}>Needs Diet Plan? *</label>
          <div className="mt-2 flex gap-2">
            {["Yes", "No", "Maybe"].map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setNeedsDietPlan(v)}
                className={`flex-1 rounded-lg border py-2 text-xs font-semibold transition ${
                  needsDietPlan === v
                    ? v === "Yes"
                      ? "border-red-400 bg-red-50 text-red-700"
                      : v === "Maybe"
                        ? "border-amber-400 bg-amber-50 text-amber-700"
                        : "border-green-400 bg-green-50 text-green-700"
                    : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                }`}
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
          <input type="datetime-local" value={resultReceivedAt} onChange={(e) => setResultReceivedAt(e.target.value)}
            className={`mt-1.5 ${INPUT}`} />
        </div>
        <div>
          <label className={LABEL}>Patient Interaction *</label>
          <input type="datetime-local" value={interactionAt} onChange={(e) => setInteractionAt(e.target.value)}
            className={`mt-1.5 ${INPUT}`} />
        </div>
      </div>

      <div>
        <label className={LABEL}>Variation in Results</label>
        <textarea value={variationResults} onChange={(e) => setVariationResults(e.target.value)} rows={2}
          className={`mt-1.5 ${INPUT} resize-none`} placeholder="Describe any abnormalities…" />
      </div>
      <div>
        <label className={LABEL}>Dietary Advice</label>
        <textarea value={dietPlanNotes} onChange={(e) => setDietPlanNotes(e.target.value)} rows={2}
          className={`mt-1.5 ${INPUT} resize-none`} placeholder="Recommended food changes…" />
      </div>
      <div>
        <label className={LABEL}>Remarks</label>
        <textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} rows={2}
          className={`mt-1.5 ${INPUT} resize-none`} />
      </div>
    </div>
  );
}
