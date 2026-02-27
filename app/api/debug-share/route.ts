import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get('token');
  if (!token) return NextResponse.json({ error: 'no token' });
  const { data: video, error } = await supabaseAdmin
    .from('videos')
    .select('id, storage_video_path, video_path, status, public_token, share_token')
    .or(`public_token.eq.${token},share_token.eq.${token}`)
    .maybeSingle();
  if (error) return NextResponse.json({ step: 'db_error', error });
  if (!video) return NextResponse.json({ step: 'not_found', token });
  const storagePath = video.storage_video_path || video.video_path;
  if (!storagePath) return NextResponse.json({ step: 'no_path', video });
  const { data: signed, error: signErr } = await supabaseAdmin.storage
    .from('videos').createSignedUrl(storagePath, 3600);
  if (signErr || !signed?.signedUrl) return NextResponse.json({ step: 'sign_failed', signErr, storagePath });
  return NextResponse.json({ step: 'ok', storagePath, signedUrl: signed.signedUrl });
}
