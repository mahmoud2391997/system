export type WorkspaceTier = 'startup' | 'team' | 'enterprise';

export interface WorkspaceFeatures {
  workspace_id: string;
  tier: WorkspaceTier;
  crm_enabled: boolean;
  team_enabled: boolean;
  erp_enabled: boolean;
  max_seats: number;
  automation_caps: {
    emails: number;
    messages: number;
    calls: number;
  };
  automation_usage: {
    emails: number;
    messages: number;
    calls: number;
  };
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  created_at: string;
  current_user_role: 'owner' | 'admin' | 'manager' | 'member';
}

export interface WorkspaceMember {
  id: string;
  workspace_id: string;
  user_id?: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'manager' | 'member';
  avatar?: string;
  status: 'active' | 'invited';
}

export type RiskClassification = 'safe' | 'confirmation_required' | 'high_risk';

export interface ApprovalAction {
  id: string;
  workspace_id: string;
  tool_name: string;
  skill_title: string;
  risk_level: RiskClassification;
  idempotency_key: string;
  status: 'pending' | 'approved' | 'rejected';
  summary: string;
  parameters: Record<string, any>;
  requested_by: string;
  created_at: string;
  resolved_at?: string;
  resolved_by?: string;
  external_impact_warning?: string;
}

export interface AuditLogEntry {
  id: string;
  workspace_id: string;
  timestamp: string;
  actor: {
    type: 'ai_agent' | 'user';
    name: string;
    role?: string;
  };
  skill: string;
  risk_level: RiskClassification;
  idempotency_key: string;
  action_summary: string;
  status: 'executed' | 'halted_awaiting_approval' | 'rejected' | 'failed';
  module: 'crm' | 'team' | 'erp' | 'personal' | 'system';
  payload?: Record<string, any>;
  duration_ms?: number;
}

export interface AgentMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
  reasoning_trace?: string[];
  tool_invocations?: {
    id: string;
    tool_name: string;
    risk: RiskClassification;
    status: 'safe_executed' | 'awaiting_approval' | 'approved_executed' | 'rejected';
    parameters: Record<string, any>;
    result?: any;
    approval_id?: string;
  }[];
}

// CRM Models (Startup+) — record properties match the sales CRM prototype
export type CrmLeadStatus = 'New' | 'Contacted' | 'Qualified' | 'Proposal Sent' | 'Won' | 'Lost';
export type CrmLeadSource = 'Website' | 'LinkedIn' | 'Referral' | 'Email Campaign' | 'Trade Show';
export type CrmCustomerStatus = 'Active' | 'Inactive';
export type CrmMeetingType = 'Video' | 'Call' | 'In-person';
export type CrmAppointmentStatus = 'Scheduled' | 'Confirmed' | 'Completed' | 'No Show' | 'Cancelled' | 'Rescheduled';
export type CrmCallOutcome = 'Answered' | 'Voicemail' | 'No Answer' | 'Busy';
export type CrmRecordingStatus = 'Available' | 'Not Available';
export type CrmDeliveryStatus = 'Delivered' | 'Pending' | 'Failed' | 'Sent';

export interface CrmLead {
  id: string;
  name: string;
  phone: string;
  email: string;
  company: string;
  source: CrmLeadSource | string;
  status: CrmLeadStatus | string;
  assignedAgent: string;
  createdDate: string;
}

export interface CrmCustomer {
  id: string;
  name: string;
  phone: string;
  email: string;
  company: string;
  country: string;
  totalAppointments: number;
  lastContactDate: string;
  status: CrmCustomerStatus | string;
  notes: string;
}

export interface CrmAppointment {
  id: string;
  customerName: string;
  customerId: string;
  appointmentDate: string;
  appointmentTime: string;
  assignedAgent: string;
  meetingType: CrmMeetingType | string;
  status: CrmAppointmentStatus | string;
  notes: string;
}

export interface CrmCallLog {
  id: string;
  customerName: string;
  customerId: string;
  phoneNumber: string;
  agent: string;
  callDate: string;
  callDuration: string;
  callOutcome: CrmCallOutcome | string;
  recordingStatus: CrmRecordingStatus | string;
  notes: string;
}

export interface CrmSmsMessage {
  id: string;
  customer: string;
  customerId: string;
  phoneNumber: string;
  messagePreview: string;
  sentDate: string;
  deliveryStatus: CrmDeliveryStatus | string;
}

