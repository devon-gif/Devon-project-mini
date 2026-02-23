"use client";

import { useState } from 'react';
import { GlassCard } from '../components/GlassCard';
import { StatusChip } from '../components/StatusChip';
import { sequences } from '../data/mockData';
import type { Sequence, SequenceStep } from '../data/mockData';
import {
  Plus, Mail, Linkedin, Phone, CheckSquare, ChevronRight,
  Play, Pause, BarChart3, Users, ArrowRight, Zap,
  AlertTriangle, Sparkles, Eye, MousePointerClick, Video,
} from 'lucide-react';

const stepTypeIcon: Record<string, typeof Mail> = {
  email: Mail,
  linkedin: Linkedin,
  call: Phone,
  task: CheckSquare,
  video: Video,
};

const stepTypeColor: Record<string, string> = {
  email: '#2563EB',
  linkedin: '#0A66C2',
  call: '#F59E0B',
  task: '#10B981',
  video: '#8B5CF6',
};

export function Sequences() {
  const [selectedSequence, setSelectedSequence] = useState<Sequence | null>(null);

  return (
    <div className="flex h-full overflow-hidden">
      {/* Sequence list */}
      <div className={`${selectedSequence ? 'w-[340px] border-r border-gray-200' : 'flex-1'} shrink-0 overflow-y-auto p-5 space-y-4`}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-gray-900">Sequences</h1>
            <p className="text-sm text-gray-500 mt-0.5">{sequences.length} sequences</p>
          </div>
          <button className="flex items-center gap-1.5 rounded-xl bg-[#2563EB] px-4 py-2.5 text-sm text-white hover:bg-[#1D4ED8] transition-all">
            <Plus className="h-4 w-4" />
            New Sequence
          </button>
        </div>

        {sequences.map((seq) => (
          <GlassCard
            key={seq.id}
            className="p-4"
            hover
            onClick={() => setSelectedSequence(seq)}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                  <Zap className="h-5 w-5 text-[#2563EB]" />
                </div>
                <div>
                  <p className="text-sm text-gray-800">{seq.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <StatusChip
                      label={seq.status}
                      variant={seq.status === 'active' ? 'success' : seq.status === 'paused' ? 'warning' : 'default'}
                    />
                    <span className="text-xs text-gray-400">{seq.steps.length} steps</span>
                  </div>
                </div>
              </div>
              <button className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${
                seq.status === 'active' ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
              }`}>
                {seq.status === 'active' ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
              </button>
            </div>

            {/* Step preview */}
            <div className="flex items-center gap-1.5 mb-3">
              {seq.steps.map((step, i) => {
                const Icon = stepTypeIcon[step.type];
                return (
                  <div key={step.id} className="flex items-center gap-1.5">
                    <div
                      className="flex h-7 w-7 items-center justify-center rounded-lg"
                      style={{ backgroundColor: `${stepTypeColor[step.type]}15`, color: stepTypeColor[step.type] }}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    {i < seq.steps.length - 1 && (
                      <div className="h-px w-3 bg-gray-200" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-3 pt-3 border-t border-gray-100">
              {[
                { label: 'Enrolled', value: seq.enrolled, icon: Users },
                { label: 'Replied', value: seq.replied, icon: Mail },
                { label: 'Open %', value: `${seq.openRate}%`, icon: Eye },
                { label: 'Reply %', value: `${seq.replyRate}%`, icon: MousePointerClick },
              ].map(stat => (
                <div key={stat.label} className="text-center">
                  <p className="text-sm text-gray-800" style={{ fontWeight: 500 }}>{stat.value}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Sequence detail */}
      {selectedSequence && (
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-gray-900">{selectedSequence.name}</h2>
              <p className="text-sm text-gray-500 mt-0.5">{selectedSequence.steps.length} steps · {selectedSequence.enrolled} enrolled</p>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                <BarChart3 className="h-3.5 w-3.5" />
                Analytics
              </button>
              <button className="flex items-center gap-1.5 rounded-xl bg-[#2563EB] px-3 py-2 text-sm text-white hover:bg-[#1D4ED8] transition-colors">
                <Users className="h-3.5 w-3.5" />
                Enroll People
              </button>
            </div>
          </div>

          {/* Visual timeline */}
          <div className="space-y-0">
            {selectedSequence.steps.map((step, i) => (
              <div key={step.id} className="flex gap-4">
                {/* Timeline connector */}
                <div className="flex flex-col items-center w-8">
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-full border-2 shrink-0"
                    style={{ borderColor: stepTypeColor[step.type], backgroundColor: `${stepTypeColor[step.type]}15` }}
                  >
                    {(() => { const Icon = stepTypeIcon[step.type]; return <Icon className="h-3.5 w-3.5" style={{ color: stepTypeColor[step.type] }} />; })()}
                  </div>
                  {i < selectedSequence.steps.length - 1 && (
                    <div className="w-0.5 flex-1 min-h-[40px] bg-gray-200" />
                  )}
                </div>

                {/* Step card */}
                <GlassCard className="p-4 flex-1 mb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">Step {step.order}</span>
                        <StatusChip label={step.type} variant={step.type === 'email' ? 'info' : step.type === 'linkedin' ? 'info' : step.type === 'call' ? 'accent' : 'success'} />
                        {step.delay > 0 && (
                          <span className="text-xs text-gray-400">+{step.delay} days</span>
                        )}
                      </div>
                      {step.subject && <p className="text-sm text-gray-700 mt-1.5">{step.subject}</p>}
                      {step.body && <p className="text-xs text-gray-500 mt-1">{step.body}</p>}
                    </div>
                    <button className="text-gray-300 hover:text-gray-500 transition-colors">
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                  {step.type === 'email' && (
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                      <button className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors">
                        <Plus className="h-3 w-3" />A/B Variant
                      </button>
                      <span className="text-gray-200">·</span>
                      <button className="flex items-center gap-1 text-xs text-[#2563EB] hover:text-[#1D4ED8] transition-colors">
                        <Sparkles className="h-3 w-3" />AI Optimize
                      </button>
                    </div>
                  )}
                  {step.type === 'video' && (
                    <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
                      <div className="flex items-center gap-2">
                        <button className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors">
                          <Plus className="h-3 w-3" />A/B GIF Style
                        </button>
                        <span className="text-gray-200">·</span>
                        <button className="flex items-center gap-1 text-xs text-[#2563EB] hover:text-[#1D4ED8] transition-colors">
                          <Sparkles className="h-3 w-3" />AI Script
                        </button>
                      </div>
                      <div className="flex gap-2">
                        <div className="flex-1 rounded-lg border border-purple-200 bg-purple-50 px-2 py-1.5 text-[10px] text-purple-700 text-center">
                          A: Website scroll GIF
                        </div>
                        <div className="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-2 py-1.5 text-[10px] text-gray-500 text-center">
                          B: Logo + lower-third
                        </div>
                      </div>
                    </div>
                  )}
                </GlassCard>
              </div>
            ))}

            {/* Add step */}
            <div className="flex gap-4">
              <div className="flex w-8 justify-center">
                <button className="flex h-8 w-8 items-center justify-center rounded-full border border-dashed border-gray-300 text-gray-400 hover:border-[#2563EB] hover:text-[#2563EB] transition-colors">
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <p className="text-sm text-gray-400 py-1.5">Add step</p>
            </div>
          </div>

          {/* Rules */}
          <GlassCard className="p-4">
            <h3 className="text-gray-700 mb-3">Rules</h3>
            <div className="space-y-2">
              {[
                { label: 'Stop on reply', enabled: true },
                { label: 'Pause on bounce', enabled: true },
                { label: 'Auto-create follow-up task', enabled: true },
              ].map(rule => (
                <div key={rule.label} className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50/50 px-3 py-2.5">
                  <span className="text-sm text-gray-600">{rule.label}</span>
                  <div className={`relative h-5 w-9 rounded-full transition-colors ${rule.enabled ? 'bg-[#2563EB]' : 'bg-gray-300'}`}>
                    <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${rule.enabled ? 'left-[18px]' : 'left-0.5'}`} />
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Video rules (shown when sequence contains video steps) */}
          {selectedSequence.steps.some(s => s.type === 'video') && (
            <GlassCard className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Video className="h-4 w-4 text-purple-500" />
                <h3 className="text-gray-700">Video Step Rules</h3>
              </div>
              <div className="space-y-2">
                {[
                  { label: 'If watched >50% → create high-priority task', enabled: true },
                  { label: 'If clicked but not booked → follow up in 2 days', enabled: true },
                  { label: 'If no click → send plain-text bump', enabled: false },
                ].map(rule => (
                  <div key={rule.label} className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50/50 px-3 py-2.5">
                    <span className="text-sm text-gray-600">{rule.label}</span>
                    <div className={`relative h-5 w-9 rounded-full transition-colors ${rule.enabled ? 'bg-purple-500' : 'bg-gray-300'}`}>
                      <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${rule.enabled ? 'left-[18px]' : 'left-0.5'}`} />
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}

          {/* Spam check hint */}
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm text-emerald-700" style={{ fontWeight: 500 }}>Spam Check</p>
                <p className="text-xs text-gray-500 mt-0.5">All clear — no spam trigger words detected. Personalization tokens are properly set.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}