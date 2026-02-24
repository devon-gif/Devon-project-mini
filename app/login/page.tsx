"use client";

import { Suspense } from "react";
import { AuthProvider } from "@/figma/components/AuthContext";
import { ThemeProvider } from "@/figma/components/ThemeContext";
import { Login } from "@/figma/pages/Login";

function LoginFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FAFBFF]">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#2563EB] border-t-transparent" />
    </div>
  );
}

export default function LoginPage() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Suspense fallback={<LoginFallback />}>
          <Login />
        </Suspense>
      </AuthProvider>
    </ThemeProvider>
  );
}