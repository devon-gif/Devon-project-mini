import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

interface CopyButtonProps {
  text: string;
  label?: string;
  toastMessage?: string;
  variant?: 'default' | 'primary' | 'ghost' | 'icon';
  className?: string;
}

export function CopyButton({
  text,
  label,
  toastMessage = 'Copied to clipboard',
  variant = 'default',
  className = '',
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success(toastMessage);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  const baseStyles: Record<string, string> = {
    default:
      'flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all',
    primary:
      'flex items-center gap-1.5 rounded-xl bg-[#2563EB] px-3 py-2 text-sm text-white hover:bg-[#1D4ED8] transition-all',
    ghost:
      'flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all',
    icon:
      'flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-all',
  };

  return (
    <button onClick={handleCopy} className={`${baseStyles[variant]} ${className}`}>
      {copied ? (
        <Check className={variant === 'icon' ? 'h-3.5 w-3.5 text-emerald-500' : 'h-3.5 w-3.5 text-emerald-500'} />
      ) : (
        <Copy className={variant === 'icon' ? 'h-3.5 w-3.5' : 'h-3.5 w-3.5'} />
      )}
      {label && <span>{copied ? 'Copied!' : label}</span>}
    </button>
  );
}
