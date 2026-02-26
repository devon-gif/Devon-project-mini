import { notFound } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase-server';
import ShareVideoClient from '@/app/share/ShareVideoClient';

const SIGNED_URL_TTL = 60 * 60;

interface Props {
  params: Promise<{ token: string }>;
}

export default async function SharePage({ params }: Props) {
  const { token } = await params;

  const { data: video, error } = await supabaseAdmin
    .from('videos')
    .select('id, storage_video_path, video_path, cover_path, status, cta_text, cta_url, cta_label, recipient_name, recipient_company, share_token, public_token')
    .or(`public_token.eq.${token},share_token.eq.${token}`)
    .maybeSingle();

  if (error) {
    console.error('[share] db error:', error);
    return notFound();
  }
  if (!video) {
    console.error('[share] no video found for token:', token);
    return notFound();
  }

  const storagePath = video.storage_video_path || video.video_path;
  if (!storagePath) {
    console.error('[share] video row has no storage_video_path, video id:', video.id);
    return notFound();
  }

  const { data: signed, error: signErr } = await supabaseAdmin.storage
    .from('videos')
    .createSignedUrl(storagePath, SIGNED_URL_TTL);

  if (signErr || !signed?.signedUrl) {
    console.error('[share] signed URL error:', signErr);
    return notFound();
  }

  let coverUrl: string | null = null;
  if (video.cover_path) {
    const { data: cover } = await supabaseAdmin.storage
      .from('covers')
      .createSignedUrl(video.cover_path, SIGNED_URL_TTL);
    coverUrl = cover?.signedUrl ?? null;
  }

  return (
    <ShareVideoClient
      slug={video.share_token ?? video.public_token ?? token}
      recipientName={video.recipient_name ?? null}
      recipientCompany={video.recipient_company ?? null}
      videoPath={signed.signedUrl}
      ctaUrl={video.cta_url ?? null}
      ctaLabel={video.cta_label ?? video.cta_text ?? null}
    />
  );
}
