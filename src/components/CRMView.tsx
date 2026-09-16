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
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto mb-5 text-slate-400">
          <Lock className="w-8 h-8 text-slate-500" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">CRM & Pipeline Module is Locked</h2>
        <p className="text-slate-600 text-sm max-w-lg mx-auto mb-6 leading-relaxed">
          You are currently on the <strong>{features.tier.toUpperCase()}</strong> tier. In Nexus, modules
          unlock by configuration — never by data migration or creating a second account.
        </p>
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl max-w-md mx-auto mb-6 text-left text-xs text-blue-900 space-y-2">
          <div className="font-semibold flex items-center gap-1.5 text-blue-950">
            <Sparkles className="w-4 h-4 text-blue-600" />
            What Startup Tier Unlocks (Section 5):
          </div>
          <p>• Contacts, Leads, Pipeline Stages, and Deal Tracking</p>
          <p>• Autonomous timeline logging for all AI calls and emails</p>
          <p>• Increased automation cap to 500 emails, 1,000 messages</p>
        </div>
        <button
          onClick={() => onUpgradeInPlace('startup')}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors"
        >
          Upgrade in-place to Startup Tier
        </button>
      </div>
    );
  }

  const stages: { id: Deal['stage']; label: string; color: string }[] = [
    { id: 'prospect', label: 'Prospect', color: 'border-t-slate-400' },
    { id: 'qualified', label: 'Qualified', color: 'border-t-blue-500' },
    { id: 'proposal', label: 'Proposal', color: 'border-t-indigo-500' },
    { id: 'negotiation', label: 'Negotiation', color: 'border-t-amber-500' },
    { id: 'won', label: 'Won', color: 'border-t-emerald-500' },
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Honest Preview Disclaimer Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-start gap-3 text-xs text-amber-900 shadow-xs">
        <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold block text-amber-950">Tier Preview — Phase 4 CRM Engine</span>
          <p className="text-amber-800 mt-0.5">
            This screen illustrates the upcoming Startup tier CRM pipeline. Records displayed here are demonstration models and are not yet committed to the production relational database.
          </p>
        </div>
      </div>

      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              Startup Module Unlocked
            </span>
            <span className="text-xs text-slate-600">• System of Record: CRM</span>
          </div>
          <h1 className="text-lg font-bold text-slate-900 mt-1">Customer Relationship Management</h1>
          <p className="text-xs text-slate-600">
            Automated timeline logging: every email, WhatsApp message, and voice call logs directly back here.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-lg border border-slate-200 p-1 bg-slate-50 text-xs">
            <button
              onClick={() => setActiveTab('pipeline')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                activeTab === 'pipeline' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Deals Pipeline ({deals.length})
            </button>
            <button
              onClick={() => setActiveTab('contacts')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                activeTab === 'contacts' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Contacts & Leads ({contacts.length})
            </button>
          </div>

          <button
            onClick={() => setIsAddDealModalOpen(true)}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Deal</span>
          </button>
          <button
            onClick={() => setIsAddContactModalOpen(true)}
            className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Lead</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg border border-slate-200 hover:bg-slate-50"
            title="Export CSV"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* CRM KPI Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
            Total Pipeline
          </div>
          <div className="text-xl font-bold text-slate-900 font-mono mt-1">
            ${totalPipelineValue.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">{deals.length} active opportunities</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
            Weighted Pipeline
          </div>
          <div className="text-xl font-bold text-blue-600 font-mono mt-1">
            ${Math.round(weightedPipelineValue).toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Probability-adjusted forecast</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
            Win Rate
          </div>
          <div className="text-xl font-bold text-indigo-600 font-mono mt-1">
            {winRate}%
          </div>
          <div className="text-[11px] text-emerald-600 mt-0.5 font-medium">{wonDeals.length} won deals</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-purple-600" />
            Total Accounts
          </div>
          <div className="text-xl font-bold text-slate-900 font-mono mt-1">
            {contacts.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Autonomous timeline active</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search leads, accounts, deals, or tags..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        {activeTab === 'pipeline' && (
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value as any)}
            className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 bg-white"
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
        /* Deals Pipeline Kanban */
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {stages.map((st) => {
            const stageDeals = filteredDeals.filter((d) => d.stage === st.id);
            const totalValue = stageDeals.reduce((acc, d) => acc + d.value, 0);

            return (
              <div
                key={st.id}
                className={`bg-slate-50/70 rounded-xl border border-slate-200 p-3.5 flex flex-col border-t-4 ${st.color}`}
              >
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200">
                  <span className="text-xs font-bold text-slate-800">{st.label}</span>
                  <span className="text-[11px] font-mono text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                    {stageDeals.length}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 mb-3 font-mono">
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
                        className="bg-white rounded-lg border border-slate-200 p-3 shadow-xs hover:shadow-sm transition-shadow text-left"
                      >
                        <div className="flex items-start justify-between gap-1 mb-1">
                          <h4 className="text-xs font-semibold text-slate-900 leading-tight">
                            {deal.title}
                          </h4>
                          {onDeleteDeal && (
                            <button
                              onClick={() => onDeleteDeal(deal.id)}
                              className="text-slate-300 hover:text-red-600 transition-colors p-0.5"
                              title="Remove deal"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>

                        <p className="text-[11px] text-slate-500 flex items-center gap-1 mb-2">
                          <Users className="w-3 h-3 text-slate-400" />
                          {deal.contact_name}
                        </p>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                          <span className="font-bold text-slate-900">${deal.value.toLocaleString()}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                            {deal.probability}% win
                          </span>
                        </div>

                        {/* Stage transition controls */}
                        <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            {prevStage && (
                              <button
                                onClick={() => onAdvanceDealStage(deal.id, prevStage)}
                                className="text-[10px] text-slate-400 hover:text-slate-700 p-1 rounded hover:bg-slate-100"
                                title={`Move back to ${prevStage}`}
                              >
                                <ChevronLeft className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              onClick={() =>
                                onTriggerAction(`Advance deal "${deal.title}" and email follow-up proposal to ${deal.contact_name}`)
                              }
                              className="text-[10px] text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-0.5 px-1 py-0.5 rounded hover:bg-indigo-50"
                              title="Ask AI to draft outreach"
                            >
                              <Sparkles className="w-2.5 h-2.5" />
                              AI Action
                            </button>
                          </div>

                          {nextStage && (
                            <button
                              onClick={() => onAdvanceDealStage(deal.id, nextStage)}
                              className="text-[10px] text-blue-600 hover:text-blue-800 font-medium flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-blue-50 hover:bg-blue-100"
                            >
                              Advance <ChevronRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {stageDeals.length === 0 && (
                    <div className="text-center py-6 text-[11px] text-slate-400 border border-dashed border-slate-200 rounded-lg">
                      No deals in {st.label}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Contacts Directory & Timeline */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Contact List */}
          <div className="md:col-span-1 bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-3.5 bg-slate-50 border-b border-slate-200 font-semibold text-xs text-slate-800 flex items-center justify-between">
              <span>Active Leads & Accounts ({filteredContacts.length})</span>
              <button
                onClick={() => setIsAddContactModalOpen(true)}
                className="text-blue-600 hover:text-blue-800 font-bold flex items-center gap-0.5 text-[11px]"
              >
                <Plus className="w-3 h-3" /> Add Lead
              </button>
            </div>
            <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
              {filteredContacts.map((cnt) => (
                <button
                  key={cnt.id}
                  onClick={() => setSelectedContact(cnt)}
                  className={`w-full text-left p-3.5 transition-colors flex items-start justify-between ${
                    selectedContact?.id === cnt.id ? 'bg-indigo-50/50' : 'hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <div className="font-semibold text-xs text-slate-900">{cnt.name}</div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <Building className="w-3 h-3 text-slate-400" />
                      {cnt.company}
                    </div>
                    <div className="text-[10px] text-slate-600 mt-1">{cnt.last_activity}</div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Score: {cnt.lead_score}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Selected Contact Detailed Timeline */}
          {selectedContact && (
            <div className="md:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-5">
              <div className="flex items-start justify-between pb-4 border-b border-slate-200">
                <div>
                  <h3 className="text-base font-bold text-slate-900">{selectedContact.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{selectedContact.company}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedContact.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200"
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
                    className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-medium flex items-center gap-1"
                  >
                    <Mail className="w-3 h-3" />
                    AI Email
                  </button>
                  <button
                    onClick={() =>
                      onTriggerAction(`Send WhatsApp message to ${selectedContact.name} confirming compliance checklist`)
                    }
                    className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-medium flex items-center gap-1"
                  >
                    <MessageSquare className="w-3 h-3" />
                    WhatsApp
                  </button>
                  <button
                    onClick={() =>
                      onTriggerAction(`Place an outbound voice call to ${selectedContact.name} to discuss agreement parameters`)
                    }
                    className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-lg text-xs font-medium flex items-center gap-1"
                  >
                    <Phone className="w-3 h-3" />
                    Voice Call
                  </button>
                </div>
              </div>

              {/* AI Lead Summary */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900 mb-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  Autonomous Operational Context
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">{selectedContact.ai_summary}</p>
              </div>

              {/* Contact Channels */}
              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3 rounded-lg border border-slate-200 bg-white">
                  <span className="text-slate-400 block text-[10px]">EMAIL ADDRESS</span>
                  <span className="text-slate-800">{selectedContact.email}</span>
                </div>
                <div className="p-3 rounded-lg border border-slate-200 bg-white">
                  <span className="text-slate-400 block text-[10px]">PHONE / WHATSAPP</span>
                  <span className="text-slate-800">{selectedContact.phone || 'N/A'}</span>
                </div>
              </div>

              {/* Interactive Contact Activity Notes Thread */}
              <div className="border-t border-slate-200 pt-4 space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  Activity Timeline & Operator Notes
                </h4>

                {/* Add note input */}
                <form onSubmit={handleAddNote} className="flex gap-2">
                  <input
                    type="text"
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    placeholder="Log a call note, follow-up insight, or update..."
                    className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    disabled={!newNoteText.trim() || isSubmittingNote}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium flex items-center gap-1 disabled:opacity-50"
                  >
                    <Send className="w-3 h-3" />
                    <span>Post</span>
                  </button>
                </form>

                {/* Notes list */}
                <div className="space-y-2 mt-3">
                  {(selectedContact.notes && selectedContact.notes.length > 0) ? (
                    selectedContact.notes.map((note) => (
                      <div key={note.id} className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/70 text-xs">
                        <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                          <span className="font-semibold text-slate-700">{note.author}</span>
                          <span>{new Date(note.timestamp).toLocaleString()}</span>
                        </div>
                        <p className="text-slate-700">{note.text}</p>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-slate-400 italic py-2">
                      No manual notes recorded yet. Autonomous communications will automatically populate this log.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add Contact / Lead Modal */}
      {isAddContactModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900">Add New CRM Lead / Account</h3>
              <button onClick={() => setIsAddContactModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateContact} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Contact Name *</label>
                <input
                  type="text"
                  required
                  value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  placeholder="e.g. Rachel Adams"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Company / Organization *</label>
                <input
                  type="text"
                  required
                  value={contactForm.company}
                  onChange={(e) => setContactForm({ ...contactForm, company: e.target.value })}
                  placeholder="e.g. Horizon Logistics Inc"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    placeholder="rachel@horizon.com"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone / WhatsApp</label>
                  <input
                    type="text"
                    value={contactForm.phone}
                    onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                    placeholder="+1 (555) 234-5678"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Inbound Channel</label>
                  <select
                    value={contactForm.channel}
                    onChange={(e) => setContactForm({ ...contactForm, channel: e.target.value as any })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300"
                  >
                    <option value="email">Email</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="phone">Phone Call</option>
                    <option value="web">Web Form</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Lead Score (0-100)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={contactForm.lead_score}
                    onChange={(e) => setContactForm({ ...contactForm, lead_score: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={contactForm.tags}
                  onChange={(e) => setContactForm({ ...contactForm, tags: e.target.value })}
                  placeholder="e.g. Enterprise, High Intent, Q4 Budget"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">AI Operational Summary</label>
                <textarea
                  rows={2}
                  value={contactForm.ai_summary}
                  onChange={(e) => setContactForm({ ...contactForm, ai_summary: e.target.value })}
                  placeholder="Key background context for autonomous agent interactions..."
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddContactModalOpen(false)}
                  className="px-3 py-1.5 text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-xs"
                >
                  Save Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Deal Modal */}
      {isAddDealModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900">Create Sales Deal Opportunity</h3>
              <button onClick={() => setIsAddDealModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateDeal} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Deal Title *</label>
                <input
                  type="text"
                  required
                  value={dealForm.title}
                  onChange={(e) => setDealForm({ ...dealForm, title: e.target.value })}
                  placeholder="e.g. Apex Horizon - Fleet Automation Rollout"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Associated Contact Account</label>
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
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300"
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
                  <label className="block font-semibold text-slate-700 mb-1">Deal Value ($ USD) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={dealForm.value}
                    onChange={(e) => setDealForm({ ...dealForm, value: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Win Probability (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={dealForm.probability}
                    onChange={(e) => setDealForm({ ...dealForm, probability: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Pipeline Stage</label>
                  <select
                    value={dealForm.stage}
                    onChange={(e) => setDealForm({ ...dealForm, stage: e.target.value as any })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300"
                  >
                    <option value="prospect">Prospect</option>
                    <option value="qualified">Qualified</option>
                    <option value="proposal">Proposal</option>
                    <option value="negotiation">Negotiation</option>
                    <option value="won">Won</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Close Date</label>
                  <input
                    type="date"
                    value={dealForm.expected_close}
                    onChange={(e) => setDealForm({ ...dealForm, expected_close: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddDealModalOpen(false)}
                  className="px-3 py-1.5 text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-xs"
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
