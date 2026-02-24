"use client";

import AppShell from "@/components/layout/AppShell";
import { AuthProvider } from "@/figma/components/AuthContext";
import { ThemeProvider } from "@/figma/components/ThemeContext";

export default function AppGroupLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppShell>{children}</AppShell>
      </AuthProvider>
    </ThemeProvider>
  );
}
