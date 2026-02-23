import { useState, useRef, useEffect } from 'react';
import { GlassCard } from '../components/GlassCard';
import {
  Bot, Sparkles, Send, Mail, MessageSquare, CheckSquare,
  Lightbulb, Shield, AlertTriangle, Zap, TrendingUp,
  Clock, BarChart3, ChevronRight, Plus, Settings,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  actions?: { label: string; type: string }[];
}

const initialMessages: ChatMessage[] = [
  {
    id: '1',
    role: 'assistant',
    content: "Good morning, Alex! Here's your daily briefing:\n\n🔥 **3 hot accounts** need attention today\n📧 **2 new replies** in your inbox\n📋 **5 tasks** due today or overdue\n\nDavid Zhang at Databricks responded very positively — I'd recommend sending the pricing overview ASAP. Sarah Chen wants to schedule a demo for Tuesday.\n\nWhat would you like to work on?",
    timestamp: '9:00 AM',
    actions: [
      { label: 'Draft reply to David', type: 'draft' },
      { label: 'View today\'s tasks', type: 'tasks' },
      { label: 'Analyze reply rates', type: 'analytics' },
    ],
  },
];

const suggestions = [
  { icon: Mail, label: 'Draft outreach for new contact', description: 'Generate personalized email based on prospect data' },
  { icon: MessageSquare, label: 'Summarize email thread', description: 'Extract key points, objections, and next steps' },
  { icon: CheckSquare, label: 'Create tasks from emails', description: 'Auto-extract action items from conversations' },
  { icon: Lightbulb, label: 'Personalization assistant', description: 'Get 3 personalization bullets for any contact' },
  { icon: TrendingUp, label: 'Sequence optimizer', description: 'Detect low reply rates and suggest improvements' },
  { icon: Zap, label: 'Auto follow-up suggestions', description: 'Smart recommendations based on last touch + reply type' },
];

