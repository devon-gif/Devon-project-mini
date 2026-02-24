import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import ShareButton from "./ShareButton";

type Task = {
  id: string;
  title: string;
  status: "todo" | "in_progress" | "done";
  priority: "hot" | "warm" | "cold";
  created_at: string;
  due_date: string | null;
  accounts?: { name?: string } | null;
};

export default async function MissionControl() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data?.user) redirect("/login");

  const admin = createAdminClient();

  // ===== 7-day metrics (simple + impressive) =====
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [{ count: tasksCreated }, { count: tasksDone }, { count: activityCount }] = await Promise.all([
    admin.from("tasks").select("*", { count: "exact", head: true }).gte("created_at", since),
    admin.from("tasks").select("*", { count: "exact", head: true }).eq("status", "done").gte("created_at", since),
    admin.from("activity_events").select("*", { count: "exact", head: true }).gte("created_at", since),
  ]);

  const accountsTouched =
    activityCount && activityCount > 0
      ? (
          await admin
            .from("activity_events")
            .select("account_id")
            .gte("created_at", since)
        ).data
          ?.map((x) => x.account_id)
          .filter(Boolean)
      : [];

  const uniqueAccountsTouched = new Set(accountsTouched ?? []).size;

  // ===== “Do Next” = open tasks ordered by priority then recency =====
  const { data: openTasks } = await admin
    .from("tasks")
    .select("id,title,status,priority,created_at,due_date, accounts(name)")
    .in("status", ["todo", "in_progress"])
    .order("created_at", { ascending: false })
    .limit(50);

  const hot = (openTasks ?? []).filter((t: any) => t.priority === "hot");
  const warm = (openTasks ?? []).filter((t: any) => t.priority !== "hot");

  const email = data.user.email ?? "you";

  return (
    <div style={{ maxWidth: 1200, margin: "40px auto", padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: 30, fontWeight: 900, margin: 0 }}>Good morning, {email.split("@")[0]}</h1>
          <div style={{ opacity: 0.7, marginTop: 6 }}>
            {hot.length + warm.length} actions waiting • {hot.length} hot • {warm.length} warm
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <ShareButton />
        </div>
      </div>

      {/* Scoreboard */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12, marginTop: 18 }}>
        <Metric label="Accounts Touched (7d)" value={String(uniqueAccountsTouched)} />
        <Metric label="Tasks Created (7d)" value={String(tasksCreated ?? 0)} />
        <Metric label="Touches Logged (7d)" value={String(activityCount ?? 0)} />
        <Metric label="Tasks Done (7d)" value={String(tasksDone ?? 0)} />
        <Metric label="Replies (7d)" value={"—"} />
      </div>

      {/* Do Next */}
      <div style={{ marginTop: 18, border: "1px solid #333", borderRadius: 14, overflow: "hidden" }}>
        <div style={{ padding: 14, fontWeight: 900, borderBottom: "1px solid #333" }}>Do Next</div>

        <Section title={`🔥 Hot (${hot.length})`} items={hot as any} />
        <Section title={`🟡 Warm (${warm.length})`} items={warm as any} />
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ border: "1px solid #333", borderRadius: 14, padding: 14 }}>
      <div style={{ fontSize: 12, opacity: 0.75 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 900, marginTop: 6 }}>{value}</div>
    </div>
  );
}

function Section({ title, items }: { title: string; items: Task[] }) {
  return (
    <div style={{ borderTop: "1px solid #222" }}>
      <div style={{ padding: 12, fontWeight: 900, background: "rgba(255,255,255,0.03)" }}>{title}</div>
      {items.length === 0 ? (
        <div style={{ padding: 12, opacity: 0.7 }}>Nothing here.</div>
      ) : (
        items.slice(0, 10).map((t) => (
          <div
            key={t.id}
            style={{
              padding: 12,
              borderTop: "1px solid #222",
              display: "flex",
              justifyContent: "space-between",
              gap: 10,
            }}
          >
            <div>
              <div style={{ fontWeight: 800 }}>{t.title}</div>
              <div style={{ fontSize: 12, opacity: 0.75, marginTop: 4 }}>
                {t.accounts?.name ? `${t.accounts.name} • ` : ""}
                {t.status === "in_progress" ? "In progress" : "To do"}
                {t.due_date ? ` • due ${t.due_date}` : ""}
              </div>
            </div>

            <a href="/tasks" style={btnLink}>
              Do it →
            </a>
          </div>
        ))
      )}
    </div>
  );
}

const btnLink: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid #333",
  textDecoration: "none",
  color: "inherit",
  fontWeight: 900,
  height: "fit-content",
};