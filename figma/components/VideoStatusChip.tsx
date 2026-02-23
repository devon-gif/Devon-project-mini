import {
  FileEdit, Loader2, CheckCircle2, Send, Eye,
  MousePointerClick, CalendarCheck,
} from 'lucide-react';

type VideoStatus = 'draft' | 'processing' | 'ready' | 'sent' | 'viewed' | 'clicked' | 'booked';

const statusConfig: Record<VideoStatus, { label: string; icon: typeof Send; bg: string; text: string; border: string; dot?: string }> = {
  draft: { label: 'Draft', icon: FileEdit, bg: 'bg-gray-50', text: 'text-gray-500', border: 'border-gray-200' },
  processing: { label: 'Processing', icon: Loader2, bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200', dot: 'bg-amber-400' },
  ready: { label: 'Ready', icon: CheckCircle2, bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200', dot: 'bg-emerald-400' },
  sent: { label: 'Sent', icon: Send, bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
  viewed: { label: 'Viewed', icon: Eye, bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200' },
  clicked: { label: 'Clicked', icon: MousePointerClick, bg: 'bg-[#FFF9DB]', text: 'text-[#8B6914]', border: 'border-[#FFD600]/30' },
  booked: { label: 'Booked', icon: CalendarCheck, bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
};

interface VideoStatusChipProps {
  status: VideoStatus;
  size?: 'sm' | 'md';
}

export function VideoStatusChip({ status, size = 'sm' }: VideoStatusChipProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <span className={`
      inline-flex items-center gap-1 rounded-full border
      ${config.bg} ${config.text} ${config.border}
      ${size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'}
    `}>
      <Icon className={`${size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5'} ${status === 'processing' ? 'animate-spin' : ''}`} />
      {config.label}
    </span>
  );
}
