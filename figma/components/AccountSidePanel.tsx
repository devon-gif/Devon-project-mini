"use client";

import { X, Mail, Phone, Linkedin, Clock, CheckSquare, Video, Globe, ExternalLink } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useRef } from 'react';
import { StatusChip, TierBadge } from './StatusChip';
import { PersonAvatar } from './PersonAvatar';
import { CompanyLogo } from './CompanyLogo';
import { people, emailThreads, tasks } from '../data/mockData';
import type { Account } from '../data/mockData';
import type { SidePanelPerson } from '../pages/Accounts';

interface AccountSidePanelProps {
  account: Account | null;
  onClose: () => void;
  /** When provided (from GET /api/accounts/[id] or /api/leads), show these contacts with live links */
  people?: SidePanelPerson[];
  /** Called when a person's avatar is updated (for DB-backed people) */
  onAvatarChange?: (personId: string, avatarUrl: string) => void;
  /** Lead research links (from CSV); shown as buttons and used for research fallback when no people */
  linkedinCompanySearch?: string;
  crunchbaseSearch?: string;
  primaryBuyerTitles?: string;
  secondaryTitles?: string;
  triggerToMention?: string;
}

const statusVariant: Record<string, 'success' | 'warning' | 'info' | 'purple' | 'default'> = {
  'Active': 'success',
  'Prospecting': 'info',
  'Nurturing': 'purple',
  'Closed Won': 'success',
  'Closed Lost': 'default',
};

