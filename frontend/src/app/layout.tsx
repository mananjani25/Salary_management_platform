import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";

import "./globals.css";
import AppSidebar from "@/components/layout/AppSidebar";
import QueryProvider from "@/providers/QueryProvider";

export const metadata: Metadata = {
  title: "HR Salary Manager",
  description: "Salary management for HR teams",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" aria-label="Salary Management Platform">
      <body className="min-h-screen bg-zinc-50 text-zinc-900 antialiased">
        <QueryProvider>
          <div className="flex min-h-screen flex-col md:flex-row">
            <AppSidebar aria-label="Application Sidebar" />
            <main className="flex-1 p-6" aria-label="Main Content">
              {children}
            </main>
          </div>
          <Toaster position="top-right" />
        </QueryProvider>
      </body>
    </html>
  );
}
