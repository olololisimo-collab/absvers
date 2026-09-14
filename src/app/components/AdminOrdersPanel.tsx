"use client";

import React, { useState, useMemo } from "react";
import { 
  Inbox, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  PhoneCall, 
  FileText, 
  Download, 
  Calendar, 
  Eye, 
  X, 
  Building2, 
  Mail, 
  Phone, 
  Layers,
  ChevronDown,
  TrendingUp,
  PackageCheck,
  CircleDollarSign,
  AlertCircle
} from "lucide-react";

// --- ТИПЫ ДАННЫХ ЗАЯВКИ ---
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
    modelId: string; // T-382XXL, T-382L, T-382M
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

// --- ДЕМО-ДАННЫЕ ЗАЯВОК (ДЛЯ ТЕСТИРОВАНИЯ И РАЗРАБОТКИ) ---
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
      cellColorsBreakdown: { "0_0": "sun-yellow", "0_1": "sky-blue", "1_0": "sky-blue", "1_1": "sun-yellow" },
    },
    pricing: {
      basePrice: 51200,
      locksPrice: 19200,
      extrasPrice: 7900,
      totalPrice: 78300,
      vatAmount: 13050,
    },
    status: "new",
    managerComment: "Клиент планирует оснастить 2 раздевалки по 6 таких блоков (всего 12 блоков). Требуется КП с монтажом.",
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
      cellColorsBreakdown: { "0_0": "sun-yellow", "1_0": "pearl-grey", "2_0": "sun-yellow" },
    },
    pricing: {
      basePrice: 40500,
      locksPrice: 11250,
      extrasPrice: 2310,
      totalPrice: 54060,
      vatAmount: 9010,
    },
    status: "kp_sent",
    managerComment: "КП отправлено на email директора. Закупка по 44-ФЗ.",
  },
  {
    id: "ord-103",
    orderNumber: "ABS-2026-0040",
    createdAt: "2026-09-13 17:40",
    client: {
      name: "Дмитрий Власов",
      phone: "+7 (905) 777-12-34",
      email: "d.vlasov@aquapark-wave.ru",
      company: "Аквапарк «Волна»",
      city: "Казань",
    },
    configuration: {
      modelId: "T-382L",
      modelName: "T-382L (2 яруса / Фитнес-Спорт)",
      columnsCount: 6,
      tiersCount: 2,
      totalCells: 12,
      dimensions: "2292 × 1940 × 500 мм",
      lockType: "Электронный RFID (браслеты/карты)",
      accessories: ["Дверной карман-органайзер", "Влагозащитный цоколь"],
      cellColorsBreakdown: { "0_0": "royal-blue", "0_1": "royal-blue" },
    },
    pricing: {
      basePrice: 76800,
      locksPrice: 28800,
      extrasPrice: 5700,
      totalPrice: 111300,
      vatAmount: 18550,
    },
    status: "paid",
    managerComment: "Счет оплачен. Передано на производство. Отгрузка запланирована на 22 сентября.",
  },
];

// --- ЦВЕТА СТАТУСОВ ---
const STATUS_CONFIG: Record<OrderStatus, { label: string; bg: string; text: string; border: string }> = {
  new: { label: "Новая заявка", bg: "bg-amber-50", text: "text-amber-800", border: "border-amber-200" },
  in_progress: { label: "В обработке", bg: "bg-sky-50", text: "text-sky-800", border: "border-sky-200" },
  kp_sent: { label: "КП отправлено", bg: "bg-blue-50", text: "text-blue-800", border: "border-blue-200" },
  paid: { label: "Оплачен (В производстве)", bg: "bg-emerald-50", text: "text-emerald-800", border: "border-emerald-200" },
  completed: { label: "Выполнен / Отгружен", bg: "bg-purple-50", text: "text-purple-800", border: "border-purple-200" },
  cancelled: { label: "Отменен", bg: "bg-rose-50", text: "text-rose-800", border: "border-rose-200" },
};

