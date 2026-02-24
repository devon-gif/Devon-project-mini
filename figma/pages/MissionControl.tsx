"use client";

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from "framer-motion";
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { GlassCard } from '../components/GlassCard';
import { StatusChip } from '../components/StatusChip';
import { AnimatedCounter } from '../components/AnimatedCounter';
import { DraggableActionItem } from '../components/DraggableActionItem';
import { accounts, people, emailThreads, tasks } from '../data/mockData';
import {
  Building2, MessageSquare, Calendar, Users, Mail,
  ArrowUpRight, ArrowDownRight, Flame, ChevronRight, ChevronDown,
  Phone, Linkedin, CheckSquare,
  Sparkles, Send, Share2, Lightbulb,
  Target, CheckCircle2, RotateCcw, Trash2,
} from 'lucide-react';
import { ShareModal } from '../components/ShareModal';
import { toast } from 'sonner';

// ─── Types ────────────────────────────────────────────────
interface DoNextItem {
  id: string;
  action: string;
  contact: string;
  account: string;
  reason: string;
  type: 'call' | 'email' | 'video' | 'intro';
  priority: 'hot' | 'warm' | 'cool';
  personId?: string;
}

interface CompletedItem {
  item: DoNextItem;
  completedAt: Date;
}

// ─── Static data ──────────────────────────────────────────
const doNextQueue: DoNextItem[] = [
  { id: '1', action: 'Schedule demo call', contact: 'Sarah Chen', account: 'Stripe', reason: "Replied 'can you do Tuesday 2pm?'", type: 'call', priority: 'hot', personId: '1' },
  { id: '2', action: 'Send proposal', contact: 'David Zhang', account: 'Databricks', reason: 'Replied with budget approved', type: 'email', priority: 'hot', personId: '7' },
  { id: '3', action: 'Follow up on proposal', contact: 'Lisa Nakamura', account: 'Databricks', reason: 'David looped her in, no response yet', type: 'email', priority: 'hot', personId: '8' },
  { id: '4', action: 'Send follow-up', contact: 'Marcus Johnson', account: 'Notion', reason: 'Opened email, no reply in 1 day', type: 'email', priority: 'warm', personId: '2' },
  { id: '5', action: 'Try different angle', contact: 'Emily Park', account: 'Figma', reason: 'No reply in 3 days', type: 'email', priority: 'warm', personId: '3' },
  { id: '6', action: 'Send personalized video', contact: 'Tracy St.Dic', account: 'Zapier', reason: 'Hot account, no outreach yet', type: 'video', priority: 'warm', personId: '15' },
  { id: '7', action: 'Reach out with warm angle', contact: 'Lyndsey French', account: '1Password', reason: 'Post-Series C, aggressive hiring', type: 'email', priority: 'warm', personId: '16' },
  { id: '8', action: 'Request warm intro', contact: 'Jordan Kim', account: 'Linear', reason: 'No reply in 5 days, try mutual', type: 'intro', priority: 'cool', personId: '5' },
  { id: '9', action: 'Connect via mutual', contact: 'Plaid', account: 'Plaid', reason: 'Warm intro available via Sarah K.', type: 'intro', priority: 'cool' },
  { id: '10', action: 'Send video outreach', contact: 'Ray Schneider', account: 'Crunchyroll', reason: 'Enterprise, ramping global hiring', type: 'video', priority: 'cool', personId: '19' },
];

const learnings = {
  objections: [
    '"Not the right time" — 3 accounts',
    '"Using internal recruiting" — 2 accounts',
    '"Need to see ROI data" — 1 account',
  ],
  changed: 'Databricks moved from prospect to champion status after David Zhang replied enthusiastically.',
  improved: 'Reply rate up 15% this week with personalized subject lines referencing hiring signals.',
  nextExperiment: 'Test warm intro request before cold email on P1 accounts to see if conversion improves.',
};

