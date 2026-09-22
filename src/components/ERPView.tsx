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
    label: 'الرئيسية',
    items: [{ id: 'overview', label: 'لوحة التحكم', description: 'ملخص العمليات والمخزون والمبيعات' }],
  },
  {
    label: 'المخزون',
    items: [
      { id: 'materials', label: 'المواد الخام', description: 'أصناف المواد الخام والحد الأدنى والوحدة' },
      { id: 'batches', label: 'دفعات المواد', description: 'رقم الدفعة، الصلاحية، والمورد' },
      { id: 'products', label: 'المنتجات النهائية', description: 'المنتجات الجاهزة وأسعار البيع' },
      { id: 'warehouses', label: 'المستودعات', description: 'WH_RAW / WH_MFG / WH_FG والمواقع' },
      { id: 'balances', label: 'أرصدة المخزون', description: 'الرصيد الحالي ومتوسط التكلفة' },
      { id: 'ledger', label: 'دفتر الحركات', description: 'كل حركة مخزون قابلة للتدقيق' },
      { id: 'transfers', label: 'تحويلات المخزون', description: 'تحويل بين المستودعات الثلاثة' },
      { id: 'adjustments', label: 'تعديل المخزون', description: 'تعديل مع سبب إلزامي واعتماد المدير' },
      { id: 'barcode', label: 'محطة الباركود', description: 'مسح الأصناف وطباعة الملصقات' },
    ],
  },
  {
    label: 'المشتريات',
    items: [
      { id: 'suppliers', label: 'الموردون', description: 'بيانات الموردين والرقم الضريبي' },
      { id: 'purchase-orders', label: 'أوامر الشراء', description: 'أوامر الشراء وحالتها' },
      { id: 'goods-receipts', label: 'استلام البضاعة', description: 'استلام إلى مستودع المواد الخام' },
    ],
  },
  {
    label: 'التصنيع',
    items: [
      { id: 'recipes', label: 'الوصفات', description: 'وصفة الإنتاج وكمية المخرجات الأساسية' },
      { id: 'recipe-items', label: 'مكونات الوصفة', description: 'المواد والكميات داخل كل وصفة' },
      { id: 'production-orders', label: 'أوامر الإنتاج', description: 'المخطط مقابل الفعلي والهدر وسبب الانحراف' },
    ],
  },
  {
    label: 'المبيعات',
    items: [
      { id: 'customers', label: 'العملاء', description: 'بيانات العملاء' },
      { id: 'invoices', label: 'فواتير المبيعات', description: 'فواتير مع الضريبة والحالة' },
      { id: 'withdrawals', label: 'السحوبات', description: 'سحب من مستودع المنتجات' },
      { id: 'payments', label: 'التحصيلات', description: 'تحصيلات مرتبطة بالفواتير' },
    ],
  },
  {
    label: 'الحسابات',
    items: [
      { id: 'accounts', label: 'دليل الحسابات', description: 'شجرة الحسابات والأرصدة من القيود' },
      { id: 'journals', label: 'القيود اليومية', description: 'قيود مرتبطة بالعمليات' },
      { id: 'expenses', label: 'المصروفات', description: 'مصروفات بانتظار الاعتماد ثم الترحيل' },
      { id: 'vat-report', label: 'إقرار الضريبة', description: 'ضريبة المخرجات والمدخلات وصافي المستحق' },
      { id: 'tax-settings', label: 'إعدادات الضريبة', description: 'معدل الضريبة ورقم التسجيل في عُمان' },
    ],
  },
  {
    label: 'الموارد البشرية',
    items: [
      { id: 'employees', label: 'الموظفون', description: 'بيانات الموظفين والأقسام' },
      { id: 'attendance', label: 'الحضور والانصراف', description: 'سجل الحضور (يدوي / ملف / جهاز)' },
      { id: 'overtime', label: 'الساعات الإضافية', description: 'ما زاد عن 8 ساعات، ويُسعَّر بـ 1.25 من أجر الساعة' },
      { id: 'payroll', label: 'الرواتب', description: 'مسير الرواتب والاعتماد والصرف' },
    ],
  },
  {
    label: 'النظام',
    items: [
      { id: 'reports', label: 'التقارير', description: 'تتبع المنتج والمخزون والإنتاج وميزان المراجعة' },
      { id: 'notifications', label: 'الإشعارات', description: 'نقص المخزون وطلبات الاعتماد' },
      { id: 'audit', label: 'سجل العمليات', description: 'من فعل ماذا ومتى' },
      { id: 'settings', label: 'إعدادات الشركة', description: 'العملة، نسبة الانحراف، والضريبة' },
      { id: 'tasks', label: 'المهام', description: 'مهام تشغيلية للمتابعة' },
      { id: 'approvals', label: 'الاعتمادات', description: 'أوامر الشراء والمصروفات والرواتب وتعديل المخزون' },
      { id: 'users', label: 'المستخدمون والصلاحيات', description: 'الأدوار الثلاثة وصلاحيات كل دور' },
    ],
  },
];

const ALL_PERMISSIONS = Array.from(new Set(Object.values(erpCatalog.rolePermissions).flat()));
const fieldClass = 'w-full px-3 py-2 border border-rule bg-paper text-ink-text text-sm placeholder:text-ink-muted/70 focus:outline-none focus:border-amber';

