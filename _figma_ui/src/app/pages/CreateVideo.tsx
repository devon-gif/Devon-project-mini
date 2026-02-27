import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
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
  ExternalLink, Play, RefreshCw,
} from 'lucide-react';

const steps = [
  { id: 1, label: 'Select Recipient' },
  { id: 2, label: 'Upload Video' },
  { id: 3, label: 'Generate & Send' },
];

type ProcessingPhase = 'uploading' | 'creating_landing' | 'done' | 'error';

// ── helpers ────────────────────────────────────────────────────────────────
const BASE = typeof window !== 'undefined' ? window.location.origin : '';

// ─── component ───────────────────────────────────────────────────────────────
export function CreateVideo() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const prefilledPersonId = searchParams.get('person');
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPerson, setSelectedPerson] = useState<string | null>(prefilledPersonId);
  const [addCC, setAddCC] = useState(false);

  // Step 2 — real file state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [videoTitle, setVideoTitle] = useState('');
  const [ctaType, setCtaType] = useState<'book_12_min' | 'reply' | 'forward'>('book_12_min');
  const [calendarLink, setCalendarLink] = useState('https://cal.com/alexkim/12min');
  const [ctaLabel, setCtaLabel] = useState('Book 12 minutes');

  // Step 3 — real API state
  const [processingPhase, setProcessingPhase] = useState<ProcessingPhase>('uploading');
  const [progress, setProgress] = useState(0);
  const [shareUrl, setShareUrl] = useState('');
  const [videoId, setVideoId] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const filteredPeople = people.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const person = people.find((p) => p.id === selectedPerson);

  useEffect(() => {
    if (prefilledPersonId) {
      const p = people.find((pp) => pp.id === prefilledPersonId);
      if (p) toast.success(`Recipient pre-filled: ${p.name}`, { description: `${p.title} at ${p.company}` });
    }
  }, [prefilledPersonId]);

  useEffect(() => {
    if (person && !videoTitle) {
      setVideoTitle(`${person.company} — ${person.name.split(' ')[0]}`);
    }
  }, [person, videoTitle]);

  // ── Real upload flow ───────────────────────────────────────────────────────
  const runUpload = useCallback(async () => {
    if (!person || !videoFile) return;

    setProcessingPhase('uploading');
    setProgress(10);
    setErrorMessage('');

    try {
      // 1. Create the DB row
      const createRes = await fetch('/api/videos/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: videoTitle || `${person.company} — ${person.name.split(' ')[0]}`,
          recipient_name: person.name,
          recipient_company: person.company,
          recipient_email: (person as { email?: string }).email ?? null,
          cta_url: ctaType === 'book_12_min' ? calendarLink : null,
          cta_label: ctaLabel,
        }),
      });

      if (!createRes.ok) {
        const err = await createRes.json().catch(() => ({}));
        throw new Error(err.error ?? `Create failed: ${createRes.status}`);
      }

      const { video } = await createRes.json();
      if (!video?.id) throw new Error('No video ID returned from create');
      setVideoId(video.id);
      setProgress(30);

      // 2. Upload the video (and optional cover)
      setProcessingPhase('uploading');
      const form = new FormData();
      form.append('videoId', video.id);
      form.append('file', videoFile);
      if (coverFile) form.append('cover', coverFile);

      const uploadRes = await fetch('/api/videos/upload', {
        method: 'POST',
        body: form,
      });

      if (!uploadRes.ok) {
        const err = await uploadRes.json().catch(() => ({}));
        throw new Error(err.error ?? `Upload failed: ${uploadRes.status}`);
      }

      setProgress(80);
      setProcessingPhase('creating_landing');

      // Small pause so the user sees the "creating landing" step
      await new Promise((r) => setTimeout(r, 600));
      setProgress(100);

      // 3. Build the share URL from the token returned at create time
      const url = `${BASE}/share/${video.public_token}`;
      setShareUrl(url);
      setProcessingPhase('done');
    } catch (err: unknown) {
      console.error('[CreateVideo] upload error:', err);
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setErrorMessage(msg);
      setProcessingPhase('error');
      toast.error('Upload failed', { description: msg });
    }
  }, [person, videoFile, coverFile, videoTitle, ctaType, calendarLink, ctaLabel]);

  // Kick off upload when we reach step 3
  useEffect(() => {
    if (currentStep === 3) runUpload();
  }, [currentStep]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── File picking helpers ───────────────────────────────────────────────────
  const handleVideoPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setVideoFile(f);
  };

  const handleCoverPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setCoverFile(f);
  };

  const handleDrop = (e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) setVideoFile(f);
  };

  const canProceed = () => {
    if (currentStep === 1) return !!selectedPerson;
    if (currentStep === 2) return !!videoFile;
    return true;
  };

  const formatBytes = (n: number) => {
    if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
    return `${(n / 1024 / 1024).toFixed(1)} MB`;
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/videos')}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <div className="flex-1">
            <h1 className="text-gray-900">Create Video</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Upload a video, generate a landing page, copy email snippet
            </p>
          </div>
        </div>

        {/* Progress Stepper */}
        <div className="flex items-center gap-2">
          {steps.map((step, i) => (
            <div key={step.id} className="flex items-center gap-2 flex-1">
              <button
                onClick={() => { if (step.id < currentStep) setCurrentStep(step.id); }}
                className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition-all flex-1 ${
                  step.id === currentStep
                    ? 'bg-[#FFD600] text-gray-900 shadow-[0_2px_8px_rgba(255,214,0,0.25)]'
                    : step.id < currentStep
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                <div className={`flex h-6 w-6 items-center justify-center rounded-full text-xs shrink-0 ${
                  step.id < currentStep ? 'bg-emerald-500 text-white' : step.id === currentStep ? 'bg-gray-900 text-white' : 'bg-gray-300 text-white'
                }`}>
                  {step.id < currentStep ? <Check className="h-3 w-3" /> : step.id}
                </div>
                <span className="hidden sm:inline truncate">{step.label}</span>
              </button>
              {i < steps.length - 1 && <div className="h-px w-4 bg-gray-200 shrink-0 hidden lg:block" />}
            </div>
          ))}
        </div>

        {/* ── Step 1: Select Recipient ── */}
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
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-amber-100 text-xs text-gray-600 shrink-0" style={{ fontWeight: 600 }}>
                      {p.name.split(' ').map((n: string) => n[0]).join('')}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-gray-800" style={{ fontWeight: 500 }}>{p.name}</p>
                        {p.linkedin && <Linkedin className="h-3 w-3 text-blue-500" />}
                      </div>
                      <p className="text-xs text-gray-500 truncate">{p.title} &middot; {p.company}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <StatusChip label={p.emailStatus} variant={p.emailStatus === 'verified' ? 'success' : 'warning'} />
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

            {person && (
              <GlassCard className="p-5">
                <h3 className="text-gray-800 mb-3">Recipient</h3>
                <div className="flex items-center gap-3 rounded-xl border border-[#2563EB] bg-blue-50/30 p-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-amber-100 text-sm text-gray-600 shrink-0" style={{ fontWeight: 600 }}>
                    {person.name.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-800" style={{ fontWeight: 500 }}>{person.name}</p>
                    <p className="text-xs text-gray-500">{person.title} at {person.company}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <StatusChip label={person.emailStatus} variant={person.emailStatus === 'verified' ? 'success' : 'warning'} />
                      {person.linkedin && (
                        <span className="text-[11px] text-blue-500 flex items-center gap-0.5">
                          <Linkedin className="h-3 w-3" />LinkedIn
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4 rounded-xl border border-gray-100 bg-gray-50/50 px-3 py-2.5">
                  <div>
                    <p className="text-sm text-gray-700">Add internal CC</p>
                    <p className="text-[11px] text-gray-400">CC your manager or team on tracking</p>
                  </div>
                  <button
                    onClick={() => setAddCC(!addCC)}
                    className={`relative h-5 w-9 rounded-full transition-colors ${addCC ? 'bg-[#2563EB]' : 'bg-gray-300'}`}
                  >
                    <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${addCC ? 'left-[18px]' : 'left-0.5'}`} />
                  </button>
                </div>
              </GlassCard>
            )}
          </div>
        )}

        {/* ── Step 2: Upload Video ── */}
        {currentStep === 2 && person && (
          <div className="space-y-4">
            {/* Hidden file inputs */}
            <input ref={fileInputRef} type="file" accept="video/mp4,video/quicktime,video/webm" className="hidden" onChange={handleVideoPick} />
            <input ref={coverInputRef} type="file" accept="image/png" className="hidden" onChange={handleCoverPick} />

            <GlassCard className="p-5">
              <h3 className="text-gray-800 mb-3">Upload Video</h3>
              {!videoFile ? (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  onDrop={handleDrop}
                  onDragOver={(e) => e.preventDefault()}
                  className="w-full flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50/50 p-12 text-gray-400 hover:border-[#2563EB] hover:text-[#2563EB] hover:bg-blue-50/20 transition-all cursor-pointer"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gray-100 mb-3">
                    <Upload className="h-6 w-6" />
                  </div>
                  <p className="text-sm text-gray-600" style={{ fontWeight: 500 }}>Drop video here or click to browse</p>
                  <p className="text-xs text-gray-400 mt-1">Supports MP4, MOV, WebM &middot; Max 500MB</p>
                </button>
              ) : (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/30 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
                      <FileVideo className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-800" style={{ fontWeight: 500 }}>{videoFile.name}</p>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <HardDrive className="h-3 w-3" />{formatBytes(videoFile.size)}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <Monitor className="h-3 w-3" />{videoFile.type || 'video'}
                        </span>
                      </div>
                    </div>
                    <button onClick={() => setVideoFile(null)} className="text-xs text-gray-400 hover:text-red-500 transition-colors">
                      Remove
                    </button>
                  </div>
                </div>
              )}

              {/* Optional cover PNG */}
              <div className="mt-4">
                <p className="text-xs text-gray-500 mb-2">Cover image (optional PNG thumbnail)</p>
                {!coverFile ? (
                  <button
                    onClick={() => coverInputRef.current?.click()}
                    className="flex items-center gap-2 rounded-xl border border-dashed border-gray-200 px-4 py-2 text-xs text-gray-400 hover:border-[#2563EB] hover:text-[#2563EB] transition-all"
                  >
                    <Upload className="h-3.5 w-3.5" />Upload PNG cover
                  </button>
                ) : (
                  <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    <span className="text-xs text-gray-700 flex-1 truncate">{coverFile.name}</span>
                    <button onClick={() => setCoverFile(null)} className="text-xs text-gray-400 hover:text-red-500">Remove</button>
                  </div>
                )}
              </div>
            </GlassCard>

            <GlassCard className="p-5">
              <h3 className="text-gray-800 mb-4">Video Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-gray-500 mb-1.5 block">Video Title</label>
                  <input
                    value={videoTitle}
                    onChange={(e) => setVideoTitle(e.target.value)}
                    placeholder={`${person.company} — ${person.name.split(' ')[0]}`}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-[#2563EB] transition-colors"
                  />
                </div>
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
              <div className="flex items-start gap-2 mt-4 rounded-lg bg-blue-50 border border-blue-100 p-2.5">
                <Video className="h-3.5 w-3.5 text-blue-500 mt-0.5 shrink-0" />
                <p className="text-[11px] text-blue-700">
                  No attachments. Email will use a hosted landing page link with the video embedded.
                </p>
              </div>
            </GlassCard>
          </div>
        )}

        {/* ── Step 3: Processing → Ready ── */}
        {currentStep === 3 && person && (
          <div className="space-y-5">
            {processingPhase !== 'done' && processingPhase !== 'error' && (
              <ProcessingState phase={processingPhase} progress={progress} onComeBackLater={() => navigate('/videos')} />
            )}
            {processingPhase === 'done' && (
              <ReadyState
                person={person}
                videoTitle={videoTitle}
                ctaLabel={ctaLabel}
                shareUrl={shareUrl}
                onMarkSent={() => navigate(videoId ? `/videos/${videoId}` : '/videos')}
                onOpenLanding={() => window.open(shareUrl, '_blank')}
              />
            )}
            {processingPhase === 'error' && (
              <ErrorState message={errorMessage} onRetry={() => { setCurrentStep(2); }} />
            )}
          </div>
        )}

        {/* Navigation */}
        {(currentStep < 3 || processingPhase === 'done') && (
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <button
              onClick={() => { if (currentStep === 1) navigate('/videos'); else setCurrentStep(currentStep - 1); }}
              className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              {currentStep === 1 ? 'Cancel' : 'Back'}
            </button>
            <div className="flex items-center gap-2">
              {currentStep === 2 && (
                <button
                  onClick={() => setCurrentStep(3)}
                  disabled={!canProceed()}
                  className="flex items-center gap-1.5 rounded-xl bg-[#2563EB] px-5 py-2.5 text-sm text-white hover:bg-[#1D4ED8] transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Video className="h-4 w-4" />
                  Upload &amp; Create Landing Page
                </button>
              )}
              {currentStep === 1 && (
                <button
                  onClick={() => setCurrentStep(2)}
                  disabled={!canProceed()}
                  className="flex items-center gap-1.5 rounded-xl bg-[#2563EB] px-4 py-2.5 text-sm text-white hover:bg-[#1D4ED8] transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next<ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ProcessingState({ phase, progress, onComeBackLater }: { phase: ProcessingPhase; progress: number; onComeBackLater: () => void }) {
  const phaseLabels: Record<string, string> = {
    uploading: 'Uploading video...',
    creating_landing: 'Creating landing page...',
  };
  const phaseSteps = [
    { key: 'uploading', label: 'Upload video to storage' },
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
          <p className="text-xs text-gray-400">Uploading to Supabase Storage…</p>
        </div>
        <VideoStatusChip status="processing" />
      </div>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-gray-500">{phaseLabels[phase]}</span>
          <span className="text-xs text-gray-400">{progress}%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-[#FFD600] rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </div>
      <div className="space-y-3">
        {phaseSteps.map((step, i) => (
          <div key={step.key} className="flex items-center gap-3">
            <div className={`flex h-7 w-7 items-center justify-center rounded-full shrink-0 ${i < currentIdx ? 'bg-emerald-100' : i === currentIdx ? 'bg-amber-100' : 'bg-gray-100'}`}>
              {i < currentIdx ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : i === currentIdx ? <Loader2 className="h-3.5 w-3.5 text-amber-500 animate-spin" /> : <span className="text-xs text-gray-400">{i + 1}</span>}
            </div>
            <span className={`text-sm ${i <= currentIdx ? 'text-gray-700' : 'text-gray-400"}`}>{step.label}</span>
          </div>
        ))}
      </div>
      <button onClick={onComeBackLater} className="mt-4 text-xs text-gray-400 hover:text-gray-600 transition-colors">
        I'll come back later
      </button>
    </GlassCard>
  );
}

function ReadyState({
  person, videoTitle, ctaLabel, shareUrl, onMarkSent, onOpenLanding,
}: {
  person: (typeof people)[0];
  videoTitle: string;
  ctaLabel: string;
  shareUrl: string;
  onMarkSent: () => void;
  onOpenLanding: () => void;
}) {
  const subjectLine = `Quick idea for ${person.company}, ${person.name.split(' ')[0]}`;

  return (
    <div className="space-y-5">
      <GlassCard className="p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          </div>
          <div className="flex-1">
            <h3 className="text-gray-800">Video Ready!</h3>
            <p className="text-xs text-gray-400">Video uploaded &amp; landing page live</p>
          </div>
          <VideoStatusChip status="ready" size="md" />
        </div>

        <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <ExternalLink className="h-4 w-4 text-gray-400 shrink-0" />
            <span className="text-sm text-[#2563EB] truncate">{shareUrl}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <CopyButton text={shareUrl} variant="ghost" label="Copy" toastMessage="Landing page link copied" />
            <button
              onClick={onOpenLanding}
              className="flex items-center gap-1 rounded-lg bg-gray-100 px-2.5 py-1 text-xs text-gray-600 hover:bg-gray-200 transition-colors"
            >
              <ExternalLink className="h-3 w-3" />Preview
            </button>
          </div>
        </div>
      </GlassCard>

      <EmailSnippetPanel
        recipientName={person.name}
        company={person.company}
        subjectLine={subjectLine}
        landingUrl={shareUrl}
        ctaLabel={ctaLabel}
      />

      <div className="flex items-center gap-3">
        <button
          onClick={onOpenLanding}
          className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <ExternalLink className="h-4 w-4" />Open landing page
        </button>
        <button
          onClick={onMarkSent}
          className="flex items-center gap-1.5 rounded-xl bg-[#2563EB] px-5 py-2.5 text-sm text-white hover:bg-[#1D4ED8] transition-all shadow-sm"
        >
          <CheckCircle2 className="h-4 w-4" />Mark as Sent
        </button>
      </div>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <GlassCard className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50">
          <AlertCircle className="h-5 w-5 text-red-500" />
        </div>
        <div>
          <h3 className="text-gray-800">Upload failed</h3>
          <p className="text-xs text-gray-400">Something went wrong uploading your video.</p>
        </div>
      </div>
      <div className="rounded-xl border border-red-200 bg-red-50/50 p-4 mb-4">
        <p className="text-sm text-red-700">{message || 'Unknown error. Please try again.'}</p>
      </div>
      <button
        onClick={onRetry}
        className="flex items-center gap-1.5 rounded-xl bg-[#2563EB] px-4 py-2.5 text-sm text-white hover:bg-[#1D4ED8] transition-all"
      >
        <RefreshCw className="h-4 w-4" />Go back &amp; retry
      </button>
    </GlassCard>
  );
}
