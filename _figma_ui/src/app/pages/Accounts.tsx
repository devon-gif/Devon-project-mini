import { useState } from 'react';
import { GlassCard } from '../components/GlassCard';
import { StatusChip, TierBadge } from '../components/StatusChip';
import { AccountSidePanel } from '../components/AccountSidePanel';
import { accounts } from '../data/mockData';
import type { Account } from '../data/mockData';
import {
  Search, Filter, Plus, MoreHorizontal, ChevronDown,
  Mail, Linkedin, Phone, CheckSquare,
} from 'lucide-react';

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

export function Accounts() {
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

  const filtered = accounts.filter(a => {
    if (search && !a.company.toLowerCase().includes(search.toLowerCase())) return false;
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
            <h1 className="text-gray-900">Leads</h1>
            <p className="text-sm text-gray-500 mt-0.5">{accounts.length} leads tracked</p>
          </div>
          <button className="flex items-center gap-1.5 rounded-xl bg-[#2563EB] px-4 py-2.5 text-sm text-white hover:bg-[#1D4ED8] transition-all">
            <Plus className="h-4 w-4" />
            Add Lead
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
                placeholder="Search leads..."
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
                          <p className="text-[11px] text-gray-400">{account.domain}</p>
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
                        <button className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600" onClick={(e) => { e.stopPropagation(); }}>
                          <Mail className="h-3.5 w-3.5" />
                        </button>
                        <button className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600" onClick={(e) => { e.stopPropagation(); }}>
                          <Linkedin className="h-3.5 w-3.5" />
                        </button>
                        <button className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600" onClick={(e) => { e.stopPropagation(); }}>
                          <Phone className="h-3.5 w-3.5" />
                        </button>
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
        />
      )}
    </div>
  );
}
