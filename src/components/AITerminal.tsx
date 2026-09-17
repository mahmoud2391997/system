import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity,
  ArrowUp,
  Bell,
  CalendarDays,
  Check,
  Globe2,
  LoaderCircle,
  LockKeyhole,
  Mail,
  MessageCircle,
  Mic,
  MoreHorizontal,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Volume2,
  X,
} from 'lucide-react';
import {
  AgentMessage,
  ApprovalAction,
  AuditLogEntry,
  IntegrationStatus,
  ProjectTask,
  WorkspaceFeatures,
  WorkspaceTier,
} from '../types';
import { ApprovalCard } from './ApprovalCard';

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognition;
    webkitSpeechRecognition?: new () => SpeechRecognition;
  }
}

type SpeechRecognitionEvent = {
  results: SpeechRecognitionResultList;
  resultIndex: number;
};

type SpeechRecognition = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
};

interface AITerminalProps {
  messages: AgentMessage[];
  pendingApprovals: ApprovalAction[];
  features: WorkspaceFeatures;
  onSendMessage: (message: string) => Promise<void>;
  onDecideApproval: (id: string, decision: 'approve' | 'reject', notes?: string) => Promise<void>;
  isLoading: boolean;
  currentUser?: { id: string; name: string; email: string; avatar?: string } | null;
  onLogout?: () => void;
  integrations?: IntegrationStatus[];
  auditLogs?: AuditLogEntry[];
  tasks?: ProjectTask[];
  onSelectTier?: (tier: WorkspaceTier) => Promise<void>;
  isUpdatingTier?: boolean;
}

const WELCOME_COPY =
  "I'll help you get things done — schedule events, manage your calendar, send and search emails, send WhatsApp messages, create tasks, and search the web.";

const formatTime = (value?: string) => {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('en', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: false,
  }).format(date);
};

const integrationConnected = (integrations: IntegrationStatus[], type: IntegrationStatus['type']) =>
  integrations.some((item) => item.type === type && item.connected);

