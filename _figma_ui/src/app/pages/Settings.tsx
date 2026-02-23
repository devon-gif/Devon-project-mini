import { useState } from 'react';
import { GlassCard } from '../components/GlassCard';
import { StatusChip } from '../components/StatusChip';
import {
  Mail, Shield, FileText, Upload, Download, Users, Key,
  CheckCircle, Plus, Trash2, Edit3, Copy, ExternalLink,
  Globe, User, Bell, SlidersHorizontal, Sun, Moon,
} from 'lucide-react';
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
      {/* Settings nav */}
      <div className="w-[220px] shrink-0 border-r border-gray-200 bg-white p-4 space-y-1">
        <h2 className="text-gray-800 px-3 mb-4">Settings</h2>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm transition-all ${
              activeTab === tab.id
                ? 'bg-[#FFD600] text-gray-900'
                : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            <tab.icon className="h-4 w-4 shrink-0" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
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

function PreferencesSettings() {
  const [splashDisabled, setSplashDisabledLocal] = useState(isSplashDisabled());
  const { isDark, toggleTheme } = useTheme();

  const handleSplashToggle = () => {
    const newValue = !splashDisabled;
    setSplashDisabledLocal(newValue);
    setSplashDisabled(newValue);
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-gray-900">Preferences</h2>
        <p className="text-sm text-gray-500 mt-0.5">Customize your Twill experience</p>
      </div>

      <GlassCard className="overflow-hidden">
        {/* Dark mode toggle */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            {isDark ? <Moon className="h-4 w-4 text-blue-400" /> : <Sun className="h-4 w-4 text-amber-500" />}
            <div>
              <p className="text-sm text-gray-700">Dark mode</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {isDark ? 'Switch to light theme' : 'Switch to dark theme'}
              </p>
            </div>
          </div>
          <button
            onClick={toggleTheme}
            className={`relative h-6 w-11 rounded-full transition-colors ${isDark ? 'bg-[#2563EB]' : 'bg-gray-300'}`}
          >
            <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${isDark ? 'left-[22px]' : 'left-0.5'}`} />
          </button>
        </div>

        {/* Welcome splash toggle */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <p className="text-sm text-gray-700">Welcome splash screen</p>
            <p className="text-xs text-gray-400 mt-0.5">
              Show a greeting with daily stats preview when you log in
            </p>
          </div>
          <button
            onClick={handleSplashToggle}
            className={`relative h-6 w-11 rounded-full transition-colors ${!splashDisabled ? 'bg-[#2563EB]' : 'bg-gray-300'}`}
          >
            <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${!splashDisabled ? 'left-[22px]' : 'left-0.5'}`} />
          </button>
        </div>

        {/* Keyboard shortcuts info */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <p className="text-sm text-gray-700">Keyboard shortcuts</p>
            <p className="text-xs text-gray-400 mt-0.5">
              Press <kbd className="rounded bg-gray-100 px-1.5 py-0.5 text-[11px] text-gray-500 border border-gray-200">?</kbd> to view all shortcuts
            </p>
          </div>
          <StatusChip label="Enabled" variant="success" />
        </div>

        {/* Default landing page */}
        <div className="flex items-center justify-between px-5 py-4">
          <div>
            <p className="text-sm text-gray-700">Default landing page</p>
            <p className="text-xs text-gray-400 mt-0.5">
              Where you land after logging in
            </p>
          </div>
          <span className="text-sm text-gray-500">Mission Control</span>
        </div>
      </GlassCard>
    </div>
  );
}

function EmailAccountsSettings() {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-gray-900">Email Accounts</h2>
        <p className="text-sm text-gray-500 mt-0.5">Connect your email to send and receive messages</p>
      </div>

      <GlassCard className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50">
              <Mail className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <p className="text-sm text-gray-800">alex@withtwill.com</p>
              <div className="flex items-center gap-2 mt-0.5">
                <StatusChip label="Gmail" variant="default" />
                <StatusChip label="Connected" variant="success" />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-xs text-emerald-600">
              <CheckCircle className="h-3 w-3" />Synced
            </span>
            <button className="text-xs text-gray-400 hover:text-gray-600">Disconnect</button>
          </div>
        </div>
      </GlassCard>

      <button className="flex items-center gap-2 rounded-xl border border-dashed border-gray-300 px-5 py-4 w-full text-sm text-gray-500 hover:border-[#2563EB] hover:text-[#2563EB] transition-all">
        <Plus className="h-4 w-4" />
        Connect another email account (Gmail or Outlook)
      </button>
    </div>
  );
}

function SignatureSettings() {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-gray-900">Signatures</h2>
        <p className="text-sm text-gray-500 mt-0.5">Manage your email signatures and sender profiles</p>
      </div>
      <GlassCard className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-gray-700">Default Signature</p>
            <StatusChip label="Active" variant="success" />
          </div>
          <button className="text-xs text-[#2563EB]"><Edit3 className="h-3 w-3 inline mr-1" />Edit</button>
        </div>
        <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm text-gray-600 leading-relaxed">
          <p style={{ fontWeight: 500 }}>Alex Kim</p>
          <p>Account Executive, Twill</p>
          <p className="text-gray-400 mt-1">alex@withtwill.com | (415) 555-0100</p>
          <p className="text-[#2563EB]">withtwill.com</p>
        </div>
      </GlassCard>
      <button className="flex items-center gap-2 rounded-xl border border-dashed border-gray-300 px-5 py-3 text-sm text-gray-500 hover:border-[#2563EB] hover:text-[#2563EB] transition-all">
        <Plus className="h-4 w-4" />Add Signature
      </button>
    </div>
  );
}

