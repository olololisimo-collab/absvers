"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  Package, 
  FileText, 
  Clock, 
  CheckCircle2, 
  Truck, 
  Building2, 
  Download, 
  Eye, 
  RotateCcw, 
  Search, 
  Sliders, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  ShieldCheck, 
  AlertCircle, 
  ArrowRight,
  Sparkles,
  ExternalLink,
  Layers,
  ChevronRight,
  LogIn,
  Save,
  Check
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { CartItem } from "./CartModal";

// Initial demo orders for fallback / testing
const DEMO_STORE_ORDERS = [
  {
    id: "ord-101",
    orderNumber: "ABS-2026-0042",
    createdAt: "2026-09-14 11:30",
    client: {
      name: "Александр Иванов",
      phone: "+7 (999) 000-00-00",
      email: "alex@fitarena.ru",
      company: "Фитнес-клуб «Арена»",
      inn: "7701234567",
      city: "Москва",
      address: "ул. Ленина, д. 25, блок А",
    },
    items: [
      {
        id: "item-1",
        modelId: "T-382L",
        name: "Модульный блок шкафов absvers Т-382L (2 яруса)",
        description: "4 колонки / 8 ячеек, цвет Синий/Желтый, электронный RFID-замок",
        dimensions: "1528 × 1940 × 500 мм",
        price: 78300,
        quantity: 1,
        image: "/images/card_t382l_ruby_red.png"
      }
    ],
    pricing: {
      subtotal: 78300,
      discountAmount: 7830,
      deliveryCost: 2400,
      totalAmount: 72870,
      vatAmount: 12145
    },
    status: "kp_sent" as const, // new | in_progress | kp_sent | paid | production | shipping | completed
    deliveryMethod: "tk",
    paymentMethod: "invoice",
    trackingNumber: "CDEK-9923841029",
    managerComment: "Согласовано КП со скидкой 10% и монтажом. Ожидаем оплату счета."
  },
  {
    id: "ord-102",
    orderNumber: "ABS-2026-0038",
    createdAt: "2026-09-10 16:45",
    client: {
      name: "Александр Иванов",
      phone: "+7 (999) 000-00-00",
      email: "alex@fitarena.ru",
      company: "Фитнес-клуб «Арена»",
      inn: "7701234567",
      city: "Москва",
      address: "ул. Ленина, д. 25, блок А",
    },
    items: [
      {
        id: "item-2",
        modelId: "T-382XXL",
        name: "Модульный шкаф absvers Т-382XXL (1 ярус)",
        description: "Односекционный шкаф полной высоты, цвет Синий",
        dimensions: "382 × 1940 × 500 мм",
        price: 18500,
        quantity: 2,
        image: "/images/card_t382xxl_royal_blue.png"
      }
    ],
    pricing: {
      subtotal: 37000,
      discountAmount: 0,
      deliveryCost: 1500,
      totalAmount: 38500,
      vatAmount: 6416
    },
    status: "production" as const,
    deliveryMethod: "cdek",
    paymentMethod: "card",
    trackingNumber: "CDEK-8812391024",
    managerComment: "Заказ запущен на производственной линии в Санкт-Петербурге. Плановая отгрузка 18 сентября."
  }
];

export interface CustomerOrdersPanelProps {
  onOpenConfigurator?: () => void;
  onOpenCatalog?: () => void;
  onRepeatOrder?: (item: CartItem) => void;
}

