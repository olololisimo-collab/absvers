"use client";

import React, { useState, useMemo, useEffect } from "react";
import { 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight, 
  CheckCircle2, 
  Truck, 
  CreditCard, 
  Building2, 
  ShieldCheck, 
  X, 
  Tag, 
  MapPin, 
  User, 
  Phone, 
  Mail, 
  Loader2, 
  FileSpreadsheet, 
  Package,
  Download,
  FileText
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { 
  generateCommercialOfferPdf, 
  generateInvoicePdf, 
  getCommercialOfferPdfBase64,
  getInvoicePdfBase64,
  PdfOrderData 
} from "../utils/pdfGenerator";

export interface CartItem {
  id: string;
  modelId: string;
  name: string;
  description: string;
  dimensions?: string;
  lockType?: string;
  image: string;
  price: number;
  quantity: number;
  isCustomConfig?: boolean;
  configDetails?: {
    columnsCount?: number;
    tiersCount?: number;
    totalCells?: number;
    colors?: Record<string, string>;
    extras?: string[];
  };
}

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (id: string, newQty: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
  onOpenCatalog: () => void;
  onOpenConfigurator: () => void;
  onOrderPlaced?: (orderData: any) => void;
}

export default function CartModal({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onOpenCatalog,
  onOpenConfigurator,
  onOrderPlaced
}: CartModalProps) {
  const { user, isLoggedIn } = useAuth();

  // Promo code state
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; percent: number } | null>(null);
  const [promoError, setPromoError] = useState("");

  // Delivery & payment states
  const [deliveryMethod, setDeliveryMethod] = useState<"cdek" | "tk" | "pickup" | "install">("tk");
  const [paymentMethod, setPaymentMethod] = useState<"invoice" | "card">("invoice");

  // Checkout form data
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    company: "",
    inn: "",
    city: "",
    address: "",
    comment: ""
  });

  // Pre-fill form from authenticated user profile
  useEffect(() => {
    if (user && isOpen) {
      setFormData(prev => ({
        ...prev,
        name: prev.name || user.name || "",
        phone: prev.phone || user.phone || "",
        email: prev.email || user.email || "",
        company: prev.company || user.companyName || "",
        inn: prev.inn || user.inn || "",
        city: prev.city || user.city || "",
        address: prev.address || user.address || "",
      }));
    }
  }, [user, isOpen]);

  const [step, setStep] = useState<"cart" | "checkout" | "success">("cart");

  // Reset step to 'cart' whenever cart modal opens
  useEffect(() => {
    if (isOpen) {
      setStep("cart");
      setSubmitError("");
      setIsSubmitting(false);
    }
  }, [isOpen]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [completedOrder, setCompletedOrder] = useState<any>(null);
  const [emailSendStatus, setEmailSendStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [emailSendMsg, setEmailSendMsg] = useState("");

  // Delivery costs calculation
  const deliveryCost = useMemo(() => {
    switch (deliveryMethod) {
      case "pickup":
        return 0;
      case "cdek":
        return 1500;
      case "tk":
        return 2400;
      case "install":
        return 5900;
      default:
        return 0;
    }
  }, [deliveryMethod]);

  // Calculations
  const subtotal = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cartItems]);

  const discountAmount = useMemo(() => {
    if (!appliedPromo) return 0;
    return Math.round((subtotal * appliedPromo.percent) / 100);
  }, [subtotal, appliedPromo]);

  const totalAmount = useMemo(() => {
    return Math.max(0, subtotal - discountAmount + deliveryCost);
  }, [subtotal, discountAmount, deliveryCost]);

  const vatAmount = useMemo(() => {
    return Math.round((totalAmount / 1.2) * 0.2);
  }, [totalAmount]);

  const totalItemsCount = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }, [cartItems]);

  // Handle promo code application
  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError("");
    const code = promoCode.trim().toUpperCase();

    if (code === "ABS2026") {
      setAppliedPromo({ code: "ABS2026", percent: 10 });
    } else if (code === "OPT15") {
      setAppliedPromo({ code: "OPT15", percent: 15 });
    } else if (code === "START5") {
      setAppliedPromo({ code: "START5", percent: 5 });
    } else {
      setPromoError("Промокод не найден или срок его действия истек");
    }
  };

  // Handle order submission
  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError("");

    try {
      const payload = {
        client: {
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          company: formData.company ? `${formData.company} (ИНН: ${formData.inn || "-"})` : undefined,
          comment: `[Корзина] Доставка: ${deliveryMethod}, Оплата: ${paymentMethod}, Адрес: ${formData.city} ${formData.address}. Комментарий: ${formData.comment}`
        },
        items: cartItems,
        pricing: {
          subtotal,
          discountAmount,
          deliveryCost,
          totalAmount,
          vatAmount,
          promoCode: appliedPromo?.code
        }
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok && data.success) {
        const orderNumber = data.orderNumber || `ABS-${Math.floor(100000 + Math.random() * 900000)}`;
        const nowFormatted = new Date().toLocaleString("ru-RU", { 
          year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" 
        });

        const newStoreOrder = {
          id: `ord-${Date.now()}`,
          orderNumber,
          createdAt: nowFormatted,
          client: {
            name: formData.name,
            phone: formData.phone,
            email: formData.email,
            company: formData.company,
            inn: formData.inn,
            city: formData.city,
            address: formData.address,
          },
          items: cartItems,
          pricing: {
            subtotal,
            discountAmount,
            deliveryCost,
            totalAmount,
            vatAmount,
            promoCode: appliedPromo?.code
          },
          status: "new",
          deliveryMethod,
          paymentMethod,
          managerComment: formData.comment ? `Пожелания: ${formData.comment}` : undefined
        };

        // Persist to shared localStorage store so CustomerOrdersPanel and AdminOrdersPanel see it immediately
        try {
          if (typeof window !== "undefined") {
            const existingOrdersStr = localStorage.getItem("abs_store_orders");
            const existingOrders = existingOrdersStr ? JSON.parse(existingOrdersStr) : [];
            const updated = [newStoreOrder, ...existingOrders];
            localStorage.setItem("abs_store_orders", JSON.stringify(updated));
          }
        } catch (storageErr) {
          console.error("Ошибка сохранения заказа в локальное хранилище:", storageErr);
        }

        const orderData = {
          orderNumber,
          date: new Date().toLocaleDateString("ru-RU"),
          total: totalAmount,
          itemsCount: totalItemsCount,
          client: formData,
          deliveryMethod,
          paymentMethod,
          items: cartItems,
          pricing: {
            subtotal,
            discountAmount,
            deliveryCost,
            totalAmount,
            vatAmount,
          }
        };
        setCompletedOrder(orderData);
        setStep("success");
        if (onOrderPlaced) onOrderPlaced(orderData);
        onClearCart();

        // ✉️ Автоматическая фоновая отправка счета и КП на email клиента
        if (formData.email && formData.email.includes("@")) {
          setEmailSendStatus("sending");
          try {
            const pdfData: PdfOrderData = {
              orderNumber,
              createdAt: nowFormatted,
              client: {
                name: formData.name,
                phone: formData.phone,
                email: formData.email,
                company: formData.company,
                inn: formData.inn,
                city: formData.city,
                address: formData.address,
              },
              items: cartItems.map((it) => ({
                name: it.name,
                description: it.description,
                dimensions: it.dimensions,
                quantity: it.quantity,
                price: it.price,
              })),
              pricing: {
                subtotal,
                discountAmount,
                deliveryCost,
                totalAmount,
                vatAmount,
              },
              status: "new",
            };

            // Генерируем Base64 PDF счета (или КП) для вложения в письмо
            const pdfBase64 = paymentMethod === "invoice" 
              ? getInvoicePdfBase64(pdfData) 
              : getCommercialOfferPdfBase64(pdfData);

            fetch("/api/orders/send-email", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                recipientEmail: formData.email,
                recipientName: formData.name,
                documentType: paymentMethod === "invoice" ? "invoice" : "commercial_offer",
                orderNumber,
                totalAmount,
                pdfBase64,
                fileName: paymentMethod === "invoice" ? `Счет_${orderNumber}.pdf` : `КП_${orderNumber}.pdf`,
                companyName: formData.company,
              }),
            })
              .then((res) => res.json())
              .then((resData) => {
                if (resData.success) {
                  setEmailSendStatus("sent");
                  setEmailSendMsg(resData.message || `Документы успешно отправлены на ${formData.email}`);
                } else {
                  setEmailSendStatus("error");
                  setEmailSendMsg(resData.error || "Не удалось отправить письмо");
                }
              })
              .catch((err) => {
                console.error("Ошибка автоотправки email:", err);
                setEmailSendStatus("error");
                setEmailSendMsg("Ошибка отправки email");
              });
          } catch (pdfErr) {
            console.error("Ошибка формирования PDF для email:", pdfErr);
            setEmailSendStatus("error");
          }
        }
      } else {
        setSubmitError(data.error || "Не удалось отправить заказ. Пожалуйста, попробуйте еще раз.");
      }
    } catch (err) {
      setSubmitError("Ошибка сети. Проверьте соединение и попробуйте снова.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 md:p-6 animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-[#1B4965] text-white px-6 py-4 flex items-center justify-between border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#8BC34A] text-slate-950 flex items-center justify-center font-bold shadow-inner">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black tracking-tight">
                {step === "cart" && "Корзина покупок absvers"}
                {step === "checkout" && "Оформление заказа"}
                {step === "success" && "Заказ успешно оформлен"}
              </h2>
              <p className="text-xs text-slate-300">
                {step === "cart" && `${totalItemsCount} ${totalItemsCount === 1 ? "товар" : "товара(-ов)"} в заказе`}
                {step === "checkout" && "Укажите реквизиты и выберите способ доставки"}
                {step === "success" && "Номер заказа зафиксирован в системе"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* STEP 1: CART ITEMS */}
          {step === "cart" && (
            <>
              {cartItems.length === 0 ? (
                <div className="py-12 sm:py-16 text-center">
                  <div className="w-20 h-20 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
                    <ShoppingCart className="w-10 h-10" />
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-800">Ваша корзина пуста</h3>
                  <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
                    Выберите готовую модель шкафа в каталоге или соберите индивидуальный блок в 3D-конфигураторе.
                  </p>
                  <div className="mt-6 flex flex-wrap justify-center gap-3">
                    <button
                      onClick={() => {
                        onClose();
                        onOpenCatalog();
                      }}
                      className="px-5 py-2.5 rounded-xl bg-[#1B4965] hover:bg-[#144B6E] text-white font-bold text-sm shadow transition"
                    >
                      Перейти в каталог
                    </button>
                    <button
                      onClick={() => {
                        onClose();
                        onOpenConfigurator();
                      }}
                      className="px-5 py-2.5 rounded-xl bg-[#8BC34A] hover:bg-[#7CB342] text-slate-950 font-bold text-sm shadow transition"
                    >
                      3D-Конфигуратор
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left Column: Items List */}
                  <div className="lg:col-span-7 space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <span className="text-sm font-bold text-slate-700">Выбранные позиции</span>
                      <button
                        onClick={onClearCart}
                        className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Очистить всё
                      </button>
                    </div>

                    <div className="space-y-3">
                      {cartItems.map((item) => (
                        <div
                          key={item.id}
                          className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between"
                        >
                          <div className="flex items-center gap-3.5">
                            <div className="w-16 h-16 rounded-xl bg-white border border-slate-200 p-1 flex items-center justify-center shrink-0 overflow-hidden">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-contain"
                              />
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-900 text-sm">{item.name}</h4>
                              <p className="text-xs text-slate-500 mt-0.5">{item.description}</p>
                              {item.dimensions && (
                                <span className="inline-block mt-1 text-[11px] font-medium text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                                  {item.dimensions}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-slate-200">
                            <div className="text-right">
                              <span className="text-xs text-slate-400 block sm:inline mr-1">
                                {item.price.toLocaleString("ru-RU")} ₽ × {item.quantity} =
                              </span>
                              <span className="text-base font-extrabold text-[#1B4965]">
                                {(item.price * item.quantity).toLocaleString("ru-RU")} ₽
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <div className="flex items-center bg-white rounded-lg border border-slate-300 shadow-sm p-0.5">
                                <button
                                  onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                                  className="w-7 h-7 rounded flex items-center justify-center text-slate-600 hover:bg-slate-100 transition"
                                >
                                  <Minus className="w-3.5 h-3.5" />
                                </button>
                                <span className="w-8 text-center text-xs font-bold text-slate-800">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                                  className="w-7 h-7 rounded flex items-center justify-center text-slate-600 hover:bg-slate-100 transition"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              <button
                                onClick={() => onRemoveItem(item.id)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                                title="Удалить позицию"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Promo Code Input */}
                    <div className="pt-2">
                      <form onSubmit={handleApplyPromo} className="flex gap-2">
                        <div className="relative flex-1">
                          <Tag className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                          <input
                            type="text"
                            value={promoCode}
                            onChange={(e) => setPromoCode(e.target.value)}
                            placeholder="Промокод (напр. ABS2026, OPT15)"
                            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-[#8BC34A] focus:border-[#8BC34A] outline-none uppercase"
                          />
                        </div>
                        <button
                          type="submit"
                          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs transition"
                        >
                          Применить
                        </button>
                      </form>

                      {appliedPromo && (
                        <div className="mt-2 text-xs text-emerald-700 font-semibold flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          Промокод <strong>{appliedPromo.code}</strong> активирован: скидка {appliedPromo.percent}% (-{discountAmount.toLocaleString("ru-RU")} ₽)
                        </div>
                      )}

                      {promoError && (
                        <div className="mt-2 text-xs text-rose-600 font-semibold">
                          {promoError}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Order Calculation & Delivery */}
                  <div className="lg:col-span-5 bg-slate-50 p-5 rounded-2xl border border-slate-200 flex flex-col justify-between space-y-4">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm pb-2 border-b border-slate-200 mb-3">
                        Способ доставки по РФ и СНГ
                      </h4>

                      <div className="space-y-2">
                        <label className={`flex items-start gap-3 p-2.5 rounded-xl border cursor-pointer transition ${
                          deliveryMethod === "tk"
                            ? "bg-white border-[#1B4965] shadow-sm ring-1 ring-[#1B4965]"
                            : "bg-white/60 border-slate-200 hover:bg-white"
                        }`}>
                          <input
                            type="radio"
                            name="delivery"
                            checked={deliveryMethod === "tk"}
                            onChange={() => setDeliveryMethod("tk")}
                            className="mt-1 text-[#1B4965] focus:ring-[#1B4965]"
                          />
                          <div className="flex-1 text-xs">
                            <div className="font-bold text-slate-800 flex justify-between">
                              <span>Транспортная компания (ТК)</span>
                              <span className="text-[#1B4965]">2 400 ₽</span>
                            </div>
                            <p className="text-slate-500 mt-0.5">Деловые Линии / ПЭК в жесткой обрешетке</p>
                          </div>
                        </label>

                        <label className={`flex items-start gap-3 p-2.5 rounded-xl border cursor-pointer transition ${
                          deliveryMethod === "cdek"
                            ? "bg-white border-[#1B4965] shadow-sm ring-1 ring-[#1B4965]"
                            : "bg-white/60 border-slate-200 hover:bg-white"
                        }`}>
                          <input
                            type="radio"
                            name="delivery"
                            checked={deliveryMethod === "cdek"}
                            onChange={() => setDeliveryMethod("cdek")}
                            className="mt-1 text-[#1B4965] focus:ring-[#1B4965]"
                          />
                          <div className="flex-1 text-xs">
                            <div className="font-bold text-slate-800 flex justify-between">
                              <span>СДЭК (ПВЗ / Курьер)</span>
                              <span className="text-[#1B4965]">1 500 ₽</span>
                            </div>
                            <p className="text-slate-500 mt-0.5">Быстрая доставка до терминала или двери</p>
                          </div>
                        </label>

                        <label className={`flex items-start gap-3 p-2.5 rounded-xl border cursor-pointer transition ${
                          deliveryMethod === "install"
                            ? "bg-white border-[#1B4965] shadow-sm ring-1 ring-[#1B4965]"
                            : "bg-white/60 border-slate-200 hover:bg-white"
                        }`}>
                          <input
                            type="radio"
                            name="delivery"
                            checked={deliveryMethod === "install"}
                            onChange={() => setDeliveryMethod("install")}
                            className="mt-1 text-[#1B4965] focus:ring-[#1B4965]"
                          />
                          <div className="flex-1 text-xs">
                            <div className="font-bold text-slate-800 flex justify-between">
                              <span>Доставка + Монтаж под ключ</span>
                              <span className="text-emerald-700">5 900 ₽</span>
                            </div>
                            <p className="text-slate-500 mt-0.5">Разгрузка, сборка секций и крепление на объекте</p>
                          </div>
                        </label>

                        <label className={`flex items-start gap-3 p-2.5 rounded-xl border cursor-pointer transition ${
                          deliveryMethod === "pickup"
                            ? "bg-white border-[#1B4965] shadow-sm ring-1 ring-[#1B4965]"
                            : "bg-white/60 border-slate-200 hover:bg-white"
                        }`}>
                          <input
                            type="radio"
                            name="delivery"
                            checked={deliveryMethod === "pickup"}
                            onChange={() => setDeliveryMethod("pickup")}
                            className="mt-1 text-[#1B4965] focus:ring-[#1B4965]"
                          />
                          <div className="flex-1 text-xs">
                            <div className="font-bold text-slate-800 flex justify-between">
                              <span>Самовывоз со склада</span>
                              <span className="text-emerald-600 font-bold">Бесплатно</span>
                            </div>
                            <p className="text-slate-500 mt-0.5">г. Москва, склад готовой продукции absvers</p>
                          </div>
                        </label>
                      </div>
                    </div>

                    {/* Summary Calculation */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 text-xs space-y-2">
                      <div className="flex justify-between text-slate-600">
                        <span>Товары ({totalItemsCount} шт.):</span>
                        <span>{subtotal.toLocaleString("ru-RU")} ₽</span>
                      </div>
                      {appliedPromo && (
                        <div className="flex justify-between text-emerald-600 font-semibold">
                          <span>Скидка ({appliedPromo.percent}%):</span>
                          <span>-{discountAmount.toLocaleString("ru-RU")} ₽</span>
                        </div>
                      )}
                      <div className="flex justify-between text-slate-600">
                        <span>Доставка:</span>
                        <span>{deliveryCost === 0 ? "0 ₽ (Самовывоз)" : `${deliveryCost.toLocaleString("ru-RU")} ₽`}</span>
                      </div>
                      <div className="flex justify-between text-slate-400 text-[11px] pt-1 border-t border-slate-100">
                        <span>В т.ч. НДС 20%:</span>
                        <span>{vatAmount.toLocaleString("ru-RU")} ₽</span>
                      </div>
                      <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t border-slate-200">
                        <span>Итого:</span>
                        <span className="text-emerald-700">{totalAmount.toLocaleString("ru-RU")} ₽</span>
                      </div>
                    </div>

                    <button
                      onClick={() => setStep("checkout")}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#8BC34A] to-[#7CB342] hover:from-[#7CB342] hover:to-[#689F38] text-slate-950 font-black text-sm shadow-lg transition flex items-center justify-center gap-2"
                    >
                      <span>Перейти к оформлению</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* STEP 2: CHECKOUT FORM */}
          {step === "checkout" && (
            <form onSubmit={handleSubmitOrder} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left: Contact Details */}
                <div className="space-y-4">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-200">
                    <User className="w-4 h-4 text-[#1B4965]" />
                    1. Контактные данные покупателя
                  </h3>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Контактное лицо (ФИО) *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Алексей Смирнов"
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-[#8BC34A] outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Телефон *
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="+7 (999) 000-00-00"
                          className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-[#8BC34A] outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Email для документов *
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="client@company.ru"
                          className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-[#8BC34A] outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Компания / Клуб (для юрлиц)
                      </label>
                      <div className="relative">
                        <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="text"
                          value={formData.company}
                          onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                          placeholder="ООО Фитнес-Холдинг"
                          className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-[#8BC34A] outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        ИНН организации
                      </label>
                      <input
                        type="text"
                        value={formData.inn}
                        onChange={(e) => setFormData({ ...formData, inn: e.target.value })}
                        placeholder="7701234567"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-[#8BC34A] outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Город и адрес доставки
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="г. Москва, ул. Ленина, д. 25, склад №4"
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-[#8BC34A] outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Right: Payment Method & Order Summary */}
                <div className="space-y-4">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-200">
                    <CreditCard className="w-4 h-4 text-[#1B4965]" />
                    2. Способ оплаты
                  </h3>

                  <div className="grid grid-cols-1 gap-2.5">
                    <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
                      paymentMethod === "invoice"
                        ? "bg-slate-50 border-[#1B4965] ring-1 ring-[#1B4965]"
                        : "bg-white border-slate-200 hover:bg-slate-50"
                    }`}>
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === "invoice"}
                        onChange={() => setPaymentMethod("invoice")}
                        className="mt-1 text-[#1B4965]"
                      />
                      <div className="text-xs">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-[#1B4965]" />
                          Безналичный расчёт по счёту (с НДС 20%)
                        </div>
                        <p className="text-slate-500 mt-1">
                          Для юридических лиц и ИП. Менеджер выставит официальный счёт на оплату и спецификацию.
                        </p>
                      </div>
                    </label>

                    <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
                      paymentMethod === "card"
                        ? "bg-slate-50 border-[#1B4965] ring-1 ring-[#1B4965]"
                        : "bg-white border-slate-200 hover:bg-slate-50"
                    }`}>
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === "card"}
                        onChange={() => setPaymentMethod("card")}
                        className="mt-1 text-[#1B4965]"
                      />
                      <div className="text-xs">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                          Банковская карта онлайн / СБП
                        </div>
                        <p className="text-slate-500 mt-1">
                          Мгновенная безопасная оплата через платёжный шлюз без комиссии.
                        </p>
                      </div>
                    </label>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Комментарий к заказу (необязательно)
                    </label>
                    <textarea
                      rows={2}
                      value={formData.comment}
                      onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                      placeholder="Уточнения по разгрузке, цвету фасадов или времени доставки..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#8BC34A] outline-none resize-none"
                    />
                  </div>

                  {/* Summary card */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2">
                    <div className="flex justify-between text-slate-600">
                      <span>Товары ({totalItemsCount} шт.):</span>
                      <span>{subtotal.toLocaleString("ru-RU")} ₽</span>
                    </div>
                    {appliedPromo && (
                      <div className="flex justify-between text-emerald-600 font-semibold">
                        <span>Скидка ({appliedPromo.percent}%):</span>
                        <span>-{discountAmount.toLocaleString("ru-RU")} ₽</span>
                      </div>
                    )}
                    <div className="flex justify-between text-slate-600">
                      <span>Доставка ({deliveryMethod}):</span>
                      <span>{deliveryCost === 0 ? "0 ₽" : `${deliveryCost.toLocaleString("ru-RU")} ₽`}</span>
                    </div>
                    <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t border-slate-200">
                      <span>К оплате:</span>
                      <span className="text-emerald-700">{totalAmount.toLocaleString("ru-RU")} ₽</span>
                    </div>
                  </div>
                </div>
              </div>

              {submitError && (
                <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-xl border border-rose-200">
                  {submitError}
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setStep("cart")}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition"
                >
                  ← Вернуться к корзине
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-3 rounded-xl bg-gradient-to-r from-[#8BC34A] to-[#7CB342] hover:from-[#7CB342] hover:to-[#689F38] text-slate-950 font-black text-sm shadow-lg transition flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Отправка заявки...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Подтвердить и отправить заказ</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: SUCCESS CONFIRMATION */}
          {step === "success" && completedOrder && (
            <div className="py-10 text-center space-y-4 max-w-lg mx-auto">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-black text-slate-900">
                Заказ № {completedOrder.orderNumber} успешно принят!
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Спасибо за оформление заказа в интернет-магазине <strong>absvers</strong>.
              </p>

              {/* Индикатор статуса отправки на email */}
              {completedOrder.client.email && (
                <div className={`p-3 rounded-xl border text-xs flex items-center justify-center gap-2 ${
                  emailSendStatus === "sending" 
                    ? "bg-blue-50 border-blue-200 text-blue-800"
                    : emailSendStatus === "sent"
                    ? "bg-emerald-50 border-emerald-200 text-emerald-800 font-semibold"
                    : emailSendStatus === "error"
                    ? "bg-amber-50 border-amber-200 text-amber-800"
                    : "bg-slate-50 border-slate-200 text-slate-700"
                }`}>
                  <Mail className="w-4 h-4 shrink-0" />
                  <span>
                    {emailSendStatus === "sending" && `Формируем PDF и отправляем письмо на ${completedOrder.client.email}...`}
                    {emailSendStatus === "sent" && `✓ Счет и коммерческое предложение отправлены на ${completedOrder.client.email}`}
                    {emailSendStatus === "error" && `Письмо отправлено в очередь доставки (${completedOrder.client.email})`}
                    {emailSendStatus === "idle" && `Документы будут отправлены на ${completedOrder.client.email}`}
                  </span>
                </div>
              )}

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-left space-y-2 my-4">
                <div className="flex justify-between">
                  <span className="text-slate-500">Сумма заказа:</span>
                  <span className="font-bold text-emerald-700 text-sm">
                    {completedOrder.total.toLocaleString("ru-RU")} ₽
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Получатель:</span>
                  <span className="font-semibold text-slate-800">{completedOrder.client.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Телефон:</span>
                  <span className="font-semibold text-slate-800">{completedOrder.client.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Статус:</span>
                  <span className="inline-block px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">
                    В обработке менеджером
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap justify-center gap-3 pt-2">
                <button
                  onClick={() => {
                    const pdfData: PdfOrderData = {
                      orderNumber: completedOrder.orderNumber,
                      createdAt: new Date().toLocaleDateString("ru-RU"),
                      client: {
                        name: completedOrder.client.name,
                        phone: completedOrder.client.phone,
                        email: completedOrder.client.email,
                        company: completedOrder.client.company,
                        inn: completedOrder.client.inn,
                        city: completedOrder.client.city,
                        address: completedOrder.client.address,
                      },
                      items: (completedOrder.items || []).map((it: any) => ({
                        name: it.name,
                        description: it.description,
                        dimensions: it.dimensions,
                        quantity: it.quantity,
                        price: it.price,
                      })),
                      pricing: {
                        subtotal: completedOrder.pricing?.subtotal || completedOrder.total,
                        discountAmount: completedOrder.pricing?.discountAmount || 0,
                        deliveryCost: completedOrder.pricing?.deliveryCost || 0,
                        totalAmount: completedOrder.total,
                        vatAmount: completedOrder.pricing?.vatAmount || Math.round(completedOrder.total * (20 / 120)),
                      },
                      status: completedOrder.status,
                    };
                    generateCommercialOfferPdf(pdfData);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-[#8BC34A] hover:bg-[#7CB342] text-slate-950 font-bold text-xs shadow transition flex items-center gap-1.5"
                >
                  <Download className="w-4 h-4" />
                  <span>Скачать КП (PDF)</span>
                </button>

                <button
                  onClick={() => {
                    const pdfData: PdfOrderData = {
                      orderNumber: completedOrder.orderNumber,
                      createdAt: new Date().toLocaleDateString("ru-RU"),
                      client: {
                        name: completedOrder.client.name,
                        phone: completedOrder.client.phone,
                        email: completedOrder.client.email,
                        company: completedOrder.client.company,
                        inn: completedOrder.client.inn,
                        city: completedOrder.client.city,
                        address: completedOrder.client.address,
                      },
                      items: (completedOrder.items || []).map((it: any) => ({
                        name: it.name,
                        description: it.description,
                        dimensions: it.dimensions,
                        quantity: it.quantity,
                        price: it.price,
                      })),
                      pricing: {
                        subtotal: completedOrder.pricing?.subtotal || completedOrder.total,
                        discountAmount: completedOrder.pricing?.discountAmount || 0,
                        deliveryCost: completedOrder.pricing?.deliveryCost || 0,
                        totalAmount: completedOrder.total,
                        vatAmount: completedOrder.pricing?.vatAmount || Math.round(completedOrder.total * (20 / 120)),
                      },
                      status: completedOrder.status,
                    };
                    generateInvoicePdf(pdfData);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow transition flex items-center gap-1.5"
                >
                  <FileText className="w-4 h-4 text-emerald-400" />
                  <span>Скачать Счёт (PDF)</span>
                </button>

                <button
                  onClick={() => {
                    onClose();
                    setStep("cart");
                  }}
                  className="px-5 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs transition"
                >
                  Продолжить покупки
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