const scoreboardMetrics = [
  { label: 'Accounts Touched', value: 12, trend: '+3', up: true, icon: Building2, color: '#2563EB' },
  { label: 'Contacts Added', value: 8, trend: '+5', up: true, icon: Users, color: '#8B5CF6' },
  { label: 'Touches Sent', value: 34, trend: '+12', up: true, icon: Send, color: '#10B981' },
  { label: 'Replies', value: 8, trend: '+5', up: true, icon: MessageSquare, color: '#F59E0B' },
  { label: 'Meetings Booked', value: 4, trend: '+2', up: true, icon: Calendar, color: '#FFD600' },
];

const priorityGroups: { key: 'hot' | 'warm' | 'cool'; label: string; dotClass: string; headerBg: string }[] = [
  { key: 'hot', label: 'Hot', dotClass: 'bg-red-400', headerBg: 'bg-red-50/60' },
  { key: 'warm', label: 'Warm', dotClass: 'bg-amber-400', headerBg: 'bg-amber-50/60' },
  { key: 'cool', label: 'Cool', dotClass: 'bg-gray-300', headerBg: 'bg-gray-50/60' },
];

// ─── localStorage keys ────────────────────────────────────
const LS_ORDER = 'twill-queue-order';
const LS_COLLAPSED = 'twill-queue-collapsed';

function loadOrderFromStorage(): string[] {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return doNextQueue.map(a => a.id);
    const raw = window.localStorage.getItem(LS_ORDER);
    if (raw) {
      const parsed: string[] = JSON.parse(raw);
      const allIds = new Set(doNextQueue.map(a => a.id));
      const validSaved = parsed.filter(id => allIds.has(id));
      const savedSet = new Set(validSaved);
      const missing = doNextQueue.filter(a => !savedSet.has(a.id)).map(a => a.id);
      return [...validSaved, ...missing];
    }
  } catch (_e) { /* ignore */ }
  return doNextQueue.map(a => a.id);
}

function loadCollapsedFromStorage(): Set<string> {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return new Set();
    const raw = window.localStorage.getItem(LS_COLLAPSED);
    if (raw) {
      const parsed: string[] = JSON.parse(raw);
      return new Set(parsed);
    }
  } catch (_e) { /* ignore */ }
  return new Set();
}

function safeSetItem(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch (_e) { /* ignore */ }
}

// ─── Helpers ──────────────────────────────────────────────
function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 10) return 'just now';
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

