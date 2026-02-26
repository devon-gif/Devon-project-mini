import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function POST(req: Request) {
  try {
    const formData  = await req.formData();
    const videoFile = (formData.get('file') ?? formData.get('video')) as File | null;
    const videoId   = formData.get('videoId') as string | null;

    console.log('[upload] videoId:', videoId, 'file:', videoFile?.name, 'size:', videoFile?.size);

    if (!videoFile) {
      return NextResponse.json({ error: 'video file is required' }, { status: 400 });
    }

    const videoExt   = videoFile.name.split('.').pop() ?? 'mp4';
    const key        = videoId ? `${videoId}/video.${videoExt}` : `uploads/${Date.now()}.${videoExt}`;
    const videoBytes = Buffer.from(await videoFile.arrayBuffer());

    console.log('[upload] uploading to bucket key:', key, 'bytes:', videoBytes.length);

    const { data: storageData, error: uploadError } = await supabaseAdmin.storage
      .from('videos')
      .upload(key, videoBytes, { contentType: videoFile.type || 'video/mp4', upsert: true });

    if (uploadError) {
      console.error('[upload] storage error:', uploadError);
      throw uploadError;
    }

    console.log('[upload] storage success:', storageData);

    if (videoId) {
      const { error: dbError } = await supabaseAdmin
        .from('videos')
        .update({ storage_video_path: key, video_path: key, status: 'ready' })
        .eq('id', videoId);
      if (dbError) {
        console.error('[upload] db update error:', dbError);
        throw dbError;
      }
      console.log('[upload] db updated for videoId:', videoId);
    }

    return NextResponse.json({ ok: true, storagePath: key, storage_video_path: key });
  } catch (err: any) {
    console.error('[upload] fatal error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
