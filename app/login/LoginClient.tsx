"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginClient() {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const searchParams = useSearchParams();

  const redirectTo = searchParams.get("redirectTo") || "/app";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value);
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const eTrim = email.trim();
    if (!eTrim) return setError("Please enter an email.");
    if (!password) return setError("Please enter a password.");

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: eTrim,
        password,
      });
      if (error) throw error;

      router.replace(redirectTo);
      router.refresh();
    } catch (err: unknown) {
      setError((err as { message?: string })?.message || "Login failed.");
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
          onChange={handleEmailChange}
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
          onChange={handlePasswordChange}
          placeholder="Password"
          type="password"
          autoComplete="current-password"
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
          {loading ? "Working..." : "Sign in"}
        </button>

        {error && <div style={{ color: "#ff4d4d", marginTop: 6 }}>{error}</div>}

        <p style={{ marginTop: 12, fontSize: 14, opacity: 0.8 }}>
          This workspace is invite-only. Ask your admin for an invite link.
        </p>
      </form>
    </div>
  );
}