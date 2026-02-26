import { notFound } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase-server';

const SIGNED_URL_TTL = 60 * 60;

interface Props {
  params: { token: string };
}

export default async function SharePage({ params }: Props) {
  const { token } = params;

  const { data: video, error } = await supabaseAdmin
    .from('videos')
    .select('id, storage_video_path, video_path, cover_path, status, cta_text, cta_url, cta_label')
    .or(`public_token.eq.${token},share_token.eq.${token}`)
    .maybeSingle();

  if (error || !video) return notFound();

  const storagePath = video.storage_video_path || video.video_path;
  if (!storagePath) return notFound();

  const { data: signed, error: signErr } = await supabaseAdmin.storage
    .from('videos')
    .createSignedUrl(storagePath, SIGNED_URL_TTL);

  if (signErr || !signed?.signedUrl) return notFound();

  let coverUrl: string | null = null;
  if (video.cover_path) {
    const { data: cover } = await supabaseAdmin.storage
      .from('covers')
      .createSignedUrl(video.cover_path, SIGNED_URL_TTL);
    coverUrl = cover?.signedUrl ?? null;
  }

  return (
    <main style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem' }}>
      <video
        src={signed.signedUrl}
        poster={coverUrl ?? undefined}
        controls
        style={{ maxWidth: '100%', maxHeight: '80vh', borderRadius: '8px' }}
      />
      {video.cta_text && video.cta_url && (
        <a href={video.cta_url} style={{ marginTop: '1.5rem', padding: '0.75rem 1.5rem', background: '#000', color: '#fff', borderRadius: '6px', textDecoration: 'none' }}>
          {video.cta_label || video.cta_text}
        </a>
      )}
    </main>
  );
}