export default function AdminOrdersPanel() {
  const [orders, setOrders] = useState<OrderItem[]>(INITIAL_ORDERS);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);

  // Фильтрация и поиск
  const filteredOrders = useMemo(() => {
    return orders.filter((ord) => {
      const matchesStatus = statusFilter === "all" || ord.status === statusFilter;
      const q = searchQuery.toLowerCase();
      const matchesQuery = 
        ord.orderNumber.toLowerCase().includes(q) ||
        ord.client.name.toLowerCase().includes(q) ||
        ord.client.phone.includes(q) ||
        ord.client.email.toLowerCase().includes(q) ||
        (ord.client.company && ord.client.company.toLowerCase().includes(q));

      return matchesStatus && matchesQuery;
    });
  }, [orders, statusFilter, searchQuery]);

  // Сводная статистика
  const stats = useMemo(() => {
    const totalRevenue = orders.reduce((sum, o) => sum + (o.status === "paid" || o.status === "completed" ? o.pricing.totalPrice : 0), 0);
    const newCount = orders.filter((o) => o.status === "new").length;
    const inWorkCount = orders.filter((o) => o.status === "in_progress" || o.status === "kp_sent").length;
    const totalPotential = orders.reduce((sum, o) => sum + o.pricing.totalPrice, 0);

    return { totalRevenue, newCount, inWorkCount, totalPotential };
  }, [orders]);

  // Изменение статуса заказа
  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    setOrders((prev) =>
      prev.map((ord) => (ord.id === orderId ? { ...ord, status: newStatus } : ord))
    );
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6 bg-slate-100 min-h-screen font-sans text-slate-900">
      {/* Шапка админ-панели */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-200 mb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 text-white text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Панель администратора absvers
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
            Управление заявками и расчётами
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Мониторинг заказов из онлайн-конфигуратора, смета, контакты B2B-клиентов
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => alert("Экспорт всех заявок в Excel (.XLSX) сформирован")}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-2 transition"
          >
            <Download className="w-4 h-4 text-emerald-400" /> Выгрузить в Excel
          </button>
        </div>
      </div>

      {/* КАРТОЧКИ КЛЮЧЕВЫХ ПОКАЗАТЕЛЕЙ (KPI) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium block">Новые заявки</span>
            <span className="text-2xl font-bold text-amber-600 mt-1 block">{stats.newCount} шт.</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium block">В работе / КП</span>
            <span className="text-2xl font-bold text-sky-600 mt-1 block">{stats.inWorkCount} шт.</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium block">Оплачено (Выручка)</span>
            <span className="text-2xl font-bold text-emerald-600 mt-1 block">
              {stats.totalRevenue.toLocaleString("ru-RU")} ₽
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CircleDollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium block">Общий пайплайн смет</span>
            <span className="text-2xl font-bold text-slate-900 mt-1 block">
              {stats.totalPotential.toLocaleString("ru-RU")} ₽
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* ПАНЕЛЬ ФИЛЬТРАЦИИ И ПОИСКА */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Поиск */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск по номеру, клиенту, телефону..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
          />
        </div>

        {/* Фильтр статуса */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs text-slate-500 font-medium whitespace-nowrap">Статус:</span>
          {["all", "new", "kp_sent", "paid", "completed"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                statusFilter === st
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              }`}
            >
              {st === "all" ? "Все заявки" : STATUS_CONFIG[st as OrderStatus]?.label || st}
            </button>
          ))}
        </div>
      </div>

      {/* ТАБЛИЦА ЗАЯВОК */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="p-4 pl-6">Заявка / Дата</th>
                <th className="p-4">Клиент / Компания</th>
                <th className="p-4">Конфигурация локеров</th>
                <th className="p-4">Ячеек</th>
                <th className="p-4">Сумма (с НДС)</th>
                <th className="p-4">Статус</th>
                <th className="p-4 text-right pr-6">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    Заявок по заданным критериям не найдено
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => {
                  const st = STATUS_CONFIG[ord.status];
                  return (
                    <tr key={ord.id} className="hover:bg-slate-50/80 transition group">
                      <td className="p-4 pl-6">
                        <span className="font-bold text-slate-900 block font-mono">{ord.orderNumber}</span>
                        <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3" /> {ord.createdAt}
                        </span>
                      </td>

                      <td className="p-4">
                        <span className="font-semibold text-slate-800 block">{ord.client.name}</span>
                        {ord.client.company && (
                          <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <Building2 className="w-3 h-3" /> {ord.client.company} ({ord.client.city || "РФ"})
                          </span>
                        )}
                        <span className="text-[11px] text-slate-400 block mt-0.5 font-mono">
                          {ord.client.phone}
                        </span>
                      </td>

                      <td className="p-4">
                        <span className="font-medium text-slate-800 block">{ord.configuration.modelName.split(" ")[0]}</span>
                        <span className="text-[11px] text-slate-500 block">
                          {ord.configuration.columnsCount} секц. × {ord.configuration.tiersCount} яр. • {ord.configuration.lockType}
                        </span>
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
                        <span className="text-[10px] text-slate-400">НДС: {ord.pricing.vatAmount.toLocaleString("ru-RU")} ₽</span>
                      </td>

                      <td className="p-4">
                        <select
                          value={ord.status}
                          onChange={(e) => handleStatusChange(ord.id, e.target.value as OrderStatus)}
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
                          className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs inline-flex items-center gap-1.5 transition"
                        >
                          <Eye className="w-3.5 h-3.5" /> Карточка
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ДЕТАЛЬНАЯ МОДАЛКА ПРОСМОТРА ЗАЯВКИ */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 md:p-8 overflow-y-auto max-h-[90vh]">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Заголовок */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-6">
              <div>
                <span className="text-xs font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
                  {selectedOrder.orderNumber}
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-1">Детализация проекта шкафа</h3>
                <span className="text-xs text-slate-400">Дата создания: {selectedOrder.createdAt}</span>
              </div>
            </div>

            {/* Данные клиента */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 mb-6">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-3">
                Информация о заказчике:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block">Контактное лицо:</span>
                  <span className="font-bold text-slate-800 text-sm">{selectedOrder.client.name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Компания / Клуб:</span>
                  <span className="font-semibold text-slate-800">{selectedOrder.client.company || "Частное лицо"}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Телефон:</span>
                  <a href={`tel:${selectedOrder.client.phone}`} className="font-bold text-emerald-700 hover:underline flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" /> {selectedOrder.client.phone}
                  </a>
                </div>
                <div>
                  <span className="text-slate-400 block">Email:</span>
                  <a href={`mailto:${selectedOrder.client.email}`} className="font-bold text-sky-700 hover:underline flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5" /> {selectedOrder.client.email}
                  </a>
                </div>
              </div>
            </div>

            {/* Спецификация оборудования */}
            <div className="space-y-4 mb-6 text-xs">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Спецификация модулей:
              </span>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <span className="text-slate-400 block">Модель:</span>
                  <span className="font-bold text-slate-800">{selectedOrder.configuration.modelName.split(" ")[0]}</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <span className="text-slate-400 block">Размеры блока:</span>
                  <span className="font-bold text-slate-800">{selectedOrder.configuration.dimensions}</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <span className="text-slate-400 block">Количество ячеек:</span>
                  <span className="font-bold text-emerald-700">{selectedOrder.configuration.totalCells} шт</span>
                </div>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="text-slate-400 block mb-1">Установленные замки:</span>
                <span className="font-semibold text-slate-800">{selectedOrder.configuration.lockType}</span>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="text-slate-400 block mb-1">Опции и аксессуары:</span>
                <ul className="list-disc pl-4 space-y-0.5 text-slate-700 font-medium">
                  {selectedOrder.configuration.accessories.map((acc, i) => (
                    <li key={i}>{acc}</li>
                  ))}
                </ul>
              </div>

              {selectedOrder.managerComment && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                  <span className="text-amber-800 font-bold block mb-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> Примечание менеджера:
                  </span>
                  <p className="text-amber-900">{selectedOrder.managerComment}</p>
                </div>
              )}
            </div>

            {/* Финансовый блок */}
            <div className="bg-slate-900 text-white p-5 rounded-2xl mb-6">
              <div className="flex justify-between items-baseline mb-2">
                <span className="text-xs text-slate-400">Итоговая сумма контракта:</span>
                <span className="text-2xl font-bold text-emerald-400">
                  {selectedOrder.pricing.totalPrice.toLocaleString("ru-RU")} ₽
                </span>
              </div>
              <div className="text-xs text-slate-400 flex justify-between border-t border-slate-800 pt-2">
                <span>В том числе НДС 20%:</span>
                <span>{selectedOrder.pricing.vatAmount.toLocaleString("ru-RU")} ₽</span>
              </div>
            </div>

            {/* Кнопки действий менеджера */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <a
                href={`tel:${selectedOrder.client.phone}`}
                className="py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition"
              >
                <PhoneCall className="w-4 h-4" /> Позвонить клиенту
              </a>
              <button
                onClick={() => alert(`Счет и договор на сумму ${selectedOrder.pricing.totalPrice.toLocaleString('ru-RU')} ₽ сгенерированы в PDF`)}
                className="py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-2 transition"
              >
                <FileText className="w-4 h-4 text-emerald-400" /> Выставить счёт (PDF)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
