"use client";

import { Search, Plus, Bell, Command, Bot, Video, Sun, Moon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "../ThemeContext";

interface TopbarProps {
  onOpenCommandPalette?: () => void;
  onOpenAddPerson?: () => void;
  onToggleAI?: () => void;
  aiOpen?: boolean;
}

export function Topbar({ onOpenCommandPalette = () => {}, onOpenAddPerson = () => {}, onToggleAI = () => {}, aiOpen = false }: TopbarProps) {
  const router = useRouter();
  const { isDark, toggleTheme } = useTheme();
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setQuickAddOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-5">
      <button
        onClick={onOpenCommandPalette}
        className="flex items-center gap-2.5 rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2 text-sm text-gray-400 transition-all hover:bg-gray-100 hover:border-gray-300 w-[320px]"
      >
        <Search className="h-4 w-4" />
        <span className="flex-1 text-left">Search anything...</span>
        <span className="flex items-center gap-0.5 rounded-md border border-gray-200 bg-white px-1.5 py-0.5 text-[11px] text-gray-400">
          <Command className="h-3 w-3" />K
        </span>
      </button>

      <div className="flex items-center gap-2">
        <button
          onClick={onToggleAI}
          className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm transition-all ${
            aiOpen
              ? "border-[#2563EB] bg-blue-50 text-[#2563EB]"
              : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700"
          }`}
        >
          <Bot className="h-4 w-4" />
          <span className="hidden sm:inline">AI</span>
        </button>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setQuickAddOpen(!quickAddOpen)}
            className="flex items-center gap-1.5 rounded-xl bg-[#2563EB] px-3.5 py-2 text-sm text-white transition-all hover:bg-[#1D4ED8] active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" />
            <span>Quick Add</span>
          </button>

          {quickAddOpen && (
            <div className="absolute right-0 top-full mt-1 w-48 rounded-xl border border-gray-200 bg-white shadow-lg overflow-hidden z-30">
              <button
                onClick={() => { onOpenAddPerson(); setQuickAddOpen(false); }}
                className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <Plus className="h-4 w-4 text-gray-400" />
                Add Person
              </button>
              <button
                onClick={() => { router.push("/videos/create"); setQuickAddOpen(false); }}
                className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <Video className="h-4 w-4 text-gray-400" />
                Send Video
              </button>
            </div>
          )}
        </div>

        <button className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 transition-all hover:bg-gray-50 hover:text-gray-700">
          <Bell className="h-4 w-4" />
          <span
            className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#FFD600] text-[10px] text-gray-900"
            style={{ fontWeight: 600 }}
          >
            3
          </span>
        </button>

        <button
          onClick={toggleTheme}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 transition-all hover:bg-gray-50 hover:text-gray-700"
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
      </div>
    </header>
  );
}
