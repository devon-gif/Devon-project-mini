"use client";

import React from "react";
import { ThemeProvider } from "@/components/ThemeContext";
import { AuthProvider } from "@/components/AuthContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>{children}</AuthProvider>
    </ThemeProvider>
  );
}
