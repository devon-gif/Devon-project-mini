"use client";

/// <reference path="../../next-env.d.ts" />
import React from "react";
import { Sidebar } from "@/figma/components/layout/Sidebar";
import { Topbar } from "@/figma/components/layout/Topbar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#FAFBFF]">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}

// (optional) named export too, so either import style works
export { AppShell };