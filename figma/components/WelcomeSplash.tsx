"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Inbox, CheckSquare } from 'lucide-react';
const twillLogo = "/figma/cfb522460dc27b08bb7705cf0b5b5ed312f6b215.png";
import { accounts, emailThreads, tasks } from '../data/mockData';

interface WelcomeSplashProps {
  userName?: string;
  onComplete: (navigateTo?: string) => void;
}

// --- Time-of-day greeting ---
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

// --- Login count tracking for adaptive duration ---
const LOGIN_COUNT_KEY = 'twill_login_count';

function getLoginCount(): number {
  try {
    return parseInt(localStorage.getItem(LOGIN_COUNT_KEY) || '0', 10);
  } catch {
    return 0;
  }
}

function incrementLoginCount(): void {
  try {
    const current = getLoginCount();
    localStorage.setItem(LOGIN_COUNT_KEY, String(current + 1));
  } catch {
    // localStorage unavailable
  }
}

// --- Splash opt-out flag (shared with Settings) ---
const SPLASH_DISABLED_KEY = 'twill_splash_disabled';

export function isSplashDisabled(): boolean {
  try {
    return localStorage.getItem(SPLASH_DISABLED_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setSplashDisabled(disabled: boolean): void {
  try {
    if (disabled) {
      localStorage.setItem(SPLASH_DISABLED_KEY, 'true');
    } else {
      localStorage.removeItem(SPLASH_DISABLED_KEY);
    }
  } catch {
    // localStorage unavailable
  }
}

// --- Compute live stats from mock data ---
const hotAccounts = accounts.filter((a) => a.tags.includes('Hot')).length;
const unreadInbox = emailThreads.filter((t) => t.unread).length;
const todayTasks = tasks.filter(
  (t) => t.dueDate === 'Today' && t.status !== 'done'
).length;

const stats = [
  { icon: Flame, label: 'Hot Leads', value: hotAccounts, color: '#EF4444', route: '/accounts' },
  { icon: Inbox, label: 'Unread Replies', value: unreadInbox, color: '#2563EB', route: '/inbox' },
  { icon: CheckSquare, label: 'Tasks Due Today', value: todayTasks, color: '#F59E0B', route: '/tasks' },
];

// --- Duration tiers based on login count ---
function getDurations(loginCount: number) {
  if (loginCount === 0) {
    return { holdMs: 4000, fadeMs: 800, statsDelay: 1.0, statsStagger: 0.15, barDuration: 3.4 };
  }
  if (loginCount <= 4) {
    return { holdMs: 3000, fadeMs: 700, statsDelay: 0.8, statsStagger: 0.12, barDuration: 2.4 };
  }
  return { holdMs: 2000, fadeMs: 600, statsDelay: 0.5, statsStagger: 0.1, barDuration: 1.4 };
}

// --- Rolling counter component ---
function RollingCounter({
  value,
  delay,
  color,
}: {
  value: number;
  delay: number;
  color: string;
}) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const duration = 700;
      const startTime = performance.now();

      function step(currentTime: number) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // easeOutExpo curve
        const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        setDisplay(Math.round(eased * value));
        if (progress < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }, delay * 1000);

    return () => clearTimeout(timeout);
  }, [value, delay]);

  return (
    <span className="text-sm tabular-nums" style={{ color, fontWeight: 600 }}>
      {display}
    </span>
  );
}

