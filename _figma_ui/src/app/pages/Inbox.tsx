import { useState } from 'react';
import { useNavigate } from 'react-router';
import { GlassCard } from '../components/GlassCard';
import { StatusChip } from '../components/StatusChip';
import type { EmailThread } from '../data/mockData';
import { emailThreads, people } from '../data/mockData';
import {
  Inbox as InboxIcon, MailWarning, Clock, Search,
  Bot, Sparkles, Send, Paperclip, ChevronDown,
  Reply, Forward, Archive, MoreHorizontal, Star,
  ThumbsUp, Timer, UserX, CornerUpRight, XCircle,
  CheckSquare, Video,
} from 'lucide-react';
import type { EmailThread } from '../data/mockData';
import { toast } from 'sonner';

const folders = [
  { id: 'all', label: 'All Mail', icon: InboxIcon, count: 5 },
  { id: 'unreplied', label: 'Unreplied', icon: MailWarning, count: 2 },
  { id: 'followup', label: 'Needs Follow-up', icon: Clock, count: 1 },
];

const labelVariant: Record<string, 'accent' | 'success' | 'warning' | 'info' | 'purple'> = {
  'Hot': 'accent',
  'AI suggested reply': 'info',
  'Waiting': 'warning',
  'Needs follow-up': 'purple',
};