export interface CrmSmsTemplate {
  id: string;
  name: string;
  content: string;
}

export interface CrmWhatsAppMessage {
  id: string;
  customerId: string;
  customerName: string;
  message: string;
  timestamp: string;
  sender: 'customer' | 'user';
  type: 'text' | string;
  status: 'Read' | 'Delivered' | 'Sent' | string;
}

export interface CrmActivity {
  id: string;
  type: 'lead' | 'appointment' | 'call' | 'sms' | 'whatsapp' | string;
  description: string;
  timestamp: string;
  user: string;
}

export interface CrmNamedCount {
  name: string;
  value: number;
}

export interface CrmMonthPoint {
  month: string;
  value: number;
}

export interface CrmSourceStat {
  source: string;
  count: number;
  percentage: number;
}

export interface CrmStatusStat {
  status: string;
  count: number;
}

export interface CrmAgentStat {
  agent: string;
  calls: number;
  deals: number;
}

export interface CrmMetric {
  label: string;
  value: string;
  trend: string;
}

export interface CrmCatalog {
  leads: CrmLead[];
  customers: CrmCustomer[];
  appointments: CrmAppointment[];
  calls: CrmCallLog[];
  sms: CrmSmsMessage[];
  templates: CrmSmsTemplate[];
  whatsapp: CrmWhatsAppMessage[];
  activities: CrmActivity[];
  leadGrowth: CrmMonthPoint[];
  customerAcquisition: CrmMonthPoint[];
  appointmentStatus: CrmNamedCount[];
  agents: CrmAgentStat[];
  leadSources: CrmSourceStat[];
  leadStatuses: CrmStatusStat[];
  dashboard: {
    newLeadsToday: number;
    newLeadsTrend: string;
    totalLeadsTrend: string;
    activeCustomersTrend: string;
    scheduledAppointmentsTrend: string;
    completedAppointmentsTrend: string;
    smsSentTrend: string;
    whatsappTrend: string;
    conversionRate: string;
    conversionTrend: string;
  };
  reports: {
    kpis: CrmMetric[];
    totalCustomers: string;
    totalCustomersTrend: string;
    activeCustomers: string;
    activeCustomersTrend: string;
    avgCustomerValue: string;
    avgCustomerValueTrend: string;
  };
}

export interface ContactNote {
  id: string;
  author: string;
  timestamp: string;
  text: string;
  channel?: string;
}

export interface LeadContact {
  id: string;
  workspace_id: string;
  name: string;
  company: string;
  email: string;
  phone?: string;
  channel: 'email' | 'whatsapp' | 'telegram' | 'phone' | 'web';
  status: 'lead' | 'contact' | 'customer';
  lead_score: number; // 0 - 100
  tags: string[];
  last_activity: string;
  ai_summary?: string;
  notes?: ContactNote[];
}

export interface Deal {
  id: string;
  workspace_id: string;
  title: string;
  contact_id: string;
  contact_name: string;
  value: number;
  stage: 'prospect' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost';
  probability: number;
  expected_close: string;
  updated_at: string;
}

// Team Models (Team+) — same records as the team management dashboard
export type TeamTaskStatus = 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'COMPLETED';
export type TeamTaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type TeamEmployeeStatus = 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE';
export type TeamRole = 'ADMIN' | 'MANAGER' | 'EMPLOYEE';

export interface TeamDepartment {
  id: string;
  name: string;
  description: string;
  manager_id: string;
  manager_name: string;
}

export interface TeamEmployee {
  id: string;
  profile_id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: TeamRole | string;
  position: string;
  department_id: string;
  department_name: string;
  manager_name: string;
  status: TeamEmployeeStatus | string;
  salary: number;
  join_date: string;
}

export interface TeamTask {
  id: string;
  title: string;
  description: string;
  status: TeamTaskStatus | string;
  priority: TeamTaskPriority | string;
  department_id: string;
  department_name: string;
  assignee_id: string;
  assignee_name: string;
  created_by_id: string;
  created_by_name: string;
  due_date: string;
}

export interface TeamMemberAccount {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: TeamRole | string;
}

export interface TeamInvitation {
  id: string;
  email: string;
  role: string;
  created_at: string;
}

export interface TeamRoleDefinition {
  id: string;
  name: string;
  label: string;
  builtin: boolean;
  permissions: string[];
}

export interface TeamNotification {
  id: string;
  title: string;
  message: string;
  created_at: string;
  read: boolean;
  type: 'team_invitation' | 'task' | string;
}