export function WelcomeSplash({ userName, onComplete }: WelcomeSplashProps) {
  const [phase, setPhase] = useState<'showing' | 'fading'>('showing');
  const [loginCount] = useState(() => getLoginCount());
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const dismissedRef = useRef(false);

  const durations = getDurations(loginCount);
  const isFirstLogin = loginCount === 0;
  const greeting = getGreeting();

  // Increment login count on mount
  useEffect(() => {
    incrementLoginCount();
  }, []);

  // Dismiss helper — triggers fade and fires onComplete after fade
  const dismiss = useCallback(
    (navigateTo?: string) => {
      if (dismissedRef.current) return;
      dismissedRef.current = true;

      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];

      setPhase('fading');
      const t = setTimeout(() => {
        onComplete(navigateTo);
      }, durations.fadeMs);
      timersRef.current.push(t);
    },
    [onComplete, durations.fadeMs]
  );

  // Auto-dismiss after hold duration
  useEffect(() => {
    const holdTimer = setTimeout(() => {
      dismiss();
    }, durations.holdMs);
    timersRef.current.push(holdTimer);

    return () => {
      timersRef.current.forEach(clearTimeout);
    };
  }, [dismiss, durations.holdMs]);

  const handlePillClick = (route: string) => {
    dismiss(route);
  };

  const handleSkip = () => {
    dismiss();
  };

  const handleDontShowAgain = () => {
    setSplashDisabled(true);
    dismiss();
  };

  return (
    <AnimatePresence>
      {phase === 'showing' && (
        <motion.div
          key="splash"
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: durations.fadeMs / 1000, ease: 'easeInOut' }}
        >
          {/* Subtle background accents */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              className="absolute -top-32 -right-32 h-64 w-64 rounded-full bg-[#FFD600]/12 blur-3xl"
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
            />
            <motion.div
              className="absolute -bottom-32 -left-32 h-64 w-64 rounded-full bg-[#2563EB]/8 blur-3xl"
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.2, ease: 'easeOut', delay: 0.2 }}
            />
          </div>

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center gap-6">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{
                duration: 0.7,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <img
                src={twillLogo}
                alt="Twill Logo"
                className="h-16 w-auto object-contain"
              />
            </motion.div>

            {/* Greeting text — time-of-day aware + first-time vs. returning */}
            <motion.div
              className="flex flex-col items-center gap-2"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.6,
                ease: [0.22, 1, 0.36, 1],
                delay: 0.4,
              }}
            >
              <h1 className="text-gray-900 text-center">
                {greeting}{userName ? `, ${userName}` : ''}!
              </h1>
              <p className="text-gray-500 text-center">
                {isFirstLogin
                  ? 'Welcome to Twill BDR CRM'
                  : 'Welcome back to Mission Control'}
              </p>
            </motion.div>

            {/* Stats preview — clickable pills with rolling counters */}
            <motion.div
              className="flex items-center gap-4 mt-2"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                ease: [0.22, 1, 0.36, 1],
                delay: durations.statsDelay,
              }}
            >
              {stats.map((stat, i) => {
                const pillDelay = durations.statsDelay + 0.1 + i * durations.statsStagger;
                return (
                  <motion.button
                    key={stat.label}
                    onClick={() => handlePillClick(stat.route)}
                    className="flex items-center gap-2.5 rounded-xl border border-gray-200 bg-gray-50/80 px-4 py-2.5 cursor-pointer transition-all duration-150 hover:border-gray-300 hover:bg-white hover:shadow-sm active:scale-[0.97]"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.4,
                      ease: [0.22, 1, 0.36, 1],
                      delay: pillDelay,
                    }}
                    whileHover={{ y: -2 }}
                  >
                    <stat.icon
                      className="h-4 w-4 shrink-0"
                      style={{ color: stat.color }}
                    />
                    <span className="text-sm text-gray-500">{stat.label}</span>
                    <RollingCounter
                      value={stat.value}
                      delay={pillDelay + 0.2}
                      color={stat.color}
                    />
                  </motion.button>
                );
              })}
            </motion.div>

            {/* Hint for clickable pills */}
            <motion.p
              className="text-xs text-gray-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                duration: 0.4,
                delay: durations.statsDelay + 0.5,
              }}
            >
              Click a stat to jump straight in
            </motion.p>

            {/* Animated progress bar */}
            <motion.div
              className="mt-2 h-1 w-48 overflow-hidden rounded-full bg-gray-100"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.3 }}
            >
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-[#FFD600] to-[#2563EB]"
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{
                  duration: durations.barDuration,
                  delay: 0.3,
                  ease: [0.22, 1, 0.36, 1],
                }}
              />
            </motion.div>

            {/* Skip / Don't show again links */}
            <motion.div
              className="flex items-center gap-3 mt-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.8 }}
            >
              <button
                onClick={handleSkip}
                className="text-xs text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              >
                Skip
              </button>
              <span className="text-gray-200">|</span>
              <button
                onClick={handleDontShowAgain}
                className="text-xs text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              >
                Don't show again
              </button>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