// ─── Component ────────────────────────────────────────────
export function MissionControl() {
  const router = useRouter();
  const [dismissedActions, setDismissedActions] = useState<Set<string>>(new Set());
  const [completedActions, setCompletedActions] = useState<Set<string>>(new Set());
  const [recentlyCompleted, setRecentlyCompleted] = useState<CompletedItem[]>([]);
  const [orderedIds, setOrderedIds] = useState<string[]>(loadOrderFromStorage);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(loadCollapsedFromStorage);
  const [shareOpen, setShareOpen] = useState(false);

  // Persist order to localStorage
  useEffect(() => {
    safeSetItem(LS_ORDER, JSON.stringify(orderedIds));
  }, [orderedIds]);

  // Persist collapsed state to localStorage
  useEffect(() => {
    safeSetItem(LS_COLLAPSED, JSON.stringify([...collapsedGroups]));
  }, [collapsedGroups]);

  const hotAccounts = [...accounts]
    .sort((a, b) => b.signalScore - a.signalScore)
    .slice(0, 10);

  const inboxHighlights = emailThreads
    .sort((a, b) => (b.unread ? 1 : 0) - (a.unread ? 1 : 0))
    .slice(0, 5);

  // Full flat visible list (respects order)
  const visibleActions = orderedIds
    .map(id => doNextQueue.find(a => a.id === id)!)
    .filter(a => a && !dismissedActions.has(a.id) && !completedActions.has(a.id));

  // Group by priority, preserving order within each group
  const groupedVisible: Record<'hot' | 'warm' | 'cool', DoNextItem[]> = {
    hot: visibleActions.filter(a => a.priority === 'hot'),
    warm: visibleActions.filter(a => a.priority === 'warm'),
    cool: visibleActions.filter(a => a.priority === 'cool'),
  };

  // Drag-to-reorder handler scoped to a priority group
  const moveItemInGroup = useCallback((priority: string, dragIndex: number, hoverIndex: number) => {
    setOrderedIds(prev => {
      const visibleIds = prev.filter(
        id => !dismissedActions.has(id) && !completedActions.has(id)
      );
      // Get items in this priority group only
      const groupIds = visibleIds.filter(id => {
        const item = doNextQueue.find(a => a.id === id);
        return item?.priority === priority;
      });
      const dragId = groupIds[dragIndex];
      const hoverId = groupIds[hoverIndex];
      if (!dragId || !hoverId) return prev;

      const newOrder = [...prev];
      const dragFullIndex = newOrder.indexOf(dragId);
      const hoverFullIndex = newOrder.indexOf(hoverId);
      newOrder.splice(dragFullIndex, 1);
      newOrder.splice(hoverFullIndex, 0, dragId);
      return newOrder;
    });
  }, [dismissedActions, completedActions]);

  const toggleGroup = (key: string) => {
    setCollapsedGroups(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const handleDoIt = (id: string) => {
    const action = doNextQueue.find(a => a.id === id);
    setCompletedActions(prev => new Set([...prev, id]));

    if (!action) return;

    // Track in recently completed
    setRecentlyCompleted(prev => {
      const next = [{ item: action, completedAt: new Date() }, ...prev];
      return next.slice(0, 8); // keep max 8 in memory
    });

    switch (action.type) {
      case 'email': {
        const person = action.personId ? people.find(p => p.id === action.personId) : null;
        toast.success(`Composing email to ${action.contact}`, {
          description: `${action.action} — ${action.account}`,
          action: person ? {
            label: 'Open Inbox',
            onClick: () => router.push('/inbox'),
          } : undefined,
        });
        router.push('/inbox');
        break;
      }
      case 'call': {
        const person = action.personId ? people.find(p => p.id === action.personId) : null;
        const phone = person?.phone;
        toast.success(`Call ${action.contact}${phone ? ` at ${phone}` : ''}`, {
          description: `${action.action} — ${action.account}`,
          action: {
            label: 'Log in Tasks',
            onClick: () => router.push('/tasks'),
          },
        });
        router.push('/tasks');
        break;
      }
      case 'video': {
        toast.success(`Creating video for ${action.contact}`, {
          description: `${action.action} — ${action.account}`,
        });
        router.push(action.personId ? `/videos/create?person=${action.personId}` : '/videos/create');
        break;
      }
      case 'intro': {
        toast.success(`Drafting intro request for ${action.contact}`, {
          description: `${action.reason}`,
          action: {
            label: 'Open Inbox',
            onClick: () => router.push('/inbox'),
          },
        });
        router.push('/inbox');
        break;
      }
      default: {
        toast.success(`Action completed: ${action.action}`);
      }
    }
  };

  const handleDismiss = (id: string) => {
    const action = doNextQueue.find(a => a.id === id);
    setDismissedActions(prev => new Set([...prev, id]));
    if (action) {
      toast('Snoozed', {
        description: `${action.action} — ${action.contact}`,
        action: {
          label: 'Undo',
          onClick: () => setDismissedActions(prev => {
            const next = new Set(prev);
            next.delete(id);
            return next;
          }),
        },
      });
    }
  };

  const handleUndoComplete = (id: string) => {
    setCompletedActions(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    setRecentlyCompleted(prev => prev.filter(c => c.item.id !== id));
    toast('Restored to queue', {
      description: doNextQueue.find(a => a.id === id)?.action || '',
    });
  };

  const handleClearAllCompleted = () => {
    const count = recentlyCompleted.length;
    setRecentlyCompleted([]);
    toast('Cleared completed', {
      description: `${count} item${count !== 1 ? 's' : ''} removed`,
    });
  };

  const getTimeGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const visibleRecentlyCompleted = recentlyCompleted.slice(0, 3);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="h-full overflow-y-auto p-6 space-y-6">
        {/* Header — Figma: large greeting, subtitle, Share read-only */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">{getTimeGreeting()}, Alex</h1>
            <p className="text-sm text-gray-500 mt-1">
              {visibleActions.length} actions waiting &middot; {tasks.filter(t => t.status !== 'done').length} open tasks
            </p>
          </div>
          <button
            onClick={() => setShareOpen(true)}
            className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all"
          >
            <Share2 className="h-4 w-4" />
            Share read-only
          </button>
        </div>

        {/* Module 1: Scoreboard with animated counters */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {scoreboardMetrics.map((m, i) => (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                type: 'spring',
                stiffness: 350,
                damping: 28,
                delay: i * 0.07,
              }}
            >
              <GlassCard className="p-4 overflow-hidden">
                <div className="flex items-start justify-between mb-2">
                  <motion.div
                    className="flex h-9 w-9 items-center justify-center rounded-xl"
                    style={{ backgroundColor: `${m.color}12` }}
                    initial={{ scale: 0, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{
                      type: 'spring',
                      stiffness: 500,
                      damping: 20,
                      delay: i * 0.07 + 0.15,
                    }}
                  >
                    <m.icon className="h-4 w-4" style={{ color: m.color }} />
                  </motion.div>
                  <motion.div
                    className={`flex items-center gap-0.5 text-xs ${m.up ? 'text-emerald-600' : 'text-red-500'}`}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.07 + 0.5, duration: 0.3 }}
                  >
                    {m.up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                    {m.trend}
                  </motion.div>
                </div>
                <AnimatedCounter
                  value={m.value}
                  duration={900}
                  delay={i * 70 + 200}
                  className="text-2xl text-gray-900"
                  style={{ fontWeight: 600, display: 'block' }}
                />
                <p className="text-[11px] text-gray-400 mt-0.5">{m.label} (7d)</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        {/* Module 2: Do Next Queue — priority groups + drag-to-reorder */}
        <GlassCard className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FFD600]">
                <Target className="h-4 w-4 text-gray-900" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Do Next</h3>
                <p className="text-xs text-gray-400">{visibleActions.length} prioritized actions &middot; drag to reorder</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {priorityGroups.map(({ key, label, dotClass, headerBg }) => {
              const items = groupedVisible[key];
              if (items.length === 0) return null;
              const isCollapsed = collapsedGroups.has(key);

              return (
                <div key={key}>
                  {/* Group header */}
                  <button
                    onClick={() => toggleGroup(key)}
                    className={`w-full flex items-center gap-2.5 rounded-lg px-3 py-2 mb-1.5 text-left transition-colors hover:bg-gray-50 ${headerBg}`}
                  >
                    <motion.div
                      animate={{ rotate: isCollapsed ? -90 : 0 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    >
                      <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
                    </motion.div>
                    <div className={`h-2 w-2 rounded-full ${dotClass}`} />
                    <span className="text-xs text-gray-600" style={{ fontWeight: 500 }}>{label}</span>
                    <span className="rounded-full bg-white/80 border border-gray-200/60 px-1.5 py-0.5 text-[10px] text-gray-400 tabular-nums" style={{ fontWeight: 500 }}>
                      {items.length}
                    </span>
                  </button>

                  {/* Group items — animated collapse */}
                  {!isCollapsed && (
                    <div className="space-y-2 pb-1">
                      <AnimatePresence initial={false}>
                        {items.map((action, index) => (
                          <DraggableActionItem
                            key={action.id}
                            action={action}
                            index={index}
                            groupId={key}
                            moveItem={(d, h) => moveItemInGroup(key, d, h)}
                            onDoIt={handleDoIt}
                            onDismiss={handleDismiss}
                          />
                        ))}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Empty state */}
            {visibleActions.length === 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', duration: 0.5, bounce: 0.2 }}
                className="text-center py-8"
              >
                <CheckSquare className="h-8 w-8 text-emerald-300 mx-auto mb-2" />
                <p className="text-sm text-gray-400">All caught up! Nice work.</p>
              </motion.div>
            )}
          </div>

          {/* Recently Completed Section */}
          <AnimatePresence>
            {visibleRecentlyCompleted.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="overflow-hidden"
              >
                <div className="mt-5 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="text-[11px] text-gray-400 uppercase tracking-wider">Recently Completed</span>
                    <span className="text-[10px] text-gray-300 ml-auto">
                      {recentlyCompleted.length} item{recentlyCompleted.length !== 1 ? 's' : ''}
                    </span>
                    {/* Clear all button — appears when > 3 items accumulated */}
                    {recentlyCompleted.length > 3 && (
                      <button
                        onClick={handleClearAllCompleted}
                        className="flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                      >
                        <Trash2 className="h-2.5 w-2.5" />
                        Clear all
                      </button>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <AnimatePresence initial={false}>
                      {visibleRecentlyCompleted.map((completed, i) => (
                        <motion.div
                          key={completed.item.id}
                          initial={{ opacity: 0, x: -16, height: 0 }}
                          animate={{ opacity: 1, x: 0, height: 'auto' }}
                          exit={{ opacity: 0, x: 16, height: 0 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 30, delay: i * 0.04 }}
                          className="group flex items-center gap-3 rounded-xl bg-emerald-50/40 border border-emerald-100/60 px-4 py-2.5"
                        >
                          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-500 line-through decoration-emerald-300">{completed.item.action}</span>
                              <span className="text-[11px] text-gray-400">&middot;</span>
                              <span className="text-xs text-gray-400">{completed.item.contact}</span>
                            </div>
                            <p className="text-[10px] text-gray-400 mt-0.5">
                              {completed.item.account} &middot; {timeAgo(completed.completedAt)}
                            </p>
                          </div>
                          <button
                            onClick={() => handleUndoComplete(completed.item.id)}
                            className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] text-gray-400 hover:bg-white hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-all"
                            title="Restore to queue"
                          >
                            <RotateCcw className="h-3 w-3" />
                            Undo
                          </button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </GlassCard>

        {/* Module 3 + 4: Hot Accounts & Inbox Highlights side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Hot Accounts */}
          <GlassCard className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-[#FFD600]" />
                <h3 className="text-gray-800">Hot Accounts</h3>
              </div>
              <button onClick={() => router.push('/accounts')} className="text-xs text-[#2563EB] hover:text-[#1D4ED8] transition-colors flex items-center gap-0.5">
                View all <ChevronRight className="h-3 w-3" />
              </button>
            </div>
            <div className="space-y-1.5">
              {hotAccounts.map((account) => {
                const accountPeople = people.filter(p => p.accountId === account.id);
                return (
                  <div
                    key={account.id}
                    className="group flex items-center justify-between rounded-xl px-3 py-2.5 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => router.push('/accounts')}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[11px] text-blue-600" style={{ fontWeight: 500 }}>
                        {account.company.slice(0, 2)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-800">{account.company}</span>
                          <span className="text-[11px] text-gray-400" style={{ fontWeight: 500 }}>{account.signalScore}</span>
                        </div>
                        <p className="text-[11px] text-gray-400 truncate">{account.nextStep}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="flex gap-1">
                        {account.tags.slice(0, 2).map(tag => (
                          <span key={tag} className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-500">{tag}</span>
                        ))}
                      </div>
                      {/* Quick actions on hover */}
                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                        <button className="flex h-6 w-6 items-center justify-center rounded text-gray-400 hover:bg-gray-100 hover:text-gray-600" onClick={e => { e.stopPropagation(); toast.success(`Composing email to ${account.company}`, { description: 'Opening inbox...' }); router.push('/inbox'); }}>
                          <Mail className="h-3 w-3" />
                        </button>
                        <button className="flex h-6 w-6 items-center justify-center rounded text-gray-400 hover:bg-gray-100 hover:text-gray-600" onClick={e => { e.stopPropagation(); const person = accountPeople[0]; toast.success(`Opening LinkedIn for ${person?.name || account.company}`, { description: person?.linkedin || account.domain }); }}>
                          <Linkedin className="h-3 w-3" />
                        </button>
                        <button className="flex h-6 w-6 items-center justify-center rounded text-gray-400 hover:bg-gray-100 hover:text-gray-600" onClick={e => { e.stopPropagation(); const person = accountPeople.find(p => p.phone); toast.success(person ? `Calling ${person.name}` : `No phone on file for ${account.company}`, { description: person?.phone || 'Add a number in the contact record' }); }}>
                          <Phone className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </GlassCard>

          {/* Inbox Highlights */}
          <GlassCard className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-[#2563EB]" />
                <h3 className="text-gray-800">Inbox Highlights</h3>
              </div>
              <button onClick={() => router.push('/inbox')} className="text-xs text-[#2563EB] hover:text-[#1D4ED8] transition-colors flex items-center gap-0.5">
                Open Inbox <ChevronRight className="h-3 w-3" />
              </button>
            </div>
            <div className="space-y-2">
              {inboxHighlights.map((thread) => {
                const chipLabel = thread.unread ? 'Hot' : thread.labels.includes('Needs follow-up') ? 'Needs follow-up' : thread.labels.includes('Waiting') ? 'Waiting' : '';
                const chipVariant = thread.unread ? 'accent' : thread.labels.includes('Needs follow-up') ? 'purple' : 'warning';
                return (
                  <div
                    key={thread.id}
                    className="group flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50/50 p-3 hover:bg-white hover:border-gray-200 transition-all cursor-pointer"
                    onClick={() => router.push('/inbox')}
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[10px] text-blue-600 mt-0.5" style={{ fontWeight: 500 }}>
                      {(thread.from === 'You' ? thread.to : thread.from).split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-800 truncate">{thread.from === 'You' ? thread.to : thread.from}</span>
                        <span className="text-[11px] text-gray-400 shrink-0">{thread.date}</span>
                      </div>
                      <p className="text-xs text-gray-500 truncate mt-0.5">{thread.subject}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        {chipLabel && <StatusChip label={chipLabel} variant={chipVariant as 'accent' | 'purple' | 'warning'} />}
                        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-[10px] text-blue-600 hover:bg-blue-100" onClick={e => { e.stopPropagation(); toast.success(`AI drafting reply to ${thread.from === 'You' ? thread.to : thread.from}`, { description: thread.subject }); router.push('/inbox'); }}>
                            <Sparkles className="h-2.5 w-2.5" />Reply
                          </button>
                          <button className="flex items-center gap-1 rounded-md bg-gray-100 px-2 py-0.5 text-[10px] text-gray-500 hover:bg-gray-200" onClick={e => { e.stopPropagation(); toast.success(`Task created for ${thread.from === 'You' ? thread.to : thread.from}`, { description: `Follow up on: ${thread.subject}` }); router.push('/tasks'); }}>
                            <CheckSquare className="h-2.5 w-2.5" />Task
                          </button>
                        </div>
                      </div>
                    </div>
                    {thread.unread && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#2563EB]" />}
                  </div>
                );
              })}
            </div>
          </GlassCard>
        </div>

        {/* Module 5: Learnings This Week */}
        <GlassCard className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="h-4 w-4 text-[#FFD600]" />
            <h3 className="text-gray-800">Learnings This Week</h3>
            <span className="text-[11px] text-gray-400 ml-1">BDR loop</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Objections */}
            <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-3.5">
              <p className="text-xs text-gray-400 mb-2 uppercase tracking-wider">Top Objections</p>
              <ul className="space-y-1.5">
                {learnings.objections.map((obj, i) => (
                  <li key={i} className="text-xs text-gray-600 leading-relaxed">{obj}</li>
                ))}
              </ul>
            </div>
            {/* What changed */}
            <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-3.5">
              <p className="text-xs text-emerald-600 mb-2 uppercase tracking-wider">What Changed</p>
              <p className="text-xs text-gray-600 leading-relaxed">{learnings.changed}</p>
            </div>
            {/* What improved */}
            <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-3.5">
              <p className="text-xs text-blue-600 mb-2 uppercase tracking-wider">What Improved</p>
              <p className="text-xs text-gray-600 leading-relaxed">{learnings.improved}</p>
            </div>
            {/* Next experiment */}
            <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-3.5">
              <p className="text-xs text-amber-600 mb-2 uppercase tracking-wider">Next Experiment</p>
              <p className="text-xs text-gray-600 leading-relaxed">{learnings.nextExperiment}</p>
            </div>
          </div>
        </GlassCard>

        <ShareModal open={shareOpen} onClose={() => setShareOpen(false)} metrics={scoreboardMetrics} hotAccounts={hotAccounts} />
      </div>
    </DndProvider>
  );
}