import { notFound } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export default async function SharePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const { data: video } = await supabaseAdmin
    .from('videos')
    .select('id, storage_video_path, video_path, cover_path, cta_url, cta_label, cta_text, recipient_name, recipient_company')
    .or(`public_token.eq.${token},share_token.eq.${token}`)
    .maybeSingle();

  if (!video) return notFound();

  const storagePath = video.storage_video_path || video.video_path;
  if (!storagePath) return notFound();

  const { data: signed } = await supabaseAdmin.storage
    .from('videos')
    .createSignedUrl(storagePath, 3600);

  if (!signed?.signedUrl) return notFound();

  let coverUrl = '';
  if (video.cover_path) {
    const { data: cover } = await supabaseAdmin.storage
      .from('covers')
      .createSignedUrl(video.cover_path, 3600);
    coverUrl = cover?.signedUrl ?? '';
  }

  const recipient = video.recipient_name?.trim() || 'there';
  const company = video.recipient_company?.trim() || 'your company';
  const ctaUrl = video.cta_url || '';
  const ctaLabel = video.cta_label || video.cta_text || 'Book a call';

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Quick idea for {company}</title>
      </head>
      <body style={{ margin: 0, background: '#0e0e0e', color: '#fff', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ maxWidth: 900, margin: '40px auto', padding: 24 }}>
          <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 8 }}>
            Hey {recipient} — quick idea for {company}
          </h1>
          <p style={{ opacity: 0.7, marginBottom: 24 }}>Watch the short video below.</p>
          <video
            src={signed.signedUrl}
            poster={coverUrl || undefined}
            controls
            playsInline
            style={{ width: '100%', borderRadius: 12, display: 'block', marginBottom: 24 }}
          />
          {ctaUrl && (
            <a href={ctaUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', padding: '14px 28px', background: '#FFD600', color: '#000', borderRadius: 8, fontWeight: 700, textDecoration: 'none', fontSize: 16 }}>
             {ctaLabel}
            </a>
          )}
        </div>
      </body>
    </html>
  );
}
