import { CrmCatalog } from './types';

export const crmCatalog: CrmCatalog = {
  leads: [
    { id: 'LEAD001', name: 'John Smith', phone: '+1-555-0101', email: 'john.smith@example.com', company: 'Tech Solutions Inc', source: 'Website', status: 'Qualified', assignedAgent: 'Sarah Johnson', createdDate: '2026-06-01' },
    { id: 'LEAD002', name: 'Emily Davis', phone: '+1-555-0102', email: 'emily.davis@example.com', company: 'Global Enterprises', source: 'LinkedIn', status: 'Contacted', assignedAgent: 'Michael Chen', createdDate: '2026-06-02' },
    { id: 'LEAD003', name: 'Robert Wilson', phone: '+1-555-0103', email: 'robert.wilson@example.com', company: 'Innovation Labs', source: 'Referral', status: 'Proposal Sent', assignedAgent: 'Sarah Johnson', createdDate: '2026-06-03' },
    { id: 'LEAD004', name: 'Jessica Martinez', phone: '+1-555-0104', email: 'jessica.martinez@example.com', company: 'Digital Marketing Co', source: 'Email Campaign', status: 'New', assignedAgent: 'David Lee', createdDate: '2026-06-04' },
    { id: 'LEAD005', name: 'James Brown', phone: '+1-555-0105', email: 'james.brown@example.com', company: 'Cloud Systems Ltd', source: 'Website', status: 'Won', assignedAgent: 'Sarah Johnson', createdDate: '2026-05-28' },
    { id: 'LEAD006', name: 'Amanda Taylor', phone: '+1-555-0106', email: 'amanda.taylor@example.com', company: 'Enterprise Solutions', source: 'Trade Show', status: 'Contacted', assignedAgent: 'Michael Chen', createdDate: '2026-06-05' },
    { id: 'LEAD007', name: 'Christopher Lee', phone: '+1-555-0107', email: 'christopher.lee@example.com', company: 'Tech Ventures', source: 'Referral', status: 'Lost', assignedAgent: 'David Lee', createdDate: '2026-05-20' },
    { id: 'LEAD008', name: 'Michelle Garcia', phone: '+1-555-0108', email: 'michelle.garcia@example.com', company: 'Business Innovations', source: 'LinkedIn', status: 'Qualified', assignedAgent: 'Sarah Johnson', createdDate: '2026-06-06' },
  ],
  customers: [
    { id: 'CUST001', name: 'Acme Corporation', phone: '+1-555-1001', email: 'contact@acme.com', company: 'Acme Corporation', country: 'United States', totalAppointments: 12, lastContactDate: '2026-06-08', status: 'Active', notes: 'Premium customer, high-value account' },
    { id: 'CUST002', name: 'Global Tech Solutions', phone: '+1-555-1002', email: 'sales@globaltech.com', company: 'Global Tech Solutions', country: 'Canada', totalAppointments: 8, lastContactDate: '2026-06-07', status: 'Active', notes: 'Regular engagement, expanding services' },
    { id: 'CUST003', name: 'Digital Innovations Ltd', phone: '+1-555-1003', email: 'info@digitalinnovations.com', company: 'Digital Innovations Ltd', country: 'United Kingdom', totalAppointments: 15, lastContactDate: '2026-06-06', status: 'Active', notes: 'Long-term partner, consistent growth' },
    { id: 'CUST004', name: 'Enterprise Systems', phone: '+1-555-1004', email: 'contact@enterprise.com', company: 'Enterprise Systems', country: 'United States', totalAppointments: 5, lastContactDate: '2026-05-20', status: 'Inactive', notes: 'Dormant account, needs reactivation' },
    { id: 'CUST005', name: 'Cloud Services Inc', phone: '+1-555-1005', email: 'sales@cloudservices.com', company: 'Cloud Services Inc', country: 'Australia', totalAppointments: 20, lastContactDate: '2026-06-08', status: 'Active', notes: 'Top customer, strategic partnership' },
  ],
  appointments: [
    { id: 'APT001', customerName: 'Acme Corporation', customerId: 'CUST001', appointmentDate: '2026-06-10', appointmentTime: '10:00 AM', assignedAgent: 'Sarah Johnson', meetingType: 'Video', status: 'Scheduled', notes: 'Quarterly business review' },
    { id: 'APT002', customerName: 'Global Tech Solutions', customerId: 'CUST002', appointmentDate: '2026-06-11', appointmentTime: '02:00 PM', assignedAgent: 'Michael Chen', meetingType: 'Call', status: 'Confirmed', notes: 'Product demo and pricing discussion' },
    { id: 'APT003', customerName: 'Digital Innovations Ltd', customerId: 'CUST003', appointmentDate: '2026-06-09', appointmentTime: '03:30 PM', assignedAgent: 'Sarah Johnson', meetingType: 'In-person', status: 'Completed', notes: 'Contract renewal negotiation' },
    { id: 'APT004', customerName: 'Cloud Services Inc', customerId: 'CUST005', appointmentDate: '2026-06-12', appointmentTime: '11:00 AM', assignedAgent: 'David Lee', meetingType: 'Video', status: 'Scheduled', notes: 'New feature implementation planning' },
    { id: 'APT005', customerName: 'Enterprise Systems', customerId: 'CUST004', appointmentDate: '2026-06-08', appointmentTime: '09:00 AM', assignedAgent: 'Michael Chen', meetingType: 'Call', status: 'No Show', notes: 'Account reactivation discussion' },
  ],
  calls: [
    { id: 'CALL001', customerName: 'Acme Corporation', customerId: 'CUST001', phoneNumber: '+1-555-1001', agent: 'Sarah Johnson', callDate: '2026-06-08', callDuration: '18 min', callOutcome: 'Answered', recordingStatus: 'Available', notes: 'Discussed new service options' },
    { id: 'CALL002', customerName: 'Global Tech Solutions', customerId: 'CUST002', phoneNumber: '+1-555-1002', agent: 'Michael Chen', callDate: '2026-06-08', callDuration: '12 min', callOutcome: 'Answered', recordingStatus: 'Available', notes: 'Follow-up on proposal' },
    { id: 'CALL003', customerName: 'Digital Innovations Ltd', customerId: 'CUST003', phoneNumber: '+1-555-1003', agent: 'David Lee', callDate: '2026-06-07', callDuration: '25 min', callOutcome: 'Answered', recordingStatus: 'Available', notes: 'Contract review and Q&A' },
    { id: 'CALL004', customerName: 'Cloud Services Inc', customerId: 'CUST005', phoneNumber: '+1-555-1005', agent: 'Sarah Johnson', callDate: '2026-06-07', callDuration: '5 min', callOutcome: 'Voicemail', recordingStatus: 'Not Available', notes: 'Left detailed voicemail' },
    { id: 'CALL005', customerName: 'Enterprise Systems', customerId: 'CUST004', phoneNumber: '+1-555-1004', agent: 'Michael Chen', callDate: '2026-06-06', callDuration: '8 min', callOutcome: 'No Answer', recordingStatus: 'Not Available', notes: 'No answer, will retry tomorrow' },
  ],
  sms: [
    { id: 'SMS001', customer: 'Acme Corporation', customerId: 'CUST001', phoneNumber: '+1-555-1001', messagePreview: 'Hi, confirming our meeting tomorrow at 10 AM...', sentDate: '2026-06-08', deliveryStatus: 'Delivered' },
    { id: 'SMS002', customer: 'Global Tech Solutions', customerId: 'CUST002', phoneNumber: '+1-555-1002', messagePreview: 'Thank you for your interest. Here is the pricing...', sentDate: '2026-06-08', deliveryStatus: 'Delivered' },
    { id: 'SMS003', customer: 'Digital Innovations Ltd', customerId: 'CUST003', phoneNumber: '+1-555-1003', messagePreview: 'Your contract has been updated. Please review...', sentDate: '2026-06-07', deliveryStatus: 'Delivered' },
    { id: 'SMS004', customer: 'Cloud Services Inc', customerId: 'CUST005', phoneNumber: '+1-555-1005', messagePreview: 'Reminder: New features available in your dashboard', sentDate: '2026-06-07', deliveryStatus: 'Pending' },
    { id: 'SMS005', customer: 'Enterprise Systems', customerId: 'CUST004', phoneNumber: '+1-555-1004', messagePreview: 'We miss you! Let us know how we can help...', sentDate: '2026-06-06', deliveryStatus: 'Failed' },
  ],
  templates: [
    { id: 'TMPL001', name: 'Meeting Confirmation', content: 'Hi {name}, confirming our meeting on {date} at {time}. Looking forward to speaking with you!' },
    { id: 'TMPL002', name: 'Follow-up', content: 'Hi {name}, following up on our previous conversation. Do you have any questions?' },
    { id: 'TMPL003', name: 'Proposal Sent', content: "Hi {name}, I've sent you the proposal. Please review and let me know your thoughts." },
    { id: 'TMPL004', name: 'Thank You', content: 'Thank you {name} for your business! We look forward to working with you.' },
  ],
  whatsapp: [
    { id: 'WA001', customerId: 'CUST001', customerName: 'Acme Corporation', message: 'Hi Sarah, just confirming our meeting tomorrow', timestamp: '2026-06-08T14:30:00', sender: 'customer', type: 'text', status: 'Read' },
    { id: 'WA002', customerId: 'CUST001', customerName: 'Acme Corporation', message: 'Yes, confirmed! Looking forward to discussing the new features.', timestamp: '2026-06-08T14:35:00', sender: 'user', type: 'text', status: 'Delivered' },
    { id: 'WA003', customerId: 'CUST002', customerName: 'Global Tech Solutions', message: 'Can you send me the updated proposal?', timestamp: '2026-06-08T10:15:00', sender: 'customer', type: 'text', status: 'Read' },
    { id: 'WA004', customerId: 'CUST002', customerName: 'Global Tech Solutions', message: 'Absolutely! Sending it now via email.', timestamp: '2026-06-08T10:20:00', sender: 'user', type: 'text', status: 'Delivered' },
  ],
  activities: [
    { id: 'ACT001', type: 'lead', description: 'New lead added: Michelle Garcia from Business Innovations', timestamp: '2026-06-08T16:45:00', user: 'Sarah Johnson' },
    { id: 'ACT002', type: 'appointment', description: 'Appointment scheduled with Acme Corporation for June 10', timestamp: '2026-06-08T15:20:00', user: 'Sarah Johnson' },
    { id: 'ACT003', type: 'call', description: 'Call completed with Global Tech Solutions (12 min)', timestamp: '2026-06-08T14:00:00', user: 'Michael Chen' },
    { id: 'ACT004', type: 'sms', description: 'SMS sent to Cloud Services Inc - Reminder about new features', timestamp: '2026-06-07T11:30:00', user: 'System' },
    { id: 'ACT005', type: 'whatsapp', description: 'WhatsApp message received from Acme Corporation', timestamp: '2026-06-08T14:30:00', user: 'Acme Corporation' },
  ],
  leadGrowth: [
    { month: 'Jan', value: 24 },
    { month: 'Feb', value: 35 },
    { month: 'Mar', value: 28 },
    { month: 'Apr', value: 42 },
    { month: 'May', value: 38 },
    { month: 'Jun', value: 45 },
  ],
  customerAcquisition: [
    { month: 'Jan', value: 12 },
    { month: 'Feb', value: 18 },
    { month: 'Mar', value: 15 },
    { month: 'Apr', value: 22 },
    { month: 'May', value: 25 },
    { month: 'Jun', value: 28 },
  ],
  appointmentStatus: [
    { name: 'Scheduled', value: 35 },
    { name: 'Completed', value: 45 },
    { name: 'Cancelled', value: 12 },
    { name: 'No Show', value: 8 },
  ],
  agents: [
    { agent: 'Sarah Johnson', calls: 45, deals: 12 },
    { agent: 'Michael Chen', calls: 38, deals: 10 },
    { agent: 'David Lee', calls: 32, deals: 8 },
    { agent: 'Lisa Anderson', calls: 40, deals: 11 },
  ],
  leadSources: [
    { source: 'Website', count: 45, percentage: 35 },
    { source: 'LinkedIn', count: 38, percentage: 30 },
    { source: 'Referral', count: 25, percentage: 20 },
    { source: 'Email Campaign', count: 14, percentage: 11 },
    { source: 'Trade Show', count: 6, percentage: 4 },
  ],
  leadStatuses: [
    { status: 'New', count: 12 },
    { status: 'Contacted', count: 18 },
    { status: 'Qualified', count: 24 },
    { status: 'Proposal Sent', count: 15 },
    { status: 'Won', count: 8 },
  ],
  dashboard: {
    newLeadsToday: 2,
    newLeadsTrend: '+100% vs yesterday',
    totalLeadsTrend: '+2 today',
    activeCustomersTrend: '+1 this month',
    scheduledAppointmentsTrend: '+3 this week',
    completedAppointmentsTrend: '+5 this month',
    smsSentTrend: '+2 today',
    whatsappTrend: '+4 today',
    conversionRate: '32.5%',
    conversionTrend: '+2.5% vs last month',
  },
  reports: {
    kpis: [
      { label: 'Lead Conversion Rate', value: '32.5%', trend: '+2.5% vs last month' },
      { label: 'Appointment Success Rate', value: '78.3%', trend: '+5.2% vs last month' },
      { label: 'Average Call Duration', value: '14.2 min', trend: '+1.8 min vs last month' },
      { label: 'Customer Satisfaction', value: '4.8/5', trend: '+0.3 vs last month' },
    ],
    totalCustomers: '142',
    totalCustomersTrend: '+12 this month',
    activeCustomers: '128',
    activeCustomersTrend: '90.1% retention',
    avgCustomerValue: '$45.2K',
    avgCustomerValueTrend: '+8.5% vs last quarter',
  },
};

export const CRM_AGENTS = ['Sarah Johnson', 'Michael Chen', 'David Lee', 'Lisa Anderson'];
export const LEAD_STATUSES = ['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Won', 'Lost'];
export const LEAD_SOURCES = ['Website', 'LinkedIn', 'Referral', 'Email Campaign', 'Trade Show'];
export const CUSTOMER_STATUSES = ['Active', 'Inactive'];
export const MEETING_TYPES = ['Video', 'Call', 'In-person'];
export const APPOINTMENT_STATUSES = ['Scheduled', 'Confirmed', 'Completed', 'No Show', 'Cancelled', 'Rescheduled'];
export const CALL_OUTCOMES = ['Answered', 'Voicemail', 'No Answer', 'Busy'];
