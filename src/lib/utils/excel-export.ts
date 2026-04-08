import ExcelJS from "exceljs";
import type { Assessment, Patient, Outlet } from "@prisma/client";

type AssessmentWithRelations = Assessment & {
  patient: Pick<Patient, "name" | "contactNumber" | "age" | "sex">;
  outlet: Pick<Outlet, "name">;
};

export async function exportToExcel(
  assessments: AssessmentWithRelations[],
  filename: string = "nams-export"
) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Assessments");

  // Headers
  worksheet.columns = [
    { header: "Date", key: "date", width: 15 },
    { header: "Patient Name", key: "patientName", width: 20 },
    { header: "Contact", key: "contactNumber", width: 15 },
    { header: "Age", key: "age", width: 8 },
    { header: "Sex", key: "sex", width: 8 },
    { header: "Outlet", key: "outlet", width: 20 },
    { header: "Height (cm)", key: "height", width: 12 },
    { header: "Weight (kg)", key: "weight", width: 12 },
    { header: "BMI", key: "bmi", width: 10 },
    { header: "Tests Conducted", key: "testsConducted", width: 40 },
    { header: "Variation", key: "variationResults", width: 30 },
    { header: "Diet Plan", key: "dietPlanNotes", width: 30 },
    { header: "Needs Diet Plan", key: "needsDietPlan", width: 15 },
    { header: "Remarks", key: "remarks", width: 30 },
    { header: "Result Received", key: "resultReceivedAt", width: 15 },
    { header: "Interaction At", key: "interactionAt", width: 15 },
  ];

  // Style header
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF0D9488" },
  };
  worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };

  // Add rows
  for (const a of assessments) {
    worksheet.addRow({
      date: formatDate(a.date),
      patientName: a.patient.name.toUpperCase(),
      contactNumber: a.patient.contactNumber,
      age: a.patient.age,
      sex: a.patient.sex,
      outlet: a.outlet.name.toUpperCase(),
      height: a.height || "N/A",
      weight: a.weight || "N/A",
      bmi: a.bmi || "N/A",
      testsConducted: Array.isArray(a.selectedTests)
        ? a.selectedTests
            .map((t: any) => {
              const name = typeof t === "string" ? t : t.name;
              const value = typeof t === "string" ? undefined : t.value;
              return `${name}${value ? `: ${value}` : ""}`;
            })
            .join(", ")
        : "",
      variationResults: a.variationResults || "",
      dietPlanNotes: a.dietPlanNotes || "",
      needsDietPlan: a.needsDietPlan,
      remarks: a.remarks || "",
      resultReceivedAt: formatDate(a.resultReceivedAt),
      interactionAt: formatDate(a.interactionAt),
    });
  }

  // Conditional formatting for BMI
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const bmiCell = row.getCell("bmi");
    const bmiValue = Number(bmiCell.value);
    if (bmiValue >= 25 && bmiValue < 30) {
      bmiCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFFFF3CD" },
      };
    } else if (bmiValue >= 30) {
      bmiCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFFEE2E2" },
      };
    } else if (bmiValue >= 18.5 && bmiValue < 25) {
      bmiCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFDCFCE7" },
      };
    }
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return { buffer, filename: `${filename}-${new Date().toISOString().slice(0, 10)}.xlsx` };
}

function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("en-GB");
}
