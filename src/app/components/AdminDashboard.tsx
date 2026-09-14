"use client";

import React, { useState, useMemo } from "react";
import { 
  ShieldCheck, 
  Package, 
  ShoppingCart, 
  DollarSign, 
  TrendingUp, 
  Search, 
  Filter, 
  Edit3, 
  Plus, 
  Trash2, 
  Save, 
  Check, 
  X, 
  AlertCircle, 
  Clock, 
  FileText, 
  Download, 
  Calendar, 
  Eye, 
  Building2, 
  Mail, 
  Phone, 
  CheckCircle2, 
  PhoneCall, 
  Layers, 
  CircleDollarSign,
  Boxes,
  Percent,
  RefreshCw
} from "lucide-react";

// --- ТИПЫ ДАННЫХ: ТОВАРЫ И СКЛАДСКИЕ ОСТАТКИ ---
export interface ProductItem {
  id: string;
  article: string;
  name: string;
  category: "modular_lockers" | "locks" | "accessories";
  modelSeries: string;
  dimensions: string;
  cellHeight?: number;
  tiers?: number;
  basePrice: number; // Цена продажи в руб.
  costPrice: number; // Себестоимость в руб.
  stockQuantity: number; // Количество на складе (шт/секций)
  reservedQuantity: number; // В резерве под заказы
  minStockAlert: number; // Порог минимального остатка
  status: "in_stock" | "low_stock" | "out_of_stock" | "preorder";
  lastUpdated: string;
}

// --- ТИПЫ ДАННЫХ: ЗАЯВКИ ---
export type OrderStatus = "new" | "in_progress" | "kp_sent" | "paid" | "completed" | "cancelled";

export interface OrderItem {
  id: string;
  orderNumber: string;
  createdAt: string;
  client: {
    name: string;
    phone: string;
    email: string;
    company?: string;
    city?: string;
  };
  configuration: {
    modelId: string;
    modelName: string;
    columnsCount: number;
    tiersCount: number;
    totalCells: number;
    dimensions: string;
    lockType: string;
    accessories: string[];
    cellColorsBreakdown: Record<string, string>;
  };
  pricing: {
    basePrice: number;
    locksPrice: number;
    extrasPrice: number;
    totalPrice: number;
    vatAmount: number;
  };
  status: OrderStatus;
  managerComment?: string;
}

