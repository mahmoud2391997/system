import React, { useState } from 'react';
import {
  Building2,
  Receipt,
  Package,
  DollarSign,
  Plus,
  Lock,
  Sparkles,
  CheckCircle2,
  FileText,
  AlertTriangle,
  Server,
  Layers,
  Search,
  Filter,
  Eye,
  Check,
  X,
  Send,
  Download,
  Printer,
  Trash2,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import { Invoice, InventoryItem, WorkspaceFeatures } from '../types';

interface ERPViewProps {
  features: WorkspaceFeatures;
  invoices: Invoice[];
  inventory: InventoryItem[];
  onUpgradeInPlace: (targetTier: 'enterprise') => void;
  onTriggerAction: (prompt: string) => void;
  onCreateInvoice?: (invoice: Partial<Invoice>) => Promise<void>;
  onUpdateInvoiceStatus?: (id: string, status: Invoice['status']) => Promise<void>;
  onCreateInventoryItem?: (item: Partial<InventoryItem>) => Promise<void>;
  onUpdateInventoryStock?: (id: string, delta: number) => Promise<void>;
}

export const ERPView: React.FC<ERPViewProps> = ({
  features,
  invoices,
  inventory,
  onUpgradeInPlace,
  onTriggerAction,
  onCreateInvoice,
  onUpdateInvoiceStatus,
  onCreateInventoryItem,
  onUpdateInventoryStock,
}) => {
  const [activeTab, setActiveTab] = useState<'invoices' | 'inventory'>('invoices');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | Invoice['status']>('all');

  // Modals
  const [showCreateInvoiceModal, setShowCreateInvoiceModal] = useState(false);
  const [showCreateItemModal, setShowCreateItemModal] = useState(false);
  const [selectedPreviewInvoice, setSelectedPreviewInvoice] = useState<Invoice | null>(null);

  // New invoice state
  const [invoiceClient, setInvoiceClient] = useState('');
  const [invoiceDueDate, setInvoiceDueDate] = useState(
    new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10)
  );
  const [lineItems, setLineItems] = useState([
    { description: 'Operations Platform License & Integration', quantity: 1, unit_price: 15000 },
  ]);

  // New inventory item state
  const [newSku, setNewSku] = useState('');
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('Hardware Appliances');
  const [newItemStock, setNewItemStock] = useState(50);
  const [newItemReorder, setNewItemReorder] = useState(15);
  const [newItemCost, setNewItemCost] = useState(120);

  if (!features.erp_enabled) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16">
        <div className="bg-ink-900 border border-ink-border p-8 text-center">
          <div className="w-12 h-12 rounded-lg border border-rule bg-paper-inset flex items-center justify-center mx-auto mb-5">
            <Lock className="w-5 h-5 text-amber" />
          </div>
          <h2 className="text-xl font-semibold text-paper tracking-tight mb-2">ERP & Financial Suite is Locked</h2>
          <p className="text-paper/70 text-sm max-w-lg mx-auto mb-6 leading-relaxed">
            You are currently on the <strong className="text-paper">{features.tier.toUpperCase()}</strong> tier. Enterprise tier unlocks
            full operational coverage, compliance isolation, and financial modules.
          </p>
          <div className="p-4 bg-ink-800 border border-ink-border text-left text-sm text-paper/80 space-y-2 mb-6">
            <div className="font-semibold flex items-center gap-1.5 text-amber">
              <Sparkles className="w-4 h-4 text-amber" />
              What Enterprise Tier Unlocks (Section 5 & 14):
            </div>
            <p>• Finance, Invoicing, Procurement, and Inventory modules</p>
            <p>• High-Risk Policy Engine gate for financial ledger liabilities</p>
            <p>• Dedicated PostgreSQL schema / database isolation options</p>
            <p>• Unmetered automation caps (20,000+ emails, 50,000+ messages)</p>
          </div>
          <button
            onClick={() => onUpgradeInPlace('enterprise')}
            className="px-5 py-2.5 bg-amber hover:opacity-90 text-ink-950 text-sm font-semibold transition-colors"
          >
            Upgrade in-place to Enterprise Tier
          </button>
        </div>
      </div>
    );
  }

  // Financial Metrics
  const totalInvoiced = invoices.reduce((acc, inv) => acc + inv.amount, 0);
  const paidInvoiced = invoices.filter((i) => i.status === 'paid').reduce((acc, inv) => acc + inv.amount, 0);
  const outstandingAR = invoices
    .filter((i) => i.status === 'sent' || i.status === 'pending_approval')
    .reduce((acc, inv) => acc + inv.amount, 0);
  const inventoryValuation = inventory.reduce((acc, item) => acc + item.stock_quantity * item.unit_cost, 0);

  // Line item helpers
  const handleAddLineItem = () => {
    setLineItems([...lineItems, { description: '', quantity: 1, unit_price: 1000 }]);
  };

  const handleRemoveLineItem = (index: number) => {
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const calculatedInvoiceTotal = lineItems.reduce(
    (acc, item) => acc + (item.quantity || 0) * (item.unit_price || 0),
    0
  );

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoiceClient.trim() || !onCreateInvoice) return;

    await onCreateInvoice({
      client_name: invoiceClient,
      amount: calculatedInvoiceTotal,
      currency: 'USD',
      due_date: invoiceDueDate,
      line_items: lineItems,
      status: 'sent',
    });

    setShowCreateInvoiceModal(false);
    setInvoiceClient('');
    setLineItems([{ description: 'Operations Platform License & Integration', quantity: 1, unit_price: 15000 }]);
  };

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim() || !onCreateInventoryItem) return;

    await onCreateInventoryItem({
      sku: newSku || `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      name: newItemName,
      category: newItemCategory,
      stock_quantity: Number(newItemStock) || 0,
      reorder_point: Number(newItemReorder) || 10,
      unit_cost: Number(newItemCost) || 50,
    });

    setShowCreateItemModal(false);
    setNewItemName('');
    setNewSku('');
    setNewItemStock(50);
  };

  const statusBadge = (status: Invoice['status']) => {
    switch (status) {
      case 'paid':
        return <span className="text-[10px] font-mono px-2 py-0.5 bg-ok-bg text-ok border border-ok/40 font-semibold">PAID</span>;
      case 'sent':
        return <span className="text-[10px] font-mono px-2 py-0.5 bg-warn-bg text-ink-muted border border-amber/40 font-semibold">SENT</span>;
      case 'pending_approval':
        return <span className="text-[10px] font-mono px-2 py-0.5 bg-warn-bg text-amber border border-amber/50 font-semibold">APPROVAL GATE</span>;
      case 'draft':
      default:
        return <span className="text-[10px] font-mono px-2 py-0.5 bg-paper-inset text-ink-muted border border-rule font-semibold">DRAFT</span>;
    }
  };

  // Filtered lists
  const filteredInvoices = invoices.filter((inv) => {
    if (statusFilter !== 'all' && inv.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        inv.invoice_number.toLowerCase().includes(q) ||
        inv.client_name.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const filteredInventory = inventory.filter((item) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        item.sku.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const fieldClass = 'w-full px-3 py-2 border border-rule bg-paper-raised text-ink-text text-sm placeholder:text-ink-muted/70 focus:outline-none focus:border-amber';
  const overlayClass = 'fixed inset-0 z-50 bg-ink-950/80 flex items-center justify-center p-4';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div className="bg-warn-bg border border-amber/30 p-3.5 flex items-start gap-3 text-sm text-ink-text">
        <Sparkles className="w-4 h-4 text-ink-muted shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold block text-ink-text">ERP is the financial system of record</span>
          <p className="text-ink-muted mt-0.5">
            Invoices, receivables, and inventory. High-risk financial actions stay behind the policy gate.
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-paper-raised p-5 border border-rule">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-ink-muted bg-warn-bg px-2 py-0.5 border border-amber/30">
              Enterprise Module Unlocked
            </span>
            <span className="text-sm text-ink-muted">• System of Record: ERP</span>
          </div>
          <h1 className="text-xl font-semibold text-ink-text mt-1 tracking-tight">Enterprise Operations & Financial Suite</h1>
          <p className="text-sm text-ink-muted">
            Finance, automated billing, inventory reorders, and high-risk policy gating for financial records.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex border border-rule p-1 bg-paper-inset text-sm">
            <button
              onClick={() => setActiveTab('invoices')}
              className={`px-3 py-1.5 font-medium transition-colors ${
                activeTab === 'invoices' ? 'bg-amber text-ink-950' : 'text-ink-muted hover:text-ink-text'
              }`}
            >
              Invoices & Billing ({invoices.length})
            </button>
            <button
              onClick={() => setActiveTab('inventory')}
              className={`px-3 py-1.5 font-medium transition-colors ${
                activeTab === 'inventory' ? 'bg-amber text-ink-950' : 'text-ink-muted hover:text-ink-text'
              }`}
            >
              SKU Inventory ({inventory.length})
            </button>
          </div>

          <button
            onClick={() => setShowCreateInvoiceModal(true)}
            className="px-3 py-1.5 bg-amber hover:opacity-90 text-ink-950 text-sm font-semibold flex items-center gap-1 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Issue Invoice</span>
          </button>
          <button
            onClick={() => setShowCreateItemModal(true)}
            className="px-3 py-1.5 bg-paper hover:bg-paper-inset text-ink-text border border-rule text-sm font-medium flex items-center gap-1 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add SKU Item</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-paper-raised p-4 border border-rule">
          <div className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-ok" />
            Total Billed
          </div>
          <div className="text-xl font-semibold text-ink-text font-mono mt-1">
            ${totalInvoiced.toLocaleString()}
          </div>
          <div className="text-[11px] text-ink-muted mt-0.5">{invoices.length} invoices generated</div>
        </div>

        <div className="bg-paper-raised p-4 border border-rule">
          <div className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-ok" />
            Realized Revenue
          </div>
          <div className="text-xl font-semibold text-ink-text font-mono mt-1">
            ${paidInvoiced.toLocaleString()}
          </div>
          <div className="text-[11px] text-ok mt-0.5 font-medium">Reconciled in general ledger</div>
        </div>

        <div className="bg-paper-raised p-4 border border-rule">
          <div className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider flex items-center gap-1.5">
            <Receipt className="w-3.5 h-3.5 text-ink-muted" />
            Outstanding AR
          </div>
          <div className="text-xl font-semibold text-ink-text font-mono mt-1">
            ${outstandingAR.toLocaleString()}
          </div>
          <div className="text-[11px] text-ink-muted mt-0.5">Pending customer settlement</div>
        </div>

        <div className="bg-paper-raised p-4 border border-rule">
          <div className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider flex items-center gap-1.5">
            <Package className="w-3.5 h-3.5 text-ink-muted" />
            Inventory Valuation
          </div>
          <div className="text-xl font-semibold text-ink-text font-mono mt-1">
            ${inventoryValuation.toLocaleString()}
          </div>
          <div className="text-[11px] text-ink-muted mt-0.5">Across {inventory.length} active SKUs</div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 bg-paper-raised p-3 border border-rule">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-ink-muted absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={activeTab === 'invoices' ? "Search invoices by number or client name..." : "Search inventory by name, SKU, or category..."}
            className="w-full pl-9 pr-3 py-2 text-sm border border-rule bg-paper-raised text-ink-text placeholder:text-ink-muted/70 focus:outline-none focus:border-amber"
          />
        </div>

        {activeTab === 'invoices' && (
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="text-sm border border-rule px-2.5 py-2 text-ink-text bg-paper-raised"
          >
            <option value="all">All Invoice Statuses</option>
            <option value="paid">Paid</option>
            <option value="sent">Sent</option>
            <option value="pending_approval">Pending Approval</option>
            <option value="draft">Draft</option>
          </select>
        )}
      </div>

      {activeTab === 'invoices' ? (
        <div className="bg-paper-raised border border-rule overflow-hidden">
          <div className="p-4 border-b border-rule flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-ink-muted" />
              <h3 className="text-sm font-semibold text-ink-text">Commercial Invoices & Accounts Receivable</h3>
            </div>
            <button
              onClick={() => onTriggerAction('Reconcile recent paid invoices and generate Q3 ledger summary')}
              className="text-sm text-ink-muted hover:text-ink-text font-medium flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3" />
              AI Ledger Reconcile
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-ink-muted">
              <thead className="bg-paper-inset text-[11px] text-ink-muted uppercase tracking-wider font-semibold border-b border-rule">
                <tr>
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Client</th>
                  <th className="py-3 px-4">Issue Date</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rule">
                {filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-paper-inset/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-ink-text">
                      {inv.invoice_number}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-ink-text">
                      {inv.client_name}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-ink-muted">{inv.issue_date}</td>
                    <td className="py-3.5 px-4 font-mono text-ink-muted">{inv.due_date}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-ink-text">
                      ${inv.amount.toLocaleString()} {inv.currency}
                    </td>
                    <td className="py-3.5 px-4">{statusBadge(inv.status)}</td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedPreviewInvoice(inv)}
                          className="px-2 py-1 text-ink-muted hover:text-ink-text border border-rule hover:bg-paper-inset flex items-center gap-1"
                          title="View printable PDF invoice"
                        >
                          <Eye className="w-3 h-3" />
                          View
                        </button>
                        {inv.status !== 'paid' && onUpdateInvoiceStatus && (
                          <button
                            onClick={() => onUpdateInvoiceStatus(inv.id, 'paid')}
                            className="px-2 py-1 text-ok bg-ok-bg border border-ok/40 hover:bg-ok hover:text-ink-950 font-semibold"
                            title="Mark as settled & paid"
                          >
                            Mark Paid
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-paper-raised border border-rule overflow-hidden">
          <div className="p-4 border-b border-rule flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-ink-muted" />
              <h3 className="text-sm font-semibold text-ink-text">Warehouse SKU Inventory & Reorder Rules</h3>
            </div>
            <button
              onClick={() => onTriggerAction('Audit inventory levels and prepare restock purchase order for low stock SKUs')}
              className="text-sm text-ink-muted hover:text-ink-text font-medium flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3" />
              AI Stock Optimization
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-ink-muted">
              <thead className="bg-paper-inset text-[11px] text-ink-muted uppercase tracking-wider font-semibold border-b border-rule">
                <tr>
                  <th className="py-3 px-4">SKU Code</th>
                  <th className="py-3 px-4">Item Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">In Stock</th>
                  <th className="py-3 px-4">Unit Cost</th>
                  <th className="py-3 px-4">Total Value</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Quick Adjust</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rule">
                {filteredInventory.map((item) => {
                  const isLow = item.stock_quantity <= item.reorder_point;
                  const itemTotalVal = item.stock_quantity * item.unit_cost;

                  return (
                    <tr key={item.id} className="hover:bg-paper-inset/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-ink-text">{item.sku}</td>
                      <td className="py-3.5 px-4 font-semibold text-ink-text">{item.name}</td>
                      <td className="py-3.5 px-4 text-ink-muted">{item.category}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-ink-text">
                        {item.stock_quantity} units
                      </td>
                      <td className="py-3.5 px-4 font-mono text-ink-muted">${item.unit_cost}</td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-ink-text">
                        ${itemTotalVal.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4">
                        {isLow ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 bg-danger-bg text-danger border border-danger/40 font-semibold">
                            <AlertTriangle className="w-2.5 h-2.5" />
                            REORDER NOW (&le;{item.reorder_point})
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono px-2 py-0.5 bg-ok-bg text-ok border border-ok/40 font-semibold">
                            HEALTHY
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {onUpdateInventoryStock && (
                          <div className="flex items-center justify-end gap-1 font-mono text-[11px]">
                            <button
                              onClick={() => onUpdateInventoryStock(item.id, -1)}
                              className="px-1.5 py-0.5 text-ink-muted hover:text-danger border border-rule hover:bg-paper-inset"
                              title="Deduct 1 unit used"
                            >
                              -1
                            </button>
                            <button
                              onClick={() => onUpdateInventoryStock(item.id, 1)}
                              className="px-1.5 py-0.5 text-ink-muted hover:text-ink-text border border-rule hover:bg-paper-inset"
                              title="Add 1 unit"
                            >
                              +1
                            </button>
                            <button
                              onClick={() => onUpdateInventoryStock(item.id, 10)}
                              className="px-2 py-0.5 text-ok bg-ok-bg border border-ok/40 font-semibold hover:bg-ok hover:text-ink-950"
                              title="Restock batch of 10"
                            >
                              +10 Restock
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedPreviewInvoice && (
        <div className={`${overlayClass} overflow-y-auto`}>
          <div className="bg-paper-raised max-w-2xl w-full p-6 sm:p-8 border border-rule max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-rule">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-ink-muted" />
                <span className="font-bold text-sm text-ink-text">APEX HORIZON ENTERPRISE</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-2.5 py-1 text-ink-muted hover:text-ink-text border border-rule text-sm flex items-center gap-1"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print
                </button>
                <button
                  onClick={() => setSelectedPreviewInvoice(null)}
                  className="text-ink-muted hover:text-ink-text"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 my-6 text-sm">
              <div>
                <span className="text-[10px] uppercase font-bold text-ink-muted">ISSUED TO</span>
                <h3 className="font-bold text-ink-text text-sm mt-0.5">{selectedPreviewInvoice.client_name}</h3>
                <p className="text-ink-muted mt-1">Enterprise Operations Account</p>
                <p className="text-ink-muted">Corporate Billing Division</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-ink-muted">INVOICE DETAILS</span>
                <div className="font-mono font-bold text-ink-text text-sm mt-0.5">
                  {selectedPreviewInvoice.invoice_number}
                </div>
                <div className="text-ink-muted text-[11px] mt-1 font-mono">Issue Date: {selectedPreviewInvoice.issue_date}</div>
                <div className="text-ink-muted text-[11px] font-mono">Due Date: {selectedPreviewInvoice.due_date}</div>
                <div className="mt-2">{statusBadge(selectedPreviewInvoice.status)}</div>
              </div>
            </div>

            <table className="w-full text-left text-sm mb-6 border-t border-b border-rule">
              <thead className="bg-paper-inset text-[10px] font-bold text-ink-muted uppercase">
                <tr>
                  <th className="py-2.5 px-3">Description</th>
                  <th className="py-2.5 px-3 text-right">Qty</th>
                  <th className="py-2.5 px-3 text-right">Rate</th>
                  <th className="py-2.5 px-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rule">
                {selectedPreviewInvoice.line_items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-3 px-3 text-ink-text">{item.description}</td>
                    <td className="py-3 px-3 text-right font-mono text-ink-muted">{item.quantity}</td>
                    <td className="py-3 px-3 text-right font-mono text-ink-muted">${item.unit_price.toLocaleString()}</td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-ink-text">
                      ${(item.quantity * item.unit_price).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-end text-right text-sm space-y-1 mb-6">
              <div className="w-48 space-y-1.5">
                <div className="flex justify-between text-ink-muted">
                  <span>Subtotal:</span>
                  <span className="font-mono text-ink-text">${selectedPreviewInvoice.amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-ink-muted">
                  <span>Tax (0% Enterprise):</span>
                  <span className="font-mono text-ink-text">$0.00</span>
                </div>
                <div className="flex justify-between font-bold text-sm text-ink-text pt-2 border-t border-rule">
                  <span>Total Due:</span>
                  <span className="font-mono text-ok">
                    ${selectedPreviewInvoice.amount.toLocaleString()} {selectedPreviewInvoice.currency}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-paper-inset p-3 border border-rule text-[13px] text-ink-muted">
              <strong className="text-ink-text">Cryptographic General Ledger Note:</strong> This document was generated and policy-evaluated under the Nexus Autonomous ERP Engine. Audit hash recorded in immutable ledger.
            </div>
          </div>
        </div>
      )}

      {showCreateInvoiceModal && (
        <div className={overlayClass}>
          <div className="bg-paper-raised max-w-lg w-full p-6 border border-rule max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-rule mb-4">
              <h3 className="text-lg font-semibold text-ink-text tracking-tight">Issue Commercial Invoice</h3>
              <button onClick={() => setShowCreateInvoiceModal(false)} className="text-ink-muted hover:text-ink-text">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateInvoice} className="space-y-4 text-sm">
              <div>
                <label className="block font-medium text-ink-text mb-1">Client Organization *</label>
                <input
                  type="text"
                  required
                  value={invoiceClient}
                  onChange={(e) => setInvoiceClient(e.target.value)}
                  placeholder="e.g. Vanguard Logistics Global"
                  className={fieldClass}
                />
              </div>
              <div>
                <label className="block font-medium text-ink-text mb-1">Due Date</label>
                <input
                  type="date"
                  value={invoiceDueDate}
                  onChange={(e) => setInvoiceDueDate(e.target.value)}
                  className={fieldClass}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="font-medium text-ink-text">Line Items</label>
                  <button
                    type="button"
                    onClick={handleAddLineItem}
                    className="text-ink-muted hover:text-ink-text font-medium text-[13px] flex items-center gap-0.5"
                  >
                    <Plus className="w-3 h-3" /> Add Item
                  </button>
                </div>
                <div className="space-y-2">
                  {lineItems.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 bg-paper-inset border border-rule">
                      <input
                        type="text"
                        placeholder="Description"
                        value={item.description}
                        onChange={(e) => {
                          const updated = [...lineItems];
                          updated[idx].description = e.target.value;
                          setLineItems(updated);
                        }}
                        className="flex-1 px-2 py-1 bg-paper-raised border border-rule text-sm text-ink-text"
                      />
                      <input
                        type="number"
                        min="1"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) => {
                          const updated = [...lineItems];
                          updated[idx].quantity = Number(e.target.value);
                          setLineItems(updated);
                        }}
                        className="w-16 px-2 py-1 bg-paper-raised border border-rule text-sm text-right text-ink-text"
                      />
                      <input
                        type="number"
                        min="0"
                        placeholder="Price"
                        value={item.unit_price}
                        onChange={(e) => {
                          const updated = [...lineItems];
                          updated[idx].unit_price = Number(e.target.value);
                          setLineItems(updated);
                        }}
                        className="w-24 px-2 py-1 bg-paper-raised border border-rule text-sm text-right text-ink-text"
                      />
                      {lineItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveLineItem(idx)}
                          className="text-ink-muted hover:text-danger p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-warn-bg border border-amber/30 flex items-center justify-between text-sm font-bold text-ink-text">
                <span>Calculated Total:</span>
                <span className="font-mono">${calculatedInvoiceTotal.toLocaleString()} USD</span>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-rule">
                <button
                  type="button"
                  onClick={() => setShowCreateInvoiceModal(false)}
                  className="px-3 py-1.5 text-ink-muted hover:text-ink-text"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber hover:opacity-90 text-ink-950 font-semibold"
                >
                  Issue Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCreateItemModal && (
        <div className={overlayClass}>
          <div className="bg-paper-raised max-w-md w-full p-6 border border-rule">
            <div className="flex items-center justify-between pb-3 border-b border-rule mb-4">
              <h3 className="text-lg font-semibold text-ink-text tracking-tight">Add Inventory SKU</h3>
              <button onClick={() => setShowCreateItemModal(false)} className="text-ink-muted hover:text-ink-text">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateItem} className="space-y-3 text-sm">
              <div>
                <label className="block font-medium text-ink-text mb-1">Item / SKU Name *</label>
                <input
                  type="text"
                  required
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder="e.g. Edge AI Gateway Controller"
                  className={fieldClass}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium text-ink-text mb-1">SKU Code</label>
                  <input
                    type="text"
                    value={newSku}
                    onChange={(e) => setNewSku(e.target.value)}
                    placeholder="e.g. SKU-8820"
                    className={`${fieldClass} font-mono`}
                  />
                </div>
                <div>
                  <label className="block font-medium text-ink-text mb-1">Category</label>
                  <select
                    value={newItemCategory}
                    onChange={(e) => setNewItemCategory(e.target.value)}
                    className={fieldClass}
                  >
                    <option value="Hardware Appliances">Hardware Appliances</option>
                    <option value="Telemetry Sensors">Telemetry Sensors</option>
                    <option value="Security Dongles">Security Dongles</option>
                    <option value="Network Infrastructure">Network Infrastructure</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-medium text-ink-text mb-1">Initial Stock</label>
                  <input
                    type="number"
                    min="0"
                    value={newItemStock}
                    onChange={(e) => setNewItemStock(Number(e.target.value))}
                    className={fieldClass}
                  />
                </div>
                <div>
                  <label className="block font-medium text-ink-text mb-1">Reorder Point</label>
                  <input
                    type="number"
                    min="1"
                    value={newItemReorder}
                    onChange={(e) => setNewItemReorder(Number(e.target.value))}
                    className={fieldClass}
                  />
                </div>
                <div>
                  <label className="block font-medium text-ink-text mb-1">Unit Cost ($)</label>
                  <input
                    type="number"
                    min="0"
                    value={newItemCost}
                    onChange={(e) => setNewItemCost(Number(e.target.value))}
                    className={fieldClass}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-rule">
                <button
                  type="button"
                  onClick={() => setShowCreateItemModal(false)}
                  className="px-3 py-1.5 text-ink-muted hover:text-ink-text"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber hover:opacity-90 text-ink-950 font-semibold"
                >
                  Save SKU
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