export function AIAgent() {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [guardrails, setGuardrails] = useState({
    noAutoSend: true,
    redFlags: true,
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: getAIResponse(input),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actions: [
          { label: 'Apply changes', type: 'apply' },
          { label: 'Edit draft', type: 'edit' },
        ],
      };
      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="flex h-full overflow-hidden">
      {/* Main chat area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-3 bg-white">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#2563EB] to-[#FFD600]">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-gray-800">AI Agent</h3>
              <p className="text-xs text-gray-400">Your intelligent CRM assistant</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs text-emerald-600">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Online
            </span>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 bg-gray-50/30">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              {msg.role === 'assistant' && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#2563EB] to-[#FFD600]">
                  <Bot className="h-4 w-4 text-white" />
                </div>
              )}
              <div className={`max-w-[70%] ${msg.role === 'user' ? 'ml-auto' : ''}`}>
                <div className={`rounded-2xl px-4 py-3 ${
                  msg.role === 'user'
                    ? 'bg-[#2563EB] text-white'
                    : 'border border-gray-200 bg-white'
                }`}>
                  <div className={`text-sm whitespace-pre-wrap leading-relaxed ${msg.role === 'assistant' ? 'text-gray-700' : ''}`}>
                    {msg.content.split('\n').map((line, i) => {
                      // Simple bold parsing
                      const parts = line.split(/\*\*(.*?)\*\*/g);
                      return (
                        <span key={i}>
                          {parts.map((part, j) => 
                            j % 2 === 1 ? <strong key={j} className={msg.role === 'assistant' ? 'text-gray-900' : 'text-white'}>{part}</strong> : part
                          )}
                          {i < msg.content.split('\n').length - 1 && <br />}
                        </span>
                      );
                    })}
                  </div>
                </div>
                {msg.actions && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {msg.actions.map((action) => (
                      <button
                        key={action.label}
                        className="rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors"
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                )}
                <span className="text-[10px] text-gray-400 mt-1 block">{msg.timestamp}</span>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#2563EB] to-[#FFD600]">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div className="rounded-2xl border border-gray-200 bg-white px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="h-2 w-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="h-2 w-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-gray-200 p-4 bg-white">
          <div className="flex items-end gap-3">
            <div className="flex-1 rounded-xl border border-gray-200 bg-white overflow-hidden">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder="Ask the AI agent anything..."
                rows={2}
                className="w-full bg-transparent px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 outline-none resize-none"
              />
              <div className="flex items-center gap-2 px-3 py-2 border-t border-gray-100">
                <button className="flex items-center gap-1 rounded-lg bg-blue-50 px-2 py-1 text-[11px] text-blue-600 hover:bg-blue-100 transition-colors">
                  <Sparkles className="h-3 w-3" />Draft outreach
                </button>
                <button className="flex items-center gap-1 rounded-lg bg-gray-50 px-2 py-1 text-[11px] text-gray-500 hover:bg-gray-100 transition-colors">
                  <MessageSquare className="h-3 w-3" />Summarize
                </button>
                <button className="flex items-center gap-1 rounded-lg bg-gray-50 px-2 py-1 text-[11px] text-gray-500 hover:bg-gray-100 transition-colors">
                  <CheckSquare className="h-3 w-3" />Extract tasks
                </button>
              </div>
            </div>
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#2563EB] text-white hover:bg-[#1D4ED8] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Right sidebar */}
      <div className="hidden xl:block w-[320px] border-l border-gray-200 bg-white overflow-y-auto">
        <div className="p-4 space-y-5">
          {/* Capabilities */}
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">Capabilities</p>
            <div className="space-y-2">
              {suggestions.map((s) => (
                <button
                  key={s.label}
                  onClick={() => setInput(s.label)}
                  className="flex w-full items-start gap-3 rounded-xl border border-gray-100 bg-gray-50/50 p-3 text-left hover:bg-gray-100/60 transition-colors group"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 group-hover:bg-blue-100 transition-colors">
                    <s.icon className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-gray-600">{s.label}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{s.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Guardrails */}
          <div>
            <div className="flex items-center gap-1.5 mb-3">
              <Shield className="h-3.5 w-3.5 text-amber-500" />
              <p className="text-xs text-gray-400 uppercase tracking-wider">Guardrails</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50/50 px-3 py-2.5">
                <div>
                  <p className="text-xs text-gray-600">Never auto-send</p>
                  <p className="text-[10px] text-gray-400">Require approval before sending</p>
                </div>
                <button
                  onClick={() => setGuardrails(g => ({ ...g, noAutoSend: !g.noAutoSend }))}
                  className={`relative h-5 w-9 rounded-full transition-colors ${guardrails.noAutoSend ? 'bg-emerald-500' : 'bg-gray-300'}`}
                >
                  <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${guardrails.noAutoSend ? 'left-[18px]' : 'left-0.5'}`} />
                </button>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50/50 px-3 py-2.5">
                <div>
                  <p className="text-xs text-gray-600">Red flag warnings</p>
                  <p className="text-[10px] text-gray-400">Flag risky claims or promises</p>
                </div>
                <button
                  onClick={() => setGuardrails(g => ({ ...g, redFlags: !g.redFlags }))}
                  className={`relative h-5 w-9 rounded-full transition-colors ${guardrails.redFlags ? 'bg-emerald-500' : 'bg-gray-300'}`}
                >
                  <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${guardrails.redFlags ? 'left-[18px]' : 'left-0.5'}`} />
                </button>
              </div>
            </div>
          </div>

          {/* Quick stats */}
          <GlassCard className="p-3">
            <div className="flex items-center gap-1.5 mb-2">
              <BarChart3 className="h-3.5 w-3.5 text-[#2563EB]" />
              <span className="text-xs text-gray-500">AI Activity Today</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Drafts generated', value: '7' },
                { label: 'Threads summarized', value: '4' },
                { label: 'Tasks created', value: '3' },
                { label: 'Suggestions made', value: '12' },
              ].map(stat => (
                <div key={stat.label} className="text-center rounded-lg bg-gray-50 py-2">
                  <p className="text-sm text-gray-800" style={{ fontWeight: 500 }}>{stat.value}</p>
                  <p className="text-[10px] text-gray-400">{stat.label}</p>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

function getAIResponse(input: string): string {
  const lower = input.toLowerCase();
  if (lower.includes('draft') || lower.includes('email') || lower.includes('outreach')) {
    return "Here's a personalized outreach draft:\n\n**Subject:** Quick question about [Company] hiring plans\n\nHi [First Name],\n\nI noticed [Company] recently [signal/trigger]. Congrats! Given the growth, I imagine finding quality engineering talent quickly is a real challenge.\n\nTwill connects companies with pre-vetted talent recommended by people they trust. Our clients typically see:\n• 40% faster time-to-hire\n• 3x higher conversion rates\n• 90% candidate satisfaction scores\n\nWorth a quick 15-min chat to see if this could help?\n\nBest,\nAlex";
  }
  if (lower.includes('summarize') || lower.includes('thread')) {
    return "**Thread Summary:**\n\n📌 **Key Points:**\n• Prospect is actively hiring and looking for solutions\n• Budget has been approved for Q1\n• They're evaluating 2-3 vendors\n\n⚠️ **Objections/Concerns:**\n• Want to understand pricing model\n• Need to involve team lead in decision\n\n✅ **Next Steps:**\n• Send pricing overview by EOD\n• Schedule follow-up call for next week\n• Prepare ROI case study";
  }
  if (lower.includes('task') || lower.includes('action')) {
    return "I've identified **3 action items** from your recent conversations:\n\n1. 📧 **Send proposal to David Zhang** (Databricks) — Due: Today\n2. 📞 **Schedule demo with Sarah Chen** (Stripe) — Due: Tuesday 2pm\n3. 📝 **Follow up with Marcus Johnson** (Notion) — Due: Tomorrow\n\nShall I create these as tasks?";
  }
  return "I can help with that! Here are some ways I can assist:\n\n• **Draft outreach emails** personalized to each prospect\n• **Summarize email threads** to extract key insights\n• **Create tasks** from conversations\n• **Suggest next best actions** based on engagement signals\n• **Optimize sequences** for better reply rates\n\nWhat would you like me to focus on?";
}
