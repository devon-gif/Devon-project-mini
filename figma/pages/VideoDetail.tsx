"use client";

import { useParams, useNavigate } from 'react-router';
import { GlassCard } from '../components/GlassCard';
import { VideoStatusChip } from '../components/VideoStatusChip';
import { CopyButton } from '../components/CopyButton';
import { EmailSnippetPanel } from '../components/EmailSnippetPanel';
import { videoOutreaches } from '../data/videoData';
import type { VideoEvent } from '../data/videoData';
import {
  ArrowLeft, Play, Eye, MousePointerClick, CalendarCheck,
  TrendingUp, Clock, Send, Mail, Globe, Video,
  Sparkles, Bot, CheckSquare, ChevronRight,
  ExternalLink, Copy, Calendar, Linkedin,
  ArrowUpRight, Zap, MessageSquare, Undo2, StickyNote,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

const eventConfig: Record<string, { label: string; icon: typeof Send; color: string; bg: string }> = {
  delivered: { label: 'Email Delivered', icon: Send, color: '#6B7280', bg: '#F3F4F6' },
  opened: { label: 'Email Opened', icon: Mail, color: '#2563EB', bg: '#DBEAFE' },
  gif_clicked: { label: 'GIF Clicked', icon: MousePointerClick, color: '#F59E0B', bg: '#FEF3C7' },
  page_viewed: { label: 'Landing Page Viewed', icon: Globe, color: '#8B5CF6', bg: '#EDE9FE' },
  video_watched_25: { label: 'Video Watched 25%', icon: Play, color: '#EF4444', bg: '#FEE2E2' },
  video_watched_50: { label: 'Video Watched 50%', icon: Play, color: '#F59E0B', bg: '#FEF3C7' },
  video_watched_75: { label: 'Video Watched 75%', icon: Play, color: '#2563EB', bg: '#DBEAFE' },
  video_watched_100: { label: 'Video Watched 100%', icon: Play, color: '#10B981', bg: '#D1FAE5' },
  cta_clicked: { label: 'CTA Clicked', icon: ArrowUpRight, color: '#EC4899', bg: '#FCE7F3' },
  meeting_booked: { label: 'Meeting Booked', icon: CalendarCheck, color: '#10B981', bg: '#D1FAE5' },
};

export function VideoDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [markedSent, setMarkedSent] = useState(false);
  const [note, setNote] = useState('');
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [showSnippet, setShowSnippet] = useState(false);

  const video = videoOutreaches.find((v) => v.id === id);

  if (!video) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-gray-400">Video not found</p>
      </div>
    );
  }

  const isSent = markedSent || ['sent', 'viewed', 'clicked', 'booked'].includes(video.status);
  const landingUrl = `https://watch.withtwill.com/${video.landingPageSlug || 'demo'}`;

  const handleMarkSent = () => {
    setMarkedSent(true);
    toast.success('Marked as sent');
  };

  const handleUndoSent = () => {
    setMarkedSent(false);
    toast.success('Undo: marked as unsent');
  };

  // AI next action logic
  const getAiNextAction = () => {
    if (video.status === 'clicked' && video.analytics.bookings === 0) {
      return {
        message: "They clicked but didn't book — send follow-up",
        actions: ['Draft follow-up', 'Create task'],
      };
    }
    if (video.status === 'viewed' && video.analytics.clicks === 0) {
      return {
        message: `Watched ${video.analytics.avgWatchPercent}% but didn't click CTA — try a nudge email`,
        actions: ['Draft nudge', 'Create task'],
      };
    }
    if (video.status === 'sent' && video.analytics.views === 0) {
      return {
        message: 'No views yet — wait 24h then bump the email',
        actions: ['Schedule bump', 'Create task'],
      };
    }
    if (video.status === 'booked') {
      return {
        message: 'Meeting booked! Prepare your demo deck.',
        actions: ['Create prep task'],
      };
    }
    return null;
  };

  const aiAction = getAiNextAction();

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/videos')}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-gray-900">{video.name}</h1>
              <VideoStatusChip status={isSent && video.status === 'ready' ? 'sent' : video.status} size="md" />
            </div>
            <p className="text-sm text-gray-500 mt-0.5">
              {video.recipientName} &middot; {video.recipientTitle} at {video.company}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <CopyButton text={landingUrl} variant="default" label="Copy Link" toastMessage="Landing link copied" />
          <button
            onClick={() => setShowSnippet(!showSnippet)}
            className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <Mail className="h-3.5 w-3.5" />
            Email Snippet
          </button>
          <button
            onClick={() => toast.success('Follow-up drafted')}
            className="flex items-center gap-1.5 rounded-xl bg-[#2563EB] px-3 py-2 text-sm text-white hover:bg-[#1D4ED8] transition-colors"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            Follow Up
          </button>
        </div>
      </div>

      {/* Email Snippet (expandable) */}
      {showSnippet && (
        <EmailSnippetPanel
          recipientName={video.recipientName}
          company={video.company}
          subjectLine={video.subjectLine || `Quick idea for ${video.company}`}
          landingPageSlug={video.landingPageSlug}
          ctaLabel={video.ctaLabel}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-5">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Views', value: video.analytics.views, icon: Eye, color: '#8B5CF6' },
              { label: 'Clicks', value: video.analytics.clicks, icon: MousePointerClick, color: '#F59E0B' },
              { label: 'Bookings', value: video.analytics.bookings, icon: CalendarCheck, color: '#10B981' },
              {
                label: 'Avg Watch %',
                value: `${video.analytics.avgWatchPercent}%`,
                icon: TrendingUp,
                color: '#2563EB',
                v2: true,
              },
            ].map((kpi) => (
              <GlassCard key={kpi.label} className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-lg"
                    style={{ backgroundColor: `${kpi.color}12` }}
                  >
                    <kpi.icon className="h-4 w-4" style={{ color: kpi.color }} />
                  </div>
                  {kpi.v2 && (
                    <span className="text-[9px] text-gray-300 bg-gray-100 rounded px-1 py-0.5">V2</span>
                  )}
                </div>
                <p className="text-xl text-gray-900" style={{ fontWeight: 600 }}>
                  {kpi.value}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{kpi.label}</p>
              </GlassCard>
            ))}
          </div>

          {/* Watch progress bar */}
          <GlassCard className="p-5">
            <h3 className="text-gray-800 mb-3">Video Watch Progress</h3>
            <div className="space-y-3">
              {[25, 50, 75, 100].map((pct) => {
                const eventExists = video.analytics.events.some((e) => e.type === `video_watched_${pct}`);
                return (
                  <div key={pct} className="flex items-center gap-3">
                    <span className="text-xs text-gray-500 w-8">{pct}%</span>
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: eventExists ? '100%' : '0%',
                          backgroundColor:
                            pct <= 25 ? '#EF4444' : pct <= 50 ? '#F59E0B' : pct <= 75 ? '#2563EB' : '#10B981',
                        }}
                      />
                    </div>
                    <span
                      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs ${
                        eventExists
                          ? pct === 100
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-gray-100 text-gray-500 border-gray-200'
                      }`}
                    >
                      {eventExists ? 'Reached' : 'Not reached'}
                    </span>
                  </div>
                );
              })}
            </div>
          </GlassCard>

          {/* Events timeline */}
          <GlassCard className="p-5">
            <h3 className="text-gray-800 mb-4">Activity Timeline</h3>
            {video.analytics.events.length === 0 ? (
              <div className="py-8 text-center">
                <Clock className="h-8 w-8 text-gray-200 mx-auto mb-2" />
                <p className="text-sm text-gray-400">No activity yet</p>
              </div>
            ) : (
              <div className="space-y-0">
                {video.analytics.events.map((event, i) => {
                  const config = eventConfig[event.type];
                  if (!config) return null;
                  const Icon = config.icon;
                  return (
                    <div key={event.id} className="flex gap-3">
                      <div className="flex flex-col items-center w-8">
                        <div
                          className="flex h-8 w-8 items-center justify-center rounded-full shrink-0"
                          style={{ backgroundColor: config.bg }}
                        >
                          <Icon className="h-3.5 w-3.5" style={{ color: config.color }} />
                        </div>
                        {i < video.analytics.events.length - 1 && (
                          <div className="w-0.5 flex-1 min-h-[24px] bg-gray-100" />
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-gray-700" style={{ fontWeight: 500 }}>
                            {config.label}
                          </p>
                          <span className="text-[11px] text-gray-400">{event.timestamp}</span>
                        </div>
                        {event.metadata && <p className="text-xs text-gray-500 mt-0.5">{event.metadata}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </GlassCard>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Video preview card */}
          <GlassCard className="overflow-hidden">
            <div className="relative aspect-video bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center">
              <div className="w-[80%] h-[80%] rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
                <div className="h-4 bg-gray-800 flex items-center px-1.5 gap-0.5">
                  <div className="w-1 h-1 rounded-full bg-red-400" />
                  <div className="w-1 h-1 rounded-full bg-yellow-400" />
                  <div className="w-1 h-1 rounded-full bg-green-400" />
                </div>
                <div className="p-2 space-y-1">
                  <div className="h-1 w-12 bg-gray-200 rounded" />
                  <div className="h-0.5 w-16 bg-gray-100 rounded" />
                  <div className="rounded border-2 border-[#FFD600]/40 bg-[#FFD600]/5 p-1 mt-0.5">
                    <div className="h-0.5 w-8 bg-[#FFD600]/40 rounded" />
                  </div>
                </div>
              </div>
              <div className="absolute bottom-3 right-3 w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-white shadow-lg flex items-center justify-center">
                <span className="text-[9px] text-white" style={{ fontWeight: 600 }}>
                  AK
                </span>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-lg">
                  <Play className="h-4 w-4 text-gray-700 ml-0.5" fill="currentColor" />
                </div>
              </div>
              {video.duration > 0 && (
                <div className="absolute top-2 left-2 flex items-center gap-1 rounded-md bg-black/60 px-1.5 py-0.5">
                  <Clock className="h-2.5 w-2.5 text-white" />
                  <span className="text-[10px] text-white">
                    {Math.floor(video.duration / 60)}:{String(video.duration % 60).padStart(2, '0')}
                  </span>
                </div>
              )}
            </div>
            <div className="p-4">
              <p className="text-sm text-gray-800" style={{ fontWeight: 500 }}>
                {video.name}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">Created {video.createdAt}</p>
              {video.sentAt && <p className="text-xs text-gray-400 mt-0.5">Sent {video.sentAt}</p>}
            </div>
          </GlassCard>

          {/* Action panel */}
          <GlassCard className="p-4 space-y-2.5">
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Actions</p>
            <CopyButton
              text={landingUrl}
              variant="default"
              label="Copy landing link"
              toastMessage="Landing link copied"
              className="w-full justify-center"
            />
            <CopyButton
              text={`Subject: ${video.subjectLine || ''}\n\nWatch video: ${landingUrl}`}
              variant="default"
              label="Copy email snippet"
              toastMessage="Email snippet copied"
              className="w-full justify-center"
            />
            <CopyButton
              text={video.subjectLine || ''}
              variant="default"
              label="Copy subject line"
              toastMessage="Subject line copied"
              className="w-full justify-center"
            />
            {!isSent ? (
              <button
                onClick={handleMarkSent}
                className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#2563EB] px-3 py-2 text-sm text-white hover:bg-[#1D4ED8] transition-colors"
              >
                <Send className="h-3.5 w-3.5" />
                Mark as Sent
              </button>
            ) : (
              <button
                onClick={handleUndoSent}
                className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-500 hover:bg-gray-50 transition-colors"
              >
                <Undo2 className="h-3.5 w-3.5" />
                Undo Sent
              </button>
            )}
            <button
              onClick={() => setShowNoteInput(!showNoteInput)}
              className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-500 hover:bg-gray-50 transition-colors"
            >
              <StickyNote className="h-3.5 w-3.5" />
              Add note
            </button>
            {showNoteInput && (
              <div className="space-y-2">
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Add a note about this video..."
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 outline-none focus:border-[#2563EB] resize-none h-20"
                />
                <button
                  onClick={() => {
                    toast.success('Note saved');
                    setShowNoteInput(false);
                  }}
                  className="text-xs text-[#2563EB] hover:text-[#1D4ED8]"
                >
                  Save note
                </button>
              </div>
            )}
          </GlassCard>

          {/* Recipient card */}
          <GlassCard className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-amber-100 text-xs text-gray-600"
                style={{ fontWeight: 600 }}
              >
                {video.recipientName
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </div>
              <div>
                <p className="text-sm text-gray-800" style={{ fontWeight: 500 }}>
                  {video.recipientName}
                </p>
                <p className="text-xs text-gray-500">{video.recipientTitle}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Linkedin className="h-3 w-3" />
              <span>{video.company}</span>
            </div>
          </GlassCard>

          {/* AI suggestion / Next action */}
          {(video.aiSuggestion || aiAction) && (
            <GlassCard className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-[#2563EB] to-[#FFD600]">
                  <Bot className="h-3 w-3 text-white" />
                </div>
                <span className="text-xs text-gray-500" style={{ fontWeight: 500 }}>
                  AI Next Action
                </span>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                {aiAction?.message || video.aiSuggestion}
              </p>
              {aiAction && (
                <div className="flex gap-2 mt-3">
                  {aiAction.actions.map((action) => (
                    <button
                      key={action}
                      onClick={() => toast.success(`${action} created`)}
                      className="flex-1 flex items-center justify-center gap-1 rounded-lg bg-blue-50 py-1.5 text-xs text-blue-700 hover:bg-blue-100 transition-colors"
                    >
                      {action.includes('follow') || action.includes('nudge') || action.includes('Draft') ? (
                        <Sparkles className="h-3 w-3" />
                      ) : action.includes('bump') ? (
                        <Calendar className="h-3 w-3" />
                      ) : (
                        <CheckSquare className="h-3 w-3" />
                      )}
                      {action}
                    </button>
                  ))}
                </div>
              )}
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
}
