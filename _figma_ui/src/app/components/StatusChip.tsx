interface StatusChipProps {
  label: string;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'accent';
}

const variantStyles: Record<string, string> = {
  default: 'bg-gray-100 text-gray-600 border-gray-200',
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
  danger: 'bg-red-50 text-red-700 border-red-200',
  info: 'bg-blue-50 text-blue-700 border-blue-200',
  purple: 'bg-blue-50 text-blue-700 border-blue-200',
  accent: 'bg-[#FFF9DB] text-[#8B6914] border-[#FFD600]/30',
};

export function StatusChip({ label, variant = 'default' }: StatusChipProps) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs ${variantStyles[variant]}`}>
      {label}
    </span>
  );
}

export function TierBadge({ tier }: { tier: 'P0' | 'P1' | 'P2' }) {
  const styles = {
    P0: 'bg-[#FFF9DB] text-[#8B6914] border-[#FFD600]/30',
    P1: 'bg-blue-50 text-blue-700 border-blue-200',
    P2: 'bg-gray-100 text-gray-500 border-gray-200',
  };
  return (
    <span className={`inline-flex items-center rounded-md border px-1.5 py-0.5 text-xs ${styles[tier]}`}>
      {tier}
    </span>
  );
}
