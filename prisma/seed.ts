/**
 * Seed script to populate the database with initial data.
 * Run with: npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed.ts
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { LAB_TESTS } from "../src/lib/utils/lab-reference-ranges";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ─── Create Admin User ────────────────────────────────────────
  const adminPassword = await bcrypt.hash("Zabnix@2025", 10);

  const admin = await prisma.user.upsert({
    where: { email: "frpboy12@gmail.com" },
    update: {},
    create: {
      name: "Rahul",
      email: "frpboy12@gmail.com",
      password: adminPassword,
      role: "ADMIN",
    },
  });
  console.log(`✅ Admin created: ${admin.email}`);

  // ─── Create Main Sahakar Admin ────────────────────────────────
  const mainAdminPassword = await bcrypt.hash("Zabnix@2025", 10);
  const mainAdmin = await prisma.user.upsert({
    where: { email: "sahakarsmartclinic@gmail.com" },
    update: {},
    create: {
      name: "Sahakar Admin",
      email: "sahakarsmartclinic@gmail.com",
      password: mainAdminPassword,
      role: "ADMIN",
    },
  });
  console.log(`✅ Main Admin created: ${mainAdmin.email}`);

  // ─── Create Nutritionist User ─────────────────────────────────
  const nutriPassword = await bcrypt.hash("sscdt@2026", 10);

  const nutritionist = await prisma.user.upsert({
    where: { email: "sahakarsmartclinicdt@gmail.com" },
    update: {},
    create: {
      name: "Nifla",
      email: "sahakarsmartclinicdt@gmail.com",
      password: nutriPassword,
      role: "NUTRITIONIST",
    },
  });
  console.log(`✅ Nutritionist created: ${nutritionist.email}`);

  // NOTE: Outlets are managed manually in the UI.
  await prisma.outlet.upsert({
    where: { name: "Legacy/Imported" },
    update: {},
    create: { name: "Legacy/Imported" },
  });

  // ─── Create Master Test List from Clinical Data ────────────────
  console.log("📊 Seeding Master Tests with Clinical Data...");
  
  let testCount = 0;
  for (const test of LAB_TESTS) {
    const maleRange = test.ranges.find(r => r.gender === "MALE") || test.ranges[0];
    const femaleRange = test.ranges.find(r => r.gender === "FEMALE") || test.ranges[0];

    await prisma.masterTest.upsert({
      where: { name: test.name },
      update: {
        category: test.category,
        unit: test.unit,
        description: test.description,
        maleMin: maleRange.min,
        maleMax: maleRange.max,
        femaleMin: femaleRange.min,
        femaleMax: femaleRange.max,
        lowImplication: test.lowImplication,
        highImplication: test.highImplication,
        lowAdvice: test.lowAdvice,
        highAdvice: test.highAdvice,
        procedure: test.procedure,
      },
      create: {
        name: test.name,
        category: test.category,
        isActive: true,
        unit: test.unit,
        description: test.description,
        maleMin: maleRange.min,
        maleMax: maleRange.max,
        femaleMin: femaleRange.min,
        femaleMax: femaleRange.max,
        lowImplication: test.lowImplication,
        highImplication: test.highImplication,
        lowAdvice: test.lowAdvice,
        highAdvice: test.highAdvice,
        procedure: test.procedure,
      },
    });
    testCount++;
  }

  // Add remaining specific tests from original list that don't have rich data yet
  // Abbreviations are EXCLUDED to prevent duplication
  const legacyTests: Record<string, string[]> = {
    "General Health": ["CBC", "ESR", "RBC", "PCV"],
    "Metabolic / Sugar": ["GTT", "Random Blood Sugar"],
    "Organ Function": ["LFT", "RFT", "Lipid Profile", "SGOT", "Albumin (Serum)"],
    "Vitamins & Minerals": ["Iron Studies", "Calcium", "Zinc"],
    "Urine": ["Urine Albumin", "Urine Creatinine", "Albumin Creatinine Ratio", "Urine Routine", "Urine Culture"],
    "Cardiac": ["Troponin", "BNP", "D-Dimer", "CRP", "Homocysteine"],
  };

  for (const [category, tests] of Object.entries(legacyTests)) {
    for (const testName of tests) {
      const existing = await prisma.masterTest.findUnique({ where: { name: testName } });
      if (!existing) {
        await prisma.masterTest.create({
          data: {
            name: testName,
            category,
            isActive: true,
          }
        });
        testCount++;
      }
    }
  }

  console.log(`✅ Total unique tests seeded: ${testCount}`);
  console.log("\n🎉 Seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
