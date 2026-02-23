import { useState } from 'react';
import {
  X, Share2, Copy, Check, Eye, EyeOff, ExternalLink,
} from 'lucide-react';
import type { Account } from '../data/mockData';

interface ShareModalProps {
  open: boolean;
  onClose: () => void;
  metrics: { label: string; value: number; trend: string; up: boolean; color: string }[];
  hotAccounts: Account[];
}

export function ShareModal({ open, onClose, metrics, hotAccounts }: ShareModalProps) {
  const [hideEmails, setHideEmails] = useState(true);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard?.writeText('https://app.withtwill.com/share/mc-axk-2026-02');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[640px] max-h-[85vh] rounded-2xl border border-gray-200 bg-white shadow-[0_25px_60px_rgba(0,0,0,0.15)] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <Share2 className="h-4 w-4 text-[#2563EB]" />
            <div>
              <h3 className="text-gray-900">Proof-of-Work Share</h3>
              <p className="text-xs text-gray-500 mt-0.5">Read-only snapshot of your Mission Control</p>
            </div>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content - preview of shared view */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Link + controls */}
          <div className="flex items-center gap-3">
            <div className="flex-1 flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5">
              <ExternalLink className="h-3.5 w-3.5 text-gray-400 shrink-0" />
              <span className="text-xs text-gray-500 truncate">https://app.withtwill.com/share/mc-axk-2026-02</span>
            </div>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 rounded-xl bg-[#2563EB] px-4 py-2.5 text-sm text-white hover:bg-[#1D4ED8] transition-all shrink-0"
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? 'Copied' : 'Copy link'}
            </button>
          </div>

          {/* Toggle email visibility */}
          <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
            <div className="flex items-center gap-2">
              {hideEmails ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
              <div>
                <p className="text-sm text-gray-700">Hide email bodies</p>
                <p className="text-xs text-gray-400">Only shows scoreboard, accounts & activity</p>
              </div>
            </div>
            <button
              onClick={() => setHideEmails(!hideEmails)}
              className={`relative h-6 w-11 rounded-full transition-colors ${hideEmails ? 'bg-[#2563EB]' : 'bg-gray-300'}`}
            >
              <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${hideEmails ? 'left-[22px]' : 'left-0.5'}`} />
            </button>
          </div>

          {/* Preview */}
          <div className="rounded-xl border border-gray-200 bg-[#FAFBFF] p-4 space-y-3">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider">Share Preview</p>

            {/* Scoreboard preview */}
            <div className="grid grid-cols-5 gap-2">
              {metrics.map(m => (
                <div key={m.label} className="rounded-lg border border-gray-200 bg-white p-2.5 text-center">
                  <p className="text-lg text-gray-900" style={{ fontWeight: 600 }}>{m.value}</p>
                  <p className="text-[9px] text-gray-400 mt-0.5">{m.label}</p>
                  <span className="text-[9px] text-emerald-600">{m.trend}</span>
                </div>
              ))}
            </div>

            {/* Hot accounts preview */}
            <div className="rounded-lg border border-gray-200 bg-white p-3">
              <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-2">Top Accounts</p>
              <div className="space-y-1">
                {hotAccounts.slice(0, 5).map(a => (
                  <div key={a.id} className="flex items-center justify-between py-1">
                    <div className="flex items-center gap-2">
                      <div className="flex h-5 w-5 items-center justify-center rounded bg-blue-50 text-[8px] text-blue-600" style={{ fontWeight: 500 }}>
                        {a.company.slice(0, 2)}
                      </div>
                      <span className="text-[11px] text-gray-700">{a.company}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="h-1 w-8 rounded-full bg-gray-100 overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-[#2563EB] to-[#FFD600]" style={{ width: `${a.signalScore}%` }} />
                      </div>
                      <span className="text-[9px] text-gray-400">{a.signalScore}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-gray-200 px-5 py-3">
          <p className="text-xs text-gray-400">Anyone with the link can view this snapshot</p>
          <button onClick={onClose} className="rounded-xl bg-gray-100 px-4 py-2 text-sm text-gray-600 hover:bg-gray-200 transition-colors">
            Done
          </button>
        </div>
      </div>
    </div>
  );
}