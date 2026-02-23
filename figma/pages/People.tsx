"use client";

import { useState } from 'react';
import { useNavigate } from 'react-router';
import { GlassCard } from '../components/GlassCard';
import { StatusChip } from '../components/StatusChip';
import { people } from '../data/mockData';
import {
  Search, Filter, Plus, ChevronDown, MoreHorizontal,
  Mail, CheckCircle, AlertCircle, XCircle,
} from 'lucide-react';

const emailStatusIcon: Record<string, { icon: typeof CheckCircle; color: string }> = {
  verified: { icon: CheckCircle, color: 'text-emerald-500' },
  unverified: { icon: AlertCircle, color: 'text-amber-500' },
  bounced: { icon: XCircle, color: 'text-red-500' },
};

const replyVariant: Record<string, 'success' | 'warning' | 'default' | 'danger'> = {
  Replied: 'success',
  Opened: 'warning',
  'No reply': 'default',
  Bounced: 'danger',
};

export function People() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [seniorityFilter, setSeniorityFilter] = useState('All');

  const filtered = people.filter(p => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.company.toLowerCase().includes(search.toLowerCase())) return false;
    if (seniorityFilter !== 'All' && p.seniority !== seniorityFilter) return false;
    return true;
  });

  return (
    <div className="h-full overflow-y-auto p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900">People</h1>
          <p className="text-sm text-gray-500 mt-0.5">{people.length} contacts tracked</p>
        </div>
        <button className="flex items-center gap-1.5 rounded-xl bg-[#2563EB] px-4 py-2.5 text-sm text-white hover:bg-[#1D4ED8] transition-all">
          <Plus className="h-4 w-4" />
          Add Person
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
              placeholder="Search people or companies..."
              className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2 pl-10 pr-3 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]/20 transition-colors"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <div className="flex rounded-lg border border-gray-200 overflow-hidden">
              {['All', 'C-Suite', 'VP', 'Director', 'Manager'].map(s => (
                <button
                  key={s}
                  onClick={() => setSeniorityFilter(s)}
                  className={`px-3 py-1.5 text-xs transition-colors ${seniorityFilter === s ? 'bg-[#FFD600] text-gray-900' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Table */}
      <GlassCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                {['Name', 'Title', 'Company', 'Seniority', 'Email', 'Last Email', 'Reply', 'Next Task', ''].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] text-gray-400 uppercase tracking-wider">
                    <button className="flex items-center gap-1 hover:text-gray-600 transition-colors">
                      {h}{h && <ChevronDown className="h-3 w-3" />}
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((person) => {
                const emailIcon = emailStatusIcon[person.emailStatus];
                return (
                  <tr
                    key={person.id}
                    onClick={() => navigate(`/people/${person.id}`)}
                    className="group border-b border-gray-100 cursor-pointer hover:bg-gray-50/80 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-xs text-blue-600" style={{ fontWeight: 500 }}>
                          {person.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="text-sm text-gray-800">{person.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 max-w-[150px] truncate">{person.title}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{person.company}</td>
                    <td className="px-4 py-3">
                      <StatusChip label={person.seniority} variant={person.seniority === 'C-Suite' ? 'accent' : person.seniority === 'VP' ? 'info' : 'default'} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <emailIcon.icon className={`h-3.5 w-3.5 ${emailIcon.color}`} />
                        <span className="text-xs text-gray-500 truncate max-w-[140px]">{person.email}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{person.lastEmail}</td>
                    <td className="px-4 py-3"><StatusChip label={person.replyStatus} variant={replyVariant[person.replyStatus]} /></td>
                    <td className="px-4 py-3 text-sm text-gray-500 max-w-[150px] truncate">{person.nextTask}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600" onClick={(e) => e.stopPropagation()}>
                          <Mail className="h-3.5 w-3.5" />
                        </button>
                        <button className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600" onClick={(e) => e.stopPropagation()}>
                          <MoreHorizontal className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
