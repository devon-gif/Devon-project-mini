import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import TaskBoardClient from "./TaskBoardClient";

export default async function TasksPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/login");

  const admin = createAdminClient();

  const { data: accounts } = await admin
    .from("accounts")
    .select("id,name")
    .order("score", { ascending: false })
    .limit(200);

  const { data: tasks, error } = await admin
    .from("tasks")
    .select("id,title,status,priority,due_date,created_at, accounts(name)")
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) {
    return (
      <div style={{ maxWidth: 1100, margin: "40px auto", padding: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 900 }}>Tasks</h1>
        <p style={{ color: "crimson" }}>Error: {error.message}</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: "40px auto", padding: 24 }}>
      <h1 style={{ fontSize: 28, fontWeight: 900 }}>Tasks</h1>
      <p style={{ opacity: 0.7, marginTop: 6 }}>Add tasks + move across columns.</p>

      <TaskBoardClient initialTasks={(tasks ?? []) as any} accounts={(accounts ?? []) as any} />
    </div>
  );
}