"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginClient() {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const searchParams = useSearchParams();

  const redirectTo = searchParams.get("redirectTo") || "/app";

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const eTrim = email.trim();
    if (!eTrim) return setError("Please enter an email.");
    if (!password) return setError("Please enter a password.");

    setLoading(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({
          email: eTrim,
          password,
        });
        if (error) throw error;

        router.replace(redirectTo);
        router.refresh();
      } else {
        const { error } = await supabase.auth.signUp({
          email: eTrim,
          password,
        });
        if (error) throw error;

        // If email confirmations are ON, user may need to confirm.
        // Still send them to the app — middleware will gate if not authed.
        router.replace(redirectTo);
        router.refresh();
      }
    } catch (err: any) {
      setError(err?.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 520, margin: "80px auto", padding: 24 }}>
      <h1 style={{ fontSize: 44, fontWeight: 800, marginBottom: 8 }}>Twill Mini CRM</h1>
      <p style={{ opacity: 0.7, marginBottom: 22 }}>Sign in to continue.</p>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 14 }}>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          autoComplete="email"
          style={{
            padding: "16px 18px",
            borderRadius: 14,
            border: "1px solid #333",
            background: "#fff7c2",
            fontSize: 18,
          }}
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          type="password"
          autoComplete={mode === "signin" ? "current-password" : "new-password"}
          style={{
            padding: "16px 18px",
            borderRadius: 14,
            border: "1px solid #333",
            background: "#fff7c2",
            fontSize: 18,
          }}
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            marginTop: 6,
            padding: "12px 14px",
            borderRadius: 14,
            border: "1px solid #333",
            background: "transparent",
            cursor: "pointer",
            fontSize: 18,
            fontWeight: 700,
          }}
        >
          {loading ? "Working..." : mode === "signin" ? "Sign in" : "Create account"}
        </button>

        {error && <div style={{ color: "#ff4d4d", marginTop: 6 }}>{error}</div>}

        <div style={{ marginTop: 12, fontSize: 14 }}>
          {mode === "signin" ? (
            <>
              No account?{" "}
              <button
                type="button"
                onClick={() => setMode("signup")}
                style={{ background: "none", border: "none", textDecoration: "underline", cursor: "pointer" }}
              >
                Create one
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => setMode("signin")}
                style={{ background: "none", border: "none", textDecoration: "underline", cursor: "pointer" }}
              >
                Sign in
              </button>
            </>
          )}
        </div>
      </form>
    </div>
  );
}