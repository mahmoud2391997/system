import React, { useEffect, useMemo, useState } from 'react';
import { Lock, Sparkles } from 'lucide-react';
import {
  ErpCatalog,
  ErpSalesInvoice,
  WorkspaceFeatures,
} from '../types';
import {
  ACCOUNT_TYPE_LABEL,
  LEDGER_LABEL,
  ROLE_LABEL,
  STATUS_LABEL,
  VAT_LABEL,
  erpCatalog,
} from '../erpCatalog';

interface ERPViewProps {
  features: WorkspaceFeatures;
  catalog: ErpCatalog;
  onUpgradeInPlace: (targetTier: 'enterprise') => void;
}

type Section =
  | 'overview'
  | 'materials'
  | 'batches'
  | 'products'
  | 'warehouses'
  | 'balances'
  | 'ledger'
  | 'transfers'
  | 'adjustments'
  | 'barcode'
  | 'suppliers'
  | 'purchase-orders'
  | 'goods-receipts'
  | 'recipes'
  | 'recipe-items'
  | 'production-orders'
  | 'customers'
  | 'invoices'
  | 'withdrawals'
  | 'payments'
  | 'accounts'
  | 'journals'
  | 'expenses'
  | 'vat-report'
  | 'tax-settings'
  | 'employees'
  | 'attendance'
  | 'overtime'
  | 'payroll'
  | 'reports'
  | 'notifications'
  | 'audit'
  | 'settings'
  | 'tasks'
  | 'approvals'
  | 'users';

const GROUPS: { label: string; items: { id: Section; label: string; description: string }[] }[] = [
  {
    label: 'Home',
    items: [{ id: 'overview', label: 'Dashboard', description: 'Operations, inventory, and sales summary' }],
  },
  {
    label: 'Inventory',
    items: [
      { id: 'materials', label: 'Raw materials', description: 'Raw material items, minimum stock, and unit' },
      { id: 'batches', label: 'Material batches', description: 'Batch number, expiry, and supplier' },
      { id: 'products', label: 'Finished products', description: 'Finished goods and selling prices' },
      { id: 'warehouses', label: 'Warehouses', description: 'WH_RAW / WH_MFG / WH_FG and locations' },
      { id: 'balances', label: 'Stock balances', description: 'On-hand quantity and average cost' },
      { id: 'ledger', label: 'Stock ledger', description: 'Every stock movement stays auditable' },
      { id: 'transfers', label: 'Stock transfers', description: 'Transfers between the three warehouses' },
      { id: 'adjustments', label: 'Stock adjustments', description: 'Adjustment with a required reason and manager approval' },
      { id: 'barcode', label: 'Barcode station', description: 'Scan items and print labels' },
    ],
  },
  {
    label: 'Purchasing',
    items: [
      { id: 'suppliers', label: 'Suppliers', description: 'Supplier details and tax number' },
      { id: 'purchase-orders', label: 'Purchase orders', description: 'Purchase orders and their status' },
      { id: 'goods-receipts', label: 'Goods receipts', description: 'Receive into the raw materials warehouse' },
    ],
  },
  {
    label: 'Manufacturing',
    items: [
      { id: 'recipes', label: 'Recipes', description: 'Production recipe and base output quantity' },
      { id: 'recipe-items', label: 'Recipe items', description: 'Materials and quantities in each recipe' },
      { id: 'production-orders', label: 'Production orders', description: 'Planned versus actual, waste, and variance reason' },
    ],
  },
  {
    label: 'Sales',
    items: [
      { id: 'customers', label: 'Customers', description: 'Customer details' },
      { id: 'invoices', label: 'Sales invoices', description: 'Invoices with tax and status' },
      { id: 'withdrawals', label: 'Withdrawals', description: 'Withdraw from the finished-goods warehouse' },
      { id: 'payments', label: 'Collections', description: 'Collections linked to invoices' },
    ],
  },
  {
    label: 'Accounts',
    items: [
      { id: 'accounts', label: 'Chart of accounts', description: 'Account tree with balances from journals' },
      { id: 'journals', label: 'Journals', description: 'Journals posted from operations' },
      { id: 'expenses', label: 'Expenses', description: 'Expenses waiting for approval, then posting' },
      { id: 'vat-report', label: 'VAT return', description: 'Output tax, input tax, and net payable' },
      { id: 'tax-settings', label: 'Tax settings', description: 'Tax rate and Oman registration number' },
    ],
  },
  {
    label: 'Human resources',
    items: [
      { id: 'employees', label: 'Employees', description: 'Employee and department records' },
      { id: 'attendance', label: 'Attendance', description: 'Attendance log (manual / file / device)' },
      { id: 'overtime', label: 'Overtime', description: 'Hours above 8, priced at 1.25 times the hourly rate' },
      { id: 'payroll', label: 'Payroll', description: 'Payroll run, approval, and payment' },
    ],
  },
  {
    label: 'System',
    items: [
      { id: 'reports', label: 'Reports', description: 'Product trace, inventory, production, and the trial balance' },
      { id: 'notifications', label: 'Notifications', description: 'Low stock and approval requests' },
      { id: 'audit', label: 'Audit log', description: 'Who did what, and when' },
      { id: 'settings', label: 'Company settings', description: 'Currency, variance threshold, and tax' },
      { id: 'tasks', label: 'Tasks', description: 'Operational tasks to follow up' },
      { id: 'approvals', label: 'Approvals', description: 'Purchase orders, expenses, payroll, and stock adjustments' },
      { id: 'users', label: 'Users and permissions', description: 'The three roles and what each one can do' },
    ],
  },
];

const ALL_PERMISSIONS = Array.from(new Set(Object.values(erpCatalog.rolePermissions).flat()));
const fieldClass = 'w-full px-3 py-2 border border-rule bg-paper text-ink-text text-sm placeholder:text-ink-muted/70 focus:outline-none focus:border-amber';

function omr(value: number) {
  return `${value.toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 })} OMR`;
}

function num(value: number) {
  return value.toLocaleString('en-US', { maximumFractionDigits: 3 });
}

function day(value: string) {
  return value ? value.slice(0, 10) : '';
}

function statusLabel(status: string) {
  return STATUS_LABEL[status] || status;
}

function hoursBetween(checkIn: string, checkOut: string) {
  const [ah, am] = checkIn.split(':').map(Number);
  const [bh, bm] = checkOut.split(':').map(Number);
  if ([ah, am, bh, bm].some((part) => Number.isNaN(part))) return 0;
  return Math.max(0, (bh * 60 + bm - (ah * 60 + am)) / 60);
}