// --- ДЕМО-ДАННЫЕ КАТАЛОГА ТОВАРОВ И ЦЕН ---
const INITIAL_PRODUCTS: ProductItem[] = [
  {
    id: "prod-1",
    article: "ABS-T382XXL",
    name: "Шкаф АБС Т-382XXL (1 ярус / Полноростовой)",
    category: "modular_lockers",
    modelSeries: "T-382XXL",
    dimensions: "382 × 500 × 1860 мм (ячейка)",
    cellHeight: 1860,
    tiers: 1,
    basePrice: 11900,
    costPrice: 6500,
    stockQuantity: 42,
    reservedQuantity: 8,
    minStockAlert: 10,
    status: "in_stock",
    lastUpdated: "2026-09-14 10:30",
  },
  {
    id: "prod-2",
    article: "ABS-T382L",
    name: "Шкаф АБС Т-382L (2 яруса / Фитнес-Спорт)",
    category: "modular_lockers",
    modelSeries: "T-382L",
    dimensions: "382 × 500 × 930 мм (ячейка)",
    cellHeight: 930,
    tiers: 2,
    basePrice: 6400,
    costPrice: 3400,
    stockQuantity: 128,
    reservedQuantity: 34,
    minStockAlert: 20,
    status: "in_stock",
    lastUpdated: "2026-09-14 11:15",
  },
  {
    id: "prod-3",
    article: "ABS-T382M",
    name: "Шкаф АБС Т-382M (3 яруса / Клуб-Стандарт)",
    category: "modular_lockers",
    modelSeries: "T-382M",
    dimensions: "382 × 500 × 620 мм (ячейка)",
    cellHeight: 620,
    tiers: 3,
    basePrice: 4500,
    costPrice: 2300,
    stockQuantity: 9,
    reservedQuantity: 6,
    minStockAlert: 15,
    status: "low_stock",
    lastUpdated: "2026-09-13 16:45",
  },
  {
    id: "prod-4",
    article: "ABS-T382S",
    name: "Шкаф АБС Т-382S (4 яруса / Камера хранения)",
    category: "modular_lockers",
    modelSeries: "T-382S",
    dimensions: "382 × 500 × 460 мм (ячейка)",
    cellHeight: 460,
    tiers: 4,
    basePrice: 3600,
    costPrice: 1900,
    stockQuantity: 64,
    reservedQuantity: 12,
    minStockAlert: 10,
    status: "in_stock",
    lastUpdated: "2026-09-12 14:20",
  },
  {
    id: "prod-5",
    article: "LOCK-RFID-01",
    name: "Электронный RFID-замок (браслеты/карты)",
    category: "locks",
    modelSeries: "Фурнитура",
    dimensions: "Врезной стандарт",
    basePrice: 2400,
    costPrice: 1200,
    stockQuantity: 180,
    reservedQuantity: 40,
    minStockAlert: 30,
    status: "in_stock",
    lastUpdated: "2026-09-14 09:00",
  },
  {
    id: "prod-6",
    article: "LOCK-CODE-MECH",
    name: "Механический кодовый замок с мастер-ключом",
    category: "locks",
    modelSeries: "Фурнитура",
    dimensions: "Врезной стандарт",
    basePrice: 1250,
    costPrice: 650,
    stockQuantity: 75,
    reservedQuantity: 18,
    minStockAlert: 20,
    status: "in_stock",
    lastUpdated: "2026-09-11 12:00",
  },
  {
    id: "prod-7",
    article: "ACC-DOOR-POCKET",
    name: "Дверной карман-органайзер (АБС-пластик)",
    category: "accessories",
    modelSeries: "Аксессуары",
    dimensions: "Ш220 × Г70 × В110 мм",
    basePrice: 350,
    costPrice: 120,
    stockQuantity: 340,
    reservedQuantity: 50,
    minStockAlert: 50,
    status: "in_stock",
    lastUpdated: "2026-09-14 11:00",
  },
  {
    id: "prod-8",
    article: "ACC-BASE-PLINTH",
    name: "Влагозащитный цоколь-основание",
    category: "accessories",
    modelSeries: "Аксессуары",
    dimensions: "Ш382 × Г500 × В80 мм",
    basePrice: 1500,
    costPrice: 680,
    stockQuantity: 5,
    reservedQuantity: 4,
    minStockAlert: 10,
    status: "low_stock",
    lastUpdated: "2026-09-14 10:00",
  },
];

// --- ДЕМО-ДАННЫЕ ЗАЯВОК ---
const INITIAL_ORDERS: OrderItem[] = [
  {
    id: "ord-101",
    orderNumber: "ABS-2026-0042",
    createdAt: "2026-09-14 11:30",
    client: {
      name: "Иван Сергеевич",
      phone: "+7 (916) 450-22-11",
      email: "ivan.fit@wellness-club.ru",
      company: "Фитнес-клуб «Олимп»",
      city: "Москва",
    },
    configuration: {
      modelId: "T-382L",
      modelName: "T-382L (2 яруса / Фитнес-Спорт)",
      columnsCount: 4,
      tiersCount: 2,
      totalCells: 8,
      dimensions: "1528 × 1940 × 500 мм",
      lockType: "Электронный RFID (браслеты/карты)",
      accessories: ["Дверной карман-органайзер", "Штанга для плечиков + 2 крючка", "Номерная акриловая табличка", "Влагозащитный цоколь"],
      cellColorsBreakdown: { "0_0": "sun-yellow", "0_1": "sky-blue" },
    },
    pricing: {
      basePrice: 51200,
      locksPrice: 19200,
      extrasPrice: 7900,
      totalPrice: 78300,
      vatAmount: 13050,
    },
    status: "new",
    managerComment: "Планируется закупка 12 аналогичных блоков. Запрошен чертеж расстановки.",
  },
  {
    id: "ord-102",
    orderNumber: "ABS-2026-0041",
    createdAt: "2026-09-14 10:15",
    client: {
      name: "Анна Михайловна",
      phone: "+7 (921) 330-88-99",
      email: "anna@school1502.ru",
      company: "ГБОУ Школа №1502",
      city: "Санкт-Петербург",
    },
    configuration: {
      modelId: "T-382M",
      modelName: "T-382M (3 яруса / Клуб-Стандарт)",
      columnsCount: 3,
      tiersCount: 3,
      totalCells: 9,
      dimensions: "1146 × 1940 × 500 мм",
      lockType: "Механический кодовый замок",
      accessories: ["Номерная акриловая табличка", "Влагозащитный цоколь"],
      cellColorsBreakdown: { "0_0": "sun-yellow", "1_0": "pearl-grey" },
    },
    pricing: {
      basePrice: 40500,
      locksPrice: 11250,
      extrasPrice: 2310,
      totalPrice: 54060,
      vatAmount: 9010,
    },
    status: "kp_sent",
  },
];

