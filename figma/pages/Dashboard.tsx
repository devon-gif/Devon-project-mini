"use client";

import { GlassCard } from '../components/GlassCard';
import { StatusChip } from '../components/StatusChip';
import { kpiData, weeklyActivityData, accounts, tasks, emailThreads } from '../data/mockData';
import {
  Building2, MessageSquare, Calendar, DollarSign, AlertCircle,
  ArrowUpRight, TrendingUp, UserPlus, Zap, Mail, Phone,
  Clock, ChevronRight, Flame,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { useNavigate } from 'react-router';

const kpis = [
  { label: 'Accounts Touched', value: kpiData.accountsTouched, change: kpiData.accountsTouchedChange, icon: Building2, color: '#2563EB' },
  { label: 'Replies', value: kpiData.replies, change: kpiData.repliesChange, icon: MessageSquare, color: '#10B981' },
  { label: 'Meetings', value: kpiData.meetings, change: kpiData.meetingsChange, icon: Calendar, color: '#F59E0B' },
  { label: 'Pipeline Value', value: kpiData.pipelineValue, change: kpiData.pipelineChange, icon: DollarSign, color: '#FFD600' },
];

export function Dashboard() {
  const navigate = useNavigate();
  const todayTasks = tasks.filter(t => t.status !== 'done').slice(0, 4);
  const hotAccounts = accounts.filter(a => a.signalScore >= 80).sort((a, b) => b.signalScore - a.signalScore);
  const recentEmails = emailThreads.filter(t => t.unread).slice(0, 3);

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-gray-900">Good morning, Alex</h1>
        <p className="text-sm text-gray-500 mt-1">Here's what needs your attention today</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <GlassCard key={kpi.label} className="p-4" hover>
            <div className="flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: `${kpi.color}15` }}>
                <kpi.icon className="h-5 w-5" style={{ color: kpi.color }} />
              </div>
              <div className="flex items-center gap-1 text-xs text-emerald-600">
                <ArrowUpRight className="h-3 w-3" />
                {kpi.change}
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl text-gray-900" style={{ fontWeight: 600 }}>{kpi.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{kpi.label}</p>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Activity chart */}
        <GlassCard className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-gray-800">Weekly Activity</h3>
              <p className="text-xs text-gray-400 mt-0.5">Emails, replies & meetings this week</p>
            </div>
            <TrendingUp className="h-4 w-4 text-[#2563EB]" />
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyActivityData} barGap={4}>
              <XAxis dataKey="day" tick={{ fill: '#9CA3AF', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E5E7EB',
                  borderRadius: '12px',
                  color: '#374151',
                  fontSize: '13px',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                }}
              />
              <Bar dataKey="emails" fill="#2563EB" radius={[4, 4, 0, 0]} />
              <Bar dataKey="replies" fill="#10B981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="meetings" fill="#FFD600" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-5 mt-3">
            <span className="flex items-center gap-1.5 text-xs text-gray-500"><span className="h-2 w-2 rounded-full bg-[#2563EB]" />Emails</span>
            <span className="flex items-center gap-1.5 text-xs text-gray-500"><span className="h-2 w-2 rounded-full bg-[#10B981]" />Replies</span>
            <span className="flex items-center gap-1.5 text-xs text-gray-500"><span className="h-2 w-2 rounded-full bg-[#FFD600]" />Meetings</span>
          </div>
        </GlassCard>

        {/* Today's Tasks */}
        <GlassCard className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-800">Today</h3>
            <StatusChip label={`${kpiData.overdueTasks} overdue`} variant="danger" />
          </div>
          <div className="space-y-2.5">
            {todayTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50/50 p-3 cursor-pointer hover:bg-gray-100/60 transition-colors"
                onClick={() => navigate('/tasks')}
              >
                <div className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg ${task.priority === 'high' ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-400'}`}>
                  {task.type === 'call' ? <Phone className="h-3 w-3" /> :
                   task.type === 'research' ? <Building2 className="h-3 w-3" /> :
                   task.type === 'intro_request' ? <UserPlus className="h-3 w-3" /> :
                   <Mail className="h-3 w-3" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-gray-700 truncate">{task.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[11px] text-gray-400">{task.linkedAccount}</span>
                    <span className="text-[11px] text-gray-300">·</span>
                    <span className="flex items-center gap-0.5 text-[11px] text-gray-400">
                      <Clock className="h-3 w-3" />{task.dueDate}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Bottom grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Hot Accounts */}
        <GlassCard className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-[#FFD600]" />
              <h3 className="text-gray-800">Hot Accounts</h3>
            </div>
            <button onClick={() => navigate('/accounts')} className="text-xs text-[#2563EB] hover:text-[#1D4ED8] transition-colors flex items-center gap-0.5">
              View all <ChevronRight className="h-3 w-3" />
            </button>
          </div>
          <div className="space-y-2">
            {hotAccounts.map((account) => (
              <div
                key={account.id}
                onClick={() => navigate(`/accounts/${account.id}`)}
                className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50/50 p-3 cursor-pointer hover:bg-gray-100/60 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-xs text-blue-600" style={{ fontWeight: 500 }}>
                    {account.company.slice(0, 2)}
                  </div>
                  <div>
                    <p className="text-sm text-gray-800">{account.company}</p>
                    <p className="text-[11px] text-gray-400">{account.nextStep}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <div className="h-1.5 w-16 rounded-full bg-gray-100 overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-[#2563EB] to-[#FFD600]" style={{ width: `${account.signalScore}%` }} />
                    </div>
                    <span className="text-[11px] text-gray-500">{account.signalScore}</span>
                  </div>
                  {account.tags.slice(0, 1).map(tag => (
                    <StatusChip key={tag} label={tag} variant={tag === 'Hot' ? 'accent' : 'info'} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Recent Emails */}
        <GlassCard className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-[#2563EB]" />
              <h3 className="text-gray-800">Recent Emails</h3>
            </div>
            <button onClick={() => navigate('/inbox')} className="text-xs text-[#2563EB] hover:text-[#1D4ED8] transition-colors flex items-center gap-0.5">
              Open Inbox <ChevronRight className="h-3 w-3" />
            </button>
          </div>
          <div className="space-y-2">
            {recentEmails.map((thread) => (
              <div
                key={thread.id}
                onClick={() => navigate('/inbox')}
                className="flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50/50 p-3 cursor-pointer hover:bg-gray-100/60 transition-colors"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs text-blue-600" style={{ fontWeight: 500 }}>
                  {thread.from.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-gray-800 truncate">{thread.from}</p>
                    <span className="text-[11px] text-gray-400 shrink-0">{thread.date}</span>
                  </div>
                  <p className="text-xs text-gray-500 truncate mt-0.5">{thread.subject}</p>
                  <p className="text-[11px] text-gray-400 truncate mt-0.5">{thread.preview}</p>
                </div>
                {thread.unread && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#2563EB]" />}
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Quick Actions */}
      <GlassCard className="p-5">
        <h3 className="text-gray-800 mb-3">Quick Actions</h3>
        <div className="flex flex-wrap gap-2">
          {[
            { label: 'Add Person', icon: UserPlus, color: '#2563EB' },
            { label: 'Start Sequence', icon: Zap, color: '#FFD600' },
            { label: 'Draft Email', icon: Mail, color: '#10B981' },
            { label: 'Log Call', icon: Phone, color: '#F59E0B' },
          ].map((action) => (
            <button
              key={action.label}
              className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-800 hover:border-gray-300 transition-all"
            >
              <action.icon className="h-4 w-4" style={{ color: action.color }} />
              {action.label}
            </button>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
