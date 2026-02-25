"use client";

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search, UserPlus, Mail, Phone, Building2, Inbox,
  CheckSquare, ArrowRight, Sparkles, Rocket,
  RefreshCw, Zap, Tag, FileText, Video,
} from 'lucide-react';

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  onOpenAddPerson: () => void;
}

const commands = [
  { id: 'add-person', icon: UserPlus, label: 'Create person', category: 'Actions', action: 'addPerson' },
  { id: 'add-account', icon: Building2, label: 'Add account', category: 'Actions', action: 'addPerson' },
  { id: 'draft-email', icon: Mail, label: 'Draft email', category: 'Actions', path: '/inbox' },
  { id: 'send-video', icon: Video, label: 'Send video', category: 'Actions', path: '/videos/create' },
  { id: 'log-call', icon: Phone, label: 'Log call', category: 'Actions', path: '/tasks' },
  { id: 'change-status', icon: RefreshCw, label: 'Change account status', category: 'Actions', path: '/accounts' },
  { id: 'create-task', icon: CheckSquare, label: 'Create follow-up task', category: 'Actions', path: '/tasks' },
  { id: 'ai-draft', icon: Sparkles, label: 'AI: Draft outreach', category: 'AI Assistant', path: '/app' },
  { id: 'ai-summarize', icon: FileText, label: 'AI: Summarize thread', category: 'AI Assistant', path: '/inbox' },
  { id: 'ai-tasks', icon: Tag, label: 'AI: Extract tasks', category: 'AI Assistant', path: '/app' },
  { id: 'mission', icon: Rocket, label: 'Go to Mission Control', category: 'Navigate', path: '/app' },
  { id: 'accounts', icon: Building2, label: 'Go to Leads', category: 'Navigate', path: '/accounts' },
  { id: 'videos', icon: Video, label: 'Go to Videos', category: 'Navigate', path: '/videos' },
  { id: 'inbox', icon: Inbox, label: 'Go to Inbox', category: 'Navigate', path: '/inbox' },
  { id: 'tasks', icon: CheckSquare, label: 'Go to Tasks', category: 'Navigate', path: '/tasks' },
];

export function CommandPalette({ open, onClose, onOpenAddPerson }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();

  const filtered = commands.filter(c =>
    c.label.toLowerCase().includes(query.toLowerCase()) ||
    c.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleSelect = (cmd: typeof commands[0]) => {
    if (cmd.action === 'addPerson') {
      onClose();
      onOpenAddPerson();
    } else if (cmd.path) {
      router.push(cmd.path);
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(i => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && filtered[selectedIndex]) {
      handleSelect(filtered[selectedIndex]);
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!open) return null;

  const groups = filtered.reduce<Record<string, typeof commands>>((acc, cmd) => {
    if (!acc[cmd.category]) acc[cmd.category] = [];
    acc[cmd.category].push(cmd);
    return acc;
  }, {});

  let flatIndex = -1;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]" onClick={onClose}>
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[560px] rounded-2xl border border-gray-200 bg-white shadow-[0_25px_60px_rgba(0,0,0,0.15)] overflow-hidden"
      >
        {/* Search input */}
        <div className="flex items-center gap-3 border-b border-gray-200 px-4 py-3">
          <Search className="h-5 w-5 text-gray-400" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => { setQuery(e.target.value); setSelectedIndex(0); }}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or search..."
            className="flex-1 bg-transparent text-gray-800 placeholder:text-gray-400 outline-none"
          />
        </div>

        {/* Results */}
        <div className="max-h-[360px] overflow-y-auto p-2">
          {Object.entries(groups).map(([category, items]) => (
            <div key={category}>
              <p className="px-3 py-1.5 text-[11px] text-gray-400 uppercase tracking-wider">{category}</p>
              {items.map((cmd) => {
                flatIndex++;
                const idx = flatIndex;
                return (
                  <button
                    key={cmd.id}
                    onClick={() => handleSelect(cmd)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all ${
                      selectedIndex === idx
                        ? 'bg-[#FFF9DB] text-gray-900'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <cmd.icon className="h-4 w-4 shrink-0" />
                    <span className="flex-1 text-left">{cmd.label}</span>
                    {selectedIndex === idx && <ArrowRight className="h-3.5 w-3.5 text-gray-400" />}
                  </button>
                );
              })}
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="px-3 py-8 text-center text-sm text-gray-400">No results found</p>
          )}
        </div>

        {/* Footer hint */}
        <div className="flex items-center gap-4 border-t border-gray-200 px-4 py-2 text-[11px] text-gray-400">
          <span>Up/Down Navigate</span>
          <span>Enter Select</span>
          <span>Esc Close</span>
        </div>
      </div>
    </div>
  );
}