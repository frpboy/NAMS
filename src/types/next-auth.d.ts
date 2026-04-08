import { Role } from "@prisma/client";
import { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface User extends DefaultUser {
    role: Role;
    id: string;
  }

  interface Session extends DefaultSession {
    user: {
      role: Role;
      id: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: Role;
    id: string;
  }
}
