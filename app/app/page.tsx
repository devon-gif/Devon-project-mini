import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function MissionControl() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) redirect("/login");

  return (
    <div style={{ maxWidth: 900, margin: "40px auto", padding: 24 }}>
      <h1 style={{ fontSize: 30, fontWeight: 800 }}>Mission Control</h1>
      <p style={{ opacity: 0.75 }}>
        Logged in as <b>{data.user.email}</b>
      </p>

      <form action="/auth/signout" method="post" style={{ marginTop: 16 }}>
        <button style={{ padding: 10, borderRadius: 10, border: "1px solid #333" }}>
          Log out
        </button>
      </form>
    </div>
  );
}