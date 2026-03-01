export const dynamic = 'force-dynamic';

export default async function SharePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return <ShareClient token={token} />;
}

function ShareClient({ token }: { token: string }) {
  return (
    <html>
      <body style={{ margin: 0, background: '#0e0e0e', color: '#fff', fontFamily: 'system-ui, sans-serif' }}>
        <script dangerouslySetInnerHTML={{ __html: `
          (async function() {
            const res = await fetch('/api/debug-share?token=${encodeURIComponent(token)}');
            const d = await res.json();
            if (d.step !== 'ok') { document.body.innerHTML = '<div style="padding:40px;color:red">Video not found (${encodeURIComponent(token)})</div>'; return; }
            document.body.innerHTML = \`
              <div style="max-width:900px;margin:40px auto;padding:24px">
                <video src="\${d.signedUrl}" controls playsinline style="width:100%;border-radius:12px;display:block"></video>
              </div>
            \`;
          })();
        ` }} />
        <div style={{ maxWidth: 900, margin: '40px auto', padding: 24 }}>
          <p style={{ opacity: 0.5 }}>Loading video...</p>
        </div>
      </body>
    </html>
  );
}
