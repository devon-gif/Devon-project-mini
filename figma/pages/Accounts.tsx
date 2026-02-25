"use client";

import { useState, useEffect } from 'react';
import { GlassCard } from '../components/GlassCard';
import { StatusChip, TierBadge } from '../components/StatusChip';
import { AccountSidePanel } from '../components/AccountSidePanel';
import { accounts as mockAccounts } from '../data/mockData';
import type { Account } from '../data/mockData';
import {
  Search, Filter, Plus, ChevronDown,
  Mail, Linkedin, Phone, CheckSquare, Globe,
} from 'lucide-react';

type ApiAccount = {
  id: string;
  name: string;
  domain: string | null;
  website_url: string | null;
  linkedin_url: string | null;
  tier: string;
  status: string;
  score: number;
  firstContact?: { name: string | null; title: string | null; email: string | null; linkedin_url: string | null } | null;
};

type ProspectRow = {
  id: string;
  companyName: string;
  domain: string;
  linkedinUrl?: string;
  contactName?: string;
  contactTitle?: string;
  contactEmail?: string;
  signalScore: number;
  tier: 'P0' | 'P1' | 'P2';
  status: string;
  lastTouch: string;
  nextAction: string;
  industry?: string;
  notes?: string;
};

function apiAccountToAccount(a: ApiAccount): Account {
  let domain = a.domain ?? '';
  if (!domain && a.website_url) {
    try {
      domain = new URL(a.website_url).hostname;
    } catch {
      domain = a.website_url.replace(/^https?:\/\//, '').split('/')[0] || '';
    }
  }
  return {
    id: a.id,
    company: a.name || '—',
    domain: domain || '—',
    tier: (a.tier === 'P0' || a.tier === 'P1' || a.tier === 'P2' ? a.tier : 'P1') as 'P0' | 'P1' | 'P2',
    industry: '—',
    status: (a.status as Account['status']) || 'Prospecting',
    lastTouch: 'No touch',
    nextStep: 'Add first touch',
    owner: 'You',
    notes: '',
    tags: [],
    peopleCount: 0,
    signalScore: a.score ?? 0,
    linkedinUrl: a.linkedin_url ?? undefined,
    contactEmail: a.firstContact?.email ?? undefined,
    contactName: a.firstContact?.name ?? undefined,
    contactTitle: a.firstContact?.title ?? undefined,
  };
}

function apiProspectToAccount(p: { id: string; name: string; title?: string; company?: string; email?: string; linkedin_url?: string; website_url?: string }): Account {
  const domain = (p.website_url || '').replace(/^https?:\/\//, '').trim() || (p.company ? `${(p.company as string).toLowerCase().replace(/\s+/g, '')}.com` : '');
  return {
    id: p.id,
    company: p.company ?? '—',
    domain: domain || '—',
    tier: 'P1',
    industry: '—',
    status: 'Prospecting',
    lastTouch: 'No touch',
    nextStep: 'Add first touch',
    owner: 'You',
    notes: '',
    tags: [],
    peopleCount: 0,
    signalScore: 75,
    linkedinUrl: p.linkedin_url ?? undefined,
    contactEmail: p.email ?? undefined,
    contactName: p.name ?? undefined,
    contactTitle: p.title ?? undefined,
  };
}

function prospectToAccount(p: ProspectRow): Account {
  const status = (p.status === 'Active' || p.status === 'Prospecting' || p.status === 'Nurturing' || p.status === 'Closed Won' || p.status === 'Closed Lost')
    ? p.status
    : 'Prospecting';
  const domain = (p.domain || '').trim() || p.companyName.toLowerCase().replace(/\s+/g, '') + '.com';
  const linkedinUrl = p.linkedinUrl?.trim()
    ? (p.linkedinUrl.startsWith('http') ? p.linkedinUrl : `https://${p.linkedinUrl.replace(/^\/+/, '')}`)
    : undefined;
  return {
    id: p.id,
    company: p.companyName,
    domain,
    tier: p.tier,
    industry: p.industry ?? '—',
    status,
    lastTouch: p.lastTouch,
    nextStep: p.nextAction,
    owner: 'You',
    notes: p.notes ?? '',
    tags: [],
    peopleCount: 0,
    signalScore: p.signalScore,
    linkedinUrl: linkedinUrl || undefined,
    contactEmail: p.contactEmail?.trim() || undefined,
    contactName: p.contactName?.trim() || undefined,
    contactTitle: p.contactTitle?.trim() || undefined,
  };
}

const statusVariant: Record<string, 'success' | 'warning' | 'info' | 'purple' | 'default'> = {
  'Active': 'success',
  'Prospecting': 'info',
  'Nurturing': 'purple',
  'Closed Won': 'success',
  'Closed Lost': 'default',
};

// Map account statuses to BDR-friendly labels
const bdrStatusMap: Record<string, string> = {
  'Active': 'Engaged',
  'Prospecting': 'Prospecting',
  'Nurturing': 'Nurture',
  'Closed Won': 'Meeting Set',
  'Closed Lost': 'Closed',
};

const filterOptions = {
  tier: ['All', 'P0', 'P1', 'P2'],
  status: ['All', 'Active', 'Prospecting', 'Nurturing', 'Closed Won', 'Closed Lost'],
};

export type SidePanelPerson = {
  id: string;
  name: string | null;
  title: string | null;
  email: string | null;
  linkedin_url?: string | null;
};

export function Accounts() {
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [sidePanelPeople, setSidePanelPeople] = useState<SidePanelPerson[]>([]);
  const [accounts, setAccounts] = useState<Account[]>(mockAccounts);

  useEffect(() => {
    if (!selectedAccount?.id) {
      setSidePanelPeople([]);
      return;
    }
    fetch(`/api/accounts/${selectedAccount.id}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data: { people?: SidePanelPerson[] }) => {
        setSidePanelPeople(data?.people ?? []);
      })
      .catch(() => setSidePanelPeople([]));
  }, [selectedAccount?.id]);

  useEffect(() => {
    fetch('/api/accounts')
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data: { accounts?: ApiAccount[] }) => {
        const list = data?.accounts ?? [];
        if (list.length > 0) {
          setAccounts(list.map(apiAccountToAccount));
          return;
        }
        return Promise.reject(new Error('No accounts'));
      })
      .catch(() =>
        fetch('/api/prospects')
          .then((r) => (r.ok ? r.json() : Promise.reject()))
          .then((data: { prospects?: Array<{ id: string; name: string; title?: string; company?: string; email?: string; linkedin_url?: string; website_url?: string }> }) => {
            const list = data?.prospects ?? [];
            if (list.length > 0) {
              setAccounts(list.map((p) => apiProspectToAccount(p)));
              return;
            }
            return fetch('/prospects.json').then((r) => (r.ok ? r.json() : Promise.reject()));
          })
          .then((raw: unknown) => {
            if (!raw) {
              setAccounts(mockAccounts);
              return;
            }
            const arr = Array.isArray(raw) ? (raw as ProspectRow[]) : [];
            setAccounts(arr.length > 0 ? arr.map(prospectToAccount) : mockAccounts);
          })
          .catch(() => setAccounts(mockAccounts))
      );
  }, []);

  const filtered = accounts.filter(a => {
    if (search) {
      const q = search.toLowerCase();
      const matchCompany = a.company.toLowerCase().includes(q);
      const matchPerson = (a.contactName ?? '').toLowerCase().includes(q);
      const matchTitle = (a.contactTitle ?? '').toLowerCase().includes(q);
      const matchEmail = (a.contactEmail ?? '').toLowerCase().includes(q);
      if (!matchCompany && !matchPerson && !matchTitle && !matchEmail) return false;
    }
    if (tierFilter !== 'All' && a.tier !== tierFilter) return false;
    if (statusFilter !== 'All' && a.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="flex h-full overflow-hidden">
      {/* Main table area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-gray-900">Accounts</h1>
            <p className="text-sm text-gray-500 mt-0.5">{accounts.length} companies tracked</p>
          </div>
          <button className="flex items-center gap-1.5 rounded-xl bg-[#2563EB] px-4 py-2.5 text-sm text-white hover:bg-[#1D4ED8] transition-all">
            <Plus className="h-4 w-4" />
            Add Account
          </button>
        </div>

        {/* Filters */}
        <GlassCard className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search accounts..."
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2 pl-10 pr-3 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]/20 transition-colors"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <div className="flex rounded-lg border border-gray-200 overflow-hidden">
                {filterOptions.tier.map(t => (
                  <button
                    key={t}
                    onClick={() => setTierFilter(t)}
                    className={`px-3 py-1.5 text-xs transition-colors ${tierFilter === t ? 'bg-[#FFD600] text-gray-900' : 'text-gray-500 hover:bg-gray-50'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-600 outline-none"
              >
                {filterOptions.status.map(s => (
                  <option key={s} value={s}>{s === 'All' ? 'All Statuses' : s}</option>
                ))}
              </select>
            </div>
          </div>
        </GlassCard>

        {/* Table */}
        <GlassCard className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  {['Company', 'Tier', 'Status', 'Last Touch', 'Next Action', 'Signal', ''].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-[11px] text-gray-400 uppercase tracking-wider">
                      <button className="flex items-center gap-1 hover:text-gray-600 transition-colors">
                        {h}{h && <ChevronDown className="h-3 w-3" />}
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((account) => (
                  <tr
                    key={account.id}
                    onClick={() => setSelectedAccount(account)}
                    className={`group border-b border-gray-100 cursor-pointer transition-colors ${
                      selectedAccount?.id === account.id ? 'bg-blue-50/60' : 'hover:bg-gray-50/80'
                    }`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-xs text-blue-600" style={{ fontWeight: 500 }}>
                          {account.company.slice(0, 2)}
                        </div>
                        <div>
                          <p className="text-sm text-gray-800">{account.company}</p>
                          {account.domain ? (
                            <a
                              href={account.domain.startsWith('http') ? account.domain : `https://${account.domain}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[11px] text-gray-400 hover:text-[#2563EB] hover:underline"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {account.domain}
                            </a>
                          ) : (
                            <p className="text-[11px] text-gray-400">{account.domain}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3"><TierBadge tier={account.tier} /></td>
                    <td className="px-4 py-3">
                      <StatusChip label={bdrStatusMap[account.status] || account.status} variant={statusVariant[account.status] || 'default'} />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{account.lastTouch}</td>
                    <td className="px-4 py-3 text-sm text-gray-500 max-w-[200px] truncate">{account.nextStep}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <div className="h-1.5 w-12 rounded-full bg-gray-100 overflow-hidden">
                          <div className="h-full rounded-full bg-gradient-to-r from-[#2563EB] to-[#FFD600]" style={{ width: `${account.signalScore}%` }} />
                        </div>
                        <span className="text-[11px] text-gray-500">{account.signalScore}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {account.domain && (
                          <a
                            href={account.domain.startsWith('http') ? account.domain : `https://${account.domain}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                            onClick={(e) => e.stopPropagation()}
                            title="Website"
                          >
                            <Globe className="h-3.5 w-3.5" />
                          </a>
                        )}
                        {account.contactEmail && (
                          <a
                            href={`mailto:${account.contactEmail}`}
                            className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                            onClick={(e) => e.stopPropagation()}
                            title="Email"
                          >
                            <Mail className="h-3.5 w-3.5" />
                          </a>
                        )}
                        {account.linkedinUrl && (
                          <a
                            href={account.linkedinUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                            onClick={(e) => e.stopPropagation()}
                            title="LinkedIn"
                          >
                            <Linkedin className="h-3.5 w-3.5" />
                          </a>
                        )}
                        {(!account.domain && !account.contactEmail && !account.linkedinUrl) && (
                          <>
                            <button className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600" onClick={(e) => { e.stopPropagation(); }}><Mail className="h-3.5 w-3.5" /></button>
                            <button className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600" onClick={(e) => { e.stopPropagation(); }}><Linkedin className="h-3.5 w-3.5" /></button>
                            <button className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600" onClick={(e) => { e.stopPropagation(); }}><Phone className="h-3.5 w-3.5" /></button>
                          </>
                        )}
                        <button className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600" onClick={(e) => { e.stopPropagation(); }}>
                          <CheckSquare className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>

      {/* Side panel */}
      {selectedAccount && (
        <AccountSidePanel
          account={selectedAccount}
          onClose={() => setSelectedAccount(null)}
          people={sidePanelPeople}
        />
      )}
    </div>
  );
}
