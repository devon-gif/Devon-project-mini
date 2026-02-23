"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginClient() {
  const router = useRouter();
  const params = useSearchParams();
  const redirectTo = params.get("redirectTo") || "/app";

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);

    const supabase = createClient();
    const res =
      mode === "signin"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });

    setLoading(false);

    if (res.error) return setMsg(res.error.message);
    router.push(redirectTo);
  }

  return (
    <div style={{ maxWidth: 420, margin: "80px auto", padding: 24 }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 6 }}>
        Twill Mini CRM
      </h1>
      <p style={{ opacity: 0.7, marginBottom: 18 }}>
        {mode === "signin" ? "Sign in to continue." : "Create your account."}
      </p>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 10 }}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ padding: 12, borderRadius: 10, border: "1px solid #333" }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ padding: 12, borderRadius: 10, border: "1px solid #333" }}
        />

        <button disabled={loading} style={{ padding: 12, borderRadius: 10 }}>
          {loading ? "Working..." : mode === "signin" ? "Sign in" : "Create account"}
        </button>

        {msg ? <div style={{ color: "tomato", fontSize: 14 }}>{msg}</div> : null}
      </form>

      <div style={{ marginTop: 14, fontSize: 14 }}>
        {mode === "signin" ? (
          <>
            No account?{" "}
            <button
              onClick={() => setMode("signup")}
              style={{
                background: "none",
                border: "none",
                textDecoration: "underline",
                cursor: "pointer",
              }}
            >
              Create one
            </button>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <button
              onClick={() => setMode("signin")}
              style={{
                background: "none",
                border: "none",
                textDecoration: "underline",
                cursor: "pointer",
              }}
            >
              Sign in
            </button>
          </>
        )}
      </div>
    </div>
  );
}