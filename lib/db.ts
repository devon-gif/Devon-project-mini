/**
 * SQLite (local-first) for videos, people, events.
 * DB file: ./data/app.db (created if missing).
 * Uses dynamic require so the app builds even when better-sqlite3 is not installed (e.g. Vercel).
 */
import * as fs from "fs";
import * as path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "app.db");

type SqliteDatabase = {
  prepare: (sql: string) => { run: (...args: unknown[]) => unknown; get: (...args: unknown[]) => unknown; all: (...args: unknown[]) => unknown[] };
  exec: (sql: string) => void;
};

let db: SqliteDatabase | null = null;

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function initTables(database: SqliteDatabase) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS people (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      title TEXT,
      company TEXT,
      email TEXT,
      linkedin_url TEXT,
      website_url TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS videos (
      id TEXT PRIMARY KEY,
      prospect_id TEXT,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      recipient_name TEXT,
      recipient_email TEXT,
      recipient_company TEXT,
      cta_type TEXT,
      cta_url TEXT,
      cta_label TEXT,
      video_path TEXT,
      gif_path TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      sent_at TEXT,
      status TEXT NOT NULL DEFAULT 'draft'
    );

    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      video_id TEXT NOT NULL,
      type TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      meta_json TEXT,
      FOREIGN KEY (video_id) REFERENCES videos(id)
    );

    CREATE TABLE IF NOT EXISTS video_forwards (
      id TEXT PRIMARY KEY,
      video_id TEXT NOT NULL,
      recipient_name TEXT NOT NULL,
      recipient_email TEXT NOT NULL,
      note TEXT,
      viewer_session_id TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (video_id) REFERENCES videos(id)
    );

    CREATE INDEX IF NOT EXISTS idx_events_video_id ON events(video_id);
    CREATE INDEX IF NOT EXISTS idx_events_created_at ON events(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_videos_slug ON videos(slug);
    CREATE INDEX IF NOT EXISTS idx_video_forwards_video_id ON video_forwards(video_id);
  `);
  try {
    database.exec("ALTER TABLE people ADD COLUMN website_url TEXT");
  } catch {
    // column may already exist
  }
  try {
    database.exec("ALTER TABLE videos ADD COLUMN prospect_id TEXT");
  } catch {
    // column may already exist
  }
}

export function getDb(): SqliteDatabase {
  if (db) return db;
  try {
    const Database = require("better-sqlite3") as new (path: string) => SqliteDatabase;
    ensureDataDir();
    db = new Database(DB_PATH);
    initTables(db);
    return db;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    throw new Error(
      `SQLite unavailable: ${msg}. Install with: npm install better-sqlite3. On Vercel, use Supabase (do not set USE_LOCAL_VIDEOS).`
    );
  }
}

export type PersonRow = {
  id: string;
  name: string;
  title: string | null;
  company: string | null;
  email: string | null;
  linkedin_url: string | null;
  website_url: string | null;
  created_at: string | null;
};

export type VideoRow = {
  id: string;
  prospect_id: string | null;
  title: string;
  slug: string;
  recipient_name: string | null;
  recipient_email: string | null;
  recipient_company: string | null;
  cta_type: string | null;
  cta_url: string | null;
  cta_label: string | null;
  video_path: string | null;
  gif_path: string | null;
  created_at: string | null;
  sent_at: string | null;
  status: string;
};

export type EventRow = {
  id: string;
  video_id: string;
  type: string;
  created_at: string | null;
  meta_json: string | null;
};

export function getVideoBySlug(slug: string): VideoRow | undefined {
  const row = getDb().prepare("SELECT * FROM videos WHERE slug = ?").get(slug) as VideoRow | undefined;
  return row;
}

export function getVideoById(id: string): VideoRow | undefined {
  const row = getDb().prepare("SELECT * FROM videos WHERE id = ?").get(id) as VideoRow | undefined;
  return row;
}

export function listVideos(): VideoRow[] {
  return getDb().prepare("SELECT * FROM videos ORDER BY created_at DESC").all() as VideoRow[];
}

export function listPeople(): PersonRow[] {
  return getDb().prepare("SELECT * FROM people ORDER BY name").all() as PersonRow[];
}

export function insertPerson(row: Omit<PersonRow, "created_at">): void {
  getDb()
    .prepare(
      "INSERT INTO people (id, name, title, company, email, linkedin_url, website_url) VALUES (?, ?, ?, ?, ?, ?, ?)"
    )
    .run(
      row.id,
      row.name,
      row.title ?? null,
      row.company ?? null,
      row.email ?? null,
      row.linkedin_url ?? null,
      row.website_url ?? null
    );
}

export function peopleCount(): number {
  const row = getDb().prepare("SELECT COUNT(*) as c FROM people").get() as { c: number };
  return row?.c ?? 0;
}

export function videosCount(): number {
  const row = getDb().prepare("SELECT COUNT(*) as c FROM videos").get() as { c: number };
  return row?.c ?? 0;
}

export function listEventsByVideoId(videoId: string): EventRow[] {
  return getDb()
    .prepare("SELECT * FROM events WHERE video_id = ? ORDER BY created_at DESC")
    .all(videoId) as EventRow[];
}

export function insertVideo(row: Omit<VideoRow, "created_at"> & { prospect_id?: string | null }): void {
  getDb()
    .prepare(
      `INSERT INTO videos (id, prospect_id, title, slug, recipient_name, recipient_email, recipient_company, cta_type, cta_url, cta_label, video_path, gif_path, sent_at, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      row.id,
      row.prospect_id ?? null,
      row.title,
      row.slug,
      row.recipient_name ?? null,
      row.recipient_email ?? null,
      row.recipient_company ?? null,
      row.cta_type ?? null,
      row.cta_url ?? null,
      row.cta_label ?? null,
      row.video_path ?? null,
      row.gif_path ?? null,
      row.sent_at ?? null,
      row.status
    );
}

