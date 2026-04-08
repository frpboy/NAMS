"use server";

import { db } from "@/lib/db";
import { patientLookupSchema } from "@/lib/validations";

export async function lookupPatientByPhone(contactNumber: string) {
  const result = patientLookupSchema.safeParse({ contactNumber });
  if (!result.success) {
    return { error: result.error.errors[0].message };
  }

  const patient = await db.patient.findFirst({
    where: { contactNumber: result.data.contactNumber },
    include: {
      assessments: {
        orderBy: { date: "desc" },
        select: {
          id: true,
          date: true,
          bmi: true,
          outlet: { select: { name: true } },
          selectedTests: true,
        },
        take: 10,
      },
    },
  });

  if (!patient) {
    return { found: false };
  }

  return { found: true, patient };
}

export async function createOrUpdatePatient(data: {
  contactNumber: string;
  name: string;
  age: number;
  sex: string;
  occupation?: string;
  place?: string | null;
}) {
  return db.patient.upsert({
    where: { contactNumber: data.contactNumber },
    update: {
      name: data.name,
      age: data.age,
      sex: data.sex,
      occupation: data.occupation,
      place: data.place,
    },
    create: data,
  });
}

export async function getPatients(search?: string) {
  return db.patient.findMany({
    where: search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { contactNumber: { contains: search } },
          ],
        }
      : {},
    orderBy: { updatedAt: "desc" },
    take: 100,
  });
}

export async function getUniquePlaces(search: string) {
  if (search.length < 2) return [];
  
  const places = await db.patient.findMany({
    where: {
      place: {
        contains: search,
        mode: "insensitive",
      },
    },
    select: {
      place: true,
    },
    distinct: ["place"],
    take: 5,
  });

  return places.map((p) => p.place).filter(Boolean);
}
