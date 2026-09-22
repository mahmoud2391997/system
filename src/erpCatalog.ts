import { ErpCatalog } from './types';

export const ROLE_LABEL: Record<string, string> = {
  GM: 'المدير العام',
  ACCOUNTANT: 'المحاسب والموارد البشرية',
  OPERATIONS: 'المستودع والإنتاج والمبيعات',
};

export const STATUS_LABEL: Record<string, string> = {
  PENDING_APPROVAL: 'بانتظار الاعتماد',
  APPROVED: 'معتمد',
  REJECTED: 'مرفوض',
  RECEIVED: 'مستلم',
  PARTIAL: 'تحصيل جزئي',
  DRAFT: 'مسودة',
  CONFIRMED: 'مؤكدة',
  PAID: 'مدفوعة',
  POSTED: 'مرحّل',
  OPEN: 'مفتوحة',
  CLOSED: 'منتهية',
  COMPLETED: 'مكتمل',
  IN_PROGRESS: 'قيد التنفيذ',
};

export const VAT_LABEL: Record<string, string> = {
  ZERO: 'صفرية',
  STANDARD: 'خاضعة 5%',
  EXEMPT: 'معفاة',
};

export const LEDGER_LABEL: Record<string, string> = {
  PURCHASE_RECEIPT: 'استلام مشتريات',
  TRANSFER_OUT: 'تحويل صادر',
  TRANSFER_IN: 'تحويل وارد',
  PRODUCTION_CONSUMPTION: 'استهلاك إنتاج',
  PRODUCTION_OUTPUT: 'ناتج إنتاج',
  SALE: 'بيع',
  WITHDRAWAL: 'سحب',
  ADJUSTMENT: 'تعديل مخزون',
};

export const ACCOUNT_TYPE_LABEL: Record<string, string> = {
  ASSET: 'أصول',
  LIABILITY: 'خصوم',
  EQUITY: 'حقوق ملكية',
  REVENUE: 'إيرادات',
  EXPENSE: 'مصروفات',
};

