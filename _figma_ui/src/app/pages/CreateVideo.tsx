import { useState, useEffect, useCallback } from 'react';
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
  ExternalLink, Play, RefreshCw, Calendar,
} from 'lucide-react';

const steps = [
  { id: 1, label: 'Select Recipient' },
  { id: 2, label: 'Upload Video' },
  { id: 3, label: 'Generate & Send' },
];

type ProcessingPhase = 'uploading' | 'generating_gif' | 'creating_landing' | 'done' | 'error';

export function CreateVideo() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const prefilledPersonId = searchParams.get('person');
  const [currentStep, setCurrentStep] = useState(prefilledPersonId ? 1 : 1);

  // Step 1
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPerson, setSelectedPerson] = useState<string | null>(prefilledPersonId);
  const [addCC, setAddCC] = useState(false);

  // Step 2
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

  const filteredPeople = people.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const person = people.find((p) => p.id === selectedPerson);

  // Notify when person is pre-filled from URL
  useEffect(() => {
    if (prefilledPersonId) {
      const p = people.find(pp => pp.id === prefilledPersonId);
      if (p) {
        toast.success(`Recipient pre-filled: ${p.name}`, {
          description: `${p.title} at ${p.company}`,
        });
      }
    }
  }, [prefilledPersonId]);

  // Auto-generate title
  useEffect(() => {
    if (person && !videoTitle) {
      setVideoTitle(`${person.company} — ${person.name.split(' ')[0]}`);
    }
  }, [person, videoTitle]);

  // Simulate processing
  useEffect(() => {
    if (currentStep !== 3) return;
    setProcessingPhase('uploading');
    setProgress(0);

    const phases: { phase: ProcessingPhase; delay: number }[] = [
      { phase: 'uploading', delay: 1200 },
      { phase: 'generating_gif', delay: 2000 },
      { phase: 'creating_landing', delay: 1500 },
      { phase: 'done', delay: 0 },
    ];

    let timeout: ReturnType<typeof setTimeout>;
    let currentIndex = 0;

    const advancePhase = () => {
      if (currentIndex < phases.length) {
        setProcessingPhase(phases[currentIndex].phase);
        setProgress(Math.round(((currentIndex + 1) / phases.length) * 100));
        if (currentIndex < phases.length - 1) {
          timeout = setTimeout(() => {
            currentIndex++;
            advancePhase();
          }, phases[currentIndex].delay);
        }
      }
    };

    advancePhase();
    return () => clearTimeout(timeout);
  }, [currentStep]);

  const handleFileDrop = useCallback(() => {
    setFileName('prospect-video-2026.mp4');
    setFileSize('12.4 MB');
    setFileDuration('1:02');
    setFileResolution('1920 x 1080');
    setFileUploaded(true);
  }, []);

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
            onClick={() => navigate('/videos')}
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
                        label={p.emailStatus}
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
                        label={person.emailStatus}
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
                <button
                  onClick={handleFileDrop}
                  className="w-full flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50/50 p-12 text-gray-400 hover:border-[#2563EB] hover:text-[#2563EB] hover:bg-blue-50/20 transition-all cursor-pointer"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gray-100 mb-3">
                    <Upload className="h-6 w-6" />
                  </div>
                  <p className="text-sm text-gray-600" style={{ fontWeight: 500 }}>
                    Drop video here or click to browse
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Supports MP4, MOV, WebM &middot; Max 500MB</p>
                </button>
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
                      onClick={() => setFileUploaded(false)}
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
              <ProcessingState phase={processingPhase} progress={progress} onComeBackLater={() => navigate('/videos')} />
            )}

            {processingPhase === 'done' && (
              <ReadyState
                person={person}
                videoTitle={videoTitle}
                ctaLabel={ctaLabel}
                onMarkSent={() => navigate('/videos')}
                onOpenLanding={() => navigate('/videos/landing-preview')}
              />
            )}

            {processingPhase === 'error' && (
              <ErrorState onRetry={() => setProcessingPhase('uploading')} />
            )}
          </div>
        )}

        {/* Navigation */}
        {(currentStep < 3 || processingPhase === 'done') && (
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <button
              onClick={() => {
                if (currentStep === 1) navigate('/videos');
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
                  onClick={() => setCurrentStep(3)}
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
function ReadyState({
  person,
  videoTitle,
  ctaLabel,
  onMarkSent,
  onOpenLanding,
}: {
  person: (typeof people)[0];
  videoTitle: string;
  ctaLabel: string;
  onMarkSent: () => void;
  onOpenLanding: () => void;
}) {
  const slug = `twill-${person.name.split(' ')[0].toLowerCase()}-${person.company.toLowerCase().replace(/\s+/g, '')}`;
  const landingUrl = `https://watch.withtwill.com/${slug}`;
  const subjectLine = `Quick idea for ${person.company}, ${person.name.split(' ')[0]}`;

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
            <p className="text-xs text-gray-400">Landing page + GIF preview generated</p>
          </div>
          <VideoStatusChip status="ready" size="md" />
        </div>

        {/* Preview area */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Thumbnail */}
          <div className="rounded-xl border border-gray-200 overflow-hidden">
            <div className="text-[10px] text-gray-400 px-3 py-1.5 bg-gray-50 border-b border-gray-100">
              Thumbnail
            </div>
            <div className="relative aspect-video bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center">
              <div className="w-[75%] h-[75%] rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
                <div className="h-4 bg-gray-800 flex items-center px-1.5 gap-0.5">
                  <div className="w-1 h-1 rounded-full bg-red-400" />
                  <div className="w-1 h-1 rounded-full bg-yellow-400" />
                  <div className="w-1 h-1 rounded-full bg-green-400" />
                </div>
                <div className="p-2 space-y-1">
                  <div className="h-1 w-10 bg-gray-200 rounded" />
                  <div className="h-0.5 w-14 bg-gray-100 rounded" />
                </div>
              </div>
              <div className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-white shadow flex items-center justify-center">
                <span className="text-[7px] text-white" style={{ fontWeight: 600 }}>
                  AK
                </span>
              </div>
            </div>
          </div>

          {/* GIF Preview */}
          <div className="rounded-xl border border-gray-200 overflow-hidden">
            <div className="text-[10px] text-gray-400 px-3 py-1.5 bg-gray-50 border-b border-gray-100">
              GIF Preview (clickable)
            </div>
            <div className="relative aspect-video bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center cursor-pointer group">
              <div className="w-[75%] h-[75%] rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
                <div className="h-4 bg-gray-800 flex items-center px-1.5 gap-0.5">
                  <div className="w-1 h-1 rounded-full bg-red-400" />
                  <div className="w-1 h-1 rounded-full bg-yellow-400" />
                  <div className="w-1 h-1 rounded-full bg-green-400" />
                </div>
                <div className="p-2 space-y-1">
                  <div className="h-1 w-10 bg-gray-200 rounded" />
                  <div className="h-0.5 w-14 bg-gray-100 rounded" />
                  <div className="mt-0.5 px-0.5 py-0.5 rounded bg-[#FFD600]/20 border border-[#FFD600]/40">
                    <div className="h-0.5 w-6 bg-[#FFD600]/60 rounded" />
                  </div>
                </div>
              </div>
              <div className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-white shadow flex items-center justify-center">
                <span className="text-[7px] text-white" style={{ fontWeight: 600 }}>
                  AK
                </span>
              </div>
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/10">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow">
                  <Play className="h-3 w-3 text-gray-700 ml-0.5" fill="currentColor" />
                </div>
              </div>
              {/* Animated GIF indicator */}
              <div className="absolute top-2 left-2 rounded-md bg-[#FFD600] px-1.5 py-0.5">
                <span className="text-[9px] text-gray-900" style={{ fontWeight: 600 }}>
                  GIF
                </span>
              </div>
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
        landingPageSlug={slug}
        ctaLabel={ctaLabel}
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
        <button
          onClick={onMarkSent}
          className="flex items-center gap-1.5 rounded-xl bg-[#2563EB] px-5 py-2.5 text-sm text-white hover:bg-[#1D4ED8] transition-all shadow-sm"
        >
          <CheckCircle2 className="h-4 w-4" />
          Mark as Sent
        </button>
      </div>
    </div>
  );
}

/* ─── Error State ─── */
function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <GlassCard className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50">
          <AlertCircle className="h-5 w-5 text-red-500" />
        </div>
        <div>
          <h3 className="text-gray-800">Something went wrong</h3>
          <p className="text-xs text-gray-400">GIF generation failed. Please try again.</p>
        </div>
      </div>
      <div className="rounded-xl border border-red-200 bg-red-50/50 p-4 mb-4">
        <p className="text-sm text-red-700">
          We couldn't generate the GIF preview from your video. This can happen with unsupported codecs or
          corrupted files.
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