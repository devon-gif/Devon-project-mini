"use client";

import { useParams, useRouter } from 'next/navigation';
import { GlassCard } from '../components/GlassCard';
import { StatusChip, TierBadge } from '../components/StatusChip';
import { accounts, people, tasks, emailThreads } from '../data/mockData';
import {
  ArrowLeft, ExternalLink, Globe, Tag, Users, Mail,
  StickyNote, Activity, TrendingUp, Calendar, Phone,
  CheckSquare, ChevronRight, Plus, Sparkles,
} from 'lucide-react';
import { useState } from 'react';

export function AccountDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');

  const account = accounts.find(a => a.id === id);
  if (!account) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-gray-400">Account not found</p>
      </div>
    );
  }

  const accountPeople = people.filter(p => p.accountId === id);
  const accountEmails = emailThreads.filter(t => t.accountId === id);
  const accountTasks = tasks.filter(t => t.linkedAccount === account.company);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'people', label: `People (${accountPeople.length})`, icon: Users },
    { id: 'emails', label: `Emails (${accountEmails.length})`, icon: Mail },
    { id: 'tasks', label: `Tasks (${accountTasks.length})`, icon: CheckSquare },
    { id: 'notes', label: 'Notes', icon: StickyNote },
  ];

  return (
    <div className="h-full overflow-y-auto p-6 space-y-5">
      {/* Back button */}
      <button onClick={() => router.push('/accounts')} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Back to Accounts
      </button>

      {/* Header */}
      <GlassCard className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-lg text-blue-600" style={{ fontWeight: 600 }}>
              {account.company.slice(0, 2)}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-gray-900">{account.company}</h1>
                <TierBadge tier={account.tier} />
                <StatusChip label={account.status} variant={account.status === 'Active' ? 'success' : account.status === 'Prospecting' ? 'info' : 'purple'} />
              </div>
              <div className="flex items-center gap-4 mt-2">
                <span className="flex items-center gap-1 text-sm text-gray-500">
                  <Globe className="h-3.5 w-3.5" />{account.domain}
                </span>
                <span className="text-sm text-gray-500">{account.industry}</span>
                <span className="flex items-center gap-1 text-sm text-gray-500">
                  <Users className="h-3.5 w-3.5" />{account.peopleCount} contacts
                </span>
              </div>
              <div className="flex items-center gap-2 mt-2.5">
                {account.tags.map(tag => (
                  <StatusChip key={tag} label={tag} variant={tag === 'Hot' ? 'accent' : tag === 'Enterprise' ? 'info' : 'default'} />
                ))}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
              <ExternalLink className="h-3.5 w-3.5" />
              Website
            </button>
            <button className="flex items-center gap-1.5 rounded-xl bg-[#2563EB] px-3.5 py-2 text-sm text-white hover:bg-[#1D4ED8] transition-colors">
              <Mail className="h-3.5 w-3.5" />
              Send Email
            </button>
          </div>
        </div>
      </GlassCard>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 pb-0">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm transition-colors border-b-2 -mb-[1px] ${
              activeTab === tab.id
                ? 'text-gray-900 border-[#2563EB]'
                : 'text-gray-500 border-transparent hover:text-gray-700'
            }`}
          >
            <tab.icon className="h-3.5 w-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <GlassCard className="p-5">
            <h3 className="text-gray-800 mb-4">Key Info</h3>
            <div className="space-y-3">
              {[
                { label: 'Owner', value: account.owner },
                { label: 'Last Touch', value: account.lastTouch },
                { label: 'Next Step', value: account.nextStep },
                { label: 'Industry', value: account.industry },
                { label: 'Notes', value: account.notes },
              ].map(item => (
                <div key={item.label} className="flex items-start justify-between py-1">
                  <span className="text-sm text-gray-500">{item.label}</span>
                  <span className="text-sm text-gray-700 text-right max-w-[60%]">{item.value}</span>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-4 w-4 text-[#FFD600]" />
              <h3 className="text-gray-800">Signals</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                <TrendingUp className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm text-emerald-700">Hiring Signal</p>
                  <p className="text-xs text-gray-500 mt-0.5">{account.notes}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 p-3">
                <Activity className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm text-blue-700">High Engagement</p>
                  <p className="text-xs text-gray-500 mt-0.5">3 emails opened, 2 replies this week</p>
                </div>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 p-3">
                <div>
                  <p className="text-sm text-gray-600">Signal Score</p>
                  <p className="text-xs text-gray-400 mt-0.5">Based on engagement + intent signals</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-20 rounded-full bg-gray-200 overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-[#2563EB] to-[#FFD600]" style={{ width: `${account.signalScore}%` }} />
                  </div>
                  <span className="text-sm text-gray-800" style={{ fontWeight: 600 }}>{account.signalScore}</span>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      {activeTab === 'people' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">{accountPeople.length} contacts at {account.company}</p>
            <button className="flex items-center gap-1.5 rounded-xl bg-blue-50 px-3 py-1.5 text-xs text-blue-600 hover:bg-blue-100 transition-colors">
              <Plus className="h-3 w-3" />Add Contact
            </button>
          </div>
          {accountPeople.map(person => (
            <GlassCard key={person.id} className="p-4" hover onClick={() => router.push(`/people/${person.id}`)}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-xs text-blue-600" style={{ fontWeight: 500 }}>
                    {person.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="text-sm text-gray-800">{person.name}</p>
                    <p className="text-xs text-gray-500">{person.title}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <StatusChip label={person.replyStatus} variant={person.replyStatus === 'Replied' ? 'success' : person.replyStatus === 'Opened' ? 'warning' : 'default'} />
                  <ChevronRight className="h-4 w-4 text-gray-300" />
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {activeTab === 'emails' && (
        <div className="space-y-3">
          {accountEmails.length === 0 ? (
            <div className="text-center py-12 text-gray-400">No email threads yet</div>
          ) : accountEmails.map(thread => (
            <GlassCard key={thread.id} className="p-4" hover onClick={() => router.push('/inbox')}>
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-gray-800 truncate">{thread.subject}</p>
                  <p className="text-xs text-gray-500 mt-1 truncate">{thread.preview}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-3">
                  <span className="text-[11px] text-gray-400">{thread.date}</span>
                  {thread.unread && <span className="h-2 w-2 rounded-full bg-[#2563EB]" />}
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {activeTab === 'tasks' && (
        <div className="space-y-3">
          {accountTasks.map(task => (
            <GlassCard key={task.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${task.priority === 'high' ? 'bg-amber-50 text-amber-500' : 'bg-gray-100 text-gray-400'}`}>
                    {task.type === 'call' ? <Phone className="h-3.5 w-3.5" /> : task.type === 'research' ? <Tag className="h-3.5 w-3.5" /> : <Mail className="h-3.5 w-3.5" />}
                  </div>
                  <div>
                    <p className="text-sm text-gray-800">{task.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{task.notes}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <Calendar className="h-3 w-3" />{task.dueDate}
                  </span>
                  <StatusChip label={task.status.replace('_', ' ')} variant={task.status === 'done' ? 'success' : task.status === 'in_progress' ? 'warning' : 'default'} />
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {activeTab === 'notes' && (
        <GlassCard className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-800">Notes</h3>
            <button className="flex items-center gap-1 text-xs text-[#2563EB]">
              <Plus className="h-3 w-3" />Add Note
            </button>
          </div>
          <div className="space-y-3">
            <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500">Alex Kim · 2 hours ago</span>
              </div>
              <p className="text-sm text-gray-600">{account.notes}</p>
            </div>
            <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500">Alex Kim · 1 week ago</span>
              </div>
              <p className="text-sm text-gray-600">Initial research completed. Key decision makers identified. Moving to outreach phase.</p>
            </div>
          </div>
        </GlassCard>
      )}
    </div>
  );
}