export const erpCatalog: ErpCatalog = {
  "company": {
    "nameAr": "مصنع الخليج للأعلاف",
    "nameEn": "Gulf Feed Mill",
    "address": "المنطقة الصناعية، صحار",
    "city": "صحار",
    "country": "سلطنة عُمان",
    "phone": "+968 2675 1000",
    "email": "info@gulffeed.om",
    "crNumber": "1345789",
    "vatNumber": "OM1100000001",
    "currency": "OMR",
    "vatRatePct": 5,
    "varianceThresholdPct": 2,
    "notifyEmail": "gm@factory.local"
  },
  "rolePermissions": {
    "GM": [
      "users.read",
      "users.manage",
      "roles.read",
      "roles.manage",
      "settings.read",
      "settings.update",
      "warehouses.read",
      "warehouses.manage",
      "inventory.read",
      "inventory.transfer.create",
      "inventory.adjust",
      "inventory.ledger.read",
      "purchasing.read",
      "purchasing.po.create",
      "purchasing.po.approve",
      "purchasing.gr.create",
      "production.read",
      "production.create",
      "production.complete",
      "sales.read",
      "sales.create",
      "sales.confirm",
      "sales.payments.manage",
      "accounting.read",
      "accounting.manage",
      "tax.read",
      "tax.manage",
      "expenses.manage",
      "expenses.approve",
      "employees.read",
      "employees.manage",
      "attendance.read",
      "attendance.manage",
      "payroll.manage",
      "payroll.approve",
      "payroll.pay",
      "approvals.decide",
      "barcode.scan",
      "reports.read",
      "audit.read",
      "notifications.read"
    ],
    "ACCOUNTANT": [
      "users.read",
      "settings.read",
      "purchasing.read",
      "sales.read",
      "sales.payments.manage",
      "accounting.read",
      "accounting.manage",
      "tax.read",
      "tax.manage",
      "expenses.manage",
      "employees.read",
      "employees.manage",
      "attendance.read",
      "attendance.manage",
      "payroll.manage",
      "payroll.pay",
      "reports.read",
      "audit.read",
      "notifications.read"
    ],
    "OPERATIONS": [
      "warehouses.read",
      "inventory.read",
      "inventory.transfer.create",
      "inventory.adjust",
      "inventory.ledger.read",
      "purchasing.read",
      "purchasing.po.create",
      "purchasing.gr.create",
      "production.read",
      "production.create",
      "production.complete",
      "sales.read",
      "sales.create",
      "sales.confirm",
      "barcode.scan",
      "reports.read",
      "notifications.read"
    ]
  },
  "users": [
    {
      "id": "user-gm",
      "email": "gm@factory.local",
      "fullName": "سعيد الوهيبي",
      "role": "GM",
      "active": true
    },
    {
      "id": "user-admin",
      "email": "admin@factory.local",
      "fullName": "سعيد الوهيبي",
      "role": "GM",
      "active": true
    },
    {
      "id": "user-acc",
      "email": "accounts@factory.local",
      "fullName": "نورة العامرية",
      "role": "ACCOUNTANT",
      "active": true
    },
    {
      "id": "user-ops",
      "email": "ops@factory.local",
      "fullName": "سالم الحارثي",
      "role": "OPERATIONS",
      "active": true
    }
  ],
  "accounts": [
    {
      "code": "1100",
      "nameAr": "مخزون مواد خام",
      "type": "ASSET"
    },
    {
      "code": "1200",
      "nameAr": "إنتاج تحت التشغيل",
      "type": "ASSET"
    },
    {
      "code": "1300",
      "nameAr": "مخزون منتجات نهائية",
      "type": "ASSET"
    },
    {
      "code": "1400",
      "nameAr": "ذمم العملاء",
      "type": "ASSET"
    },
    {
      "code": "1500",
      "nameAr": "البنك",
      "type": "ASSET"
    },
    {
      "code": "2100",
      "nameAr": "ذمم الموردين",
      "type": "LIABILITY"
    },
    {
      "code": "2200",
      "nameAr": "ضريبة القيمة المضافة — مخرجات",
      "type": "LIABILITY"
    },
    {
      "code": "2300",
      "nameAr": "ضريبة القيمة المضافة — مدخلات",
      "type": "ASSET"
    },
    {
      "code": "2400",
      "nameAr": "رواتب مستحقة",
      "type": "LIABILITY"
    },
    {
      "code": "2500",
      "nameAr": "استقطاعات موظفين",
      "type": "LIABILITY"
    },
    {
      "code": "3100",
      "nameAr": "رأس المال",
      "type": "EQUITY"
    },
    {
      "code": "4100",
      "nameAr": "إيرادات المبيعات",
      "type": "REVENUE"
    },
    {
      "code": "5100",
      "nameAr": "تكلفة المبيعات",
      "type": "EXPENSE"
    },
    {
      "code": "6100",
      "nameAr": "الرواتب",
      "type": "EXPENSE"
    },
    {
      "code": "6200",
      "nameAr": "مصروفات تشغيل",
      "type": "EXPENSE"
    },
    {
      "code": "6300",
      "nameAr": "فروقات المخزون",
      "type": "EXPENSE"
    }
  ],
  "warehouses": [
    {
      "key": "WH_RAW",
      "nameAr": "مستودع المواد الخام",
      "locations": [
        {
          "code": "A1",
          "nameAr": "منطقة A1"
        }
      ]
    },
    {
      "key": "WH_MFG",
      "nameAr": "مستودع التصنيع",
      "locations": [
        {
          "code": "M1",
          "nameAr": "منطقة M1"
        }
      ]
    },
    {
      "key": "WH_FG",
      "nameAr": "مستودع المنتجات النهائية",
      "locations": [
        {
          "code": "F1",
          "nameAr": "منطقة F1"
        }
      ]
    }
  ],
  "materials": [
    {
      "id": "mat-18",
      "code": "RM-PRE",
      "nameAr": "بريمكس فيتامينات",
      "category": "إضافات",
      "unit": "كجم",
      "minQty": 80,
      "vatTreatment": "STANDARD",
      "barcode": "RM-PRE",
      "active": true
    },
    {
      "id": "mat-15",
      "code": "RM-SALT",
      "nameAr": "ملح طعام",
      "category": "معادن",
      "unit": "كجم",
      "minQty": 150,
      "vatTreatment": "STANDARD",
      "barcode": "RM-SALT",
      "active": true
    },
    {
      "id": "mat-12",
      "code": "RM-LIME",
      "nameAr": "حجر جيري",
      "category": "معادن",
      "unit": "كجم",
      "minQty": 400,
      "vatTreatment": "STANDARD",
      "barcode": "RM-LIME",
      "active": true
    },
    {
      "id": "mat-9",
      "code": "RM-BRAN",
      "nameAr": "نخالة قمح",
      "category": "حبوب",
      "unit": "كجم",
      "minQty": 2500,
      "vatTreatment": "ZERO",
      "barcode": "RM-BRAN",
      "active": true
    },
    {
      "id": "mat-6",
      "code": "RM-SOYA",
      "nameAr": "كسب فول الصويا",
      "category": "بروتين",
      "unit": "كجم",
      "minQty": 4000,
      "vatTreatment": "ZERO",
      "barcode": "RM-SOYA",
      "active": true
    },
    {
      "id": "mat-3",
      "code": "RM-CORN",
      "nameAr": "ذرة صفراء",
      "category": "حبوب",
      "unit": "كجم",
      "minQty": 8000,
      "vatTreatment": "ZERO",
      "barcode": "RM-CORN",
      "active": true
    }
  ],
  "products": [
    {
      "id": "prd-25",
      "code": "FG-SHEEP",
      "nameAr": "علف أغنام",
      "unit": "كجم",
      "salePrice": 0.195,
      "vatTreatment": "STANDARD",
      "barcode": "FG-SHEEP",
      "bagKg": 50,
      "active": true
    },
    {
      "id": "prd-23",
      "code": "FG-BROILER",
      "nameAr": "علف دواجن لاحم",
      "unit": "كجم",
      "salePrice": 0.215,
      "vatTreatment": "STANDARD",
      "barcode": "FG-BROILER",
      "bagKg": 50,
      "active": true
    },
    {
      "id": "prd-21",
      "code": "FG-BEEF",
      "nameAr": "علف تسمين أبقار",
      "unit": "كجم",
      "salePrice": 0.18,
      "vatTreatment": "STANDARD",
      "barcode": "FG-BEEF",
      "bagKg": 50,
      "active": true
    }
  ],
  "suppliers": [
    {
      "id": "s-29",
      "code": "S-002",
      "nameAr": "شركة ظفار للحبوب",
      "vatNumber": "OM2200002222",
      "phone": "+968 2329 1100",
      "email": "",
      "address": "صلالة"
    },
    {
      "id": "s-27",
      "code": "S-001",
      "nameAr": "المطاحن العمانية",
      "vatNumber": "OM2200001111",
      "phone": "+968 2450 2200",
      "email": "",
      "address": "مسقط، غلا الصناعية"
    }
  ],
  "customers": [
    {
      "id": "c-33",
      "code": "C-002",
      "nameAr": "شركة صحار للدواجن",
      "vatNumber": "OM3300002222",
      "phone": "+968 2672 9090",
      "email": "",
      "address": "صحار"
    },
    {
      "id": "c-31",
      "code": "C-001",
      "nameAr": "مزارع الباطنة",
      "vatNumber": "OM3300001111",
      "phone": "+968 2680 4411",
      "email": "",
      "address": "صحار"
    }
  ],
  "employees": [
    {
      "id": "emp-41",
      "code": "EMP-004",
      "nameAr": "أحمد السعدي",
      "department": "الإنتاج",
      "jobTitle": "فني صيانة",
      "basicSalary": 400,
      "active": true
    },
    {
      "id": "emp-39",
      "code": "EMP-003",
      "nameAr": "نورة العامرية",
      "department": "المالية",
      "jobTitle": "محاسبة",
      "basicSalary": 520,
      "active": true
    },
    {
      "id": "emp-37",
      "code": "EMP-002",
      "nameAr": "سالم الحارثي",
      "department": "المستودع",
      "jobTitle": "أمين مستودع",
      "basicSalary": 380,
      "active": true
    },
    {
      "id": "emp-35",
      "code": "EMP-001",
      "nameAr": "خالد البلوشي",
      "department": "الإنتاج",
      "jobTitle": "مشغّل خط",
      "basicSalary": 420,
      "active": true
    }
  ],
  "recipes": [
    {
      "id": "rcp-45",
      "productId": "prd-23",
      "nameAr": "وصفة دواجن لاحم — طن",
      "baseOutputQty": 1000,
      "items": [
        {
          "materialId": "mat-3",
          "qty": 580
        },
        {
          "materialId": "mat-6",
          "qty": 280
        },
        {
          "materialId": "mat-9",
          "qty": 90
        },
        {
          "materialId": "mat-12",
          "qty": 25
        },
        {
          "materialId": "mat-15",
          "qty": 10
        },
        {
          "materialId": "mat-18",
          "qty": 15
        }
      ]
    },
    {
      "id": "rcp-43",
      "productId": "prd-21",
      "nameAr": "وصفة تسمين أبقار — طن",
      "baseOutputQty": 1000,
      "items": [
        {
          "materialId": "mat-3",
          "qty": 520
        },
        {
          "materialId": "mat-6",
          "qty": 200
        },
        {
          "materialId": "mat-9",
          "qty": 200
        },
        {
          "materialId": "mat-12",
          "qty": 40
        },
        {
          "materialId": "mat-15",
          "qty": 20
        },
        {
          "materialId": "mat-18",
          "qty": 20
        }
      ]
    }
  ],
  "balances": [
    {
      "id": "bal-52",
      "warehouse": "WH_RAW",
      "itemType": "MATERIAL",
      "itemId": "mat-3",
      "batchNo": "B-CORN-0901",
      "qty": 18960,
      "unitCost": 0.085,
      "expiryDate": "2027-03-01",
      "receivedAt": "2026-09-06T16:00:00.000Z"
    },
    {
      "id": "bal-61",
      "warehouse": "WH_RAW",
      "itemType": "MATERIAL",
      "itemId": "mat-6",
      "batchNo": "B-SOYA-0902",
      "qty": 2100,
      "unitCost": 0.21,
      "expiryDate": "2027-02-01",
      "receivedAt": "2026-09-07T10:00:00.000Z"
    },
    {
      "id": "bal-70",
      "warehouse": "WH_RAW",
      "itemType": "MATERIAL",
      "itemId": "mat-9",
      "batchNo": "B-BRAN-0901",
      "qty": 8600,
      "unitCost": 0.045,
      "expiryDate": "2027-01-15",
      "receivedAt": "2026-09-08T04:00:00.000Z"
    },
    {
      "id": "bal-79",
      "warehouse": "WH_RAW",
      "itemType": "MATERIAL",
      "itemId": "mat-12",
      "batchNo": "B-LIME-0801",
      "qty": 1120,
      "unitCost": 0.02,
      "expiryDate": null,
      "receivedAt": "2026-09-08T22:00:00.000Z"
    },
    {
      "id": "bal-88",
      "warehouse": "WH_RAW",
      "itemType": "MATERIAL",
      "itemId": "mat-15",
      "batchNo": "B-SALT-0801",
      "qty": 360,
      "unitCost": 0.03,
      "expiryDate": null,
      "receivedAt": "2026-09-09T16:00:00.000Z"
    },
    {
      "id": "bal-97",
      "warehouse": "WH_RAW",
      "itemType": "MATERIAL",
      "itemId": "mat-18",
      "batchNo": "B-PRE-0801",
      "qty": 140,
      "unitCost": 1.2,
      "expiryDate": "2027-06-01",
      "receivedAt": "2026-09-10T10:00:00.000Z"
    },
    {
      "id": "bal-103",
      "warehouse": "WH_MFG",
      "itemType": "MATERIAL",
      "itemId": "mat-3",
      "batchNo": "B-CORN-0901",
      "qty": 0,
      "unitCost": 0.085,
      "expiryDate": "2027-03-01",
      "receivedAt": "2026-09-06T16:00:00.000Z"
    },
    {
      "id": "bal-106",
      "warehouse": "WH_MFG",
      "itemType": "MATERIAL",
      "itemId": "mat-6",
      "batchNo": "B-SOYA-0902",
      "qty": 0,
      "unitCost": 0.21,
      "expiryDate": "2027-02-01",
      "receivedAt": "2026-09-07T10:00:00.000Z"
    },
    {
      "id": "bal-109",
      "warehouse": "WH_MFG",
      "itemType": "MATERIAL",
      "itemId": "mat-9",
      "batchNo": "B-BRAN-0901",
      "qty": 0,
      "unitCost": 0.045,
      "expiryDate": "2027-01-15",
      "receivedAt": "2026-09-08T04:00:00.000Z"
    },
    {
      "id": "bal-112",
      "warehouse": "WH_MFG",
      "itemType": "MATERIAL",
      "itemId": "mat-12",
      "batchNo": "B-LIME-0801",
      "qty": 0,
      "unitCost": 0.02,
      "expiryDate": null,
      "receivedAt": "2026-09-08T22:00:00.000Z"
    },
    {
      "id": "bal-115",
      "warehouse": "WH_MFG",
      "itemType": "MATERIAL",
      "itemId": "mat-15",
      "batchNo": "B-SALT-0801",
      "qty": 0,
      "unitCost": 0.03,
      "expiryDate": null,
      "receivedAt": "2026-09-09T16:00:00.000Z"
    },
    {
      "id": "bal-118",
      "warehouse": "WH_MFG",
      "itemType": "MATERIAL",
      "itemId": "mat-18",
      "batchNo": "B-PRE-0801",
      "qty": 0,
      "unitCost": 1.2,
      "expiryDate": "2027-06-01",
      "receivedAt": "2026-09-10T10:00:00.000Z"
    },
    {
      "id": "bal-129",
      "warehouse": "WH_FG",
      "itemType": "PRODUCT",
      "itemId": "prd-21",
      "batchNo": "PR-2026-001",
      "qty": 1500,
      "unitCost": 0.121,
      "expiryDate": null,
      "receivedAt": "2026-09-11T04:00:00.000Z"
    }
  ],
  "ledger": [
    {
      "id": "led-136",
      "at": "2026-09-11T16:00:00.000Z",
      "type": "SALE",
      "warehouse": "WH_FG",
      "itemType": "PRODUCT",
      "itemId": "prd-21",
      "batchNo": "PR-2026-001",
      "qty": -500,
      "unitCost": 0.121,
      "prevQty": 2000,
      "newQty": 1500,
      "refType": "salesInvoice",
      "refId": "inv-134",
      "userId": "user-gm",
      "notes": ""
    },
    {
      "id": "led-130",
      "at": "2026-09-11T04:00:00.000Z",
      "type": "PRODUCTION_OUTPUT",
      "warehouse": "WH_FG",
      "itemType": "PRODUCT",
      "itemId": "prd-21",
      "batchNo": "PR-2026-001",
      "qty": 2000,
      "unitCost": 0.121,
      "prevQty": 0,
      "newQty": 2000,
      "refType": "productionOrder",
      "refId": "prdord-121",
      "userId": "user-gm",
      "notes": ""
    },
    {
      "id": "led-128",
      "at": "2026-09-11T04:00:00.000Z",
      "type": "PRODUCTION_CONSUMPTION",
      "warehouse": "WH_MFG",
      "itemType": "MATERIAL",
      "itemId": "mat-18",
      "batchNo": "B-PRE-0801",
      "qty": -40,
      "unitCost": 1.2,
      "prevQty": 40,
      "newQty": 0,
      "refType": "productionOrder",
      "refId": "prdord-121",
      "userId": "user-gm",
      "notes": ""
    },
    {
      "id": "led-127",
      "at": "2026-09-11T04:00:00.000Z",
      "type": "PRODUCTION_CONSUMPTION",
      "warehouse": "WH_MFG",
      "itemType": "MATERIAL",
      "itemId": "mat-15",
      "batchNo": "B-SALT-0801",
      "qty": -40,
      "unitCost": 0.03,
      "prevQty": 40,
      "newQty": 0,
      "refType": "productionOrder",
      "refId": "prdord-121",
      "userId": "user-gm",
      "notes": ""
    },
    {
      "id": "led-126",
      "at": "2026-09-11T04:00:00.000Z",
      "type": "PRODUCTION_CONSUMPTION",
      "warehouse": "WH_MFG",
      "itemType": "MATERIAL",
      "itemId": "mat-12",
      "batchNo": "B-LIME-0801",
      "qty": -80,
      "unitCost": 0.02,
      "prevQty": 80,
      "newQty": 0,
      "refType": "productionOrder",
      "refId": "prdord-121",
      "userId": "user-gm",
      "notes": ""
    },
    {
      "id": "led-125",
      "at": "2026-09-11T04:00:00.000Z",
      "type": "PRODUCTION_CONSUMPTION",
      "warehouse": "WH_MFG",
      "itemType": "MATERIAL",
      "itemId": "mat-9",
      "batchNo": "B-BRAN-0901",
      "qty": -400,
      "unitCost": 0.045,
      "prevQty": 400,
      "newQty": 0,
      "refType": "productionOrder",
      "refId": "prdord-121",
      "userId": "user-gm",
      "notes": ""
    },
    {
      "id": "led-124",
      "at": "2026-09-11T04:00:00.000Z",
      "type": "PRODUCTION_CONSUMPTION",
      "warehouse": "WH_MFG",
      "itemType": "MATERIAL",
      "itemId": "mat-6",
      "batchNo": "B-SOYA-0902",
      "qty": -400,
      "unitCost": 0.21,
      "prevQty": 400,
      "newQty": 0,
      "refType": "productionOrder",
      "refId": "prdord-121",
      "userId": "user-gm",
      "notes": ""
    },
    {
      "id": "led-123",
      "at": "2026-09-11T04:00:00.000Z",
      "type": "PRODUCTION_CONSUMPTION",
      "warehouse": "WH_MFG",
      "itemType": "MATERIAL",
      "itemId": "mat-3",
      "batchNo": "B-CORN-0901",
      "qty": -1040,
      "unitCost": 0.085,
      "prevQty": 1040,
      "newQty": 0,
      "refType": "productionOrder",
      "refId": "prdord-121",
      "userId": "user-gm",
      "notes": ""
    },
    {
      "id": "led-119",
      "at": "2026-09-10T16:00:00.000Z",
      "type": "TRANSFER_IN",
      "warehouse": "WH_MFG",
      "itemType": "MATERIAL",
      "itemId": "mat-18",
      "batchNo": "B-PRE-0801",
      "qty": 40,
      "unitCost": 1.2,
      "prevQty": 0,
      "newQty": 40,
      "refType": "stockTransfer",
      "refId": "tr-101",
      "userId": "user-gm",
      "notes": ""
    },
    {
      "id": "led-117",
      "at": "2026-09-10T16:00:00.000Z",
      "type": "TRANSFER_OUT",
      "warehouse": "WH_RAW",
      "itemType": "MATERIAL",
      "itemId": "mat-18",
      "batchNo": "B-PRE-0801",
      "qty": -40,
      "unitCost": 1.2,
      "prevQty": 180,
      "newQty": 140,
      "refType": "stockTransfer",
      "refId": "tr-101",
      "userId": "user-gm",
      "notes": ""
    },
    {
      "id": "led-116",
      "at": "2026-09-10T16:00:00.000Z",
      "type": "TRANSFER_IN",
      "warehouse": "WH_MFG",
      "itemType": "MATERIAL",
      "itemId": "mat-15",
      "batchNo": "B-SALT-0801",
      "qty": 40,
      "unitCost": 0.03,
      "prevQty": 0,
      "newQty": 40,
      "refType": "stockTransfer",
      "refId": "tr-101",
      "userId": "user-gm",
      "notes": ""
    },
    {
      "id": "led-114",
      "at": "2026-09-10T16:00:00.000Z",
      "type": "TRANSFER_OUT",
      "warehouse": "WH_RAW",
      "itemType": "MATERIAL",
      "itemId": "mat-15",
      "batchNo": "B-SALT-0801",
      "qty": -40,
      "unitCost": 0.03,
      "prevQty": 400,
      "newQty": 360,
      "refType": "stockTransfer",
      "refId": "tr-101",
      "userId": "user-gm",
      "notes": ""
    },
    {
      "id": "led-113",
      "at": "2026-09-10T16:00:00.000Z",
      "type": "TRANSFER_IN",
      "warehouse": "WH_MFG",
      "itemType": "MATERIAL",
      "itemId": "mat-12",
      "batchNo": "B-LIME-0801",
      "qty": 80,
      "unitCost": 0.02,
      "prevQty": 0,
      "newQty": 80,
      "refType": "stockTransfer",
      "refId": "tr-101",
      "userId": "user-gm",
      "notes": ""
    },
    {
      "id": "led-111",
      "at": "2026-09-10T16:00:00.000Z",
      "type": "TRANSFER_OUT",
      "warehouse": "WH_RAW",
      "itemType": "MATERIAL",
      "itemId": "mat-12",
      "batchNo": "B-LIME-0801",
      "qty": -80,
      "unitCost": 0.02,
      "prevQty": 1200,
      "newQty": 1120,
      "refType": "stockTransfer",
      "refId": "tr-101",
      "userId": "user-gm",
      "notes": ""
    },
    {
      "id": "led-110",
      "at": "2026-09-10T16:00:00.000Z",
      "type": "TRANSFER_IN",
      "warehouse": "WH_MFG",
      "itemType": "MATERIAL",
      "itemId": "mat-9",
      "batchNo": "B-BRAN-0901",
      "qty": 400,
      "unitCost": 0.045,
      "prevQty": 0,
      "newQty": 400,
      "refType": "stockTransfer",
      "refId": "tr-101",
      "userId": "user-gm",
      "notes": ""
    },
    {
      "id": "led-108",
      "at": "2026-09-10T16:00:00.000Z",
      "type": "TRANSFER_OUT",
      "warehouse": "WH_RAW",
      "itemType": "MATERIAL",
      "itemId": "mat-9",
      "batchNo": "B-BRAN-0901",
      "qty": -400,
      "unitCost": 0.045,
      "prevQty": 9000,
      "newQty": 8600,
      "refType": "stockTransfer",
      "refId": "tr-101",
      "userId": "user-gm",
      "notes": ""
    },
    {
      "id": "led-107",
      "at": "2026-09-10T16:00:00.000Z",
      "type": "TRANSFER_IN",
      "warehouse": "WH_MFG",
      "itemType": "MATERIAL",
      "itemId": "mat-6",
      "batchNo": "B-SOYA-0902",
      "qty": 400,
      "unitCost": 0.21,
      "prevQty": 0,
      "newQty": 400,
      "refType": "stockTransfer",
      "refId": "tr-101",
      "userId": "user-gm",
      "notes": ""
    },
    {
      "id": "led-105",
      "at": "2026-09-10T16:00:00.000Z",
      "type": "TRANSFER_OUT",
      "warehouse": "WH_RAW",
      "itemType": "MATERIAL",
      "itemId": "mat-6",
      "batchNo": "B-SOYA-0902",
      "qty": -400,
      "unitCost": 0.21,
      "prevQty": 2500,
      "newQty": 2100,
      "refType": "stockTransfer",
      "refId": "tr-101",
      "userId": "user-gm",
      "notes": ""
    },
    {
      "id": "led-104",
      "at": "2026-09-10T16:00:00.000Z",
      "type": "TRANSFER_IN",
      "warehouse": "WH_MFG",
      "itemType": "MATERIAL",
      "itemId": "mat-3",
      "batchNo": "B-CORN-0901",
      "qty": 1040,
      "unitCost": 0.085,
      "prevQty": 0,
      "newQty": 1040,
      "refType": "stockTransfer",
      "refId": "tr-101",
      "userId": "user-gm",
      "notes": ""
    },
    {
      "id": "led-102",
      "at": "2026-09-10T16:00:00.000Z",
      "type": "TRANSFER_OUT",
      "warehouse": "WH_RAW",
      "itemType": "MATERIAL",
      "itemId": "mat-3",
      "batchNo": "B-CORN-0901",
      "qty": -1040,
      "unitCost": 0.085,
      "prevQty": 20000,
      "newQty": 18960,
      "refType": "stockTransfer",
      "refId": "tr-101",
      "userId": "user-gm",
      "notes": ""
    },
    {
      "id": "led-98",
      "at": "2026-09-10T10:00:00.000Z",
      "type": "PURCHASE_RECEIPT",
      "warehouse": "WH_RAW",
      "itemType": "MATERIAL",
      "itemId": "mat-18",
      "batchNo": "B-PRE-0801",
      "qty": 180,
      "unitCost": 1.2,
      "prevQty": 0,
      "newQty": 180,
      "refType": "goodsReceipt",
      "refId": "gr-96",
      "userId": "user-gm",
      "notes": ""
    },
    {
      "id": "led-89",
      "at": "2026-09-09T16:00:00.000Z",
      "type": "PURCHASE_RECEIPT",
      "warehouse": "WH_RAW",
      "itemType": "MATERIAL",
      "itemId": "mat-15",
      "batchNo": "B-SALT-0801",
      "qty": 400,
      "unitCost": 0.03,
      "prevQty": 0,
      "newQty": 400,
      "refType": "goodsReceipt",
      "refId": "gr-87",
      "userId": "user-gm",
      "notes": ""
    },
    {
      "id": "led-80",
      "at": "2026-09-08T22:00:00.000Z",
      "type": "PURCHASE_RECEIPT",
      "warehouse": "WH_RAW",
      "itemType": "MATERIAL",
      "itemId": "mat-12",
      "batchNo": "B-LIME-0801",
      "qty": 1200,
      "unitCost": 0.02,
      "prevQty": 0,
      "newQty": 1200,
      "refType": "goodsReceipt",
      "refId": "gr-78",
      "userId": "user-gm",
      "notes": ""
    },
    {
      "id": "led-71",
      "at": "2026-09-08T04:00:00.000Z",
      "type": "PURCHASE_RECEIPT",
      "warehouse": "WH_RAW",
      "itemType": "MATERIAL",
      "itemId": "mat-9",
      "batchNo": "B-BRAN-0901",
      "qty": 9000,
      "unitCost": 0.045,
      "prevQty": 0,
      "newQty": 9000,
      "refType": "goodsReceipt",
      "refId": "gr-69",
      "userId": "user-gm",
      "notes": ""
    },
    {
      "id": "led-62",
      "at": "2026-09-07T10:00:00.000Z",
      "type": "PURCHASE_RECEIPT",
      "warehouse": "WH_RAW",
      "itemType": "MATERIAL",
      "itemId": "mat-6",
      "batchNo": "B-SOYA-0902",
      "qty": 2500,
      "unitCost": 0.21,
      "prevQty": 0,
      "newQty": 2500,
      "refType": "goodsReceipt",
      "refId": "gr-60",
      "userId": "user-gm",
      "notes": ""
    },
    {
      "id": "led-53",
      "at": "2026-09-06T16:00:00.000Z",
      "type": "PURCHASE_RECEIPT",
      "warehouse": "WH_RAW",
      "itemType": "MATERIAL",
      "itemId": "mat-3",
      "batchNo": "B-CORN-0901",
      "qty": 20000,
      "unitCost": 0.085,
      "prevQty": 0,
      "newQty": 20000,
      "refType": "goodsReceipt",
      "refId": "gr-51",
      "userId": "user-gm",
      "notes": ""
    }
  ],
  "purchaseOrders": [
    {
      "id": "po-143",
      "number": "PO-2026-007",
      "supplierId": "s-27",
      "status": "PENDING_APPROVAL",
      "notes": "تعويض نقص كسب الصويا",
      "lines": [
        {
          "materialId": "mat-6",
          "qty": 8000,
          "unitCost": 0.205,
          "receivedQty": 0
        }
      ],
      "createdBy": "user-gm",
      "createdAt": "2026-09-12T04:00:00.000Z"
    },
    {
      "id": "po-92",
      "number": "PO-2026-006",
      "supplierId": "s-27",
      "status": "RECEIVED",
      "notes": "",
      "lines": [
        {
          "materialId": "mat-18",
          "qty": 180,
          "unitCost": 1.2,
          "receivedQty": 180
        }
      ],
      "createdBy": "user-gm",
      "createdAt": "2026-09-09T22:00:00.000Z",
      "decidedBy": "user-gm",
      "decidedAt": "2026-09-10T04:00:00.000Z"
    },
    {
      "id": "po-83",
      "number": "PO-2026-005",
      "supplierId": "s-27",
      "status": "RECEIVED",
      "notes": "",
      "lines": [
        {
          "materialId": "mat-15",
          "qty": 400,
          "unitCost": 0.03,
          "receivedQty": 400
        }
      ],
      "createdBy": "user-gm",
      "createdAt": "2026-09-09T04:00:00.000Z",
      "decidedBy": "user-gm",
      "decidedAt": "2026-09-09T10:00:00.000Z"
    },
    {
      "id": "po-74",
      "number": "PO-2026-004",
      "supplierId": "s-27",
      "status": "RECEIVED",
      "notes": "",
      "lines": [
        {
          "materialId": "mat-12",
          "qty": 1200,
          "unitCost": 0.02,
          "receivedQty": 1200
        }
      ],
      "createdBy": "user-gm",
      "createdAt": "2026-09-08T10:00:00.000Z",
      "decidedBy": "user-gm",
      "decidedAt": "2026-09-08T16:00:00.000Z"
    },
    {
      "id": "po-65",
      "number": "PO-2026-003",
      "supplierId": "s-27",
      "status": "RECEIVED",
      "notes": "",
      "lines": [
        {
          "materialId": "mat-9",
          "qty": 9000,
          "unitCost": 0.045,
          "receivedQty": 9000
        }
      ],
      "createdBy": "user-gm",
      "createdAt": "2026-09-07T16:00:00.000Z",
      "decidedBy": "user-gm",
      "decidedAt": "2026-09-07T22:00:00.000Z"
    },
    {
      "id": "po-56",
      "number": "PO-2026-002",
      "supplierId": "s-27",
      "status": "RECEIVED",
      "notes": "",
      "lines": [
        {
          "materialId": "mat-6",
          "qty": 2500,
          "unitCost": 0.21,
          "receivedQty": 2500
        }
      ],
      "createdBy": "user-gm",
      "createdAt": "2026-09-06T22:00:00.000Z",
      "decidedBy": "user-gm",
      "decidedAt": "2026-09-07T04:00:00.000Z"
    },
    {
      "id": "po-47",
      "number": "PO-2026-001",
      "supplierId": "s-27",
      "status": "RECEIVED",
      "notes": "",
      "lines": [
        {
          "materialId": "mat-3",
          "qty": 20000,
          "unitCost": 0.085,
          "receivedQty": 20000
        }
      ],
      "createdBy": "user-gm",
      "createdAt": "2026-09-06T04:00:00.000Z",
      "decidedBy": "user-gm",
      "decidedAt": "2026-09-06T10:00:00.000Z"
    }
  ],
  "goodsReceipts": [
    {
      "id": "gr-96",
      "number": "GR-2026-006",
      "purchaseOrderId": "po-92",
      "at": "2026-09-10T10:00:00.000Z",
      "createdBy": "user-gm",
      "lines": [
        {
          "materialId": "mat-18",
          "qty": 180,
          "unitCost": 1.2,
          "batchNo": "B-PRE-0801",
          "expiryDate": "2027-06-01"
        }
      ]
    },
    {
      "id": "gr-87",
      "number": "GR-2026-005",
      "purchaseOrderId": "po-83",
      "at": "2026-09-09T16:00:00.000Z",
      "createdBy": "user-gm",
      "lines": [
        {
          "materialId": "mat-15",
          "qty": 400,
          "unitCost": 0.03,
          "batchNo": "B-SALT-0801",
          "expiryDate": null
        }
      ]
    },
    {
      "id": "gr-78",
      "number": "GR-2026-004",
      "purchaseOrderId": "po-74",
      "at": "2026-09-08T22:00:00.000Z",
      "createdBy": "user-gm",
      "lines": [
        {
          "materialId": "mat-12",
          "qty": 1200,
          "unitCost": 0.02,
          "batchNo": "B-LIME-0801",
          "expiryDate": null
        }
      ]
    },
    {
      "id": "gr-69",
      "number": "GR-2026-003",
      "purchaseOrderId": "po-65",
      "at": "2026-09-08T04:00:00.000Z",
      "createdBy": "user-gm",
      "lines": [
        {
          "materialId": "mat-9",
          "qty": 9000,
          "unitCost": 0.045,
          "batchNo": "B-BRAN-0901",
          "expiryDate": "2027-01-15"
        }
      ]
    },
    {
      "id": "gr-60",
      "number": "GR-2026-002",
      "purchaseOrderId": "po-56",
      "at": "2026-09-07T10:00:00.000Z",
      "createdBy": "user-gm",
      "lines": [
        {
          "materialId": "mat-6",
          "qty": 2500,
          "unitCost": 0.21,
          "batchNo": "B-SOYA-0902",
          "expiryDate": "2027-02-01"
        }
      ]
    },
    {
      "id": "gr-51",
      "number": "GR-2026-001",
      "purchaseOrderId": "po-47",
      "at": "2026-09-06T16:00:00.000Z",
      "createdBy": "user-gm",
      "lines": [
        {
          "materialId": "mat-3",
          "qty": 20000,
          "unitCost": 0.085,
          "batchNo": "B-CORN-0901",
          "expiryDate": "2027-03-01"
        }
      ]
    }
  ],
  "transfers": [
    {
      "id": "tr-101",
      "number": "TR-2026-001",
      "from": "WH_RAW",
      "to": "WH_MFG",
      "at": "2026-09-10T16:00:00.000Z",
      "createdBy": "user-gm",
      "notes": "صرف وصفة تسمين لأمر الإنتاج",
      "lines": [
        {
          "itemType": "MATERIAL",
          "itemId": "mat-3",
          "batchNo": "B-CORN-0901",
          "qty": 1040
        },
        {
          "itemType": "MATERIAL",
          "itemId": "mat-6",
          "batchNo": "B-SOYA-0902",
          "qty": 400
        },
        {
          "itemType": "MATERIAL",
          "itemId": "mat-9",
          "batchNo": "B-BRAN-0901",
          "qty": 400
        },
        {
          "itemType": "MATERIAL",
          "itemId": "mat-12",
          "batchNo": "B-LIME-0801",
          "qty": 80
        },
        {
          "itemType": "MATERIAL",
          "itemId": "mat-15",
          "batchNo": "B-SALT-0801",
          "qty": 40
        },
        {
          "itemType": "MATERIAL",
          "itemId": "mat-18",
          "batchNo": "B-PRE-0801",
          "qty": 40
        }
      ]
    }
  ],
  "adjustments": [],
  "productionOrders": [
    {
      "id": "prdord-121",
      "number": "PR-2026-001",
      "productId": "prd-21",
      "recipeId": "rcp-43",
      "plannedQty": 2000,
      "status": "COMPLETED",
      "expected": [
        {
          "materialId": "mat-3",
          "expectedQty": 1040,
          "actualQty": 1040,
          "wasteQty": 15
        },
        {
          "materialId": "mat-6",
          "expectedQty": 400,
          "actualQty": 400,
          "wasteQty": 0
        },
        {
          "materialId": "mat-9",
          "expectedQty": 400,
          "actualQty": 400,
          "wasteQty": 0
        },
        {
          "materialId": "mat-12",
          "expectedQty": 80,
          "actualQty": 80,
          "wasteQty": 0
        },
        {
          "materialId": "mat-15",
          "expectedQty": 40,
          "actualQty": 40,
          "wasteQty": 0
        },
        {
          "materialId": "mat-18",
          "expectedQty": 40,
          "actualQty": 40,
          "wasteQty": 0
        }
      ],
      "actualOutputQty": 2000,
      "totalCost": 241.2,
      "unitCost": 0.121,
      "outputBatch": "PR-2026-001",
      "varianceReason": "",
      "createdBy": "user-gm",
      "createdAt": "2026-09-10T22:00:00.000Z",
      "completedAt": "2026-09-11T04:00:00.000Z"
    }
  ],
  "invoices": [
    {
      "id": "inv-134",
      "number": "INV-2026-001",
      "customerId": "c-31",
      "status": "PARTIAL",
      "issuedAt": "2026-09-11T16:00:00.000Z",
      "notes": "تسليم مصنع — صحار",
      "lines": [
        {
          "productId": "prd-21",
          "qty": 500,
          "unitPrice": 0.18,
          "vatTreatment": "STANDARD",
          "vatRatePct": 5,
          "net": 90,
          "vat": 4.5,
          "total": 94.5,
          "batchNo": "PR-2026-001",
          "unitCost": 0.121
        }
      ],
      "subtotal": 90,
      "vatAmount": 4.5,
      "total": 94.5,
      "paidAmount": 50,
      "createdBy": "user-gm"
    }
  ],
  "payments": [
    {
      "id": "pay-140",
      "number": "PAY-2026-001",
      "invoiceId": "inv-134",
      "amount": 50,
      "method": "تحويل بنكي",
      "at": "2026-09-11T22:00:00.000Z",
      "createdBy": "user-gm"
    }
  ],
  "withdrawals": [],
  "expenses": [
    {
      "id": "exp-146",
      "number": "EXP-2026-001",
      "category": "طاقة",
      "description": "ديزل المولد — أسبوع",
      "amount": 85,
      "vatTreatment": "STANDARD",
      "payFrom": "BANK",
      "status": "PENDING_APPROVAL",
      "vatAmount": 4.25,
      "total": 89.25,
      "createdBy": "user-gm",
      "createdAt": "2026-09-12T10:00:00.000Z"
    }
  ],
  "journals": [
    {
      "id": "je-141",
      "number": "JE-2026-012",
      "at": "2026-09-11T22:00:00.000Z",
      "memo": "تحصيل PAY-2026-001",
      "refType": "salesPayment",
      "refId": "pay-140",
      "lines": [
        {
          "accountCode": "1500",
          "debit": 50,
          "credit": 0
        },
        {
          "accountCode": "1400",
          "debit": 0,
          "credit": 50
        }
      ]
    },
    {
      "id": "je-138",
      "number": "JE-2026-011",
      "at": "2026-09-11T16:00:00.000Z",
      "memo": "تكلفة مبيعات INV-2026-001",
      "refType": "salesInvoice",
      "refId": "inv-134",
      "lines": [
        {
          "accountCode": "5100",
          "debit": 60.5,
          "credit": 0
        },
        {
          "accountCode": "1300",
          "debit": 0,
          "credit": 60.5
        }
      ]
    },
    {
      "id": "je-137",
      "number": "JE-2026-010",
      "at": "2026-09-11T16:00:00.000Z",
      "memo": "فاتورة مبيعات INV-2026-001",
      "refType": "salesInvoice",
      "refId": "inv-134",
      "lines": [
        {
          "accountCode": "1400",
          "debit": 94.5,
          "credit": 0
        },
        {
          "accountCode": "4100",
          "debit": 0,
          "credit": 90
        },
        {
          "accountCode": "2200",
          "debit": 0,
          "credit": 4.5
        }
      ]
    },
    {
      "id": "je-132",
      "number": "JE-2026-009",
      "at": "2026-09-11T04:00:00.000Z",
      "memo": "إخراج إنتاج PR-2026-001",
      "refType": "productionOrder",
      "refId": "prdord-121",
      "lines": [
        {
          "accountCode": "1300",
          "debit": 241.2,
          "credit": 0
        },
        {
          "accountCode": "1200",
          "debit": 0,
          "credit": 241.2
        }
      ]
    },
    {
      "id": "je-131",
      "number": "JE-2026-008",
      "at": "2026-09-11T04:00:00.000Z",
      "memo": "استهلاك إنتاج PR-2026-001",
      "refType": "productionOrder",
      "refId": "prdord-121",
      "lines": [
        {
          "accountCode": "1200",
          "debit": 241.2,
          "credit": 0
        },
        {
          "accountCode": "1100",
          "debit": 0,
          "credit": 241.2
        }
      ]
    },
    {
      "id": "je-99",
      "number": "JE-2026-007",
      "at": "2026-09-10T10:00:00.000Z",
      "memo": "استلام مشتريات GR-2026-006",
      "refType": "goodsReceipt",
      "refId": "gr-96",
      "lines": [
        {
          "accountCode": "1100",
          "debit": 216,
          "credit": 0
        },
        {
          "accountCode": "2300",
          "debit": 10.8,
          "credit": 0
        },
        {
          "accountCode": "2100",
          "debit": 0,
          "credit": 226.8
        }
      ]
    },
    {
      "id": "je-90",
      "number": "JE-2026-006",
      "at": "2026-09-09T16:00:00.000Z",
      "memo": "استلام مشتريات GR-2026-005",
      "refType": "goodsReceipt",
      "refId": "gr-87",
      "lines": [
        {
          "accountCode": "1100",
          "debit": 12,
          "credit": 0
        },
        {
          "accountCode": "2300",
          "debit": 0.6,
          "credit": 0
        },
        {
          "accountCode": "2100",
          "debit": 0,
          "credit": 12.6
        }
      ]
    },
    {
      "id": "je-81",
      "number": "JE-2026-005",
      "at": "2026-09-08T22:00:00.000Z",
      "memo": "استلام مشتريات GR-2026-004",
      "refType": "goodsReceipt",
      "refId": "gr-78",
      "lines": [
        {
          "accountCode": "1100",
          "debit": 24,
          "credit": 0
        },
        {
          "accountCode": "2300",
          "debit": 1.2,
          "credit": 0
        },
        {
          "accountCode": "2100",
          "debit": 0,
          "credit": 25.2
        }
      ]
    },
    {
      "id": "je-72",
      "number": "JE-2026-004",
      "at": "2026-09-08T04:00:00.000Z",
      "memo": "استلام مشتريات GR-2026-003",
      "refType": "goodsReceipt",
      "refId": "gr-69",
      "lines": [
        {
          "accountCode": "1100",
          "debit": 405,
          "credit": 0
        },
        {
          "accountCode": "2100",
          "debit": 0,
          "credit": 405
        }
      ]
    },
    {
      "id": "je-63",
      "number": "JE-2026-003",
      "at": "2026-09-07T10:00:00.000Z",
      "memo": "استلام مشتريات GR-2026-002",
      "refType": "goodsReceipt",
      "refId": "gr-60",
      "lines": [
        {
          "accountCode": "1100",
          "debit": 525,
          "credit": 0
        },
        {
          "accountCode": "2100",
          "debit": 0,
          "credit": 525
        }
      ]
    },
    {
      "id": "je-54",
      "number": "JE-2026-002",
      "at": "2026-09-06T16:00:00.000Z",
      "memo": "استلام مشتريات GR-2026-001",
      "refType": "goodsReceipt",
      "refId": "gr-51",
      "lines": [
        {
          "accountCode": "1100",
          "debit": 1700,
          "credit": 0
        },
        {
          "accountCode": "2100",
          "debit": 0,
          "credit": 1700
        }
      ]
    },
    {
      "id": "je-1",
      "number": "JE-2026-001",
      "at": "2026-09-01T04:00:00.000Z",
      "memo": "رأس مال افتتاحي — البنك",
      "refType": "capital",
      "refId": "bank",
      "lines": [
        {
          "accountCode": "1500",
          "debit": 25000,
          "credit": 0
        },
        {
          "accountCode": "3100",
          "debit": 0,
          "credit": 25000
        }
      ]
    }
  ],
  "attendance": [
    {
      "id": "att-158",
      "employeeId": "emp-35",
      "date": "2026-09-20",
      "checkIn": "07:00",
      "checkOut": "15:10",
      "source": "MANUAL"
    },
    {
      "id": "att-156",
      "employeeId": "emp-37",
      "date": "2026-09-20",
      "checkIn": "07:00",
      "checkOut": "15:10",
      "source": "MANUAL"
    },
    {
      "id": "att-154",
      "employeeId": "emp-39",
      "date": "2026-09-20",
      "checkIn": "07:00",
      "checkOut": "15:10",
      "source": "MANUAL"
    },
    {
      "id": "att-152",
      "employeeId": "emp-41",
      "date": "2026-09-20",
      "checkIn": "07:00",
      "checkOut": "15:10",
      "source": "MANUAL"
    }
  ],
  "payrolls": [
    {
      "id": "payr-149",
      "number": "PRL-2026-001",
      "month": "2026-09",
      "status": "PENDING_APPROVAL",
      "lines": [
        {
          "employeeId": "emp-41",
          "basic": 400,
          "overtimeHours": 6,
          "overtimeAmount": 12.5,
          "allowances": 0,
          "deductions": 0,
          "gross": 412.5,
          "net": 412.5
        },
        {
          "employeeId": "emp-39",
          "basic": 520,
          "overtimeHours": 0,
          "overtimeAmount": 0,
          "allowances": 0,
          "deductions": 0,
          "gross": 520,
          "net": 520
        },
        {
          "employeeId": "emp-37",
          "basic": 380,
          "overtimeHours": 0,
          "overtimeAmount": 0,
          "allowances": 0,
          "deductions": 0,
          "gross": 380,
          "net": 380
        },
        {
          "employeeId": "emp-35",
          "basic": 420,
          "overtimeHours": 0,
          "overtimeAmount": 0,
          "allowances": 0,
          "deductions": 0,
          "gross": 420,
          "net": 420
        }
      ],
      "totalNet": 1732.5,
      "createdBy": "user-gm",
      "createdAt": "2026-09-12T16:00:00.000Z"
    }
  ],
  "tasks": [
    {
      "id": "task-160",
      "title": "مراجعة نقص كسب الصويا قبل اعتماد أمر الشراء",
      "assigneeRole": "GM",
      "dueDate": "2026-09-22",
      "status": "OPEN",
      "createdAt": "2026-09-13T22:00:00.000Z"
    }
  ],
  "notifications": [
    {
      "id": "ntf-150",
      "kind": "APPROVAL",
      "title": "اعتماد مسير 2026-09",
      "body": "الصافي 1732.5 ر.ع.",
      "dedupeKey": "appr:prl:payr-149",
      "roles": [
        "GM"
      ],
      "read": false,
      "emailStatus": "skipped",
      "at": "2026-09-12T16:00:00.000Z"
    },
    {
      "id": "ntf-147",
      "kind": "APPROVAL",
      "title": "اعتماد مصروف EXP-2026-001",
      "body": "ديزل المولد — أسبوع",
      "dedupeKey": "appr:exp:exp-146",
      "roles": [
        "GM"
      ],
      "read": false,
      "emailStatus": "skipped",
      "at": "2026-09-12T10:00:00.000Z"
    },
    {
      "id": "ntf-144",
      "kind": "APPROVAL",
      "title": "اعتماد أمر شراء PO-2026-007",
      "body": "أمر شراء بانتظار اعتماد المدير العام.",
      "dedupeKey": "appr:po:po-143",
      "roles": [
        "GM"
      ],
      "read": false,
      "emailStatus": "skipped",
      "at": "2026-09-12T04:00:00.000Z"
    },
    {
      "id": "ntf-93",
      "kind": "APPROVAL",
      "title": "اعتماد أمر شراء PO-2026-006",
      "body": "أمر شراء بانتظار اعتماد المدير العام.",
      "dedupeKey": "appr:po:po-92",
      "roles": [
        "GM"
      ],
      "read": false,
      "emailStatus": "skipped",
      "at": "2026-09-09T22:00:00.000Z"
    },
    {
      "id": "ntf-84",
      "kind": "APPROVAL",
      "title": "اعتماد أمر شراء PO-2026-005",
      "body": "أمر شراء بانتظار اعتماد المدير العام.",
      "dedupeKey": "appr:po:po-83",
      "roles": [
        "GM"
      ],
      "read": false,
      "emailStatus": "skipped",
      "at": "2026-09-09T04:00:00.000Z"
    },
    {
      "id": "ntf-75",
      "kind": "APPROVAL",
      "title": "اعتماد أمر شراء PO-2026-004",
      "body": "أمر شراء بانتظار اعتماد المدير العام.",
      "dedupeKey": "appr:po:po-74",
      "roles": [
        "GM"
      ],
      "read": false,
      "emailStatus": "skipped",
      "at": "2026-09-08T10:00:00.000Z"
    },
    {
      "id": "ntf-66",
      "kind": "APPROVAL",
      "title": "اعتماد أمر شراء PO-2026-003",
      "body": "أمر شراء بانتظار اعتماد المدير العام.",
      "dedupeKey": "appr:po:po-65",
      "roles": [
        "GM"
      ],
      "read": false,
      "emailStatus": "skipped",
      "at": "2026-09-07T16:00:00.000Z"
    },
    {
      "id": "ntf-57",
      "kind": "APPROVAL",
      "title": "اعتماد أمر شراء PO-2026-002",
      "body": "أمر شراء بانتظار اعتماد المدير العام.",
      "dedupeKey": "appr:po:po-56",
      "roles": [
        "GM"
      ],
      "read": false,
      "emailStatus": "skipped",
      "at": "2026-09-06T22:00:00.000Z"
    },
    {
      "id": "ntf-48",
      "kind": "APPROVAL",
      "title": "اعتماد أمر شراء PO-2026-001",
      "body": "أمر شراء بانتظار اعتماد المدير العام.",
      "dedupeKey": "appr:po:po-47",
      "roles": [
        "GM"
      ],
      "read": false,
      "emailStatus": "skipped",
      "at": "2026-09-06T04:00:00.000Z"
    },
    {
      "id": "ntf-20",
      "kind": "LOW_STOCK",
      "title": "مخزون منخفض: بريمكس فيتامينات",
      "body": "الرصيد 0 كجم والحد الأدنى 80.",
      "dedupeKey": "low:mat-18",
      "roles": [
        "GM",
        "OPERATIONS"
      ],
      "read": true,
      "emailStatus": "skipped",
      "at": "2026-09-02T16:00:00.000Z"
    },
    {
      "id": "ntf-17",
      "kind": "LOW_STOCK",
      "title": "مخزون منخفض: ملح طعام",
      "body": "الرصيد 0 كجم والحد الأدنى 150.",
      "dedupeKey": "low:mat-15",
      "roles": [
        "GM",
        "OPERATIONS"
      ],
      "read": true,
      "emailStatus": "skipped",
      "at": "2026-09-02T10:00:00.000Z"
    },
    {
      "id": "ntf-14",
      "kind": "LOW_STOCK",
      "title": "مخزون منخفض: حجر جيري",
      "body": "الرصيد 0 كجم والحد الأدنى 400.",
      "dedupeKey": "low:mat-12",
      "roles": [
        "GM",
        "OPERATIONS"
      ],
      "read": true,
      "emailStatus": "skipped",
      "at": "2026-09-02T04:00:00.000Z"
    },
    {
      "id": "ntf-11",
      "kind": "LOW_STOCK",
      "title": "مخزون منخفض: نخالة قمح",
      "body": "الرصيد 0 كجم والحد الأدنى 2500.",
      "dedupeKey": "low:mat-9",
      "roles": [
        "GM",
        "OPERATIONS"
      ],
      "read": true,
      "emailStatus": "skipped",
      "at": "2026-09-01T22:00:00.000Z"
    },
    {
      "id": "ntf-8",
      "kind": "LOW_STOCK",
      "title": "مخزون منخفض: كسب فول الصويا",
      "body": "الرصيد 0 كجم والحد الأدنى 4000.",
      "dedupeKey": "low:mat-6",
      "roles": [
        "GM",
        "OPERATIONS"
      ],
      "read": false,
      "emailStatus": "skipped",
      "at": "2026-09-01T16:00:00.000Z"
    },
    {
      "id": "ntf-5",
      "kind": "LOW_STOCK",
      "title": "مخزون منخفض: ذرة صفراء",
      "body": "الرصيد 0 كجم والحد الأدنى 8000.",
      "dedupeKey": "low:mat-3",
      "roles": [
        "GM",
        "OPERATIONS"
      ],
      "read": true,
      "emailStatus": "skipped",
      "at": "2026-09-01T10:00:00.000Z"
    }
  ],
  "auditLogs": [
    {
      "id": "aud-161",
      "at": "2026-09-13T22:00:00.000Z",
      "userId": "user-gm",
      "userName": "سعيد الوهيبي",
      "action": "إنشاء مهمة",
      "entity": "task",
      "entityId": "task-160",
      "detail": "مراجعة نقص كسب الصويا قبل اعتماد أمر الشراء"
    },
    {
      "id": "aud-159",
      "at": "2026-09-13T16:00:00.000Z",
      "userId": "user-gm",
      "userName": "سعيد الوهيبي",
      "action": "تسجيل حضور",
      "entity": "attendance",
      "entityId": "att-158",
      "detail": "2026-09-20"
    },
    {
      "id": "aud-157",
      "at": "2026-09-13T10:00:00.000Z",
      "userId": "user-gm",
      "userName": "سعيد الوهيبي",
      "action": "تسجيل حضور",
      "entity": "attendance",
      "entityId": "att-156",
      "detail": "2026-09-20"
    },
    {
      "id": "aud-155",
      "at": "2026-09-13T04:00:00.000Z",
      "userId": "user-gm",
      "userName": "سعيد الوهيبي",
      "action": "تسجيل حضور",
      "entity": "attendance",
      "entityId": "att-154",
      "detail": "2026-09-20"
    },
    {
      "id": "aud-153",
      "at": "2026-09-12T22:00:00.000Z",
      "userId": "user-gm",
      "userName": "سعيد الوهيبي",
      "action": "تسجيل حضور",
      "entity": "attendance",
      "entityId": "att-152",
      "detail": "2026-09-20"
    },
    {
      "id": "aud-151",
      "at": "2026-09-12T16:00:00.000Z",
      "userId": "user-gm",
      "userName": "سعيد الوهيبي",
      "action": "إنشاء مسير رواتب",
      "entity": "payroll",
      "entityId": "payr-149",
      "detail": "PRL-2026-001"
    },
    {
      "id": "aud-148",
      "at": "2026-09-12T10:00:00.000Z",
      "userId": "user-gm",
      "userName": "سعيد الوهيبي",
      "action": "إنشاء مصروف",
      "entity": "expense",
      "entityId": "exp-146",
      "detail": "EXP-2026-001"
    },
    {
      "id": "aud-145",
      "at": "2026-09-12T04:00:00.000Z",
      "userId": "user-gm",
      "userName": "سعيد الوهيبي",
      "action": "إنشاء أمر شراء",
      "entity": "purchaseOrder",
      "entityId": "po-143",
      "detail": "PO-2026-007"
    },
    {
      "id": "aud-142",
      "at": "2026-09-11T22:00:00.000Z",
      "userId": "user-gm",
      "userName": "سعيد الوهيبي",
      "action": "تحصيل فاتورة",
      "entity": "salesPayment",
      "entityId": "pay-140",
      "detail": "PAY-2026-001"
    },
    {
      "id": "aud-139",
      "at": "2026-09-11T16:00:00.000Z",
      "userId": "user-gm",
      "userName": "سعيد الوهيبي",
      "action": "تأكيد فاتورة",
      "entity": "salesInvoice",
      "entityId": "inv-134",
      "detail": "INV-2026-001"
    },
    {
      "id": "aud-135",
      "at": "2026-09-11T10:00:00.000Z",
      "userId": "user-gm",
      "userName": "سعيد الوهيبي",
      "action": "إنشاء فاتورة",
      "entity": "salesInvoice",
      "entityId": "inv-134",
      "detail": "INV-2026-001"
    },
    {
      "id": "aud-133",
      "at": "2026-09-11T04:00:00.000Z",
      "userId": "user-gm",
      "userName": "سعيد الوهيبي",
      "action": "إكمال الإنتاج",
      "entity": "productionOrder",
      "entityId": "prdord-121",
      "detail": "PR-2026-001"
    },
    {
      "id": "aud-122",
      "at": "2026-09-10T22:00:00.000Z",
      "userId": "user-gm",
      "userName": "سعيد الوهيبي",
      "action": "إنشاء أمر إنتاج",
      "entity": "productionOrder",
      "entityId": "prdord-121",
      "detail": "PR-2026-001"
    },
    {
      "id": "aud-120",
      "at": "2026-09-10T16:00:00.000Z",
      "userId": "user-gm",
      "userName": "سعيد الوهيبي",
      "action": "تحويل مخزون",
      "entity": "stockTransfer",
      "entityId": "tr-101",
      "detail": "TR-2026-001"
    },
    {
      "id": "aud-100",
      "at": "2026-09-10T10:00:00.000Z",
      "userId": "user-gm",
      "userName": "سعيد الوهيبي",
      "action": "استلام بضاعة",
      "entity": "goodsReceipt",
      "entityId": "gr-96",
      "detail": "GR-2026-006"
    },
    {
      "id": "aud-95",
      "at": "2026-09-10T04:00:00.000Z",
      "userId": "user-gm",
      "userName": "سعيد الوهيبي",
      "action": "اعتماد أمر شراء",
      "entity": "purchaseOrder",
      "entityId": "po-92",
      "detail": "PO-2026-006"
    },
    {
      "id": "aud-94",
      "at": "2026-09-09T22:00:00.000Z",
      "userId": "user-gm",
      "userName": "سعيد الوهيبي",
      "action": "إنشاء أمر شراء",
      "entity": "purchaseOrder",
      "entityId": "po-92",
      "detail": "PO-2026-006"
    },
    {
      "id": "aud-91",
      "at": "2026-09-09T16:00:00.000Z",
      "userId": "user-gm",
      "userName": "سعيد الوهيبي",
      "action": "استلام بضاعة",
      "entity": "goodsReceipt",
      "entityId": "gr-87",
      "detail": "GR-2026-005"
    },
    {
      "id": "aud-86",
      "at": "2026-09-09T10:00:00.000Z",
      "userId": "user-gm",
      "userName": "سعيد الوهيبي",
      "action": "اعتماد أمر شراء",
      "entity": "purchaseOrder",
      "entityId": "po-83",
      "detail": "PO-2026-005"
    },
    {
      "id": "aud-85",
      "at": "2026-09-09T04:00:00.000Z",
      "userId": "user-gm",
      "userName": "سعيد الوهيبي",
      "action": "إنشاء أمر شراء",
      "entity": "purchaseOrder",
      "entityId": "po-83",
      "detail": "PO-2026-005"
    },
    {
      "id": "aud-82",
      "at": "2026-09-08T22:00:00.000Z",
      "userId": "user-gm",
      "userName": "سعيد الوهيبي",
      "action": "استلام بضاعة",
      "entity": "goodsReceipt",
      "entityId": "gr-78",
      "detail": "GR-2026-004"
    },
    {
      "id": "aud-77",
      "at": "2026-09-08T16:00:00.000Z",
      "userId": "user-gm",
      "userName": "سعيد الوهيبي",
      "action": "اعتماد أمر شراء",
      "entity": "purchaseOrder",
      "entityId": "po-74",
      "detail": "PO-2026-004"
    },
    {
      "id": "aud-76",
      "at": "2026-09-08T10:00:00.000Z",
      "userId": "user-gm",
      "userName": "سعيد الوهيبي",
      "action": "إنشاء أمر شراء",
      "entity": "purchaseOrder",
      "entityId": "po-74",
      "detail": "PO-2026-004"
    },
    {
      "id": "aud-73",
      "at": "2026-09-08T04:00:00.000Z",
      "userId": "user-gm",
      "userName": "سعيد الوهيبي",
      "action": "استلام بضاعة",
      "entity": "goodsReceipt",
      "entityId": "gr-69",
      "detail": "GR-2026-003"
    },
    {
      "id": "aud-68",
      "at": "2026-09-07T22:00:00.000Z",
      "userId": "user-gm",
      "userName": "سعيد الوهيبي",
      "action": "اعتماد أمر شراء",
      "entity": "purchaseOrder",
      "entityId": "po-65",
      "detail": "PO-2026-003"
    },
    {
      "id": "aud-67",
      "at": "2026-09-07T16:00:00.000Z",
      "userId": "user-gm",
      "userName": "سعيد الوهيبي",
      "action": "إنشاء أمر شراء",
      "entity": "purchaseOrder",
      "entityId": "po-65",
      "detail": "PO-2026-003"
    },
    {
      "id": "aud-64",
      "at": "2026-09-07T10:00:00.000Z",
      "userId": "user-gm",
      "userName": "سعيد الوهيبي",
      "action": "استلام بضاعة",
      "entity": "goodsReceipt",
      "entityId": "gr-60",
      "detail": "GR-2026-002"
    },
    {
      "id": "aud-59",
      "at": "2026-09-07T04:00:00.000Z",
      "userId": "user-gm",
      "userName": "سعيد الوهيبي",
      "action": "اعتماد أمر شراء",
      "entity": "purchaseOrder",
      "entityId": "po-56",
      "detail": "PO-2026-002"
    },
    {
      "id": "aud-58",
      "at": "2026-09-06T22:00:00.000Z",
      "userId": "user-gm",
      "userName": "سعيد الوهيبي",
      "action": "إنشاء أمر شراء",
      "entity": "purchaseOrder",
      "entityId": "po-56",
      "detail": "PO-2026-002"
    },
    {
      "id": "aud-55",
      "at": "2026-09-06T16:00:00.000Z",
      "userId": "user-gm",
      "userName": "سعيد الوهيبي",
      "action": "استلام بضاعة",
      "entity": "goodsReceipt",
      "entityId": "gr-51",
      "detail": "GR-2026-001"
    },
    {
      "id": "aud-50",
      "at": "2026-09-06T10:00:00.000Z",
      "userId": "user-gm",
      "userName": "سعيد الوهيبي",
      "action": "اعتماد أمر شراء",
      "entity": "purchaseOrder",
      "entityId": "po-47",
      "detail": "PO-2026-001"
    },
    {
      "id": "aud-49",
      "at": "2026-09-06T04:00:00.000Z",
      "userId": "user-gm",
      "userName": "سعيد الوهيبي",
      "action": "إنشاء أمر شراء",
      "entity": "purchaseOrder",
      "entityId": "po-47",
      "detail": "PO-2026-001"
    },
    {
      "id": "aud-46",
      "at": "2026-09-05T22:00:00.000Z",
      "userId": "user-gm",
      "userName": "سعيد الوهيبي",
      "action": "إنشاء وصفة",
      "entity": "recipe",
      "entityId": "rcp-45",
      "detail": "وصفة دواجن لاحم — طن"
    },
    {
      "id": "aud-44",
      "at": "2026-09-05T16:00:00.000Z",
      "userId": "user-gm",
      "userName": "سعيد الوهيبي",
      "action": "إنشاء وصفة",
      "entity": "recipe",
      "entityId": "rcp-43",
      "detail": "وصفة تسمين أبقار — طن"
    },
    {
      "id": "aud-42",
      "at": "2026-09-05T10:00:00.000Z",
      "userId": "user-gm",
      "userName": "سعيد الوهيبي",
      "action": "إنشاء موظف",
      "entity": "employee",
      "entityId": "emp-41",
      "detail": "أحمد السعدي"
    },
    {
      "id": "aud-40",
      "at": "2026-09-05T04:00:00.000Z",
      "userId": "user-gm",
      "userName": "سعيد الوهيبي",
      "action": "إنشاء موظف",
      "entity": "employee",
      "entityId": "emp-39",
      "detail": "نورة العامرية"
    },
    {
      "id": "aud-38",
      "at": "2026-09-04T22:00:00.000Z",
      "userId": "user-gm",
      "userName": "سعيد الوهيبي",
      "action": "إنشاء موظف",
      "entity": "employee",
      "entityId": "emp-37",
      "detail": "سالم الحارثي"
    },
    {
      "id": "aud-36",
      "at": "2026-09-04T16:00:00.000Z",
      "userId": "user-gm",
      "userName": "سعيد الوهيبي",
      "action": "إنشاء موظف",
      "entity": "employee",
      "entityId": "emp-35",
      "detail": "خالد البلوشي"
    },
    {
      "id": "aud-34",
      "at": "2026-09-04T10:00:00.000Z",
      "userId": "user-gm",
      "userName": "سعيد الوهيبي",
      "action": "إنشاء عميل",
      "entity": "customers",
      "entityId": "c-33",
      "detail": "شركة صحار للدواجن"
    },
    {
      "id": "aud-32",
      "at": "2026-09-04T04:00:00.000Z",
      "userId": "user-gm",
      "userName": "سعيد الوهيبي",
      "action": "إنشاء عميل",
      "entity": "customers",
      "entityId": "c-31",
      "detail": "مزارع الباطنة"
    },
    {
      "id": "aud-30",
      "at": "2026-09-03T22:00:00.000Z",
      "userId": "user-gm",
      "userName": "سعيد الوهيبي",
      "action": "إنشاء مورد",
      "entity": "suppliers",
      "entityId": "s-29",
      "detail": "شركة ظفار للحبوب"
    },
    {
      "id": "aud-28",
      "at": "2026-09-03T16:00:00.000Z",
      "userId": "user-gm",
      "userName": "سعيد الوهيبي",
      "action": "إنشاء مورد",
      "entity": "suppliers",
      "entityId": "s-27",
      "detail": "المطاحن العمانية"
    },
    {
      "id": "aud-26",
      "at": "2026-09-03T10:00:00.000Z",
      "userId": "user-gm",
      "userName": "سعيد الوهيبي",
      "action": "إنشاء منتج",
      "entity": "product",
      "entityId": "prd-25",
      "detail": "علف أغنام"
    },
    {
      "id": "aud-24",
      "at": "2026-09-03T04:00:00.000Z",
      "userId": "user-gm",
      "userName": "سعيد الوهيبي",
      "action": "إنشاء منتج",
      "entity": "product",
      "entityId": "prd-23",
      "detail": "علف دواجن لاحم"
    },
    {
      "id": "aud-22",
      "at": "2026-09-02T22:00:00.000Z",
      "userId": "user-gm",
      "userName": "سعيد الوهيبي",
      "action": "إنشاء منتج",
      "entity": "product",
      "entityId": "prd-21",
      "detail": "علف تسمين أبقار"
    },
    {
      "id": "aud-19",
      "at": "2026-09-02T16:00:00.000Z",
      "userId": "user-gm",
      "userName": "سعيد الوهيبي",
      "action": "إنشاء مادة",
      "entity": "material",
      "entityId": "mat-18",
      "detail": "بريمكس فيتامينات"
    },
    {
      "id": "aud-16",
      "at": "2026-09-02T10:00:00.000Z",
      "userId": "user-gm",
      "userName": "سعيد الوهيبي",
      "action": "إنشاء مادة",
      "entity": "material",
      "entityId": "mat-15",
      "detail": "ملح طعام"
    },
    {
      "id": "aud-13",
      "at": "2026-09-02T04:00:00.000Z",
      "userId": "user-gm",
      "userName": "سعيد الوهيبي",
      "action": "إنشاء مادة",
      "entity": "material",
      "entityId": "mat-12",
      "detail": "حجر جيري"
    },
    {
      "id": "aud-10",
      "at": "2026-09-01T22:00:00.000Z",
      "userId": "user-gm",
      "userName": "سعيد الوهيبي",
      "action": "إنشاء مادة",
      "entity": "material",
      "entityId": "mat-9",
      "detail": "نخالة قمح"
    },
    {
      "id": "aud-7",
      "at": "2026-09-01T16:00:00.000Z",
      "userId": "user-gm",
      "userName": "سعيد الوهيبي",
      "action": "إنشاء مادة",
      "entity": "material",
      "entityId": "mat-6",
      "detail": "كسب فول الصويا"
    },
    {
      "id": "aud-4",
      "at": "2026-09-01T10:00:00.000Z",
      "userId": "user-gm",
      "userName": "سعيد الوهيبي",
      "action": "إنشاء مادة",
      "entity": "material",
      "entityId": "mat-3",
      "detail": "ذرة صفراء"
    },
    {
      "id": "aud-2",
      "at": "2026-09-01T04:00:00.000Z",
      "userId": "user-gm",
      "userName": "سعيد الوهيبي",
      "action": "تمويل البنك",
      "entity": "journal",
      "entityId": "capital",
      "detail": "25000"
    }
  ],
  "sequences": {
    "JE-2026": 12,
    "PO-2026": 7,
    "GR-2026": 6,
    "TR-2026": 1,
    "PR-2026": 1,
    "INV-2026": 1,
    "PAY-2026": 1,
    "EXP-2026": 1,
    "PRL-2026": 1
  },
  "viewer": {
    "id": "user-gm",
    "fullName": "سعيد الوهيبي",
    "role": "GM",
    "email": "gm@factory.local"
  }
};
