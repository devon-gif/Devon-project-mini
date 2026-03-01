"use client";
import { useEffect, useState } from "react";
import { Inbox } from "@/figma/pages/Inbox";
import { emailThreads } from "@/figma/data/mockData";
import type { EmailThread } from "@/figma/data/mockData";

export default function Page() {
  const [threads, setThreads] = useState<EmailThread[]>(emailThreads);
  const [loading, setLoading] = useState(true);
  const [gmailConnected, setGmailConnected] = useState(false);

  useEffect(() => {
    async function fetchThreads() {
      try {
        const res = await fetch("/api/inbox");
        if (res.ok) {
          const data = await res.json();
          if (data.threads && data.threads.length > 0) {
            setThreads(data.threads);
          }
          // if empty, keep mock data so UI isn't blank
        }
      } catch (e) {
        console.error("[inbox] fetch failed, using mock data", e);
      } finally {
        setLoading(false);
      }
    }

    async function checkGmailStatus() {
      try {
        const res = await fetch("/api/inbox/gmail/status");
        if (res.ok) {
          const data = await res.json();
          setGmailConnected(data.connected);
        }
      } catch {
        // gmail not set up yet
      }
    }

    fetchThreads();
    checkGmailStatus();
  }, []);

  return (
    <div className="h-full flex flex-col">
      {/* Gmail connect banner */}
      {!gmailConnected && !loading && (
        <div className="flex items-center justify-between gap-3 bg-blue-50 border-b border-blue-100 px-4 py-2.5">
          <div className="flex items-center gap-2">
            <svg className="h-4 w-4 text-blue-600 shrink-0" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
            </svg>
            <p className="text-xs text-blue-700">
              Connect Gmail to see real emails here. Currently showing CRM activity.
            </p>
          </div>
          <a
            href="/api/inbox/gmail/connect"
            className="flex items-center gap-1.5 rounded-lg bg-white border border-blue-200 px-3 py-1.5 text-xs text-blue-700 hover:bg-blue-50 transition-colors shrink-0 shadow-sm"
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Connect Gmail
          </a>
        </div>
      )}
      {gmailConnected && (
        <div className="flex items-center gap-2 bg-emerald-50 border-b border-emerald-100 px-4 py-2">
          <div className="h-2 w-2 rounded-full bg-emerald-500" />
          <p className="text-xs text-emerald-700">Gmail connected — showing real emails</p>
          <a href="/api/inbox/gmail/disconnect" className="ml-auto text-xs text-gray-400 hover:text-gray-600">Disconnect</a>
        </div>
      )}
      <div className="flex-1 overflow-hidden">
        <Inbox threads={threads} loading={loading} />
      </div>
    </div>
  );
}