export interface TeamProfile {
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  member_since: string;
}

export interface TeamInfo {
  id: string;
  name: string;
}

export interface TeamCatalog {
  viewer_id: string;
  viewer_name: string;
  viewer_role: string;
  departments: TeamDepartment[];
  employees: TeamEmployee[];
  tasks: TeamTask[];
  team: TeamInfo;
  profile: TeamProfile;
  members: TeamMemberAccount[];
  invitations: TeamInvitation[];
  roles: TeamRoleDefinition[];
  notifications: TeamNotification[];
}

export interface ProjectTask {
  id: string;
  workspace_id: string;
  title: string;
  description?: string;
  assignee_id?: string;
  assignee_name?: string;
  status: 'todo' | 'in_progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'critical';
  due_date: string;
  time_spent_hours: number;
}

// ERP Models (Enterprise+)
export interface Invoice {
  id: string;
  workspace_id: string;
  invoice_number: string;
  client_name: string;
  amount: number;
  currency: string;
  status: 'draft' | 'pending_approval' | 'sent' | 'paid';
  issue_date: string;
  due_date: string;
  line_items: {
    description: string;
    quantity: number;
    unit_price: number;
  }[];
}

export interface InventoryItem {
  id: string;
  workspace_id: string;
  sku: string;
  name: string;
  category: string;
  stock_quantity: number;
  reorder_point: number;
  unit_cost: number;
}

export interface ErpCompany {
  nameAr: string;
  nameEn: string;
  address: string;
  city: string;
  country: string;
  phone: string;
  email: string;
  crNumber: string;
  vatNumber: string;
  currency: string;
  vatRatePct: number;
  varianceThresholdPct: number;
  notifyEmail: string;
}

export interface ErpUser {
  id: string;
  email: string;
  fullName: string;
  role: string;
  active: boolean;
}

export interface ErpAccount {
  code: string;
  nameAr: string;
  type: string;
}

export interface ErpWarehouse {
  key: string;
  nameAr: string;
  locations: { code: string; nameAr: string }[];
}

export interface ErpMaterial {
  id: string;
  code: string;
  nameAr: string;
  category: string;
  unit: string;
  minQty: number;
  vatTreatment: string;
  barcode: string;
  active: boolean;
}

export interface ErpProduct {
  id: string;
  code: string;
  nameAr: string;
  unit: string;
  salePrice: number;
  vatTreatment: string;
  barcode: string;
  bagKg: number;
  active: boolean;
}

export interface ErpParty {
  id: string;
  code: string;
  nameAr: string;
  vatNumber: string;
  phone: string;
  email: string;
  address: string;
}

export interface ErpEmployee {
  id: string;
  code: string;
  nameAr: string;
  department: string;
  jobTitle: string;
  basicSalary: number;
  active: boolean;
}

export interface ErpRecipe {
  id: string;
  productId: string;
  nameAr: string;
  baseOutputQty: number;
  items: { materialId: string; qty: number }[];
}

export interface ErpBalance {
  id: string;
  warehouse: string;
  itemType: string;
  itemId: string;
  batchNo: string;
  qty: number;
  unitCost: number;
  expiryDate: string;
  receivedAt: string;
}

export interface ErpLedgerEntry {
  id: string;
  at: string;
  type: string;
  warehouse: string;
  itemType: string;
  itemId: string;
  batchNo: string;
  qty: number;
  unitCost: number;
  prevQty: number;
  newQty: number;
  refType: string;
  refId: string;
  userId: string;
  notes: string;
}

export interface ErpPurchaseOrder {
  id: string;
  number: string;
  supplierId: string;
  status: string;
  notes: string;
  lines: { materialId: string; qty: number; unitCost: number; receivedQty: number }[];
  createdBy: string;
  createdAt: string;
  decidedBy?: string;
  decidedAt?: string;
}

export interface ErpGoodsReceipt {
  id: string;
  number: string;
  purchaseOrderId: string;
  at: string;
  createdBy: string;
  lines: { materialId: string; qty: number; unitCost: number; batchNo: string; expiryDate: string }[];
}

export interface ErpTransfer {
  id: string;
  number: string;
  from: string;
  to: string;
  at: string;
  createdBy: string;
  notes: string;
  lines: { itemType: string; itemId: string; batchNo: string; qty: number }[];
}

