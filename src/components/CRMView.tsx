import React, { useState } from 'react';
import {
  Users,
  Building,
  Mail,
  Phone,
  MessageSquare,
  Globe,
  ArrowRight,
  TrendingUp,
  Filter,
  Plus,
  Lock,
  Sparkles,
  CheckCircle2,
  Clock,
  ChevronRight,
  ChevronLeft,
  Trash2,
  Search,
  Download,
  DollarSign,
  Briefcase,
  X,
  Send,
  UserCheck,
  Check,
} from 'lucide-react';
import { LeadContact, Deal, WorkspaceFeatures } from '../types';

interface CRMViewProps {
  features: WorkspaceFeatures;
  contacts: LeadContact[];
  deals: Deal[];
  onUpgradeInPlace: (targetTier: 'startup') => void;
  onAdvanceDealStage: (dealId: string, nextStage: Deal['stage']) => void;
  onTriggerAction: (prompt: string) => void;
  onAddContact?: (contact: Partial<LeadContact>) => Promise<void>;
  onAddDeal?: (deal: Partial<Deal>) => Promise<void>;
  onDeleteDeal?: (dealId: string) => Promise<void>;
  onAddContactNote?: (contactId: string, text: string) => Promise<void>;
}

export const CRMView: React.FC<CRMViewProps> = ({
  features,
  contacts,
  deals,
  onUpgradeInPlace,
  onAdvanceDealStage,
  onTriggerAction,
  onAddContact,
  onAddDeal,
  onDeleteDeal,
  onAddContactNote,
}) => {
  const [activeTab, setActiveTab] = useState<'pipeline' | 'contacts'>('pipeline');
  const [selectedContact, setSelectedContact] = useState<LeadContact | null>(contacts[0] || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState<'all' | Deal['stage']>('all');

  // Modals state
  const [isAddContactModalOpen, setIsAddContactModalOpen] = useState(false);
  const [isAddDealModalOpen, setIsAddDealModalOpen] = useState(false);
  const [newNoteText, setNewNoteText] = useState('');
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);

  // New Contact form state
  const [contactForm, setContactForm] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    channel: 'email' as LeadContact['channel'],
    lead_score: 80,
    tags: 'Qualified, Inbound',
    ai_summary: '',
  });

  // New Deal form state
  const [dealForm, setDealForm] = useState({
    title: '',
    contact_id: contacts[0]?.id || '',
    contact_name: contacts[0]?.name || '',
    value: 35000,
    stage: 'prospect' as Deal['stage'],
    probability: 60,
    expected_close: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
  });

  if (!features.crm_enabled) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16">
        <div className="bg-ink-900 border border-ink-border p-8 text-center">
          <div className="w-12 h-12 rounded-lg border border-rule bg-paper-inset flex items-center justify-center mx-auto mb-5">
            <Lock className="w-5 h-5 text-amber" />
          </div>
          <h2 className="text-xl font-semibold text-paper tracking-tight mb-2">CRM & Pipeline Module is Locked</h2>
          <p className="text-paper/70 text-sm max-w-lg mx-auto mb-6 leading-relaxed">
            You are currently on the <strong className="text-paper">{features.tier.toUpperCase()}</strong> tier. In Nexus, modules
            unlock by configuration — never by data migration or creating a second account.
          </p>
          <div className="p-4 bg-ink-800 border border-ink-border text-left text-sm text-paper/80 space-y-2 mb-6">
            <div className="font-semibold flex items-center gap-1.5 text-amber">
              <Sparkles className="w-4 h-4 text-amber" />
              What Startup Tier Unlocks (Section 5):
            </div>
            <p>• Contacts, Leads, Pipeline Stages, and Deal Tracking</p>
            <p>• Autonomous timeline logging for all AI calls and emails</p>
            <p>• Increased automation cap to 500 emails, 1,000 messages</p>
          </div>
          <button
            onClick={() => onUpgradeInPlace('startup')}
            className="px-5 py-2.5 bg-amber hover:opacity-90 text-ink-950 text-sm font-semibold transition-colors"
          >
            Upgrade in-place to Startup Tier
          </button>
        </div>
      </div>
    );
  }

  const stages: { id: Deal['stage']; label: string; color: string }[] = [
    { id: 'prospect', label: 'Prospect', color: 'border-t-ink-muted' },
    { id: 'qualified', label: 'Qualified', color: 'border-t-amber-dim' },
    { id: 'proposal', label: 'Proposal', color: 'border-t-amber' },
    { id: 'negotiation', label: 'Negotiation', color: 'border-t-warn' },
    { id: 'won', label: 'Won', color: 'border-t-ok' },
  ];

  // Pipeline Financial KPIs
  const totalPipelineValue = deals.reduce((acc, d) => acc + d.value, 0);
  const weightedPipelineValue = deals.reduce((acc, d) => acc + (d.value * (d.probability / 100)), 0);
  const wonDeals = deals.filter((d) => d.stage === 'won');
  const winRate = deals.length > 0 ? Math.round((wonDeals.length / deals.length) * 100) : 0;

  // Filtered Contacts
  const filteredContacts = contacts.filter((c) => {
    const q = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.company.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.tags.some((t) => t.toLowerCase().includes(q))
    );
  });

  // Filtered Deals
  const filteredDeals = deals.filter((d) => {
    if (stageFilter !== 'all' && d.stage !== stageFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return d.title.toLowerCase().includes(q) || d.contact_name.toLowerCase().includes(q);
    }
    return true;
  });

  const handleCreateContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.company) return;
    const tagList = contactForm.tags.split(',').map((t) => t.trim()).filter(Boolean);
    if (onAddContact) {
      await onAddContact({
        name: contactForm.name,
        company: contactForm.company,
        email: contactForm.email || 'lead@example.com',
        phone: contactForm.phone,
        channel: contactForm.channel,
        lead_score: Number(contactForm.lead_score) || 80,
        tags: tagList,
        ai_summary: contactForm.ai_summary || `Lead generated for ${contactForm.company}.`,
      });
    }
    setIsAddContactModalOpen(false);
    setContactForm({
      name: '',
      company: '',
      email: '',
      phone: '',
      channel: 'email',
      lead_score: 80,
      tags: 'Qualified, Inbound',
      ai_summary: '',
    });
  };

  const handleCreateDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dealForm.title) return;
    if (onAddDeal) {
      await onAddDeal({
        title: dealForm.title,
        contact_id: dealForm.contact_id,
        contact_name: dealForm.contact_name,
        value: Number(dealForm.value) || 25000,
        stage: dealForm.stage,
        probability: Number(dealForm.probability) || 50,
        expected_close: dealForm.expected_close,
      });
    }
    setIsAddDealModalOpen(false);
    setDealForm({
      title: '',
      contact_id: contacts[0]?.id || '',
      contact_name: contacts[0]?.name || '',
      value: 35000,
      stage: 'prospect',
      probability: 60,
      expected_close: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
    });
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim() || !selectedContact || !onAddContactNote) return;
    setIsSubmittingNote(true);
    try {
      await onAddContactNote(selectedContact.id, newNoteText.trim());
      setNewNoteText('');
    } finally {
      setIsSubmittingNote(false);
    }
  };

  const handleExportCSV = () => {
    const headers = 'ID,Name,Company,Email,Phone,LeadScore,Tags\n';
    const rows = contacts
      .map((c) => `"${c.id}","${c.name}","${c.company}","${c.email}","${c.phone || ''}","${c.lead_score}","${c.tags.join(';')}"`)
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nexus_crm_contacts_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const fieldClass = 'w-full px-3 py-2 border border-rule bg-paper-raised text-ink-text text-sm placeholder:text-ink-muted/70 focus:outline-none focus:border-amber';
  const overlayClass = 'fixed inset-0 z-50 bg-ink-950/80 flex items-center justify-center p-4';
  const modalClass = 'bg-paper-raised max-w-md w-full p-6 border border-rule';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div className="bg-warn-bg border border-amber/30 p-3.5 flex items-start gap-3 text-sm text-ink-text">
        <Sparkles className="w-4 h-4 text-ink-muted shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold block text-ink-text">CRM is the system of record</span>
          <p className="text-ink-muted mt-0.5">
            Pipeline, contacts, and deals live here. Every AI email, WhatsApp message, and voice call writes back to the record automatically.
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-paper-raised p-5 border border-rule">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-ink-muted bg-warn-bg px-2 py-0.5 border border-amber/30">
              Startup Module Unlocked
            </span>
            <span className="text-sm text-ink-muted">• System of Record: CRM</span>
          </div>
          <h1 className="text-xl font-semibold text-ink-text mt-1 tracking-tight">Customer Relationship Management</h1>
          <p className="text-sm text-ink-muted">
            Automated timeline logging: every email, WhatsApp message, and voice call logs directly back here.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex border border-rule p-1 bg-paper-inset text-sm">
            <button
              onClick={() => setActiveTab('pipeline')}
              className={`px-3 py-1.5 font-medium transition-colors ${
                activeTab === 'pipeline' ? 'bg-amber text-ink-950' : 'text-ink-muted hover:text-ink-text'
              }`}
            >
              Deals Pipeline ({deals.length})
            </button>
            <button
              onClick={() => setActiveTab('contacts')}
              className={`px-3 py-1.5 font-medium transition-colors ${
                activeTab === 'contacts' ? 'bg-amber text-ink-950' : 'text-ink-muted hover:text-ink-text'
              }`}
            >
              Contacts & Leads ({contacts.length})
            </button>
          </div>

          <button
            onClick={() => setIsAddDealModalOpen(true)}
            className="px-3 py-1.5 bg-amber hover:opacity-90 text-ink-950 text-sm font-semibold flex items-center gap-1 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Deal</span>
          </button>
          <button
            onClick={() => setIsAddContactModalOpen(true)}
            className="px-3 py-1.5 bg-paper hover:bg-paper-inset text-ink-text border border-rule text-sm font-medium flex items-center gap-1 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Lead</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="p-1.5 text-ink-muted hover:text-ink-text border border-rule hover:bg-paper-inset"
            title="Export CSV"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-paper-raised p-4 border border-rule">
          <div className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-ok" />
            Total Pipeline
          </div>
          <div className="text-xl font-semibold text-ink-text font-mono mt-1">
            ${totalPipelineValue.toLocaleString()}
          </div>
          <div className="text-[11px] text-ink-muted mt-0.5">{deals.length} active opportunities</div>
        </div>

        <div className="bg-paper-raised p-4 border border-rule">
          <div className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-ink-muted" />
            Weighted Pipeline
          </div>
          <div className="text-xl font-semibold text-ink-text font-mono mt-1">
            ${Math.round(weightedPipelineValue).toLocaleString()}
          </div>
          <div className="text-[11px] text-ink-muted mt-0.5">Probability-adjusted forecast</div>
        </div>

        <div className="bg-paper-raised p-4 border border-rule">
          <div className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider flex items-center gap-1.5">
            <Briefcase className="w-3.5 h-3.5 text-ok" />
            Win Rate
          </div>
          <div className="text-xl font-semibold text-ink-text font-mono mt-1">
            {winRate}%
          </div>
          <div className="text-[11px] text-ok mt-0.5 font-medium">{wonDeals.length} won deals</div>
        </div>

        <div className="bg-paper-raised p-4 border border-rule">
          <div className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-ink-muted" />
            Total Accounts
          </div>
          <div className="text-xl font-semibold text-ink-text font-mono mt-1">
            {contacts.length}
          </div>
          <div className="text-[11px] text-ink-muted mt-0.5">Autonomous timeline active</div>
        </div>
      </div>

      <div className="flex items-center gap-3 bg-paper-raised p-3 border border-rule">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-ink-muted absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search leads, accounts, deals, or tags..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-rule bg-paper-raised text-ink-text placeholder:text-ink-muted/70 focus:outline-none focus:border-amber"
          />
        </div>
        {activeTab === 'pipeline' && (
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value as any)}
            className="text-sm border border-rule px-2.5 py-2 text-ink-text bg-paper-raised"
          >
            <option value="all">All Stages</option>
            <option value="prospect">Prospect</option>
            <option value="qualified">Qualified</option>
            <option value="proposal">Proposal</option>
            <option value="negotiation">Negotiation</option>
            <option value="won">Won</option>
          </select>
        )}
      </div>

      {activeTab === 'pipeline' ? (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {stages.map((st) => {
            const stageDeals = filteredDeals.filter((d) => d.stage === st.id);
            const totalValue = stageDeals.reduce((acc, d) => acc + d.value, 0);

            return (
              <div
                key={st.id}
                className={`bg-paper-inset border border-rule p-3.5 flex flex-col border-t-[3px] ${st.color}`}
              >
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-rule">
                  <span className="text-sm font-semibold text-ink-text">{st.label}</span>
                  <span className="text-[11px] font-mono text-ink-muted bg-paper-raised px-1.5 py-0.5 border border-rule">
                    {stageDeals.length}
                  </span>
                </div>
                <div className="text-[11px] text-ink-muted mb-3 font-mono">
                  ${totalValue.toLocaleString()}
                </div>

                <div className="space-y-3 flex-1">
                  {stageDeals.map((deal) => {
                    const stageOrder: Deal['stage'][] = ['prospect', 'qualified', 'proposal', 'negotiation', 'won'];
                    const currentIndex = stageOrder.indexOf(deal.stage);
                    const prevStage = currentIndex > 0 ? stageOrder[currentIndex - 1] : null;
                    const nextStage = currentIndex < stageOrder.length - 1 ? stageOrder[currentIndex + 1] : null;

                    return (
                      <div
                        key={deal.id}
                        className="bg-paper-raised border border-rule p-3 hover:border-amber/40 transition-colors text-left"
                      >
                        <div className="flex items-start justify-between gap-1 mb-1">
                          <h4 className="text-sm font-semibold text-ink-text leading-tight">
                            {deal.title}
                          </h4>
                          {onDeleteDeal && (
                            <button
                              onClick={() => onDeleteDeal(deal.id)}
                              className="text-ink-muted hover:text-danger transition-colors p-0.5"
                              title="Remove deal"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>

                        <p className="text-[13px] text-ink-muted flex items-center gap-1 mb-2">
                          <Users className="w-3 h-3 text-ink-muted" />
                          {deal.contact_name}
                        </p>

                        <div className="flex items-center justify-between pt-2 border-t border-rule text-sm">
                          <span className="font-semibold text-ink-text font-mono">${deal.value.toLocaleString()}</span>
                          <span className="text-[11px] font-mono px-1.5 py-0.5 bg-paper-inset text-ink-muted">
                            {deal.probability}% win
                          </span>
                        </div>

                        <div className="mt-2.5 pt-2 border-t border-rule flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            {prevStage && (
                              <button
                                onClick={() => onAdvanceDealStage(deal.id, prevStage)}
                                className="text-[11px] text-ink-muted hover:text-ink-text p-1 hover:bg-paper-inset"
                                title={`Move back to ${prevStage}`}
                              >
                                <ChevronLeft className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              onClick={() =>
                                onTriggerAction(`Advance deal "${deal.title}" and email follow-up proposal to ${deal.contact_name}`)
                              }
                              className="text-[11px] text-ink-muted hover:text-ink-text font-medium flex items-center gap-0.5 px-1 py-0.5 hover:bg-warn-bg"
                              title="Ask AI to draft outreach"
                            >
                              <Sparkles className="w-2.5 h-2.5" />
                              AI Action
                            </button>
                          </div>

                          {nextStage && (
                            <button
                              onClick={() => onAdvanceDealStage(deal.id, nextStage)}
                              className="text-[11px] text-ink-text hover:text-ink-950 font-medium flex items-center gap-0.5 px-1.5 py-0.5 bg-paper-inset hover:bg-amber"
                            >
                              Advance <ChevronRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {stageDeals.length === 0 && (
                    <div className="text-center py-6 text-[13px] text-ink-muted border border-dashed border-rule">
                      No deals in {st.label}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 bg-paper-raised border border-rule overflow-hidden">
            <div className="p-3.5 bg-paper-inset border-b border-rule font-semibold text-sm text-ink-text flex items-center justify-between">
              <span>Active Leads & Accounts ({filteredContacts.length})</span>
              <button
                onClick={() => setIsAddContactModalOpen(true)}
                className="text-ink-muted hover:text-ink-text font-bold flex items-center gap-0.5 text-[11px]"
              >
                <Plus className="w-3 h-3" /> Add Lead
              </button>
            </div>
            <div className="divide-y divide-rule max-h-[600px] overflow-y-auto">
              {filteredContacts.map((cnt) => (
                <button
                  key={cnt.id}
                  onClick={() => setSelectedContact(cnt)}
                  className={`w-full text-left p-3.5 transition-colors flex items-start justify-between ${
                    selectedContact?.id === cnt.id ? 'bg-warn-bg' : 'hover:bg-paper-inset'
                  }`}
                >
                  <div>
                    <div className="font-semibold text-sm text-ink-text">{cnt.name}</div>
                    <div className="text-[13px] text-ink-muted flex items-center gap-1 mt-0.5">
                      <Building className="w-3 h-3" />
                      {cnt.company}
                    </div>
                    <div className="text-[11px] text-ink-muted mt-1 font-mono">{cnt.last_activity}</div>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] font-mono font-bold px-1.5 py-0.5 bg-ok-bg text-ok border border-ok/30">
                      Score: {cnt.lead_score}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {selectedContact && (
            <div className="md:col-span-2 bg-paper-raised border border-rule p-5 space-y-5">
              <div className="flex items-start justify-between pb-4 border-b border-rule">
                <div>
                  <h3 className="text-xl font-semibold text-ink-text tracking-tight">{selectedContact.name}</h3>
                  <p className="text-sm text-ink-muted mt-0.5">{selectedContact.company}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedContact.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[11px] font-mono px-2 py-0.5 bg-paper-inset text-ink-text border border-rule"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      onTriggerAction(`Draft email to ${selectedContact.name} at ${selectedContact.company} about the platform scope`)
                    }
                    className="px-3 py-1.5 bg-paper-inset hover:bg-warn-bg text-ink-text border border-rule text-sm font-medium flex items-center gap-1"
                  >
                    <Mail className="w-3 h-3" />
                    AI Email
                  </button>
                  <button
                    onClick={() =>
                      onTriggerAction(`Send WhatsApp message to ${selectedContact.name} confirming compliance checklist`)
                    }
                    className="px-3 py-1.5 bg-paper-inset hover:bg-ok-bg text-ink-text border border-rule text-sm font-medium flex items-center gap-1"
                  >
                    <MessageSquare className="w-3 h-3" />
                    WhatsApp
                  </button>
                  <button
                    onClick={() =>
                      onTriggerAction(`Place an outbound voice call to ${selectedContact.name} to discuss agreement parameters`)
                    }
                    className="px-3 py-1.5 bg-paper-inset hover:bg-warn-bg text-ink-text border border-rule text-sm font-medium flex items-center gap-1"
                  >
                    <Phone className="w-3 h-3" />
                    Voice Call
                  </button>
                </div>
              </div>

              <div className="bg-paper-inset p-4 border border-rule">
                <div className="flex items-center gap-1.5 text-sm font-semibold text-ink-text mb-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-ink-muted" />
                  Autonomous Operational Context
                </div>
                <p className="text-sm text-ink-text leading-relaxed">{selectedContact.ai_summary}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm font-mono">
                <div className="p-3 border border-rule bg-paper-raised">
                  <span className="text-ink-muted block text-[11px]">EMAIL ADDRESS</span>
                  <span className="text-ink-text">{selectedContact.email}</span>
                </div>
                <div className="p-3 border border-rule bg-paper-raised">
                  <span className="text-ink-muted block text-[11px]">PHONE / WHATSAPP</span>
                  <span className="text-ink-text">{selectedContact.phone || 'N/A'}</span>
                </div>
              </div>

              <div className="border-t border-rule pt-4 space-y-3">
                <h4 className="text-[11px] font-bold text-ink-text uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-ink-muted" />
                  Activity Timeline & Operator Notes
                </h4>

                <form onSubmit={handleAddNote} className="flex gap-2">
                  <input
                    type="text"
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    placeholder="Log a call note, follow-up insight, or update..."
                    className="flex-1 px-3 py-2 text-sm border border-rule bg-paper-raised text-ink-text placeholder:text-ink-muted/70 focus:outline-none focus:border-amber"
                  />
                  <button
                    type="submit"
                    disabled={!newNoteText.trim() || isSubmittingNote}
                    className="px-3 py-2 bg-ink-900 hover:bg-ink-800 text-paper text-sm font-medium flex items-center gap-1 disabled:opacity-50"
                  >
                    <Send className="w-3 h-3" />
                    <span>Post</span>
                  </button>
                </form>

                <div className="space-y-2 mt-3">
                  {(selectedContact.notes && selectedContact.notes.length > 0) ? (
                    selectedContact.notes.map((note) => (
                      <div key={note.id} className="p-2.5 border border-rule bg-paper-inset text-sm">
                        <div className="flex items-center justify-between text-[11px] text-ink-muted mb-1">
                          <span className="font-semibold text-ink-text">{note.author}</span>
                          <span className="font-mono">{new Date(note.timestamp).toLocaleString()}</span>
                        </div>
                        <p className="text-ink-text">{note.text}</p>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-ink-muted italic py-2">
                      No manual notes recorded yet. Autonomous communications will automatically populate this log.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {isAddContactModalOpen && (
        <div className={overlayClass}>
          <div className={modalClass}>
            <div className="flex items-center justify-between pb-3 border-b border-rule mb-4">
              <h3 className="text-lg font-semibold text-ink-text tracking-tight">Add New CRM Lead / Account</h3>
              <button onClick={() => setIsAddContactModalOpen(false)} className="text-ink-muted hover:text-ink-text">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateContact} className="space-y-3 text-sm">
              <div>
                <label className="block font-medium text-ink-text mb-1">Contact Name *</label>
                <input
                  type="text"
                  required
                  value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  placeholder="e.g. Rachel Adams"
                  className={fieldClass}
                />
              </div>
              <div>
                <label className="block font-medium text-ink-text mb-1">Company / Organization *</label>
                <input
                  type="text"
                  required
                  value={contactForm.company}
                  onChange={(e) => setContactForm({ ...contactForm, company: e.target.value })}
                  placeholder="e.g. Horizon Logistics Inc"
                  className={fieldClass}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium text-ink-text mb-1">Email Address</label>
                  <input
                    type="email"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    placeholder="rachel@horizon.com"
                    className={fieldClass}
                  />
                </div>
                <div>
                  <label className="block font-medium text-ink-text mb-1">Phone / WhatsApp</label>
                  <input
                    type="text"
                    value={contactForm.phone}
                    onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                    placeholder="+1 (555) 234-5678"
                    className={fieldClass}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium text-ink-text mb-1">Inbound Channel</label>
                  <select
                    value={contactForm.channel}
                    onChange={(e) => setContactForm({ ...contactForm, channel: e.target.value as any })}
                    className={fieldClass}
                  >
                    <option value="email">Email</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="phone">Phone Call</option>
                    <option value="web">Web Form</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-ink-text mb-1">Lead Score (0-100)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={contactForm.lead_score}
                    onChange={(e) => setContactForm({ ...contactForm, lead_score: Number(e.target.value) })}
                    className={fieldClass}
                  />
                </div>
              </div>
              <div>
                <label className="block font-medium text-ink-text mb-1">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={contactForm.tags}
                  onChange={(e) => setContactForm({ ...contactForm, tags: e.target.value })}
                  placeholder="e.g. Enterprise, High Intent, Q4 Budget"
                  className={fieldClass}
                />
              </div>
              <div>
                <label className="block font-medium text-ink-text mb-1">AI Operational Summary</label>
                <textarea
                  rows={2}
                  value={contactForm.ai_summary}
                  onChange={(e) => setContactForm({ ...contactForm, ai_summary: e.target.value })}
                  placeholder="Key background context for autonomous agent interactions..."
                  className={fieldClass}
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-rule">
                <button
                  type="button"
                  onClick={() => setIsAddContactModalOpen(false)}
                  className="px-3 py-1.5 text-ink-muted hover:text-ink-text"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber hover:opacity-90 text-ink-950 font-semibold"
                >
                  Save Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isAddDealModalOpen && (
        <div className={overlayClass}>
          <div className={modalClass}>
            <div className="flex items-center justify-between pb-3 border-b border-rule mb-4">
              <h3 className="text-lg font-semibold text-ink-text tracking-tight">Create Sales Deal Opportunity</h3>
              <button onClick={() => setIsAddDealModalOpen(false)} className="text-ink-muted hover:text-ink-text">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateDeal} className="space-y-3 text-sm">
              <div>
                <label className="block font-medium text-ink-text mb-1">Deal Title *</label>
                <input
                  type="text"
                  required
                  value={dealForm.title}
                  onChange={(e) => setDealForm({ ...dealForm, title: e.target.value })}
                  placeholder="e.g. Apex Horizon - Fleet Automation Rollout"
                  className={fieldClass}
                />
              </div>
              <div>
                <label className="block font-medium text-ink-text mb-1">Associated Contact Account</label>
                <select
                  value={dealForm.contact_id}
                  onChange={(e) => {
                    const selected = contacts.find((c) => c.id === e.target.value);
                    setDealForm({
                      ...dealForm,
                      contact_id: e.target.value,
                      contact_name: selected ? selected.name : dealForm.contact_name,
                    });
                  }}
                  className={fieldClass}
                >
                  {contacts.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.company})
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium text-ink-text mb-1">Deal Value ($ USD) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={dealForm.value}
                    onChange={(e) => setDealForm({ ...dealForm, value: Number(e.target.value) })}
                    className={fieldClass}
                  />
                </div>
                <div>
                  <label className="block font-medium text-ink-text mb-1">Win Probability (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={dealForm.probability}
                    onChange={(e) => setDealForm({ ...dealForm, probability: Number(e.target.value) })}
                    className={fieldClass}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium text-ink-text mb-1">Pipeline Stage</label>
                  <select
                    value={dealForm.stage}
                    onChange={(e) => setDealForm({ ...dealForm, stage: e.target.value as any })}
                    className={fieldClass}
                  >
                    <option value="prospect">Prospect</option>
                    <option value="qualified">Qualified</option>
                    <option value="proposal">Proposal</option>
                    <option value="negotiation">Negotiation</option>
                    <option value="won">Won</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-ink-text mb-1">Target Close Date</label>
                  <input
                    type="date"
                    value={dealForm.expected_close}
                    onChange={(e) => setDealForm({ ...dealForm, expected_close: e.target.value })}
                    className={fieldClass}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-rule">
                <button
                  type="button"
                  onClick={() => setIsAddDealModalOpen(false)}
                  className="px-3 py-1.5 text-ink-muted hover:text-ink-text"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber hover:opacity-90 text-ink-950 font-semibold"
                >
                  Create Deal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
