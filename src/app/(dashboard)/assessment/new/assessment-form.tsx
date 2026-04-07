"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { lookupPatientByPhone, createOrUpdatePatient } from "@/lib/actions/patients";
import { createAssessment } from "@/lib/actions/assessments";
import { calculateBMI, getBMICategory, getBMIColor } from "@/lib/utils/bmi-calculator";
import type { Outlet, MasterTest } from "@prisma/client";

type Props = {
  outlets: (Outlet & { _count: { assessments: number } })[];
  testsByCategory: Record<string, MasterTest[]>;
  mode: "create";
};

const STEPS = ["Patient Identity", "Vitals & BMI", "Lab Tests", "Clinical Summary"];

export default function AssessmentForm({ outlets, testsByCategory }: Props) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Step 1: Patient
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

  // Step 2: Vitals
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const bmi = calculateBMI(Number(height) || 0, Number(weight) || 0);

  // Step 3: Tests
  const [selectedTests, setSelectedTests] = useState<string[]>([]);
  const toggleTest = (test: string) => {
    setSelectedTests((prev) =>
      prev.includes(test) ? prev.filter((t) => t !== test) : [...prev, test]
    );
  };
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>(
    Object.fromEntries(Object.keys(testsByCategory).map((k) => [k, true]))
  );

  // Step 4: Clinical
  const [outletId, setOutletId] = useState(outlets[0]?.id || "");
  const [needsDietPlan, setNeedsDietPlan] = useState("No");
  const [variationResults, setVariationResults] = useState("");
  const [dietPlanNotes, setDietPlanNotes] = useState("");
  const [remarks, setRemarks] = useState("");
  const [resultReceivedAt, setResultReceivedAt] = useState("");
  const [interactionAt, setInteractionAt] = useState("");

  // Patient lookup
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
    if (phone.length === 10) {
      lookupPatient();
    }
  }, [phone, lookupPatient]);

  // Validation per step
  const canProceed = () => {
    if (step === 0) return phone.length === 10 && name.trim() && age && place.trim();
    if (step === 1) return Number(height) > 0 && Number(weight) > 0;
    if (step === 2) return selectedTests.length > 0;
    if (step === 3) return outletId && resultReceivedAt && interactionAt;
    return false;
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    // Create/update patient first
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
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">New Assessment</h1>
        <p className="text-muted-foreground">Step {step + 1} of 4: {STEPS[step]}</p>
      </div>

      {/* Step indicators */}
      <div className="flex gap-2">
        {STEPS.map((s, i) => (
          <div key={s} className="flex-1">
            <div className={`h-1.5 rounded-full ${i <= step ? "bg-primary" : "bg-muted"}`} />
            <p className={`mt-1 text-center text-xs ${i <= step ? "text-primary font-medium" : "text-muted-foreground"}`}>
              {s}
            </p>
          </div>
        ))}
      </div>

      {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</div>}

      {/* Step content */}
      <div className="rounded-lg border border-border bg-white p-6 space-y-4">
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
          <Step2Vitals
            height={height} setHeight={setHeight}
            weight={weight} setWeight={setWeight}
            bmi={bmi}
          />
        )}
        {step === 2 && (
          <Step3Tests
            testsByCategory={testsByCategory}
            selectedTests={selectedTests}
            toggleTest={toggleTest}
            openCategories={openCategories}
            setOpenCategories={setOpenCategories}
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
          className="rounded-md border border-border px-5 py-2 text-sm font-medium transition hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ← Back
        </button>
        {step < 3 ? (
          <button
            onClick={() => canProceed() && setStep((s) => s + 1)}
            disabled={!canProceed()}
            className="rounded-md bg-primary px-5 py-2 text-sm font-medium text-white transition hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next →
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={!canProceed() || loading}
            className="rounded-md bg-green-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Submitting..." : "Submit Assessment"}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Step 1: Patient Identity ─────────────────────────────────────

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
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Who is the Patient?</h2>

      <div>
        <label className="block text-sm font-medium">Contact Number (10 digits) *</label>
        <div className="relative mt-1">
          <input
            type="tel" maxLength={10} value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
            className="w-full rounded-md border border-border px-3 py-2 text-lg font-mono focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="Enter phone number"
          />
          {lookingUp && <span className="absolute right-3 top-2.5 text-sm text-muted-foreground">Searching...</span>}
          {existingPatient && !lookingUp && (
            <span className="absolute right-3 top-2.5 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">Returning Patient</span>
          )}
          {phone.length === 10 && !existingPatient && !lookingUp && (
            <span className="absolute right-3 top-2.5 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">New Patient</span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">Name *</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required
            className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium">Age *</label>
          <input type="number" value={age} onChange={(e) => setAge(e.target.value)} required min={1} max={150}
            className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium">Sex *</label>
        <div className="mt-1 flex gap-4">
          {["MALE", "FEMALE", "OTHER"].map((s) => (
            <label key={s} className="flex items-center gap-2">
              <input type="radio" name="sex" value={s} checked={sex === s} onChange={() => setSex(s)} />
              <span className="text-sm">{s}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">Occupation</label>
          <input type="text" value={occupation} onChange={(e) => setOccupation(e.target.value)}
            className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium">Place *</label>
          <input type="text" value={place} onChange={(e) => setPlace(e.target.value)} required
            className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none" />
        </div>
      </div>
    </div>
  );
}

// ─── Step 2: Vitals & BMI ─────────────────────────────────────────

function Step2Vitals({
  height, setHeight, weight, setWeight, bmi,
}: {
  height: string; setHeight: (v: string) => void;
  weight: string; setWeight: (v: string) => void;
  bmi: number;
}) {
  const category = bmi > 0 ? getBMICategory(bmi) : null;
  const colorClass = bmi > 0 ? getBMIColor(bmi) : "";

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Vitals & Measurements</h2>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Height (cm) *</label>
            <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} required min={0}
              className="mt-1 w-full rounded-md border border-border px-3 py-2 text-lg focus:border-primary focus:outline-none"
              placeholder="e.g., 170" />
          </div>
          <div>
            <label className="block text-sm font-medium">Weight (kg) *</label>
            <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} required min={0} step="0.1"
              className="mt-1 w-full rounded-md border border-border px-3 py-2 text-lg focus:border-primary focus:outline-none"
              placeholder="e.g., 70" />
          </div>
        </div>

        {/* BMI Display */}
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6">
          <p className="text-sm text-muted-foreground">BMI</p>
          {bmi > 0 ? (
            <>
              <p className={`mt-1 text-4xl font-bold ${colorClass}`}>{bmi.toFixed(1)}</p>
              <p className={`mt-1 text-sm font-medium ${colorClass}`}>{category}</p>
            </>
          ) : (
            <p className="mt-1 text-4xl font-bold text-muted-foreground">—</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Step 3: Lab Tests ────────────────────────────────────────────

function Step3Tests({
  testsByCategory, selectedTests, toggleTest, openCategories, setOpenCategories,
}: {
  testsByCategory: Record<string, { id: string; name: string; category: string; isActive: boolean }[]>;
  selectedTests: string[];
  toggleTest: (name: string) => void;
  openCategories: Record<string, boolean>;
  setOpenCategories: (fn: (prev: Record<string, boolean>) => Record<string, boolean>) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Medical Tests Conducted</h2>
        <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
          {selectedTests.length} selected
        </span>
      </div>

      {Object.entries(testsByCategory)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([category, tests]) => (
          <div key={category} className="rounded-lg border border-border">
            <button
              onClick={() =>
                setOpenCategories((prev: Record<string, boolean>) => ({
                  ...prev,
                  [category]: !prev[category],
                }))
              }
              className="flex w-full items-center justify-between px-4 py-3 text-left font-medium hover:bg-muted/50"
            >
              <span>{category}</span>
              <span className="text-muted-foreground">{openCategories[category] ? "▾" : "▸"}</span>
            </button>
            {openCategories[category] && (
              <div className="border-t border-border px-4 py-3">
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3">
                  {tests.filter((t) => t.isActive).map((test) => (
                    <label key={test.id} className="flex items-center gap-2 py-1">
                      <input
                        type="checkbox"
                        checked={selectedTests.includes(test.name)}
                        onChange={() => toggleTest(test.name)}
                        className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                      />
                      <span className="text-sm">{test.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
    </div>
  );
}

// ─── Step 4: Clinical Summary ─────────────────────────────────────

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
  const now = new Date().toISOString().slice(0, 16);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Diet Plan & Remarks</h2>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">Outlet *</label>
          <select value={outletId} onChange={(e) => setOutletId(e.target.value)} required
            className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none">
            {outlets.map((o) => (<option key={o.id} value={o.id}>{o.name}</option>))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">Needs Diet Plan? *</label>
          <div className="mt-2 flex gap-4">
            {["Yes", "No", "Maybe"].map((v) => (
              <label key={v} className="flex items-center gap-1.5">
                <input type="radio" name="dietPlan" value={v} checked={needsDietPlan === v} onChange={() => setNeedsDietPlan(v)} />
                <span className="text-sm">{v}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">Result Received *</label>
          <input type="datetime-local" value={resultReceivedAt} onChange={(e) => setResultReceivedAt(e.target.value)} required
            className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium">Patient Interaction *</label>
          <input type="datetime-local" value={interactionAt || now} onChange={(e) => setInteractionAt(e.target.value)} required
            className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium">Variation in Results</label>
        <textarea value={variationResults} onChange={(e) => setVariationResults(e.target.value)} rows={2}
          className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
          placeholder="Describe any abnormalities..." />
      </div>

      <div>
        <label className="block text-sm font-medium">Dietary Advice</label>
        <textarea value={dietPlanNotes} onChange={(e) => setDietPlanNotes(e.target.value)} rows={2}
          className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
          placeholder="Recommended food changes..." />
      </div>

      <div>
        <label className="block text-sm font-medium">Remarks</label>
        <textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} rows={2}
          className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none" />
      </div>
    </div>
  );
}