export default function CustomerOrdersPanel({
  onOpenConfigurator,
  onOpenCatalog,
  onRepeatOrder
}: CustomerOrdersPanelProps) {
  const { user, isLoggedIn, openAuthModal, updateProfile } = useAuth();

  // Active cabinet sub-tab: 'orders' | 'projects' | 'profile'
  const [cabinetTab, setCabinetTab] = useState<"orders" | "projects" | "profile">("orders");
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // B2B Profile Edit state
  const [profileForm, setProfileForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    companyName: user?.companyName || "",
    inn: user?.inn || "",
    kpp: user?.kpp || "",
    city: user?.city || "",
    address: user?.address || ""
  });
  const [isSavedToast, setIsSavedToast] = useState(false);

  // Sync profileForm when user loads/changes
  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || "",
        email: user.email || "",
        companyName: user.companyName || "",
        inn: user.inn || "",
        kpp: user.kpp || "",
        city: user.city || "",
        address: user.address || ""
      });
    }
  }, [user]);

  // Read orders from localStorage with fallback
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("abs_store_orders");
        if (stored) {
          setOrders(JSON.parse(stored));
        } else {
          // Initialize with demo orders
          localStorage.setItem("abs_store_orders", JSON.stringify(DEMO_STORE_ORDERS));
          setOrders(DEMO_STORE_ORDERS);
        }
      }
    } catch (e) {
      console.error("Ошибка загрузки заказов:", e);
      setOrders(DEMO_STORE_ORDERS);
    }
  }, []);

  // Filter orders for the current user by phone digits
  const userOrders = useMemo(() => {
    if (!isLoggedIn || !user?.phone) {
      // If not logged in, show sample or empty
      return [];
    }

    const cleanUserPhone = user.phone.replace(/\D/g, "");

    return orders.filter((order) => {
      const orderPhoneDigits = (order.client?.phone || "").replace(/\D/g, "");
      // Match if last 10 digits are identical or contains demo phone
      return (
        orderPhoneDigits.endsWith(cleanUserPhone.slice(-10)) ||
        cleanUserPhone.endsWith(orderPhoneDigits.slice(-10)) ||
        cleanUserPhone.includes("0000000") // Demo match
      );
    });
  }, [orders, user, isLoggedIn]);

  // Filtered list by status and search
  const filteredOrders = useMemo(() => {
    return userOrders.filter((ord) => {
      const matchesStatus = statusFilter === "all" || ord.status === statusFilter;
      const matchesSearch = 
        ord.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (ord.items?.[0]?.name || "").toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [userOrders, statusFilter, searchQuery]);

  // Status badge helper
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "new":
        return { label: "Новая заявка", bg: "bg-blue-50 text-blue-700 border-blue-200", icon: Clock };
      case "in_progress":
        return { label: "В обработке", bg: "bg-amber-50 text-amber-800 border-amber-200", icon: Clock };
      case "kp_sent":
        return { label: "КП отправлено", bg: "bg-purple-50 text-purple-700 border-purple-200", icon: FileText };
      case "paid":
        return { label: "Оплачен", bg: "bg-emerald-50 text-emerald-800 border-emerald-200", icon: CheckCircle2 };
      case "production":
        return { label: "В производстве", bg: "bg-indigo-50 text-indigo-700 border-indigo-200", icon: Package };
      case "shipping":
        return { label: "В доставке", bg: "bg-cyan-50 text-cyan-800 border-cyan-200", icon: Truck };
      case "completed":
        return { label: "Завершен", bg: "bg-slate-100 text-slate-800 border-slate-300", icon: CheckCircle2 };
      default:
        return { label: status, bg: "bg-slate-100 text-slate-700 border-slate-200", icon: Clock };
    }
  };

  // Profile save handler
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(profileForm);
    setIsSavedToast(true);
    setTimeout(() => setIsSavedToast(false), 3000);
  };

  // Mock download PDF
  const handleDownloadDoc = (type: "kp" | "invoice", orderNumber: string) => {
    alert(`Формирование и скачивание документа: ${type === "kp" ? "Коммерческое предложение (КП)" : "Официальный счет на оплату"} для заказа ${orderNumber} в формате PDF...`);
  };

  // If user is not logged in, show Invitation Screen
  if (!isLoggedIn) {
    return (
      <div className="py-12 px-4 sm:px-6 max-w-4xl mx-auto text-center">
        <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-slate-200">
          <div className="w-16 h-16 rounded-2xl bg-[#1B4965] text-[#8BC34A] flex items-center justify-center mx-auto mb-6 shadow-md">
            <User className="w-8 h-8" />
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8BC34A]/20 border border-[#8BC34A]/40 text-slate-900 text-xs font-bold mb-4">
            <Sparkles className="w-3.5 h-3.5 text-[#7CB342]" />
            Кабинет клиента ABS VERS
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-[#1B4965] tracking-tight">
            Войдите, чтобы увидеть историю ваших заказов и КП
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
            Авторизуйтесь по номеру телефона, чтобы отслеживать статус производства шкафов, скачивать официальные счета с НДС 20%, коммерческие предложения и сохранять 3D-проекты.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={openAuthModal}
              className="px-8 py-3.5 rounded-xl bg-[#8BC34A] hover:bg-[#7CB342] text-slate-950 font-black text-sm shadow-md hover:shadow-lg transition flex items-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              <span>Войти по номеру телефона</span>
            </button>

            {onOpenCatalog && (
              <button
                onClick={onOpenCatalog}
                className="px-6 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition"
              >
                Вернуться в каталог
              </button>
            )}
          </div>

          {/* Quick perks preview */}
          <div className="mt-12 pt-8 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
            <div className="flex gap-3 items-start">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shrink-0">
                1
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Мгновенные счета и КП</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Скачивайте PDF-документы прямо из карточки заказа в 1 клик.</p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-[#1B4965] flex items-center justify-center font-bold shrink-0">
                2
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Онлайн-трекинг</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Отслеживайте каждый этап: от сборки в цеху до доставки СДЭК.</p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold shrink-0">
                3
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Сохраненные 3D-сборки</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Возвращайтесь к своим расчетам и делитесь ссылками с коллегами.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner with User Card & Stats */}
      <div className="bg-gradient-to-r from-[#1B4965] via-[#144B6E] to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#8BC34A] text-slate-950 font-black text-2xl flex items-center justify-center shadow-inner shrink-0">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-black tracking-tight">{user.name}</h2>
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider ${
                  user.type === "company" 
                    ? "bg-indigo-500/30 text-indigo-200 border border-indigo-400/30" 
                    : "bg-[#8BC34A]/20 text-[#8BC34A] border border-[#8BC34A]/40"
                }`}>
                  {user.type === "company" ? "Оптовый B2B Клиент" : "Частный покупатель"}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 flex items-center gap-3 flex-wrap">
                <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-[#8BC34A]" /> {user.phone}</span>
                {user.email && <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-slate-400" /> {user.email}</span>}
                {user.companyName && <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5 text-indigo-300" /> {user.companyName}</span>}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {onOpenConfigurator && (
              <button
                onClick={onOpenConfigurator}
                className="px-4 py-2.5 rounded-xl bg-[#8BC34A] hover:bg-[#7CB342] text-slate-950 font-black text-xs sm:text-sm transition flex items-center gap-2 shadow-sm"
              >
                <Sliders className="w-4 h-4" />
                <span>Новый 3D-расчет</span>
              </button>
            )}
          </div>
        </div>

        {/* Sub-Tabs Navigation inside Profile */}
        <div className="mt-8 pt-4 border-t border-white/10 flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setCabinetTab("orders")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 whitespace-nowrap ${
              cabinetTab === "orders"
                ? "bg-white text-slate-900 shadow-md"
                : "text-slate-200 hover:text-white hover:bg-white/10"
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Мои заказы ({userOrders.length})</span>
          </button>

          <button
            onClick={() => setCabinetTab("projects")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 whitespace-nowrap ${
              cabinetTab === "projects"
                ? "bg-white text-slate-900 shadow-md"
                : "text-slate-200 hover:text-white hover:bg-white/10"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Сохраненные 3D-проекты</span>
          </button>

          <button
            onClick={() => setCabinetTab("profile")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 whitespace-nowrap ${
              cabinetTab === "profile"
                ? "bg-white text-slate-900 shadow-md"
                : "text-slate-200 hover:text-white hover:bg-white/10"
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Реквизиты и адрес</span>
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: ORDERS LIST */}
      {cabinetTab === "orders" && (
        <div className="space-y-4">
          {/* Controls: Search & Filters */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Поиск по номеру заказа..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-[#1B4965]/20 outline-none"
              />
            </div>

            <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
              {[
                { id: "all", label: "Все" },
                { id: "kp_sent", label: "КП отправлено" },
                { id: "production", label: "В производстве" },
                { id: "shipping", label: "В доставке" },
                { id: "completed", label: "Завершены" }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                    statusFilter === tab.id
                      ? "bg-[#1B4965] text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Orders List Cards */}
          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 text-center border border-slate-200">
              <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-700">Заказы не найдены</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                {userOrders.length === 0 
                  ? "У вас пока нет оформленных заказов. Соберите комплект шкафов в конфигураторе!" 
                  : "По заданному фильтру ничего не найдено."
                }
              </p>
              {onOpenConfigurator && (
                <button
                  onClick={onOpenConfigurator}
                  className="mt-4 px-5 py-2.5 bg-[#8BC34A] hover:bg-[#7CB342] text-slate-950 font-bold text-xs rounded-xl shadow transition inline-flex items-center gap-2"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  Перейти в 3D-конфигуратор
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => {
                const badge = getStatusBadge(order.status);
                const BadgeIcon = badge.icon;
                const isSelected = selectedOrder?.id === order.id;

                return (
                  <div
                    key={order.id}
                    className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition overflow-hidden"
                  >
                    {/* Header line of Order Card */}
                    <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/50">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="font-mono font-black text-base text-[#1B4965]">
                          {order.orderNumber}
                        </span>
                        <span className="text-xs text-slate-400">от {order.createdAt}</span>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${badge.bg}`}>
                          <BadgeIcon className="w-3.5 h-3.5" />
                          {badge.label}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400">Итого:</span>
                        <span className="text-lg font-black text-slate-900">
                          {(order.pricing?.totalAmount || order.total || 0).toLocaleString("ru-RU")} ₽
                        </span>
                      </div>
                    </div>

                    {/* Order Body / Composition */}
                    <div className="p-4 sm:p-5">
                      <div className="space-y-3">
                        {order.items?.map((item: any, idx: number) => (
                          <div key={idx} className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 p-1 flex items-center justify-center shrink-0">
                                <img
                                  src={item.image || "/images/card_t382l_ruby_red.png"}
                                  alt={item.name}
                                  className="w-full h-full object-contain"
                                />
                              </div>
                              <div>
                                <h4 className="text-sm font-bold text-slate-900">{item.name}</h4>
                                <p className="text-xs text-slate-500">{item.description}</p>
                                {item.dimensions && (
                                  <span className="inline-block mt-0.5 text-[10px] text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded font-mono">
                                    {item.dimensions}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="text-right shrink-0">
                              <span className="text-xs font-bold text-slate-900 block">
                                {item.quantity} шт.
                              </span>
                              <span className="text-xs text-slate-500">
                                {(item.price * item.quantity).toLocaleString("ru-RU")} ₽
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Manager Note or Tracking Banner */}
                      {order.managerComment && (
                        <div className="mt-4 p-3 bg-amber-50/70 border border-amber-200/60 rounded-xl flex items-start gap-2.5 text-xs text-amber-900">
                          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold">Комментарий менеджера:</span> {order.managerComment}
                          </div>
                        </div>
                      )}

                      {order.trackingNumber && (
                        <div className="mt-3 p-3 bg-cyan-50 border border-cyan-200 rounded-xl flex items-center justify-between text-xs text-cyan-900">
                          <div className="flex items-center gap-2">
                            <Truck className="w-4 h-4 text-cyan-700" />
                            <span>Трек-номер отправления: <strong className="font-mono text-cyan-950">{order.trackingNumber}</strong></span>
                          </div>
                          <a
                            href={`https://www.cdek.ru/ru/tracking?order_id=${order.trackingNumber}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-bold text-cyan-800 hover:underline flex items-center gap-1"
                          >
                            <span>Где посылка?</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      )}

                      {/* Actions: Download Docs & Details */}
                      <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            onClick={() => handleDownloadDoc("kp", order.orderNumber)}
                            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 transition"
                            title="Скачать официальное коммерческое предложение с расчетом сметы"
                          >
                            <Download className="w-3.5 h-3.5 text-purple-600" />
                            <span>Скачать КП (PDF)</span>
                          </button>

                          <button
                            onClick={() => handleDownloadDoc("invoice", order.orderNumber)}
                            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 transition"
                            title="Скачать официальный счет на оплату с НДС 20%"
                          >
                            <FileText className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Счет на оплату (PDF)</span>
                          </button>
                        </div>

                        <div className="flex items-center gap-2">
                          {onRepeatOrder && order.items?.[0] && (
                            <button
                              onClick={() => {
                                onRepeatOrder(order.items[0]);
                                alert(`Позиция «${order.items[0].name}» добавлена в корзину!`);
                              }}
                              className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1.5 transition"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Повторить заказ</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 2: SAVED 3D PROJECTS */}
      {cabinetTab === "projects" && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-extrabold text-[#1B4965]">Ваши сохраненные 3D-конфигурации</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Проекты и сметы, сформированные в интерактивном конфигураторе локеров.
              </p>
            </div>
            {onOpenConfigurator && (
              <button
                onClick={onOpenConfigurator}
                className="px-4 py-2 bg-[#8BC34A] hover:bg-[#7CB342] text-slate-950 font-bold text-xs rounded-xl transition flex items-center gap-1.5"
              >
                <Sliders className="w-3.5 h-3.5" />
                Собрать новый блок
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Sample Saved Project */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                    Фитнес-раздевалка (мужская)
                  </span>
                  <span className="text-xs text-slate-400">14 сентября 2026</span>
                </div>
                <h4 className="text-sm font-extrabold text-slate-900">Блок 4 секции absvers Т-382L (8 ячеек)</h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Электронные RFID-замки с браслетами, цвет фасадов: Морской бриз + Солнечный желтый. Влагозащитный цоколь.
                </p>
                <div className="mt-3 text-base font-black text-[#1B4965]">
                  78 300 ₽ <span className="text-xs font-normal text-slate-400">(с НДС 20%)</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between gap-2">
                <button
                  onClick={onOpenConfigurator}
                  className="px-3 py-1.5 bg-[#1B4965] hover:bg-[#144B6E] text-white text-xs font-bold rounded-lg transition flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Открыть в 3D</span>
                </button>
                <button
                  onClick={() => alert("Ссылка на проект скопирована в буфер обмена: https://absvers-shop.vercel.app/configurator?share=abs-2026")}
                  className="text-xs text-slate-500 hover:text-slate-800 font-semibold"
                >
                  Поделиться ссылкой
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: B2B COMPANY PROFILE & REQUISITES */}
      {cabinetTab === "profile" && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div>
            <h3 className="text-lg font-extrabold text-[#1B4965]">Реквизиты организации и адрес доставки</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Данные используются для автоматического заполнения договоров, счетов на оплату и накладных доставки.
            </p>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4 max-w-2xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Контактное лицо
                </label>
                <input
                  type="text"
                  required
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-[#1B4965]/20 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Электронная почта (Email)
                </label>
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  placeholder="director@company.ru"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-[#1B4965]/20 outline-none"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <h4 className="text-xs font-black text-indigo-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Building2 className="w-4 h-4" />
                Реквизиты юридического лица / ИП (B2B)
              </h4>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Название компании или ИП
                  </label>
                  <input
                    type="text"
                    value={profileForm.companyName}
                    onChange={(e) => setProfileForm({ ...profileForm, companyName: e.target.value })}
                    placeholder="ООО «Фитнес Арена» или ИП Иванов А. С."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-[#1B4965]/20 outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      ИНН (10 или 12 цифр)
                    </label>
                    <input
                      type="text"
                      maxLength={12}
                      value={profileForm.inn}
                      onChange={(e) => setProfileForm({ ...profileForm, inn: e.target.value.replace(/\D/g, "") })}
                      placeholder="7701234567"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-[#1B4965]/20 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      КПП (для юрлиц)
                    </label>
                    <input
                      type="text"
                      maxLength={9}
                      value={profileForm.kpp}
                      onChange={(e) => setProfileForm({ ...profileForm, kpp: e.target.value.replace(/\D/g, "") })}
                      placeholder="770101001"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-[#1B4965]/20 outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#8BC34A]" />
                Адрес доставки и разгрузки
              </h4>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-1">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Город
                    </label>
                    <input
                      type="text"
                      value={profileForm.city}
                      onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                      placeholder="г. Москва"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-[#1B4965]/20 outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Улица, дом, склад, этаж
                    </label>
                    <input
                      type="text"
                      value={profileForm.address}
                      onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                      placeholder="ул. Ленина, д. 25, 2 этаж (служебный вход)"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-[#1B4965]/20 outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 flex items-center gap-3">
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-[#1B4965] hover:bg-[#144B6E] text-white font-bold text-xs sm:text-sm shadow-md transition flex items-center gap-2"
              >
                <Save className="w-4 h-4 text-[#8BC34A]" />
                <span>Сохранить реквизиты</span>
              </button>

              {isSavedToast && (
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 animate-in fade-in">
                  <Check className="w-4 h-4" />
                  <span>Реквизиты успешно обновлены!</span>
                </div>
              )}
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
