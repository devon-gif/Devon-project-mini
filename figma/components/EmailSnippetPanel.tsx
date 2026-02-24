"use client";

import { useState, useCallback } from 'react';
import { CopyButton } from './CopyButton';
import { Mail, Code, Type, Play, Copy, CheckCircle2, Send, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

interface EmailSnippetPanelProps {
  recipientName: string;
  company: string;
  subjectLine: string;
  landingPageSlug?: string;
  /** Full URL to share page (e.g. origin + /share/slug). If not set, built from landingPageSlug. */
  landingUrl?: string;
  recipientEmail?: string;
  videoId?: string;
  ctaLabel: string;
  senderName?: string;
  /** Called after Mark as Sent (DB updated + event logged). */
  onMarkedSent?: () => void;
}

const tabs = [
  { id: 'subject', label: 'Subject', icon: Mail },
  { id: 'html', label: 'HTML Block', icon: Code },
  { id: 'plaintext', label: 'Plain Text', icon: Type },
] as const;

function trackEmailEvent(videoId: string, type: string, meta?: Record<string, unknown>) {
  fetch(`/api/videos/${videoId}/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, meta }),
  }).catch(() => {});
}

export function EmailSnippetPanel({
  recipientName,
  company,
  subjectLine,
  landingPageSlug,
  landingUrl: landingUrlProp,
  recipientEmail,
  videoId,
  ctaLabel,
  senderName = 'Alex',
  onMarkedSent,
}: EmailSnippetPanelProps) {
  const [activeTab, setActiveTab] = useState<'subject' | 'html' | 'plaintext'>('subject');
  const [markedSent, setMarkedSent] = useState(false);

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const landingUrl = landingUrlProp || (landingPageSlug ? `${baseUrl}/share/${landingPageSlug}` : `${baseUrl}/share/demo`);
  const firstName = recipientName.split(' ')[0];
  const gifUrl = landingPageSlug ? `${baseUrl}/uploads/gifs/${landingPageSlug}.gif` : `https://cdn.withtwill.com/gifs/${landingPageSlug || 'demo'}.gif`;

  const subject = subjectLine || `Quick idea for ${company}`;

  const htmlBlock = `<div style="max-width:520px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <p style="color:#374151;font-size:14px;line-height:1.6;margin:0 0 16px;">
    Made this quick for you &rarr;
  </p>
  <a href="${landingUrl}" style="display:block;text-decoration:none;">
    <div style="position:relative;border-radius:12px;overflow:hidden;border:1px solid #E5E7EB;">
      <img src="${gifUrl}" alt="Personalized video for ${firstName}" style="width:100%;display:block;border-radius:12px;" />
      <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:48px;height:48px;background:rgba(255,255,255,0.9);border-radius:50%;display:flex;align-items:center;justify-content:center;">
        <div style="width:0;height:0;border-left:14px solid #1A1A2E;border-top:9px solid transparent;border-bottom:9px solid transparent;margin-left:3px;"></div>
      </div>
    </div>
  </a>
  <p style="color:#6B7280;font-size:12px;line-height:1.5;margin:12px 0 0;">
    <a href="${landingUrl}" style="color:#2563EB;text-decoration:underline;">${ctaLabel}</a> &middot; 
    If you're not the right person, who should I talk to?
  </p>
  <p style="color:#9CA3AF;font-size:11px;margin:16px 0 0;">
    No attachments &mdash; just a quick personalized video from ${senderName} at Twill.
  </p>
</div>`;

  const plainText = `${firstName} — made this quick for you:

${landingUrl}

${ctaLabel}

If you're not the right person, who should I talk to?

— ${senderName}, Twill`;

  const getContent = () => {
    switch (activeTab) {
      case 'subject': return subject;
      case 'html': return htmlBlock;
      case 'plaintext': return plainText;
    }
  };

  const handleCopyAll = async () => {
    try {
      const all = `Subject: ${subject}\n\n---\n\n${plainText}\n\n---\n\nHTML:\n${htmlBlock}`;
      await navigator.clipboard.writeText(all);
      toast.success('All snippets copied to clipboard');
      if (videoId) trackEmailEvent(videoId, 'email_snippet_copied', { field: 'all' });
    } catch {
      toast.error('Failed to copy');
    }
  };

  const handleOpenGmail = useCallback(() => {
    const to = recipientEmail || '';
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(to)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(plainText)}`;
    window.open(gmailUrl, '_blank');
    if (videoId) trackEmailEvent(videoId, 'email_compose_opened', { provider: 'gmail' });
  }, [recipientEmail, subject, plainText, videoId]);

  const handleOpenMailto = useCallback(() => {
    const to = recipientEmail || '';
    const mailto = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(plainText)}`;
    window.location.href = mailto;
    if (videoId) trackEmailEvent(videoId, 'email_compose_opened', { provider: 'mailto' });
  }, [recipientEmail, subject, plainText, videoId]);

  const handleMarkAsSent = useCallback(async () => {
    if (!videoId) return;
    try {
      const res = await fetch(`/api/videos/${videoId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'sent' }),
      });
      if (!res.ok) throw new Error('Failed to update');
      trackEmailEvent(videoId, 'email_marked_sent');
      setMarkedSent(true);
      toast.success('Marked as sent');
      onMarkedSent?.();
    } catch {
      toast.error('Failed to mark as sent');
    }
  }, [videoId, onMarkedSent]);

  const trackCopy = useCallback((field: string) => {
    if (videoId) trackEmailEvent(videoId, 'email_snippet_copied', { field });
  }, [videoId]);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/50">
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-[#2563EB]" />
          <span className="text-sm text-gray-700" style={{ fontWeight: 500 }}>Email Snippet</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {videoId && recipientEmail && (
            <>
              <button
                type="button"
                onClick={handleOpenGmail}
                className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <ExternalLink className="h-3 w-3" />
                Open Gmail
              </button>
              <button
                type="button"
                onClick={handleOpenMailto}
                className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Mail className="h-3 w-3" />
                Open in Mail
              </button>
              <CopyButton
                text={landingUrl}
                variant="ghost"
                label="Copy link"
                toastMessage="Share link copied"
                onAfterCopy={() => trackCopy('link')}
              />
              {!markedSent && (
                <button
                  type="button"
                  onClick={handleMarkAsSent}
                  className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs text-white hover:bg-emerald-700 transition-colors"
                >
                  <Send className="h-3 w-3" />
                  Mark as Sent
                </button>
              )}
              {markedSent && (
                <span className="flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs text-emerald-700">
                  <CheckCircle2 className="h-3 w-3" />
                  Sent
                </span>
              )}
            </>
          )}
          <button
            onClick={handleCopyAll}
            className="flex items-center gap-1.5 rounded-lg bg-[#2563EB] px-3 py-1.5 text-xs text-white hover:bg-[#1D4ED8] transition-colors"
          >
            <Copy className="h-3 w-3" />
            Copy everything
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs transition-all border-b-2 ${
              activeTab === tab.id
                ? 'border-[#2563EB] text-[#2563EB] bg-blue-50/30'
                : 'border-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-50'
            }`}
          >
            <tab.icon className="h-3 w-3" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-4">
        {activeTab === 'subject' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
              <span className="text-sm text-gray-700">{subject}</span>
              <CopyButton text={subject} variant="ghost" label="Copy" toastMessage="Subject line copied" onAfterCopy={() => trackCopy('subject')} />
            </div>
            <p className="text-[11px] text-gray-400">Paste this as your email subject line in Gmail.</p>
          </div>
        )}

        {activeTab === 'html' && (
          <div className="space-y-3">
            {/* Visual preview */}
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <p className="text-sm text-gray-600 mb-3">Made this quick for you →</p>
              <div className="relative rounded-xl border border-gray-200 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-50 aspect-video flex items-center justify-center mb-3">
                <div className="w-[70%] h-[70%] rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
                  <div className="h-4 bg-gray-800 flex items-center px-1.5 gap-0.5">
                    <div className="w-1 h-1 rounded-full bg-red-400" />
                    <div className="w-1 h-1 rounded-full bg-yellow-400" />
                    <div className="w-1 h-1 rounded-full bg-green-400" />
                  </div>
                  <div className="p-2 space-y-1">
                    <div className="h-1 w-12 bg-gray-200 rounded" />
                    <div className="h-0.5 w-16 bg-gray-100 rounded" />
                  </div>
                </div>
                <div className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-white shadow flex items-center justify-center">
                  <span className="text-[7px] text-white" style={{ fontWeight: 600 }}>AK</span>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow">
                    <Play className="h-3 w-3 text-gray-700 ml-0.5" fill="currentColor" />
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-500">
                <span className="text-[#2563EB] underline cursor-pointer">{ctaLabel}</span> · If you're not the right person, who should I talk to?
              </p>
              <p className="text-[10px] text-gray-300 mt-2">No attachments — just a quick personalized video from {senderName} at Twill.</p>
            </div>

            {/* Code block */}
            <div className="relative">
              <pre className="rounded-xl border border-gray-200 bg-gray-900 p-3 text-[11px] text-emerald-300 overflow-x-auto max-h-[200px] overflow-y-auto">
                <code>{htmlBlock}</code>
              </pre>
              <div className="absolute top-2 right-2">
                <CopyButton text={htmlBlock} variant="icon" toastMessage="HTML snippet copied" onAfterCopy={() => trackCopy('html')} />
              </div>
            </div>
            <div className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 p-2.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-amber-500 mt-0.5 shrink-0" />
              <p className="text-[11px] text-amber-700">Spam-safe: No attachments included. GIF is hosted externally.</p>
            </div>
          </div>
        )}

        {activeTab === 'plaintext' && (
          <div className="space-y-3">
            <div className="relative">
              <pre className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600 whitespace-pre-wrap">
                {plainText}
              </pre>
              <div className="absolute top-2 right-2">
                <CopyButton text={plainText} variant="icon" toastMessage="Plain text copied" onAfterCopy={() => trackCopy('plain')} />
              </div>
            </div>
            <p className="text-[11px] text-gray-400">Use this for email clients that don't support HTML or as a fallback.</p>
          </div>
        )}
      </div>
    </div>
  );
}
