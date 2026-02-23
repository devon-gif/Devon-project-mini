import { X, Mail, Phone, Linkedin, Clock, CheckSquare, Video } from 'lucide-react';
import { useNavigate } from 'react-router';
import { StatusChip, TierBadge } from './StatusChip';
import { people, emailThreads, tasks } from '../data/mockData';
import type { Account } from '../data/mockData';

interface AccountSidePanelProps {
  account: Account | null;
  onClose: () => void;
}

const statusVariant: Record<string, 'success' | 'warning' | 'info' | 'purple' | 'default'> = {
  'Active': 'success',
  'Prospecting': 'info',
  'Nurturing': 'purple',
  'Closed Won': 'success',
  'Closed Lost': 'default',
};

export function AccountSidePanel({ account, onClose }: AccountSidePanelProps) {
  const navigate = useNavigate();

  if (!account) return null;

  const accountPeople = people.filter(p => p.accountId === account.id);
  const accountEmails = emailThreads.filter(t => t.accountId === account.id);
  const accountTasks = tasks.filter(t => t.linkedAccount === account.company);

  return (
    <div className="flex h-full w-[420px] shrink-0 flex-col border-l border-gray-200 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-sm text-blue-600" style={{ fontWeight: 500 }}>
            {account.company.slice(0, 2)}
          </div>
          <div>
            <h3 className="text-gray-900">{account.company}</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-gray-400">{account.domain}</span>
              <TierBadge tier={account.tier} />
              <StatusChip label={account.status} variant={statusVariant[account.status] || 'default'} />
            </div>
          </div>
        </div>
        <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 transition-colors">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto">
        {/* Quick info */}
        <div className="px-5 py-4 border-b border-gray-100 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Signal Score</span>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-20 rounded-full bg-gray-100 overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-[#2563EB] to-[#FFD600]" style={{ width: `${account.signalScore}%` }} />
              </div>
              <span className="text-xs text-gray-600" style={{ fontWeight: 500 }}>{account.signalScore}</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Industry</span>
            <span className="text-xs text-gray-600">{account.industry}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Last Touch</span>
            <span className="text-xs text-gray-600">{account.lastTouch}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Next Step</span>
            <span className="text-xs text-[#2563EB]">{account.nextStep}</span>
          </div>
          {account.notes && (
            <div className="rounded-lg bg-gray-50 px-3 py-2 mt-2">
              <p className="text-xs text-gray-500">{account.notes}</p>
            </div>
          )}
          <div className="flex flex-wrap gap-1.5 mt-2">
            {account.tags.map(tag => (
              <span key={tag} className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[10px] text-gray-500">{tag}</span>
            ))}
          </div>
        </div>

        {/* Contacts */}
        <div className="px-5 py-4 border-b border-gray-100">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">Contacts ({accountPeople.length})</p>
          <div className="space-y-2.5">
            {accountPeople.map(person => (
              <div key={person.id} className="flex items-center justify-between group">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-[10px] text-blue-600" style={{ fontWeight: 500 }}>
                    {person.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="text-sm text-gray-800">{person.name}</p>
                    <p className="text-[11px] text-gray-400">{person.title}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="flex h-6 w-6 items-center justify-center rounded text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                    <Mail className="h-3 w-3" />
                  </button>
                  {person.phone && (
                    <button className="flex h-6 w-6 items-center justify-center rounded text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                      <Phone className="h-3 w-3" />
                    </button>
                  )}
                  {person.linkedin && (
                    <button className="flex h-6 w-6 items-center justify-center rounded text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                      <Linkedin className="h-3 w-3" />
                    </button>
                  )}
                  <button
                    onClick={() => navigate(`/videos/create?person=${person.id}`)}
                    className="flex h-6 w-6 items-center justify-center rounded text-gray-400 hover:bg-blue-50 hover:text-[#2563EB]"
                    title={`Send video to ${person.name}`}
                  >
                    <Video className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
            {accountPeople.length === 0 && (
              <p className="text-xs text-gray-400 text-center py-2">No contacts yet</p>
            )}
          </div>
        </div>

        {/* Recent activity / emails */}
        <div className="px-5 py-4 border-b border-gray-100">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">Recent Activity</p>
          <div className="space-y-2">
            {accountEmails.map(thread => (
              <div key={thread.id} className="flex items-start gap-2.5 rounded-lg bg-gray-50 p-2.5">
                <Mail className="h-3.5 w-3.5 text-gray-400 mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-gray-700 truncate">{thread.subject}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{thread.date} &middot; {thread.from === 'You' ? `To ${thread.to}` : `From ${thread.from}`}</p>
                </div>
              </div>
            ))}
            {accountEmails.length === 0 && (
              <p className="text-xs text-gray-400 text-center py-2">No email activity yet</p>
            )}
          </div>
        </div>

        {/* Tasks */}
        <div className="px-5 py-4">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">Next Actions</p>
          <div className="space-y-2">
            {accountTasks.filter(t => t.status !== 'done').map(task => (
              <div key={task.id} className="flex items-center gap-2.5 rounded-lg border border-gray-100 bg-gray-50/50 p-2.5">
                <CheckSquare className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-gray-700 truncate">{task.title}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1">
                    <Clock className="h-2.5 w-2.5" />{task.dueDate}
                  </p>
                </div>
              </div>
            ))}
            {accountTasks.filter(t => t.status !== 'done').length === 0 && (
              <p className="text-xs text-gray-400 text-center py-2">No pending tasks</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
