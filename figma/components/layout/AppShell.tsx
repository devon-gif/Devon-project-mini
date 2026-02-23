"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Toaster } from "sonner";

import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

import { CommandPalette } from "../CommandPalette";
import { AddPersonModal } from "../AddPersonModal";
import { AIAssistantDrawer } from "../AIAssistantDrawer";
import { KeyboardShortcuts } from "../KeyboardShortcuts";
import { WelcomeSplash, isSplashDisabled } from "../WelcomeSplash";

import { useAuth } from "../AuthContext";
import { useTheme } from "../ThemeContext";

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, justLoggedIn, user, clearJustLoggedIn } = useAuth();
  const { isDark } = useTheme();

  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [addPersonOpen, setAddPersonOpen] = useState(false);
  const [aiDrawerOpen, setAiDrawerOpen] = useState(false);
  const [showSplash, setShowSplash] = useState(false);
  const [shellReady, setShellReady] = useState(false);

  useEffect(() => {
    // if not authed, kick to /login (Next route)
    if (!isAuthenticated) router.push("/login");
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (justLoggedIn && !isSplashDisabled()) setShowSplash(true);
  }, [justLoggedIn]);

  const handleSplashComplete = useCallback(
    (navigateTo?: string) => {
      setShowSplash(false);
      setShellReady(true);
      clearJustLoggedIn();
      if (navigateTo) router.push(navigateTo);
    },
    [clearJustLoggedIn, router]
  );

  // Cmd+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (!justLoggedIn && isAuthenticated) setShellReady(true);
  }, [justLoggedIn, isAuthenticated]);

  if (!isAuthenticated) return null;

  const shouldAnimate = shellReady && !showSplash;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#FAFBFF]">
      {showSplash && (
        <WelcomeSplash
          userName={user?.name?.split(" ")[0]}
          onComplete={handleSplashComplete}
        />
      )}

      <div className="relative z-10 flex h-full w-full">
        <motion.div
          initial={justLoggedIn ? { x: -40, opacity: 0 } : false}
          animate={shouldAnimate ? { x: 0, opacity: 1 } : undefined}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="shrink-0"
        >
          <Sidebar />
        </motion.div>

        <motion.div
          className="flex flex-1 flex-col overflow-hidden"
          initial={justLoggedIn ? { y: 16, opacity: 0 } : false}
          animate={shouldAnimate ? { y: 0, opacity: 1 } : undefined}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
        >
          <Topbar
            onOpenCommandPalette={() => setCommandPaletteOpen(true)}
            onOpenAddPerson={() => setAddPersonOpen(true)}
            onToggleAI={() => setAiDrawerOpen((prev) => !prev)}
            aiOpen={aiDrawerOpen}
          />

          <div className="flex flex-1 overflow-hidden">
            <main className="flex-1 overflow-hidden">{children}</main>

            {aiDrawerOpen && (
              <AIAssistantDrawer
                open={aiDrawerOpen}
                onClose={() => setAiDrawerOpen(false)}
              />
            )}
          </div>
        </motion.div>
      </div>

      <CommandPalette
        open={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onOpenAddPerson={() => setAddPersonOpen(true)}
      />
      <AddPersonModal open={addPersonOpen} onClose={() => setAddPersonOpen(false)} />
      <KeyboardShortcuts onOpenCommandPalette={() => setCommandPaletteOpen(true)} />

      <Toaster
        theme={isDark ? "dark" : "light"}
        position="bottom-right"
        toastOptions={{
          style: isDark
            ? { background: "#1A1D27", border: "1px solid #252A3A", color: "#E5E7EB" }
            : { background: "#FFFFFF", border: "1px solid #E5E7EB", color: "#1A1A2E" },
        }}
      />
    </div>
  );
}