function TemplatesSettings() {
  const templates = [
    { name: 'Cold Intro — VP Engineering', category: 'Outreach', uses: 45 },
    { name: 'Follow-up — No Reply', category: 'Follow-up', uses: 32 },
    { name: 'Case Study Share', category: 'Nurture', uses: 18 },
    { name: 'Meeting Request', category: 'Outreach', uses: 27 },
    { name: 'Warm Intro Ask', category: 'Referral', uses: 12 },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-gray-900">Templates & Snippets</h2>
          <p className="text-sm text-gray-500 mt-0.5">Reusable email templates and text snippets</p>
        </div>
        <button className="flex items-center gap-1.5 rounded-xl bg-[#2563EB] px-4 py-2.5 text-sm text-white hover:bg-[#1D4ED8] transition-all">
          <Plus className="h-4 w-4" />New Template
        </button>
      </div>
      <GlassCard className="overflow-hidden">
        {templates.map((tpl, i) => (
          <div key={tpl.name} className={`flex items-center justify-between px-4 py-3.5 ${i < templates.length - 1 ? 'border-b border-gray-100' : ''} hover:bg-gray-50 transition-colors cursor-pointer`}>
            <div className="flex items-center gap-3">
              <FileText className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-sm text-gray-700">{tpl.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <StatusChip label={tpl.category} variant="info" />
                  <span className="text-[11px] text-gray-400">Used {tpl.uses} times</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-300 hover:bg-gray-100 hover:text-gray-500 transition-colors">
                <Copy className="h-3.5 w-3.5" />
              </button>
              <button className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-300 hover:bg-gray-100 hover:text-gray-500 transition-colors">
                <Edit3 className="h-3.5 w-3.5" />
              </button>
              <button className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-300 hover:bg-gray-100 hover:text-red-500 transition-colors">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </GlassCard>
    </div>
  );
}

function ImportExportSettings() {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-gray-900">Import & Export</h2>
        <p className="text-sm text-gray-500 mt-0.5">Import prospects from CSV or export your data</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GlassCard className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
              <Upload className="h-5 w-5 text-[#2563EB]" />
            </div>
            <div>
              <p className="text-sm text-gray-800">Import CSV</p>
              <p className="text-xs text-gray-400">Upload a CSV file with prospect data</p>
            </div>
          </div>
          <div className="rounded-xl border-2 border-dashed border-gray-200 p-8 text-center hover:border-[#2563EB] transition-colors cursor-pointer">
            <Upload className="h-8 w-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Drop your CSV here or click to browse</p>
            <p className="text-xs text-gray-400 mt-1">Supports: name, email, title, company, linkedin</p>
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50">
              <Download className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-sm text-gray-800">Export Data</p>
              <p className="text-xs text-gray-400">Download your CRM data</p>
            </div>
          </div>
          <div className="space-y-2">
            {['Accounts', 'People', 'Email Threads', 'Tasks', 'Sequences'].map(item => (
              <button key={item} className="flex w-full items-center justify-between rounded-lg border border-gray-100 bg-gray-50/50 px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-100 transition-colors">
                {item}
                <Download className="h-3.5 w-3.5 text-gray-400" />
              </button>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

function TeamSettings() {
  const team = [
    { name: 'Alex Kim', email: 'alex@withtwill.com', role: 'Admin' },
    { name: 'Jordan Lee', email: 'jordan@withtwill.com', role: 'Member' },
    { name: 'Michelle Chen', email: 'michelle@withtwill.com', role: 'Viewer' },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-gray-900">Team</h2>
          <p className="text-sm text-gray-500 mt-0.5">Manage team members and permissions</p>
        </div>
        <button className="flex items-center gap-1.5 rounded-xl bg-[#2563EB] px-4 py-2.5 text-sm text-white hover:bg-[#1D4ED8] transition-all">
          <Plus className="h-4 w-4" />Invite Member
        </button>
      </div>
      <GlassCard className="overflow-hidden">
        {team.map((member, i) => (
          <div key={member.email} className={`flex items-center justify-between px-4 py-3.5 ${i < team.length - 1 ? 'border-b border-gray-100' : ''}`}>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-xs text-blue-600" style={{ fontWeight: 500 }}>
                {member.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <p className="text-sm text-gray-700">{member.name}</p>
                <p className="text-xs text-gray-400">{member.email}</p>
              </div>
            </div>
            <StatusChip label={member.role} variant={member.role === 'Admin' ? 'info' : member.role === 'Member' ? 'default' : 'accent'} />
          </div>
        ))}
      </GlassCard>
    </div>
  );
}

function APISettings() {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-gray-900">API Keys</h2>
        <p className="text-sm text-gray-500 mt-0.5">Manage external API integrations</p>
      </div>

      <GlassCard className="p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
            <Key className="h-5 w-5 text-emerald-500" />
          </div>
          <div>
            <p className="text-sm text-gray-800">OpenAI API Key</p>
            <p className="text-xs text-gray-400">Powers AI drafting, summarization, and task extraction</p>
          </div>
        </div>
        <div className="flex gap-2">
          <input
            type="password"
            value="sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
            readOnly
            className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-500 outline-none"
          />
          <button className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
            Update
          </button>
        </div>
      </GlassCard>

      <GlassCard className="p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
            <Globe className="h-5 w-5 text-[#2563EB]" />
          </div>
          <div>
            <p className="text-sm text-gray-800">Enrichment API</p>
            <p className="text-xs text-gray-400">Apollo, Hunter, or Clearbit for data enrichment</p>
          </div>
        </div>
        <button className="flex items-center gap-2 rounded-xl border border-dashed border-gray-300 px-4 py-3 text-sm text-gray-500 hover:border-[#2563EB] hover:text-[#2563EB] transition-all">
          <Plus className="h-4 w-4" />Connect Enrichment Provider
        </button>
      </GlassCard>
    </div>
  );
}

function NotificationsSettings() {
  const prefs = [
    { label: 'New replies', description: 'Get notified when a prospect replies', enabled: true },
    { label: 'Task reminders', description: 'Reminders for upcoming and overdue tasks', enabled: true },
    { label: 'AI suggestions', description: 'When AI has a recommendation for you', enabled: true },
    { label: 'Sequence alerts', description: 'Bounce, pause, or completion notifications', enabled: false },
    { label: 'Weekly digest', description: 'Summary of activity and pipeline changes', enabled: true },
  ];
  const [notifications, setNotifications] = useState(prefs);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-gray-900">Notifications</h2>
        <p className="text-sm text-gray-500 mt-0.5">Configure how and when you get notified</p>
      </div>
      <GlassCard className="overflow-hidden">
        {notifications.map((pref, i) => (
          <div key={pref.label} className={`flex items-center justify-between px-5 py-4 ${i < notifications.length - 1 ? 'border-b border-gray-100' : ''}`}>
            <div>
              <p className="text-sm text-gray-700">{pref.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{pref.description}</p>
            </div>
            <button
              onClick={() => setNotifications(n => n.map((p, j) => j === i ? { ...p, enabled: !p.enabled } : p))}
              className={`relative h-6 w-11 rounded-full transition-colors ${pref.enabled ? 'bg-[#2563EB]' : 'bg-gray-300'}`}
            >
              <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${pref.enabled ? 'left-[22px]' : 'left-0.5'}`} />
            </button>
          </div>
        ))}
      </GlassCard>
    </div>
  );
}