import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { randomUUID } from 'crypto';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));

    const public_token = randomUUID();
    const share_token  = randomUUID();

    const { data, error } = await supabaseAdmin
      .from('videos')
      .insert({
        public_token,
        share_token,
        status: 'pending',
        title: body.title ?? null,
        recipient_name: body.recipient_name ?? null,
        recipient_company: body.recipient_company ?? null,
        recipient_email: body.recipient_email ?? null,
        cta_url: body.cta_url ?? null,
        cta_label: body.cta_label ?? null,
        ...(body.storagePath ? { storage_video_path: body.storagePath, video_path: body.storagePath, status: 'ready' } : {}),
      })
      .select('id, public_token, share_token')
      .single();

    if (error) throw error;

    // Return nested under "video" — matches what CreateVideo.tsx expects
    return NextResponse.json({ video: { id: data.id, public_token: data.public_token, share_token: data.share_token } });
  } catch (err: any) {
    console.error('[create] error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
