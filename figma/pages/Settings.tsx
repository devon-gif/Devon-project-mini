
"use client";
import { useState, useEffect, useRef } from 'react';
import { GlassCard } from '../components/GlassCard';
import { StatusChip } from '../components/StatusChip';
import { Mail, FileText, Upload, Download, Users, Key, CheckCircle, Plus, Trash2, Edit3, Copy, Globe, Bell, SlidersHorizontal, Sun, Moon, X, Save, Loader2 } from 'lucide-react';
import { isSplashDisabled, setSplashDisabled } from '../components/WelcomeSplash';
import { useTheme } from '../components/ThemeContext';

const tabs = [
  { id: 'preferences', label: 'Preferences', icon: SlidersHorizontal },
  { id: 'email', label: 'Email Accounts', icon: Mail },
  { id: 'signature', label: 'Signatures', icon: Edit3 },
  { id: 'templates', label: 'Templates', icon: FileText },
  { id: 'import', label: 'Import/Export', icon: Upload },
  { id: 'team', label: 'Team', icon: Users },
  { id: 'api', label: 'API Keys', icon: Key },
  { id: 'notifications', label: 'Notifications', icon: Bell },
];

export function Settings() {
  const [activeTab, setActiveTab] = useState('preferences');
  return (
    <div className="flex h-full overflow-hidden">
      <div className="w-[220px] shrink-0 border-r border-gray-200 bg-white p-4 space-y-1">
        <h2 className="text-gray-800 px-3 mb-4">Settings</h2>
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm transition-all ${activeTab === tab.id ? 'bg-[#FFD600] text-gray-900' : 'text-gray-500 hover:bg-gray-100'}`}>
            <tab.icon className="h-4 w-4 shrink-0" />{tab.label}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        {activeTab === 'preferences' && <PreferencesSettings />}
        {activeTab === 'email' && <EmailAccountsSettings />}
        {activeTab === 'signature' && <SignatureSettings />}
        {activeTab === 'templates' && <TemplatesSettings />}
        {activeTab === 'import' && <ImportExportSettings />}
        {activeTab === 'team' && <TeamSettings />}
        {activeTab === 'api' && <APISettings />}
        {activeTab === 'notifications' && <NotificationsSettings />}
      </div>
    </div>
  );
}

// ── Preferences ──────────────────────────────────────────────────────────────
function PreferencesSettings() {
  const [splashDisabled, setSplashDisabledLocal] = useState(isSplashDisabled());
  const { isDark, toggleTheme } = useTheme();
  return (
    <div className="space-y-5">
      <div><h2 className="text-gray-900">Preferences</h2><p className="text-sm text-gray-500 mt-0.5">Customize your Twill experience</p></div>
      <GlassCard className="overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            {isDark ? <Moon className="h-4 w-4 text-blue-400" /> : <Sun className="h-4 w-4 text-amber-500" />}
            <div><p className="text-sm text-gray-700">Dark mode</p><p className="text-xs text-gray-400 mt-0.5">{isDark ? 'Switch to light theme' : 'Switch to dark theme'}</p></div>
          </div>
          <Toggle value={isDark} onChange={toggleTheme} />
        </div>
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div><p className="text-sm text-gray-700">Welcome splash screen</p><p className="text-xs text-gray-400 mt-0.5">Show a greeting with daily stats when you log in</p></div>
          <Toggle value={!splashDisabled} onChange={() => { const v = !splashDisabled; setSplashDisabledLocal(v); setSplashDisabled(v); }} />
        </div>
        <div className="flex items-center justify-between px-5 py-4">
          <div><p className="text-sm text-gray-700">Default landing page</p><p className="text-xs text-gray-400 mt-0.5">Where you land after logging in</p></div>
          <span className="text-sm text-gray-500">Mission Control</span>
        </div>
      </GlassCard>
    </div>
  );
}

// ── Email Accounts ────────────────────────────────────────────────────────────
function EmailAccountsSettings() {
  const [email, setEmail] = useState('');
  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => { if (d.email) setEmail(d.email); }).catch(() => {});
  }, []);
  return (
    <div className="space-y-5">
      <div><h2 className="text-gray-900">Email Accounts</h2><p className="text-sm text-gray-500 mt-0.5">Your connected account</p></div>
      {email && (
        <GlassCard className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50"><Mail className="h-5 w-5 text-red-500" /></div>
              <div>
                <p className="text-sm text-gray-800">{email}</p>
                <div className="flex items-center gap-2 mt-0.5"><StatusChip label="Supabase Auth" variant="default" /><StatusChip label="Connected" variant="success" /></div>
              </div>
            </div>
            <span className="flex items-center gap-1 text-xs text-emerald-600"><CheckCircle className="h-3 w-3" />Active</span>
          </div>
        </GlassCard>
      )}
    </div>
  );
}

// ── Signatures ────────────────────────────────────────────────────────────────
function SignatureSettings() {
  const [sigs, setSigs] = useState<{id:string;name:string;content:string;is_default:boolean}[]>([]);
  const [editing, setEditing] = useState<{id:string;name:string;content:string;is_default:boolean}|null>(null);
  const [adding, setAdding] = useState(false);
  const [newSig, setNewSig] = useState({name:'',content:'',is_default:false});
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => { fetch('/api/signatures').then(r=>r.json()).then(d=>setSigs(d.signatures??[])); }, []);

  const save = async () => {
    setSaving(true);
    const res = await fetch('/api/signatures', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(newSig) });
    const d = await res.json();
    if (d.signature) { setSigs(s=>[...s, d.signature]); setAdding(false); setNewSig({name:'',content:'',is_default:false}); setMsg('Saved!'); }
    else setMsg(d.error||'Error');
    setSaving(false);
  };

  const update = async () => {
    if (!editing) return;
    setSaving(true);
    const res = await fetch(`/api/signatures/${editing.id}`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({name:editing.name,content:editing.content,is_default:editing.is_default}) });
    const d = await res.json();
    if (d.signature) { setSigs(s=>s.map(x=>x.id===editing.id?d.signature:x)); setEditing(null); setMsg('Saved!'); }
    else setMsg(d.error||'Error');
    setSaving(false);
  };

  const del = async (id:string) => {
    await fetch(`/api/signatures/${id}`, {method:'DELETE'});
    setSigs(s=>s.filter(x=>x.id!==id));
  };

  return (
    <div className="space-y-5">
      <div><h2 className="text-gray-900">Signatures</h2><p className="text-sm text-gray-500 mt-0.5">Manage your email signatures</p></div>
      {msg && <p className="text-sm text-emerald-600">{msg}</p>}
      {sigs.length === 0 && !adding && <p className="text-sm text-gray-400">No signatures yet.</p>}
      {sigs.map(sig => (
        <GlassCard key={sig.id} className="p-5">
          {editing?.id === sig.id ? (
            <div className="space-y-3">
              <input value={editing.name} onChange={e=>setEditing({...editing,name:e.target.value})} className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#2563EB]" placeholder="Signature name" />
              <textarea value={editing.content} onChange={e=>setEditing({...editing,content:e.target.value})} rows={4} className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#2563EB] resize-none" placeholder="Signature content" />
              <div className="flex items-center gap-2">
                <button onClick={update} disabled={saving} className="flex items-center gap-1.5 rounded-xl bg-[#2563EB] px-4 py-2 text-sm text-white hover:bg-[#1D4ED8] disabled:opacity-60"><Save className="h-3.5 w-3.5"/>{saving?'Saving…':'Save'}</button>
                <button onClick={()=>setEditing(null)} className="rounded-xl border border-gray-200 px-4 py-2 text-sm text-gray-500">Cancel</button>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2"><p className="text-sm font-medium text-gray-700">{sig.name}</p>{sig.is_default&&<StatusChip label="Default" variant="success"/>}</div>
                <div className="flex items-center gap-1">
                  <button onClick={()=>setEditing(sig)} className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100"><Edit3 className="h-3.5 w-3.5"/></button>
                  <button onClick={()=>del(sig.id)} className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500"><Trash2 className="h-3.5 w-3.5"/></button>
                </div>
              </div>
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm text-gray-600 whitespace-pre-wrap">{sig.content}</div>
            </div>
          )}
        </GlassCard>
      ))}
      {adding ? (
        <GlassCard className="p-5 space-y-3">
          <input value={newSig.name} onChange={e=>setNewSig({...newSig,name:e.target.value})} className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#2563EB]" placeholder="Signature name" />
          <textarea value={newSig.content} onChange={e=>setNewSig({...newSig,content:e.target.value})} rows={4} className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#2563EB] resize-none" placeholder="Your name, title, email..." />
          <div className="flex items-center gap-2">
            <button onClick={save} disabled={saving} className="flex items-center gap-1.5 rounded-xl bg-[#2563EB] px-4 py-2 text-sm text-white hover:bg-[#1D4ED8] disabled:opacity-60"><Save className="h-3.5 w-3.5"/>{saving?'Saving…':'Save'}</button>
            <button onClick={()=>setAdding(false)} className="rounded-xl border border-gray-200 px-4 py-2 text-sm text-gray-500">Cancel</button>
          </div>
        </GlassCard>
      ) : (
        <button onClick={()=>setAdding(true)} className="flex items-center gap-2 rounded-xl border border-dashed border-gray-300 px-5 py-3 text-sm text-gray-500 hover:border-[#2563EB] hover:text-[#2563EB] transition-all w-full">
          <Plus className="h-4 w-4"/>Add Signature
        </button>
      )}
    </div>
  );
}

// ── Templates ─────────────────────────────────────────────────────────────────
function TemplatesSettings() {
  const [templates, setTemplates] = useState<{id:string;name:string;category:string;subject:string;body:string;use_count:number}[]>([]);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<{id:string;name:string;category:string;subject:string;body:string;use_count:number}|null>(null);
  const [newTpl, setNewTpl] = useState({name:'',category:'Outreach',subject:'',body:''});
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const cats = ['Outreach','Follow-up','Nurture','Referral','Other'];

  useEffect(() => { fetch('/api/templates').then(r=>r.json()).then(d=>setTemplates(d.templates??[])); }, []);

  const save = async () => {
    setSaving(true);
    const res = await fetch('/api/templates', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(newTpl) });
    const d = await res.json();
    if (d.template) { setTemplates(t=>[...t,d.template]); setAdding(false); setNewTpl({name:'',category:'Outreach',subject:'',body:''}); setMsg('Template saved!'); }
    else setMsg(d.error||'Error');
    setSaving(false);
  };

  const update = async () => {
    if (!editing) return;
    setSaving(true);
    const res = await fetch(`/api/templates/${editing.id}`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({name:editing.name,category:editing.category,subject:editing.subject,body:editing.body}) });
    const d = await res.json();
    if (d.template) { setTemplates(t=>t.map(x=>x.id===editing.id?d.template:x)); setEditing(null); setMsg('Saved!'); }
    else setMsg(d.error||'Error');
    setSaving(false);
  };

  const del = async (id:string) => {
    await fetch(`/api/templates/${id}`,{method:'DELETE'});
    setTemplates(t=>t.filter(x=>x.id!==id));
  };

  const Form = ({v,setV,onSave,onCancel}:{v:typeof newTpl;setV:(x:typeof newTpl)=>void;onSave:()=>void;onCancel:()=>void}) => (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <input value={v.name} onChange={e=>setV({...v,name:e.target.value})} className="rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#2563EB]" placeholder="Template name" />
        <select value={v.category} onChange={e=>setV({...v,category:e.target.value})} className="rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#2563EB] bg-white">
          {cats.map(c=><option key={c}>{c}</option>)}
        </select>
      </div>
      <input value={v.subject} onChange={e=>setV({...v,subject:e.target.value})} className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#2563EB]" placeholder="Subject line" />
      <textarea value={v.body} onChange={e=>setV({...v,body:e.target.value})} rows={5} className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#2563EB] resize-none" placeholder="Email body... Use {{name}}, {{company}} for variables" />
      <div className="flex items-center gap-2">
        <button onClick={onSave} disabled={saving} className="flex items-center gap-1.5 rounded-xl bg-[#2563EB] px-4 py-2 text-sm text-white hover:bg-[#1D4ED8] disabled:opacity-60"><Save className="h-3.5 w-3.5"/>{saving?'Saving…':'Save'}</button>
        <button onClick={onCancel} className="rounded-xl border border-gray-200 px-4 py-2 text-sm text-gray-500">Cancel</button>
      </div>
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><h2 className="text-gray-900">Templates & Snippets</h2><p className="text-sm text-gray-500 mt-0.5">Reusable email templates</p></div>
        <button onClick={()=>setAdding(true)} className="flex items-center gap-1.5 rounded-xl bg-[#2563EB] px-4 py-2.5 text-sm text-white hover:bg-[#1D4ED8]"><Plus className="h-4 w-4"/>New Template</button>
      </div>
      {msg && <p className="text-sm text-emerald-600">{msg}</p>}
      {adding && <GlassCard className="p-5"><Form v={newTpl} setV={setNewTpl} onSave={save} onCancel={()=>setAdding(false)}/></GlassCard>}
      {templates.length===0 && !adding && <p className="text-sm text-gray-400">No templates yet. Create your first one.</p>}
      <GlassCard className="overflow-hidden">
        {templates.map((tpl,i)=>(
          <div key={tpl.id}>
            {editing?.id===tpl.id ? (
              <div className="p-4"><Form v={{name:editing.name,category:editing.category,subject:editing.subject,body:editing.body}} setV={v=>setEditing({...editing,...v})} onSave={update} onCancel={()=>setEditing(null)}/></div>
            ) : (
              <div className={`flex items-center justify-between px-4 py-3.5 ${i<templates.length-1?'border-b border-gray-100':''} hover:bg-gray-50`}>
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-gray-400"/>
                  <div>
                    <p className="text-sm text-gray-700">{tpl.name}</p>
                    <div className="flex items-center gap-2 mt-0.5"><StatusChip label={tpl.category} variant="info"/><span className="text-[11px] text-gray-400">Used {tpl.use_count} times</span></div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={()=>setEditing(tpl)} className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-300 hover:bg-gray-100 hover:text-gray-500"><Edit3 className="h-3.5 w-3.5"/></button>
                  <button onClick={()=>del(tpl.id)} className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-300 hover:bg-gray-100 hover:text-red-500"><Trash2 className="h-3.5 w-3.5"/></button>
                </div>
              </div>
            )}
          </div>
        ))}
      </GlassCard>
    </div>
  );
}

// ── Import / Export ───────────────────────────────────────────────────────────
function ImportExportSettings() {
  const [uploading, setUploading] = useState(false);
  const [importMsg, setImportMsg] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true); setImportMsg('');
    const fd = new FormData(); fd.append('file', file);
    const res = await fetch('/api/import', { method:'POST', body: fd });
    const d = await res.json();
    setImportMsg(d.ok ? `Imported ${d.imported} records!` : d.error || 'Error');
    setUploading(false);
  };

  const exportCSV = (type: string) => { window.open(`/api/export?type=${type}`, '_blank'); };

  return (
    <div className="space-y-5">
      <div><h2 className="text-gray-900">Import & Export</h2><p className="text-sm text-gray-500 mt-0.5">Import prospects from CSV or export your data</p></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GlassCard className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50"><Upload className="h-5 w-5 text-[#2563EB]"/></div>
            <div><p className="text-sm text-gray-800">Import CSV</p><p className="text-xs text-gray-400">Upload a CSV with prospect data</p></div>
          </div>
          <input ref={fileRef} type="file" accept=".csv" onChange={handleFile} className="hidden"/>
          <div onClick={()=>fileRef.current?.click()} className="rounded-xl border-2 border-dashed border-gray-200 p-8 text-center hover:border-[#2563EB] transition-colors cursor-pointer">
            {uploading ? <Loader2 className="h-8 w-8 text-[#2563EB] mx-auto mb-2 animate-spin"/> : <Upload className="h-8 w-8 text-gray-300 mx-auto mb-2"/>}
            <p className="text-sm text-gray-500">{uploading ? 'Importing…' : 'Drop your CSV here or click to browse'}</p>
            <p className="text-xs text-gray-400 mt-1">Supports: name, email, title, company, linkedin</p>
          </div>
          {importMsg && <p className={`mt-3 text-sm ${importMsg.includes('Imported')?'text-emerald-600':'text-red-500'}`}>{importMsg}</p>}
        </GlassCard>
        <GlassCard className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50"><Download className="h-5 w-5 text-amber-500"/></div>
            <div><p className="text-sm text-gray-800">Export Data</p><p className="text-xs text-gray-400">Download your CRM data as CSV</p></div>
          </div>
          <div className="space-y-2">
            {[['people','People'],['accounts','Accounts'],['tasks','Tasks'],['videos','Videos']].map(([type,label])=>(
              <button key={type} onClick={()=>exportCSV(type)} className="flex w-full items-center justify-between rounded-lg border border-gray-100 bg-gray-50/50 px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-100 transition-colors">
                {label}<Download className="h-3.5 w-3.5 text-gray-400"/>
              </button>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

// ── Team ─────────────────────────────────────────────────────────────────────
function TeamSettings() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteResult, setInviteResult] = useState<{email:string;inviteLink?:string|null;tempPassword?:string}|null>(null);
  const [inviteError, setInviteError] = useState<string|null>(null);
  const [showInviteForm, setShowInviteForm] = useState(false);

  useEffect(() => {
    fetch('/api/admin/am-i-admin').then(r=>r.json()).then(d=>setIsAdmin(Boolean(d?.isAdmin))).catch(()=>setIsAdmin(false));
  }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault(); setInviteError(null); setInviteResult(null);
    const email = inviteEmail.trim(); if (!email) return;
    setInviteLoading(true);
    try {
      const res = await fetch('/api/invite-teammate', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({email}) });
      const data = await res.json();
      if (!res.ok) { setInviteError(data?.error||'Invite failed'); return; }
      setInviteResult({email:data.email,inviteLink:data.inviteLink,tempPassword:data.tempPassword});
      setInviteEmail('');
    } catch { setInviteError('Request failed'); }
    finally { setInviteLoading(false); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><h2 className="text-gray-900">Team</h2><p className="text-sm text-gray-500 mt-0.5">Manage team members and permissions</p></div>
        {isAdmin && <button onClick={()=>setShowInviteForm(v=>!v)} className="flex items-center gap-1.5 rounded-xl bg-[#2563EB] px-4 py-2.5 text-sm text-white hover:bg-[#1D4ED8]"><Plus className="h-4 w-4"/>Invite Member</button>}
      </div>
      {isAdmin && showInviteForm && (
        <GlassCard className="p-5 space-y-4">
          <h3 className="text-gray-900 font-medium">Invite teammate</h3>
          <form onSubmit={handleInvite} className="flex flex-wrap items-end gap-3">
            <input type="email" value={inviteEmail} onChange={e=>setInviteEmail(e.target.value)} placeholder="teammate@example.com" className="min-w-[200px] rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 outline-none focus:border-[#2563EB]"/>
            <button type="submit" disabled={inviteLoading} className="rounded-xl bg-[#2563EB] px-4 py-2 text-sm text-white hover:bg-[#1D4ED8] disabled:opacity-60">{inviteLoading?'Sending…':'Send invite'}</button>
          </form>
          {inviteError && <p className="text-sm text-red-600">{inviteError}</p>}
          {inviteResult && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 space-y-2">
              <p className="text-sm text-gray-700">Invite sent to <strong>{inviteResult.email}</strong></p>
              {inviteResult.inviteLink && (
                <div className="flex items-center gap-2 flex-wrap">
                  <input readOnly value={inviteResult.inviteLink} className="flex-1 min-w-0 rounded border border-gray-200 px-2 py-1.5 text-xs text-gray-600"/>
                  <button onClick={()=>navigator.clipboard.writeText(inviteResult.inviteLink!)} className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-600 hover:bg-gray-50"><Copy className="h-3 w-3"/>Copy</button>
                </div>
              )}
            </div>
          )}
        </GlassCard>
      )}
      {!isAdmin && <p className="text-sm text-gray-400">Contact your admin to invite team members. Add your email to ADMIN_EMAILS in Render environment variables to enable admin features.</p>}
    </div>
  );
}

// ── API Keys ──────────────────────────────────────────────────────────────────
function APISettings() {
  const [openaiKey, setOpenaiKey] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch('/api/settings').then(r=>r.json()).then(d=>{
      if (d.settings?.openai_key) setOpenaiKey(d.settings.openai_key as string);
      setLoaded(true);
    });
  }, []);

  const save = async () => {
    setSaving(true); setMsg('');
    const res = await fetch('/api/settings', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({key:'openai_key',value:openaiKey}) });
    const d = await res.json();
    setMsg(d.ok ? 'API key saved!' : d.error || 'Error');
    setSaving(false);
  };

  return (
    <div className="space-y-5">
      <div><h2 className="text-gray-900">API Keys</h2><p className="text-sm text-gray-500 mt-0.5">Manage external API integrations</p></div>
      {msg && <p className={`text-sm ${msg.includes('saved')?'text-emerald-600':'text-red-500'}`}>{msg}</p>}
      <GlassCard className="p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50"><Key className="h-5 w-5 text-emerald-500"/></div>
          <div><p className="text-sm text-gray-800">OpenAI API Key</p><p className="text-xs text-gray-400">Powers AI drafting, summarization, and task extraction</p></div>
        </div>
        <div className="flex gap-2">
          <input type="password" value={openaiKey} onChange={e=>setOpenaiKey(e.target.value)} placeholder={loaded?'Enter your OpenAI key…':'Loading…'} className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-[#2563EB]"/>
          <button onClick={save} disabled={saving} className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-60">{saving?'Saving…':'Save'}</button>
        </div>
      </GlassCard>
      <GlassCard className="p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50"><Globe className="h-5 w-5 text-[#2563EB]"/></div>
          <div><p className="text-sm text-gray-800">Enrichment API</p><p className="text-xs text-gray-400">Apollo, Hunter, or Clearbit for data enrichment</p></div>
        </div>
        <button className="flex items-center gap-2 rounded-xl border border-dashed border-gray-300 px-4 py-3 text-sm text-gray-500 hover:border-[#2563EB] hover:text-[#2563EB] transition-all"><Plus className="h-4 w-4"/>Connect Enrichment Provider</button>
      </GlassCard>
    </div>
  );
}

// ── Notifications ─────────────────────────────────────────────────────────────
function NotificationsSettings() {
  const defaults = [
    { key:'new_replies', label:'New replies', description:'Get notified when a prospect replies', enabled:true },
    { key:'task_reminders', label:'Task reminders', description:'Reminders for upcoming and overdue tasks', enabled:true },
    { key:'ai_suggestions', label:'AI suggestions', description:'When AI has a recommendation for you', enabled:true },
    { key:'sequence_alerts', label:'Sequence alerts', description:'Bounce, pause, or completion notifications', enabled:false },
    { key:'weekly_digest', label:'Weekly digest', description:'Summary of activity and pipeline changes', enabled:true },
  ];
  const [prefs, setPrefs] = useState(defaults);
  const [saving, setSaving] = useState<string|null>(null);

  useEffect(() => {
    fetch('/api/settings').then(r=>r.json()).then(d=>{
      if (d.settings?.notifications) {
        const saved = d.settings.notifications as Record<string,boolean>;
        setPrefs(p=>p.map(x=>({...x, enabled: saved[x.key]??x.enabled})));
      }
    });
  }, []);

  const toggle = async (i: number) => {
    const updated = prefs.map((p,j)=>j===i?{...p,enabled:!p.enabled}:p);
    setPrefs(updated);
    setSaving(updated[i].key);
    const notifMap = Object.fromEntries(updated.map(p=>[p.key,p.enabled]));
    await fetch('/api/settings', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({key:'notifications',value:notifMap}) });
    setSaving(null);
  };

  return (
    <div className="space-y-5">
      <div><h2 className="text-gray-900">Notifications</h2><p className="text-sm text-gray-500 mt-0.5">Configure how and when you get notified</p></div>
      <GlassCard className="overflow-hidden">
        {prefs.map((pref,i)=>(
          <div key={pref.key} className={`flex items-center justify-between px-5 py-4 ${i<prefs.length-1?'border-b border-gray-100':''}`}>
            <div><p className="text-sm text-gray-700">{pref.label}</p><p className="text-xs text-gray-400 mt-0.5">{pref.description}</p></div>
            {saving===pref.key ? <Loader2 className="h-5 w-5 text-gray-400 animate-spin"/> : <Toggle value={pref.enabled} onChange={()=>toggle(i)}/>}
          </div>
        ))}
      </GlassCard>
    </div>
  );
}

// ── Shared Toggle ─────────────────────────────────────────────────────────────
function Toggle({value,onChange}:{value:boolean;onChange:()=>void}) {
  return (
    <button onClick={onChange} className={`relative h-6 w-11 rounded-full transition-colors ${value?'bg-[#2563EB]':'bg-gray-300'}`}>
      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${value?'left-[22px]':'left-0.5'}`}/>
    </button>
  );
}