export interface ErpAdjustment {
  id: string;
  number: string;
  warehouse: string;
  itemId: string;
  batchNo: string;
  delta: number;
  reason: string;
  status: string;
  createdAt: string;
}

export interface ErpProductionOrder {
  id: string;
  number: string;
  productId: string;
  recipeId: string;
  plannedQty: number;
  status: string;
  expected: { materialId: string; expectedQty: number; actualQty: number; wasteQty: number }[];
  actualOutputQty: number;
  totalCost: number;
  unitCost: number;
  outputBatch: string;
  varianceReason: string;
  createdBy: string;
  createdAt: string;
  completedAt: string;
}

export interface ErpSalesInvoice {
  id: string;
  number: string;
  customerId: string;
  status: string;
  issuedAt: string;
  notes: string;
  lines: {
    productId: string;
    qty: number;
    unitPrice: number;
    vatTreatment: string;
    vatRatePct: number;
    net: number;
    vat: number;
    total: number;
    batchNo: string;
    unitCost: number;
  }[];
  subtotal: number;
  vatAmount: number;
  total: number;
  paidAmount: number;
  createdBy: string;
}

export interface ErpPayment {
  id: string;
  number: string;
  invoiceId: string;
  amount: number;
  method: string;
  at: string;
  createdBy: string;
}

export interface ErpWithdrawal {
  id: string;
  number: string;
  productId: string;
  qty: number;
  notes: string;
  at: string;
}

export interface ErpExpense {
  id: string;
  number: string;
  category: string;
  description: string;
  amount: number;
  vatTreatment: string;
  payFrom: string;
  status: string;
  vatAmount: number;
  total: number;
  createdBy: string;
  createdAt: string;
}

export interface ErpJournal {
  id: string;
  number: string;
  at: string;
  memo: string;
  refType: string;
  refId: string;
  lines: { accountCode: string; debit: number; credit: number }[];
}

export interface ErpAttendance {
  id: string;
  employeeId: string;
  date: string;
  checkIn: string;
  checkOut: string;
  source: string;
}

export interface ErpPayroll {
  id: string;
  number: string;
  month: string;
  status: string;
  lines: {
    employeeId: string;
    basic: number;
    overtimeHours: number;
    overtimeAmount: number;
    allowances: number;
    deductions: number;
    gross: number;
    net: number;
  }[];
  totalNet: number;
  createdBy: string;
  createdAt: string;
}

export interface ErpFactoryTask {
  id: string;
  title: string;
  assigneeRole: string;
  dueDate: string;
  status: string;
  createdAt: string;
}

export interface ErpNotification {
  id: string;
  kind: string;
  title: string;
  body: string;
  dedupeKey: string;
  roles: string[];
  read: boolean;
  emailStatus: string;
  at: string;
}

export interface ErpAuditLog {
  id: string;
  at: string;
  userId: string;
  userName: string;
  action: string;
  entity: string;
  entityId: string;
  detail: string;
}

export interface ErpCatalog {
  company: ErpCompany;
  rolePermissions: Record<string, string[]>;
  users: ErpUser[];
  accounts: ErpAccount[];
  warehouses: ErpWarehouse[];
  materials: ErpMaterial[];
  products: ErpProduct[];
  suppliers: ErpParty[];
  customers: ErpParty[];
  employees: ErpEmployee[];
  recipes: ErpRecipe[];
  balances: ErpBalance[];
  ledger: ErpLedgerEntry[];
  purchaseOrders: ErpPurchaseOrder[];
  goodsReceipts: ErpGoodsReceipt[];
  transfers: ErpTransfer[];
  adjustments: ErpAdjustment[];
  productionOrders: ErpProductionOrder[];
  invoices: ErpSalesInvoice[];
  payments: ErpPayment[];
  withdrawals: ErpWithdrawal[];
  expenses: ErpExpense[];
  journals: ErpJournal[];
  attendance: ErpAttendance[];
  payrolls: ErpPayroll[];
  tasks: ErpFactoryTask[];
  notifications: ErpNotification[];
  auditLogs: ErpAuditLog[];
  sequences: Record<string, number>;
  viewer: { id: string; fullName: string; role: string; email: string };
}

export interface IntegrationStatus {
  id: string;
  name: string;
  type: 'email' | 'calendar' | 'whatsapp' | 'telegram' | 'voice' | 'search';
  connected: boolean;
  provider: string;
  auth_type: string;
  last_sync: string;
  latency_ms?: number;
  description?: string;
}
