import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import path from "path";

const prisma = new PrismaClient();

async function importLegacyData() {
  const filePath = path.join(process.cwd(), "NAMS_Import_File.json");
  
  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    return;
  }

  console.log("Reading JSON file...");
  const rawData = fs.readFileSync(filePath, "utf8");
  const records = JSON.parse(rawData);

  console.log(`Starting import of ${records.length} records...`);

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < records.length; i++) {
    const item = records[i];
    try {
      // 1. Handle Contact Number (Must be unique and 10 digits in schema)
      // If empty, generate a unique dummy number starting with 000
      let contactNumber = item.patient.contactNumber.replace(/\D/g, "");
      if (!contactNumber || contactNumber === "") {
        contactNumber = `000${String(i).padStart(7, "0")}`;
      } else if (contactNumber.length < 10) {
        contactNumber = contactNumber.padStart(10, "0");
      }

      // 2. Handle Patient (Upsert ensures no duplicates by contactNumber)
      const patient = await prisma.patient.upsert({
        where: { contactNumber },
        update: {
          age: item.patient.age || 0,
          place: item.patient.place === "." ? "Unknown" : item.patient.place,
          occupation: item.patient.occupation === "." ? null : item.patient.occupation,
        },
        create: {
          name: item.patient.name || "Unknown",
          age: item.patient.age || 0,
          sex: ["MALE", "FEMALE", "OTHER"].includes(item.patient.sex) ? item.patient.sex : "OTHER",
          contactNumber,
          place: item.patient.place === "." ? "Unknown" : item.patient.place,
          occupation: item.patient.occupation === "." ? null : item.patient.occupation,
        },
      });

      // 3. Transform selectedTests from string[] to { name: string, value?: string }[]
      const transformedTests = Array.isArray(item.assessment.selectedTests)
        ? item.assessment.selectedTests.map((t: string) => ({ name: t, value: "" }))
        : [];

      // 4. Handle Assessment
      await prisma.assessment.create({
        data: {
          date: new Date(item.assessment.date),
          patientId: patient.id,
          outletId: item.assessment.outletId,
          height: item.assessment.height || 0,
          weight: item.assessment.weight || 0,
          bmi: item.assessment.bmi || 0,
          selectedTests: transformedTests as any,
          variationResults: item.assessment.variationResults === "." ? null : item.assessment.variationResults,
          dietPlanNotes: item.assessment.dietPlanNotes === "." ? null : item.assessment.dietPlanNotes,
          needsDietPlan: item.assessment.needsDietPlan === "NO" ? "No" : (item.assessment.needsDietPlan === "YES" ? "Yes" : "Maybe"),
          remarks: item.assessment.remarks === "." ? null : item.assessment.remarks,
          resultReceivedAt: new Date(item.assessment.resultReceivedAt),
          interactionAt: new Date(item.assessment.interactionAt),
          createdAt: new Date(item.timestamp),
          updatedAt: new Date(item.timestamp),
        },
      });

      successCount++;
      if (successCount % 10 === 0) {
        console.log(`✅ Progress: ${successCount}/${records.length}`);
      }
    } catch (err) {
      errorCount++;
      console.error(`❌ Error importing record ${i} (${item.patient.name}):`, err);
    }
  }

  console.log("\n--- Import Summary ---");
  console.log(`Total Records: ${records.length}`);
  console.log(`Successfully Imported: ${successCount}`);
  console.log(`Errors: ${errorCount}`);
  console.log("----------------------\n");
}

importLegacyData()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
