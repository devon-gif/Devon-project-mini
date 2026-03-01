export const dynamic = 'force-dynamic';

export default async function SharePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>A message for you</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap" rel="stylesheet" />
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
      </head>
      <body>
        <div className="page">
          <div className="card" id="card">
            <div className="eyebrow"><div className="dot"></div><span id="eyebrow-text">Personal message</span></div>
            <h1 className="headline" id="headline">A quick idea<br /><em>just for you</em></h1>
            <p className="subline">Watch the short video below — it will only take a moment.</p>
            <div className="video-shell" id="video-shell">
              <div className="loading-state" id="loading-state">
                <div className="spinner"></div>
                <div className="loading-text">Loading your video…</div>
              </div>
            </div>
            <div className="footer" id="footer" style={{ display: 'none' }}>
              <div id="cta-area"></div>
              <div className="brand"><div className="brand-dot"></div>Sent via Twill</div>
            </div>
          </div>
        </div>
        <script dangerouslySetInnerHTML={{ __html: getScript(token) }} />
      </body>
    </html>
  );
}

const CSS = `
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{--bg:#0a0a0a;--surface:#111;--border:rgba(255,255,255,0.08);--text:#f0ede8;--muted:rgba(240,237,232,0.45);--accent:#e8d5a3}
body{background:var(--bg);color:var(--text);font-family:'DM Sans',sans-serif;min-height:100vh}
.page{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px 24px;position:relative;overflow:hidden}
.page::before{content:'';position:fixed;inset:0;background:radial-gradient(ellipse 80% 60% at 50% -10%,rgba(232,213,163,0.07) 0%,transparent 60%);pointer-events:none}
.card{width:100%;max-width:820px;position:relative;z-index:1;opacity:0;transform:translateY(20px);animation:fadeUp 0.6s ease forwards 0.1s}
@keyframes fadeUp{to{opacity:1;transform:translateY(0)}}
.eyebrow{display:flex;align-items:center;gap:10px;margin-bottom:28px}
.dot{width:8px;height:8px;background:var(--accent);border-radius:50%;animation:pulse 2s ease-in-out infinite}
@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.5;transform:scale(0.85)}}
.eyebrow span{font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:var(--muted);font-weight:500}
.headline{font-family:'Instrument Serif',serif;font-size:clamp(32px,5vw,52px);line-height:1.1;margin-bottom:10px;color:var(--text)}
.headline em{font-style:italic;color:var(--accent)}
.subline{font-size:15px;color:var(--muted);margin-bottom:36px;font-weight:300}
.video-shell{position:relative;width:100%;background:#000;border-radius:16px;overflow:hidden;border:1px solid var(--border);box-shadow:0 40px 80px rgba(0,0,0,0.6),0 0 0 1px rgba(255,255,255,0.04);margin-bottom:32px;aspect-ratio:16/9}
.video-shell video{width:100%;height:100%;object-fit:contain;display:block}
.loading-state{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px}
.spinner{width:36px;height:36px;border:2px solid rgba(255,255,255,0.1);border-top-color:var(--accent);border-radius:50%;animation:spin 0.8s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
.loading-text{font-size:13px;color:var(--muted);letter-spacing:0.05em}
.footer{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px}
.cta-btn{display:inline-flex;align-items:center;gap:8px;padding:14px 28px;background:var(--accent);color:#0a0a0a;border-radius:100px;font-weight:600;font-size:15px;text-decoration:none;transition:transform 0.15s,box-shadow 0.15s;box-shadow:0 4px 20px rgba(232,213,163,0.25);letter-spacing:-0.01em}
.cta-btn:hover{transform:translateY(-2px);box-shadow:0 8px 30px rgba(232,213,163,0.35)}
.brand{display:flex;align-items:center;gap:8px;font-size:12px;color:var(--muted);letter-spacing:0.06em;text-transform:uppercase;font-weight:500}
.brand-dot{width:5px;height:5px;background:var(--muted);border-radius:50%;opacity:0.5}
@media(max-width:600px){.footer{flex-direction:column;align-items:flex-start}}
`;

function getScript(token: string) {
  return `(async function(){
  try{
    const res=await fetch('/api/debug-share?token='+encodeURIComponent('${token}'));
    const d=await res.json();
    const shell=document.getElementById('video-shell');
    const loading=document.getElementById('loading-state');
    const footer=document.getElementById('footer');
    if(d.step!=='ok'){loading.innerHTML='<div style="color:rgba(255,100,100,0.8);font-size:14px">Video not found.</div>';return;}
    if(d.video){
      const v=d.video;
      if(v.recipient_name){document.getElementById('headline').innerHTML='Hey '+v.recipient_name+',<br><em>a quick idea for you</em>';document.getElementById('eyebrow-text').textContent=(v.recipient_company||'Personal')+' · Private message';}
      if(v.cta_url){const label=v.cta_label||v.cta_text||"Let\\'s talk";document.getElementById('cta-area').innerHTML='<a href="'+v.cta_url+'" target="_blank" rel="noopener noreferrer" class="cta-btn">'+label+' <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg></a>';}
    }
    const video=document.createElement('video');
    video.src=d.signedUrl;
    video.controls=true;video.playsInline=true;
    video.style.cssText='width:100%;height:100%;object-fit:contain;display:block;';
    loading.style.display='none';shell.appendChild(video);footer.style.display='flex';
  }catch(e){
    const l=document.getElementById('loading-state');
    if(l)l.innerHTML='<div style="color:rgba(255,100,100,0.8);font-size:14px">Something went wrong.</div>';
  }
})();`;
}
