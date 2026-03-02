import { Info } from 'lucide-react';

export function InfoTooltip({ text }: { text: string }) {
  return (
    <div className="group relative flex items-center">
      <Info className="h-3.5 w-3.5 text-gray-300 hover:text-[#2563EB] cursor-pointer transition-colors" />
      <div className="absolute bottom-full left-1/2 mb-2 hidden w-64 -translate-x-1/2 rounded-lg bg-gray-900 px-3 py-2 text-[11px] font-medium leading-relaxed text-white shadow-xl group-hover:block z-50">
        {text}
        {/* Little triangle pointer at the bottom */}
        <div className="absolute left-1/2 top-full -mt-1 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
      </div>
    </div>
  );
}
