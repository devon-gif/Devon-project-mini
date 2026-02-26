import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCoverPlaybackUrl, getGifPlaybackUrl } from "@/lib/supabase-storage";

/**
 * GET /api/videos/cover/[token] — returns cover image for email embedding.
 * Resolves by public_token. Prefers cover_path (PNG/JPG), falls back to gif_path.
 * Redirects to the image URL so it can be used as <img src="..."> in emails.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  if (!token) return NextResponse.json({ error: "Token required" }, { status: 400 });

  try {
    const admin = createAdminClient();
    let video: { cover_path?: string; gif_path?: string } | null = null;
    const { data: byPublic } = await admin
      .from("videos")
      .select("id, cover_path, gif_path")
      .eq("public_token", token)
      .maybeSingle();
    if (byPublic) video = byPublic;
    if (!video) {
      const { data: byShare } = await admin
        .from("videos")
        .select("id, cover_path, gif_path")
        .eq("share_token", token)
        .maybeSingle();
      if (byShare) video = byShare;
    }
    const error = !video ? { message: "Not found" } : null;

    if (error || !video) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const coverPath = (video.cover_path as string)?.trim();
    const gifPath = (video.gif_path as string)?.trim();

    let url = "";
    if (coverPath) url = await getCoverPlaybackUrl(admin, coverPath);
    if (!url && gifPath) url = await getGifPlaybackUrl(admin, gifPath);

    if (!url) return NextResponse.json({ error: "No cover" }, { status: 404 });

    const accept = request.headers.get("accept") ?? "";
    if (accept.includes("application/json")) {
      return NextResponse.json({ url });
    }
    return NextResponse.redirect(url);
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
