import { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export function GlassCard({ children, className = '', hover = false, onClick }: GlassCardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        relative rounded-2xl border border-gray-200
        bg-white
        shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_16px_rgba(0,0,0,0.04)]
        dark:shadow-[0_1px_3px_rgba(0,0,0,0.2),0_4px_16px_rgba(0,0,0,0.15)]
        ${hover ? 'cursor-pointer transition-all duration-200 hover:shadow-[0_4px_24px_rgba(0,0,0,0.08)] hover:border-gray-300 dark:hover:shadow-[0_4px_24px_rgba(0,0,0,0.3)]' : ''}
        ${className}
      `}
    >
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export function GlassPanel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`relative rounded-xl border border-gray-200 bg-white ${className}`}>
      {children}
    </div>
  );
}