function omr(value: number) {
  return `${value.toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 })} ر.ع.`;
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
              <th key={column} className="text-right font-medium px-3 py-2 whitespace-nowrap">{column}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-3 py-6 text-ink-muted">لا توجد سجلات</td>
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

  const [materialForm, setMaterialForm] = useState({ code: '', nameAr: '', category: 'حبوب', minQty: '1000', vatTreatment: 'ZERO' });
  const [productForm, setProductForm] = useState({ code: '', nameAr: '', salePrice: '0.180', bagKg: '50' });
  const [supplierForm, setSupplierForm] = useState({ nameAr: '', vatNumber: '', phone: '', address: '' });
  const [customerForm, setCustomerForm] = useState({ nameAr: '', vatNumber: '', phone: '', address: '' });
  const [employeeForm, setEmployeeForm] = useState({ nameAr: '', department: 'الإنتاج', jobTitle: '', basicSalary: '400' });
  const [poForm, setPoForm] = useState({ supplierId: catalog.suppliers[0]?.id || '', materialId: catalog.materials[0]?.id || '', qty: '1000', unitCost: '0.100', notes: '' });
  const [expenseForm, setExpenseForm] = useState({ category: 'طاقة', description: '', amount: '50', vatTreatment: 'STANDARD' });
  const [taskForm, setTaskForm] = useState({ title: '', assigneeRole: 'GM', dueDate: '2026-09-22' });
  const [attendanceForm, setAttendanceForm] = useState({ employeeId: catalog.employees[0]?.id || '', date: '2026-09-21', checkIn: '07:00', checkOut: '15:00' });
  const [adjustmentForm, setAdjustmentForm] = useState({ batchNo: catalog.balances[0]?.batchNo || '', delta: '0', reason: '' });
  const [invoiceForm, setInvoiceForm] = useState({ customerId: catalog.customers[0]?.id || '', productId: catalog.products[0]?.id || '', qty: '100', unitPrice: '0.180' });
  const [paymentForm, setPaymentForm] = useState({ invoiceId: catalog.invoices[0]?.id || '', amount: '10', method: 'تحويل بنكي' });
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
              <p key={group.label}>• {group.label}: {group.items.map((item) => item.label).join('، ')}</p>
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
        unit: 'كجم',
        minQty: Number(materialForm.minQty) || 0,
        vatTreatment: materialForm.vatTreatment,
        barcode: materialForm.code,
        active: true,
      }, ...prev.materials],
      auditLogs: [stamp('إنشاء مادة', 'material', materialForm.nameAr), ...prev.auditLogs],
    }));
    setMaterialForm({ code: '', nameAr: '', category: 'حبوب', minQty: '1000', vatTreatment: 'ZERO' });
    setNotice('تم حفظ المادة الخام');
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
        unit: 'كجم',
        salePrice: Number(productForm.salePrice) || 0,
        vatTreatment: 'STANDARD',
        barcode: productForm.code,
        bagKg: Number(productForm.bagKg) || 50,
        active: true,
      }, ...prev.products],
      auditLogs: [stamp('إنشاء منتج', 'product', productForm.nameAr), ...prev.auditLogs],
    }));
    setProductForm({ code: '', nameAr: '', salePrice: '0.180', bagKg: '50' });
    setNotice('تم حفظ المنتج');
  };

  const saveParty = (kind: 'suppliers' | 'customers', form: { nameAr: string; vatNumber: string; phone: string; address: string }, prefix: string) => {
    if (!form.nameAr) return;
    setBoard((prev) => {
      const list = prev[kind];
      const code = `${prefix}-${String(list.length + 1).padStart(3, '0')}`;
      return {
        ...prev,
        [kind]: [{ id: `${prefix.toLowerCase()}-${Date.now()}`, code, email: '', ...form }, ...list],
        auditLogs: [stamp(kind === 'suppliers' ? 'إنشاء مورد' : 'إنشاء عميل', kind, form.nameAr), ...prev.auditLogs],
      };
    });
    setNotice(kind === 'suppliers' ? 'تم حفظ المورد' : 'تم حفظ العميل');
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
        jobTitle: employeeForm.jobTitle || 'موظف',
        basicSalary: Number(employeeForm.basicSalary) || 0,
        active: true,
      }, ...prev.employees],
      auditLogs: [stamp('إنشاء موظف', 'employee', employeeForm.nameAr), ...prev.auditLogs],
    }));
    setEmployeeForm({ nameAr: '', department: 'الإنتاج', jobTitle: '', basicSalary: '400' });
    setNotice('تم حفظ الموظف');
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
      auditLogs: [stamp('إنشاء أمر شراء', 'purchaseOrder', issued.number), ...prev.auditLogs],
    }));
    setNotice(`أُرسل ${issued.number} للاعتماد`);
  };

  const decide = (kind: 'purchaseOrders' | 'expenses' | 'payrolls' | 'adjustments', id: string, status: string) => {
    setBoard((prev) => ({
      ...prev,
      [kind]: prev[kind].map((row) => row.id === id ? { ...row, status } : row),
      auditLogs: [stamp(status === 'REJECTED' ? 'رفض' : 'اعتماد', kind, id), ...prev.auditLogs],
    }));
    setNotice(status === 'REJECTED' ? 'تم الرفض' : 'تم الاعتماد');
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
        auditLogs: [stamp('استلام مشتريات', 'goodsReceipt', issued.number), ...prev.auditLogs],
      };
    });
    setNotice(`سُجّل الاستلام ${issued.number}`);
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
      auditLogs: [stamp('إنشاء مصروف', 'expense', issued.number), ...prev.auditLogs],
    }));
    setExpenseForm({ category: 'طاقة', description: '', amount: '50', vatTreatment: 'STANDARD' });
    setNotice('أُرسل المصروف للاعتماد');
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
      auditLogs: [stamp('حفظ مسودة فاتورة', 'salesInvoice', issued.number), ...prev.auditLogs],
    }));
    setPaymentForm((form) => ({ ...form, invoiceId: invoice.id }));
    setNotice(`حُفظت المسودة ${issued.number}`);
  };

  const confirmInvoice = (id: string) => {
    setBoard((prev) => ({
      ...prev,
      invoices: prev.invoices.map((row) => row.id === id && row.status === 'DRAFT' ? { ...row, status: 'CONFIRMED' } : row),
    }));
    setNotice('تم تأكيد الفاتورة');
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
        auditLogs: [stamp('تسجيل تحصيل', 'salesPayment', issued.number), ...prev.auditLogs],
      };
    });
    setNotice('سُجّل التحصيل');
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
    setNotice('نُفّذ السحب الداخلي');
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
      auditLogs: [stamp('طلب تعديل مخزون', 'adjustment', issued.number), ...prev.auditLogs],
    }));
    setAdjustmentForm({ ...adjustmentForm, reason: '' });
    setNotice('أُرسل التعديل للاعتماد');
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
    setNotice('سُجّل الحضور');
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
      auditLogs: [stamp('إنشاء مهمة', 'task', taskForm.title), ...prev.auditLogs],
    }));
    setTaskForm({ title: '', assigneeRole: 'GM', dueDate: '2026-09-22' });
    setNotice('أُضيفت المهمة');
  };

  const lookupBarcode = (event: React.FormEvent) => {
    event.preventDefault();
    const code = barcode.trim();
    const material = board.materials.find((item) => item.barcode === code || item.code === code);
    const product = board.products.find((item) => item.barcode === code || item.code === code);
    if (material) setBarcodeHit(`${material.nameAr} · ${material.code} · حد أدنى ${num(material.minQty)} كجم`);
    else if (product) setBarcodeHit(`${product.nameAr} · ${product.code} · ${omr(product.salePrice)} / كجم · كيس ${product.bagKg} كجم`);
    else setBarcodeHit('لا يوجد صنف بهذا الباركود');
  };

  const materialRows = keep(board.materials.map((item) => [
    item.code, item.nameAr, item.category, `${num(item.minQty)} كجم`, VAT_LABEL[item.vatTreatment] || item.vatTreatment, item.barcode,
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
    <div dir="rtl" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
      <div className="bg-paper-raised border border-rule p-5">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div>
            <div className="text-[11px] font-mono font-bold tracking-wider text-ink-muted">
              {board.company.nameAr} · {ROLE_LABEL[board.viewer.role] || board.viewer.role} · تجريبي
            </div>
            <h1 className="text-xl font-semibold text-ink-text mt-1">{meta?.label}</h1>
            <p className="text-sm text-ink-muted mt-1">{meta?.description}</p>
          </div>
          <div className="text-sm text-ink-muted">
            مرحباً، {board.viewer.fullName}
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
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="بحث في الجدول الحالي" className={fieldClass} />
          {notice && <div className="px-3 py-2 text-sm border border-rule bg-paper-inset whitespace-nowrap">{notice}</div>}
        </div>
      </div>

      {section === 'overview' && (
        <div className="space-y-4">
          <p className="text-sm text-ink-muted">شراء → استلام → تحويل → إنتاج → بيع بفاتورة ضريبية → قيد محاسبي</p>
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
            {[
              ['قيمة المخزون', omr(books.inventoryValue)],
              ['إيرادات مسجّلة', omr(books.revenue)],
              ['اعتمادات معلّقة', String(books.pending)],
              ['تنبيهات نقص', String(books.shortages.length)],
            ].map(([label, value]) => (
              <div key={label} className="bg-paper-raised border border-rule p-4">
                <div className="text-[11px] text-ink-muted">{label}</div>
                <div className="text-2xl font-semibold font-mono mt-1">{value}</div>
              </div>
            ))}
          </div>
          <div className="grid lg:grid-cols-2 gap-4">
            <Panel title="نواقص المخزون">
              {books.shortages.length === 0 ? <p className="text-sm text-ink-muted">لا توجد نواقص مفتوحة</p> : books.shortages.map((item) => (
                <p key={item.id} className="text-sm">{item.body}</p>
              ))}
            </Panel>
            <Panel title="آخر الحركات">
              <DataTable columns={['النوع', 'الصنف', 'الكمية']} rows={board.ledger.slice(0, 6).map((row) => [LEDGER_LABEL[row.type] || row.type, row.batchNo, num(row.qty)])} />
            </Panel>
          </div>
        </div>
      )}

      {section === 'materials' && (
        <div className="space-y-4">
          <Panel title="مادة خام جديدة" hint="الحد الأدنى يُطلق تنبيه نقص المخزون بالبريد عند توفر SMTP.">
            <form onSubmit={saveMaterial} className="grid gap-3 md:grid-cols-2">
              <input className={fieldClass} placeholder="الكود" value={materialForm.code} onChange={(event) => setMaterialForm({ ...materialForm, code: event.target.value })} />
              <input className={fieldClass} placeholder="الاسم" value={materialForm.nameAr} onChange={(event) => setMaterialForm({ ...materialForm, nameAr: event.target.value })} />
              <input className={fieldClass} placeholder="التصنيف" value={materialForm.category} onChange={(event) => setMaterialForm({ ...materialForm, category: event.target.value })} />
              <input className={fieldClass} placeholder="الحد الأدنى (كجم)" value={materialForm.minQty} onChange={(event) => setMaterialForm({ ...materialForm, minQty: event.target.value })} />
              <select className={fieldClass} value={materialForm.vatTreatment} onChange={(event) => setMaterialForm({ ...materialForm, vatTreatment: event.target.value })}>
                <option value="ZERO">صفرية</option>
                <option value="STANDARD">خاضعة</option>
                <option value="EXEMPT">معفاة</option>
              </select>
              <button className="px-3 py-2 bg-amber text-ink-950 text-sm font-semibold">حفظ</button>
            </form>
          </Panel>
          <DataTable columns={['الكود', 'الاسم', 'التصنيف', 'الحد الأدنى', 'الضريبة', 'الباركود']} rows={materialRows} />
        </div>
      )}

      {section === 'batches' && <DataTable columns={['المستودع', 'الصنف', 'الدفعة', 'الكمية', 'التكلفة', 'القيمة', 'الصلاحية']} rows={batchRows} />}
      {section === 'balances' && <DataTable columns={['المستودع', 'الصنف', 'الدفعة', 'الكمية', 'التكلفة', 'القيمة', 'الصلاحية']} rows={balanceRows} />}
      {section === 'ledger' && (
        <div className="space-y-3">
          <p className="text-sm text-ink-muted">لا يتغيّر رصيد بدون حركة مسجّلة — كل إضافة أو صرف يظهر هنا مع الرصيد قبل وبعد.</p>
          <DataTable columns={['التاريخ', 'النوع', 'المستودع', 'الصنف', 'الدفعة', 'الكمية', 'قبل', 'بعد']} rows={ledgerRows} />
        </div>
      )}

      {section === 'products' && (
        <div className="space-y-4">
          <Panel title="منتج نهائي" hint="سعر البيع للكيلوغرام بالريال العُماني، غير شامل الضريبة.">
            <form onSubmit={saveProduct} className="grid gap-3 md:grid-cols-2">
              <input className={fieldClass} placeholder="الكود" value={productForm.code} onChange={(event) => setProductForm({ ...productForm, code: event.target.value })} />
              <input className={fieldClass} placeholder="الاسم" value={productForm.nameAr} onChange={(event) => setProductForm({ ...productForm, nameAr: event.target.value })} />
              <input className={fieldClass} placeholder="سعر البيع / كجم" value={productForm.salePrice} onChange={(event) => setProductForm({ ...productForm, salePrice: event.target.value })} />
              <input className={fieldClass} placeholder="وزن الكيس كجم" value={productForm.bagKg} onChange={(event) => setProductForm({ ...productForm, bagKg: event.target.value })} />
              <button className="px-3 py-2 bg-amber text-ink-950 text-sm font-semibold">حفظ</button>
            </form>
          </Panel>
          <DataTable columns={['الكود', 'الاسم', 'سعر البيع / كجم', 'الكيس', 'الضريبة', 'الباركود']} rows={keep(board.products.map((item) => [item.code, item.nameAr, omr(item.salePrice), `${item.bagKg} كجم`, VAT_LABEL[item.vatTreatment] || item.vatTreatment, item.barcode]), query)} />
        </div>
      )}

      {section === 'warehouses' && (
        <div className="grid md:grid-cols-3 gap-3">
          {board.warehouses.map((warehouse) => (
            <Panel key={warehouse.key} title={warehouse.nameAr} hint={warehouse.key}>
              {warehouse.locations.map((location) => (
                <p key={location.code} className="text-sm">{location.code} · {location.nameAr}</p>
              ))}
              <p className="text-sm text-ink-muted">قيمة المخزون {omr(board.balances.filter((row) => row.warehouse === warehouse.key).reduce((sum, row) => sum + row.qty * row.unitCost, 0))}</p>
            </Panel>
          ))}
        </div>
      )}

      {section === 'transfers' && (
        <Panel title="آخر التحويلات" hint="المواد تُصرف للتصنيع من مستودع المواد الخام إلى مستودع التصنيع قبل إكمال أمر الإنتاج.">
          <DataTable columns={['الرقم', 'من', 'إلى', 'التاريخ', 'البنود']} rows={keep(board.transfers.map((row) => [row.number, nameOf('warehouse', row.from), nameOf('warehouse', row.to), day(row.at), String(row.lines.length)]), query)} />
        </Panel>
      )}

      {section === 'adjustments' && (
        <div className="space-y-4">
          <Panel title="طلب تعديل مخزون" hint="لا يُنفَّذ التعديل إلا بعد اعتماد المدير العام، مع سبب مكتوب.">
            <form onSubmit={saveAdjustment} className="grid gap-3 md:grid-cols-2">
              <select className={fieldClass} value={adjustmentForm.batchNo} onChange={(event) => setAdjustmentForm({ ...adjustmentForm, batchNo: event.target.value })}>
                {board.balances.map((row) => <option key={row.id} value={row.batchNo}>{row.batchNo} · {itemName(row.itemType, row.itemId)}</option>)}
              </select>
              <input className={fieldClass} placeholder="الفرق (+/-)" value={adjustmentForm.delta} onChange={(event) => setAdjustmentForm({ ...adjustmentForm, delta: event.target.value })} />
              <input className={fieldClass} placeholder="السبب" value={adjustmentForm.reason} onChange={(event) => setAdjustmentForm({ ...adjustmentForm, reason: event.target.value })} />
              <button className="px-3 py-2 bg-amber text-ink-950 text-sm font-semibold">إرسال للاعتماد</button>
            </form>
          </Panel>
          <DataTable columns={['الرقم', 'الدفعة', 'الفرق', 'السبب', 'الحالة']} rows={keep(board.adjustments.map((row) => [row.number, row.batchNo, num(row.delta), row.reason, statusLabel(row.status)]), query)} />
        </div>
      )}

      {section === 'barcode' && (
        <Panel title="محطة الباركود" hint="يعمل كلوحة مفاتيح: امسح أو اكتب الرمز ثم ابحث. لطباعته استخدم طابعة الباركود.">
          <form onSubmit={lookupBarcode} className="flex gap-2">
            <input className={fieldClass} placeholder="امسح أو اكتب" value={barcode} onChange={(event) => setBarcode(event.target.value)} />
            <button className="px-4 bg-amber text-ink-950 text-sm font-semibold">بحث</button>
          </form>
          {barcodeHit && <p className="text-sm">{barcodeHit}</p>}
        </Panel>
      )}

      {section === 'suppliers' && (
        <div className="space-y-4">
          <Panel title="مورد جديد">
            <form onSubmit={(event) => { event.preventDefault(); saveParty('suppliers', supplierForm, 'S'); setSupplierForm({ nameAr: '', vatNumber: '', phone: '', address: '' }); }} className="grid gap-3 md:grid-cols-2">
              <input className={fieldClass} placeholder="الاسم" value={supplierForm.nameAr} onChange={(event) => setSupplierForm({ ...supplierForm, nameAr: event.target.value })} />
              <input className={fieldClass} placeholder="الرقم الضريبي" value={supplierForm.vatNumber} onChange={(event) => setSupplierForm({ ...supplierForm, vatNumber: event.target.value })} />
              <input className={fieldClass} placeholder="الهاتف" value={supplierForm.phone} onChange={(event) => setSupplierForm({ ...supplierForm, phone: event.target.value })} />
              <input className={fieldClass} placeholder="العنوان" value={supplierForm.address} onChange={(event) => setSupplierForm({ ...supplierForm, address: event.target.value })} />
              <button className="px-3 py-2 bg-amber text-ink-950 text-sm font-semibold">حفظ</button>
            </form>
          </Panel>
          <DataTable columns={['الكود', 'الاسم', 'الرقم الضريبي', 'الهاتف', 'العنوان']} rows={keep(board.suppliers.map((item) => [item.code, item.nameAr, item.vatNumber, item.phone, item.address]), query)} />
        </div>
      )}

      {section === 'purchase-orders' && (
        <div className="space-y-4">
          <Panel title="أمر شراء جديد" hint="يصل للمدير العام للاعتماد قبل أن يُسمح بالاستلام.">
            <form onSubmit={savePurchaseOrder} className="grid gap-3 md:grid-cols-2">
              <select className={fieldClass} value={poForm.supplierId} onChange={(event) => setPoForm({ ...poForm, supplierId: event.target.value })}>
                {board.suppliers.map((item) => <option key={item.id} value={item.id}>{item.nameAr}</option>)}
              </select>
              <select className={fieldClass} value={poForm.materialId} onChange={(event) => setPoForm({ ...poForm, materialId: event.target.value })}>
                {board.materials.map((item) => <option key={item.id} value={item.id}>{item.nameAr}</option>)}
              </select>
              <input className={fieldClass} placeholder="الكمية" value={poForm.qty} onChange={(event) => setPoForm({ ...poForm, qty: event.target.value })} />
              <input className={fieldClass} placeholder="سعر الوحدة" value={poForm.unitCost} onChange={(event) => setPoForm({ ...poForm, unitCost: event.target.value })} />
              <input className={fieldClass} placeholder="ملاحظات" value={poForm.notes} onChange={(event) => setPoForm({ ...poForm, notes: event.target.value })} />
              <button className="px-3 py-2 bg-amber text-ink-950 text-sm font-semibold">إرسال للاعتماد</button>
            </form>
          </Panel>
          <DataTable columns={['الرقم', 'المورد', 'المادة', 'الكمية', 'الحالة', 'التاريخ']} rows={keep(board.purchaseOrders.map((row) => [
            row.number, nameOf('supplier', row.supplierId), nameOf('material', row.lines[0]?.materialId || ''), num(row.lines[0]?.qty || 0), statusLabel(row.status), day(row.createdAt),
          ]), query)} />
          <div className="flex flex-wrap gap-2">
            {board.purchaseOrders.filter((row) => row.status === 'PENDING_APPROVAL').map((row) => (
              <div key={row.id} className="flex items-center gap-2 border border-rule px-3 py-2 text-sm">
                <span>{row.number}</span>
                <button onClick={() => decide('purchaseOrders', row.id, 'APPROVED')} className="px-2 py-1 bg-amber text-ink-950 font-semibold">اعتماد</button>
                <button onClick={() => decide('purchaseOrders', row.id, 'REJECTED')} className="px-2 py-1 border border-rule">رفض</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {section === 'goods-receipts' && (
        <div className="space-y-4">
          <Panel title="استلام إلى مستودع المواد الخام" hint="لا يمكن استلام كمية أكبر من أمر الشراء المعتمد.">
            {board.purchaseOrders.filter((row) => row.status === 'APPROVED').length === 0 ? (
              <p className="text-sm text-ink-muted">لا يوجد أمر معتمد بانتظار الاستلام</p>
            ) : board.purchaseOrders.filter((row) => row.status === 'APPROVED').map((row) => (
              <div key={row.id} className="flex items-center justify-between gap-3 text-sm border border-rule px-3 py-2">
                <span>{row.number} · {nameOf('supplier', row.supplierId)} · متبقي {num(row.lines.reduce((sum, line) => sum + line.qty - line.receivedQty, 0))}</span>
                <button onClick={() => receiveOrder(row.id)} className="px-3 py-1.5 bg-amber text-ink-950 font-semibold">تسجيل الاستلام</button>
              </div>
            ))}
          </Panel>
          <DataTable columns={['السند', 'أمر الشراء', 'التاريخ', 'البنود']} rows={keep(board.goodsReceipts.map((row) => {
            const order = board.purchaseOrders.find((item) => item.id === row.purchaseOrderId);
            return [row.number, order?.number || row.purchaseOrderId, day(row.at), String(row.lines.length)];
          }), query)} />
        </div>
      )}

      {section === 'recipes' && (
        <DataTable columns={['الوصفة', 'المنتج', 'الأساس', 'المكونات']} rows={keep(board.recipes.map((row) => [row.nameAr, nameOf('product', row.productId), `${num(row.baseOutputQty)} كجم`, String(row.items.length)]), query)} />
      )}

      {section === 'recipe-items' && (
        <DataTable columns={['الوصفة', 'المادة', 'الكمية']} rows={keep(board.recipes.flatMap((recipe) => recipe.items.map((item) => [recipe.nameAr, nameOf('material', item.materialId), num(item.qty)])), query)} />
      )}

      {section === 'production-orders' && (
        <div className="space-y-4">
          <DataTable columns={['الرقم', 'المنتج', 'المخطط', 'الفعلي', 'الهدر', 'الحالة', 'التكلفة']} rows={keep(board.productionOrders.map((row) => [
            row.number,
            nameOf('product', row.productId),
            num(row.plannedQty),
            num(row.actualOutputQty),
            num(row.expected.reduce((sum, line) => sum + line.wasteQty, 0)),
            statusLabel(row.status),
            omr(row.totalCost),
          ]), query)} />
          {board.productionOrders.map((row) => (
            <Panel key={row.id} title={row.number} hint={row.varianceReason || 'الصرف يتم من مستودع التصنيع فقط.'}>
              <DataTable columns={['المادة', 'متوقع', 'فعلي', 'الهدر']} rows={row.expected.map((line) => [nameOf('material', line.materialId), num(line.expectedQty), num(line.actualQty), num(line.wasteQty)])} />
            </Panel>
          ))}
        </div>
      )}

      {section === 'customers' && (
        <div className="space-y-4">
          <Panel title="عميل جديد">
            <form onSubmit={(event) => { event.preventDefault(); saveParty('customers', customerForm, 'C'); setCustomerForm({ nameAr: '', vatNumber: '', phone: '', address: '' }); }} className="grid gap-3 md:grid-cols-2">
              <input className={fieldClass} placeholder="الاسم" value={customerForm.nameAr} onChange={(event) => setCustomerForm({ ...customerForm, nameAr: event.target.value })} />
              <input className={fieldClass} placeholder="الرقم الضريبي" value={customerForm.vatNumber} onChange={(event) => setCustomerForm({ ...customerForm, vatNumber: event.target.value })} />
              <input className={fieldClass} placeholder="الهاتف" value={customerForm.phone} onChange={(event) => setCustomerForm({ ...customerForm, phone: event.target.value })} />
              <input className={fieldClass} placeholder="العنوان" value={customerForm.address} onChange={(event) => setCustomerForm({ ...customerForm, address: event.target.value })} />
              <button className="px-3 py-2 bg-amber text-ink-950 text-sm font-semibold">حفظ</button>
            </form>
          </Panel>
          <DataTable columns={['الكود', 'الاسم', 'الرقم الضريبي', 'الهاتف', 'العنوان']} rows={keep(board.customers.map((item) => [item.code, item.nameAr, item.vatNumber, item.phone, item.address]), query)} />
        </div>
      )}

      {section === 'invoices' && (
        <div className="space-y-4">
          <Panel title="فاتورة مبيعات" hint="الأسعار غير شاملة الضريبة. التأكيد يخصم من مستودع المنتجات النهائية.">
            <form onSubmit={saveInvoice} className="grid gap-3 md:grid-cols-2">
              <select className={fieldClass} value={invoiceForm.customerId} onChange={(event) => setInvoiceForm({ ...invoiceForm, customerId: event.target.value })}>
                {board.customers.map((item) => <option key={item.id} value={item.id}>{item.nameAr}</option>)}
              </select>
              <select className={fieldClass} value={invoiceForm.productId} onChange={(event) => setInvoiceForm({ ...invoiceForm, productId: event.target.value })}>
                {board.products.map((item) => <option key={item.id} value={item.id}>{item.nameAr}</option>)}
              </select>
              <input className={fieldClass} placeholder="الكمية كجم" value={invoiceForm.qty} onChange={(event) => setInvoiceForm({ ...invoiceForm, qty: event.target.value })} />
              <input className={fieldClass} placeholder="سعر الوحدة" value={invoiceForm.unitPrice} onChange={(event) => setInvoiceForm({ ...invoiceForm, unitPrice: event.target.value })} />
              <button className="px-3 py-2 bg-amber text-ink-950 text-sm font-semibold">حفظ مسودة</button>
            </form>
          </Panel>
          <DataTable columns={['الرقم', 'العميل', 'الإجمالي', 'المحصّل', 'الحالة', 'التاريخ']} rows={keep(board.invoices.map((row) => [row.number, nameOf('customer', row.customerId), omr(row.total), omr(row.paidAmount), statusLabel(row.status), day(row.issuedAt)]), query)} />
          <div className="flex flex-wrap gap-2">
            {board.invoices.filter((row) => row.status === 'DRAFT').map((row) => (
              <button key={row.id} onClick={() => confirmInvoice(row.id)} className="px-3 py-1.5 bg-amber text-ink-950 text-sm font-semibold">تأكيد {row.number}</button>
            ))}
          </div>
        </div>
      )}

      {section === 'withdrawals' && (
        <div className="space-y-4">
          <Panel title="سحب داخلي" hint="يخصم من المنتجات النهائية ويُحمَّل على مصروفات التشغيل بدون ضريبة مبيعات.">
            <form onSubmit={saveWithdrawal} className="grid gap-3 md:grid-cols-2">
              <select className={fieldClass} value={withdrawalForm.productId} onChange={(event) => setWithdrawalForm({ ...withdrawalForm, productId: event.target.value })}>
                {board.products.map((item) => <option key={item.id} value={item.id}>{item.nameAr}</option>)}
              </select>
              <input className={fieldClass} placeholder="الكمية" value={withdrawalForm.qty} onChange={(event) => setWithdrawalForm({ ...withdrawalForm, qty: event.target.value })} />
              <input className={fieldClass} placeholder="السبب" value={withdrawalForm.notes} onChange={(event) => setWithdrawalForm({ ...withdrawalForm, notes: event.target.value })} />
              <button className="px-3 py-2 bg-amber text-ink-950 text-sm font-semibold">تنفيذ السحب</button>
            </form>
          </Panel>
          <DataTable columns={['الرقم', 'المنتج', 'الكمية', 'التاريخ', 'ملاحظات']} rows={keep(board.withdrawals.map((row) => [row.number, nameOf('product', row.productId), num(row.qty), day(row.at), row.notes]), query)} />
        </div>
      )}

      {section === 'payments' && (
        <div className="space-y-4">
          <Panel title="تسجيل التحصيل">
            <form onSubmit={savePayment} className="grid gap-3 md:grid-cols-2">
              <select className={fieldClass} value={paymentForm.invoiceId} onChange={(event) => setPaymentForm({ ...paymentForm, invoiceId: event.target.value })}>
                {board.invoices.map((item) => <option key={item.id} value={item.id}>{item.number} · {nameOf('customer', item.customerId)}</option>)}
              </select>
              <input className={fieldClass} placeholder="المبلغ" value={paymentForm.amount} onChange={(event) => setPaymentForm({ ...paymentForm, amount: event.target.value })} />
              <select className={fieldClass} value={paymentForm.method} onChange={(event) => setPaymentForm({ ...paymentForm, method: event.target.value })}>
                <option>تحويل بنكي</option>
                <option>نقداً</option>
                <option>شيك</option>
              </select>
              <button className="px-3 py-2 bg-amber text-ink-950 text-sm font-semibold">تسجيل التحصيل</button>
            </form>
          </Panel>
          <DataTable columns={['الرقم', 'الفاتورة', 'المبلغ', 'الطريقة', 'التاريخ']} rows={keep(board.payments.map((row) => {
            const invoice = board.invoices.find((item) => item.id === row.invoiceId);
            return [row.number, invoice?.number || row.invoiceId, omr(row.amount), row.method, day(row.at)];
          }), query)} />
        </div>
      )}

      {section === 'accounts' && (
        <Panel title="دليل الحسابات" hint="الأرصدة تُحسب من القيود الناتجة عن العمليات، وليست إدخالاً يدوياً منفصلاً.">
          <DataTable columns={['الرمز', 'الحساب', 'النوع', 'الرصيد']} rows={keep(board.accounts.map((row) => [row.code, row.nameAr, ACCOUNT_TYPE_LABEL[row.type] || row.type, omr(books.balanceFor(row.code, row.type))]), query)} />
        </Panel>
      )}

      {section === 'journals' && (
        <DataTable columns={['القيد', 'التاريخ', 'البيان', 'مدين', 'دائن']} rows={keep(board.journals.map((row) => [
          row.number, day(row.at), row.memo, omr(row.lines.reduce((sum, line) => sum + line.debit, 0)), omr(row.lines.reduce((sum, line) => sum + line.credit, 0)),
        ]), query)} />
      )}

      {section === 'expenses' && (
        <div className="space-y-4">
          <Panel title="مصروف جديد" hint="يُرحَّل بعد اعتماد المدير: مدين المصروف ومدين ضريبة المدخلات، دائن البنك أو المورد.">
            <form onSubmit={saveExpense} className="grid gap-3 md:grid-cols-2">
              <input className={fieldClass} placeholder="التصنيف" value={expenseForm.category} onChange={(event) => setExpenseForm({ ...expenseForm, category: event.target.value })} />
              <input className={fieldClass} placeholder="الوصف" value={expenseForm.description} onChange={(event) => setExpenseForm({ ...expenseForm, description: event.target.value })} />
              <input className={fieldClass} placeholder="المبلغ غير شامل الضريبة" value={expenseForm.amount} onChange={(event) => setExpenseForm({ ...expenseForm, amount: event.target.value })} />
              <select className={fieldClass} value={expenseForm.vatTreatment} onChange={(event) => setExpenseForm({ ...expenseForm, vatTreatment: event.target.value })}>
                <option value="STANDARD">خاضعة</option>
                <option value="ZERO">صفرية</option>
                <option value="EXEMPT">معفاة</option>
              </select>
              <button className="px-3 py-2 bg-amber text-ink-950 text-sm font-semibold">إرسال للاعتماد</button>
            </form>
          </Panel>
          <DataTable columns={['الرقم', 'التصنيف', 'الوصف', 'الصافي', 'الحالة']} rows={keep(board.expenses.map((row) => [row.number, row.category, row.description, omr(row.total), statusLabel(row.status)]), query)} />
          <div className="flex flex-wrap gap-2">
            {board.expenses.filter((row) => row.status === 'PENDING_APPROVAL').map((row) => (
              <div key={row.id} className="flex items-center gap-2 border border-rule px-3 py-2 text-sm">
                <span>{row.number}</span>
                <button onClick={() => decide('expenses', row.id, 'POSTED')} className="px-2 py-1 bg-amber text-ink-950 font-semibold">اعتماد وترحيل</button>
                <button onClick={() => decide('expenses', row.id, 'REJECTED')} className="px-2 py-1 border border-rule">رفض</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {section === 'vat-report' && (
        <Panel title="إقرار ضريبة القيمة المضافة" hint="مخرجات الفواتير المؤكدة مقابل مدخلات الاستلام والمصروفات المرحّلة. النسبة الافتراضية 5%.">
          <input className={fieldClass} value={month} onChange={(event) => setMonth(event.target.value)} />
          <div className="grid md:grid-cols-3 gap-3">
            {[['ضريبة المخرجات', outputVat], ['ضريبة المدخلات', inputVat], ['صافي المستحق', outputVat - inputVat]].map(([label, value]) => (
              <div key={String(label)} className="border border-rule p-3">
                <div className="text-xs text-ink-muted">{label}</div>
                <div className="text-xl font-mono mt-1">{omr(Number(value))}</div>
              </div>
            ))}
          </div>
        </Panel>
      )}

      {section === 'tax-settings' && (
        <Panel title="إعدادات الضريبة والشركة">
          <div className="grid gap-3 md:grid-cols-2">
            <label className="text-sm">رقم التسجيل الضريبي
              <input className={`${fieldClass} mt-1`} value={board.company.vatNumber} onChange={(event) => setBoard({ ...board, company: { ...board.company, vatNumber: event.target.value } })} />
            </label>
            <label className="text-sm">نسبة الضريبة %
              <input className={`${fieldClass} mt-1`} value={board.company.vatRatePct} onChange={(event) => setBoard({ ...board, company: { ...board.company, vatRatePct: Number(event.target.value) || 0 } })} />
            </label>
            <label className="text-sm">حد انحراف الإنتاج %
              <input className={`${fieldClass} mt-1`} value={board.company.varianceThresholdPct} onChange={(event) => setBoard({ ...board, company: { ...board.company, varianceThresholdPct: Number(event.target.value) || 0 } })} />
            </label>
            <label className="text-sm">بريد التنبيهات
              <input className={`${fieldClass} mt-1`} value={board.company.notifyEmail} onChange={(event) => setBoard({ ...board, company: { ...board.company, notifyEmail: event.target.value } })} />
            </label>
          </div>
        </Panel>
      )}

      {section === 'employees' && (
        <div className="space-y-4">
          <Panel title="موظف">
            <form onSubmit={saveEmployee} className="grid gap-3 md:grid-cols-2">
              <input className={fieldClass} placeholder="الاسم" value={employeeForm.nameAr} onChange={(event) => setEmployeeForm({ ...employeeForm, nameAr: event.target.value })} />
              <input className={fieldClass} placeholder="القسم" value={employeeForm.department} onChange={(event) => setEmployeeForm({ ...employeeForm, department: event.target.value })} />
              <input className={fieldClass} placeholder="المسمى" value={employeeForm.jobTitle} onChange={(event) => setEmployeeForm({ ...employeeForm, jobTitle: event.target.value })} />
              <input className={fieldClass} placeholder="الراتب الأساسي" value={employeeForm.basicSalary} onChange={(event) => setEmployeeForm({ ...employeeForm, basicSalary: event.target.value })} />
              <button className="px-3 py-2 bg-amber text-ink-950 text-sm font-semibold">حفظ</button>
            </form>
          </Panel>
          <DataTable columns={['الكود', 'الاسم', 'القسم', 'المسمى', 'الراتب']} rows={keep(board.employees.map((item) => [item.code, item.nameAr, item.department, item.jobTitle, omr(item.basicSalary)]), query)} />
        </div>
      )}

      {section === 'attendance' && (
        <div className="space-y-4">
          <Panel title="تسجيل حضور" hint="الحضور اليدوي وملف الاستيراد جاهزان. جهاز البصمة يُربط لاحقاً عبر نفس السجل.">
            <form onSubmit={saveAttendance} className="grid gap-3 md:grid-cols-2">
              <select className={fieldClass} value={attendanceForm.employeeId} onChange={(event) => setAttendanceForm({ ...attendanceForm, employeeId: event.target.value })}>
                {board.employees.map((item) => <option key={item.id} value={item.id}>{item.nameAr}</option>)}
              </select>
              <input className={fieldClass} type="date" value={attendanceForm.date} onChange={(event) => setAttendanceForm({ ...attendanceForm, date: event.target.value })} />
              <input className={fieldClass} placeholder="حضور" value={attendanceForm.checkIn} onChange={(event) => setAttendanceForm({ ...attendanceForm, checkIn: event.target.value })} />
              <input className={fieldClass} placeholder="انصراف" value={attendanceForm.checkOut} onChange={(event) => setAttendanceForm({ ...attendanceForm, checkOut: event.target.value })} />
              <button className="px-3 py-2 bg-amber text-ink-950 text-sm font-semibold">تسجيل حضور</button>
            </form>
          </Panel>
          <DataTable columns={['الموظف', 'التاريخ', 'الحضور', 'الانصراف', 'المصدر']} rows={keep(board.attendance.map((row) => [nameOf('employee', row.employeeId), row.date, row.checkIn, row.checkOut, row.source === 'MANUAL' ? 'يدوي' : row.source]), query)} />
        </div>
      )}

      {section === 'overtime' && (
        <Panel title="الساعات الإضافية" hint="ما زاد عن 8 ساعات في السجل. تُسعَّر في المسير بـ 1.25 من أجر الساعة.">
          <DataTable columns={['الموظف', 'التاريخ', 'ساعات العمل', 'الإضافي', 'القيمة']} rows={keep(board.attendance.map((row) => {
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
            <Panel key={row.id} title={`${row.number} · ${row.month}`} hint="المحاسب يجهّز المسير، المدير يعتمده، ثم يُصرف من البنك.">
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm">{statusLabel(row.status)} · الصافي {omr(row.totalNet)}</div>
                <div className="flex gap-2">
                  {row.status === 'PENDING_APPROVAL' && <button onClick={() => decide('payrolls', row.id, 'APPROVED')} className="px-3 py-1.5 bg-amber text-ink-950 text-sm font-semibold">اعتماد</button>}
                  {row.status === 'APPROVED' && <button onClick={() => decide('payrolls', row.id, 'PAID')} className="px-3 py-1.5 bg-amber text-ink-950 text-sm font-semibold">صرف</button>}
                </div>
              </div>
              <DataTable columns={['الموظف', 'الأساسي', 'الإضافي', 'الصافي']} rows={row.lines.map((line) => [nameOf('employee', line.employeeId), omr(line.basic), `${num(line.overtimeHours)} س · ${omr(line.overtimeAmount)}`, omr(line.net)])} />
            </Panel>
          ))}
        </div>
      )}

      {section === 'reports' && (
        <div className="space-y-4">
          <div className="grid md:grid-cols-3 gap-3">
            {[['قيمة المخزون', books.inventoryValue], ['الإيرادات', books.revenue], ['الربح', books.profit]].map(([label, value]) => (
              <div key={String(label)} className="bg-paper-raised border border-rule p-4">
                <div className="text-xs text-ink-muted">{label}</div>
                <div className="text-2xl font-mono mt-1">{omr(Number(value))}</div>
              </div>
            ))}
          </div>
          <Panel title="ميزان المراجعة" hint={Math.abs(books.trialDebit - books.trialCredit) < 0.001 ? 'المدين يساوي الدائن.' : 'الميزان غير متوازن — راجع القيود.'}>
            <DataTable columns={['الرمز', 'الحساب', 'مدين', 'دائن']} rows={board.accounts.map((row) => [row.code, row.nameAr, omr(books.debit.get(row.code) || 0), omr(books.credit.get(row.code) || 0)])} />
          </Panel>
          <Panel title="تتبع المنتج" hint="من أمر الشراء والاستلام حتى الإنتاج والبيع.">
            <select className={fieldClass} value={traceProduct} onChange={(event) => setTraceProduct(event.target.value)}>
              {board.products.map((item) => <option key={item.id} value={item.id}>{item.nameAr}</option>)}
            </select>
            {traced && (
              <div className="text-sm space-y-1">
                <p>الرصيد الحالي: {num(tracedBalance)} كجم</p>
                <p>الوصفة: {tracedRecipe?.nameAr || 'لا يوجد'}</p>
                <p>أوامر الإنتاج: {board.productionOrders.filter((row) => row.productId === traceProduct).map((row) => row.number).join('، ') || 'لا يوجد'}</p>
                <p>الفواتير: {board.invoices.filter((row) => row.lines.some((line) => line.productId === traceProduct)).map((row) => row.number).join('، ') || 'لا يوجد'}</p>
              </div>
            )}
          </Panel>
        </div>
      )}

      {section === 'notifications' && (
        <div className="space-y-2">
          {board.notifications.length === 0 && <p className="text-sm text-ink-muted">لا توجد إشعارات</p>}
          {board.notifications.map((item) => (
            <div key={item.id} className="bg-paper-raised border border-rule p-3 flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-semibold">{item.title}</div>
                <div className="text-sm text-ink-muted">{item.body}</div>
                <div className="text-xs text-ink-muted mt-1">{day(item.at)} · بريد: {item.emailStatus === 'skipped' ? 'لم يُضبط البريد' : item.emailStatus} · {item.read ? 'تمت القراءة' : 'مقروء بانتظار'}</div>
              </div>
              {!item.read && (
                <button onClick={() => setBoard({ ...board, notifications: board.notifications.map((row) => row.id === item.id ? { ...row, read: true } : row) })} className="px-3 py-1.5 border border-rule text-sm">تمت القراءة</button>
              )}
            </div>
          ))}
        </div>
      )}

      {section === 'audit' && (
        <DataTable columns={['الوقت', 'المستخدم', 'الإجراء', 'المرجع', 'التفاصيل']} rows={keep(board.auditLogs.map((row) => [day(row.at), row.userName, row.action, row.entity, row.detail]), query)} />
      )}

      {section === 'settings' && (
        <Panel title="إعدادات الشركة" hint="هذه البيانات تُطبع على الفاتورة الضريبية وأمر الشراء.">
          <div className="grid gap-3 md:grid-cols-2">
            {([
              ['nameAr', 'اسم المصنع'],
              ['nameEn', 'الاسم الإنجليزي'],
              ['address', 'العنوان'],
              ['city', 'المدينة'],
              ['phone', 'الهاتف'],
              ['email', 'البريد'],
              ['crNumber', 'السجل التجاري'],
              ['vatNumber', 'الرقم الضريبي'],
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
          <Panel title="مهمة">
            <form onSubmit={saveTask} className="grid gap-3 md:grid-cols-2">
              <input className={fieldClass} placeholder="المهمة" value={taskForm.title} onChange={(event) => setTaskForm({ ...taskForm, title: event.target.value })} />
              <select className={fieldClass} value={taskForm.assigneeRole} onChange={(event) => setTaskForm({ ...taskForm, assigneeRole: event.target.value })}>
                {Object.entries(ROLE_LABEL).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
              </select>
              <input className={fieldClass} type="date" value={taskForm.dueDate} onChange={(event) => setTaskForm({ ...taskForm, dueDate: event.target.value })} />
              <button className="px-3 py-2 bg-amber text-ink-950 text-sm font-semibold">إضافة</button>
            </form>
          </Panel>
          <DataTable columns={['المهمة', 'الجهة', 'الاستحقاق', 'الحالة']} rows={keep(board.tasks.map((row) => [row.title, ROLE_LABEL[row.assigneeRole] || row.assigneeRole, row.dueDate, statusLabel(row.status)]), query)} />
          <div className="flex flex-wrap gap-2">
            {board.tasks.filter((row) => row.status === 'OPEN').map((row) => (
              <button key={row.id} onClick={() => setBoard({ ...board, tasks: board.tasks.map((item) => item.id === row.id ? { ...item, status: 'CLOSED' } : item) })} className="px-3 py-1.5 border border-rule text-sm">إغلاق: {row.title}</button>
            ))}
          </div>
        </div>
      )}

      {section === 'approvals' && (
        <div className="space-y-4">
          <Panel title="أوامر شراء">
            {board.purchaseOrders.filter((row) => row.status === 'PENDING_APPROVAL').length === 0 ? <p className="text-sm text-ink-muted">لا يوجد</p> : board.purchaseOrders.filter((row) => row.status === 'PENDING_APPROVAL').map((row) => (
              <div key={row.id} className="flex items-center justify-between text-sm border border-rule px-3 py-2">
                <span>{row.number} · {nameOf('supplier', row.supplierId)} · {row.notes}</span>
                <span className="flex gap-2">
                  <button onClick={() => decide('purchaseOrders', row.id, 'APPROVED')} className="px-2 py-1 bg-amber text-ink-950 font-semibold">اعتماد</button>
                  <button onClick={() => decide('purchaseOrders', row.id, 'REJECTED')} className="px-2 py-1 border border-rule">رفض</button>
                </span>
              </div>
            ))}
          </Panel>
          <Panel title="مصروفات">
            {board.expenses.filter((row) => row.status === 'PENDING_APPROVAL').map((row) => (
              <div key={row.id} className="flex items-center justify-between text-sm border border-rule px-3 py-2">
                <span>{row.number} · {row.description} · {omr(row.total)}</span>
                <button onClick={() => decide('expenses', row.id, 'POSTED')} className="px-2 py-1 bg-amber text-ink-950 font-semibold">ترحيل</button>
              </div>
            ))}
          </Panel>
          <Panel title="رواتب">
            {board.payrolls.filter((row) => row.status === 'PENDING_APPROVAL').map((row) => (
              <div key={row.id} className="flex items-center justify-between text-sm border border-rule px-3 py-2">
                <span>{row.number} · {row.month} · {omr(row.totalNet)}</span>
                <button onClick={() => decide('payrolls', row.id, 'APPROVED')} className="px-2 py-1 bg-amber text-ink-950 font-semibold">اعتماد</button>
              </div>
            ))}
          </Panel>
          <Panel title="تعديل مخزون">
            {board.adjustments.filter((row) => row.status === 'PENDING_APPROVAL').length === 0 ? <p className="text-sm text-ink-muted">لا يوجد</p> : board.adjustments.filter((row) => row.status === 'PENDING_APPROVAL').map((row) => (
              <div key={row.id} className="flex items-center justify-between text-sm border border-rule px-3 py-2">
                <span>{row.number} · {row.batchNo} · {num(row.delta)} · {row.reason}</span>
                <button onClick={() => decide('adjustments', row.id, 'APPROVED')} className="px-2 py-1 bg-amber text-ink-950 font-semibold">اعتماد</button>
              </div>
            ))}
          </Panel>
        </div>
      )}

      {section === 'users' && (
        <div className="space-y-4">
          <DataTable columns={['الاسم', 'البريد', 'الدور', 'الحالة']} rows={board.users.map((row) => [row.fullName, row.email, ROLE_LABEL[row.role] || row.role, row.active ? 'نشط' : 'موقوف'])} />
          <Panel title="صلاحيات الدور" hint="يمكن تضييق ما يراه كل دور. لا يُسحب حق إدارة المستخدمين من المدير العام.">
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
