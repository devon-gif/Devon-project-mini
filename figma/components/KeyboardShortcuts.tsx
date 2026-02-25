"use client";

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { motion, AnimatePresence } from "framer-motion";
import {
  Keyboard, X, Video, Mail, CheckSquare,
  Building2, Compass, Search, Bot, Command, Moon,
} from 'lucide-react';
import { useTheme } from './ThemeContext';

const shortcuts = [
  { key: 'V', label: 'New Video', description: 'Create personalized video', icon: Video, route: '/videos/create' },
  { key: 'E', label: 'Inbox', description: 'Open email inbox', icon: Mail, route: '/inbox' },
  { key: 'T', label: 'Tasks', description: 'View task board', icon: CheckSquare, route: '/tasks' },
  { key: 'A', label: 'Leads', description: 'Browse leads', icon: Building2, route: '/accounts' },
  { key: 'M', label: 'Mission Control', description: 'Go to dashboard', icon: Compass, route: '/app' },
  { key: 'G', label: 'Videos', description: 'Video outreach dashboard', icon: Video, route: '/videos' },
  { key: 'D', label: 'Dark Mode', description: 'Toggle light/dark theme', icon: Moon },
];

const metaShortcuts = [
  { key: '⌘K', label: 'Command Palette', description: 'Search anything', icon: Search },
  { key: '?', label: 'Keyboard Shortcuts', description: 'Show this help', icon: Keyboard },
];

interface KeyboardShortcutsProps {
  onOpenCommandPalette: () => void;
}

export function KeyboardShortcuts({ onOpenCommandPalette }: KeyboardShortcutsProps) {
  const router = useRouter();
  const { toggleTheme } = useTheme();
  const [helpOpen, setHelpOpen] = useState(false);

  const isInputFocused = useCallback(() => {
    const el = document.activeElement;
    if (!el) return false;
    const tag = el.tagName.toLowerCase();
    if (tag === 'input' || tag === 'textarea' || tag === 'select') return true;
    if ((el as HTMLElement).contentEditable === 'true') return true;
    return false;
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Don't fire when typing in inputs, or when meta/ctrl keys are held (except for ⌘K which is handled in AppShell)
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (isInputFocused()) return;

      const key = e.key.toLowerCase();

      switch (key) {
        case 'v':
          e.preventDefault();
          toast('New Video', { description: 'Opening video creator...', icon: <Video className="h-4 w-4 text-amber-600" /> });
          router.push('/videos/create');
          break;
        case 'e':
          e.preventDefault();
          router.push('/inbox');
          break;
        case 't':
          e.preventDefault();
          router.push('/tasks');
          break;
        case 'a':
          e.preventDefault();
          router.push('/accounts');
          break;
        case 'm':
          e.preventDefault();
          router.push('/app');
          break;
        case 'g':
          e.preventDefault();
          router.push('/videos');
          break;
        case 'd':
          e.preventDefault();
          toggleTheme();
          break;
        case '?':
          e.preventDefault();
          setHelpOpen(prev => !prev);
          break;
        case 'escape':
          if (helpOpen) {
            e.preventDefault();
            setHelpOpen(false);
          }
          break;
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [router, isInputFocused, helpOpen, toggleTheme]);

  return (
    <>
      {/* Floating hint badge — bottom left */}
      <button
        onClick={() => setHelpOpen(true)}
        className="fixed bottom-4 left-4 z-40 flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-[11px] text-gray-400 shadow-sm hover:text-gray-600 hover:border-gray-300 transition-all"
      >
        <Keyboard className="h-3 w-3" />
        <span>?</span>
      </button>

      {/* Help Modal */}
      <AnimatePresence>
        {helpOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 z-50 bg-black/30 backdrop-blur-[2px]"
              onClick={() => setHelpOpen(false)}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', duration: 0.3, bounce: 0.15 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            >
              <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white shadow-2xl pointer-events-auto overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FFD600]">
                      <Keyboard className="h-4 w-4 text-gray-900" />
                    </div>
                    <div>
                      <h3 className="text-gray-900">Keyboard Shortcuts</h3>
                      <p className="text-[11px] text-gray-400">Navigate faster with your keyboard</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setHelpOpen(false)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Navigation shortcuts */}
                <div className="px-5 py-4">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-3">Navigation</p>
                  <div className="space-y-1.5">
                    {shortcuts.map((s) => (
                      <button
                        key={s.key}
                        onClick={() => {
                          if (s.route) router.push(s.route);
                          if (s.key === 'D') toggleTheme();
                          setHelpOpen(false);
                        }}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-gray-50 transition-colors group"
                      >
                        <kbd className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-xs text-gray-500 group-hover:border-[#FFD600] group-hover:bg-[#FFD600]/10 transition-colors" style={{ fontWeight: 600 }}>
                          {s.key}
                        </kbd>
                        <s.icon className="h-4 w-4 text-gray-400 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-700">{s.label}</p>
                          <p className="text-[11px] text-gray-400 truncate">{s.description}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Meta shortcuts */}
                <div className="px-5 pb-5">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-3">System</p>
                  <div className="space-y-1.5">
                    {metaShortcuts.map((s) => (
                      <button
                        key={s.key}
                        onClick={() => {
                          if (s.key === '⌘K') { onOpenCommandPalette(); setHelpOpen(false); }
                          else if (s.key === '?') setHelpOpen(false);
                        }}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-gray-50 transition-colors group"
                      >
                        <kbd className="flex h-7 min-w-[28px] items-center justify-center rounded-lg border border-gray-200 bg-gray-50 px-1.5 text-xs text-gray-500 group-hover:border-[#FFD600] group-hover:bg-[#FFD600]/10 transition-colors" style={{ fontWeight: 600 }}>
                          {s.key}
                        </kbd>
                        <s.icon className="h-4 w-4 text-gray-400 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-700">{s.label}</p>
                          <p className="text-[11px] text-gray-400 truncate">{s.description}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Footer hint */}
                <div className="border-t border-gray-100 px-5 py-3 bg-gray-50/50">
                  <p className="text-[11px] text-gray-400 text-center">
                    Press <kbd className="rounded border border-gray-200 bg-white px-1 py-0.5 text-[10px] text-gray-500 mx-0.5">Esc</kbd> to close &middot; Shortcuts only fire when no input is focused
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}