export function AccountSidePanel({
  account,
  onClose,
  people: apiPeople,
  linkedinCompanySearch,
  crunchbaseSearch,
  primaryBuyerTitles,
  secondaryTitles,
  triggerToMention,
  onAvatarChange,
}: AccountSidePanelProps) {
  const router = useRouter();
  const nextActionsRef = useRef<HTMLDivElement>(null);

  if (!account) return null;

  const accountPeople = apiPeople?.length ? apiPeople : people.filter(p => p.accountId === account.id);
  const accountEmails = emailThreads.filter(t => t.accountId === account.id);
  const accountTasks = tasks.filter(t => t.linkedAccount === account.company);
  const websiteUrl = account.domain ? (account.domain.startsWith('http') ? account.domain : `https://${account.domain}`) : null;
  const isApiPeople = Boolean(apiPeople?.length);
  const hasResearchLinks = !!(linkedinCompanySearch || crunchbaseSearch);
  const showResearchFallback = accountPeople.length === 0 && !account.contactName && !account.contactEmail && hasResearchLinks;

  return (
    <div className="flex h-full w-[420px] shrink-0 flex-col border-l border-gray-200 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
        <div className="flex items-center gap-3">
          <CompanyLogo domain={account.domain} company={account.company} size={40} />
          <div>
            <h3 className="text-gray-900">{account.company}</h3>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              {websiteUrl ? (
                <a href={websiteUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-gray-400 hover:text-[#2563EB] hover:underline">{account.domain}</a>
              ) : (
                <span className="text-xs text-gray-400">{account.domain}</span>
              )}
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
            <span className="text-xs text-gray-600">{account.industry || '—'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Last Touch</span>
            <span className="text-xs text-gray-600">{account.lastTouch}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Next Step</span>
            <button
              type="button"
              onClick={() => nextActionsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })}
              className="text-xs text-[#2563EB] hover:underline text-left"
            >
              {account.nextStep}
            </button>
          </div>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {websiteUrl && (
              <a href={websiteUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-600 hover:bg-gray-50">
                <Globe className="h-3 w-3" /> Website
              </a>
            )}
            {(linkedinCompanySearch || account.linkedinUrl) && (
              <a href={linkedinCompanySearch || account.linkedinUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-600 hover:bg-gray-50">
                <Linkedin className="h-3 w-3" /> {linkedinCompanySearch ? 'LinkedIn Search' : 'LinkedIn'}
              </a>
            )}
            {crunchbaseSearch && (
              <a href={crunchbaseSearch} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-600 hover:bg-gray-50">
                <ExternalLink className="h-3 w-3" /> Crunchbase Search
              </a>
            )}
            {account.contactEmail && (
              <a href={`mailto:${account.contactEmail}`} className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-600 hover:bg-gray-50">
                <Mail className="h-3 w-3" /> Email
              </a>
            )}
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

        {/* People / Contacts */}
        <div className="px-5 py-4 border-b border-gray-100">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">
            {showResearchFallback ? 'People' : `Contacts (${accountPeople.length + (account.contactName || account.contactEmail ? 1 : 0)})`}
          </p>
          <div className="space-y-2.5">
            {showResearchFallback && (
              <>
                <div className="flex flex-wrap gap-2 mb-3">
                  {linkedinCompanySearch && (
                    <a href={linkedinCompanySearch} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-lg bg-[#0A66C2] px-3 py-2 text-xs text-white hover:bg-[#004182]">
                      <Linkedin className="h-3.5 w-3.5" /> Open LinkedIn Search
                    </a>
                  )}
                  {crunchbaseSearch && (
                    <a href={crunchbaseSearch} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-600 hover:bg-gray-50">
                      <ExternalLink className="h-3.5 w-3.5" /> Open Crunchbase Search
                    </a>
                  )}
                </div>
                {primaryBuyerTitles && (
                  <div className="rounded-lg bg-gray-50 px-3 py-2">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Primary buyer titles</p>
                    <p className="text-xs text-gray-700">{primaryBuyerTitles}</p>
                  </div>
                )}
                {secondaryTitles && (
                  <div className="rounded-lg bg-gray-50 px-3 py-2">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Secondary titles</p>
                    <p className="text-xs text-gray-700">{secondaryTitles}</p>
                  </div>
                )}
                {triggerToMention && (
                  <div className="rounded-lg bg-amber-50 border border-amber-100 px-3 py-2">
                    <p className="text-[10px] text-amber-700 uppercase tracking-wider mb-1">Trigger to mention</p>
                    <p className="text-xs text-gray-700">{triggerToMention}</p>
                  </div>
                )}
              </>
            )}
            {(account.contactName || account.contactEmail) && accountPeople.length === 0 && !showResearchFallback && (
              <div className="flex items-center justify-between group">
                <div className="flex items-center gap-2.5">
                  <PersonAvatar name={account.contactName ?? null} company={account.company} size={32} />
                  <div>
                    <p className="text-sm text-gray-800">{account.contactName || 'Contact'}</p>
                    <p className="text-[11px] text-gray-400">{account.contactTitle || account.contactEmail || ''}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {account.contactEmail && (
                    <a href={`mailto:${account.contactEmail}`} className="flex h-6 w-6 items-center justify-center rounded text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                      <Mail className="h-3 w-3" />
                    </a>
                  )}
                  {account.linkedinUrl && (
                    <a href={account.linkedinUrl} target="_blank" rel="noopener noreferrer" className="flex h-6 w-6 items-center justify-center rounded text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                      <Linkedin className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>
            )}
            {accountPeople.map((person) => {
              const name = (person as { name?: string }).name ?? '';
              const title = (person as { title?: string }).title ?? '';
              const email = (person as { email?: string }).email ?? null;
              const linkedinUrl = (person as SidePanelPerson).linkedin_url ?? (person as { linkedin?: string }).linkedin ?? null;
              const avatarUrl = (person as SidePanelPerson).avatar_url ?? null;
              const phone = (person as { phone?: string }).phone;
              return (
                <div key={person.id} className="flex items-center justify-between group">
                  <div className="flex items-center gap-2.5">
                    <PersonAvatar
                      name={name || null}
                      avatar_url={avatarUrl}
                      company={account.company}
                      size={32}
                      personId={isApiPeople ? person.id : undefined}
                      onAvatarChange={isApiPeople && onAvatarChange ? (url) => onAvatarChange(person.id, url) : undefined}
                    />
                    <div>
                      <p className="text-sm text-gray-800">{name || 'Contact'}</p>
                      <p className="text-[11px] text-gray-400">{title || email || ''}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {email && (
                      <a href={`mailto:${email}`} className="flex h-6 w-6 items-center justify-center rounded text-gray-400 hover:bg-gray-100 hover:text-gray-600" title="Email">
                        <Mail className="h-3 w-3" />
                      </a>
                    )}
                    {phone && !isApiPeople && (
                      <button className="flex h-6 w-6 items-center justify-center rounded text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                        <Phone className="h-3 w-3" />
                      </button>
                    )}
                    {linkedinUrl && (
                      <a href={linkedinUrl.startsWith('http') ? linkedinUrl : `https://${linkedinUrl}`} target="_blank" rel="noopener noreferrer" className="flex h-6 w-6 items-center justify-center rounded text-gray-400 hover:bg-gray-100 hover:text-gray-600" title="LinkedIn">
                        <Linkedin className="h-3 w-3" />
                      </a>
                    )}
                    <button
                      onClick={() => router.push(`/videos/create?person=${person.id}`)}
                      className="flex h-6 w-6 items-center justify-center rounded text-gray-400 hover:bg-blue-50 hover:text-[#2563EB]"
                      title={`Send video to ${name}`}
                    >
                      <Video className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              );
            })}
            {accountPeople.length === 0 && !account.contactName && !account.contactEmail && !showResearchFallback && (
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
        <div ref={nextActionsRef} className="px-5 py-4">
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
