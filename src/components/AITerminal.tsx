import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Terminal,
  ShieldCheck,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  Mail,
  PhoneCall,
  Calendar,
  MessageSquare,
  Building2,
  Search,
  Loader2,
  Mic,
  MicOff,
  PhoneOff,
  Radio,
  X,
  CheckCircle2,
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
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'email' | 'voice' | 'whatsapp' | 'erp' | 'calendar' | 'research'>('all');

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
  }, [messages, pendingApprovals, isLoading]);

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
      command: 'draft email --to julian@vanguard.com --subject "SLA Contract"',
      label: 'Draft contract email to Julian',
      prompt: 'Draft follow-up contract and proposed SLA pricing email to Julian Montgomery at Vanguard Logistics',
      category: 'email' as const,
    },
    {
      command: 'telephony call --to julian --confirm fleet-pilot',
      label: 'Outbound call to Julian',
      prompt: 'Place an outbound voice call to Julian Montgomery at Vanguard Logistics to confirm fleet pilot parameters',
      category: 'voice' as const,
    },
    {
      command: 'msg send --wa amara --verify "ISO compliance"',
      label: 'WhatsApp message to Amara',
      prompt: 'Send WhatsApp message to Amara Okafor at BioHealth Instruments confirming ISO compliance verification',
      category: 'whatsapp' as const,
    },
    {
      command: 'calendar schedule --with julian --slot "next-tue-14:00"',
      label: 'Schedule Architecture Review',
      prompt: 'Schedule architecture review meeting on calendar with Julian Montgomery for next Tuesday 2 PM',
      category: 'calendar' as const,
    },
    {
      command: 'erp invoice --client "Vanguard Global" --amount 48000',
      label: 'Generate ERP Invoice $48,000',
      prompt: 'Create an official billing invoice for Vanguard Logistics Global for $48,000 USD for Phase 1 Pilot',
      category: 'erp' as const,
    },
    {
      command: 'search web "vanguard logistics fleet size 2026"',
      label: 'Research Vanguard Logistics',
      prompt: 'Research Vanguard Logistics recent Series B press release and fleet scale',
      category: 'research' as const,
    },
  ];

  const filteredTriggers = sampleTriggers.filter(
    (t) => selectedCategory === 'all' || t.category === selectedCategory
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
      {/* Left Sidebar: Machine Quotas & Command Shortcuts */}
      <div className="lg:col-span-1 space-y-5 font-sans">
        {/* Monthly Automation Quota Panel */}
        <div className="bg-[#FFFFFF] rounded-lg border border-[#E5E5E5] p-4">
          <div className="flex items-center justify-between pb-2.5 border-b border-[#E5E5E5]">
            <span className="text-xs font-mono font-bold text-[#171717] uppercase tracking-wider">
              quota // {features.tier}
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#20232D] text-[#A3A3A3] border border-[#E5E5E5]">
              14d cycle
            </span>
          </div>

          <div className="mt-3 space-y-3 font-mono text-xs">
            {/* Email Quota */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-[#FFFFFF]/70 font-sans text-xs">Emails</span>
                <span className="text-[#171717]">
                  {features.automation_usage.emails} / {features.automation_caps.emails}
                </span>
              </div>
              <div className="w-full bg-[#20232D] h-1.5 rounded border border-[#E5E5E5] overflow-hidden">
                <div
                  className="bg-[#171717] h-full transition-all"
                  style={{
                    width: `${Math.min(100, (features.automation_usage.emails / (features.automation_caps.emails || 1)) * 100)}%`,
                  }}
                />
              </div>
            </div>

            {/* Messages Quota */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-[#FFFFFF]/70 font-sans text-xs">Messages</span>
                <span className="text-[#171717]">
                  {features.automation_usage.messages} / {features.automation_caps.messages}
                </span>
              </div>
              <div className="w-full bg-[#20232D] h-1.5 rounded border border-[#E5E5E5] overflow-hidden">
                <div
                  className="bg-[#171717] h-full transition-all"
                  style={{
                    width: `${Math.min(100, (features.automation_usage.messages / (features.automation_caps.messages || 1)) * 100)}%`,
                  }}
                />
              </div>
            </div>

            {/* Voice Calls Quota */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-[#FFFFFF]/70 font-sans text-xs">Voice Calls</span>
                <span className="text-[#171717]">
                  {features.automation_usage.calls} / {features.automation_caps.calls}
                </span>
              </div>
              <div className="w-full bg-[#20232D] h-1.5 rounded border border-[#E5E5E5] overflow-hidden">
                <div
                  className="bg-[#171717] h-full transition-all"
                  style={{
                    width: `${Math.min(100, (features.automation_usage.calls / (features.automation_caps.calls || 1)) * 100)}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Command Shortcuts Panel */}
        <div className="bg-[#FFFFFF] rounded-lg border border-[#E5E5E5] p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#E5E5E5]">
            <div className="flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-[#171717]" />
              <h3 className="text-xs font-mono font-semibold text-[#171717] uppercase tracking-wider">
                quick-ops
              </h3>
            </div>
            <button
              onClick={() => handleLaunchVoiceSimulator()}
              className="text-[10px] text-[#171717] bg-[#20232D] hover:bg-[#E5E5E5] px-2 py-0.5 rounded border border-[#E5E5E5] font-mono flex items-center gap-1 transition-colors"
              title="Open telephony simulator"
            >
              <Radio className="w-2.5 h-2.5 text-[#171717] animate-pulse" />
              telephony
            </button>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-1 text-[10px] font-mono">
            {(['all', 'email', 'voice', 'whatsapp', 'erp', 'calendar', 'research'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2 py-0.5 rounded transition-colors ${
                  selectedCategory === cat
                    ? 'bg-[#171717] text-[#20232D] font-bold'
                    : 'bg-[#20232D] text-[#FFFFFF]/70 hover:text-[#FFFFFF] border border-[#E5E5E5]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="space-y-2 pt-1">
            {filteredTriggers.map((t, idx) => (
              <button
                key={idx}
                onClick={() => onSendMessage(t.prompt)}
                disabled={isLoading}
                className="w-full text-left p-2.5 rounded border border-[#E5E5E5] bg-[#20232D] hover:border-[#171717] hover:bg-[#FFFFFF] transition-all group disabled:opacity-50"
              >
                <div className="flex items-center gap-1.5 mb-1 font-mono text-[11px] text-[#171717]">
                  <span className="text-[#A3A3A3]">nexus❯</span>
                  <span className="truncate">{t.command}</span>
                </div>
                <div className="font-sans text-xs text-[#FFFFFF]/80 leading-snug">
                  {t.label}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Security / Policy Rule Note */}
        <div className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-lg p-3 text-xs space-y-2">
          <div className="flex items-center gap-1.5 text-[#5FB88A] font-sans font-semibold text-xs pb-1 border-b border-[#E5E5E5]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#5FB88A]" />
            <span>Policy Engine Protocol</span>
          </div>
          <p className="text-[#FFFFFF]/70 text-[11px] font-sans leading-relaxed">
            Autonomous actions that alter state, dispatch messages, or generate financial records require human review. Read-only queries execute safely.
          </p>
          <div className="text-[10px] font-mono text-[#A3A3A3] bg-[#20232D] p-1.5 rounded border border-[#E5E5E5]">
            gate_mode = human_in_the_loop
          </div>
        </div>
      </div>

      {/* Center Main: Amber Terminal Phosphor CRT Window */}
      <div className="lg:col-span-3 flex flex-col h-[740px] bg-[#20232D] rounded-lg border border-[#E5E5E5] shadow-[0_4px_24px_rgba(0,0,0,0.5)] overflow-hidden relative font-mono">
        {/* Terminal Window Chrome Title Bar */}
        <div className="px-4 py-2.5 bg-[#FFFFFF] border-b border-[#E5E5E5] flex items-center justify-between select-none">
          <div className="flex items-center gap-3">
            {/* Window Dots in subtle dark amber */}
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E5E5E5] border border-[#A3A3A3]/40 inline-block"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#E5E5E5] border border-[#A3A3A3]/40 inline-block"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#E5E5E5] border border-[#A3A3A3]/40 inline-block"></span>
            </div>
            {/* Reference Header Title */}
            <span className="text-xs font-mono text-[#FFFFFF]/80 tracking-wide">
              nexus-session — /home/agent
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            {pendingApprovals.length > 0 && (
              <span className="text-[11px] font-mono bg-[#4A3B20] text-[#E2A23C] border border-[#E2A23C]/50 px-2 py-0.5 rounded flex items-center gap-1 font-bold">
                <AlertCircle className="w-3 h-3 text-[#E2A23C]" />
                {pendingApprovals.length} requires approval
              </span>
            )}
            <span className="text-[11px] text-[#A3A3A3] font-mono">
              [live: idle]
            </span>
          </div>
        </div>

        {/* Phosphor Terminal Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-[#20232D] selection:bg-[#5C4620] selection:text-[#171717]">
          {/* Welcome banner if no messages */}
          {messages.length === 0 && (
            <div className="text-xs text-[#A3A3A3] space-y-1.5 py-2 font-mono">
              <p>nexus@core:~$ system-status --check</p>
              <p className="text-[#FFFFFF]/70">→ Nexus personal tier online. Scoped to {features.tier} quota.</p>
              <p className="text-[#FFFFFF]/70">→ Policy engine active. Actions with external side-effects will trigger approval cards.</p>
              <p className="text-[#A3A3A3]">Type a command below or select an operation from quick-ops.</p>
            </div>
          )}

          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            const isSystem = msg.sender === 'system';
            const isTraceExpanded = expandedTraceId === msg.id;

            if (isSystem) {
              return (
                <div key={msg.id} className="py-1">
                  <div className="font-mono text-xs text-[#A3A3A3] bg-[#FFFFFF] px-3 py-1.5 rounded border border-[#E5E5E5]">
                    [sys] {msg.text}
                  </div>
                </div>
              );
            }

            if (isUser) {
              return (
                <div key={msg.id} className="space-y-1">
                  {/* User Command Line adhering directly to reference `nexus❯ <command>` */}
                  <div className="flex items-start gap-2 font-mono text-xs">
                    <span className="text-[#171717] font-bold shrink-0 select-none">nexus❯</span>
                    <span className="text-[#FFFFFF] font-medium whitespace-pre-wrap">{msg.text}</span>
                  </div>
                </div>
              );
            }

            // Assistant machine response
            const hasPendingGate = msg.tool_invocations?.some((inv) =>
              pendingApprovals.some((a) => a.id === inv.approval_id && a.status === 'pending')
            );

            return (
              <div key={msg.id} className="space-y-2.5">
                {/* Machine Output Header & Content */}
                <div className="space-y-1.5 text-xs font-mono">
                  {/* Machine lines prefixed with → */}
                  <div className="flex items-start gap-2 text-[#FFFFFF] leading-relaxed">
                    <span className="text-[#171717] shrink-0 select-none">→</span>
                    <div className="whitespace-pre-wrap flex-1">{msg.text}</div>
                  </div>

                  {/* Warning line adhering directly to reference if requires approval */}
                  {hasPendingGate && (
                    <div className="flex items-center gap-1.5 text-[#E2A23C] font-mono text-xs pl-4 font-medium">
                      <span>⚠ requires approval — see card below</span>
                    </div>
                  )}

                  {/* Safe / Auto-run tool indicators if tool executed with safe status */}
                  {msg.tool_invocations?.map((inv, iIdx) => {
                    if (!inv.requires_approval) {
                      return (
                        <div
                          key={iIdx}
                          className="bg-[#FFFFFF] border border-[#E5E5E5] rounded p-2.5 my-2 space-y-1 text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-[#171717] font-semibold">{inv.tool_name}</span>
                            <span className="font-sans text-[11px] px-1.5 py-0.5 rounded bg-[#2E4A3B] text-[#5FB88A] border border-[#5FB88A]/50">
                              auto-run · safe
                            </span>
                          </div>
                          <p className="text-[#FFFFFF]/60 font-sans text-[11px]">
                            No approval needed — read-only, no external effect.
                          </p>
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>

                {/* Machine Policy Reasoning Trace Accordion */}
                {msg.reasoning_trace && msg.reasoning_trace.length > 0 && (
                  <div className="bg-[#FFFFFF] border border-[#E5E5E5] rounded p-2 text-xs">
                    <button
                      onClick={() => setExpandedTraceId(isTraceExpanded ? null : msg.id)}
                      className="flex items-center justify-between w-full font-mono text-[11px] text-[#A3A3A3] hover:text-[#171717] transition-colors"
                    >
                      <span className="flex items-center gap-1.5">
                        <ShieldCheck className="w-3 h-3 text-[#5FB88A]" />
                        <span>policy_eval.trace [{msg.reasoning_trace.length} steps]</span>
                      </span>
                      {isTraceExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                    </button>

                    {isTraceExpanded && (
                      <div className="mt-2 pt-2 border-t border-[#E5E5E5] space-y-1 font-mono text-[11px] text-[#FFFFFF]/70">
                        {msg.reasoning_trace.map((step, sIdx) => (
                          <div key={sIdx} className="flex items-start gap-2">
                            <span className="text-[#A3A3A3] select-none">[{sIdx + 1}]</span>
                            <span>{step}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Associated Approval Cards */}
                {msg.tool_invocations?.map((inv) => {
                  if (inv.approval_id) {
                    const approval = pendingApprovals.find((a) => a.id === inv.approval_id);
                    if (approval) {
                      return (
                        <div key={inv.approval_id} className="my-2">
                          <ApprovalCard approval={approval} onDecide={onDecideApproval} />
                        </div>
                      );
                    }
                  }
                  return null;
                })}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-center gap-2 text-xs font-mono text-[#171717] py-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>nexus❯ evaluating policy gates & executing pipeline...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Phosphor Terminal Command Line Input */}
        <div className="p-3 bg-[#FFFFFF] border-t border-[#E5E5E5]">
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <span className="font-mono text-sm font-bold text-[#171717] select-none pl-1">
              nexus❯
            </span>
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="enter command (e.g., draft email, search web, create task)..."
              disabled={isLoading}
              className="flex-1 px-2 py-1.5 text-xs font-mono bg-transparent text-[#FFFFFF] placeholder-[#A3A3A3]/40 focus:outline-none disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="px-3 py-1.5 bg-[#171717] hover:bg-[#171717]/90 text-[#20232D] font-mono text-xs font-bold rounded flex items-center gap-1.5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Send className="w-3 h-3" />
              <span>RUN</span>
            </button>
          </form>
        </div>

        {/* Telephony Simulator Dock/Modal */}
        {isVoiceCallActive && (
          <div className="absolute bottom-16 right-4 w-88 bg-[#FFFFFF] text-[#FFFFFF] rounded-lg shadow-2xl border border-[#E5E5E5] p-4 z-40 animate-in fade-in slide-in-from-bottom-3 font-sans">
            <div className="flex items-center justify-between pb-2.5 border-b border-[#E5E5E5]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#5FB88A] animate-ping"></span>
                <span className="text-xs font-mono text-[#5FB88A] font-bold uppercase tracking-wider">
                  telephony // active
                </span>
              </div>
              <button
                onClick={() => setIsVoiceCallActive(false)}
                className="text-[#FFFFFF]/50 hover:text-[#FFFFFF]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="my-3 text-center space-y-1.5">
              <div className="w-12 h-12 rounded-full bg-[#20232D] border border-[#171717]/50 flex items-center justify-center mx-auto text-[#171717]">
                <PhoneCall className="w-5 h-5 animate-bounce" />
              </div>
              <h4 className="text-xs font-bold text-[#FFFFFF] font-sans">{voiceCallContact.name}</h4>
              <p className="text-[11px] text-[#A3A3A3] font-mono">{voiceCallContact.company} • {voiceCallContact.phone}</p>
              <div className="font-mono text-[#171717] font-bold text-sm">
                {formatCallTime(callDuration)}
              </div>
            </div>

            {/* Amber Audio Waveform */}
            <div className="flex items-center justify-center gap-1 my-2.5 h-5">
              {[30, 60, 95, 50, 80, 40, 75, 90, 55, 70, 30].map((h, i) => (
                <div
                  key={i}
                  className="w-1 bg-[#171717] rounded-full transition-all duration-300"
                  style={{
                    height: `${Math.max(4, (h * Math.sin(callDuration + i) + 100) / 5)}px`,
                  }}
                />
              ))}
            </div>

            {/* Disclosure Notice */}
            <div className="p-2 bg-[#20232D] rounded text-[10px] text-[#FFFFFF]/70 border border-[#E5E5E5] leading-tight mb-3 font-mono">
              [DISCLOSURE] Automated telephony voice agent calling on behalf of operator.
            </div>

            {/* In-Call Controls */}
            <div className="flex items-center justify-center gap-3 pt-1">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`p-2 rounded border font-sans ${
                  isMuted ? 'bg-[#E2A23C] text-[#20232D] border-[#E2A23C]' : 'bg-[#20232D] text-[#FFFFFF]/80 border-[#E5E5E5] hover:bg-[#E5E5E5]'
                }`}
                title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
              >
                {isMuted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={() => {
                  setIsVoiceCallActive(false);
                  onSendMessage(`[Voice Call Completed] Call with ${voiceCallContact.name} concluded after ${formatCallTime(callDuration)}. Julian Montgomery confirmed Phase 1 fleet parameters. Updating CRM timeline note.`);
                }}
                className="px-4 py-1.5 bg-[#E2574C] hover:bg-[#E2574C]/90 text-[#20232D] rounded font-sans font-semibold text-xs flex items-center gap-1.5"
              >
                <PhoneOff className="w-3.5 h-3.5" />
                <span>Disconnect</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
