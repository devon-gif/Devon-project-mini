import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const videoFile = formData.get('video') as File | null;
    const videoId   = formData.get('videoId') as string | null;

    if (!videoFile || !videoId) {
      return NextResponse.json({ error: 'video and videoId are required' }, { status: 400 });
    }

    const videoExt   = videoFile.name.split('.').pop() ?? 'mp4';
    const videoKey   = `${videoId}/video.${videoExt}`;
    const videoBytes = Buffer.from(await videoFile.arrayBuffer());

    const { error: uploadError } = await supabaseAdmin.storage
      .from('videos')
      .upload(videoKey, videoBytes, {
        contentType: videoFile.type || 'video/mp4',
        upsert: true,
      });

    if (uploadError) throw uploadError;

    const { error: dbError } = await supabaseAdmin
      .from('videos')
      .update({
        storage_video_path: videoKey,
        video_path: videoKey,
        status: 'ready',
      })
      .eq('id', videoId);

    if (dbError) throw dbError;

    return NextResponse.json({ ok: true, storage_video_path: videoKey });
  } catch (err: any) {
    console.error('[upload] error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
