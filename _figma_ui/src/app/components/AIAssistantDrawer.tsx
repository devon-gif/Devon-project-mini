import { useState } from 'react';
import {
  X, Bot, Sparkles, Send, FileText, CheckSquare, RefreshCw,
  Loader2, MessageSquare, ListTodo, PenLine, ArrowRight,
  StickyNote, RotateCcw,
} from 'lucide-react';

interface AIAssistantDrawerProps {
  open: boolean;
  onClose: () => void;
}

type Tab = 'draft' | 'summarize' | 'tasks';

const tabs: { id: Tab; label: string; icon: typeof PenLine }[] = [
  { id: 'draft', label: 'Draft', icon: PenLine },
  { id: 'summarize', label: 'Summarize', icon: FileText },
  { id: 'tasks', label: 'Extract Tasks', icon: ListTodo },
];

export function AIAssistantDrawer({ open, onClose }: AIAssistantDrawerProps) {
  const [activeTab, setActiveTab] = useState<Tab>('draft');
  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState('');

  const draftResults: Record<Tab, string> = {
    draft: `Hi Tracy,\n\nI came across Zapier's remote-first culture and was impressed by how you've scaled to 800+ people while maintaining it. That's rare.\n\nAt Twill, we help companies like yours find vetted talent through warm referrals — cutting time-to-hire by 40% while preserving culture fit.\n\nGiven Zapier's bar for quality, I think this could be a natural fit. Worth a 15-min chat?\n\nBest,\nAlex`,
    summarize: `**Thread Summary:**\n- David Zhang (CPO, Databricks) responded enthusiastically to our outreach\n- Key signal: Budget approved for Q1, needs 100 ML engineers\n- He's looping in Lisa Nakamura to handle evaluation\n- Requested pricing overview + warm intro process details\n\n**Sentiment:** Very positive (Champion-level)\n**Next step:** Send proposal deck to Lisa, cc David`,
    tasks: `**Extracted Tasks:**\n\n1. Schedule demo call with Sarah Chen (Stripe) — Tuesday 2pm PT\n2. Send proposal + pricing to David Zhang (Databricks)\n3. Follow up with Lisa Nakamura on evaluation timeline\n4. Draft personalized outreach for Tracy St.Dic (Zapier)\n5. Research warm intro path to Jordan Kim (Linear)`,
  };

  const handleGenerate = () => {
    setGenerating(true);
    setResult('');
    setTimeout(() => {
      setResult(draftResults[activeTab]);
      setGenerating(false);
    }, 1200);
  };

  if (!open) return null;

  return (
    <div className="flex h-full w-[380px] shrink-0 flex-col border-l border-gray-200 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#2563EB] to-[#FFD600]">
            <Bot className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="text-sm text-gray-800" style={{ fontWeight: 500 }}>AI Assistant</span>
        </div>
        <button onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 transition-colors">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setResult(''); }}
            className={`flex flex-1 items-center justify-center gap-1.5 py-2.5 text-xs transition-colors ${
              activeTab === tab.id
                ? 'border-b-2 border-[#2563EB] text-[#2563EB]'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <tab.icon className="h-3.5 w-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {/* Context chips */}
        <div>
          <p className="text-[11px] text-gray-400 mb-2">Context (auto-detected)</p>
          <div className="flex flex-wrap gap-1.5">
            {['Tracy St.Dic', 'Zapier', 'Remote-First', 'VP-Level'].map(chip => (
              <span key={chip} className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] text-blue-600">{chip}</span>
            ))}
          </div>
        </div>

        {/* Prompt */}
        <div>
          <p className="text-[11px] text-gray-400 mb-1.5">
            {activeTab === 'draft' ? 'Outreach instructions' :
             activeTab === 'summarize' ? 'Thread or context to summarize' :
             'Context to extract tasks from'}
          </p>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={
              activeTab === 'draft' ? 'e.g. Cold intro, mention remote culture, keep it under 100 words...' :
              activeTab === 'summarize' ? 'Paste thread or leave blank to use current context...' :
              'Describe the thread or leave blank for auto-extraction...'
            }
            rows={3}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]/20 transition-colors resize-none"
          />
        </div>

        {/* Generate */}
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#2563EB] py-2.5 text-sm text-white hover:bg-[#1D4ED8] transition-all disabled:opacity-60"
        >
          {generating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              {activeTab === 'draft' ? 'Generate Draft' :
               activeTab === 'summarize' ? 'Summarize' : 'Extract Tasks'}
            </>
          )}
        </button>

        {/* Result */}
        {result && (
          <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-3.5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Sparkles className="h-3 w-3 text-blue-600" />
                <span className="text-[11px] text-blue-600" style={{ fontWeight: 500 }}>AI Result</span>
              </div>
              <button onClick={() => { setResult(''); handleGenerate(); }} className="text-[11px] text-gray-400 hover:text-gray-600 flex items-center gap-0.5">
                <RotateCcw className="h-2.5 w-2.5" />Regenerate
              </button>
            </div>
            <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
              {result}
            </div>
          </div>
        )}
      </div>

      {/* Action buttons (always visible at bottom) */}
      {result && (
        <div className="border-t border-gray-200 p-3 space-y-2">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider">Quick Actions</p>
          <div className="grid grid-cols-2 gap-2">
            <button className="flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white py-2 text-xs text-gray-600 hover:bg-gray-50 transition-colors">
              <Send className="h-3 w-3" />
              Insert draft
            </button>
            <button className="flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white py-2 text-xs text-gray-600 hover:bg-gray-50 transition-colors">
              <CheckSquare className="h-3 w-3" />
              Create task
            </button>
            <button className="flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white py-2 text-xs text-gray-600 hover:bg-gray-50 transition-colors">
              <RefreshCw className="h-3 w-3" />
              Update status
            </button>
            <button className="flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white py-2 text-xs text-gray-600 hover:bg-gray-50 transition-colors">
              <StickyNote className="h-3 w-3" />
              Persona notes
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