export function updateVideoPath(id: string, videoPath: string): void {
  getDb().prepare("UPDATE videos SET video_path = ?, status = 'processing' WHERE id = ?").run(videoPath, id);
}

export function updateVideoGifAndStatus(id: string, gifPath: string): void {
  getDb().prepare("UPDATE videos SET gif_path = ?, status = 'ready' WHERE id = ?").run(gifPath, id);
}

export function updateVideoSent(id: string): void {
  getDb()
    .prepare("UPDATE videos SET sent_at = datetime('now'), status = 'sent' WHERE id = ?")
    .run(id);
}

export function insertEvent(videoId: string, type: string, meta?: unknown): void {
  const id = crypto.randomUUID();
  const metaJson = meta != null ? JSON.stringify(meta) : null;
  getDb().prepare("INSERT INTO events (id, video_id, type, meta_json) VALUES (?, ?, ?, ?)").run(id, videoId, type, metaJson);
}

export function updateVideoStatusFromEvent(videoId: string, eventType: string): void {
  const db = getDb();
  if (eventType === "page_view") {
    db.prepare("UPDATE videos SET status = 'viewed' WHERE id = ? AND status IN ('ready', 'sent')").run(videoId);
  } else if (eventType === "cta_click") {
    db.prepare("UPDATE videos SET status = 'clicked' WHERE id = ?").run(videoId);
  }
}

export function resolveVideoId(slugOrId: string): string | null {
  const bySlug = getVideoBySlug(slugOrId);
  if (bySlug) return bySlug.id;
  const byId = getVideoById(slugOrId);
  return byId ? byId.id : null;
}

export function getEventCountsByVideoId(videoId: string): {
  page_view: number;
  play: number;
  progress_25: number;
  progress_50: number;
  progress_75: number;
  progress_100: number;
  cta_click: number;
} {
  const rows = getDb()
    .prepare("SELECT type, COUNT(*) as cnt FROM events WHERE video_id = ? GROUP BY type")
    .all(videoId) as Array<{ type: string; cnt: number }>;
  const out = {
    page_view: 0,
    play: 0,
    progress_25: 0,
    progress_50: 0,
    progress_75: 0,
    progress_100: 0,
    cta_click: 0,
  };
  for (const r of rows) {
    if (r.type in out) (out as Record<string, number>)[r.type] = r.cnt;
  }
  return out;
}

export type ForwardRow = {
  id: string;
  video_id: string;
  recipient_name: string;
  recipient_email: string;
  note: string | null;
  viewer_session_id: string | null;
  created_at: string | null;
};

export function insertForward(row: Omit<ForwardRow, "id" | "created_at">): void {
  const id = crypto.randomUUID();
  getDb()
    .prepare(
      "INSERT INTO video_forwards (id, video_id, recipient_name, recipient_email, note, viewer_session_id) VALUES (?, ?, ?, ?, ?, ?)"
    )
    .run(
      id,
      row.video_id,
      row.recipient_name,
      row.recipient_email,
      row.note ?? null,
      row.viewer_session_id ?? null
    );
}

export function listForwardsByVideoId(videoId: string): ForwardRow[] {
  return getDb()
    .prepare("SELECT * FROM video_forwards WHERE video_id = ? ORDER BY created_at DESC")
    .all(videoId) as ForwardRow[];
}