// Classification chips config
const classificationChips = [
  { id: 'interested', label: 'Interested', icon: ThumbsUp, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { id: 'not_now', label: 'Not now', icon: Timer, color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { id: 'not_me', label: 'Not me', icon: UserX, color: 'bg-red-50 text-red-700 border-red-200' },
  { id: 'forwarded', label: 'Forwarded', icon: CornerUpRight, color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { id: 'unsubscribe', label: 'Unsubscribe', icon: XCircle, color: 'bg-gray-100 text-gray-600 border-gray-200' },
];

export function Inbox({ threads: propThreads, loading: propLoading }: { threads?: EmailThread[]; loading?: boolean } = {}) {
  const navigate = useNavigate();
  const [activeFolder, setActiveFolder] = useState('all');
  const [selectedThread, setSelectedThread] = useState<EmailThread | null>(emailThreads[0]);
  const [replyText, setReplyText] = useState('');
  const [search, setSearch] = useState('');
  const [showAISummary, setShowAISummary] = useState(true);
  const [threadClassifications, setThreadClassifications] = useState<Record<string, string>>({});

  const allThreads = propThreads && propThreads.length > 0 ? propThreads : emailThreads;
  const filteredThreads = allThreads.filter(t => {
    if (search && !t.subject.toLowerCase().includes(search.toLowerCase()) && !t.from.toLowerCase().includes(search.toLowerCase())) return false;
    if (activeFolder === 'unreplied') return t.messages.length === 1 && t.messages[0].isOutbound;
    if (activeFolder === 'followup') return t.labels.includes('Needs follow-up');
    return true;
  });

  const handleClassify = (chipId: string) => {
    if (!selectedThread) return;
    const wasClassified = threadClassifications[selectedThread.id] === chipId;
    const chip = classificationChips.find(c => c.id === chipId);
    const contactName = selectedThread.from === 'You' ? selectedThread.to : selectedThread.from;

    setThreadClassifications(prev => ({
      ...prev,
      [selectedThread.id]: wasClassified ? '' : chipId,
    }));

    if (wasClassified) {
      toast('Classification removed', {
        description: `${contactName} — ${selectedThread.subject}`,
      });
    } else if (chip) {
      toast.success(`Classified as "${chip.label}"`, {
        description: `${contactName} — ${selectedThread.subject}`,
        action: {
          label: 'Undo',
          onClick: () => {
            setThreadClassifications(prev => ({
              ...prev,
              [selectedThread.id]: '',
            }));
          },
        },
      });
    }
  };

  return (
    <div className="flex h-full overflow-hidden">
      {/* Sidebar folders */}
      <div className="w-[200px] shrink-0 border-r border-gray-200 bg-white p-3 space-y-0.5 hidden md:block">
        <div className="mb-3 px-2">
          <p className="text-xs text-gray-400 uppercase tracking-wider">Folders</p>
        </div>
        {folders.map((folder) => (
          <button
            key={folder.id}
            onClick={() => setActiveFolder(folder.id)}
            className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition-all ${
              activeFolder === folder.id
                ? 'bg-[#FFD600] text-gray-900'
                : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            <folder.icon className="h-4 w-4 shrink-0" />
            <span className="flex-1 text-left">{folder.label}</span>
            <span className="text-[11px] text-gray-400">{folder.count}</span>
          </button>
        ))}

        <div className="mt-6 px-2">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Templates</p>
          {['Cold Intro', 'Follow-up', 'Case Study', 'Meeting Request'].map(tpl => (
            <button key={tpl} className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors">
              <Send className="h-3 w-3" />{tpl}
            </button>
          ))}
        </div>
      </div>

      {/* Thread list */}
      <div className="w-[340px] shrink-0 border-r border-gray-200 overflow-hidden flex flex-col">
        <div className="p-3 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search inbox..."
              className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:border-[#2563EB] transition-colors"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filteredThreads.map((thread) => (
            <button
              key={thread.id}
              onClick={() => { setSelectedThread(thread); setShowAISummary(true); }}
              className={`flex w-full items-start gap-3 border-b border-gray-100 px-4 py-3.5 text-left transition-colors ${
                selectedThread?.id === thread.id ? 'bg-blue-50/60' : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs text-blue-600 mt-0.5" style={{ fontWeight: 500 }}>
                {thread.from === 'You' ? thread.to.split(' ').map(n => n[0]).join('').slice(0, 2) : thread.from.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className={`text-sm truncate ${thread.unread ? 'text-gray-900' : 'text-gray-600'}`} style={thread.unread ? { fontWeight: 500 } : {}}>
                    {thread.from === 'You' ? thread.to : thread.from}
                  </p>
                  <span className="text-[11px] text-gray-400 shrink-0">{thread.date}</span>
                </div>
                <p className="text-xs text-gray-500 truncate mt-0.5">{thread.subject}</p>
                <p className="text-[11px] text-gray-400 truncate mt-0.5">{thread.preview}</p>
                <div className="flex items-center gap-1.5 mt-1.5">
                  {thread.labels.map(label => (
                    <StatusChip key={label} label={label} variant={labelVariant[label] || 'default'} />
                  ))}
                  {threadClassifications[thread.id] && (
                    <StatusChip
                      label={classificationChips.find(c => c.id === threadClassifications[thread.id])?.label || ''}
                      variant="success"
                    />
                  )}
                </div>
              </div>
              {thread.unread && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#2563EB]" />}
            </button>
          ))}
        </div>
      </div>

      {/* Thread view */}
      <div className="flex-1 overflow-hidden flex flex-col bg-gray-50/30">
        {selectedThread ? (
          <>
            {/* Thread header */}
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-3 bg-white">
              <div className="min-w-0">
                <h3 className="text-gray-800 truncate">{selectedThread.subject}</h3>
                <p className="text-xs text-gray-400 mt-0.5">{selectedThread.messages.length} messages</p>
              </div>
              <div className="flex items-center gap-1.5">
                <button className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
                  <Star className="h-4 w-4" />
                </button>
                <button className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
                  <Archive className="h-4 w-4" />
                </button>
                <button className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Classification chips */}
            <div className="flex items-center gap-2 px-5 py-2.5 bg-white border-b border-gray-100">
              <span className="text-[11px] text-gray-400 shrink-0">Classify:</span>
              {classificationChips.map(chip => (
                <button
                  key={chip.id}
                  onClick={() => handleClassify(chip.id)}
                  className={`flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] transition-all ${
                    threadClassifications[selectedThread.id] === chip.id
                      ? chip.color + ' shadow-sm'
                      : 'border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-600'
                  }`}
                >
                  <chip.icon className="h-3 w-3" />
                  {chip.label}
                </button>
              ))}
            </div>

            {/* AI Summary */}
            {showAISummary && (
              <div className="mx-5 mt-4 rounded-xl border border-blue-200 bg-blue-50 p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <Bot className="h-3.5 w-3.5 text-blue-600" />
                    <span className="text-xs text-blue-600" style={{ fontWeight: 500 }}>AI Summary</span>
                  </div>
                  <button onClick={() => setShowAISummary(false)} className="text-[11px] text-gray-400 hover:text-gray-600">Dismiss</button>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {selectedThread.messages.length > 1
                    ? `The prospect showed strong interest and wants to move forward. Key signals: positive response, requested more info. Recommended next step: ${selectedThread.messages[selectedThread.messages.length - 1].isOutbound ? 'Wait for reply' : 'Schedule a follow-up call'}.`
                    : 'Initial outreach sent. No response yet. Consider a follow-up in 2-3 days with a different angle or value prop.'}
                </p>
                <div className="flex gap-2 mt-2.5">
                  <button className="flex items-center gap-1 rounded-lg bg-blue-100 px-2.5 py-1 text-xs text-blue-700 hover:bg-blue-200 transition-colors">
                    <Sparkles className="h-3 w-3" />Generate Reply
                  </button>
                  <button className="flex items-center gap-1 rounded-lg bg-gray-100 px-2.5 py-1 text-xs text-gray-500 hover:bg-gray-200 transition-colors">
                    <CheckSquare className="h-3 w-3" />Create Task
                  </button>
                </div>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {selectedThread.messages.map((msg) => (
                <div key={msg.id} className={`rounded-xl border p-4 ${
                  msg.isOutbound
                    ? 'border-gray-200 bg-white ml-8'
                    : 'border-blue-200 bg-blue-50/50 mr-8'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] ${
                        msg.isOutbound ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                      }`} style={{ fontWeight: 500 }}>
                        {msg.isOutbound ? 'AK' : msg.from.split('@')[0].slice(0, 2).toUpperCase()}
                      </div>
                      <span className="text-xs text-gray-500">{msg.isOutbound ? 'You' : msg.from}</span>
                    </div>
                    <span className="text-[11px] text-gray-400">{msg.date}</span>
                  </div>
                  <div className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">{msg.body}</div>
                  <div className="flex items-center gap-2 mt-3">
                    <button className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-gray-600 transition-colors">
                      <Reply className="h-3 w-3" />Reply
                    </button>
                    <button className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-gray-600 transition-colors">
                      <Forward className="h-3 w-3" />Forward
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Reply composer */}
            <div className="border-t border-gray-200 p-4 bg-white">
              <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
                <div className="flex items-center gap-2 border-b border-gray-100 px-3 py-2">
                  <span className="text-xs text-gray-400">To:</span>
                  <span className="text-xs text-gray-600">{selectedThread.messages[0].isOutbound ? selectedThread.messages[0].to : selectedThread.messages[0].from}</span>
                </div>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Write your reply..."
                  rows={3}
                  className="w-full bg-transparent px-3 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 outline-none resize-none"
                />
                <div className="flex items-center justify-between px-3 py-2 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <button className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
                      <Paperclip className="h-3.5 w-3.5" />
                    </button>
                    <button className="flex items-center gap-1 rounded-lg bg-blue-50 px-2 py-1 text-[11px] text-blue-600 hover:bg-blue-100 transition-colors">
                      <Sparkles className="h-3 w-3" />AI Draft
                    </button>
                    <button
                      onClick={() => {
                        const person = selectedThread?.personId
                          ? people.find(p => p.id === selectedThread.personId)
                          : null;
                        if (person) {
                          toast.success(`Creating video for ${person.name}`, { description: `${person.title} at ${person.company}` });
                          navigate(`/videos/create?person=${person.id}`);
                        } else {
                          toast.success('Opening video creator');
                          navigate('/videos/create');
                        }
                      }}
                      className="flex items-center gap-1 rounded-lg bg-amber-50 px-2 py-1 text-[11px] text-amber-700 hover:bg-amber-100 transition-colors"
                      title="Send personalized video (V)"
                    >
                      <Video className="h-3 w-3" />Send Video
                    </button>
                    <select className="rounded-lg bg-gray-50 px-2 py-1 text-[11px] text-gray-500 border border-gray-200 outline-none">
                      <option>Professional</option>
                      <option>Casual</option>
                      <option>Direct</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-500 hover:bg-gray-50 transition-colors">
                      <Clock className="h-3 w-3" />Schedule
                      <ChevronDown className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => {
                        const recipient = selectedThread.messages[0].isOutbound ? selectedThread.messages[0].to : selectedThread.messages[0].from;
                        toast.success(`Email sent to ${recipient}`, { description: selectedThread.subject });
                        setReplyText('');
                      }}
                      className="flex items-center gap-1.5 rounded-lg bg-[#2563EB] px-3.5 py-1.5 text-xs text-white hover:bg-[#1D4ED8] transition-colors"
                    >
                      <Send className="h-3 w-3" />Send
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <InboxIcon className="h-10 w-10 text-gray-200 mx-auto mb-3" />
              <p className="text-sm text-gray-400">Select a thread to view</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}