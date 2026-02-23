import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { videoOutreaches } from '../data/videoData';
import {
  Play, CalendarCheck, ArrowRight, ArrowLeft,
  Monitor, Smartphone, Eye, ChevronRight,
} from 'lucide-react';

export function VideoLanding() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');

  // Find the video if an id is provided, otherwise use a sample
  const video = id ? videoOutreaches.find((v) => v.id === id) : videoOutreaches[0];
  const recipientName = video?.recipientName || 'Sarah';
  const firstName = recipientName.split(' ')[0];
  const company = video?.company || 'Stripe';
  const ctaLabel = video?.ctaLabel || 'Book 12 minutes';

  return (
    <div className="h-full overflow-y-auto bg-gray-100">
      {/* Admin toolbar */}
      <div className="sticky top-0 z-20 flex items-center justify-between border-b border-gray-200 bg-white px-5 py-2.5 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(id ? `/videos/${id}` : '/videos')}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <div className="h-4 w-px bg-gray-200" />
          <span className="text-sm text-gray-700" style={{ fontWeight: 500 }}>
            Landing Page Preview
          </span>
          <div className="flex items-center gap-1 rounded-md bg-blue-50 border border-blue-100 px-2 py-0.5">
            <Eye className="h-3 w-3 text-blue-500" />
            <span className="text-[10px] text-blue-600">Views tracked</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Device toggle */}
          <div className="flex items-center rounded-lg border border-gray-200 bg-gray-50 p-0.5">
            <button
              onClick={() => setDevice('desktop')}
              className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs transition-all ${
                device === 'desktop'
                  ? 'bg-white text-gray-700 shadow-sm'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Monitor className="h-3 w-3" />
              Desktop
            </button>
            <button
              onClick={() => setDevice('mobile')}
              className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs transition-all ${
                device === 'mobile'
                  ? 'bg-white text-gray-700 shadow-sm'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Smartphone className="h-3 w-3" />
              Mobile
            </button>
          </div>
        </div>
      </div>

      {/* Landing page content in viewport */}
      <div className="flex justify-center py-8 px-4">
        <div
          className={`transition-all duration-300 ${
            device === 'mobile' ? 'w-[375px]' : 'w-full max-w-5xl'
          }`}
        >
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-6 sm:px-8 py-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-6 w-6 rounded bg-[#FFD600] flex items-center justify-center">
                  <span className="text-[8px] text-gray-900" style={{ fontWeight: 700 }}>
                    T
                  </span>
                </div>
                <span className="text-xs text-gray-400">Twill</span>
              </div>
              <h2 className="text-white" style={{ fontSize: device === 'mobile' ? '18px' : undefined }}>
                Hey {firstName} — quick idea for {company}
              </h2>
              <p className="text-sm text-gray-400 mt-1">A personalized message from Alex at Twill</p>
            </div>

            {/* Content */}
            <div
              className={`p-6 sm:p-8 ${
                device === 'desktop' ? 'grid grid-cols-1 md:grid-cols-3 gap-8' : 'space-y-6'
              }`}
            >
              {/* Video player area */}
              <div className={device === 'desktop' ? 'md:col-span-2' : ''}>
                <div className="relative aspect-video bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl overflow-hidden group cursor-pointer">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/90 shadow-2xl group-hover:scale-110 transition-transform">
                      <Play className="h-6 w-6 text-gray-800 ml-1" fill="currentColor" />
                    </div>
                  </div>
                  <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-lg bg-black/50 px-2 py-1 backdrop-blur-sm">
                    <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                      <span className="text-[7px] text-white" style={{ fontWeight: 600 }}>
                        AK
                      </span>
                    </div>
                    <span className="text-xs text-white">Alex Kim</span>
                  </div>
                  {video && video.duration > 0 && (
                    <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-md bg-black/50 px-1.5 py-0.5 backdrop-blur-sm">
                      <span className="text-[10px] text-white">
                        {Math.floor(video.duration / 60)}:{String(video.duration % 60).padStart(2, '0')}
                      </span>
                    </div>
                  )}
                </div>

                {/* Value points */}
                <div className="mt-6 space-y-3">
                  <p className="text-sm text-gray-500">Here's what I cover:</p>
                  {[
                    'How Twill helps companies hire 40% faster through warm referrals',
                    'Why trusted recommendations beat cold sourcing every time',
                    `Specific ideas for ${company}'s growth goals`,
                  ].map((prop, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#FFD600]/20 text-[#8B6914] shrink-0 mt-0.5">
                        <span className="text-[10px]" style={{ fontWeight: 600 }}>
                          {i + 1}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{prop}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right rail: CTA */}
              <div className="space-y-4">
                {/* Calendar CTA */}
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <CalendarCheck className="h-4 w-4 text-[#2563EB]" />
                    <span className="text-sm text-gray-700" style={{ fontWeight: 500 }}>
                      Book a Time
                    </span>
                  </div>

                  {/* Mini calendar mock */}
                  <div className="rounded-lg border border-gray-200 bg-white p-3 mb-3">
                    <p className="text-xs text-gray-500 text-center mb-2">February 2026</p>
                    <div className="grid grid-cols-7 gap-1 text-center text-[10px]">
                      {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                        <span key={i} className="text-gray-400">
                          {d}
                        </span>
                      ))}
                      {Array.from({ length: 28 }, (_, i) => i + 1).map((d) => (
                        <button
                          key={d}
                          className={`h-5 w-5 rounded text-gray-600 transition-all ${
                            d === 24
                              ? 'bg-[#2563EB] text-white'
                              : d === 25 || d === 26
                              ? 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                              : d < 22
                              ? 'text-gray-300'
                              : 'hover:bg-gray-100'
                          }`}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-[#2563EB] px-4 py-2.5 text-sm text-white hover:bg-[#1D4ED8] transition-colors">
                    <CalendarCheck className="h-4 w-4" />
                    {ctaLabel}
                  </button>
                </div>

                {/* Secondary CTA */}
                <button className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                  <ArrowRight className="h-3.5 w-3.5" />
                  Forward to the right person
                </button>

                {/* Footer */}
                <div className="text-center pt-4">
                  <p className="text-[10px] text-gray-300">
                    Personalized video sent by Alex Kim at Twill.
                  </p>
                  <p className="text-[10px] text-gray-300 mt-1">Privacy Policy &middot; Unsubscribe</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
