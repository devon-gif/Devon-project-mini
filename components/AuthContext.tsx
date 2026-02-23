"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type UserLite = {
  id: string;
  email?: string | null;
};

type AuthContextValue = {
  isAuthenticated: boolean;
  user: UserLite | null;
  justLoggedIn: boolean;
  clearJustLoggedIn: () => void;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const [user, setUser] = useState<UserLite | null>(null);
  const [justLoggedIn, setJustLoggedIn] = useState(false);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getUser().then(({ data }) => {
      if (!mounted) return;
      const u = data.user;
      setUser(u ? { id: u.id, email: u.email } : null);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null;
      setUser(u ? { id: u.id, email: u.email } : null);
      if (_event === "SIGNED_IN") setJustLoggedIn(true);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [supabase]);

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated: !!user,
      user,
      justLoggedIn,
      clearJustLoggedIn: () => setJustLoggedIn(false),
      logout: async () => {
        await supabase.auth.signOut();
        setUser(null);
      },
    }),
    [user, justLoggedIn, supabase]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}