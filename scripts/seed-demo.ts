/**
 * Seed demo people and (when DEMO_MODE or videos empty) demo videos + events.
 * Run: npm run seed:demo
 * Uses SQLite at ./data/app.db (created if missing).
 */
import { getDb, peopleCount, insertPerson, videosCount, insertVideo, insertEvent } from "../lib/db";

const DEMO_PEOPLE = [
  { id: "1", name: "Sarah Chen", title: "VP of Engineering", company: "Stripe", linkedin_url: "https://linkedin.com/in/sarahchen", email: "sarah.chen@stripe.com", website_url: "https://stripe.com" },
  { id: "2", name: "Marcus Johnson", title: "Head of Talent", company: "Notion", linkedin_url: "https://linkedin.com/in/marcusjohnson", email: "marcus@notion.so", website_url: "https://notion.so" },
  { id: "3", name: "Emily Park", title: "CTO", company: "Figma", linkedin_url: "https://linkedin.com/in/emilypark", email: "emily.park@figma.com", website_url: "https://figma.com" },
  { id: "4", name: "Alex Rivera", title: "Engineering Manager", company: "Stripe", linkedin_url: null, email: "alex.r@stripe.com", website_url: null },
  { id: "5", name: "Jordan Kim", title: "VP of People", company: "Linear", linkedin_url: "https://linkedin.com/in/jordankim", email: "jordan@linear.app", website_url: "https://linear.app" },
  { id: "6", name: "Priya Patel", title: "Director of Engineering", company: "Vercel", linkedin_url: null, email: "priya@vercel.com", website_url: "https://vercel.com" },
  { id: "7", name: "David Zhang", title: "Chief People Officer", company: "Databricks", linkedin_url: "https://linkedin.com/in/davidzhang", email: "dzhang@databricks.com", website_url: "https://databricks.com" },
];

const DEMO_VIDEOS = [
  { id: "demo-v1", title: "Stripe — Sarah", slug: "stripe-sarah-demo1", recipient_name: "Sarah Chen", recipient_company: "Stripe", recipient_email: "sarah.chen@stripe.com", cta_type: "book", cta_url: "https://cal.com", cta_label: "Book 12 min", video_path: null, gif_path: null, sent_at: new Date().toISOString(), status: "clicked" as const },
  { id: "demo-v2", title: "Notion — Marcus", slug: "notion-marcus-demo2", recipient_name: "Marcus Johnson", recipient_company: "Notion", recipient_email: "marcus@notion.so", cta_type: "book", cta_url: "https://cal.com", cta_label: "Book a call", video_path: null, gif_path: null, sent_at: new Date().toISOString(), status: "viewed" as const },
];

function seedPeople() {
  const count = peopleCount();
  if (count > 0) {
    console.log(`People: ${count} row(s) already. Skipping people seed.`);
    return;
  }
  for (const p of DEMO_PEOPLE) {
    insertPerson(p);
  }
  console.log(`Seeded ${DEMO_PEOPLE.length} demo people.`);
}

function seedDemoVideos() {
  const count = videosCount();
  if (count > 0) {
    console.log(`Videos: ${count} row(s) already. Skipping demo videos.`);
    return;
  }
  for (const v of DEMO_VIDEOS) {
    insertVideo(v);
  }
  insertEvent("demo-v1", "page_view");
  insertEvent("demo-v1", "play");
  insertEvent("demo-v1", "progress_25");
  insertEvent("demo-v1", "progress_50");
  insertEvent("demo-v1", "progress_75");
  insertEvent("demo-v1", "cta_click");
  insertEvent("demo-v2", "page_view");
  insertEvent("demo-v2", "play");
  insertEvent("demo-v2", "progress_25");
  insertEvent("demo-v2", "progress_50");
  console.log(`Seeded ${DEMO_VIDEOS.length} demo videos and sample events.`);
}

function main() {
  getDb();
  seedPeople();
  seedDemoVideos();
}

main();
