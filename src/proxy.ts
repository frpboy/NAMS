export { auth as proxy } from "@/lib/auth/auth.config";

export const config = {
  // Exclude static assets and files with extensions from auth proxy checks.
  matcher: ["/((?!api|_next/static|_next/image|login|.*\\..*).*)"],
};
