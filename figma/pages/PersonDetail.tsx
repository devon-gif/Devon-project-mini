"use client";

import { useParams, useNavigate } from 'react-router';
import { GlassCard } from '../components/GlassCard';
import { StatusChip } from '../components/StatusChip';
import { people, emailThreads, tasks } from '../data/mockData';
import {
  ArrowLeft, Mail, Phone, Linkedin, Building2, Copy,
  Sparkles, Bot, CheckSquare, Calendar, MessageSquare,
  Send, ChevronRight, Lightbulb, Plus, Clock, Video,
} from 'lucide-react';
import { useState } from 'react';

export function PersonDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showAI, setShowAI] = useState(true);

  const person = people.find(p => p.id === id);
  if (!person) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-gray-400">Person not found</p>
      </div>
    );
  }

  const personEmails = emailThreads.filter(t => t.personId === id);
  const personTasks = tasks.filter(t => t.linkedPerson === person.name);

  return (
    <div className="h-full overflow-hidden flex">
      {/* Main content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        <button onClick={() => navigate('/people')} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to People
        </button>

        {/* Header */}
        <GlassCard className="p-5">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 to-amber-100 text-lg text-gray-700" style={{ fontWeight: 600 }}>
                {person.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <h1 className="text-gray-900">{person.name}</h1>
                <p className="text-sm text-gray-500 mt-0.5">{person.title} at {person.company}</p>
                <div className="flex items-center gap-3 mt-2.5">
                  <StatusChip label={person.seniority} variant={person.seniority === 'C-Suite' ? 'accent' : 'info'} />
                  <StatusChip label={person.replyStatus} variant={person.replyStatus === 'Replied' ? 'success' : person.replyStatus === 'Opened' ? 'warning' : 'default'} />
                  <StatusChip label={person.emailStatus} variant={person.emailStatus === 'verified' ? 'success' : 'warning'} />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                <Phone className="h-3.5 w-3.5" />
                Call
              </button>
              <button
                onClick={() => navigate('/videos/create')}
                className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <Video className="h-3.5 w-3.5" />
                Send Video
              </button>
              <button className="flex items-center gap-1.5 rounded-xl bg-[#2563EB] px-3.5 py-2 text-sm text-white hover:bg-[#1D4ED8] transition-colors">
                <Mail className="h-3.5 w-3.5" />
                Email
              </button>
            </div>
          </div>
        </GlassCard>

        {/* Contact info */}
        <GlassCard className="p-5">
          <h3 className="text-gray-800 mb-3">Contact Info</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50/50 px-3 py-2.5">
              <Mail className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-700 flex-1">{person.email}</span>
              <button className="text-gray-300 hover:text-gray-500"><Copy className="h-3.5 w-3.5" /></button>
            </div>
            {person.phone && (
              <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50/50 px-3 py-2.5">
                <Phone className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-700 flex-1">{person.phone}</span>
                <button className="text-gray-300 hover:text-gray-500"><Copy className="h-3.5 w-3.5" /></button>
              </div>
            )}
            {person.linkedin && (
              <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50/50 px-3 py-2.5">
                <Linkedin className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-700 flex-1">{person.linkedin}</span>
              </div>
            )}
            <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50/50 px-3 py-2.5">
              <Building2 className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-700 flex-1 cursor-pointer hover:text-[#2563EB]" onClick={() => navigate(`/accounts/${person.accountId}`)}>{person.company}</span>
              <ChevronRight className="h-3.5 w-3.5 text-gray-300" />
            </div>
          </div>
        </GlassCard>

        {/* Personalization Notes */}
        <GlassCard className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-[#FFD600]" />
              <h3 className="text-gray-800">Personalization Notes</h3>
            </div>
            <button className="flex items-center gap-1 text-xs text-[#2563EB]">
              <Plus className="h-3 w-3" />Add
            </button>
          </div>
          <ul className="space-y-2">
            {person.personalizationNotes.map((note, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#2563EB] shrink-0" />
                {note}
              </li>
            ))}
          </ul>
        </GlassCard>

        {/* Email threads */}
        <GlassCard className="p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-gray-800">Email Threads ({personEmails.length})</h3>
            <button className="flex items-center gap-1.5 rounded-lg bg-blue-50 px-2.5 py-1 text-xs text-blue-600">
              <Send className="h-3 w-3" />New Email
            </button>
          </div>
          {personEmails.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">No emails yet</p>
          ) : (
            <div className="space-y-2.5">
              {personEmails.map((thread) => (
                <div key={thread.id} onClick={() => navigate('/inbox')} className="flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50/50 p-3 cursor-pointer hover:bg-gray-100/60 transition-colors">
                  <MessageSquare className="h-4 w-4 text-gray-300 mt-0.5 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-gray-700 truncate">{thread.subject}</p>
                    <p className="text-xs text-gray-400 mt-0.5 truncate">{thread.preview}</p>
                  </div>
                  <span className="text-[11px] text-gray-400 shrink-0">{thread.date}</span>
                </div>
              ))}
            </div>
          )}
        </GlassCard>

        {/* Tasks */}
        <GlassCard className="p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-gray-800">Tasks & Reminders ({personTasks.length})</h3>
            <button className="flex items-center gap-1 text-xs text-[#2563EB]"><Plus className="h-3 w-3" />Add Task</button>
          </div>
          <div className="space-y-2">
            {personTasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50/50 p-3">
                <div className="flex items-center gap-3">
                  <CheckSquare className={`h-4 w-4 ${task.status === 'done' ? 'text-emerald-500' : 'text-gray-300'}`} />
                  <span className={`text-sm ${task.status === 'done' ? 'text-gray-400 line-through' : 'text-gray-700'}`}>{task.title}</span>
                </div>
                <span className="flex items-center gap-1 text-xs text-gray-400">
                  <Calendar className="h-3 w-3" />{task.dueDate}
                </span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* AI Panel (right rail) */}
      {showAI && (
        <div className="hidden lg:block w-[340px] border-l border-gray-200 bg-gray-50/50 overflow-y-auto">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#2563EB] to-[#FFD600]">
                  <Bot className="h-3.5 w-3.5 text-white" />
                </div>
                <span className="text-sm text-gray-800" style={{ fontWeight: 500 }}>AI Assistant</span>
              </div>
              <button onClick={() => setShowAI(false)} className="text-xs text-gray-400 hover:text-gray-600">Hide</button>
            </div>
          </div>

          <div className="p-4 space-y-4">
            {/* Suggested opener */}
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-3">
              <div className="flex items-center gap-1.5 mb-2">
                <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                <span className="text-xs text-blue-600" style={{ fontWeight: 500 }}>Suggested Opener</span>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                "Hi {person.name.split(' ')[0]}, {person.personalizationNotes[0]?.toLowerCase() || 'I came across your profile'} — would love to chat about how Twill could help {person.company} scale hiring."
              </p>
              <div className="flex gap-2 mt-3">
                <button className="flex-1 rounded-lg bg-blue-100 py-1.5 text-xs text-blue-700 hover:bg-blue-200 transition-colors">Use This</button>
                <button className="flex-1 rounded-lg bg-gray-100 py-1.5 text-xs text-gray-500 hover:bg-gray-200 transition-colors">Edit</button>
              </div>
            </div>

            {/* Personalization bullets */}
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <Lightbulb className="h-3.5 w-3.5 text-[#FFD600]" />
                <span className="text-xs text-gray-500" style={{ fontWeight: 500 }}>Key Intel</span>
              </div>
              <div className="space-y-1.5">
                {person.personalizationNotes.map((note, i) => (
                  <div key={i} className="rounded-lg border border-gray-200 bg-white px-3 py-2">
                    <p className="text-xs text-gray-600">{note}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Next best action */}
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
              <div className="flex items-center gap-1.5 mb-2">
                <Clock className="h-3.5 w-3.5 text-amber-600" />
                <span className="text-xs text-amber-600" style={{ fontWeight: 500 }}>Recommended Action</span>
              </div>
              <p className="text-sm text-gray-600">{person.nextTask}</p>
              <button className="mt-2 w-full rounded-lg bg-amber-100 py-1.5 text-xs text-amber-700 hover:bg-amber-200 transition-colors">
                Create Task
              </button>
            </div>

            {/* Quick actions */}
            <div className="space-y-1.5">
              <p className="text-xs text-gray-400 mb-2">Quick Actions</p>
              {[
                { label: 'Draft outreach email', icon: Mail },
                { label: 'Summarize thread', icon: MessageSquare },
                { label: 'Find warm intro path', icon: Sparkles },
                { label: 'Add to sequence', icon: Send },
                { label: 'Schedule video call', icon: Video },
              ].map((action) => (
                <button key={action.label} className="flex w-full items-center gap-2.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-600 hover:bg-gray-50 hover:text-gray-800 transition-colors">
                  <action.icon className="h-3.5 w-3.5 text-[#2563EB]" />
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}