const STATUS_CONFIG: Record<OrderStatus, { label: string; bg: string; text: string; border: string }> = {
  new: { label: "Новая заявка", bg: "bg-amber-50", text: "text-amber-800", border: "border-amber-200" },
  in_progress: { label: "В обработке", bg: "bg-sky-50", text: "text-sky-800", border: "border-sky-200" },
  kp_sent: { label: "КП отправлено", bg: "bg-blue-50", text: "text-blue-800", border: "border-blue-200" },
  paid: { label: "Оплачен", bg: "bg-emerald-50", text: "text-emerald-800", border: "border-emerald-200" },
  completed: { label: "Выполнен", bg: "bg-purple-50", text: "text-purple-800", border: "border-purple-200" },
  cancelled: { label: "Отменен", bg: "bg-rose-50", text: "text-rose-800", border: "border-rose-200" },
};

export default function AdminDashboard() {
  // Активная вкладка: 'orders' (Заявки) или 'products' (Каталог и цены)
  const [activeTab, setActiveTab] = useState<"orders" | "products">("products");

  // Состояние товаров
  const [products, setProducts] = useState<ProductItem[]>(INITIAL_PRODUCTS);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<ProductItem>>({});
  const [productSearch, setProductSearch] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Модалка добавления нового товара
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [newProduct, setNewProduct] = useState<Partial<ProductItem>>({
    article: "",
    name: "",
    category: "modular_lockers",
    modelSeries: "T-382",
    dimensions: "",
    basePrice: 0,
    costPrice: 0,
    stockQuantity: 0,
    minStockAlert: 10,
    status: "in_stock",
  });

  // Состояние заявок
  const [orders, setOrders] = useState<OrderItem[]>(INITIAL_ORDERS);
  const [orderSearch, setOrderSearch] = useState<string>("");
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);

  // --- ЛОГИКА ТОВАРОВ ---

  // Фильтрация товаров
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCat = categoryFilter === "all" || p.category === categoryFilter;
      const q = productSearch.toLowerCase();
      const matchesQuery = 
        p.name.toLowerCase().includes(q) || 
        p.article.toLowerCase().includes(q) ||
        p.modelSeries.toLowerCase().includes(q);
      return matchesCat && matchesQuery;
    });
  }, [products, categoryFilter, productSearch]);

  // Старт редактирования товара
  const handleStartEdit = (product: ProductItem) => {
    setEditingProductId(product.id);
    setEditFormData({ ...product });
  };

  // Сохранение изменений товара
  const handleSaveEdit = (id: string) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const updated = {
            ...p,
            ...editFormData,
            lastUpdated: new Date().toLocaleString("ru-RU", { dateStyle: "short", timeStyle: "short" }),
          };
          // Пересчет статуса остатка
          if (updated.stockQuantity <= 0) updated.status = "out_of_stock";
          else if (updated.stockQuantity <= updated.minStockAlert) updated.status = "low_stock";
          else updated.status = "in_stock";

          return updated as ProductItem;
        }
        return p;
      })
    );
    setEditingProductId(null);
    setSaveSuccessMsg(`Товар ${editFormData.article} успешно обновлен!`);
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  // Быстрое изменение цены прямо в строке
  const handleQuickPriceChange = (id: string, newPrice: number) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, basePrice: newPrice, lastUpdated: "только что" } : p))
    );
  };

  // Быстрое изменение остатка прямо в строке
  const handleQuickStockChange = (id: string, newStock: number) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const status = newStock <= 0 ? "out_of_stock" : newStock <= p.minStockAlert ? "low_stock" : "in_stock";
          return { ...p, stockQuantity: newStock, status, lastUpdated: "только что" };
        }
        return p;
      })
    );
  };

  // Создание нового товара
  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.article || !newProduct.name) return;

    const created: ProductItem = {
      id: `prod-${Date.now()}`,
      article: newProduct.article,
      name: newProduct.name,
      category: newProduct.category || "modular_lockers",
      modelSeries: newProduct.modelSeries || "T-382",
      dimensions: newProduct.dimensions || "382×500 мм",
      basePrice: Number(newProduct.basePrice) || 0,
      costPrice: Number(newProduct.costPrice) || 0,
      stockQuantity: Number(newProduct.stockQuantity) || 0,
      reservedQuantity: 0,
      minStockAlert: Number(newProduct.minStockAlert) || 10,
      status: Number(newProduct.stockQuantity) > 0 ? "in_stock" : "out_of_stock",
      lastUpdated: "только что",
    };

    setProducts((prev) => [created, ...prev]);
    setIsAddModalOpen(false);
    setNewProduct({
      article: "",
      name: "",
      category: "modular_lockers",
      modelSeries: "T-382",
      dimensions: "",
      basePrice: 0,
      costPrice: 0,
      stockQuantity: 0,
      minStockAlert: 10,
      status: "in_stock",
    });
    setSaveSuccessMsg(`Новая позиция ${created.article} успешно добавлена в каталог!`);
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  // Удаление товара
  const handleDeleteProduct = (id: string) => {
    if (confirm("Вы уверены, что хотите удалить товар из каталога?")) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
    }
  };

  // Массовое изменение цен на процент (например +5% или -5%)
  const handleBulkPriceAdjust = (percentage: number) => {
    if (confirm(`Изменить все цены продажи на ${percentage > 0 ? "+" : ""}${percentage}%?`)) {
      setProducts((prev) =>
        prev.map((p) => {
          const newPrice = Math.round(p.basePrice * (1 + percentage / 100));
          return { ...p, basePrice: newPrice, lastUpdated: "только что" };
        })
      );
      setSaveSuccessMsg(`Все цены каталога скорректированы на ${percentage}%`);
      setTimeout(() => setSaveSuccessMsg(null), 3000);
    }
  };

  // Сводка по складу
  const stockSummary = useMemo(() => {
    const totalItems = products.reduce((sum, p) => sum + p.stockQuantity, 0);
    const totalInventoryValue = products.reduce((sum, p) => sum + p.stockQuantity * p.costPrice, 0);
    const lowStockCount = products.filter((p) => p.status === "low_stock" || p.status === "out_of_stock").length;
    return { totalItems, totalInventoryValue, lowStockCount };
  }, [products]);

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6 bg-slate-100 min-h-screen font-sans text-slate-900">
      {/* УВЕДОМЛЕНИЕ ОБ УСПЕШНОМ СОХРАНЕНИИ */}
      {saveSuccessMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-emerald-700 flex items-center gap-3 animate-in slide-in-from-bottom duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-semibold">{saveSuccessMsg}</span>
        </div>
      )}

      {/* ШАПКА АДМИН-ПАНЕЛИ */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-200 mb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 text-white text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Панель администратора absvers
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
            Управление магазином локеров
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Онлайн-редактирование цен, управление складскими остатками и обработка заявок
          </p>
        </div>

        {/* ПЕРЕКЛЮЧЕНИЕ ВКЛАДОК */}
        <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200">
          <button
            onClick={() => setActiveTab("products")}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
              activeTab === "products"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Boxes className="w-4 h-4 text-emerald-600" /> Каталог, цены и склад
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
              activeTab === "orders"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <ShoppingCart className="w-4 h-4 text-sky-600" /> Заявки и сметы
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* ВКЛАДКА 1: УПРАВЛЕНИЕ ТОВАРАМИ, ЦЕНАМИ И ОСТАТКАМИ */}
      {/* ======================================================== */}
      {activeTab === "products" && (
        <div>
          {/* KPI КАРТОЧКИ СКЛАДА И ЦЕН */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 font-medium block">Всего позиций</span>
                <span className="text-2xl font-bold text-slate-900 mt-1 block">{products.length} шт.</span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                <Package className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 font-medium block">Единиц на складе</span>
                <span className="text-2xl font-bold text-emerald-600 mt-1 block">
                  {stockSummary.totalItems} ед.
                </span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Boxes className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 font-medium block">Оценка склада (себест.)</span>
                <span className="text-2xl font-bold text-slate-900 mt-1 block">
                  {stockSummary.totalInventoryValue.toLocaleString("ru-RU")} ₽
                </span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 font-medium block">Требуют дозаказа</span>
                <span className="text-2xl font-bold text-amber-600 mt-1 block">
                  {stockSummary.lowStockCount} поз.
                </span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <AlertCircle className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* ПАНЕЛЬ УПРАВЛЕНИЯ ТОВАРАМИ */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-6 flex flex-col lg:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
              {/* Поиск */}
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Поиск по названию, артикулу, серии..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                />
              </div>

              {/* Фильтр категорий */}
              <div className="flex items-center gap-1.5 overflow-x-auto">
                {[
                  { id: "all", label: "Все товары" },
                  { id: "modular_lockers", label: "Шкафы АБС" },
                  { id: "locks", label: "Замки" },
                  { id: "accessories", label: "Аксессуары" },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setCategoryFilter(cat.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                      categoryFilter === cat.id
                        ? "bg-slate-900 text-white shadow-xs"
                        : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Быстрые действия */}
            <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-end">
              <button
                onClick={() => handleBulkPriceAdjust(5)}
                className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 transition"
                title="Увеличить все цены на 5%"
              >
                <Percent className="w-3.5 h-3.5 text-emerald-600" /> +5% к ценам
              </button>
              <button
                onClick={() => handleBulkPriceAdjust(-5)}
                className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 transition"
                title="Снизить все цены на 5%"
              >
                <Percent className="w-3.5 h-3.5 text-rose-600" /> -5% к ценам
              </button>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
              >
                <Plus className="w-4 h-4" /> Добавить товар
              </button>
            </div>
          </div>

          {/* ТАБЛИЦА ТОВАРОВ С РЕДАКТИРОВАНИЕМ В СТРОКЕ */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="p-4 pl-6">Артикул / Модель</th>
                    <th className="p-4">Категория / Габариты</th>
                    <th className="p-4">Цена продажи (₽)</th>
                    <th className="p-4">Себестоимость</th>
                    <th className="p-4">Остаток на складе</th>
                    <th className="p-4">Статус</th>
                    <th className="p-4 text-right pr-6">Действия</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProducts.map((p) => {
                    const isEditing = editingProductId === p.id;

                    return (
                      <tr key={p.id} className="hover:bg-slate-50/80 transition">
                        <td className="p-4 pl-6">
                          <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md inline-block mb-1">
                            {p.article}
                          </span>
                          {isEditing ? (
                            <input
                              type="text"
                              value={editFormData.name || ""}
                              onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                              className="w-full px-2 py-1 border border-slate-300 rounded text-xs outline-none"
                            />
                          ) : (
                            <span className="font-semibold text-slate-800 block">{p.name}</span>
                          )}
                          <span className="text-[10px] text-slate-400">Обновлено: {p.lastUpdated}</span>
                        </td>

                        <td className="p-4">
                          <span className="font-medium text-slate-700 block">{p.modelSeries}</span>
                          <span className="text-[11px] text-slate-400">{p.dimensions}</span>
                        </td>

                        {/* ЦЕНА ПРОДАЖИ С БЫСТРЫМ ИЗМЕНЕНИЕМ */}
                        <td className="p-4">
                          {isEditing ? (
                            <input
                              type="number"
                              value={editFormData.basePrice || 0}
                              onChange={(e) => setEditFormData({ ...editFormData, basePrice: Number(e.target.value) })}
                              className="w-24 px-2 py-1 border border-slate-300 rounded font-bold text-slate-900 outline-none"
                            />
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <input
                                type="number"
                                defaultValue={p.basePrice}
                                onBlur={(e) => handleQuickPriceChange(p.id, Number(e.target.value))}
                                className="w-24 px-2 py-1 bg-slate-50 hover:bg-white border border-slate-200 hover:border-slate-400 rounded font-bold text-emerald-700 outline-none transition"
                              />
                              <span className="text-slate-400">₽</span>
                            </div>
                          )}
                        </td>

                        {/* СЕБЕСТОИМОСТЬ */}
                        <td className="p-4">
                          {isEditing ? (
                            <input
                              type="number"
                              value={editFormData.costPrice || 0}
                              onChange={(e) => setEditFormData({ ...editFormData, costPrice: Number(e.target.value) })}
                              className="w-20 px-2 py-1 border border-slate-300 rounded text-slate-700 outline-none"
                            />
                          ) : (
                            <span className="text-slate-500 font-medium">{p.costPrice.toLocaleString("ru-RU")} ₽</span>
                          )}
                        </td>

                        {/* ОСТАТОК НА СКЛАДЕ С БЫСТРЫМ ИЗМЕНЕНИЕМ */}
                        <td className="p-4">
                          {isEditing ? (
                            <input
                              type="number"
                              value={editFormData.stockQuantity || 0}
                              onChange={(e) => setEditFormData({ ...editFormData, stockQuantity: Number(e.target.value) })}
                              className="w-20 px-2 py-1 border border-slate-300 rounded font-bold text-slate-900 outline-none"
                            />
                          ) : (
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                defaultValue={p.stockQuantity}
                                onBlur={(e) => handleQuickStockChange(p.id, Number(e.target.value))}
                                className="w-16 px-2 py-1 bg-slate-50 hover:bg-white border border-slate-200 hover:border-slate-400 rounded font-bold text-slate-800 text-center outline-none transition"
                              />
                              <span className="text-slate-400">шт.</span>
                              {p.reservedQuantity > 0 && (
                                <span className="text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded" title="В резерве под оплаченные заказы">
                                  рез: {p.reservedQuantity}
                                </span>
                              )}
                            </div>
                          )}
                        </td>

                        {/* СТАТУС НАЛИЧИЯ */}
                        <td className="p-4">
                          {p.status === "in_stock" && (
                            <span className="px-2 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md font-semibold text-[11px]">
                              В наличии
                            </span>
                          )}
                          {p.status === "low_stock" && (
                            <span className="px-2 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-md font-semibold text-[11px]">
                              Мало на складе
                            </span>
                          )}
                          {p.status === "out_of_stock" && (
                            <span className="px-2 py-1 bg-rose-50 text-rose-800 border border-rose-200 rounded-md font-semibold text-[11px]">
                              Под заказ
                            </span>
                          )}
                        </td>

                        {/* ДЕЙСТВИЯ */}
                        <td className="p-4 text-right pr-6">
                          {isEditing ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleSaveEdit(p.id)}
                                className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition"
                                title="Сохранить"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setEditingProductId(null)}
                                className="p-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg transition"
                                title="Отмена"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleStartEdit(p)}
                                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
                                title="Редактировать всё"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(p.id)}
                                className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition"
                                title="Удалить"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
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
        </div>
      )}

      {/* ======================================================== */}
      {/* ВКЛАДКА 2: УПРАВЛЕНИЕ ЗАЯВКАМИ И СМЕТАМИ */}
      {/* ======================================================== */}
      {activeTab === "orders" && (
        <div>
          {/* ТАБЛИЦА ЗАЯВОК */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="relative w-full md:w-96">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  placeholder="Поиск заявок по клиенту, номеру, телефону..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => alert("Реестр заявок выгружен в Excel")}
                  className="px-3 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" /> Экспорт заказов
                </button>
              </div>
            </div>

            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="p-4 pl-6">Номер / Дата</th>
                  <th className="p-4">Клиент / Компания</th>
                  <th className="p-4">Модель локера</th>
                  <th className="p-4">Ячеек</th>
                  <th className="p-4">Сумма (с НДС)</th>
                  <th className="p-4">Статус</th>
                  <th className="p-4 text-right pr-6">Карточка</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((ord) => {
                  const st = STATUS_CONFIG[ord.status];
                  return (
                    <tr key={ord.id} className="hover:bg-slate-50/80 transition">
                      <td className="p-4 pl-6">
                        <span className="font-bold text-slate-900 block font-mono">{ord.orderNumber}</span>
                        <span className="text-[11px] text-slate-400">{ord.createdAt}</span>
                      </td>
                      <td className="p-4">
                        <span className="font-semibold text-slate-800 block">{ord.client.name}</span>
                        <span className="text-[11px] text-slate-500">{ord.client.company || "Физ. лицо"}</span>
                      </td>
                      <td className="p-4">
                        <span className="font-medium text-slate-800">{ord.configuration.modelName.split(" ")[0]}</span>
                        <span className="text-[11px] text-slate-500 block">{ord.configuration.lockType}</span>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-1 bg-slate-100 rounded-md font-bold text-slate-700">
                          {ord.configuration.totalCells} шт
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="font-bold text-emerald-700 text-sm block">
                          {ord.pricing.totalPrice.toLocaleString("ru-RU")} ₽
                        </span>
                      </td>
                      <td className="p-4">
                        <select
                          value={ord.status}
                          onChange={(e) => {
                            const newStatus = e.target.value as OrderStatus;
                            setOrders((prev) => prev.map((o) => (o.id === ord.id ? { ...o, status: newStatus } : o)));
                          }}
                          className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold outline-none cursor-pointer ${st.bg} ${st.text} ${st.border}`}
                        >
                          <option value="new">Новая заявка</option>
                          <option value="in_progress">В обработке</option>
                          <option value="kp_sent">КП отправлено</option>
                          <option value="paid">Оплачен</option>
                          <option value="completed">Выполнен</option>
                          <option value="cancelled">Отменен</option>
                        </select>
                      </td>
                      <td className="p-4 text-right pr-6">
                        <button
                          onClick={() => setSelectedOrder(ord)}
                          className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs inline-flex items-center gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5" /> Просмотр
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* МОДАЛЬНОЕ ОКНО ДОБАВЛЕНИЯ НОВОГО ТОВАРА */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 md:p-8">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-5">
              <h3 className="text-xl font-bold text-slate-900">Добавить товар в каталог</h3>
              <p className="text-xs text-slate-500 mt-1">Новая модель шкафа, тип замка или комплект фурнитуры</p>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Артикул *</label>
                  <input
                    type="text"
                    required
                    placeholder="ABS-T382-NEW"
                    value={newProduct.article}
                    onChange={(e) => setNewProduct({ ...newProduct, article: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Категория</label>
                  <select
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="modular_lockers">Шкафы АБС</option>
                    <option value="locks">Замки</option>
                    <option value="accessories">Аксессуары</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Наименование позиции *</label>
                <input
                  type="text"
                  required
                  placeholder="Шкаф АБС Т-382 (5 ярусов / Камера хранения)"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Цена продажи (₽) *</label>
                  <input
                    type="number"
                    required
                    placeholder="5400"
                    value={newProduct.basePrice || ""}
                    onChange={(e) => setNewProduct({ ...newProduct, basePrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Себестоимость (₽)</label>
                  <input
                    type="number"
                    placeholder="2800"
                    value={newProduct.costPrice || ""}
                    onChange={(e) => setNewProduct({ ...newProduct, costPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Остаток на складе (шт)</label>
                  <input
                    type="number"
                    placeholder="25"
                    value={newProduct.stockQuantity || ""}
                    onChange={(e) => setNewProduct({ ...newProduct, stockQuantity: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Мин. остаток (алерт)</label>
                  <input
                    type="number"
                    placeholder="10"
                    value={newProduct.minStockAlert || ""}
                    onChange={(e) => setNewProduct({ ...newProduct, minStockAlert: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition"
                >
                  Сохранить товар в каталог
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
