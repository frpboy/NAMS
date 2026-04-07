import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient();

async function importLegacyData() {
  console.log("Reading JSON file...");
  const rawData = fs.readFileSync('NAMS_Import_File.json', 'utf8');
  const records = JSON.parse(rawData);

  console.log(`Starting import of ${records.length} records...`);

  for (const item of records) {
    try {
      // 1. Handle Patient (Upsert ensures no duplicates)
      const patient = await prisma.patient.upsert({
        where: { contactNumber: item.patient.contactNumber },
        update: {
          age: item.patient.age,
          place: item.patient.place,
          occupation: item.patient.occupation
        },
        create: {
          name: item.patient.name,
          age: item.patient.age,
          sex: item.patient.sex,
          contactNumber: item.patient.contactNumber,
          place: item.patient.place,
          occupation: item.patient.occupation
        }
      });

      // 2. Handle Assessment
      await prisma.assessment.create({
        data: {
          date: new Date(item.assessment.date),
          patientId: patient.id,
          outletId: item.assessment.outletId,
          height: item.assessment.height,
          weight: item.assessment.weight,
          bmi: item.assessment.bmi,
          selectedTests: item.assessment.selectedTests,
          variationResults: item.assessment.variationResults,
          dietPlanNotes: item.assessment.dietPlanNotes,
          needsDietPlan: item.assessment.needsDietPlan,
          remarks: item.assessment.remarks,
          resultReceivedAt: new Date(item.assessment.resultReceivedAt),
          interactionAt: new Date(item.assessment.interactionAt),
          createdAt: new Date(item.timestamp), // Use spreadsheet timestamp
          updatedAt: new Date(item.timestamp)
        }
      });

      console.log(`✅ Imported: ${item.patient.name}`);
    } catch (err) {
      console.error(`❌ Error importing ${item.patient.name}:`, err);
    }
  }

  console.log("Import finished!");
}

importLegacyData()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());