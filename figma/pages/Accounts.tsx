"use client";

import { useState, useEffect } from 'react';
import { GlassCard } from '../components/GlassCard';
import { StatusChip, TierBadge } from '../components/StatusChip';
import { AccountSidePanel } from '../components/AccountSidePanel';
import type { Account } from '../data/mockData';
import {
  Search, Filter, Plus, ChevronDown,
  Mail, Linkedin, Phone, CheckSquare, Globe, ExternalLink,
} from 'lucide-react';
import { PersonAvatar } from '../components/PersonAvatar';

export type SidePanelPerson = {
  id: string;
  name: string | null;
  title: string | null;
  email: string | null;
  linkedin_url?: string | null;
  avatar_url?: string | null;
};

export type Lead = Account & {
  linkedinCompanySearch?: string;
  crunchbaseSearch?: string;
  primaryBuyerTitles?: string;
  secondaryTitles?: string;
  triggerToMention?: string;
  peopleCount?: number;
};

type LeadsResponse = {
  leads: Array<{
    id: string;
    company: string;
    domain: string;
    tier: 'P0' | 'P1' | 'P2';
    industry: string;
    status: string;
    lastTouch: string;
    nextAction: string;
    signalScore: number;
    linkedinCompanySearch?: string;
    crunchbaseSearch?: string;
    primaryBuyerTitles?: string;
    secondaryTitles?: string;
    triggerToMention?: string;
  }>;
  contactsByLeadId: Record<string, SidePanelPerson[]>;
};

function apiLeadToLead(row: LeadsResponse['leads'][0], people: SidePanelPerson[]): Lead {
  return {
    id: row.id,
    company: row.company || '—',
    domain: row.domain || '—',
    tier: row.tier,
    industry: row.industry || '—',
    status: (row.status as Lead['status']) || 'Prospecting',
    lastTouch: row.lastTouch || 'No touch',
    nextStep: row.nextAction || 'Add first touch',
    owner: 'You',
    notes: '',
    tags: [],
    peopleCount: people.length,
    signalScore: row.signalScore ?? 0,
    linkedinCompanySearch: row.linkedinCompanySearch,
    crunchbaseSearch: row.crunchbaseSearch,
    primaryBuyerTitles: row.primaryBuyerTitles,
    secondaryTitles: row.secondaryTitles,
    triggerToMention: row.triggerToMention,
  };
}

const statusVariant: Record<string, 'success' | 'warning' | 'info' | 'purple' | 'default'> = {
  'Active': 'success',
  'Prospecting': 'info',
  'Nurturing': 'purple',
  'Closed Won': 'success',
  'Closed Lost': 'default',
};

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

