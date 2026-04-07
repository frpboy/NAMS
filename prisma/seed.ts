/**
 * Seed script to populate the database with initial data.
 * Run with: npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed.ts
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

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

  // ─── Create Sahakar Smart Clinic Outlets ──────────────────────
  const outletNames = [
    "Makkaraparamba",
    "Manjeri",
    "Calicut",
    "Malappuram",
    "Kondotty",
  ];

  const outlets = [];
  for (const name of outletNames) {
    const outlet = await prisma.outlet.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    outlets.push(outlet);
    console.log(`✅ Outlet created: ${outlet.name}`);
  }

  // ─── Create Legacy/Imported Outlet ────────────────────────────
  const legacyOutlet = await prisma.outlet.upsert({
    where: { name: "Legacy/Imported" },
    update: {},
    create: { name: "Legacy/Imported" },
  });
  console.log(`✅ Legacy outlet created: ${legacyOutlet.name}`);

  // ─── Create Master Test List ──────────────────────────────────
  const testCategories: Record<string, string[]> = {
    "General Health": [
      "CBC",
      "ESR",
      "HB",
      "RBC",
      "WBC",
      "Platelet Count",
      "PCV",
    ],
    "Metabolic / Sugar": [
      "FBS",
      "PPBS",
      "HBA1C",
      "GTT",
      "Random Blood Sugar",
    ],
    "Organ Function": [
      "LFT",
      "RFT",
      "Lipid Profile",
      "UREA",
      "Creatinine",
      "SGOT",
      "SGPT",
      "Albumin (Serum)",
      "TSH",
    ],
    "Vitamins & Minerals": [
      "Vitamin D",
      "Vitamin B12",
      "Iron Studies",
      "Calcium",
      "Ferritin",
      "Zinc",
    ],
    "Urine": [
      "Urine Albumin",
      "Urine Creatinine",
      "Albumin Creatinine Ratio",
      "Urine Routine",
      "Urine Culture",
    ],
    "Cardiac": [
      "Troponin",
      "BNP",
      "D-Dimer",
      "CRP",
      "Homocysteine",
    ],
  };

  let testCount = 0;
  for (const [category, tests] of Object.entries(testCategories)) {
    for (const testName of tests) {
      await prisma.masterTest.upsert({
        where: { name: testName },
        update: {},
        create: {
          name: testName,
          category,
          isActive: true,
        },
      });
      testCount++;
    }
    console.log(`✅ Tests in "${category}": ${tests.length}`);
  }
  console.log(`✅ Total tests seeded: ${testCount}`);

  console.log("\n🎉 Seeding complete!");
  console.log("\n📋 Login Credentials:");
  console.log(`   Admin:        frpboy12@gmail.com / Zabnix@2025`);
  console.log(`   Nutritionist: sahakarsmartclinicdt@gmail.com / sscdt@2026`);
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
