import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Bot,
  User,
  ShieldCheck,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  Play,
  Mail,
  PhoneCall,
  Calendar,
  MessageSquare,
  Building2,
  Search,
  CheckCircle2,
  RefreshCw,
  Loader2,
  Mic,
  MicOff,
  PhoneOff,
  Volume2,
  Clock,
  Radio,
  X,
  FileText,
} from 'lucide-react';
import { AgentMessage, ApprovalAction, WorkspaceFeatures } from '../types';
import { ApprovalCard } from './ApprovalCard';

interface AITerminalProps {
  messages: AgentMessage[];
  pendingApprovals: ApprovalAction[];
  features: WorkspaceFeatures;
  onSendMessage: (message: string) => Promise<void>;
  onDecideApproval: (id: string, decision: 'approve' | 'reject', notes?: string) => Promise<void>;
  isLoading: boolean;
}

export const AITerminal: React.FC<AITerminalProps> = ({
  messages,
  pendingApprovals,
  features,
  onSendMessage,
  onDecideApproval,
  isLoading,
}) => {
  const [inputText, setInputText] = useState('');
  const [expandedTraceId, setExpandedTraceId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<'All' | 'Email' | 'Voice' | 'WhatsApp' | 'ERP' | 'Calendar' | 'Research'>('All');
  
  // Voice Call Simulator state
  const [isVoiceCallActive, setIsVoiceCallActive] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [voiceCallContact, setVoiceCallContact] = useState({
    name: 'Julian Montgomery',
    company: 'Vanguard Logistics Global',
    phone: '+1 (555) 438-9921',
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, pendingApprovals]);

  // Timer for active simulated voice call
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isVoiceCallActive) {
      timer = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(timer);
  }, [isVoiceCallActive]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    const msg = inputText;
    setInputText('');
    await onSendMessage(msg);
  };

  const sampleTriggers = [
    {
      label: 'Draft contract email to Julian (Vanguard)',
      prompt: 'Draft follow-up contract and proposed SLA pricing email to Julian Montgomery at Vanguard Logistics',
      icon: Mail,
      category: 'Email',
    },
    {
      label: 'Outbound voice call to Julian',
      prompt: 'Place an outbound voice call to Julian Montgomery at Vanguard Logistics to confirm fleet pilot parameters',
      icon: PhoneCall,
      category: 'Voice',
    },
    {
      label: 'WhatsApp message to Amara',
      prompt: 'Send WhatsApp message to Amara Okafor at BioHealth Instruments confirming ISO compliance verification',
      icon: MessageSquare,
      category: 'WhatsApp',
    },
    {
      label: 'Schedule Architecture Review',
      prompt: 'Schedule architecture review meeting on calendar with Julian Montgomery for next Tuesday 2 PM',
      icon: Calendar,
      category: 'Calendar',
    },
    {
      label: 'Generate ERP Invoice $48,000',
      prompt: 'Create an official billing invoice for Vanguard Logistics Global for $48,000 USD for Phase 1 Pilot',
      icon: Building2,
      category: 'ERP',
    },
    {
      label: 'Deep Market Research on Vanguard',
      prompt: 'Research Vanguard Logistics recent Series B press release and fleet scale',
      icon: Search,
      category: 'Research',
    },
  ];

  const filteredTriggers = sampleTriggers.filter(
    (t) => selectedCategory === 'All' || t.category === selectedCategory
  );

  const formatCallTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  const handleLaunchVoiceSimulator = (contactName = 'Julian Montgomery') => {
    setVoiceCallContact({
      name: contactName,
      company: 'Vanguard Logistics Global',
      phone: '+1 (555) 438-9921',
    });
    setIsVoiceCallActive(true);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Left Sidebar: Operational Triggers & Automation Quota */}
      <div className="lg:col-span-1 space-y-6">
        {/* Automation Engine Quotas */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
              Monthly Quotas ({features.tier})
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600">
              Reset in 14d
            </span>
          </div>

          <div className="mt-3 space-y-3">
            {/* Email */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-blue-600" />
                  Emails
                </span>
                <span className="font-mono text-slate-800">
                  {features.automation_usage.emails} / {features.automation_caps.emails}
                </span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, (features.automation_usage.emails / (features.automation_caps.emails || 1)) * 100)}%`,
                  }}
                />
              </div>
            </div>

            {/* WhatsApp / Messaging */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                  Messages
                </span>
                <span className="font-mono text-slate-800">
                  {features.automation_usage.messages} / {features.automation_caps.messages}
                </span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-600 h-full rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, (features.automation_usage.messages / (features.automation_caps.messages || 1)) * 100)}%`,
                  }}
                />
              </div>
            </div>

            {/* Calls */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600 flex items-center gap-1.5">
                  <PhoneCall className="w-3.5 h-3.5 text-purple-600" />
                  Voice Calls
                </span>
                <span className="font-mono text-slate-800">
                  {features.automation_usage.calls} / {features.automation_caps.calls}
                </span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-purple-600 h-full rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, (features.automation_usage.calls / (features.automation_caps.calls || 1)) * 100)}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Operational Triggers with Category filter */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                Operational Triggers
              </h3>
            </div>
            <button
              onClick={() => handleLaunchVoiceSimulator()}
              className="text-[10px] text-purple-700 bg-purple-50 hover:bg-purple-100 px-2 py-0.5 rounded border border-purple-200 font-medium flex items-center gap-1"
              title="Open real-time telephony simulator"
            >
              <Radio className="w-3 h-3 text-purple-600 animate-pulse" />
              Voice Simulator
            </button>
          </div>

          {/* Filter chips */}
          <div className="flex flex-wrap gap-1 text-[10px]">
            {['All', 'Email', 'Voice', 'WhatsApp', 'ERP', 'Calendar', 'Research'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat as any)}
                className={`px-2 py-0.5 rounded-md font-medium transition-colors ${
                  selectedCategory === cat
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            {filteredTriggers.map((t, idx) => {
              const Icon = t.icon;
              return (
                <button
                  key={idx}
                  onClick={() => onSendMessage(t.prompt)}
                  disabled={isLoading}
                  className="w-full text-left p-2.5 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40 text-xs text-slate-700 transition-all flex items-start gap-2 group disabled:opacity-50"
                >
                  <Icon className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium text-slate-800 group-hover:text-indigo-900 block leading-tight">
                      {t.label}
                    </span>
                    <span className="text-[10px] text-slate-500">{t.category} capability</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Security / Architecture Card */}
        <div className="bg-slate-900 text-slate-300 rounded-xl p-4 text-xs space-y-2.5 shadow-sm">
          <div className="flex items-center gap-2 text-white font-semibold text-xs pb-1 border-b border-slate-800">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Policy Engine Principle</span>
          </div>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            Per Section 4 of the architectural specification, the Policy Engine — <em>not the AI model</em> —
            decides whether an action needs approval. A model cannot be prompt-injected into bypassing the gate.
          </p>
          <div className="text-[10px] font-mono text-emerald-400 bg-slate-800/80 p-2 rounded border border-slate-700">
            Active Layer: Row-level tenant scope • Gated Outbound APIs
          </div>
        </div>
      </div>

      {/* Center Main: Interactive AI Terminal & Chat Stream */}
      <div className="lg:col-span-3 flex flex-col h-[750px] bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden relative">
        {/* Terminal Header */}
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Nexus Autonomous Agent</h2>
              <p className="text-[11px] text-slate-500">Live Orchestration Stream • Direct System of Record Link</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs">
            {pendingApprovals.length > 0 && (
              <span className="font-mono text-[11px] bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full flex items-center gap-1 font-bold">
                <AlertCircle className="w-3 h-3 text-amber-600" />
                {pendingApprovals.length} Gate{pendingApprovals.length > 1 ? 's' : ''} Awaiting Review
              </span>
            )}
            <span className="font-mono text-[11px] bg-white px-2 py-1 rounded border border-slate-200 text-slate-600">
              Provider: Official APIs
            </span>
          </div>
        </div>

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-slate-50/30">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            const isSystem = msg.sender === 'system';
            const isTraceExpanded = expandedTraceId === msg.id;

            if (isSystem) {
              return (
                <div key={msg.id} className="mx-auto max-w-xl text-center my-2">
                  <div className="inline-block px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs font-mono">
                    {msg.text}
                  </div>
                </div>
              );
            }

            return (
              <div key={msg.id} className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
                {!isUser && (
                  <div className="w-8 h-8 rounded-lg bg-slate-900 text-indigo-400 flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div className={`max-w-2xl space-y-2.5 ${isUser ? 'items-end' : 'items-start'}`}>
                  {/* Chat bubble */}
                  <div
                    className={`p-4 rounded-xl text-sm leading-relaxed ${
                      isUser
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-white border border-slate-200 text-slate-800 shadow-sm'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{msg.text}</div>
                  </div>

                  {/* Policy Reasoning Trace Accordion */}
                  {msg.reasoning_trace && msg.reasoning_trace.length > 0 && (
                    <div className="bg-slate-100/80 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-700">
                      <button
                        onClick={() => setExpandedTraceId(isTraceExpanded ? null : msg.id)}
                        className="flex items-center justify-between w-full font-mono text-[11px] text-slate-600 hover:text-slate-900"
                      >
                        <span className="flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                          Policy Evaluation & Reasoning Trace ({msg.reasoning_trace.length} steps)
                        </span>
                        {isTraceExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                      </button>

                      {isTraceExpanded && (
                        <div className="mt-2.5 pt-2 border-t border-slate-200 space-y-1 font-mono text-[11px] text-slate-600">
                          {msg.reasoning_trace.map((step, sIdx) => (
                            <div key={sIdx} className="flex items-start gap-2">
                              <span className="text-slate-400 select-none">[{sIdx + 1}]</span>
                              <span>{step}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Associated Pending Approval Card */}
                  {msg.tool_invocations?.map((inv) => {
                    if (inv.approval_id) {
                      const approval = pendingApprovals.find((a) => a.id === inv.approval_id);
                      if (approval) {
                        return (
                          <div key={inv.approval_id} className="mt-3">
                            <ApprovalCard approval={approval} onDecide={onDecideApproval} />
                          </div>
                        );
                      }
                    }
                    return null;
                  })}
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 items-center text-slate-500 text-xs font-mono p-3 bg-white rounded-xl border border-slate-200 w-fit">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
              <span>Orchestrating agent skills & evaluating Policy Engine gates...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-white border-t border-slate-200">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Command the operations agent (e.g., 'Draft contract email to Julian', 'Create invoice $48,000')..."
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-slate-50 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-xl flex items-center gap-2 shadow-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
              <span>Send</span>
            </button>
          </form>
        </div>

        {/* Real-Time Voice Call Telephony Simulator Dock/Modal */}
        {isVoiceCallActive && (
          <div className="absolute bottom-20 right-6 w-96 bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-800 p-5 z-40 animate-in fade-in slide-in-from-bottom-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                <span className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider">
                  Outbound Telephony Active
                </span>
              </div>
              <button
                onClick={() => setIsVoiceCallActive(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="my-4 text-center space-y-2">
              <div className="w-16 h-16 rounded-full bg-purple-600/30 border border-purple-500/50 flex items-center justify-center mx-auto text-purple-300">
                <PhoneCall className="w-8 h-8 animate-bounce" />
              </div>
              <h4 className="text-sm font-bold text-white">{voiceCallContact.name}</h4>
              <p className="text-xs text-slate-400">{voiceCallContact.company} • {voiceCallContact.phone}</p>
              <div className="font-mono text-emerald-400 font-bold text-base mt-1">
                {formatCallTime(callDuration)}
              </div>
            </div>

            {/* Audio waveform visualization */}
            <div className="flex items-center justify-center gap-1 my-3 h-6">
              {[40, 75, 100, 60, 90, 45, 80, 100, 65, 85, 30].map((h, i) => (
                <div
                  key={i}
                  className="w-1 bg-purple-500 rounded-full transition-all duration-300"
                  style={{
                    height: `${Math.max(6, (h * Math.sin(callDuration + i) + 100) / 4)}px`,
                  }}
                />
              ))}
            </div>

            {/* Regulatory AI Disclosure Notice */}
            <div className="p-2.5 bg-slate-800/80 rounded-lg text-[10px] text-slate-300 border border-slate-700 leading-tight mb-4">
              <strong>Section 10 AI Disclosure:</strong> "Hello, this is an automated voice assistant calling on behalf of Sarah Chen at Apex Horizon Technologies regarding your fleet deployment parameters."
            </div>

            {/* In-Call Controls */}
            <div className="flex items-center justify-center gap-4 pt-2">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`p-3 rounded-full border ${
                  isMuted ? 'bg-amber-600 text-white border-amber-500' : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
                title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
              >
                {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              <button
                onClick={() => {
                  setIsVoiceCallActive(false);
                  onSendMessage(`[Voice Call Completed] Call with ${voiceCallContact.name} concluded after ${formatCallTime(callDuration)}. Julian Montgomery confirmed Phase 1 fleet parameters. Updating CRM timeline note.`);
                }}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-full font-bold text-xs flex items-center gap-2 shadow-lg"
              >
                <PhoneOff className="w-4 h-4" />
                <span>Hang Up</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