export function Accounts() {
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [contactsByLeadId, setContactsByLeadId] = useState<Record<string, SidePanelPerson[]>>({});

  useEffect(() => {
    fetch('/api/leads')
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data: LeadsResponse) => {
        const contacts = data.contactsByLeadId ?? {};
        setContactsByLeadId(contacts);
        setLeads(
          (data.leads ?? []).map((row) =>
            apiLeadToLead(row, contacts[row.id] ?? [])
          )
        );
      })
      .catch(() => setLeads([]));
  }, []);

  const sidePanelPeople = selectedLead?.id ? (contactsByLeadId[selectedLead.id] ?? []) : [];

  const filtered = leads.filter((a) => {
    if (search) {
      const q = search.toLowerCase();
      if (!a.company.toLowerCase().includes(q)) return false;
    }
    if (tierFilter !== 'All' && a.tier !== tierFilter) return false;
    if (statusFilter !== 'All' && a.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="flex h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-gray-900">Leads</h1>
            <p className="text-sm text-gray-500 mt-0.5">{leads.length} leads tracked</p>
          </div>
          <button className="flex items-center gap-1.5 rounded-xl bg-[#2563EB] px-4 py-2.5 text-sm text-white hover:bg-[#1D4ED8] transition-all">
            <Plus className="h-4 w-4" />
            Add Lead
          </button>
        </div>

        <GlassCard className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search leads..."
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2 pl-10 pr-3 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]/20 transition-colors"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <div className="flex rounded-lg border border-gray-200 overflow-hidden">
                {filterOptions.tier.map((t) => (
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
                {filterOptions.status.map((s) => (
                  <option key={s} value={s}>{s === 'All' ? 'All Statuses' : s}</option>
                ))}
              </select>
            </div>
          </div>
        </GlassCard>

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
                {filtered.map((lead) => (
                  <tr
                    key={lead.id}
                    onClick={() => setSelectedLead(lead)}
                    className={`group border-b border-gray-100 cursor-pointer transition-colors ${
                      selectedLead?.id === lead.id ? 'bg-blue-50/60' : 'hover:bg-gray-50/80'
                    }`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {(contactsByLeadId[lead.id]?.length ?? 0) > 0 ? (
                          <PersonAvatar
                            name={contactsByLeadId[lead.id][0].name}
                            avatar_url={contactsByLeadId[lead.id][0].avatar_url}
                            company={lead.company}
                            size={32}
                            showFindPhoto={false}
                          />
                        ) : (
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-xs text-blue-600" style={{ fontWeight: 500 }}>
                            {lead.company.slice(0, 2)}
                          </div>
                        )}
                        <div>
                          <p className="text-sm text-gray-800">{lead.company}</p>
                          {(lead.peopleCount ?? 0) > 0 && (
                            <p className="text-[10px] text-gray-400">Contacts ({lead.peopleCount})</p>
                          )}
                          {lead.domain ? (
                            <a
                              href={lead.domain.startsWith('http') ? lead.domain : `https://${lead.domain}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[11px] text-gray-400 hover:text-[#2563EB] hover:underline"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {lead.domain}
                            </a>
                          ) : (
                            <p className="text-[11px] text-gray-400">{lead.domain}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3"><TierBadge tier={lead.tier} /></td>
                    <td className="px-4 py-3">
                      <StatusChip label={bdrStatusMap[lead.status] || lead.status} variant={statusVariant[lead.status] || 'default'} />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{lead.lastTouch}</td>
                    <td className="px-4 py-3 text-sm text-gray-500 max-w-[200px] truncate">{lead.nextStep}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <div className="h-1.5 w-12 rounded-full bg-gray-100 overflow-hidden">
                          <div className="h-full rounded-full bg-gradient-to-r from-[#2563EB] to-[#FFD600]" style={{ width: `${lead.signalScore}%` }} />
                        </div>
                        <span className="text-[11px] text-gray-500">{lead.signalScore}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {lead.linkedinCompanySearch && (
                          <a
                            href={lead.linkedinCompanySearch}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-[#0A66C2]"
                            onClick={(e) => e.stopPropagation()}
                            title="LinkedIn company search"
                          >
                            <Linkedin className="h-3.5 w-3.5" />
                          </a>
                        )}
                        {lead.crunchbaseSearch && (
                          <a
                            href={lead.crunchbaseSearch}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                            onClick={(e) => e.stopPropagation()}
                            title="Crunchbase search"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        )}
                        <button className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600" onClick={(e) => e.stopPropagation()}>
                          <CheckSquare className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="px-4 py-12 text-center text-sm text-gray-500">
              No leads match your filters. Try adjusting search or filters.
            </div>
          )}
        </GlassCard>
      </div>

      {selectedLead && (
        <AccountSidePanel
          account={selectedLead as Account}
          onClose={() => setSelectedLead(null)}
          people={sidePanelPeople}
          linkedinCompanySearch={selectedLead.linkedinCompanySearch}
          crunchbaseSearch={selectedLead.crunchbaseSearch}
          primaryBuyerTitles={selectedLead.primaryBuyerTitles}
          secondaryTitles={selectedLead.secondaryTitles}
          triggerToMention={selectedLead.triggerToMention}
        />
      )}
    </div>
  );
}
