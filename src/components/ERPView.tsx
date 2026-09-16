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
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto mb-5 text-slate-400">
          <Lock className="w-8 h-8 text-slate-500" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">ERP & Financial Suite is Locked</h2>
        <p className="text-slate-600 text-sm max-w-lg mx-auto mb-6 leading-relaxed">
          You are currently on the <strong>{features.tier.toUpperCase()}</strong> tier. Enterprise tier unlocks
          full operational coverage, compliance isolation, and financial modules.
        </p>
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl max-w-md mx-auto mb-6 text-left text-xs text-emerald-900 space-y-2">
          <div className="font-semibold flex items-center gap-1.5 text-emerald-950">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            What Enterprise Tier Unlocks (Section 5 & 14):
          </div>
          <p>• Finance, Invoicing, Procurement, and Inventory modules</p>
          <p>• High-Risk Policy Engine gate for financial ledger liabilities</p>
          <p>• Dedicated PostgreSQL schema / database isolation options</p>
          <p>• Unmetered automation caps (20,000+ emails, 50,000+ messages)</p>
        </div>
        <button
          onClick={() => onUpgradeInPlace('enterprise')}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors"
        >
          Upgrade in-place to Enterprise Tier
        </button>
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
        return <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">PAID</span>;
      case 'sent':
        return <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-semibold">SENT</span>;
      case 'pending_approval':
        return <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-semibold">APPROVAL GATE</span>;
      case 'draft':
      default:
        return <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-semibold">DRAFT</span>;
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Honest Preview Disclaimer Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-start gap-3 text-xs text-amber-900 shadow-xs">
        <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold block text-amber-950">Tier Preview — Phase 6 ERP Financial Engine</span>
          <p className="text-amber-800 mt-0.5">
            This screen demonstrates invoice generation, accounts receivable, and inventory tracking for the Enterprise tier. Invoices shown here are preview records.
          </p>
        </div>
      </div>

      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Enterprise Module Unlocked
            </span>
            <span className="text-xs text-slate-600">• System of Record: ERP</span>
          </div>
          <h1 className="text-lg font-bold text-slate-900 mt-1">Enterprise Operations & Financial Suite</h1>
          <p className="text-xs text-slate-600">
            Finance, automated billing, inventory reorders, and high-risk policy gating for financial records.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-lg border border-slate-200 p-1 bg-slate-50 text-xs">
            <button
              onClick={() => setActiveTab('invoices')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                activeTab === 'invoices' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Invoices & Billing ({invoices.length})
            </button>
            <button
              onClick={() => setActiveTab('inventory')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                activeTab === 'inventory' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              SKU Inventory ({inventory.length})
            </button>
          </div>

          <button
            onClick={() => setShowCreateInvoiceModal(true)}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Issue Invoice</span>
          </button>
          <button
            onClick={() => setShowCreateItemModal(true)}
            className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add SKU Item</span>
          </button>
        </div>
      </div>

      {/* Financial KPIs Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
            Total Billed
          </div>
          <div className="text-xl font-bold text-slate-900 font-mono mt-1">
            ${totalInvoiced.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">{invoices.length} invoices generated</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            Realized Revenue
          </div>
          <div className="text-xl font-bold text-emerald-600 font-mono mt-1">
            ${paidInvoiced.toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-700 mt-0.5 font-medium">Reconciled in general ledger</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Receipt className="w-3.5 h-3.5 text-blue-600" />
            Outstanding AR
          </div>
          <div className="text-xl font-bold text-blue-600 font-mono mt-1">
            ${outstandingAR.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Pending customer settlement</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Package className="w-3.5 h-3.5 text-purple-600" />
            Inventory Valuation
          </div>
          <div className="text-xl font-bold text-purple-600 font-mono mt-1">
            ${inventoryValuation.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Across {inventory.length} active SKUs</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={activeTab === 'invoices' ? "Search invoices by number or client name..." : "Search inventory by name, SKU, or category..."}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        {activeTab === 'invoices' && (
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 bg-white"
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
        /* Invoices Table */
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900">Commercial Invoices & Accounts Receivable</h3>
            </div>
            <button
              onClick={() => onTriggerAction('Reconcile recent paid invoices and generate Q3 ledger summary')}
              className="text-xs text-emerald-700 hover:text-emerald-900 font-medium flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3 text-emerald-600" />
              AI Ledger Reconcile
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-[11px] text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
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
              <tbody className="divide-y divide-slate-100">
                {filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {inv.invoice_number}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {inv.client_name}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-500">{inv.issue_date}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-500">{inv.due_date}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      ${inv.amount.toLocaleString()} {inv.currency}
                    </td>
                    <td className="py-3.5 px-4">{statusBadge(inv.status)}</td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedPreviewInvoice(inv)}
                          className="px-2 py-1 text-slate-600 hover:text-slate-900 border border-slate-200 rounded hover:bg-slate-100 flex items-center gap-1"
                          title="View printable PDF invoice"
                        >
                          <Eye className="w-3 h-3" />
                          View
                        </button>
                        {inv.status !== 'paid' && onUpdateInvoiceStatus && (
                          <button
                            onClick={() => onUpdateInvoiceStatus(inv.id, 'paid')}
                            className="px-2 py-1 text-emerald-700 hover:text-emerald-900 bg-emerald-50 border border-emerald-200 rounded hover:bg-emerald-100 font-semibold"
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
        /* Inventory Table */
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900">Warehouse SKU Inventory & Reorder Rules</h3>
            </div>
            <button
              onClick={() => onTriggerAction('Audit inventory levels and prepare restock purchase order for low stock SKUs')}
              className="text-xs text-emerald-700 hover:text-emerald-900 font-medium flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3 text-emerald-600" />
              AI Stock Optimization
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-[11px] text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
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
              <tbody className="divide-y divide-slate-100">
                {filteredInventory.map((item) => {
                  const isLow = item.stock_quantity <= item.reorder_point;
                  const itemTotalVal = item.stock_quantity * item.unit_cost;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{item.sku}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800">{item.name}</td>
                      <td className="py-3.5 px-4 text-slate-500">{item.category}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {item.stock_quantity} units
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600">${item.unit_cost}</td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-800">
                        ${itemTotalVal.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4">
                        {isLow ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200 font-semibold">
                            <AlertTriangle className="w-2.5 h-2.5" />
                            REORDER NOW (&le;{item.reorder_point})
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                            HEALTHY
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {onUpdateInventoryStock && (
                          <div className="flex items-center justify-end gap-1 font-mono text-[11px]">
                            <button
                              onClick={() => onUpdateInventoryStock(item.id, -1)}
                              className="px-1.5 py-0.5 text-slate-600 hover:text-red-700 border border-slate-200 rounded hover:bg-slate-100"
                              title="Deduct 1 unit used"
                            >
                              -1
                            </button>
                            <button
                              onClick={() => onUpdateInventoryStock(item.id, 1)}
                              className="px-1.5 py-0.5 text-slate-600 hover:text-blue-700 border border-slate-200 rounded hover:bg-slate-100"
                              title="Add 1 unit"
                            >
                              +1
                            </button>
                            <button
                              onClick={() => onUpdateInventoryStock(item.id, 10)}
                              className="px-2 py-0.5 text-emerald-700 hover:text-emerald-900 bg-emerald-50 border border-emerald-200 rounded font-semibold hover:bg-emerald-100"
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

      {/* Printable / Preview Invoice Modal */}
      {selectedPreviewInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-600" />
                <span className="font-bold text-sm text-slate-900">APEX HORIZON ENTERPRISE</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-2.5 py-1 text-slate-600 hover:text-slate-900 border border-slate-200 rounded text-xs flex items-center gap-1"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print
                </button>
                <button
                  onClick={() => setSelectedPreviewInvoice(null)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Invoice Header */}
            <div className="grid grid-cols-2 gap-6 my-6 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">ISSUED TO</span>
                <h3 className="font-bold text-slate-900 text-sm mt-0.5">{selectedPreviewInvoice.client_name}</h3>
                <p className="text-slate-500 mt-1">Enterprise Operations Account</p>
                <p className="text-slate-500">Corporate Billing Division</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400">INVOICE DETAILS</span>
                <div className="font-mono font-bold text-slate-900 text-sm mt-0.5">
                  {selectedPreviewInvoice.invoice_number}
                </div>
                <div className="text-slate-500 text-[11px] mt-1">Issue Date: {selectedPreviewInvoice.issue_date}</div>
                <div className="text-slate-500 text-[11px]">Due Date: {selectedPreviewInvoice.due_date}</div>
                <div className="mt-2">{statusBadge(selectedPreviewInvoice.status)}</div>
              </div>
            </div>

            {/* Line items table */}
            <table className="w-full text-left text-xs mb-6 border-t border-b border-slate-200">
              <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase">
                <tr>
                  <th className="py-2.5 px-3">Description</th>
                  <th className="py-2.5 px-3 text-right">Qty</th>
                  <th className="py-2.5 px-3 text-right">Rate</th>
                  <th className="py-2.5 px-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {selectedPreviewInvoice.line_items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-3 px-3 text-slate-800">{item.description}</td>
                    <td className="py-3 px-3 text-right font-mono text-slate-600">{item.quantity}</td>
                    <td className="py-3 px-3 text-right font-mono text-slate-600">${item.unit_price.toLocaleString()}</td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                      ${(item.quantity * item.unit_price).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Invoice Total */}
            <div className="flex justify-end text-right text-xs space-y-1 mb-6">
              <div className="w-48 space-y-1.5">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal:</span>
                  <span className="font-mono text-slate-800">${selectedPreviewInvoice.amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Tax (0% Enterprise):</span>
                  <span className="font-mono text-slate-800">$0.00</span>
                </div>
                <div className="flex justify-between font-bold text-sm text-slate-900 pt-2 border-t border-slate-200">
                  <span>Total Due:</span>
                  <span className="font-mono text-emerald-600">
                    ${selectedPreviewInvoice.amount.toLocaleString()} {selectedPreviewInvoice.currency}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-[11px] text-slate-600">
              <strong>Cryptographic General Ledger Note:</strong> This document was generated and policy-evaluated under the Nexus Autonomous ERP Engine. Audit hash recorded in immutable ledger.
            </div>
          </div>
        </div>
      )}

      {/* Create Invoice Modal */}
      {showCreateInvoiceModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900">Issue Commercial Invoice</h3>
              <button onClick={() => setShowCreateInvoiceModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateInvoice} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Client Organization *</label>
                <input
                  type="text"
                  required
                  value={invoiceClient}
                  onChange={(e) => setInvoiceClient(e.target.value)}
                  placeholder="e.g. Vanguard Logistics Global"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Due Date</label>
                <input
                  type="date"
                  value={invoiceDueDate}
                  onChange={(e) => setInvoiceDueDate(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300"
                />
              </div>

              {/* Line Items */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="font-semibold text-slate-700">Line Items</label>
                  <button
                    type="button"
                    onClick={handleAddLineItem}
                    className="text-emerald-600 hover:text-emerald-800 font-medium text-[11px] flex items-center gap-0.5"
                  >
                    <Plus className="w-3 h-3" /> Add Item
                  </button>
                </div>
                <div className="space-y-2">
                  {lineItems.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200">
                      <input
                        type="text"
                        placeholder="Description"
                        value={item.description}
                        onChange={(e) => {
                          const updated = [...lineItems];
                          updated[idx].description = e.target.value;
                          setLineItems(updated);
                        }}
                        className="flex-1 px-2 py-1 bg-white border border-slate-200 rounded text-xs"
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
                        className="w-16 px-2 py-1 bg-white border border-slate-200 rounded text-xs text-right"
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
                        className="w-24 px-2 py-1 bg-white border border-slate-200 rounded text-xs text-right"
                      />
                      {lineItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveLineItem(idx)}
                          className="text-slate-400 hover:text-red-600 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Calculated Total */}
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between text-xs font-bold text-emerald-900">
                <span>Calculated Total:</span>
                <span className="font-mono text-sm">${calculatedInvoiceTotal.toLocaleString()} USD</span>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateInvoiceModal(false)}
                  className="px-3 py-1.5 text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-xs"
                >
                  Issue Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Inventory SKU Modal */}
      {showCreateItemModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900">Add Inventory SKU</h3>
              <button onClick={() => setShowCreateItemModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateItem} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Item / SKU Name *</label>
                <input
                  type="text"
                  required
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder="e.g. Edge AI Gateway Controller"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">SKU Code</label>
                  <input
                    type="text"
                    value={newSku}
                    onChange={(e) => setNewSku(e.target.value)}
                    placeholder="e.g. SKU-8820"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={newItemCategory}
                    onChange={(e) => setNewItemCategory(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300"
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
                  <label className="block font-semibold text-slate-700 mb-1">Initial Stock</label>
                  <input
                    type="number"
                    min="0"
                    value={newItemStock}
                    onChange={(e) => setNewItemStock(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Reorder Point</label>
                  <input
                    type="number"
                    min="1"
                    value={newItemReorder}
                    onChange={(e) => setNewItemReorder(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Unit Cost ($)</label>
                  <input
                    type="number"
                    min="0"
                    value={newItemCost}
                    onChange={(e) => setNewItemCost(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateItemModal(false)}
                  className="px-3 py-1.5 text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-xs"
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
