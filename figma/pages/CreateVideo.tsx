"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { GlassCard } from '../components/GlassCard';
import { StatusChip } from '../components/StatusChip';
import { VideoStatusChip } from '../components/VideoStatusChip';
import { CopyButton } from '../components/CopyButton';
import { EmailSnippetPanel } from '../components/EmailSnippetPanel';
import { people } from '../data/mockData';
import { toast } from 'sonner';
import {
  ArrowLeft, ArrowRight, Check, Search, Linkedin,
  Upload, Video, Clock, FileVideo, HardDrive, Monitor,
  ChevronDown, AlertCircle, Loader2, CheckCircle2,
  ExternalLink, Play, RefreshCw, Calendar,
} from 'lucide-react';

const steps = [
  { id: 1, label: 'Select Recipient' },
  { id: 2, label: 'Upload Video' },
  { id: 3, label: 'Generate & Send' },
];

type ProcessingPhase = 'uploading' | 'generating_gif' | 'creating_landing' | 'done' | 'error';

export function CreateVideo() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefilledPersonId = searchParams.get('person');
  const [currentStep, setCurrentStep] = useState(prefilledPersonId ? 1 : 1);

  // Step 1
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPerson, setSelectedPerson] = useState<string | null>(prefilledPersonId);
  const [addCC, setAddCC] = useState(false);

  // Step 2
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState('');
  const [fileDuration, setFileDuration] = useState('');
  const [fileResolution, setFileResolution] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const [ctaType, setCtaType] = useState<'book_12_min' | 'reply' | 'forward'>('book_12_min');
  const [calendarLink, setCalendarLink] = useState('https://cal.com/alexkim/12min');
  const [ctaLabel, setCtaLabel] = useState('Book 12 minutes');
  const [fileUploaded, setFileUploaded] = useState(false);

  // Step 3
  const [processingPhase, setProcessingPhase] = useState<ProcessingPhase>('uploading');
  const [progress, setProgress] = useState(0);
  const [createdVideo, setCreatedVideo] = useState<{ id: string; public_token: string; gif_path?: string | null } | null>(null);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [apiPeople, setApiPeople] = useState<Array<{ id: string; name: string; title: string; company: string; email: string; linkedin?: string; emailStatus?: string }>>([]);

  useEffect(() => {
    fetch('/api/people')
      .then((r) => (r.ok ? r.json() : ({} as { people?: unknown[] })))
      .then((d) => {
        if (Array.isArray(d?.people) && d.people.length) {
          setApiPeople(
            d.people.map((p: { id: string; name: string; title?: string; company?: string; email?: string; linkedin_url?: string }) => ({
              id: p.id,
              name: p.name,
              title: p.title ?? '',
              company: p.company ?? '',
              email: p.email ?? '',
              linkedin: p.linkedin_url,
              emailStatus: 'unknown',
            }))
          );
        }
      })
      .catch(() => {});
  }, []);

  const peopleList = apiPeople.length ? apiPeople : people;
  const filteredPeople = peopleList.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const person = peopleList.find((p) => p.id === selectedPerson);

  // Notify when person is pre-filled from URL
  useEffect(() => {
    if (prefilledPersonId) {
      const p = peopleList.find(pp => pp.id === prefilledPersonId);
      if (p) {
        toast.success(`Recipient pre-filled: ${p.name}`, {
          description: `${p.title} at ${p.company}`,
        });
      }
    }
  }, [prefilledPersonId, peopleList]);

  // Auto-generate title
  useEffect(() => {
    if (person && !videoTitle) {
      setVideoTitle(`${person.company} — ${person.name.split(' ')[0]}`);
    }
  }, [person, videoTitle]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setVideoFile(file);
    setFileName(file.name);
    setFileSize(file.size >= 1024 * 1024 ? `${(file.size / 1024 / 1024).toFixed(1)} MB` : `${(file.size / 1024).toFixed(1)} KB`);
    setFileDuration('—');
    setFileResolution('—');
    setFileUploaded(true);
    e.target.value = '';
  }, []);

  const handleGenerateClick = useCallback(async () => {
    if (!person || !videoFile) return;
    setGenerateError(null);
    setCurrentStep(3);
    setProcessingPhase('uploading');
    setProgress(5);
    const title = videoTitle.trim() || `${person.company} — ${person.name.split(' ')[0]}`;
    const createPayload = {
      title,
      prospect_id: person.id,
      recipient_name: person.name,
      recipient_company: person.company,
      recipient_email: person.email || '',
      cta_type: ctaType === 'forward' || ctaType === 'reply' ? 'forward' : 'book',
      cta_url: ctaType === 'book_12_min' ? calendarLink : '',
      cta_label: ctaLabel || undefined,
    };
    try {
      let videoId: string;
      let public_token: string;

      const createResFirst = await fetch('/api/videos/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createPayload),
      });
      if (createResFirst.ok) {
        const { video } = await createResFirst.json();
        videoId = video.id;
        public_token = video.public_token;
        setProgress(15);
        const formData = new FormData();
        formData.set('videoId', videoId);
        formData.set('file', videoFile);
        const uploadRes = await fetch('/api/videos/upload', { method: 'POST', body: formData });
        if (!uploadRes.ok) {
          const j = await uploadRes.json().catch(() => ({}));
          throw new Error(j.error || 'Upload failed');
        }
      } else {
        const formData = new FormData();
        formData.set('file', videoFile);
        const uploadRes = await fetch('/api/videos/upload', { method: 'POST', body: formData });
        if (!uploadRes.ok) {
          const j = await uploadRes.json().catch(() => ({}));
          throw new Error(j.error || 'Upload failed');
        }
        const { storagePath } = await uploadRes.json();
        setProgress(25);
        setProcessingPhase('generating_gif');
        const createRes = await fetch('/api/videos/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...createPayload, storagePath }),
        });
        if (!createRes.ok) {
          const j = await createRes.json().catch(() => ({}));
          throw new Error(j.error || 'Create failed');
        }
        const { video } = await createRes.json();
        videoId = video.id;
        public_token = video.public_token;
      }

      setProgress(50);
      setProcessingPhase('creating_landing');
      const gifRes = await fetch(`/api/videos/${videoId}/generate-gif`, { method: 'POST' });
      const gifData = await gifRes.json().catch(() => ({}));
      if (!gifRes.ok) {
        const msg = gifData.code === 'GIF_GEN_FAILED' ? (gifData.details || gifData.error) : (gifData.error || 'GIF generation failed');
        throw new Error(msg);
      }
      if (gifData.skipped && gifData.message) {
        toast.info(gifData.message);
      }
      setProgress(100);
      setCreatedVideo({ id: videoId, public_token, gif_path: gifData.gif_path ?? null });
      setProcessingPhase('done');
    } catch (err) {
      setGenerateError(err instanceof Error ? err.message : 'Something went wrong');
      setProcessingPhase('error');
      toast.error('Generate failed');
    }
  }, [person, videoFile, videoTitle, ctaType, calendarLink, ctaLabel]);

  const canProceed = () => {
    if (currentStep === 1) return !!selectedPerson;
    if (currentStep === 2) return fileUploaded;
    return true;
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/videos')}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <div className="flex-1">
            <h1 className="text-gray-900">Create Video</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Upload a video, generate GIF preview + landing page, copy email snippet
            </p>
          </div>
        </div>

        {/* Progress Stepper */}
        <div className="flex items-center gap-2">
          {steps.map((step, i) => (
            <div key={step.id} className="flex items-center gap-2 flex-1">
              <button
                onClick={() => {
                  if (step.id < currentStep) setCurrentStep(step.id);
                }}
                className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition-all flex-1 ${
                  step.id === currentStep
                    ? 'bg-[#FFD600] text-gray-900 shadow-[0_2px_8px_rgba(255,214,0,0.25)]'
                    : step.id < currentStep
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                <div
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-xs shrink-0 ${
                    step.id < currentStep
                      ? 'bg-emerald-500 text-white'
                      : step.id === currentStep
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-300 text-white'
                  }`}
                >
                  {step.id < currentStep ? <Check className="h-3 w-3" /> : step.id}
                </div>
                <span className="hidden sm:inline truncate">{step.label}</span>
              </button>
              {i < steps.length - 1 && <div className="h-px w-4 bg-gray-200 shrink-0 hidden lg:block" />}
            </div>
          ))}
        </div>

        {/* Step 1: Select Recipient */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <GlassCard className="p-5">
              <h3 className="text-gray-800 mb-3">Select Recipient</h3>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search people by name, company, or title..."
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-9 pr-3 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:border-[#2563EB] transition-colors"
                />
              </div>

              <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                {filteredPeople.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPerson(p.id)}
                    className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all ${
                      selectedPerson === p.id
                        ? 'border-[#2563EB] bg-blue-50/50 shadow-[0_0_0_1px_#2563EB]'
                        : 'border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-amber-100 text-xs text-gray-600 shrink-0"
                      style={{ fontWeight: 600 }}
                    >
                      {p.name
                        .split(' ')
                        .map((n: string) => n[0])
                        .join('')}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-gray-800" style={{ fontWeight: 500 }}>
                          {p.name}
                        </p>
                        {p.linkedin && <Linkedin className="h-3 w-3 text-blue-500" />}
                      </div>
                      <p className="text-xs text-gray-500 truncate">
                        {p.title} &middot; {p.company}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <StatusChip
                        label={p.emailStatus ?? 'unknown'}
                        variant={p.emailStatus === 'verified' ? 'success' : 'warning'}
                      />
                      {selectedPerson === p.id && (
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#2563EB]">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </GlassCard>

            {/* Selected recipient card */}
            {person && (
              <GlassCard className="p-5">
                <h3 className="text-gray-800 mb-3">Recipient</h3>
                <div className="flex items-center gap-3 rounded-xl border border-[#2563EB] bg-blue-50/30 p-4">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-amber-100 text-sm text-gray-600 shrink-0"
                    style={{ fontWeight: 600 }}
                  >
                    {person.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-800" style={{ fontWeight: 500 }}>
                      {person.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {person.title} at {person.company}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <StatusChip
                        label={person.emailStatus ?? 'unknown'}
                        variant={person.emailStatus === 'verified' ? 'success' : 'warning'}
                      />
                      {person.linkedin && (
                        <span className="text-[11px] text-blue-500 flex items-center gap-0.5">
                          <Linkedin className="h-3 w-3" />
                          LinkedIn
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* CC toggle */}
                <div className="flex items-center justify-between mt-4 rounded-xl border border-gray-100 bg-gray-50/50 px-3 py-2.5">
                  <div>
                    <p className="text-sm text-gray-700">Add internal CC</p>
                    <p className="text-[11px] text-gray-400">CC your manager or team on tracking</p>
                  </div>
                  <button
                    onClick={() => setAddCC(!addCC)}
                    className={`relative h-5 w-9 rounded-full transition-colors ${addCC ? 'bg-[#2563EB]' : 'bg-gray-300'}`}
                  >
                    <span
                      className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                        addCC ? 'left-[18px]' : 'left-0.5'
                      }`}
                    />
                  </button>
                </div>
              </GlassCard>
            )}
          </div>
        )}

        {/* Step 2: Upload Video */}
        {currentStep === 2 && person && (
          <div className="space-y-4">
            {/* Upload Dropzone */}
            <GlassCard className="p-5">
              <h3 className="text-gray-800 mb-3">Upload Video</h3>
              {!fileUploaded ? (
                <>
                  <input
                    type="file"
                    accept="video/*"
                    className="hidden"
                    id="create-video-file"
                    onChange={handleFileSelect}
                  />
                  <label
                    htmlFor="create-video-file"
                    className="w-full flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50/50 p-12 text-gray-400 hover:border-[#2563EB] hover:text-[#2563EB] hover:bg-blue-50/20 transition-all cursor-pointer"
                  >
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gray-100 mb-3">
                      <Upload className="h-6 w-6" />
                    </div>
                    <p className="text-sm text-gray-600" style={{ fontWeight: 500 }}>
                      Drop video here or click to browse
                    </p>
                    <p className="text-xs text-gray-400 mt-1">Supports MP4, MOV, WebM &middot; Max 500MB</p>
                  </label>
                </>
              ) : (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/30 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
                      <FileVideo className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-800" style={{ fontWeight: 500 }}>
                        {fileName}
                      </p>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <HardDrive className="h-3 w-3" />
                          {fileSize}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock className="h-3 w-3" />
                          {fileDuration}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <Monitor className="h-3 w-3" />
                          {fileResolution}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setVideoFile(null); setFileUploaded(false); setFileName(''); setFileSize(''); }}
                      className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}
            </GlassCard>

            {/* Video Settings */}
            <GlassCard className="p-5">
              <h3 className="text-gray-800 mb-4">Video Details</h3>
              <div className="space-y-4">
                {/* Title */}
                <div>
                  <label className="text-xs text-gray-500 mb-1.5 block">Video Title</label>
                  <input
                    value={videoTitle}
                    onChange={(e) => setVideoTitle(e.target.value)}
                    placeholder={`${person.company} — ${person.name.split(' ')[0]}`}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-[#2563EB] transition-colors"
                  />
                </div>

                {/* CTA Type */}
                <div>
                  <label className="text-xs text-gray-500 mb-1.5 block">CTA Type</label>
                  <div className="relative">
                    <select
                      value={ctaType}
                      onChange={(e) => {
                        const val = e.target.value as typeof ctaType;
                        setCtaType(val);
                        if (val === 'book_12_min') setCtaLabel('Book 12 minutes');
                        else if (val === 'reply') setCtaLabel('Reply');
                        else setCtaLabel('Forward to right person');
                      }}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-[#2563EB] appearance-none"
                    >
                      <option value="book_12_min">Book 12 min</option>
                      <option value="reply">Reply</option>
                      <option value="forward">Forward to right person</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Calendar Link */}
                {ctaType === 'book_12_min' && (
                  <div>
                    <label className="text-xs text-gray-500 mb-1.5 block">Calendar Link</label>
                    <input
                      value={calendarLink}
                      onChange={(e) => setCalendarLink(e.target.value)}
                      placeholder="https://cal.com/you/12min"
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-[#2563EB] transition-colors"
                    />
                  </div>
                )}

                {/* CTA Label */}
                <div>
                  <label className="text-xs text-gray-500 mb-1.5 block">CTA Button Label</label>
                  <input
                    value={ctaLabel}
                    onChange={(e) => setCtaLabel(e.target.value)}
                    placeholder="Book 12 minutes"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-[#2563EB] transition-colors"
                  />
                </div>
              </div>

              {/* Note */}
              <div className="flex items-start gap-2 mt-4 rounded-lg bg-blue-50 border border-blue-100 p-2.5">
                <Video className="h-3.5 w-3.5 text-blue-500 mt-0.5 shrink-0" />
                <p className="text-[11px] text-blue-700">
                  No attachments. Email will use a GIF preview + hosted landing page link.
                </p>
              </div>
            </GlassCard>
          </div>
        )}

        {/* Step 3: Processing → Ready */}
        {currentStep === 3 && person && (
          <div className="space-y-5">
            {processingPhase !== 'done' && processingPhase !== 'error' && (
              <ProcessingState phase={processingPhase} progress={progress} onComeBackLater={() => router.push('/videos')} />
            )}

            {processingPhase === 'done' && createdVideo && (
              <ReadyState
                person={person as any}
                videoTitle={videoTitle}
                ctaLabel={ctaLabel}
                createdVideo={createdVideo}
                onMarkSent={async () => {
                  const res = await fetch(`/api/videos/${createdVideo.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: 'sent' }),
                  });
                  if (res.ok) toast.success('Marked as sent');
                  router.push('/videos');
                }}
                onOpenLanding={() => {
                  const url = typeof window !== 'undefined' ? `${window.location.origin}/share/${createdVideo.public_token}` : '';
                  if (url) window.open(url, '_blank');
                }}
              />
            )}

            {processingPhase === 'error' && (
              <ErrorState
                message={generateError ?? undefined}
                onRetry={() => { setProcessingPhase('uploading'); setGenerateError(null); }}
              />
            )}
          </div>
        )}

        {/* Navigation */}
        {(currentStep < 3 || processingPhase === 'done') && (
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <button
              onClick={() => {
                if (currentStep === 1) router.push('/videos');
                else setCurrentStep(currentStep - 1);
              }}
              className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              {currentStep === 1 ? 'Cancel' : 'Back'}
            </button>
            <div className="flex items-center gap-2">
              {currentStep === 2 && (
                <button
                  type="button"
                  onClick={handleGenerateClick}
                  disabled={!canProceed()}
                  className="flex items-center gap-1.5 rounded-xl bg-[#2563EB] px-5 py-2.5 text-sm text-white hover:bg-[#1D4ED8] transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Video className="h-4 w-4" />
                  Generate Landing Page + GIF
                </button>
              )}
              {currentStep === 1 && (
                <button
                  onClick={() => setCurrentStep(2)}
                  disabled={!canProceed()}
                  className="flex items-center gap-1.5 rounded-xl bg-[#2563EB] px-4 py-2.5 text-sm text-white hover:bg-[#1D4ED8] transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Processing State ─── */
function ProcessingState({
  phase,
  progress,
  onComeBackLater,
}: {
  phase: ProcessingPhase;
  progress: number;
  onComeBackLater: () => void;
}) {
  const phaseLabels: Record<string, string> = {
    uploading: 'Uploading video...',
    generating_gif: 'Generating GIF preview...',
    creating_landing: 'Creating landing page...',
  };

  const phaseSteps = [
    { key: 'uploading', label: 'Upload video' },
    { key: 'generating_gif', label: 'Generate GIF preview' },
    { key: 'creating_landing', label: 'Create landing page' },
  ];

  const currentIdx = phaseSteps.findIndex((s) => s.key === phase);

  return (
    <GlassCard className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50">
          <Loader2 className="h-5 w-5 text-amber-500 animate-spin" />
        </div>
        <div>
          <h3 className="text-gray-800">{phaseLabels[phase] || 'Processing...'}</h3>
          <p className="text-xs text-gray-400">This usually takes 15-30 seconds</p>
        </div>
        <VideoStatusChip status="processing" />
      </div>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-gray-500">{phaseLabels[phase]}</span>
          <span className="text-xs text-gray-400">{progress}%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#FFD600] rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Step list */}
      <div className="space-y-3">
        {phaseSteps.map((step, i) => (
          <div key={step.key} className="flex items-center gap-3">
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-full shrink-0 ${
                i < currentIdx
                  ? 'bg-emerald-100'
                  : i === currentIdx
                  ? 'bg-amber-100'
                  : 'bg-gray-100'
              }`}
            >
              {i < currentIdx ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              ) : i === currentIdx ? (
                <Loader2 className="h-3.5 w-3.5 text-amber-500 animate-spin" />
              ) : (
                <span className="text-xs text-gray-400">{i + 1}</span>
              )}
            </div>
            <span className={`text-sm ${i <= currentIdx ? 'text-gray-700' : 'text-gray-400'}`}>
              {step.label}
            </span>
          </div>
        ))}
      </div>

      {/* Skeleton preview */}
      <div className="mt-6 rounded-xl border border-gray-100 bg-gray-50/50 p-4">
        <div className="flex gap-4">
          <div className="w-32 h-20 rounded-lg bg-gray-200 animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
            <div className="h-2 w-32 bg-gray-100 rounded animate-pulse" />
            <div className="h-2 w-20 bg-gray-100 rounded animate-pulse" />
          </div>
        </div>
      </div>

      <button
        onClick={onComeBackLater}
        className="mt-4 text-xs text-gray-400 hover:text-gray-600 transition-colors"
      >
        I'll come back later (saves as draft)
      </button>
    </GlassCard>
  );
}

/* ─── Ready State ─── */
type ReadyStatePerson = { name: string; company: string; email: string; id?: string; title?: string; linkedin?: string; emailStatus?: string };

function ReadyState({
  person,
  videoTitle,
  ctaLabel,
  createdVideo,
  onMarkSent,
  onOpenLanding,
}: {
  person: ReadyStatePerson;
  videoTitle: string;
  ctaLabel: string;
  createdVideo: { id: string; public_token: string; gif_path?: string | null };
  onMarkSent: () => void | Promise<void>;
  onOpenLanding: () => void;
}) {
  const landingUrl = typeof window !== 'undefined' ? `${window.location.origin}/share/${createdVideo.public_token}` : '';
  const subjectLine = `Quick idea for ${person.company}, ${person.name.split(' ')[0]}`;
  const hasGif = !!createdVideo.gif_path;
  const supabaseUrl = typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_SUPABASE_URL : '';
  const gifUrl = hasGif && supabaseUrl && createdVideo.gif_path
    ? `${supabaseUrl.replace(/\/$/, '')}/storage/v1/object/public/gifs/${createdVideo.gif_path}`
    : null;

  return (
    <div className="space-y-5">
      {/* Success header */}
      <GlassCard className="p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          </div>
          <div className="flex-1">
            <h3 className="text-gray-800">Video Ready!</h3>
            <p className="text-xs text-gray-400">
              {hasGif ? 'Landing page + GIF preview generated' : 'Landing page ready (video thumbnail as preview)'}
            </p>
          </div>
          <VideoStatusChip status="ready" size="md" />
        </div>

        {/* Preview area */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Thumbnail / GIF Preview */}
          <div className="rounded-xl border border-gray-200 overflow-hidden">
            <div className="text-[10px] text-gray-400 px-3 py-1.5 bg-gray-50 border-b border-gray-100">
              {hasGif ? 'GIF Preview' : 'Thumbnail'}
            </div>
            <div className="relative aspect-video bg-gray-100 flex items-center justify-center overflow-hidden">
              {gifUrl ? (
                <img src={gifUrl} alt="Video GIF preview" className="w-full h-full object-contain" />
              ) : (
                <div className="w-[75%] h-[75%] rounded-lg border border-gray-200 bg-white shadow-sm flex items-center justify-center text-gray-400 text-xs">
                  No preview (GIF generation skipped)
                </div>
              )}
            </div>
          </div>

          {/* Landing page preview */}
          <div className="rounded-xl border border-gray-200 overflow-hidden">
            <div className="text-[10px] text-gray-400 px-3 py-1.5 bg-gray-50 border-b border-gray-100">
              Video thumbnail (poster on landing page)
            </div>
            <div className="relative aspect-video bg-gray-100 flex items-center justify-center overflow-hidden">
              {gifUrl ? (
                <img src={gifUrl} alt="Landing page poster" className="w-full h-full object-contain" />
              ) : (
                <div className="w-[75%] h-[75%] rounded-lg border border-gray-200 bg-white shadow-sm flex items-center justify-center text-gray-400 text-xs text-center px-2">
                  Video plays on share page
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Landing Page URL */}
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <ExternalLink className="h-4 w-4 text-gray-400 shrink-0" />
            <span className="text-sm text-[#2563EB] truncate">{landingUrl}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <CopyButton text={landingUrl} variant="ghost" label="Copy" toastMessage="Landing page link copied" />
            <button
              onClick={onOpenLanding}
              className="flex items-center gap-1 rounded-lg bg-gray-100 px-2.5 py-1 text-xs text-gray-600 hover:bg-gray-200 transition-colors"
            >
              <ExternalLink className="h-3 w-3" />
              Preview
            </button>
          </div>
        </div>
      </GlassCard>

      {/* Email Snippet Panel */}
      <EmailSnippetPanel
        recipientName={person.name}
        company={person.company}
        subjectLine={subjectLine}
        landingPageSlug={createdVideo.public_token}
        landingUrl={landingUrl}
        recipientEmail={person.email}
        videoId={createdVideo.id}
        ctaLabel={ctaLabel}
        onMarkedSent={onMarkSent}
      />

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenLanding}
          className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <ExternalLink className="h-4 w-4" />
          Open landing page preview
        </button>
      </div>
    </div>
  );
}

/* ─── Error State ─── */
function ErrorState({ message, onRetry }: { message?: string; onRetry: () => void }) {
  return (
    <GlassCard className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50">
          <AlertCircle className="h-5 w-5 text-red-500" />
        </div>
        <div>
          <h3 className="text-gray-800">Something went wrong</h3>
          <p className="text-xs text-red-400">{message || 'GIF generation failed. Please try again.'}</p>
        </div>
      </div>
      <div className="rounded-xl border border-red-200 bg-red-50/50 p-4 mb-4">
        <p className="text-sm text-red-700">
          {message
            ? message
            : "We couldn't generate the GIF preview from your video. This can happen with unsupported codecs or corrupted files."}
        </p>
        <p className="text-xs text-red-500 mt-2">
          Try re-uploading or contact{' '}
          <span className="underline cursor-pointer">support@withtwill.com</span>
        </p>
      </div>
      <button
        onClick={onRetry}
        className="flex items-center gap-1.5 rounded-xl bg-[#2563EB] px-4 py-2.5 text-sm text-white hover:bg-[#1D4ED8] transition-all"
      >
        <RefreshCw className="h-4 w-4" />
        Retry
      </button>
    </GlassCard>
  );
}