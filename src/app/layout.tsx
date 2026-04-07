import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NAMS — Nutrition Assessment Management System",
  description: "Clinical ERP for Sahakar Smart Clinic nutritionists",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