export const AITerminal: React.FC<AITerminalProps> = ({
  messages,
  pendingApprovals,
  onSendMessage,
  onDecideApproval,
  isLoading,
  integrations = [],
  auditLogs = [],
  tasks = [],
}) => {
  const [draftSession, setDraftSession] = useState(true);
  const [command, setCommand] = useState('');
  const [conversationSearch, setConversationSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'activity' | 'tasks'>('activity');
  const [panelModal, setPanelModal] = useState<'activity' | 'tasks' | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [voiceSupported, setVoiceSupported] = useState(() =>
    typeof window === 'undefined'
      ? true
      : Boolean(window.SpeechRecognition || window.webkitSpeechRecognition),
  );

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const messagesRef = useRef<HTMLDivElement | null>(null);

  const conversation = useMemo(
    () => messages.filter((msg) => !(msg.sender === 'system' && /tier updated/i.test(msg.text))),
    [messages],
  );

  const visibleConversation = draftSession ? [] : conversation;

  const userMessages = useMemo(
    () => visibleConversation.filter((msg) => msg.sender === 'user'),
    [visibleConversation],
  );

  const isEmpty = userMessages.length === 0;
  const pending = pendingApprovals.filter((approval) => approval.status === 'pending');

  const conversations = useMemo(() => {
    if (userMessages.length === 0) return [];
    const first = userMessages[0];
    return [
      {
        id: 'current',
        title: first.text.slice(0, 48) || 'Current session',
        preview: userMessages[userMessages.length - 1]?.text ?? '',
      },
    ];
  }, [userMessages]);

  const visibleConversations = conversations.filter((item) => {
    const query = conversationSearch.trim().toLowerCase();
    if (!query) return true;
    return `${item.title} ${item.preview}`.toLowerCase().includes(query);
  });

  const suggestions = useMemo(() => {
    const calendarConnected = integrationConnected(integrations, 'calendar');
    const gmailConnected = integrationConnected(integrations, 'email');
    const whatsappConnected = integrationConnected(integrations, 'whatsapp');
    const webSearchConnected = integrationConnected(integrations, 'search');
    const phoneConnected = integrationConnected(integrations, 'voice');
    return [
      { key: 'calendar', label: 'Schedule an event', icon: CalendarDays, prompt: 'Schedule an event for ', enabled: calendarConnected, reason: calendarConnected ? '' : 'Connect Calendar' },
      { key: 'email', label: 'Send an email', icon: Mail, prompt: 'Write an email to ', enabled: gmailConnected, reason: gmailConnected ? '' : 'Connect Gmail' },
      { key: 'searchEmails', label: 'Search emails', icon: Mail, prompt: 'Search my emails for ', enabled: gmailConnected, reason: gmailConnected ? '' : 'Connect Gmail' },
      { key: 'whatsapp', label: 'Send a WhatsApp message', icon: MessageCircle, prompt: 'Send a WhatsApp message to ', enabled: whatsappConnected, reason: whatsappConnected ? '' : 'Configure WhatsApp' },
      { key: 'task', label: 'Add a task', icon: Check, prompt: 'Add a task: ', enabled: true, reason: '' },
      { key: 'search', label: 'Search the web', icon: Globe2, prompt: 'Search the web for ', enabled: webSearchConnected, reason: webSearchConnected ? '' : 'Enable web search' },
      { key: 'phone', label: 'Make a call', icon: Bell, prompt: 'Make a call to ', enabled: phoneConnected, reason: phoneConnected ? '' : 'Connect a phone provider' },
    ];
  }, [integrations]);

  useEffect(() => {
    const el = messagesRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [visibleConversation, pending, isLoading]);

  useEffect(() => {
    setVoiceSupported(Boolean(window.SpeechRecognition || window.webkitSpeechRecognition));
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) return;

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join('');
      setVoiceTranscript(transcript);
      if (event.results[event.results.length - 1].isFinal) {
        void submitCommand(transcript);
      }
    };
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognitionRef.current = recognition;
    return () => {
      try {
        recognition.stop();
      } catch {
        /* ignore */
      }
      window.speechSynthesis?.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submitCommand = async (rawValue?: string) => {
    const value = (rawValue !== undefined ? rawValue : command).trim();
    if (!value || isLoading) return;
    setDraftSession(false);
    setCommand('');
    if (rawValue !== undefined) setVoiceTranscript(value);
    await onSendMessage(value);
  };

  const stopSpeaking = () => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
  };

  const toggleVoice = () => {
    if (!voiceSupported) return;
    stopSpeaking();
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }
    setVoiceTranscript('');
    try {
      recognitionRef.current?.start();
      setIsListening(true);
    } catch {
      setIsListening(false);
    }
  };

  const pickSuggestion = (item: (typeof suggestions)[number]) => {
    if (!item.enabled) return;
    setCommand(item.prompt);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const runSuggestion = (item: (typeof suggestions)[number]) => {
    if (!item.enabled) return;
    void submitCommand(item.prompt);
  };

  const newConversation = () => {
    setDraftSession(true);
    setConversationSearch('');
    setCommand('');
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const inputForm = (
    <div className="mx-auto w-full max-w-3xl">
      <div className="mb-3 flex items-center gap-2">
        <button
          type="button"
          onClick={isSpeaking ? stopSpeaking : toggleVoice}
          disabled={!voiceSupported || isLoading}
          className={`inline-flex flex-1 items-center justify-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium transition ${
            isListening
              ? 'animate-pulse border-destructive/40 bg-destructive/10 text-destructive'
              : isSpeaking
                ? 'border-primary/40 bg-primary/10 text-primary'
                : 'border-border bg-muted/40 text-foreground hover:bg-muted'
          } disabled:cursor-not-allowed disabled:opacity-40`}
          aria-label={
            !voiceSupported
              ? 'Voice conversation unsupported'
              : isSpeaking
                ? 'Stop speaking'
                : isListening
                  ? 'Stop voice conversation'
                  : 'Start a voice conversation'
          }
        >
          {isListening ? (
            <X className="size-4" />
          ) : isSpeaking ? (
            <Volume2 className="size-4" />
          ) : (
            <Mic className="size-4" />
          )}
          <span>
            {!voiceSupported
              ? 'Voice unavailable (try Chrome/Edge)'
              : isSpeaking
                ? 'Nexus is speaking… tap to stop'
                : isListening
                  ? 'Listening… tap to stop'
                  : 'Start a voice conversation'}
          </span>
        </button>
      </div>
      <div className="relative rounded-lg border border-input bg-background shadow-sm focus-within:ring-2 focus-within:ring-ring">
        <textarea
          ref={inputRef}
          id="personal-prompt"
          value={command}
          onChange={(event) => setCommand(event.target.value)}
          onKeyDown={(event) => {
            if (
              event.key === 'Enter' &&
              !event.shiftKey &&
              !event.nativeEvent.isComposing &&
              (event as { keyCode?: number }).keyCode !== 229
            ) {
              event.preventDefault();
              void submitCommand();
            }
          }}
          placeholder="Ask Nexus anything…"
          className="min-h-14 w-full resize-none bg-transparent px-4 pb-12 pt-3 text-sm outline-none placeholder:text-muted-foreground"
          aria-label="AI prompt"
          disabled={isLoading}
        />
        <div className="absolute bottom-2 left-3 flex items-center gap-1 text-[11px] text-muted-foreground">
          <kbd className="rounded border border-border px-1.5 py-0.5 font-mono">↵</kbd> send{' '}
          <span className="mx-1">·</span>
          <kbd className="rounded border border-border px-1.5 py-0.5 font-mono">⇧ ↵</kbd> new line
        </div>
        <div className="absolute bottom-2 right-2 flex items-center gap-1">
          <button
            type="button"
            onClick={isSpeaking ? stopSpeaking : toggleVoice}
            disabled={!voiceSupported || isLoading}
            className={`rounded-md p-2 ${
              isListening
                ? 'bg-destructive/10 text-destructive'
                : isSpeaking
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted'
            } disabled:cursor-not-allowed disabled:opacity-40`}
            aria-label={
              !voiceSupported
                ? 'Voice input unsupported'
                : isSpeaking
                  ? 'Stop speaking'
                  : isListening
                    ? 'Stop voice conversation'
                    : 'Start voice conversation'
            }
          >
            {isListening ? (
              <X className="size-4" />
            ) : isSpeaking ? (
              <Volume2 className="size-4" />
            ) : (
              <Mic className="size-4" />
            )}
          </button>
          <button
            type="button"
            onClick={() => void submitCommand()}
            disabled={!command.trim() || isLoading}
            className="rounded-md bg-primary p-2 text-primary-foreground hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Send prompt"
          >
            <ArrowUp className="size-4" />
          </button>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
        {suggestions.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => pickSuggestion(item)}
            disabled={!item.enabled}
            title={item.enabled ? `Start: ${item.prompt}` : item.reason}
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] transition ${
              item.enabled
                ? 'border-border bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground'
                : 'cursor-not-allowed border-dashed border-border text-muted-foreground/40'
            }`}
          >
            <item.icon className="size-3.5" />
            <span>{item.label}</span>
            {!item.enabled && <span className="opacity-60">· {item.reason}</span>}
          </button>
        ))}
      </div>
      {(isListening || isSpeaking || voiceTranscript) && (
        <div className="mt-3 rounded-md border border-border bg-muted/40 p-3 text-xs">
          <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            <span>
              {isListening ? 'Listening' : isSpeaking ? 'Nexus speaking' : 'Voice transcript'}
            </span>
            {(isListening || isSpeaking) && (
              <span className="size-2 animate-pulse rounded-full bg-primary" />
            )}
          </div>
          <p className="mt-2 leading-relaxed">
            {voiceTranscript ||
              (isSpeaking
                ? conversation.filter((msg) => msg.sender === 'assistant').slice(-1)[0]?.text?.slice(0, 240) ?? ''
                : 'Speak a prompt to Nexus.')}
          </p>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex h-full min-h-0 flex-col bg-background text-foreground">
      <div className="mx-auto grid h-full min-h-0 w-full max-w-[1500px] lg:grid-cols-[220px_minmax(0,1fr)_280px]">
        <aside className="hidden min-h-0 overflow-y-auto border-r border-border p-5 lg:block">
          <button
            type="button"
            onClick={newConversation}
            className="mb-7 flex w-full items-center justify-center gap-2 rounded-md bg-primary px-3 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-90"
          >
            <Plus className="size-4" /> New conversation
          </button>
          <div className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Workspace
          </div>
          <nav className="space-y-1 text-sm">
            <a className="flex items-center gap-3 rounded-md bg-accent px-3 py-2.5 font-medium text-accent-foreground" href="#prompt">
              <Sparkles className="size-4" /> Prompt
            </a>
            <button
              type="button"
              onClick={() => setPanelModal('activity')}
              className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-muted-foreground hover:bg-muted"
            >
              <Activity className="size-4" /> Activity
            </button>
            <button
              type="button"
              onClick={() => setPanelModal('tasks')}
              className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-muted-foreground hover:bg-muted"
            >
              <Check className="size-4" /> Tasks
            </button>
          </nav>

          <div className="mb-3 mt-9 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Conversations
          </div>
          <div className="relative mb-2">
            <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              value={conversationSearch}
              onChange={(event) => setConversationSearch(event.target.value)}
              placeholder="Search conversations…"
              className="w-full rounded-md border border-border bg-muted/40 py-1.5 pl-8 pr-2 text-xs text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
            />
          </div>
          <div className="max-h-[50vh] space-y-1 overflow-y-auto text-xs text-muted-foreground">
            {visibleConversations.length === 0 ? (
              <div className="px-3 py-2 italic opacity-70">No saved conversations yet.</div>
            ) : (
              visibleConversations.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="w-full truncate rounded bg-accent px-3 py-2 text-left font-medium text-accent-foreground hover:bg-muted"
                  title={item.title}
                >
                  {item.title}
                </button>
              ))
            )}
          </div>
          <div className="mt-auto pt-16">
            <div className="flex items-center gap-2 rounded-md border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
              <ShieldCheck className="size-4 shrink-0 text-emerald-600" />
              <span>Actions are always permissioned.</span>
            </div>
          </div>
        </aside>

        <section id="prompt" className="flex h-full min-h-0 min-w-0 flex-col border-border lg:border-r">
          <div className="flex shrink-0 items-center justify-between border-b border-border px-5 py-4 md:px-8">
            <div>
              <h1 className="font-mono text-sm font-semibold tracking-wide">AI prompt</h1>
              <p className="mt-1 text-xs text-muted-foreground">
                Ask Nexus to search, plan, and act on your behalf.
              </p>
            </div>
            <button type="button" className="rounded-md p-2 text-muted-foreground hover:bg-muted" aria-label="More options">
              <MoreHorizontal className="size-4" />
            </button>
          </div>

          {isEmpty ? (
            <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-7 overflow-y-auto p-6">
              <div className="flex w-full max-w-2xl flex-col items-center text-center">
                <div className="mb-1 inline-flex items-center gap-2 font-mono text-base font-semibold uppercase tracking-[0.22em] text-primary">
                  <Sparkles className="size-4" /> Nexus AI and Automation
                </div>
                <p className="mb-6 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                  {WELCOME_COPY}
                </p>
                <div className="grid w-full grid-cols-1 gap-2 text-left sm:grid-cols-2">
                  {suggestions.map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => runSuggestion(item)}
                      disabled={!item.enabled}
                      title={item.enabled ? `Start: ${item.prompt}` : item.reason}
                      className={`flex items-start gap-3 rounded-lg border px-4 py-3 transition ${
                        item.enabled
                          ? 'border-border bg-card hover:bg-muted'
                          : 'cursor-not-allowed border-dashed border-border bg-transparent'
                      }`}
                    >
                      <span
                        className={`mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md ${
                          item.enabled ? 'bg-muted text-muted-foreground' : 'bg-muted/40 text-muted-foreground/40'
                        }`}
                      >
                        <item.icon className="size-4" />
                      </span>
                      <span className="min-w-0">
                        <span className={`block text-sm font-medium ${item.enabled ? 'text-foreground' : 'text-muted-foreground/40'}`}>
                          {item.label}
                        </span>
                        {!item.enabled && (
                          <span className="block text-[11px] text-muted-foreground/50">{item.reason}</span>
                        )}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
              {inputForm}
            </div>
          ) : (
            <>
              <div ref={messagesRef} className="min-h-0 flex-1 space-y-6 overflow-y-auto p-5 md:p-8">
                {visibleConversation.map((message) => (
                  <MessageRow key={message.id} message={message} />
                ))}
                {pending.map((approval) => (
                  <ApprovalCard key={approval.id} approval={approval} onDecide={onDecideApproval} />
                ))}
                {isLoading && (
                  <div className="flex gap-3">
                    <LoaderCircle className="size-4 animate-spin text-muted-foreground mt-1.5" />
                    <div className="font-mono text-xs text-muted-foreground">Working…</div>
                  </div>
                )}
              </div>
              <div className="shrink-0 border-t border-border bg-card/95 p-4 md:p-6">
                {inputForm}
              </div>
            </>
          )}
        </section>

        <aside className="hidden min-h-0 space-y-7 overflow-y-auto p-5 xl:block">
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Connections
              </h2>
              <span className="text-xs text-primary">Manage</span>
            </div>
            <div className="space-y-2">
              {integrations.length === 0 ? (
                <div className="rounded-md border border-dashed border-border p-3 text-xs text-muted-foreground">
                  Loading connections…
                </div>
              ) : (
                integrations.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 rounded-md border border-border bg-card p-3"
                  >
                    <div className="flex size-8 items-center justify-center rounded-md bg-muted">
                      <IntegrationIcon type={item.type} name={item.name} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium">{item.name}</div>
                      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                        <span
                          className={`size-1.5 rounded-full ${
                            item.connected ? 'bg-emerald-500' : 'bg-muted-foreground/50'
                          }`}
                        />
                        {item.description || item.provider}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div id="activity">
            <div className="mb-3 flex items-center gap-4 border-b border-border">
              <button
                type="button"
                onClick={() => setActiveTab('activity')}
                className={`pb-2 font-mono text-[10px] uppercase tracking-[0.14em] ${
                  activeTab === 'activity'
                    ? 'border-b-2 border-primary text-foreground'
                    : 'text-muted-foreground'
                }`}
              >
                Activity
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('tasks')}
                className={`pb-2 font-mono text-[10px] uppercase tracking-[0.14em] ${
                  activeTab === 'tasks'
                    ? 'border-b-2 border-primary text-foreground'
                    : 'text-muted-foreground'
                }`}
              >
                Tasks
              </button>
            </div>
            {activeTab === 'activity' ? (
              <div className="max-h-[380px] space-y-4 overflow-y-auto pr-1">
                {auditLogs.length === 0 ? (
                  <div className="text-xs text-muted-foreground">No activity yet.</div>
                ) : (
                  auditLogs.map((log) => (
                    <div className="flex gap-3" key={log.id}>
                      <div className="w-12 shrink-0 pt-0.5 font-mono text-[10px] text-muted-foreground">
                        {formatTime(log.timestamp)}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-xs font-medium">{log.skill || log.action_summary}</div>
                        <div className="mt-0.5 break-words text-[11px] text-muted-foreground">
                          {log.action_summary}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="max-h-[380px] space-y-2 overflow-y-auto pr-1" id="tasks">
                {tasks.length === 0 ? (
                  <div className="rounded-md border border-dashed border-border p-4 text-xs text-muted-foreground">
                    No active tasks. Say <code className="rounded bg-muted px-1">add task: …</code> to create one.
                  </div>
                ) : (
                  tasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-start gap-3 rounded-md border border-border bg-card p-3"
                    >
                      <div
                        className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded border ${
                          task.status === 'done'
                            ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600'
                            : 'border-border text-muted-foreground'
                        }`}
                      >
                        {task.status === 'done' ? <Check className="size-3" /> : null}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className={`text-sm ${task.status === 'done' ? 'line-through text-muted-foreground' : ''}`}>
                          {task.title}
                        </div>
                        <div className="mt-0.5 text-[11px] capitalize text-muted-foreground">
                          {task.status.replace('_', ' ')}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          <div className="rounded-lg bg-primary p-4 text-primary-foreground">
            <div className="flex items-center gap-2 text-xs font-medium">
              <LockKeyhole className="size-3.5" /> Privacy by default
            </div>
            <p className="mt-2 text-[11px] leading-relaxed text-primary-foreground/70">
              Credentials stay server-side. Nexus only sees the tools and results it needs. Set
              <code className="mx-1 rounded bg-black/10 px-1">OPENAI_API_KEY</code> in your
              environment to enable live LLM responses.
            </p>
          </div>
        </aside>
      </div>

      {panelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setPanelModal(null)}>
          <div
            className="flex max-h-[80vh] w-full max-w-lg flex-col rounded-xl border border-border bg-background shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex shrink-0 items-center justify-between border-b border-border px-5 py-4">
              <h2 className="flex items-center gap-2 font-mono text-sm font-semibold tracking-wide">
                {panelModal === 'activity' ? <Activity className="size-4" /> : <Check className="size-4" />}
                {panelModal === 'activity' ? 'All Activity' : 'All Tasks'}
              </h2>
              <button
                type="button"
                onClick={() => setPanelModal(null)}
                className="rounded-md p-2 text-muted-foreground hover:bg-muted"
                aria-label="Close"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-5">
              {panelModal === 'activity' ? (
                auditLogs.length === 0 ? (
                  <div className="text-sm text-muted-foreground">No activity across conversations yet.</div>
                ) : (
                  <div className="space-y-3">
                    {auditLogs.map((log) => (
                      <div key={log.id} className="rounded-lg border border-border px-3 py-2">
                        <div className="flex items-center gap-2">
                          <span className="w-12 shrink-0 font-mono text-[10px] text-muted-foreground">
                            {formatTime(log.timestamp)}
                          </span>
                          <span className="min-w-0 flex-1 truncate text-sm font-medium">{log.skill}</span>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">{log.action_summary}</p>
                      </div>
                    ))}
                  </div>
                )
              ) : tasks.length === 0 ? (
                <div className="text-sm text-muted-foreground">
                  No tasks across conversations yet. Say{' '}
                  <code className="rounded bg-muted px-1">add task: …</code> to create one.
                </div>
              ) : (
                <div className="space-y-1">
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      className={`flex items-center gap-3 rounded-lg border border-border px-3 py-2 ${
                        task.status === 'done' ? 'bg-muted/40' : ''
                      }`}
                    >
                      <div
                        className={`flex size-5 shrink-0 items-center justify-center rounded-md border ${
                          task.status === 'done'
                            ? 'border-emerald-500 bg-emerald-500 text-white'
                            : 'border-border'
                        }`}
                      >
                        <Check className="size-3" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className={`text-sm ${task.status === 'done' ? 'line-through text-muted-foreground' : ''}`}>
                          {task.title}
                        </div>
                        <div className="mt-0.5 text-[11px] capitalize text-muted-foreground">
                          {task.status.replace('_', ' ')}
                          {task.due_date ? ` · due ${new Date(task.due_date).toLocaleDateString()}` : ''}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function MessageRow({ message }: { message: AgentMessage }) {
  return (
    <div className={`flex gap-3 ${message.sender === 'user' ? 'justify-end' : ''}`}>
      <div
        className={`max-w-2xl ${
          message.sender === 'user'
            ? 'rounded-lg bg-primary px-4 py-3 text-sm text-primary-foreground whitespace-pre-wrap break-words'
            : ''
        }`}
      >
        {message.sender !== 'user' && (
          <div className="mb-2 flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
            {message.sender === 'system' ? (
              <>
                <LoaderCircle className="size-3 animate-spin" /> Tool execution / System
              </>
            ) : (
              <>
                <Sparkles className="size-3 text-primary" /> Nexus AI
              </>
            )}
          </div>
        )}
        <p
          className={
            message.sender === 'system'
              ? 'font-mono text-xs text-muted-foreground whitespace-pre-wrap break-words'
              : 'text-sm leading-relaxed whitespace-pre-wrap break-words'
          }
        >
          {message.text}
        </p>
      </div>
    </div>
  );
}

function IntegrationIcon({ type, name }: { type: IntegrationStatus['type']; name: string }) {
  const lowered = name.toLowerCase();
  const Icon =
    type === 'calendar' || lowered.includes('calendar')
      ? CalendarDays
      : type === 'email' || lowered.includes('gmail') || lowered.includes('mail')
        ? Mail
        : type === 'search' || lowered.includes('search')
          ? Globe2
          : type === 'voice' || lowered.includes('phone')
            ? Bell
            : type === 'whatsapp' || lowered.includes('whatsapp')
              ? MessageCircle
              : type === 'telegram'
                ? MessageCircle
                : Sparkles;
  return <Icon className="size-4 text-muted-foreground" />;
}
