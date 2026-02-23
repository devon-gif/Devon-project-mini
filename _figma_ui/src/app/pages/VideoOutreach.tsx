import { useState } from 'react';
import { useNavigate } from 'react-router';
import { GlassCard } from '../components/GlassCard';
import { VideoStatusChip } from '../components/VideoStatusChip';
import { CopyButton } from '../components/CopyButton';
import { videoOutreaches, videoKpis } from '../data/videoData';
import type { VideoOutreach as VideoOutreachType } from '../data/videoData';
import {
  Plus, Search, Play, Eye, MousePointerClick,
  CalendarCheck, BarChart3, Video, Clock, Sparkles,
  TrendingUp, ChevronRight, Link, Mail, Copy,
} from 'lucide-react';

const filters = ['All', 'Draft', 'Processing', 'Ready', 'Sent', 'Viewed', 'Clicked', 'Booked'] as const;

export function VideoOutreach() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('All');

  const filtered = videoOutreaches.filter((v) => {
    if (activeFilter !== 'All' && v.status !== activeFilter.toLowerCase()) return false;
    if (
      search &&
      !v.name.toLowerCase().includes(search.toLowerCase()) &&
      !v.recipientName.toLowerCase().includes(search.toLowerCase()) &&
      !v.company.toLowerCase().includes(search.toLowerCase())
    )
      return false;
    return true;
  });

  const sentVideos = videoOutreaches.filter((v) => !['draft', 'processing', 'ready'].includes(v.status));

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-gray-900">Video Outreach</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {videoOutreaches.length} videos &middot; {sentVideos.length} sent
          </p>
        </div>
        <button
          onClick={() => navigate('/videos/create')}
          className="flex items-center gap-2 rounded-xl bg-[#2563EB] px-4 py-2.5 text-sm text-white hover:bg-[#1D4ED8] transition-all shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Create New Video
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Total Created', value: videoKpis.totalCreated, icon: Video, color: '#2563EB' },
          { label: 'Total Sent', value: videoKpis.totalSent, icon: Mail, color: '#6B7280' },
          { label: 'Total Views', value: videoKpis.totalViews, icon: Eye, color: '#8B5CF6' },
          { label: 'Clicks', value: videoKpis.totalClicks, icon: MousePointerClick, color: '#F59E0B' },
          { label: 'Bookings', value: videoKpis.totalBookings, icon: CalendarCheck, color: '#10B981' },
          { label: 'Avg Watch %', value: `${videoKpis.avgWatchPercent}%`, icon: TrendingUp, color: '#EC4899', subtitle: 'V2' },
        ].map((kpi) => (
          <GlassCard key={kpi.label} className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-lg"
                style={{ backgroundColor: `${kpi.color}12` }}
              >
                <kpi.icon className="h-4 w-4" style={{ color: kpi.color }} />
              </div>
              {kpi.subtitle && (
                <span className="text-[9px] text-gray-300 bg-gray-100 rounded px-1 py-0.5">
                  {kpi.subtitle}
                </span>
              )}
            </div>
            <p className="text-xl text-gray-900" style={{ fontWeight: 600 }}>
              {kpi.value}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">{kpi.label}</p>
          </GlassCard>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search videos..."
            className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:border-[#2563EB] transition-colors"
          />
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`rounded-lg px-3 py-1.5 text-xs transition-all ${
                activeFilter === f
                  ? 'bg-[#FFD600] text-gray-900 shadow-[0_2px_8px_rgba(255,214,0,0.25)]'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Video Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((video) => (
          <VideoCard key={video.id} video={video} onClick={() => navigate(`/videos/${video.id}`)} />
        ))}

        {/* Create new card */}
        <button
          onClick={() => navigate('/videos/create')}
          className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 p-8 text-gray-400 hover:border-[#2563EB] hover:text-[#2563EB] hover:bg-blue-50/30 transition-all min-h-[240px]"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 mb-3">
            <Plus className="h-5 w-5" />
          </div>
          <span className="text-sm">Create new video</span>
        </button>
      </div>
    </div>
  );
}

function VideoCard({ video, onClick }: { video: VideoOutreachType; onClick: () => void }) {
  const landingUrl = `https://watch.withtwill.com/${video.landingPageSlug || 'demo'}`;

  return (
    <GlassCard className="overflow-hidden" hover onClick={onClick}>
      {/* GIF Preview Thumbnail */}
      <div className="relative h-[160px] bg-gradient-to-br from-gray-100 to-gray-50 overflow-hidden group">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-[85%] h-[130px] rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden relative">
            <div className="h-6 bg-gray-800 flex items-center px-2 gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
              <div className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
              <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
              <span className="text-[8px] text-gray-400 ml-2 truncate">
                {video.personalization.websiteUrl || video.company.toLowerCase() + '.com'}
              </span>
            </div>
            <div className="p-2 space-y-1">
              <div className="h-1.5 w-16 bg-gray-200 rounded" />
              <div className="h-1 w-24 bg-gray-100 rounded" />
              <div className="h-1 w-20 bg-gray-100 rounded" />
              {video.personalization.highlightSection && (
                <div className="mt-1 px-1 py-0.5 rounded bg-[#FFD600]/20 border border-[#FFD600]/40">
                  <div className="h-1 w-12 bg-[#FFD600]/60 rounded" />
                </div>
              )}
              <div className="h-1 w-18 bg-gray-100 rounded" />
            </div>
          </div>
        </div>

        {/* Webcam bubble */}
        <div className="absolute bottom-3 right-3 w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-white shadow-lg flex items-center justify-center">
          <span className="text-[9px] text-white" style={{ fontWeight: 600 }}>
            AK
          </span>
        </div>

        {/* Play button overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/10">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-lg backdrop-blur-sm">
            <Play className="h-4 w-4 text-gray-700 ml-0.5" fill="currentColor" />
          </div>
        </div>

        {/* Duration badge */}
        {video.duration > 0 && (
          <div className="absolute top-2 left-2 flex items-center gap-1 rounded-md bg-black/60 px-1.5 py-0.5 backdrop-blur-sm">
            <Clock className="h-2.5 w-2.5 text-white" />
            <span className="text-[10px] text-white">
              {Math.floor(video.duration / 60)}:{String(video.duration % 60).padStart(2, '0')}
            </span>
          </div>
        )}

        {/* Status chip */}
        <div className="absolute top-2 right-2">
          <VideoStatusChip status={video.status} />
        </div>
      </div>

      {/* Card body */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-sm text-gray-800 truncate" style={{ fontWeight: 500 }}>
              {video.name}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              {video.recipientName} &middot; {video.company}
            </p>
          </div>
          <ChevronRight className="h-4 w-4 text-gray-300 shrink-0 mt-0.5" />
        </div>

        {/* Mini stats */}
        {!['draft', 'processing', 'ready'].includes(video.status) && (
          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-1">
              <Eye className="h-3 w-3 text-gray-400" />
              <span className="text-xs text-gray-500">{video.analytics.views}</span>
            </div>
            <div className="flex items-center gap-1">
              <MousePointerClick className="h-3 w-3 text-gray-400" />
              <span className="text-xs text-gray-500">{video.analytics.clicks}</span>
            </div>
            <div className="flex items-center gap-1">
              <CalendarCheck className="h-3 w-3 text-gray-400" />
              <span className="text-xs text-gray-500">{video.analytics.bookings}</span>
            </div>
            {video.analytics.avgWatchPercent > 0 && (
              <div className="flex items-center gap-1 ml-auto">
                <div className="w-12 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${video.analytics.avgWatchPercent}%`,
                      backgroundColor:
                        video.analytics.avgWatchPercent > 75
                          ? '#10B981'
                          : video.analytics.avgWatchPercent > 50
                          ? '#F59E0B'
                          : '#EF4444',
                    }}
                  />
                </div>
                <span className="text-[10px] text-gray-400">{video.analytics.avgWatchPercent}%</span>
              </div>
            )}
          </div>
        )}

        {/* Hover actions for ready status */}
        {video.status === 'ready' && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
            <CopyButton
              text={landingUrl}
              variant="ghost"
              label="Copy link"
              toastMessage="Landing page link copied"
            />
            <CopyButton
              text={`Subject: ${video.subjectLine || ''}`}
              variant="ghost"
              label="Copy snippet"
              toastMessage="Email snippet copied"
            />
          </div>
        )}

        {/* AI Suggestion */}
        {video.aiSuggestion && (
          <div className="flex items-start gap-2 mt-3 rounded-lg bg-blue-50 border border-blue-100 p-2">
            <Sparkles className="h-3 w-3 text-blue-500 mt-0.5 shrink-0" />
            <p className="text-[11px] text-gray-600 leading-relaxed">{video.aiSuggestion}</p>
          </div>
        )}
      </div>
    </GlassCard>
  );
}
