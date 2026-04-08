import jsPDF from "jspdf";
import { getLabStatus, getReferenceRange, type Gender } from "./lab-reference-ranges";

type AssessmentData = {
  date: string;
  patientName: string;
  age: number;
  sex: string;
  contactNumber: string;
  occupation?: string | null;
  place?: string | null;
  outletName: string;
  height: number;
  weight: number;
  bmi: number;
  selectedTests: { name: string; value?: string }[];
  variationResults?: string | null;
  dietPlanNotes?: string | null;
  remarks?: string | null;
  needsDietPlan: string;
  resultReceivedAt: string;
  interactionAt: string;
  history?: any[]; // Full clinical history
};

export function generatePatientPDF(data: AssessmentData): jsPDF {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const gender = data.sex.toUpperCase() as Gender;

  // Header bar
  doc.setFillColor(13, 148, 136);
  doc.rect(0, 0, pageWidth, 30, "F");

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("NAMS", 14, 14);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Nutrition Assessment Management System", 14, 22);
  doc.text("Sahakar Smart Clinic", pageWidth - 14, 14, { align: "right" });
  doc.text(`Report Date: ${new Date().toLocaleDateString("en-GB")}`, pageWidth - 14, 22, {
    align: "right",
  });

  let y = 40;

  const sectionHeader = (title: string) => {
    if (y > 260) { doc.addPage(); y = 20; }
    doc.setFillColor(241, 245, 249);
    doc.rect(14, y - 5, pageWidth - 28, 8, "F");
    doc.setTextColor(13, 148, 136);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(title, 18, y);
    y += 10;
  };

  const infoRow = (content: Record<string, string | number>) => {
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(10);
    for (const [key, value] of Object.entries(content)) {
      doc.setFont("helvetica", "bold");
      doc.text(`${key}:`, 20, y);
      doc.setFont("helvetica", "normal");
      doc.text(String(value || "—"), 65, y);
      y += 6;
    }
    y += 4;
  };

  // Patient Info
  sectionHeader("Patient Information");
  infoRow({
    Name: data.patientName.toUpperCase(),
    Age: data.age,
    Sex: data.sex,
    Contact: data.contactNumber,
    Place: (data.place || "—").toUpperCase(),
    Outlet: data.outletName.toUpperCase(),
  });

  // Current Biometrics
  const bmiCategory =
    data.bmi < 18.5 ? "Underweight" :
    data.bmi < 25 ? "Normal" :
    data.bmi < 30 ? "Overweight" : "Obese";

  sectionHeader("Current Biometrics");
  infoRow({
    Height: data.height ? `${data.height} cm` : "N/A",
    Weight: data.weight ? `${data.weight} kg` : "N/A",
    BMI: data.bmi ? `${data.bmi} (${bmiCategory})` : "N/A",
  });

  // Lab Results
  sectionHeader("Clinical Lab Results");
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("Parameter", 20, y);
  doc.text("Value", 70, y);
  doc.text("Reference", 100, y);
  doc.text("Status", 140, y);
  y += 6;
  doc.line(14, y - 4, pageWidth - 14, y - 4);

  data.selectedTests.forEach((st) => {
    // Handle both object {name, value} and legacy string formats
    const testName = typeof st === "string" ? st : st.name;
    const testValue = typeof st === "string" ? undefined : st.value;

    const status = getLabStatus(testValue || "", testName, gender);
    const ref = getReferenceRange(testName, gender);
    
    doc.setFont("helvetica", "bold");
    doc.text(testName, 20, y);
    
    doc.setFont("helvetica", "normal");
    doc.text(testValue || "—", 70, y);
    
    const refText = ref ? `${ref.activeRange.min}-${ref.activeRange.max} ${ref.unit}` : "—";
    doc.text(refText, 100, y);
    if (status.status !== "NORMAL" && status.status !== "NONE") {
      doc.setFont("helvetica", "bold");
      doc.setTextColor(status.status === "HIGH" ? 220 : 0, 0, status.status === "LOW" ? 220 : 0);
      doc.text(status.label, 140, y);
      doc.setTextColor(15, 23, 42);
    } else {
      doc.text(status.label, 140, y);
    }
    y += 6;
    if ((status.status === "HIGH" || status.status === "LOW") && ref) {
      doc.setFontSize(8);
      doc.setFont("helvetica", "italic");
      const desc = status.status === "HIGH" ? ref.highImplication : ref.lowImplication;
      const splitDesc = doc.splitTextToSize(`Note: ${desc}`, pageWidth - 40);
      doc.text(splitDesc, 25, y);
      y += (splitDesc.length * 4) + 2;
      doc.setFontSize(9);
    }
    if (y > 270) { doc.addPage(); y = 20; }
  });

  // History Section
  if (data.history && data.history.length > 1) {
    sectionHeader("Historical Assessments (Phone Linked)");
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("Date", 20, y);
    doc.text("Outlet", 50, y);
    doc.text("BMI", 90, y);
    doc.text("Key Findings", 110, y);
    y += 6;
    doc.line(14, y - 4, pageWidth - 14, y - 4);

    data.history.filter(h => h.id !== (data as any).id).forEach(h => {
      doc.setFont("helvetica", "normal");
      doc.text(new Date(h.date).toLocaleDateString("en-GB"), 20, y);
      doc.text((h.outlet?.name || "—").toUpperCase(), 50, y);
      doc.text(h.bmi?.toFixed(1) || "—", 90, y);
      const tests = Array.isArray(h.selectedTests) ? h.selectedTests.slice(0, 2).map((t: any) => (typeof t === "string" ? t : t.name)).join(", ") : "—";
      doc.text(tests, 110, y);
      y += 6;
      if (y > 270) { doc.addPage(); y = 20; }
    });
    y += 4;
  }

  // Clinical Notes
  sectionHeader("Consultation Notes");
  doc.setFontSize(10);
  const notes = [
    { label: "Observations", value: data.variationResults },
    { label: "Dietary Advice", value: data.dietPlanNotes },
    { label: "Plan Type", value: data.needsDietPlan },
    { label: "Remarks", value: data.remarks },
  ];
  notes.forEach(n => {
    doc.setFont("helvetica", "bold");
    doc.text(`${n.label}:`, 20, y);
    doc.setFont("helvetica", "normal");
    const val = doc.splitTextToSize(String(n.value || "—"), pageWidth - 75);
    doc.text(val, 65, y);
    y += (val.length * 5) + 2;
    if (y > 270) { doc.addPage(); y = 20; }
  });

  // Footer
  doc.setDrawColor(226, 232, 240);
  doc.line(14, 285, pageWidth - 14, 285);
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text("Clinical History Report — Sahakar Smart Clinic", pageWidth / 2, 290, { align: "center" });

  return doc;
}
