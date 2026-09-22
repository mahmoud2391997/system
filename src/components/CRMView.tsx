import React, { useEffect, useMemo, useState } from 'react';
import {
  Users,
  Calendar,
  MessageSquare,
  Plus,
  Lock,
  Sparkles,
  Search,
  BarChart3,
  Send,
  Building2,
} from 'lucide-react';
import {
  CrmAppointment,
  CrmCallLog,
  CrmCatalog,
  CrmCustomer,
  CrmLead,
  CrmSmsMessage,
  CrmWhatsAppMessage,
  WorkspaceFeatures,
} from '../types';
import {
  APPOINTMENT_STATUSES,
  CALL_OUTCOMES,
  CRM_AGENTS,
  CUSTOMER_STATUSES,
  LEAD_SOURCES,
  LEAD_STATUSES,
  MEETING_TYPES,
} from '../crmCatalog';

interface CRMViewProps {
  features: WorkspaceFeatures;
  catalog: CrmCatalog;
  onUpgradeInPlace: (targetTier: 'startup') => void;
}

type Section = 'dashboard' | 'leads' | 'customers' | 'appointments' | 'calls' | 'sms' | 'whatsapp' | 'reports';
type ReportTab = 'leads' | 'appointments' | 'customers' | 'agents';

const SECTIONS: { id: Section; label: string }[] = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'leads', label: 'Leads' },
  { id: 'customers', label: 'Customers' },
  { id: 'appointments', label: 'Appointments' },
  { id: 'calls', label: 'Call Logs' },
  { id: 'sms', label: 'SMS Center' },
  { id: 'whatsapp', label: 'WhatsApp' },
  { id: 'reports', label: 'Reports' },
];

const fieldClass = 'w-full px-3 py-2 border border-rule bg-paper-raised text-ink-text text-sm placeholder:text-ink-muted/70 focus:outline-none focus:border-amber';

function badgeClass(value: string) {
  const good = ['Won', 'Active', 'Completed', 'Confirmed', 'Answered', 'Delivered', 'Read', 'Available', 'Sent'];
  const bad = ['Lost', 'Inactive', 'Failed', 'No Answer', 'No Show', 'Cancelled', 'Not Available'];
  const warn = ['Pending', 'Voicemail', 'Busy', 'Proposal Sent', 'Rescheduled'];
  if (good.includes(value)) return 'bg-ok-bg text-ok border-ok/30';
  if (bad.includes(value)) return 'bg-danger-bg text-danger border-danger/30';
  if (warn.includes(value)) return 'bg-warn-bg text-warn border-warn/30';
  return 'bg-paper-inset text-ink-muted border-rule';
}

function Badge({ value }: { value: string }) {
  return <span className={`inline-flex px-1.5 py-0.5 text-[11px] font-medium border ${badgeClass(value)}`}>{value}</span>;
}

