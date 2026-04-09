"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { userSchema } from "@/lib/validations";
import bcrypt from "bcryptjs";

export async function getUsers() {
  return db.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });
}

export async function getUsersPage(page: number, pageSize: number) {
  const [users, total] = await Promise.all([
    db.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.user.count(),
  ]);

  return { users, total };
}

export async function createUser(data: {
  name: string;
  email: string;
  password: string;
  role: "ADMIN" | "NUTRITIONIST";
}) {
  const result = userSchema.safeParse(data);
  if (!result.success) {
    return { error: result.error.errors[0].message };
  }

  const existing = await db.user.findUnique({
    where: { email: result.data.email },
  });
  if (existing) {
    return { error: "A user with this email already exists" };
  }

  const hashedPassword = await bcrypt.hash(result.data.password, 10);
  await db.user.create({
    data: {
      name: result.data.name,
      email: result.data.email,
      password: hashedPassword,
      role: result.data.role,
    },
  });
  revalidatePath("/admin/users");
  return { success: true };
}

export async function updateUserRole(id: string, role: "ADMIN" | "NUTRITIONIST") {
  await db.user.update({ where: { id }, data: { role } });
  revalidatePath("/admin/users");
  return { success: true };
}

export async function deleteUser(id: string) {
  const userCount = await db.user.count();
  if (userCount <= 1) {
    return { error: "Cannot delete the last remaining user" };
  }
  await db.user.delete({ where: { id } });
  revalidatePath("/admin/users");
  return { success: true };
}
