"use client";

import { useMemo, useState } from "react";

type Task = {
  id: string;
  title: string;
  status: "todo" | "in_progress" | "done";
  priority: "hot" | "warm" | "cold";
  due_date: string | null;
  accounts?: { name?: string } | null;
};

type Account = { id: string; name: string };

export default function TaskBoardClient({
  initialTasks,
  accounts,
}: {
  initialTasks: Task[];
  accounts: Account[];
}) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [title, setTitle] = useState("");
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? "");
  const [priority, setPriority] = useState<"hot" | "warm" | "cold">("warm");
  const [statusMsg, setStatusMsg] = useState("");

  const grouped = useMemo(() => {
    const todo = tasks.filter((t) => t.status === "todo");
    const inProgress = tasks.filter((t) => t.status === "in_progress");
    const done = tasks.filter((t) => t.status === "done");
    return { todo, inProgress, done };
  }, [tasks]);

  async function createTask() {
    if (!title.trim()) return;
    setStatusMsg("Creating…");

    const res = await fetch("/api/tasks/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        account_id: accountId || null,
        priority,
        status: "todo",
        type: "follow_up",
      }),
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setStatusMsg(`Error: ${json?.error || "failed"}`);
      return;
    }

    setTasks((prev) => [json.task, ...prev]);
    setTitle("");
    setStatusMsg("✅ Added!");
    setTimeout(() => setStatusMsg(""), 1200);
  }

  async function moveTask(id: string, nextStatus: Task["status"]) {
    setStatusMsg("Updating…");
    const res = await fetch("/api/tasks/update-status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: nextStatus }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setStatusMsg(`Error: ${json?.error || "failed"}`);
      return;
    }

    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status: nextStatus } : t)));
    setStatusMsg("✅ Updated!");
    setTimeout(() => setStatusMsg(""), 900);
  }

  const Column = ({
    title,
    items,
    onNext,
  }: {
    title: string;
    items: Task[];
    onNext: (id: string) => void;
  }) => (
    <div style={{ border: "1px solid #333", borderRadius: 12, overflow: "hidden" }}>
      <div style={{ padding: 12, fontWeight: 900, borderBottom: "1px solid #333" }}>
        {title} <span style={{ opacity: 0.7 }}>({items.length})</span>
      </div>

      <div>
        {items.map((t) => (
          <div key={t.id} style={{ padding: 12, borderBottom: "1px solid #222" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
              <div style={{ fontWeight: 800 }}>{t.title}</div>
              <button onClick={() => onNext(t.id)} style={btnSmall}>
                Move →
              </button>
            </div>

            <div style={{ opacity: 0.75, fontSize: 12, marginTop: 4 }}>
              {t.accounts?.name ? `${t.accounts.name} • ` : ""}
              {t.priority?.toUpperCase()}
              {t.due_date ? ` • due ${t.due_date}` : ""}
            </div>
          </div>
        ))}
        {items.length === 0 && <div style={{ padding: 12, opacity: 0.7 }}>No tasks.</div>}
      </div>
    </div>
  );

  return (
    <div>
      {/* Add Task */}
      <div style={{ border: "1px solid #333", borderRadius: 12, padding: 14, marginTop: 16 }}>
        <div style={{ fontWeight: 900, marginBottom: 10 }}>Add Task</div>

        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 10 }}>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Follow up with Sarah Chen"
            style={input}
          />

          <select value={accountId} onChange={(e) => setAccountId(e.target.value)} style={input}>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>

          <select value={priority} onChange={(e) => setPriority(e.target.value as any)} style={input}>
            <option value="hot">Hot</option>
            <option value="warm">Warm</option>
            <option value="cold">Cold</option>
          </select>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 12 }}>
          <button onClick={createTask} style={btnPrimary}>
            + Add Task
          </button>
          <div style={{ fontSize: 12, opacity: 0.8 }}>{statusMsg}</div>
        </div>
      </div>

      {/* Kanban */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginTop: 16 }}>
        <Column title="To Do" items={grouped.todo} onNext={(id) => moveTask(id, "in_progress")} />
        <Column title="In Progress" items={grouped.inProgress} onNext={(id) => moveTask(id, "done")} />
        <Column title="Done" items={grouped.done} onNext={(id) => moveTask(id, "todo")} />
      </div>
    </div>
  );
}

const input: React.CSSProperties = {
  padding: "10px 10px",
  borderRadius: 10,
  border: "1px solid #333",
  background: "transparent",
  color: "inherit",
};

const btnPrimary: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #333",
  cursor: "pointer",
  background: "transparent",
  fontWeight: 900,
};

const btnSmall: React.CSSProperties = {
  padding: "6px 10px",
  borderRadius: 10,
  border: "1px solid #333",
  cursor: "pointer",
  background: "transparent",
  fontWeight: 800,
  fontSize: 12,
};