function formatTime(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

function nextId(prefix: string, ids: string[]) {
  const nums = ids.map((id) => Number(id.replace(/\D/g, ''))).filter((n) => !Number.isNaN(n));
  const next = (nums.length ? Math.max(...nums) : 0) + 1;
  return `${prefix}${String(next).padStart(3, '0')}`;
}

function Bars({ points, label }: { points: { label: string; value: number }[]; label: string }) {
  const max = Math.max(...points.map((p) => p.value), 1);
  return (
    <div className="flex items-end gap-3 h-40" aria-label={label}>
      {points.map((point) => (
        <div key={point.label} className="flex-1 flex flex-col items-center gap-1 min-w-0">
          <span className="text-[11px] font-mono text-ink-muted">{point.value}</span>
          <div className="w-full bg-paper-inset border border-rule h-28 flex items-end">
            <div className="w-full bg-ink-text/80" style={{ height: `${Math.max(8, (point.value / max) * 100)}%` }} />
          </div>
          <span className="text-[11px] text-ink-muted truncate">{point.label}</span>
        </div>
      ))}
    </div>
  );
}

function PropertyList({ rows }: { rows: { label: string; value: React.ReactNode }[] }) {
  return (
    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {rows.map((row) => (
        <div key={row.label} className="border border-rule bg-paper-inset px-3 py-2">
          <dt className="text-[11px] uppercase tracking-wider text-ink-muted">{row.label}</dt>
          <dd className="text-sm text-ink-text mt-0.5 break-words">{row.value || '—'}</dd>
        </div>
      ))}
    </dl>
  );
}

function Table({ headers, children }: { headers: string[]; children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto border border-rule bg-paper-raised">
      <table className="w-full text-sm text-left">
        <thead className="bg-paper-inset text-[11px] uppercase tracking-wider text-ink-muted">
          <tr>
            {headers.map((header) => (
              <th key={header} className="px-3 py-2 font-semibold whitespace-nowrap">{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export const CRMView: React.FC<CRMViewProps> = ({ features, catalog, onUpgradeInPlace }) => {
  const [section, setSection] = useState<Section>('dashboard');
  const [reportTab, setReportTab] = useState<ReportTab>('leads');
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [leads, setLeads] = useState<CrmLead[]>(catalog.leads);
  const [customers, setCustomers] = useState<CrmCustomer[]>(catalog.customers);
  const [appointments, setAppointments] = useState<CrmAppointment[]>(catalog.appointments);
  const [calls, setCalls] = useState<CrmCallLog[]>(catalog.calls);
  const [sms, setSms] = useState<CrmSmsMessage[]>(catalog.sms);
  const [whatsapp, setWhatsapp] = useState<CrmWhatsAppMessage[]>(catalog.whatsapp);
  const [selectedLead, setSelectedLead] = useState<string | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<string | null>(null);
  const [selectedCall, setSelectedCall] = useState<string | null>(null);
  const [waCustomer, setWaCustomer] = useState(catalog.whatsapp[0]?.customerId || catalog.customers[0]?.id || '');
  const [waDraft, setWaDraft] = useState('');
  const [smsDraft, setSmsDraft] = useState({ customerId: catalog.customers[0]?.id || '', message: '' });
  const [modal, setModal] = useState<'lead' | 'customer' | 'appointment' | null>(null);
  const [leadForm, setLeadForm] = useState({ name: '', phone: '', email: '', company: '', source: 'Website', status: 'New', assignedAgent: CRM_AGENTS[0] });
  const [customerForm, setCustomerForm] = useState({ name: '', phone: '', email: '', company: '', country: '', status: 'Active', notes: '' });
  const [appointmentForm, setAppointmentForm] = useState({
    customerId: catalog.customers[0]?.id || '',
    appointmentDate: '2026-06-15',
    appointmentTime: '10:00 AM',
    assignedAgent: CRM_AGENTS[0],
    meetingType: 'Video',
    status: 'Scheduled',
    notes: '',
  });

  useEffect(() => {
    setLeads(catalog.leads);
    setCustomers(catalog.customers);
    setAppointments(catalog.appointments);
    setCalls(catalog.calls);
    setSms(catalog.sms);
    setWhatsapp(catalog.whatsapp);
  }, [catalog]);

  const q = query.trim().toLowerCase();
  const activeCustomers = customers.filter((c) => c.status === 'Active').length;
  const scheduledAppointments = appointments.filter((a) => a.status === 'Scheduled').length;
  const completedAppointments = appointments.filter((a) => a.status === 'Completed').length;

  const filteredLeads = useMemo(() => leads.filter((lead) => {
    if (statusFilter !== 'all' && lead.status !== statusFilter) return false;
    if (!q) return true;
    return [lead.name, lead.email, lead.phone, lead.company, lead.id, lead.source, lead.assignedAgent].some((v) => v.toLowerCase().includes(q));
  }), [leads, q, statusFilter]);

  const filteredCustomers = useMemo(() => customers.filter((customer) => {
    if (statusFilter !== 'all' && customer.status !== statusFilter) return false;
    if (!q) return true;
    return [customer.name, customer.email, customer.company, customer.country, customer.phone].some((v) => v.toLowerCase().includes(q));
  }), [customers, q, statusFilter]);

  const filteredAppointments = useMemo(() => appointments.filter((item) => {
    if (statusFilter !== 'all' && item.status !== statusFilter) return false;
    if (!q) return true;
    return [item.customerName, item.assignedAgent, item.meetingType, item.notes, item.id].some((v) => v.toLowerCase().includes(q));
  }), [appointments, q, statusFilter]);

  const filteredCalls = useMemo(() => calls.filter((item) => {
    if (statusFilter !== 'all' && item.callOutcome !== statusFilter) return false;
    if (!q) return true;
    return [item.customerName, item.phoneNumber, item.agent, item.callOutcome, item.notes].some((v) => v.toLowerCase().includes(q));
  }), [calls, q, statusFilter]);

  const waThreads = useMemo(() => {
    const map = new Map<string, CrmWhatsAppMessage[]>();
    for (const message of whatsapp) {
      const list = map.get(message.customerId) || [];
      list.push(message);
      map.set(message.customerId, list);
    }
    return [...map.entries()].map(([customerId, messages]) => ({
      customerId,
      customerName: messages[0].customerName,
      messages: [...messages].sort((a, b) => a.timestamp.localeCompare(b.timestamp)),
    }));
  }, [whatsapp]);

  const activeThread = waThreads.find((thread) => thread.customerId === waCustomer) || waThreads[0];

  if (!features.crm_enabled) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16">
        <div className="bg-ink-900 border border-ink-border p-8 text-center">
          <div className="w-12 h-12 rounded-lg border border-rule bg-paper-inset flex items-center justify-center mx-auto mb-5">
            <Lock className="w-5 h-5 text-amber" />
          </div>
          <h2 className="text-xl font-semibold text-paper tracking-tight mb-2">CRM is locked</h2>
          <p className="text-paper/70 text-sm max-w-lg mx-auto mb-6 leading-relaxed">
            The Startup CRM includes leads, customers, appointments, call logs, SMS, WhatsApp, and reports.
          </p>
          <button
            onClick={() => onUpgradeInPlace('startup')}
            className="px-5 py-2.5 bg-amber hover:opacity-90 text-ink-950 text-sm font-semibold transition-colors"
          >
            Upgrade in-place to Startup
          </button>
        </div>
      </div>
    );
  }

  const openSection = (id: Section) => {
    setSection(id);
    setQuery('');
    setStatusFilter('all');
  };

  const saveLead = (event: React.FormEvent) => {
    event.preventDefault();
    if (!leadForm.name || !leadForm.email) return;
    const lead: CrmLead = {
      id: nextId('LEAD', leads.map((item) => item.id)),
      ...leadForm,
      createdDate: new Date().toISOString().slice(0, 10),
    };
    setLeads((prev) => [lead, ...prev]);
    setSelectedLead(lead.id);
    setModal(null);
    setLeadForm({ name: '', phone: '', email: '', company: '', source: 'Website', status: 'New', assignedAgent: CRM_AGENTS[0] });
  };

  const saveCustomer = (event: React.FormEvent) => {
    event.preventDefault();
    if (!customerForm.name) return;
    const customer: CrmCustomer = {
      id: nextId('CUST', customers.map((item) => item.id)),
      ...customerForm,
      company: customerForm.company || customerForm.name,
      totalAppointments: 0,
      lastContactDate: new Date().toISOString().slice(0, 10),
    };
    setCustomers((prev) => [customer, ...prev]);
    setSelectedCustomer(customer.id);
    setModal(null);
    setCustomerForm({ name: '', phone: '', email: '', company: '', country: '', status: 'Active', notes: '' });
  };

  const saveAppointment = (event: React.FormEvent) => {
    event.preventDefault();
    const customer = customers.find((item) => item.id === appointmentForm.customerId);
    if (!customer) return;
    const appointment: CrmAppointment = {
      id: nextId('APT', appointments.map((item) => item.id)),
      customerId: customer.id,
      customerName: customer.name,
      appointmentDate: appointmentForm.appointmentDate,
      appointmentTime: appointmentForm.appointmentTime,
      assignedAgent: appointmentForm.assignedAgent,
      meetingType: appointmentForm.meetingType,
      status: appointmentForm.status,
      notes: appointmentForm.notes,
    };
    setAppointments((prev) => [appointment, ...prev]);
    setSelectedAppointment(appointment.id);
    setModal(null);
  };

  const sendSms = (event: React.FormEvent) => {
    event.preventDefault();
    const customer = customers.find((item) => item.id === smsDraft.customerId);
    if (!customer || !smsDraft.message.trim()) return;
    const message: CrmSmsMessage = {
      id: nextId('SMS', sms.map((item) => item.id)),
      customer: customer.name,
      customerId: customer.id,
      phoneNumber: customer.phone,
      messagePreview: smsDraft.message.trim(),
      sentDate: new Date().toISOString().slice(0, 10),
      deliveryStatus: 'Sent',
    };
    setSms((prev) => [message, ...prev]);
    setSmsDraft((prev) => ({ ...prev, message: '' }));
  };

  const sendWhatsApp = () => {
    const customer = customers.find((item) => item.id === (activeThread?.customerId || waCustomer));
    if (!customer || !waDraft.trim()) return;
    const message: CrmWhatsAppMessage = {
      id: nextId('WA', whatsapp.map((item) => item.id)),
      customerId: customer.id,
      customerName: customer.name,
      message: waDraft.trim(),
      timestamp: new Date().toISOString(),
      sender: 'user',
      type: 'text',
      status: 'Sent',
    };
    setWhatsapp((prev) => [...prev, message]);
    setWaCustomer(customer.id);
    setWaDraft('');
  };

  const leadDetail = leads.find((item) => item.id === selectedLead);
  const customerDetail = customers.find((item) => item.id === selectedCustomer);
  const appointmentDetail = appointments.find((item) => item.id === selectedAppointment);
  const callDetail = calls.find((item) => item.id === selectedCall);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
      <div className="bg-paper-raised border border-rule p-5">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div>
            <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-ink-muted">Startup CRM</div>
            <h1 className="text-xl font-semibold text-ink-text mt-1">Sales CRM</h1>
            <p className="text-sm text-ink-muted mt-1">
              Leads, customers, appointments, calls, SMS, and WhatsApp use the same record properties as the sales prototype.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {section === 'leads' && <button onClick={() => setModal('lead')} className="px-3 py-1.5 bg-amber text-ink-950 text-sm font-semibold inline-flex items-center gap-1"><Plus className="w-3.5 h-3.5" /> Add Lead</button>}
            {section === 'customers' && <button onClick={() => setModal('customer')} className="px-3 py-1.5 bg-amber text-ink-950 text-sm font-semibold inline-flex items-center gap-1"><Plus className="w-3.5 h-3.5" /> Add Customer</button>}
            {section === 'appointments' && <button onClick={() => setModal('appointment')} className="px-3 py-1.5 bg-amber text-ink-950 text-sm font-semibold inline-flex items-center gap-1"><Plus className="w-3.5 h-3.5" /> New Appointment</button>}
          </div>
        </div>
        <div className="mt-4 flex gap-1 overflow-x-auto border border-rule bg-paper-inset p-1">
          {SECTIONS.map((item) => (
            <button
              key={item.id}
              onClick={() => openSection(item.id)}
              className={`px-3 py-1.5 text-sm whitespace-nowrap ${section === item.id ? 'bg-amber text-ink-950 font-semibold' : 'text-ink-muted hover:text-ink-text'}`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {section !== 'dashboard' && section !== 'whatsapp' && section !== 'reports' && (
        <div className="flex flex-col sm:flex-row gap-3 bg-paper-raised p-3 border border-rule">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-ink-muted absolute left-3 top-2.5" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={section === 'leads' ? 'Search by name, email, or phone...' : section === 'customers' ? 'Search by name, email, or company...' : 'Search records...'}
              className="w-full pl-9 pr-3 py-2 text-sm border border-rule bg-paper-raised"
            />
          </div>
          {(section === 'leads' || section === 'customers' || section === 'appointments' || section === 'calls') && (
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="text-sm border border-rule px-2.5 py-2 bg-paper-raised">
              <option value="all">{section === 'calls' ? 'All Outcomes' : 'All Statuses'}</option>
              {(section === 'leads' ? LEAD_STATUSES : section === 'customers' ? CUSTOMER_STATUSES : section === 'appointments' ? APPOINTMENT_STATUSES : CALL_OUTCOMES).map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          )}
        </div>
      )}

      {section === 'dashboard' && (
        <div className="space-y-5">
          <div>
            <h2 className="text-lg font-semibold text-ink-text">Dashboard</h2>
            <p className="text-sm text-ink-muted">Welcome back! Here's your sales performance overview.</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: 'Total Leads', value: String(leads.length), trend: catalog.dashboard.totalLeadsTrend, icon: Users },
              { label: 'New Leads Today', value: String(catalog.dashboard.newLeadsToday), trend: catalog.dashboard.newLeadsTrend, icon: Sparkles },
              { label: 'Active Customers', value: String(activeCustomers), trend: catalog.dashboard.activeCustomersTrend, icon: Building2 },
              { label: 'Scheduled Appointments', value: String(scheduledAppointments), trend: catalog.dashboard.scheduledAppointmentsTrend, icon: Calendar },
              { label: 'Completed Appointments', value: String(completedAppointments), trend: catalog.dashboard.completedAppointmentsTrend, icon: Calendar },
              { label: 'SMS Sent', value: String(sms.length), trend: catalog.dashboard.smsSentTrend, icon: MessageSquare },
              { label: 'WhatsApp Messages', value: String(whatsapp.length), trend: catalog.dashboard.whatsappTrend, icon: Send },
              { label: 'Conversion Rate', value: catalog.dashboard.conversionRate, trend: catalog.dashboard.conversionTrend, icon: BarChart3 },
            ].map((card) => (
              <div key={card.label} className="bg-paper-raised border border-rule p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-[11px] uppercase tracking-wider text-ink-muted">{card.label}</div>
                    <div className="text-2xl font-semibold font-mono mt-1">{card.value}</div>
                    <div className="text-[11px] text-ok mt-1">{card.trend}</div>
                  </div>
                  <card.icon className="w-4 h-4 text-ink-muted" />
                </div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-paper-raised border border-rule p-4">
              <h3 className="text-sm font-semibold mb-3">Leads Growth</h3>
              <Bars label="Leads growth" points={catalog.leadGrowth.map((point) => ({ label: point.month, value: point.value }))} />
            </div>
            <div className="bg-paper-raised border border-rule p-4">
              <h3 className="text-sm font-semibold mb-3">Appointment Status</h3>
              <div className="space-y-2">
                {catalog.appointmentStatus.map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-sm">
                    <span>{item.name}</span>
                    <span className="font-mono">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-paper-raised border border-rule p-4">
              <h3 className="text-sm font-semibold mb-3">Monthly Customer Acquisition</h3>
              <Bars label="Customer acquisition" points={catalog.customerAcquisition.map((point) => ({ label: point.month, value: point.value }))} />
            </div>
            <div className="bg-paper-raised border border-rule p-4">
              <h3 className="text-sm font-semibold mb-3">Agent Performance</h3>
              <div className="space-y-2">
                {catalog.agents.map((agent) => (
                  <div key={agent.agent} className="flex items-center justify-between text-sm border-b border-rule pb-2">
                    <span>{agent.agent}</span>
                    <span className="text-ink-muted">{agent.calls} calls · {agent.deals} deals</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="bg-paper-raised border border-rule p-4">
            <h3 className="text-sm font-semibold mb-3">Recent Activity</h3>
            <div className="space-y-3">
              {catalog.activities.map((activity) => (
                <div key={activity.id} className="flex items-start justify-between gap-3 text-sm">
                  <div>
                    <div className="text-ink-text">{activity.description}</div>
                    <div className="text-[11px] text-ink-muted mt-0.5">{activity.type} · {activity.user}</div>
                  </div>
                  <div className="text-[11px] font-mono text-ink-muted whitespace-nowrap">{formatTime(activity.timestamp)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {section === 'leads' && (
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Leads</h2>
            <p className="text-sm text-ink-muted">Manage and track all your sales leads</p>
          </div>
          <Table headers={['Lead ID', 'Name', 'Phone', 'Email', 'Company', 'Source', 'Status', 'Assigned Agent', 'Created']}>
            {filteredLeads.map((lead) => (
              <tr key={lead.id} onClick={() => setSelectedLead(lead.id)} className={`border-t border-rule cursor-pointer hover:bg-paper-inset ${selectedLead === lead.id ? 'bg-paper-inset' : ''}`}>
                <td className="px-3 py-2 font-mono text-xs">{lead.id}</td>
                <td className="px-3 py-2 font-medium whitespace-nowrap">{lead.name}</td>
                <td className="px-3 py-2 whitespace-nowrap">{lead.phone}</td>
                <td className="px-3 py-2">{lead.email}</td>
                <td className="px-3 py-2 whitespace-nowrap">{lead.company}</td>
                <td className="px-3 py-2">{lead.source}</td>
                <td className="px-3 py-2"><Badge value={lead.status} /></td>
                <td className="px-3 py-2 whitespace-nowrap">{lead.assignedAgent}</td>
                <td className="px-3 py-2 font-mono text-xs">{lead.createdDate}</td>
              </tr>
            ))}
          </Table>
          {leadDetail && (
            <div className="bg-paper-raised border border-rule p-4 space-y-3">
              <h3 className="font-semibold">Lead Details · {leadDetail.id}</h3>
              <PropertyList rows={[
                { label: 'Lead ID', value: leadDetail.id },
                { label: 'Full Name', value: leadDetail.name },
                { label: 'Phone', value: leadDetail.phone },
                { label: 'Email', value: leadDetail.email },
                { label: 'Company', value: leadDetail.company },
                { label: 'Source', value: leadDetail.source },
                { label: 'Status', value: <Badge value={leadDetail.status} /> },
                { label: 'Assigned Agent', value: leadDetail.assignedAgent },
                { label: 'Created', value: leadDetail.createdDate },
              ]} />
            </div>
          )}
        </div>
      )}

      {section === 'customers' && (
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Customers</h2>
            <p className="text-sm text-ink-muted">View and manage all your customers</p>
          </div>
          <Table headers={['Customer ID', 'Name', 'Phone', 'Email', 'Company', 'Country', 'Total Appointments', 'Last Contact', 'Status', 'Notes']}>
            {filteredCustomers.map((customer) => (
              <tr key={customer.id} onClick={() => setSelectedCustomer(customer.id)} className={`border-t border-rule cursor-pointer hover:bg-paper-inset ${selectedCustomer === customer.id ? 'bg-paper-inset' : ''}`}>
                <td className="px-3 py-2 font-mono text-xs">{customer.id}</td>
                <td className="px-3 py-2 font-medium whitespace-nowrap">{customer.name}</td>
                <td className="px-3 py-2 whitespace-nowrap">{customer.phone}</td>
                <td className="px-3 py-2">{customer.email}</td>
                <td className="px-3 py-2 whitespace-nowrap">{customer.company}</td>
                <td className="px-3 py-2 whitespace-nowrap">{customer.country}</td>
                <td className="px-3 py-2 font-mono">{customer.totalAppointments}</td>
                <td className="px-3 py-2 font-mono text-xs">{customer.lastContactDate}</td>
                <td className="px-3 py-2"><Badge value={customer.status} /></td>
                <td className="px-3 py-2 min-w-48">{customer.notes}</td>
              </tr>
            ))}
          </Table>
          {customerDetail && (
            <div className="bg-paper-raised border border-rule p-4 space-y-3">
              <h3 className="font-semibold">Customer Details</h3>
              <PropertyList rows={[
                { label: 'Customer ID', value: customerDetail.id },
                { label: 'Full Name', value: customerDetail.name },
                { label: 'Phone', value: customerDetail.phone },
                { label: 'Email', value: customerDetail.email },
                { label: 'Company', value: customerDetail.company },
                { label: 'Country', value: customerDetail.country },
                { label: 'Total Appointments', value: customerDetail.totalAppointments },
                { label: 'Last Contact', value: customerDetail.lastContactDate },
                { label: 'Account Status', value: <Badge value={customerDetail.status} /> },
                { label: 'Notes', value: customerDetail.notes },
              ]} />
            </div>
          )}
        </div>
      )}

      {section === 'appointments' && (
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Appointments</h2>
            <p className="text-sm text-ink-muted">Schedule and manage customer appointments</p>
          </div>
          <Table headers={['Appointment ID', 'Customer', 'Date', 'Time', 'Assigned Agent', 'Meeting Type', 'Status', 'Notes']}>
            {filteredAppointments.map((item) => (
              <tr key={item.id} onClick={() => setSelectedAppointment(item.id)} className={`border-t border-rule cursor-pointer hover:bg-paper-inset ${selectedAppointment === item.id ? 'bg-paper-inset' : ''}`}>
                <td className="px-3 py-2 font-mono text-xs">{item.id}</td>
                <td className="px-3 py-2 whitespace-nowrap">{item.customerName}</td>
                <td className="px-3 py-2 font-mono text-xs">{item.appointmentDate}</td>
                <td className="px-3 py-2">{item.appointmentTime}</td>
                <td className="px-3 py-2 whitespace-nowrap">{item.assignedAgent}</td>
                <td className="px-3 py-2">{item.meetingType}</td>
                <td className="px-3 py-2"><Badge value={item.status} /></td>
                <td className="px-3 py-2 min-w-40">{item.notes}</td>
              </tr>
            ))}
          </Table>
          {appointmentDetail && (
            <div className="bg-paper-raised border border-rule p-4">
              <h3 className="font-semibold mb-3">Appointment Details · {appointmentDetail.id}</h3>
              <PropertyList rows={[
                { label: 'Customer', value: `${appointmentDetail.customerName} (${appointmentDetail.customerId})` },
                { label: 'Date', value: appointmentDetail.appointmentDate },
                { label: 'Time', value: appointmentDetail.appointmentTime },
                { label: 'Assigned Agent', value: appointmentDetail.assignedAgent },
                { label: 'Meeting Type', value: appointmentDetail.meetingType },
                { label: 'Status', value: <Badge value={appointmentDetail.status} /> },
                { label: 'Notes', value: appointmentDetail.notes },
              ]} />
            </div>
          )}
        </div>
      )}

      {section === 'calls' && (
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Call Logs</h2>
            <p className="text-sm text-ink-muted">Twilio call history with outcome, duration, and recording status</p>
          </div>
          <Table headers={['Call ID', 'Customer', 'Phone Number', 'Agent', 'Call Date', 'Duration', 'Outcome', 'Recording', 'Notes']}>
            {filteredCalls.map((item) => (
              <tr key={item.id} onClick={() => setSelectedCall(item.id)} className={`border-t border-rule cursor-pointer hover:bg-paper-inset ${selectedCall === item.id ? 'bg-paper-inset' : ''}`}>
                <td className="px-3 py-2 font-mono text-xs">{item.id}</td>
                <td className="px-3 py-2 whitespace-nowrap">{item.customerName}</td>
                <td className="px-3 py-2 whitespace-nowrap">{item.phoneNumber}</td>
                <td className="px-3 py-2 whitespace-nowrap">{item.agent}</td>
                <td className="px-3 py-2 font-mono text-xs">{item.callDate}</td>
                <td className="px-3 py-2">{item.callDuration}</td>
                <td className="px-3 py-2"><Badge value={item.callOutcome} /></td>
                <td className="px-3 py-2"><Badge value={item.recordingStatus} /></td>
                <td className="px-3 py-2 min-w-40">{item.notes}</td>
              </tr>
            ))}
          </Table>
          {callDetail && (
            <div className="bg-paper-raised border border-rule p-4">
              <h3 className="font-semibold mb-3">Call Details</h3>
              <PropertyList rows={[
                { label: 'Call ID', value: callDetail.id },
                { label: 'Customer', value: `${callDetail.customerName} (${callDetail.customerId})` },
                { label: 'Phone Number', value: callDetail.phoneNumber },
                { label: 'Agent', value: callDetail.agent },
                { label: 'Call Date', value: callDetail.callDate },
                { label: 'Duration', value: callDetail.callDuration },
                { label: 'Outcome', value: <Badge value={callDetail.callOutcome} /> },
                { label: 'Recording', value: <Badge value={callDetail.recordingStatus} /> },
                { label: 'Notes', value: callDetail.notes || 'No notes recorded for this call.' },
              ]} />
            </div>
          )}
        </div>
      )}

      {section === 'sms' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <form onSubmit={sendSms} className="bg-paper-raised border border-rule p-4 space-y-3 lg:col-span-1">
            <h2 className="font-semibold">Send SMS</h2>
            <label className="block text-xs text-ink-muted">Customer
              <select value={smsDraft.customerId} onChange={(event) => setSmsDraft({ ...smsDraft, customerId: event.target.value })} className={`${fieldClass} mt-1`}>
                {customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.name}</option>)}
              </select>
            </label>
            <label className="block text-xs text-ink-muted">Message Content
              <textarea value={smsDraft.message} onChange={(event) => setSmsDraft({ ...smsDraft, message: event.target.value })} rows={4} placeholder="Type your message here..." className={`${fieldClass} mt-1`} />
            </label>
            <div className="text-xs text-ink-muted">Phone: {customers.find((item) => item.id === smsDraft.customerId)?.phone || '—'}</div>
            <button type="submit" className="px-3 py-1.5 bg-amber text-ink-950 text-sm font-semibold">Send SMS</button>
            <div className="pt-2 border-t border-rule space-y-2">
              <div className="text-xs uppercase tracking-wider text-ink-muted">Templates</div>
              {catalog.templates.map((template) => (
                <button
                  type="button"
                  key={template.id}
                  onClick={() => setSmsDraft((prev) => ({ ...prev, message: template.content }))}
                  className="block w-full text-left border border-rule px-2 py-2 hover:bg-paper-inset"
                >
                  <div className="text-sm font-medium">{template.name}</div>
                  <div className="text-xs text-ink-muted mt-0.5">{template.content}</div>
                </button>
              ))}
            </div>
          </form>
          <div className="lg:col-span-2 space-y-3">
            <h2 className="text-lg font-semibold">SMS History</h2>
            <Table headers={['SMS ID', 'Customer', 'Phone Number', 'Message', 'Sent Date', 'Delivery Status']}>
              {sms.filter((item) => !q || `${item.customer} ${item.messagePreview} ${item.phoneNumber}`.toLowerCase().includes(q)).map((item) => (
                <tr key={item.id} className="border-t border-rule">
                  <td className="px-3 py-2 font-mono text-xs">{item.id}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{item.customer}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{item.phoneNumber}</td>
                  <td className="px-3 py-2 min-w-56">{item.messagePreview}</td>
                  <td className="px-3 py-2 font-mono text-xs">{item.sentDate}</td>
                  <td className="px-3 py-2"><Badge value={item.deliveryStatus} /></td>
                </tr>
              ))}
            </Table>
          </div>
        </div>
      )}

      {section === 'whatsapp' && (
        <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] border border-rule bg-paper-raised min-h-[420px]">
          <div className="border-r border-rule">
            <div className="px-3 py-3 border-b border-rule text-sm font-semibold">Conversations</div>
            {waThreads.map((thread) => (
              <button
                key={thread.customerId}
                onClick={() => setWaCustomer(thread.customerId)}
                className={`w-full text-left px-3 py-3 border-b border-rule ${activeThread?.customerId === thread.customerId ? 'bg-paper-inset' : ''}`}
              >
                <div className="text-sm font-medium">{thread.customerName}</div>
                <div className="text-xs text-ink-muted truncate">{thread.messages.at(-1)?.message}</div>
              </button>
            ))}
          </div>
          <div className="flex flex-col">
            <div className="px-4 py-3 border-b border-rule">
              <div className="font-semibold">{activeThread?.customerName || 'WhatsApp'}</div>
              <div className="text-xs text-ink-muted">Properties: customer, message, timestamp, sender, type, status</div>
            </div>
            <div className="flex-1 p-4 space-y-3">
              {(activeThread?.messages || []).map((message) => (
                <div key={message.id} className={`max-w-md border border-rule px-3 py-2 ${message.sender === 'user' ? 'ml-auto bg-paper-inset' : 'bg-paper-raised'}`}>
                  <div className="text-sm">{message.message}</div>
                  <div className="text-[11px] text-ink-muted mt-1 flex gap-2">
                    <span>{message.sender}</span>
                    <span>{message.type}</span>
                    <Badge value={message.status} />
                    <span>{formatTime(message.timestamp)}</span>
                  </div>
                </div>
              ))}
              {!activeThread && <p className="text-sm text-ink-muted">No messages yet. Start a conversation!</p>}
            </div>
            <div className="p-3 border-t border-rule flex gap-2">
              <input value={waDraft} onChange={(event) => setWaDraft(event.target.value)} placeholder="Type a message..." className={fieldClass} />
              <button onClick={sendWhatsApp} className="px-3 py-2 bg-amber text-ink-950 text-sm font-semibold inline-flex items-center gap-1"><Send className="w-3.5 h-3.5" /> Send</button>
            </div>
          </div>
        </div>
      )}

      {section === 'reports' && (
        <div className="space-y-5">
          <div>
            <h2 className="text-lg font-semibold">Reports & Analytics</h2>
            <p className="text-sm text-ink-muted">Comprehensive sales and performance analytics</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {catalog.reports.kpis.map((kpi) => (
              <div key={kpi.label} className="bg-paper-raised border border-rule p-4">
                <div className="text-[11px] uppercase tracking-wider text-ink-muted">{kpi.label}</div>
                <div className="text-2xl font-semibold font-mono mt-1">{kpi.value}</div>
                <div className="text-[11px] text-ok mt-1">{kpi.trend}</div>
              </div>
            ))}
          </div>
          <div className="flex gap-1 border border-rule bg-paper-inset p-1 w-fit">
            {([
              ['leads', 'Leads'],
              ['appointments', 'Appointments'],
              ['customers', 'Customers'],
              ['agents', 'Agents'],
            ] as [ReportTab, string][]).map(([tab, label]) => (
              <button key={tab} onClick={() => setReportTab(tab)} className={`px-3 py-1.5 text-sm ${reportTab === tab ? 'bg-amber text-ink-950 font-semibold' : 'text-ink-muted'}`}>
                {label}
              </button>
            ))}
          </div>
          {reportTab === 'leads' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-paper-raised border border-rule p-4 lg:col-span-2">
                <h3 className="text-sm font-semibold mb-3">Lead Growth Trend · Leads Generated</h3>
                <Bars label="Lead growth trend" points={catalog.leadGrowth.map((point) => ({ label: point.month, value: point.value }))} />
              </div>
              <div className="bg-paper-raised border border-rule p-4">
                <h3 className="text-sm font-semibold mb-3">Lead Sources</h3>
                <div className="space-y-3">
                  {catalog.leadSources.map((source) => (
                    <div key={source.source}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{source.source}</span>
                        <span className="text-ink-muted">{source.count} leads · {source.percentage}%</span>
                      </div>
                      <div className="h-2 bg-paper-inset border border-rule"><div className="h-full bg-ink-text" style={{ width: `${source.percentage}%` }} /></div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-paper-raised border border-rule p-4">
                <h3 className="text-sm font-semibold mb-3">Lead Status Distribution</h3>
                <div className="space-y-2">
                  {catalog.leadStatuses.map((item) => (
                    <div key={item.status} className="flex justify-between text-sm">
                      <span>{item.status}</span>
                      <span className="font-mono">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          {reportTab === 'appointments' && (
            <div className="bg-paper-raised border border-rule p-4">
              <h3 className="text-sm font-semibold mb-3">Appointment Status Distribution</h3>
              <div className="space-y-2">
                {catalog.appointmentStatus.map((item) => (
                  <div key={item.name} className="flex justify-between text-sm">
                    <span>{item.name}</span>
                    <span className="font-mono">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {reportTab === 'customers' && (
            <div className="space-y-4">
              <div className="bg-paper-raised border border-rule p-4">
                <h3 className="text-sm font-semibold mb-3">Monthly Customer Acquisition · New Customers</h3>
                <Bars label="New customers" points={catalog.customerAcquisition.map((point) => ({ label: point.month, value: point.value }))} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-paper-raised border border-rule p-4"><div className="text-xs text-ink-muted">Total Customers</div><div className="text-2xl font-mono font-semibold">{catalog.reports.totalCustomers}</div><div className="text-xs text-ok">{catalog.reports.totalCustomersTrend}</div></div>
                <div className="bg-paper-raised border border-rule p-4"><div className="text-xs text-ink-muted">Active Customers</div><div className="text-2xl font-mono font-semibold">{catalog.reports.activeCustomers}</div><div className="text-xs text-ok">{catalog.reports.activeCustomersTrend}</div></div>
                <div className="bg-paper-raised border border-rule p-4"><div className="text-xs text-ink-muted">Avg Customer Value</div><div className="text-2xl font-mono font-semibold">{catalog.reports.avgCustomerValue}</div><div className="text-xs text-ok">{catalog.reports.avgCustomerValueTrend}</div></div>
              </div>
            </div>
          )}
          {reportTab === 'agents' && (
            <div className="bg-paper-raised border border-rule p-4 space-y-3">
              <h3 className="text-sm font-semibold">Agent Rankings</h3>
              {catalog.agents.map((agent) => (
                <div key={agent.agent} className="flex items-center justify-between border border-rule px-3 py-2">
                  <div>
                    <div className="text-sm font-medium">{agent.agent}</div>
                    <div className="text-xs text-ink-muted">{agent.calls} calls · {agent.deals} deals closed</div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-semibold">{((agent.deals / agent.calls) * 100).toFixed(1)}%</div>
                    <div className="text-[11px] text-ink-muted">close rate</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 z-50 bg-ink-950/80 flex items-center justify-center p-4">
          <form onSubmit={modal === 'lead' ? saveLead : modal === 'customer' ? saveCustomer : saveAppointment} className="bg-paper-raised max-w-lg w-full p-6 border border-rule space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">{modal === 'lead' ? 'Add Lead' : modal === 'customer' ? 'Add Customer' : 'New Appointment'}</h3>
              <button type="button" onClick={() => setModal(null)} className="text-sm text-ink-muted">Close</button>
            </div>
            {modal === 'lead' && (
              <>
                <input required placeholder="Full name" value={leadForm.name} onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })} className={fieldClass} />
                <input required placeholder="Phone" value={leadForm.phone} onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })} className={fieldClass} />
                <input required type="email" placeholder="Email" value={leadForm.email} onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })} className={fieldClass} />
                <input required placeholder="Company" value={leadForm.company} onChange={(e) => setLeadForm({ ...leadForm, company: e.target.value })} className={fieldClass} />
                <select value={leadForm.source} onChange={(e) => setLeadForm({ ...leadForm, source: e.target.value })} className={fieldClass}>{LEAD_SOURCES.map((s) => <option key={s}>{s}</option>)}</select>
                <select value={leadForm.status} onChange={(e) => setLeadForm({ ...leadForm, status: e.target.value })} className={fieldClass}>{LEAD_STATUSES.map((s) => <option key={s}>{s}</option>)}</select>
                <select value={leadForm.assignedAgent} onChange={(e) => setLeadForm({ ...leadForm, assignedAgent: e.target.value })} className={fieldClass}>{CRM_AGENTS.map((s) => <option key={s}>{s}</option>)}</select>
              </>
            )}
            {modal === 'customer' && (
              <>
                <input required placeholder="Full name" value={customerForm.name} onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })} className={fieldClass} />
                <input placeholder="Phone" value={customerForm.phone} onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })} className={fieldClass} />
                <input type="email" placeholder="Email" value={customerForm.email} onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })} className={fieldClass} />
                <input placeholder="Company" value={customerForm.company} onChange={(e) => setCustomerForm({ ...customerForm, company: e.target.value })} className={fieldClass} />
                <input placeholder="Country" value={customerForm.country} onChange={(e) => setCustomerForm({ ...customerForm, country: e.target.value })} className={fieldClass} />
                <select value={customerForm.status} onChange={(e) => setCustomerForm({ ...customerForm, status: e.target.value })} className={fieldClass}>{CUSTOMER_STATUSES.map((s) => <option key={s}>{s}</option>)}</select>
                <textarea placeholder="Notes" value={customerForm.notes} onChange={(e) => setCustomerForm({ ...customerForm, notes: e.target.value })} className={fieldClass} rows={3} />
              </>
            )}
            {modal === 'appointment' && (
              <>
                <select value={appointmentForm.customerId} onChange={(e) => setAppointmentForm({ ...appointmentForm, customerId: e.target.value })} className={fieldClass}>{customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
                <input type="date" value={appointmentForm.appointmentDate} onChange={(e) => setAppointmentForm({ ...appointmentForm, appointmentDate: e.target.value })} className={fieldClass} />
                <input placeholder="Time" value={appointmentForm.appointmentTime} onChange={(e) => setAppointmentForm({ ...appointmentForm, appointmentTime: e.target.value })} className={fieldClass} />
                <select value={appointmentForm.assignedAgent} onChange={(e) => setAppointmentForm({ ...appointmentForm, assignedAgent: e.target.value })} className={fieldClass}>{CRM_AGENTS.map((s) => <option key={s}>{s}</option>)}</select>
                <select value={appointmentForm.meetingType} onChange={(e) => setAppointmentForm({ ...appointmentForm, meetingType: e.target.value })} className={fieldClass}>{MEETING_TYPES.map((s) => <option key={s}>{s}</option>)}</select>
                <select value={appointmentForm.status} onChange={(e) => setAppointmentForm({ ...appointmentForm, status: e.target.value })} className={fieldClass}>{APPOINTMENT_STATUSES.map((s) => <option key={s}>{s}</option>)}</select>
                <textarea placeholder="Notes" value={appointmentForm.notes} onChange={(e) => setAppointmentForm({ ...appointmentForm, notes: e.target.value })} className={fieldClass} rows={3} />
              </>
            )}
            <button type="submit" className="px-4 py-2 bg-amber text-ink-950 text-sm font-semibold">Save</button>
          </form>
        </div>
      )}
    </div>
  );
};