function DataTable({ columns, rows }: { columns: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto border border-rule bg-paper-raised">
      <table className="w-full text-sm">
        <thead className="bg-paper-inset text-ink-muted">
          <tr>
            {columns.map((column) => (
              <th key={column} className="text-left font-medium px-3 py-2 whitespace-nowrap">{column}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-3 py-6 text-ink-muted">No records</td>
            </tr>
          ) : rows.map((row, index) => (
            <tr key={`${row[0]}-${index}`} className="border-t border-rule">
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="px-3 py-2 whitespace-nowrap">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Panel({ title, hint, children }: { key?: React.Key; title: string; hint?: string; children?: React.ReactNode }) {
  return (
    <section className="bg-paper-raised border border-rule p-4 space-y-3">
      <div>
        <h3 className="text-sm font-semibold text-ink-text">{title}</h3>
        {hint && <p className="text-xs text-ink-muted mt-1 leading-relaxed">{hint}</p>}
      </div>
      {children}
    </section>
  );
}

function keep(rows: string[][], query: string) {
  const needle = query.trim();
  if (!needle) return rows;
  return rows.filter((row) => row.join(' ').includes(needle));
}

export const ERPView: React.FC<ERPViewProps> = ({ features, catalog, onUpgradeInPlace }) => {
  const [section, setSection] = useState<Section>('overview');
  const [query, setQuery] = useState('');
  const [board, setBoard] = useState<ErpCatalog>(catalog);
  const [notice, setNotice] = useState('');
  const [barcode, setBarcode] = useState('');
  const [barcodeHit, setBarcodeHit] = useState('');
  const [month, setMonth] = useState('2026-09');
  const [traceProduct, setTraceProduct] = useState(catalog.products[0]?.id || '');

  const [materialForm, setMaterialForm] = useState({ code: '', nameAr: '', category: 'Grains', minQty: '1000', vatTreatment: 'ZERO' });
  const [productForm, setProductForm] = useState({ code: '', nameAr: '', salePrice: '0.180', bagKg: '50' });
  const [supplierForm, setSupplierForm] = useState({ nameAr: '', vatNumber: '', phone: '', address: '' });
  const [customerForm, setCustomerForm] = useState({ nameAr: '', vatNumber: '', phone: '', address: '' });
  const [employeeForm, setEmployeeForm] = useState({ nameAr: '', department: 'Production', jobTitle: '', basicSalary: '400' });
  const [poForm, setPoForm] = useState({ supplierId: catalog.suppliers[0]?.id || '', materialId: catalog.materials[0]?.id || '', qty: '1000', unitCost: '0.100', notes: '' });
  const [expenseForm, setExpenseForm] = useState({ category: 'Energy', description: '', amount: '50', vatTreatment: 'STANDARD' });
  const [taskForm, setTaskForm] = useState({ title: '', assigneeRole: 'GM', dueDate: '2026-09-22' });
  const [attendanceForm, setAttendanceForm] = useState({ employeeId: catalog.employees[0]?.id || '', date: '2026-09-21', checkIn: '07:00', checkOut: '15:00' });
  const [adjustmentForm, setAdjustmentForm] = useState({ batchNo: catalog.balances[0]?.batchNo || '', delta: '0', reason: '' });
  const [invoiceForm, setInvoiceForm] = useState({ customerId: catalog.customers[0]?.id || '', productId: catalog.products[0]?.id || '', qty: '100', unitPrice: '0.180' });
  const [paymentForm, setPaymentForm] = useState({ invoiceId: catalog.invoices[0]?.id || '', amount: '10', method: 'Bank transfer' });
  const [withdrawalForm, setWithdrawalForm] = useState({ productId: catalog.products[0]?.id || '', qty: '50', notes: '' });

  useEffect(() => {
    setBoard(catalog);
    setPoForm((form) => ({ ...form, supplierId: catalog.suppliers[0]?.id || '', materialId: catalog.materials[0]?.id || '' }));
    setAttendanceForm((form) => ({ ...form, employeeId: catalog.employees[0]?.id || '' }));
    setInvoiceForm((form) => ({ ...form, customerId: catalog.customers[0]?.id || '', productId: catalog.products[0]?.id || '' }));
    setPaymentForm((form) => ({ ...form, invoiceId: catalog.invoices[0]?.id || '' }));
    setTraceProduct(catalog.products[0]?.id || '');
  }, [catalog]);

  const meta = useMemo(() => GROUPS.flatMap((group) => group.items).find((item) => item.id === section), [section]);

  const nameOf = (kind: 'material' | 'product' | 'supplier' | 'customer' | 'employee' | 'warehouse' | 'user', id: string) => {
    if (kind === 'material') return board.materials.find((item) => item.id === id)?.nameAr || id;
    if (kind === 'product') return board.products.find((item) => item.id === id)?.nameAr || id;
    if (kind === 'supplier') return board.suppliers.find((item) => item.id === id)?.nameAr || id;
    if (kind === 'customer') return board.customers.find((item) => item.id === id)?.nameAr || id;
    if (kind === 'employee') return board.employees.find((item) => item.id === id)?.nameAr || id;
    if (kind === 'warehouse') return board.warehouses.find((item) => item.key === id)?.nameAr || id;
    return board.users.find((item) => item.id === id)?.fullName || id;
  };

  const itemName = (itemType: string, itemId: string) => (
    itemType === 'PRODUCT' ? nameOf('product', itemId) : nameOf('material', itemId)
  );

  const books = useMemo(() => {
    const debit = new Map<string, number>();
    const credit = new Map<string, number>();
    board.journals.forEach((entry) => {
      entry.lines.forEach((line) => {
        debit.set(line.accountCode, (debit.get(line.accountCode) || 0) + line.debit);
        credit.set(line.accountCode, (credit.get(line.accountCode) || 0) + line.credit);
      });
    });
    const balanceFor = (code: string, type: string) => {
      const dr = debit.get(code) || 0;
      const cr = credit.get(code) || 0;
      return type === 'ASSET' || type === 'EXPENSE' ? dr - cr : cr - dr;
    };
    const revenue = board.accounts.filter((account) => account.type === 'REVENUE').reduce((sum, account) => sum + balanceFor(account.code, account.type), 0);
    const expense = board.accounts.filter((account) => account.type === 'EXPENSE').reduce((sum, account) => sum + balanceFor(account.code, account.type), 0);
    const inventoryValue = board.balances.filter((row) => row.qty > 0).reduce((sum, row) => sum + row.qty * row.unitCost, 0);
    const pending = board.purchaseOrders.filter((row) => row.status === 'PENDING_APPROVAL').length
      + board.expenses.filter((row) => row.status === 'PENDING_APPROVAL').length
      + board.payrolls.filter((row) => row.status === 'PENDING_APPROVAL').length
      + board.adjustments.filter((row) => row.status === 'PENDING_APPROVAL').length;
    const shortages = board.notifications.filter((row) => row.kind === 'LOW_STOCK' && !row.read);
    const trialDebit = Array.from(debit.values()).reduce((sum, value) => sum + value, 0);
    const trialCredit = Array.from(credit.values()).reduce((sum, value) => sum + value, 0);
    return { debit, credit, balanceFor, revenue, expense, profit: revenue - expense, inventoryValue, pending, shortages, trialDebit, trialCredit };
  }, [board]);

  const stamp = (action: string, entity: string, detail: string) => ({
    id: `aud-${Date.now()}`,
    at: new Date().toISOString(),
    userId: board.viewer.id,
    userName: board.viewer.fullName,
    action,
    entity,
    entityId: '',
    detail,
  });

  const nextNumber = (key: string) => {
    const current = board.sequences[key] || 0;
    return { value: current + 1, number: `${key}-${String(current + 1).padStart(3, '0')}` };
  };

  if (!features.erp_enabled) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <div className="bg-ink-900 border border-ink-border p-8">
          <div className="w-12 h-12 rounded-lg border border-rule bg-paper-inset flex items-center justify-center mb-5">
            <Lock className="w-5 h-5 text-amber" />
          </div>
          <h2 className="text-xl font-semibold text-paper tracking-tight mb-2">Factory ERP is locked</h2>
          <p className="text-paper/70 text-sm max-w-xl mb-6 leading-relaxed">
            The {features.tier} plan does not include the mill operating system. Enterprise opens the Gulf Feed factory workspace: inventory, purchasing, production, taxed sales, payroll, and approvals.
          </p>
          <div className="p-4 bg-ink-800 border border-ink-border text-left text-sm text-paper/80 space-y-2 mb-6">
            <div className="font-semibold flex items-center gap-1.5 text-amber">
              <Sparkles className="w-4 h-4" />
              Enterprise modules
            </div>
            {GROUPS.map((group) => (
              <p key={group.label}>• {group.label}: {group.items.map((item) => item.label).join(', ')}</p>
            ))}
          </div>
          <button
            onClick={() => onUpgradeInPlace('enterprise')}
            className="px-5 py-2.5 bg-amber hover:opacity-90 text-ink-950 text-sm font-semibold"
          >
            Upgrade in-place to Enterprise
          </button>
        </div>
      </div>
    );
  }

  const saveMaterial = (event: React.FormEvent) => {
    event.preventDefault();
    if (!materialForm.code || !materialForm.nameAr) return;
    setBoard((prev) => ({
      ...prev,
      materials: [{
        id: `mat-${Date.now()}`,
        code: materialForm.code,
        nameAr: materialForm.nameAr,
        category: materialForm.category,
        unit: 'kg',
        minQty: Number(materialForm.minQty) || 0,
        vatTreatment: materialForm.vatTreatment,
        barcode: materialForm.code,
        active: true,
      }, ...prev.materials],
      auditLogs: [stamp('Create material', 'material', materialForm.nameAr), ...prev.auditLogs],
    }));
    setMaterialForm({ code: '', nameAr: '', category: 'Grains', minQty: '1000', vatTreatment: 'ZERO' });
    setNotice('Raw material saved');
  };

  const saveProduct = (event: React.FormEvent) => {
    event.preventDefault();
    if (!productForm.code || !productForm.nameAr) return;
    setBoard((prev) => ({
      ...prev,
      products: [{
        id: `prd-${Date.now()}`,
        code: productForm.code,
        nameAr: productForm.nameAr,
        unit: 'kg',
        salePrice: Number(productForm.salePrice) || 0,
        vatTreatment: 'STANDARD',
        barcode: productForm.code,
        bagKg: Number(productForm.bagKg) || 50,
        active: true,
      }, ...prev.products],
      auditLogs: [stamp('Create product', 'product', productForm.nameAr), ...prev.auditLogs],
    }));
    setProductForm({ code: '', nameAr: '', salePrice: '0.180', bagKg: '50' });
    setNotice('Product saved');
  };

  const saveParty = (kind: 'suppliers' | 'customers', form: { nameAr: string; vatNumber: string; phone: string; address: string }, prefix: string) => {
    if (!form.nameAr) return;
    setBoard((prev) => {
      const list = prev[kind];
      const code = `${prefix}-${String(list.length + 1).padStart(3, '0')}`;
      return {
        ...prev,
        [kind]: [{ id: `${prefix.toLowerCase()}-${Date.now()}`, code, email: '', ...form }, ...list],
        auditLogs: [stamp(kind === 'suppliers' ? 'Create supplier' : 'Create customer', kind, form.nameAr), ...prev.auditLogs],
      };
    });
    setNotice(kind === 'suppliers' ? 'Supplier saved' : 'Customer saved');
  };

  const saveEmployee = (event: React.FormEvent) => {
    event.preventDefault();
    if (!employeeForm.nameAr) return;
    setBoard((prev) => ({
      ...prev,
      employees: [{
        id: `emp-${Date.now()}`,
        code: `EMP-${String(prev.employees.length + 1).padStart(3, '0')}`,
        nameAr: employeeForm.nameAr,
        department: employeeForm.department,
        jobTitle: employeeForm.jobTitle || 'Employee',
        basicSalary: Number(employeeForm.basicSalary) || 0,
        active: true,
      }, ...prev.employees],
      auditLogs: [stamp('Create employee', 'employee', employeeForm.nameAr), ...prev.auditLogs],
    }));
    setEmployeeForm({ nameAr: '', department: 'Production', jobTitle: '', basicSalary: '400' });
    setNotice('Employee saved');
  };

  const savePurchaseOrder = (event: React.FormEvent) => {
    event.preventDefault();
    if (!poForm.supplierId || !poForm.materialId) return;
    const issued = nextNumber('PO-2026');
    setBoard((prev) => ({
      ...prev,
      sequences: { ...prev.sequences, 'PO-2026': issued.value },
      purchaseOrders: [{
        id: `po-${Date.now()}`,
        number: issued.number,
        supplierId: poForm.supplierId,
        status: 'PENDING_APPROVAL',
        notes: poForm.notes,
        lines: [{ materialId: poForm.materialId, qty: Number(poForm.qty) || 0, unitCost: Number(poForm.unitCost) || 0, receivedQty: 0 }],
        createdBy: prev.viewer.id,
        createdAt: new Date().toISOString(),
      }, ...prev.purchaseOrders],
      auditLogs: [stamp('Create purchase order', 'purchaseOrder', issued.number), ...prev.auditLogs],
    }));
    setNotice(`Sent ${issued.number} for approval`);
  };

  const decide = (kind: 'purchaseOrders' | 'expenses' | 'payrolls' | 'adjustments', id: string, status: string) => {
    setBoard((prev) => ({
      ...prev,
      [kind]: prev[kind].map((row) => row.id === id ? { ...row, status } : row),
      auditLogs: [stamp(status === 'REJECTED' ? 'Reject' : 'Approve', kind, id), ...prev.auditLogs],
    }));
    setNotice(status === 'REJECTED' ? 'Rejected' : 'Approved');
  };

  const receiveOrder = (orderId: string) => {
    const issued = nextNumber('GR-2026');
    setBoard((prev) => {
      const order = prev.purchaseOrders.find((row) => row.id === orderId);
      if (!order || order.status !== 'APPROVED') return prev;
      return {
        ...prev,
        sequences: { ...prev.sequences, 'GR-2026': issued.value },
        purchaseOrders: prev.purchaseOrders.map((row) => row.id === orderId ? {
          ...row,
          status: 'RECEIVED',
          lines: row.lines.map((line) => ({ ...line, receivedQty: line.qty })),
        } : row),
        goodsReceipts: [{
          id: `gr-${Date.now()}`,
          number: issued.number,
          purchaseOrderId: orderId,
          at: new Date().toISOString(),
          createdBy: prev.viewer.id,
          lines: order.lines.map((line) => ({
            materialId: line.materialId,
            qty: line.qty - line.receivedQty,
            unitCost: line.unitCost,
            batchNo: `B-${issued.number}`,
            expiryDate: '2027-09-01',
          })),
        }, ...prev.goodsReceipts],
        auditLogs: [stamp('Goods receipt', 'goodsReceipt', issued.number), ...prev.auditLogs],
      };
    });
    setNotice(`Receipt recorded ${issued.number}`);
  };

  const saveExpense = (event: React.FormEvent) => {
    event.preventDefault();
    if (!expenseForm.description) return;
    const amount = Number(expenseForm.amount) || 0;
    const vat = expenseForm.vatTreatment === 'STANDARD' ? amount * (board.company.vatRatePct / 100) : 0;
    const issued = nextNumber('EXP-2026');
    setBoard((prev) => ({
      ...prev,
      sequences: { ...prev.sequences, 'EXP-2026': issued.value },
      expenses: [{
        id: `exp-${Date.now()}`,
        number: issued.number,
        category: expenseForm.category,
        description: expenseForm.description,
        amount,
        vatTreatment: expenseForm.vatTreatment,
        payFrom: 'BANK',
        status: 'PENDING_APPROVAL',
        vatAmount: vat,
        total: amount + vat,
        createdBy: prev.viewer.id,
        createdAt: new Date().toISOString(),
      }, ...prev.expenses],
      auditLogs: [stamp('Create expense', 'expense', issued.number), ...prev.auditLogs],
    }));
    setExpenseForm({ category: 'Energy', description: '', amount: '50', vatTreatment: 'STANDARD' });
    setNotice('Expense sent for approval');
  };

  const saveInvoice = (event: React.FormEvent) => {
    event.preventDefault();
    const qty = Number(invoiceForm.qty) || 0;
    const unitPrice = Number(invoiceForm.unitPrice) || 0;
    const net = qty * unitPrice;
    const vat = net * (board.company.vatRatePct / 100);
    const issued = nextNumber('INV-2026');
    const invoice: ErpSalesInvoice = {
      id: `inv-${Date.now()}`,
      number: issued.number,
      customerId: invoiceForm.customerId,
      status: 'DRAFT',
      issuedAt: new Date().toISOString(),
      notes: '',
      lines: [{
        productId: invoiceForm.productId,
        qty,
        unitPrice,
        vatTreatment: 'STANDARD',
        vatRatePct: board.company.vatRatePct,
        net,
        vat,
        total: net + vat,
        batchNo: '',
        unitCost: 0,
      }],
      subtotal: net,
      vatAmount: vat,
      total: net + vat,
      paidAmount: 0,
      createdBy: board.viewer.id,
    };
    setBoard((prev) => ({
      ...prev,
      sequences: { ...prev.sequences, 'INV-2026': issued.value },
      invoices: [invoice, ...prev.invoices],
      auditLogs: [stamp('Save invoice draft', 'salesInvoice', issued.number), ...prev.auditLogs],
    }));
    setPaymentForm((form) => ({ ...form, invoiceId: invoice.id }));
    setNotice(`Draft saved ${issued.number}`);
  };

  const confirmInvoice = (id: string) => {
    setBoard((prev) => ({
      ...prev,
      invoices: prev.invoices.map((row) => row.id === id && row.status === 'DRAFT' ? { ...row, status: 'CONFIRMED' } : row),
    }));
    setNotice('Invoice confirmed');
  };

  const savePayment = (event: React.FormEvent) => {
    event.preventDefault();
    const amount = Number(paymentForm.amount) || 0;
    const issued = nextNumber('PAY-2026');
    setBoard((prev) => {
      const invoice = prev.invoices.find((row) => row.id === paymentForm.invoiceId);
      if (!invoice || amount <= 0) return prev;
      const paidAmount = invoice.paidAmount + amount;
      const status = paidAmount >= invoice.total ? 'PAID' : 'PARTIAL';
      return {
        ...prev,
        sequences: { ...prev.sequences, 'PAY-2026': issued.value },
        payments: [{
          id: `pay-${Date.now()}`,
          number: issued.number,
          invoiceId: invoice.id,
          amount,
          method: paymentForm.method,
          at: new Date().toISOString(),
          createdBy: prev.viewer.id,
        }, ...prev.payments],
        invoices: prev.invoices.map((row) => row.id === invoice.id ? { ...row, paidAmount, status: row.status === 'DRAFT' ? row.status : status } : row),
        auditLogs: [stamp('Record collection', 'salesPayment', issued.number), ...prev.auditLogs],
      };
    });
    setNotice('Collection recorded');
  };

  const saveWithdrawal = (event: React.FormEvent) => {
    event.preventDefault();
    setBoard((prev) => ({
      ...prev,
      withdrawals: [{
        id: `wd-${Date.now()}`,
        number: `WD-${String(prev.withdrawals.length + 1).padStart(3, '0')}`,
        productId: withdrawalForm.productId,
        qty: Number(withdrawalForm.qty) || 0,
        notes: withdrawalForm.notes,
        at: new Date().toISOString(),
      }, ...prev.withdrawals],
    }));
    setNotice('Internal withdrawal posted');
  };

  const saveAdjustment = (event: React.FormEvent) => {
    event.preventDefault();
    if (!adjustmentForm.reason) return;
    const issued = nextNumber('ADJ-2026');
    const balance = board.balances.find((row) => row.batchNo === adjustmentForm.batchNo);
    setBoard((prev) => ({
      ...prev,
      sequences: { ...prev.sequences, 'ADJ-2026': issued.value },
      adjustments: [{
        id: `adj-${Date.now()}`,
        number: issued.number,
        warehouse: balance?.warehouse || 'WH_RAW',
        itemId: balance?.itemId || '',
        batchNo: adjustmentForm.batchNo,
        delta: Number(adjustmentForm.delta) || 0,
        reason: adjustmentForm.reason,
        status: 'PENDING_APPROVAL',
        createdAt: new Date().toISOString(),
      }, ...prev.adjustments],
      auditLogs: [stamp('Request stock adjustment', 'adjustment', issued.number), ...prev.auditLogs],
    }));
    setAdjustmentForm({ ...adjustmentForm, reason: '' });
    setNotice('Adjustment sent for approval');
  };

  const saveAttendance = (event: React.FormEvent) => {
    event.preventDefault();
    setBoard((prev) => ({
      ...prev,
      attendance: [{
        id: `att-${Date.now()}`,
        employeeId: attendanceForm.employeeId,
        date: attendanceForm.date,
        checkIn: attendanceForm.checkIn,
        checkOut: attendanceForm.checkOut,
        source: 'MANUAL',
      }, ...prev.attendance],
    }));
    setNotice('Attendance recorded');
  };

  const saveTask = (event: React.FormEvent) => {
    event.preventDefault();
    if (!taskForm.title) return;
    setBoard((prev) => ({
      ...prev,
      tasks: [{
        id: `task-${Date.now()}`,
        title: taskForm.title,
        assigneeRole: taskForm.assigneeRole,
        dueDate: taskForm.dueDate,
        status: 'OPEN',
        createdAt: new Date().toISOString(),
      }, ...prev.tasks],
      auditLogs: [stamp('Create task', 'task', taskForm.title), ...prev.auditLogs],
    }));
    setTaskForm({ title: '', assigneeRole: 'GM', dueDate: '2026-09-22' });
    setNotice('Task added');
  };

  const lookupBarcode = (event: React.FormEvent) => {
    event.preventDefault();
    const code = barcode.trim();
    const material = board.materials.find((item) => item.barcode === code || item.code === code);
    const product = board.products.find((item) => item.barcode === code || item.code === code);
    if (material) setBarcodeHit(`${material.nameAr} · ${material.code} · minimum ${num(material.minQty)} kg`);
    else if (product) setBarcodeHit(`${product.nameAr} · ${product.code} · ${omr(product.salePrice)} / kg · bag ${product.bagKg} kg`);
    else setBarcodeHit('No item matches this barcode');
  };

  const materialRows = keep(board.materials.map((item) => [
    item.code, item.nameAr, item.category, `${num(item.minQty)} kg`, VAT_LABEL[item.vatTreatment] || item.vatTreatment, item.barcode,
  ]), query);
  const batchRows = keep(board.balances.filter((row) => row.itemType === 'MATERIAL').map((row) => [
    nameOf('warehouse', row.warehouse), itemName(row.itemType, row.itemId), row.batchNo, num(row.qty), omr(row.unitCost), omr(row.qty * row.unitCost), day(row.expiryDate),
  ]), query);
  const balanceRows = keep(board.balances.map((row) => [
    nameOf('warehouse', row.warehouse), itemName(row.itemType, row.itemId), row.batchNo, num(row.qty), omr(row.unitCost), omr(row.qty * row.unitCost), day(row.expiryDate),
  ]), query);
  const ledgerRows = keep(board.ledger.map((row) => [
    day(row.at), LEDGER_LABEL[row.type] || row.type, nameOf('warehouse', row.warehouse), itemName(row.itemType, row.itemId), row.batchNo, num(row.qty), num(row.prevQty), num(row.newQty),
  ]), query);

  const outputVat = board.invoices
    .filter((row) => row.status !== 'DRAFT' && day(row.issuedAt).startsWith(month))
    .reduce((sum, row) => sum + row.vatAmount, 0);
  const inputVat = board.goodsReceipts
    .filter((row) => day(row.at).startsWith(month))
    .reduce((sum, row) => sum + row.lines.reduce((lineSum, line) => {
      const material = board.materials.find((item) => item.id === line.materialId);
      return lineSum + (material?.vatTreatment === 'STANDARD' ? line.qty * line.unitCost * (board.company.vatRatePct / 100) : 0);
    }, 0), 0)
    + board.expenses.filter((row) => row.status === 'POSTED' && day(row.createdAt).startsWith(month)).reduce((sum, row) => sum + row.vatAmount, 0);

  const traced = board.products.find((item) => item.id === traceProduct);
  const tracedRecipe = board.recipes.find((item) => item.productId === traceProduct);
  const tracedBalance = board.balances.filter((row) => row.itemId === traceProduct).reduce((sum, row) => sum + row.qty, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
      <div className="bg-paper-raised border border-rule p-5">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div>
            <div className="text-[11px] font-mono font-bold tracking-wider text-ink-muted">
              {board.company.nameAr} · {ROLE_LABEL[board.viewer.role] || board.viewer.role} · Demo
            </div>
            <h1 className="text-xl font-semibold text-ink-text mt-1">{meta?.label}</h1>
            <p className="text-sm text-ink-muted mt-1">{meta?.description}</p>
          </div>
          <div className="text-sm text-ink-muted">
            Hello, {board.viewer.fullName}
            <div className="text-xs">{board.company.nameEn} · {board.company.city}</div>
          </div>
        </div>
        <div className="mt-4 space-y-2">
          {GROUPS.map((group) => (
            <div key={group.label} className="flex items-center gap-2 overflow-x-auto">
              <span className="w-24 shrink-0 text-[11px] text-ink-muted">{group.label}</span>
              <div className="flex gap-1 border border-rule bg-paper-inset p-1">
                {group.items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => { setSection(item.id); setQuery(''); setNotice(''); }}
                    className={`px-3 py-1.5 text-sm whitespace-nowrap ${section === item.id ? 'bg-amber text-ink-950 font-semibold' : 'text-ink-muted hover:text-ink-text'}`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex flex-col sm:flex-row gap-2">
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search this table" className={fieldClass} />
          {notice && <div className="px-3 py-2 text-sm border border-rule bg-paper-inset whitespace-nowrap">{notice}</div>}
        </div>
      </div>

      {section === 'overview' && (
        <div className="space-y-4">
          <p className="text-sm text-ink-muted">Purchase → Receipt → Transfer → Production → Tax invoice → Journal entry</p>
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
            {[
              ['Inventory value', omr(books.inventoryValue)],
              ['Recorded revenue', omr(books.revenue)],
              ['Pending approvals', String(books.pending)],
              ['Low-stock alerts', String(books.shortages.length)],
            ].map(([label, value]) => (
              <div key={label} className="bg-paper-raised border border-rule p-4">
                <div className="text-[11px] text-ink-muted">{label}</div>
                <div className="text-2xl font-semibold font-mono mt-1">{value}</div>
              </div>
            ))}
          </div>
          <div className="grid lg:grid-cols-2 gap-4">
            <Panel title="Stock shortages">
              {books.shortages.length === 0 ? <p className="text-sm text-ink-muted">No open shortages</p> : books.shortages.map((item) => (
                <p key={item.id} className="text-sm">{item.body}</p>
              ))}
            </Panel>
            <Panel title="Latest movements">
              <DataTable columns={['Type', 'Item', 'Quantity']} rows={board.ledger.slice(0, 6).map((row) => [LEDGER_LABEL[row.type] || row.type, row.batchNo, num(row.qty)])} />
            </Panel>
          </div>
        </div>
      )}

      {section === 'materials' && (
        <div className="space-y-4">
          <Panel title="New raw material" hint="The minimum quantity raises a low-stock email when SMTP is configured.">
            <form onSubmit={saveMaterial} className="grid gap-3 md:grid-cols-2">
              <input className={fieldClass} placeholder="Code" value={materialForm.code} onChange={(event) => setMaterialForm({ ...materialForm, code: event.target.value })} />
              <input className={fieldClass} placeholder="Name" value={materialForm.nameAr} onChange={(event) => setMaterialForm({ ...materialForm, nameAr: event.target.value })} />
              <input className={fieldClass} placeholder="Category" value={materialForm.category} onChange={(event) => setMaterialForm({ ...materialForm, category: event.target.value })} />
              <input className={fieldClass} placeholder="Minimum (kg)" value={materialForm.minQty} onChange={(event) => setMaterialForm({ ...materialForm, minQty: event.target.value })} />
              <select className={fieldClass} value={materialForm.vatTreatment} onChange={(event) => setMaterialForm({ ...materialForm, vatTreatment: event.target.value })}>
                <option value="ZERO">Zero-rated</option>
                <option value="STANDARD">Standard-rated</option>
                <option value="EXEMPT">Exempt</option>
              </select>
              <button className="px-3 py-2 bg-amber text-ink-950 text-sm font-semibold">Save</button>
            </form>
          </Panel>
          <DataTable columns={['Code', 'Name', 'Category', 'Minimum', 'Tax', 'Barcode']} rows={materialRows} />
        </div>
      )}

      {section === 'batches' && <DataTable columns={['Warehouse', 'Item', 'Batch', 'Quantity', 'Cost', 'Value', 'Expiry']} rows={batchRows} />}
      {section === 'balances' && <DataTable columns={['Warehouse', 'Item', 'Batch', 'Quantity', 'Cost', 'Value', 'Expiry']} rows={balanceRows} />}
      {section === 'ledger' && (
        <div className="space-y-3">
          <p className="text-sm text-ink-muted">Stock does not change without a recorded movement. Every receipt or issue shows the balance before and after.</p>
          <DataTable columns={['Date', 'Type', 'Warehouse', 'Item', 'Batch', 'Quantity', 'Before', 'After']} rows={ledgerRows} />
        </div>
      )}

      {section === 'products' && (
        <div className="space-y-4">
          <Panel title="Finished product" hint="Selling price per kilogram in Omani rial, tax excluded.">
            <form onSubmit={saveProduct} className="grid gap-3 md:grid-cols-2">
              <input className={fieldClass} placeholder="Code" value={productForm.code} onChange={(event) => setProductForm({ ...productForm, code: event.target.value })} />
              <input className={fieldClass} placeholder="Name" value={productForm.nameAr} onChange={(event) => setProductForm({ ...productForm, nameAr: event.target.value })} />
              <input className={fieldClass} placeholder="Sale price / kg" value={productForm.salePrice} onChange={(event) => setProductForm({ ...productForm, salePrice: event.target.value })} />
              <input className={fieldClass} placeholder="Bag weight kg" value={productForm.bagKg} onChange={(event) => setProductForm({ ...productForm, bagKg: event.target.value })} />
              <button className="px-3 py-2 bg-amber text-ink-950 text-sm font-semibold">Save</button>
            </form>
          </Panel>
          <DataTable columns={['Code', 'Name', 'Sale price / kg', 'Bag', 'Tax', 'Barcode']} rows={keep(board.products.map((item) => [item.code, item.nameAr, omr(item.salePrice), `${item.bagKg} kg`, VAT_LABEL[item.vatTreatment] || item.vatTreatment, item.barcode]), query)} />
        </div>
      )}

      {section === 'warehouses' && (
        <div className="grid md:grid-cols-3 gap-3">
          {board.warehouses.map((warehouse) => (
            <Panel key={warehouse.key} title={warehouse.nameAr} hint={warehouse.key}>
              {warehouse.locations.map((location) => (
                <p key={location.code} className="text-sm">{location.code} · {location.nameAr}</p>
              ))}
              <p className="text-sm text-ink-muted">Inventory value {omr(board.balances.filter((row) => row.warehouse === warehouse.key).reduce((sum, row) => sum + row.qty * row.unitCost, 0))}</p>
            </Panel>
          ))}
        </div>
      )}

      {section === 'transfers' && (
        <Panel title="Recent transfers" hint="Materials are issued from the raw materials warehouse to the manufacturing warehouse before a production order is completed.">
          <DataTable columns={['Number', 'From', 'To', 'Date', 'Lines']} rows={keep(board.transfers.map((row) => [row.number, nameOf('warehouse', row.from), nameOf('warehouse', row.to), day(row.at), String(row.lines.length)]), query)} />
        </Panel>
      )}

      {section === 'adjustments' && (
        <div className="space-y-4">
          <Panel title="Request stock adjustment" hint="The adjustment is applied only after the general manager approves it, with a written reason.">
            <form onSubmit={saveAdjustment} className="grid gap-3 md:grid-cols-2">
              <select className={fieldClass} value={adjustmentForm.batchNo} onChange={(event) => setAdjustmentForm({ ...adjustmentForm, batchNo: event.target.value })}>
                {board.balances.map((row) => <option key={row.id} value={row.batchNo}>{row.batchNo} · {itemName(row.itemType, row.itemId)}</option>)}
              </select>
              <input className={fieldClass} placeholder="Difference (+/-)" value={adjustmentForm.delta} onChange={(event) => setAdjustmentForm({ ...adjustmentForm, delta: event.target.value })} />
              <input className={fieldClass} placeholder="Reason" value={adjustmentForm.reason} onChange={(event) => setAdjustmentForm({ ...adjustmentForm, reason: event.target.value })} />
              <button className="px-3 py-2 bg-amber text-ink-950 text-sm font-semibold">Send for approval</button>
            </form>
          </Panel>
          <DataTable columns={['Number', 'Batch', 'Difference', 'Reason', 'Status']} rows={keep(board.adjustments.map((row) => [row.number, row.batchNo, num(row.delta), row.reason, statusLabel(row.status)]), query)} />
        </div>
      )}

      {section === 'barcode' && (
        <Panel title="Barcode station" hint="Works like a keyboard wedge: scan or type the code, then search. Print the label from a barcode printer.">
          <form onSubmit={lookupBarcode} className="flex gap-2">
            <input className={fieldClass} placeholder="Scan or type" value={barcode} onChange={(event) => setBarcode(event.target.value)} />
            <button className="px-4 bg-amber text-ink-950 text-sm font-semibold">Search</button>
          </form>
          {barcodeHit && <p className="text-sm">{barcodeHit}</p>}
        </Panel>
      )}

      {section === 'suppliers' && (
        <div className="space-y-4">
          <Panel title="New supplier">
            <form onSubmit={(event) => { event.preventDefault(); saveParty('suppliers', supplierForm, 'S'); setSupplierForm({ nameAr: '', vatNumber: '', phone: '', address: '' }); }} className="grid gap-3 md:grid-cols-2">
              <input className={fieldClass} placeholder="Name" value={supplierForm.nameAr} onChange={(event) => setSupplierForm({ ...supplierForm, nameAr: event.target.value })} />
              <input className={fieldClass} placeholder="Tax number" value={supplierForm.vatNumber} onChange={(event) => setSupplierForm({ ...supplierForm, vatNumber: event.target.value })} />
              <input className={fieldClass} placeholder="Phone" value={supplierForm.phone} onChange={(event) => setSupplierForm({ ...supplierForm, phone: event.target.value })} />
              <input className={fieldClass} placeholder="Address" value={supplierForm.address} onChange={(event) => setSupplierForm({ ...supplierForm, address: event.target.value })} />
              <button className="px-3 py-2 bg-amber text-ink-950 text-sm font-semibold">Save</button>
            </form>
          </Panel>
          <DataTable columns={['Code', 'Name', 'Tax number', 'Phone', 'Address']} rows={keep(board.suppliers.map((item) => [item.code, item.nameAr, item.vatNumber, item.phone, item.address]), query)} />
        </div>
      )}

      {section === 'purchase-orders' && (
        <div className="space-y-4">
          <Panel title="New purchase order" hint="It goes to the general manager for approval before goods can be received.">
            <form onSubmit={savePurchaseOrder} className="grid gap-3 md:grid-cols-2">
              <select className={fieldClass} value={poForm.supplierId} onChange={(event) => setPoForm({ ...poForm, supplierId: event.target.value })}>
                {board.suppliers.map((item) => <option key={item.id} value={item.id}>{item.nameAr}</option>)}
              </select>
              <select className={fieldClass} value={poForm.materialId} onChange={(event) => setPoForm({ ...poForm, materialId: event.target.value })}>
                {board.materials.map((item) => <option key={item.id} value={item.id}>{item.nameAr}</option>)}
              </select>
              <input className={fieldClass} placeholder="Quantity" value={poForm.qty} onChange={(event) => setPoForm({ ...poForm, qty: event.target.value })} />
              <input className={fieldClass} placeholder="Unit price" value={poForm.unitCost} onChange={(event) => setPoForm({ ...poForm, unitCost: event.target.value })} />
              <input className={fieldClass} placeholder="Notes" value={poForm.notes} onChange={(event) => setPoForm({ ...poForm, notes: event.target.value })} />
              <button className="px-3 py-2 bg-amber text-ink-950 text-sm font-semibold">Send for approval</button>
            </form>
          </Panel>
          <DataTable columns={['Number', 'Supplier', 'Material', 'Quantity', 'Status', 'Date']} rows={keep(board.purchaseOrders.map((row) => [
            row.number, nameOf('supplier', row.supplierId), nameOf('material', row.lines[0]?.materialId || ''), num(row.lines[0]?.qty || 0), statusLabel(row.status), day(row.createdAt),
          ]), query)} />
          <div className="flex flex-wrap gap-2">
            {board.purchaseOrders.filter((row) => row.status === 'PENDING_APPROVAL').map((row) => (
              <div key={row.id} className="flex items-center gap-2 border border-rule px-3 py-2 text-sm">
                <span>{row.number}</span>
                <button onClick={() => decide('purchaseOrders', row.id, 'APPROVED')} className="px-2 py-1 bg-amber text-ink-950 font-semibold">Approve</button>
                <button onClick={() => decide('purchaseOrders', row.id, 'REJECTED')} className="px-2 py-1 border border-rule">Reject</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {section === 'goods-receipts' && (
        <div className="space-y-4">
          <Panel title="Receive into the raw materials warehouse" hint="You cannot receive more than the approved purchase order.">
            {board.purchaseOrders.filter((row) => row.status === 'APPROVED').length === 0 ? (
              <p className="text-sm text-ink-muted">No approved order is waiting for receipt</p>
            ) : board.purchaseOrders.filter((row) => row.status === 'APPROVED').map((row) => (
              <div key={row.id} className="flex items-center justify-between gap-3 text-sm border border-rule px-3 py-2">
                <span>{row.number} · {nameOf('supplier', row.supplierId)} · Remaining {num(row.lines.reduce((sum, line) => sum + line.qty - line.receivedQty, 0))}</span>
                <button onClick={() => receiveOrder(row.id)} className="px-3 py-1.5 bg-amber text-ink-950 font-semibold">Record receipt</button>
              </div>
            ))}
          </Panel>
          <DataTable columns={['Receipt', 'Purchase order', 'Date', 'Lines']} rows={keep(board.goodsReceipts.map((row) => {
            const order = board.purchaseOrders.find((item) => item.id === row.purchaseOrderId);
            return [row.number, order?.number || row.purchaseOrderId, day(row.at), String(row.lines.length)];
          }), query)} />
        </div>
      )}

      {section === 'recipes' && (
        <DataTable columns={['Recipe', 'Product', 'Base output', 'Components']} rows={keep(board.recipes.map((row) => [row.nameAr, nameOf('product', row.productId), `${num(row.baseOutputQty)} kg`, String(row.items.length)]), query)} />
      )}

      {section === 'recipe-items' && (
        <DataTable columns={['Recipe', 'Material', 'Quantity']} rows={keep(board.recipes.flatMap((recipe) => recipe.items.map((item) => [recipe.nameAr, nameOf('material', item.materialId), num(item.qty)])), query)} />
      )}

      {section === 'production-orders' && (
        <div className="space-y-4">
          <DataTable columns={['Number', 'Product', 'Planned', 'Actual', 'Waste', 'Status', 'Cost']} rows={keep(board.productionOrders.map((row) => [
            row.number,
            nameOf('product', row.productId),
            num(row.plannedQty),
            num(row.actualOutputQty),
            num(row.expected.reduce((sum, line) => sum + line.wasteQty, 0)),
            statusLabel(row.status),
            omr(row.totalCost),
          ]), query)} />
          {board.productionOrders.map((row) => (
            <Panel key={row.id} title={row.number} hint={row.varianceReason || 'Issues come from the manufacturing warehouse only.'}>
              <DataTable columns={['Material', 'Expected', 'Actual', 'Waste']} rows={row.expected.map((line) => [nameOf('material', line.materialId), num(line.expectedQty), num(line.actualQty), num(line.wasteQty)])} />
            </Panel>
          ))}
        </div>
      )}

      {section === 'customers' && (
        <div className="space-y-4">
          <Panel title="New customer">
            <form onSubmit={(event) => { event.preventDefault(); saveParty('customers', customerForm, 'C'); setCustomerForm({ nameAr: '', vatNumber: '', phone: '', address: '' }); }} className="grid gap-3 md:grid-cols-2">
              <input className={fieldClass} placeholder="Name" value={customerForm.nameAr} onChange={(event) => setCustomerForm({ ...customerForm, nameAr: event.target.value })} />
              <input className={fieldClass} placeholder="Tax number" value={customerForm.vatNumber} onChange={(event) => setCustomerForm({ ...customerForm, vatNumber: event.target.value })} />
              <input className={fieldClass} placeholder="Phone" value={customerForm.phone} onChange={(event) => setCustomerForm({ ...customerForm, phone: event.target.value })} />
              <input className={fieldClass} placeholder="Address" value={customerForm.address} onChange={(event) => setCustomerForm({ ...customerForm, address: event.target.value })} />
              <button className="px-3 py-2 bg-amber text-ink-950 text-sm font-semibold">Save</button>
            </form>
          </Panel>
          <DataTable columns={['Code', 'Name', 'Tax number', 'Phone', 'Address']} rows={keep(board.customers.map((item) => [item.code, item.nameAr, item.vatNumber, item.phone, item.address]), query)} />
        </div>
      )}

      {section === 'invoices' && (
        <div className="space-y-4">
          <Panel title="Sales invoice" hint="Prices exclude tax. Confirming deducts stock from the finished-goods warehouse.">
            <form onSubmit={saveInvoice} className="grid gap-3 md:grid-cols-2">
              <select className={fieldClass} value={invoiceForm.customerId} onChange={(event) => setInvoiceForm({ ...invoiceForm, customerId: event.target.value })}>
                {board.customers.map((item) => <option key={item.id} value={item.id}>{item.nameAr}</option>)}
              </select>
              <select className={fieldClass} value={invoiceForm.productId} onChange={(event) => setInvoiceForm({ ...invoiceForm, productId: event.target.value })}>
                {board.products.map((item) => <option key={item.id} value={item.id}>{item.nameAr}</option>)}
              </select>
              <input className={fieldClass} placeholder="Quantity kg" value={invoiceForm.qty} onChange={(event) => setInvoiceForm({ ...invoiceForm, qty: event.target.value })} />
              <input className={fieldClass} placeholder="Unit price" value={invoiceForm.unitPrice} onChange={(event) => setInvoiceForm({ ...invoiceForm, unitPrice: event.target.value })} />
              <button className="px-3 py-2 bg-amber text-ink-950 text-sm font-semibold">Save draft</button>
            </form>
          </Panel>
          <DataTable columns={['Number', 'Customer', 'Total', 'Collected', 'Status', 'Date']} rows={keep(board.invoices.map((row) => [row.number, nameOf('customer', row.customerId), omr(row.total), omr(row.paidAmount), statusLabel(row.status), day(row.issuedAt)]), query)} />
          <div className="flex flex-wrap gap-2">
            {board.invoices.filter((row) => row.status === 'DRAFT').map((row) => (
              <button key={row.id} onClick={() => confirmInvoice(row.id)} className="px-3 py-1.5 bg-amber text-ink-950 text-sm font-semibold">Confirm {row.number}</button>
            ))}
          </div>
        </div>
      )}

      {section === 'withdrawals' && (
        <div className="space-y-4">
          <Panel title="Internal withdrawal" hint="Deducts finished goods and charges operating expenses, with no sales tax.">
            <form onSubmit={saveWithdrawal} className="grid gap-3 md:grid-cols-2">
              <select className={fieldClass} value={withdrawalForm.productId} onChange={(event) => setWithdrawalForm({ ...withdrawalForm, productId: event.target.value })}>
                {board.products.map((item) => <option key={item.id} value={item.id}>{item.nameAr}</option>)}
              </select>
              <input className={fieldClass} placeholder="Quantity" value={withdrawalForm.qty} onChange={(event) => setWithdrawalForm({ ...withdrawalForm, qty: event.target.value })} />
              <input className={fieldClass} placeholder="Reason" value={withdrawalForm.notes} onChange={(event) => setWithdrawalForm({ ...withdrawalForm, notes: event.target.value })} />
              <button className="px-3 py-2 bg-amber text-ink-950 text-sm font-semibold">Post withdrawal</button>
            </form>
          </Panel>
          <DataTable columns={['Number', 'Product', 'Quantity', 'Date', 'Notes']} rows={keep(board.withdrawals.map((row) => [row.number, nameOf('product', row.productId), num(row.qty), day(row.at), row.notes]), query)} />
        </div>
      )}

      {section === 'payments' && (
        <div className="space-y-4">
          <Panel title="Record collection">
            <form onSubmit={savePayment} className="grid gap-3 md:grid-cols-2">
              <select className={fieldClass} value={paymentForm.invoiceId} onChange={(event) => setPaymentForm({ ...paymentForm, invoiceId: event.target.value })}>
                {board.invoices.map((item) => <option key={item.id} value={item.id}>{item.number} · {nameOf('customer', item.customerId)}</option>)}
              </select>
              <input className={fieldClass} placeholder="Amount" value={paymentForm.amount} onChange={(event) => setPaymentForm({ ...paymentForm, amount: event.target.value })} />
              <select className={fieldClass} value={paymentForm.method} onChange={(event) => setPaymentForm({ ...paymentForm, method: event.target.value })}>
                <option>Bank transfer</option>
                <option>Cash</option>
                <option>Cheque</option>
              </select>
              <button className="px-3 py-2 bg-amber text-ink-950 text-sm font-semibold">Record collection</button>
            </form>
          </Panel>
          <DataTable columns={['Number', 'Invoice', 'Amount', 'Method', 'Date']} rows={keep(board.payments.map((row) => {
            const invoice = board.invoices.find((item) => item.id === row.invoiceId);
            return [row.number, invoice?.number || row.invoiceId, omr(row.amount), row.method, day(row.at)];
          }), query)} />
        </div>
      )}

      {section === 'accounts' && (
        <Panel title="Chart of accounts" hint="Balances are calculated from journals posted by operations, not entered by hand.">
          <DataTable columns={['Code', 'Account', 'Type', 'Balance']} rows={keep(board.accounts.map((row) => [row.code, row.nameAr, ACCOUNT_TYPE_LABEL[row.type] || row.type, omr(books.balanceFor(row.code, row.type))]), query)} />
        </Panel>
      )}

      {section === 'journals' && (
        <DataTable columns={['Journal', 'Date', 'Memo', 'Debit', 'Credit']} rows={keep(board.journals.map((row) => [
          row.number, day(row.at), row.memo, omr(row.lines.reduce((sum, line) => sum + line.debit, 0)), omr(row.lines.reduce((sum, line) => sum + line.credit, 0)),
        ]), query)} />
      )}

      {section === 'expenses' && (
        <div className="space-y-4">
          <Panel title="New expense" hint="Posted after the manager approves it: debit the expense and input VAT, credit the bank or supplier.">
            <form onSubmit={saveExpense} className="grid gap-3 md:grid-cols-2">
              <input className={fieldClass} placeholder="Category" value={expenseForm.category} onChange={(event) => setExpenseForm({ ...expenseForm, category: event.target.value })} />
              <input className={fieldClass} placeholder="Description" value={expenseForm.description} onChange={(event) => setExpenseForm({ ...expenseForm, description: event.target.value })} />
              <input className={fieldClass} placeholder="Amount excluding tax" value={expenseForm.amount} onChange={(event) => setExpenseForm({ ...expenseForm, amount: event.target.value })} />
              <select className={fieldClass} value={expenseForm.vatTreatment} onChange={(event) => setExpenseForm({ ...expenseForm, vatTreatment: event.target.value })}>
                <option value="STANDARD">Standard-rated</option>
                <option value="ZERO">Zero-rated</option>
                <option value="EXEMPT">Exempt</option>
              </select>
              <button className="px-3 py-2 bg-amber text-ink-950 text-sm font-semibold">Send for approval</button>
            </form>
          </Panel>
          <DataTable columns={['Number', 'Category', 'Description', 'Net', 'Status']} rows={keep(board.expenses.map((row) => [row.number, row.category, row.description, omr(row.total), statusLabel(row.status)]), query)} />
          <div className="flex flex-wrap gap-2">
            {board.expenses.filter((row) => row.status === 'PENDING_APPROVAL').map((row) => (
              <div key={row.id} className="flex items-center gap-2 border border-rule px-3 py-2 text-sm">
                <span>{row.number}</span>
                <button onClick={() => decide('expenses', row.id, 'POSTED')} className="px-2 py-1 bg-amber text-ink-950 font-semibold">Approve and post</button>
                <button onClick={() => decide('expenses', row.id, 'REJECTED')} className="px-2 py-1 border border-rule">Reject</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {section === 'vat-report' && (
        <Panel title="VAT return" hint="Output tax on confirmed invoices against input tax on receipts and posted expenses. The default rate is 5%.">
          <input className={fieldClass} value={month} onChange={(event) => setMonth(event.target.value)} />
          <div className="grid md:grid-cols-3 gap-3">
            {[['Output tax', outputVat], ['Input tax', inputVat], ['Net payable', outputVat - inputVat]].map(([label, value]) => (
              <div key={String(label)} className="border border-rule p-3">
                <div className="text-xs text-ink-muted">{label}</div>
                <div className="text-xl font-mono mt-1">{omr(Number(value))}</div>
              </div>
            ))}
          </div>
        </Panel>
      )}

      {section === 'tax-settings' && (
        <Panel title="Tax and company settings">
          <div className="grid gap-3 md:grid-cols-2">
            <label className="text-sm">Tax registration number
              <input className={`${fieldClass} mt-1`} value={board.company.vatNumber} onChange={(event) => setBoard({ ...board, company: { ...board.company, vatNumber: event.target.value } })} />
            </label>
            <label className="text-sm">Tax rate %
              <input className={`${fieldClass} mt-1`} value={board.company.vatRatePct} onChange={(event) => setBoard({ ...board, company: { ...board.company, vatRatePct: Number(event.target.value) || 0 } })} />
            </label>
            <label className="text-sm">Production variance limit %
              <input className={`${fieldClass} mt-1`} value={board.company.varianceThresholdPct} onChange={(event) => setBoard({ ...board, company: { ...board.company, varianceThresholdPct: Number(event.target.value) || 0 } })} />
            </label>
            <label className="text-sm">Alert email
              <input className={`${fieldClass} mt-1`} value={board.company.notifyEmail} onChange={(event) => setBoard({ ...board, company: { ...board.company, notifyEmail: event.target.value } })} />
            </label>
          </div>
        </Panel>
      )}

      {section === 'employees' && (
        <div className="space-y-4">
          <Panel title="Employee">
            <form onSubmit={saveEmployee} className="grid gap-3 md:grid-cols-2">
              <input className={fieldClass} placeholder="Name" value={employeeForm.nameAr} onChange={(event) => setEmployeeForm({ ...employeeForm, nameAr: event.target.value })} />
              <input className={fieldClass} placeholder="Department" value={employeeForm.department} onChange={(event) => setEmployeeForm({ ...employeeForm, department: event.target.value })} />
              <input className={fieldClass} placeholder="Title" value={employeeForm.jobTitle} onChange={(event) => setEmployeeForm({ ...employeeForm, jobTitle: event.target.value })} />
              <input className={fieldClass} placeholder="Basic salary" value={employeeForm.basicSalary} onChange={(event) => setEmployeeForm({ ...employeeForm, basicSalary: event.target.value })} />
              <button className="px-3 py-2 bg-amber text-ink-950 text-sm font-semibold">Save</button>
            </form>
          </Panel>
          <DataTable columns={['Code', 'Name', 'Department', 'Title', 'Salary']} rows={keep(board.employees.map((item) => [item.code, item.nameAr, item.department, item.jobTitle, omr(item.basicSalary)]), query)} />
        </div>
      )}

      {section === 'attendance' && (
        <div className="space-y-4">
          <Panel title="Record attendance" hint="Manual attendance and file import are ready. A fingerprint device can write to the same log later.">
            <form onSubmit={saveAttendance} className="grid gap-3 md:grid-cols-2">
              <select className={fieldClass} value={attendanceForm.employeeId} onChange={(event) => setAttendanceForm({ ...attendanceForm, employeeId: event.target.value })}>
                {board.employees.map((item) => <option key={item.id} value={item.id}>{item.nameAr}</option>)}
              </select>
              <input className={fieldClass} type="date" value={attendanceForm.date} onChange={(event) => setAttendanceForm({ ...attendanceForm, date: event.target.value })} />
              <input className={fieldClass} placeholder="Check in" value={attendanceForm.checkIn} onChange={(event) => setAttendanceForm({ ...attendanceForm, checkIn: event.target.value })} />
              <input className={fieldClass} placeholder="Check out" value={attendanceForm.checkOut} onChange={(event) => setAttendanceForm({ ...attendanceForm, checkOut: event.target.value })} />
              <button className="px-3 py-2 bg-amber text-ink-950 text-sm font-semibold">Record attendance</button>
            </form>
          </Panel>
          <DataTable columns={['Employee', 'Date', 'Check in', 'Check out', 'Source']} rows={keep(board.attendance.map((row) => [nameOf('employee', row.employeeId), row.date, row.checkIn, row.checkOut, row.source === 'MANUAL' ? 'Manual' : row.source]), query)} />
        </div>
      )}

      {section === 'overtime' && (
        <Panel title="Overtime" hint="Hours above 8 in the log. Payroll prices them at 1.25 times the hourly rate.">
          <DataTable columns={['Employee', 'Date', 'Hours worked', 'Overtime', 'Value']} rows={keep(board.attendance.map((row) => {
            const worked = hoursBetween(row.checkIn, row.checkOut);
            const extra = Math.max(0, worked - 8);
            const employee = board.employees.find((item) => item.id === row.employeeId);
            const hourly = employee ? employee.basicSalary / (30 * 8) : 0;
            return [nameOf('employee', row.employeeId), row.date, num(worked), num(extra), omr(extra * hourly * 1.25)];
          }), query)} />
        </Panel>
      )}

      {section === 'payroll' && (
        <div className="space-y-4">
          {board.payrolls.map((row) => (
            <Panel key={row.id} title={`${row.number} · ${row.month}`} hint="The accountant prepares the run, the manager approves it, then it is paid from the bank.">
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm">{statusLabel(row.status)} · Net {omr(row.totalNet)}</div>
                <div className="flex gap-2">
                  {row.status === 'PENDING_APPROVAL' && <button onClick={() => decide('payrolls', row.id, 'APPROVED')} className="px-3 py-1.5 bg-amber text-ink-950 text-sm font-semibold">Approve</button>}
                  {row.status === 'APPROVED' && <button onClick={() => decide('payrolls', row.id, 'PAID')} className="px-3 py-1.5 bg-amber text-ink-950 text-sm font-semibold">Pay</button>}
                </div>
              </div>
              <DataTable columns={['Employee', 'Basic', 'Overtime', 'Net']} rows={row.lines.map((line) => [nameOf('employee', line.employeeId), omr(line.basic), `${num(line.overtimeHours)} h · ${omr(line.overtimeAmount)}`, omr(line.net)])} />
            </Panel>
          ))}
        </div>
      )}

      {section === 'reports' && (
        <div className="space-y-4">
          <div className="grid md:grid-cols-3 gap-3">
            {[['Inventory value', books.inventoryValue], ['Revenue', books.revenue], ['Profit', books.profit]].map(([label, value]) => (
              <div key={String(label)} className="bg-paper-raised border border-rule p-4">
                <div className="text-xs text-ink-muted">{label}</div>
                <div className="text-2xl font-mono mt-1">{omr(Number(value))}</div>
              </div>
            ))}
          </div>
          <Panel title="Trial balance" hint={Math.abs(books.trialDebit - books.trialCredit) < 0.001 ? 'Debits equal credits.' : 'The trial balance is out — review the journals.'}>
            <DataTable columns={['Code', 'Account', 'Debit', 'Credit']} rows={board.accounts.map((row) => [row.code, row.nameAr, omr(books.debit.get(row.code) || 0), omr(books.credit.get(row.code) || 0)])} />
          </Panel>
          <Panel title="Product trace" hint="From the purchase order and receipt through production and sale.">
            <select className={fieldClass} value={traceProduct} onChange={(event) => setTraceProduct(event.target.value)}>
              {board.products.map((item) => <option key={item.id} value={item.id}>{item.nameAr}</option>)}
            </select>
            {traced && (
              <div className="text-sm space-y-1">
                <p>On-hand: {num(tracedBalance)} kg</p>
                <p>Recipe: {tracedRecipe?.nameAr || 'None'}</p>
                <p>Production orders: {board.productionOrders.filter((row) => row.productId === traceProduct).map((row) => row.number).join(', ') || 'None'}</p>
                <p>Invoices: {board.invoices.filter((row) => row.lines.some((line) => line.productId === traceProduct)).map((row) => row.number).join(', ') || 'None'}</p>
              </div>
            )}
          </Panel>
        </div>
      )}

      {section === 'notifications' && (
        <div className="space-y-2">
          {board.notifications.length === 0 && <p className="text-sm text-ink-muted">No notifications</p>}
          {board.notifications.map((item) => (
            <div key={item.id} className="bg-paper-raised border border-rule p-3 flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-semibold">{item.title}</div>
                <div className="text-sm text-ink-muted">{item.body}</div>
                <div className="text-xs text-ink-muted mt-1">{day(item.at)} · Email: {item.emailStatus === 'skipped' ? 'Email not configured' : item.emailStatus} · {item.read ? 'Mark read' : 'Unread'}</div>
              </div>
              {!item.read && (
                <button onClick={() => setBoard({ ...board, notifications: board.notifications.map((row) => row.id === item.id ? { ...row, read: true } : row) })} className="px-3 py-1.5 border border-rule text-sm">Mark read</button>
              )}
            </div>
          ))}
        </div>
      )}

      {section === 'audit' && (
        <DataTable columns={['Time', 'User', 'Action', 'Reference', 'Detail']} rows={keep(board.auditLogs.map((row) => [day(row.at), row.userName, row.action, row.entity, row.detail]), query)} />
      )}

      {section === 'settings' && (
        <Panel title="Company settings" hint="These details print on the tax invoice and the purchase order.">
          <div className="grid gap-3 md:grid-cols-2">
            {([
              ['nameAr', 'Mill name'],
              ['nameEn', 'English name'],
              ['address', 'Address'],
              ['city', 'City'],
              ['phone', 'Phone'],
              ['email', 'Email'],
              ['crNumber', 'Commercial register'],
              ['vatNumber', 'Tax number'],
            ] as const).map(([key, label]) => (
              <label key={key} className="text-sm">{label}
                <input className={`${fieldClass} mt-1`} value={board.company[key]} onChange={(event) => setBoard({ ...board, company: { ...board.company, [key]: event.target.value } })} />
              </label>
            ))}
          </div>
        </Panel>
      )}

      {section === 'tasks' && (
        <div className="space-y-4">
          <Panel title="Task">
            <form onSubmit={saveTask} className="grid gap-3 md:grid-cols-2">
              <input className={fieldClass} placeholder="Task" value={taskForm.title} onChange={(event) => setTaskForm({ ...taskForm, title: event.target.value })} />
              <select className={fieldClass} value={taskForm.assigneeRole} onChange={(event) => setTaskForm({ ...taskForm, assigneeRole: event.target.value })}>
                {Object.entries(ROLE_LABEL).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
              </select>
              <input className={fieldClass} type="date" value={taskForm.dueDate} onChange={(event) => setTaskForm({ ...taskForm, dueDate: event.target.value })} />
              <button className="px-3 py-2 bg-amber text-ink-950 text-sm font-semibold">Add</button>
            </form>
          </Panel>
          <DataTable columns={['Task', 'Assignee', 'Due', 'Status']} rows={keep(board.tasks.map((row) => [row.title, ROLE_LABEL[row.assigneeRole] || row.assigneeRole, row.dueDate, statusLabel(row.status)]), query)} />
          <div className="flex flex-wrap gap-2">
            {board.tasks.filter((row) => row.status === 'OPEN').map((row) => (
              <button key={row.id} onClick={() => setBoard({ ...board, tasks: board.tasks.map((item) => item.id === row.id ? { ...item, status: 'CLOSED' } : item) })} className="px-3 py-1.5 border border-rule text-sm">Close: {row.title}</button>
            ))}
          </div>
        </div>
      )}

      {section === 'approvals' && (
        <div className="space-y-4">
          <Panel title="Purchase orders">
            {board.purchaseOrders.filter((row) => row.status === 'PENDING_APPROVAL').length === 0 ? <p className="text-sm text-ink-muted">None</p> : board.purchaseOrders.filter((row) => row.status === 'PENDING_APPROVAL').map((row) => (
              <div key={row.id} className="flex items-center justify-between text-sm border border-rule px-3 py-2">
                <span>{row.number} · {nameOf('supplier', row.supplierId)} · {row.notes}</span>
                <span className="flex gap-2">
                  <button onClick={() => decide('purchaseOrders', row.id, 'APPROVED')} className="px-2 py-1 bg-amber text-ink-950 font-semibold">Approve</button>
                  <button onClick={() => decide('purchaseOrders', row.id, 'REJECTED')} className="px-2 py-1 border border-rule">Reject</button>
                </span>
              </div>
            ))}
          </Panel>
          <Panel title="Expenses">
            {board.expenses.filter((row) => row.status === 'PENDING_APPROVAL').map((row) => (
              <div key={row.id} className="flex items-center justify-between text-sm border border-rule px-3 py-2">
                <span>{row.number} · {row.description} · {omr(row.total)}</span>
                <button onClick={() => decide('expenses', row.id, 'POSTED')} className="px-2 py-1 bg-amber text-ink-950 font-semibold">Post</button>
              </div>
            ))}
          </Panel>
          <Panel title="Payroll">
            {board.payrolls.filter((row) => row.status === 'PENDING_APPROVAL').map((row) => (
              <div key={row.id} className="flex items-center justify-between text-sm border border-rule px-3 py-2">
                <span>{row.number} · {row.month} · {omr(row.totalNet)}</span>
                <button onClick={() => decide('payrolls', row.id, 'APPROVED')} className="px-2 py-1 bg-amber text-ink-950 font-semibold">Approve</button>
              </div>
            ))}
          </Panel>
          <Panel title="Stock adjustment">
            {board.adjustments.filter((row) => row.status === 'PENDING_APPROVAL').length === 0 ? <p className="text-sm text-ink-muted">None</p> : board.adjustments.filter((row) => row.status === 'PENDING_APPROVAL').map((row) => (
              <div key={row.id} className="flex items-center justify-between text-sm border border-rule px-3 py-2">
                <span>{row.number} · {row.batchNo} · {num(row.delta)} · {row.reason}</span>
                <button onClick={() => decide('adjustments', row.id, 'APPROVED')} className="px-2 py-1 bg-amber text-ink-950 font-semibold">Approve</button>
              </div>
            ))}
          </Panel>
        </div>
      )}

      {section === 'users' && (
        <div className="space-y-4">
          <DataTable columns={['Name', 'Email', 'Role', 'Status']} rows={board.users.map((row) => [row.fullName, row.email, ROLE_LABEL[row.role] || row.role, row.active ? 'Active' : 'Inactive'])} />
          <Panel title="Role permissions" hint="Each role can be narrowed. User management stays with the general manager.">
            <div className="grid lg:grid-cols-3 gap-4">
              {Object.keys(ROLE_LABEL).map((role) => (
                <div key={role} className="border border-rule p-3">
                  <div className="font-semibold text-sm mb-2">{ROLE_LABEL[role]}</div>
                  <div className="space-y-1 max-h-80 overflow-y-auto">
                    {ALL_PERMISSIONS.map((permission) => {
                      const checked = (board.rolePermissions[role] || []).includes(permission);
                      const locked = role === 'GM' && permission === 'users.manage';
                      return (
                        <label key={permission} className="flex items-center gap-2 text-xs">
                          <input
                            type="checkbox"
                            checked={checked}
                            disabled={locked}
                            onChange={() => {
                              if (locked) return;
                              setBoard((prev) => {
                                const current = prev.rolePermissions[role] || [];
                                const next = current.includes(permission) ? current.filter((item) => item !== permission) : [...current, permission];
                                return { ...prev, rolePermissions: { ...prev.rolePermissions, [role]: next } };
                              });
                            }}
                          />
                          <span>{permission}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      )}
    </div>
  );
};
