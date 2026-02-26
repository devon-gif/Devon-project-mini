import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function POST(req: Request) {
  try {
    const formData  = await req.formData();
    // Frontend sends field as 'file'; also accept 'video' as fallback
    const videoFile = (formData.get('file') ?? formData.get('video')) as File | null;
    const videoId   = formData.get('videoId') as string | null;

    if (!videoFile) {
      return NextResponse.json({ error: 'video file is required' }, { status: 400 });
    }

    const videoExt   = videoFile.name.split('.').pop() ?? 'mp4';
    const key        = videoId ? `${videoId}/video.${videoExt}` : `uploads/${Date.now()}.${videoExt}`;
    const videoBytes = Buffer.from(await videoFile.arrayBuffer());

    const { error: uploadError } = await supabaseAdmin.storage
      .from('videos')
      .upload(key, videoBytes, { contentType: videoFile.type || 'video/mp4', upsert: true });

    if (uploadError) throw uploadError;

    // If we have a videoId, update the DB row immediately
    if (videoId) {
      const { error: dbError } = await supabaseAdmin
        .from('videos')
        .update({ storage_video_path: key, video_path: key, status: 'ready' })
        .eq('id', videoId);
      if (dbError) throw dbError;
    }

    return NextResponse.json({ ok: true, storagePath: key, storage_video_path: key });
  } catch (err: any) {
    console.error('[upload] error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
