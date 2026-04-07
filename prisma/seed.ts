/**
 * Seed script to populate the database with initial data.
 * Run with: npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed.ts
 */

import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ─── Create Admin User ────────────────────────────────────────
  const adminPassword = await bcrypt.hash("admin123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@sahakarclinic.com" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@sahakarclinic.com",
      password: adminPassword,
      role: Role.ADMIN,
    },
  });
  console.log(`✅ Admin created: ${admin.email}`);

  // ─── Create Nutritionist User ─────────────────────────────────
  const nutriPassword = await bcrypt.hash("nutri123", 10);

  const nutritionist = await prisma.user.upsert({
    where: { email: "nutri@sahakarclinic.com" },
    update: {},
    create: {
      name: "Nutritionist User",
      email: "nutri@sahakarclinic.com",
      password: nutriPassword,
      role: Role.NUTRITIONIST,
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
  console.log(`   Admin:        admin@sahakarclinic.com / admin123`);
  console.log(`   Nutritionist: nutri@sahakarclinic.com / nutri123`);
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
