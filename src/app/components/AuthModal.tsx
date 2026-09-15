"use client";

import React, { useState, useEffect } from "react";
import { 
  X, 
  Phone, 
  Building2, 
  User, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  KeyRound, 
  RefreshCw, 
  Sparkles,
  Mail,
  AlertCircle
} from "lucide-react";
import { useAuth, UserProfile } from "../context/AuthContext";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (user: UserProfile) => void;
}

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const { login } = useAuth();
  
  // Tabs: 'individual' (Физлицо / Частный клиент) | 'company' (Юрлицо / B2B)
  const [accountType, setAccountType] = useState<"individual" | "company">("individual");
  
  // Step: 1 = Phone / Data Entry, 2 = SMS Code Verification
  const [step, setStep] = useState<1 | 2>(1);
  
  // Form fields
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [inn, setInn] = useState("");
  
  // SMS code verification
  const [smsCode, setSmsCode] = useState("");
  const [expectedCode, setExpectedCode] = useState("1234");
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  
  // UI states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Timer countdown for resending code
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 2 && countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      setCanResend(true);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  // Reset form on open/close
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setSmsCode("");
      setErrorMessage(null);
      setCountdown(60);
      setCanResend(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Phone input mask helper: +7 (XXX) XXX-XX-XX
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.startsWith("7") || val.startsWith("8")) {
      val = val.substring(1);
    }
    val = val.substring(0, 10);

    let formatted = "+7";
    if (val.length > 0) {
      formatted += " (" + val.substring(0, 3);
    }
    if (val.length >= 3) {
      formatted += ") " + val.substring(3, 6);
    }
    if (val.length >= 6) {
      formatted += "-" + val.substring(6, 8);
    }
    if (val.length >= 8) {
      formatted += "-" + val.substring(8, 10);
    }

    setPhone(formatted);
    setErrorMessage(null);
  };

  // Step 1: Send SMS
  const handleSendCode = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanDigits = phone.replace(/\D/g, "");
    
    if (cleanDigits.length < 11) {
      setErrorMessage("Пожалуйста, введите корректный номер телефона (10 цифр)");
      return;
    }

    if (!name.trim()) {
      setErrorMessage("Пожалуйста, укажите ваше имя или название контакта");
      return;
    }

    if (accountType === "company" && !companyName.trim()) {
      setErrorMessage("Пожалуйста, укажите название компании или ИП");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    // Simulate sending SMS / WhatsApp OTP
    setTimeout(() => {
      // Generate a mock 4-digit code for demonstration
      const mockCode = Math.floor(1000 + Math.random() * 9000).toString();
      setExpectedCode(mockCode);
      setStep(2);
      setCountdown(60);
      setCanResend(false);
      setIsSubmitting(false);
    }, 600);
  };

  // Step 2: Verify SMS and complete Login
  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (smsCode.length < 4) {
      setErrorMessage("Введите 4-значный код подтверждения");
      return;
    }

    // Check code (or allow 1234 as universal master demo code)
    if (smsCode !== expectedCode && smsCode !== "1234") {
      setErrorMessage("Неверный код подтверждения. Попробуйте ещё раз");
      return;
    }

    setIsSubmitting(true);

    const userProfile: UserProfile = {
      id: `usr-${Date.now().toString(36)}`,
      phone,
      name: name.trim(),
      email: email.trim() || undefined,
      type: accountType,
      companyName: accountType === "company" ? companyName.trim() : undefined,
      inn: accountType === "company" && inn ? inn.trim() : undefined,
    };

    setTimeout(() => {
      login(userProfile);
      setIsSubmitting(false);
      if (onSuccess) {
        onSuccess(userProfile);
      }
      onClose();
    }, 500);
  };

  const handleResendCode = () => {
    if (!canResend) return;
    const mockCode = Math.floor(1000 + Math.random() * 9000).toString();
    setExpectedCode(mockCode);
    setCountdown(60);
    setCanResend(false);
    setSmsCode("");
    setErrorMessage(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with gradient & branding */}
        <div className="bg-gradient-to-r from-[#1B4965] to-[#144B6E] text-white p-6 sm:p-7 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white flex items-center justify-center transition"
            aria-label="Закрыть"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8BC34A]/20 border border-[#8BC34A]/30 text-[#8BC34A] text-xs font-bold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Личный кабинет ABS VERS
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            {step === 1 ? "Вход и регистрация" : "Подтверждение номера"}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            {step === 1 
              ? "Управляйте заказами, сметами и 3D-проектами в одном месте" 
              : `Код отправлен на номер ${phone}`
            }
          </p>
        </div>

        <div className="p-6 sm:p-7">
          {/* STEP 1: Phone and Info */}
          {step === 1 && (
            <form onSubmit={handleSendCode} className="space-y-4">
              {/* Type Switcher: Individual / B2B */}
              <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl gap-1">
                <button
                  type="button"
                  onClick={() => setAccountType("individual")}
                  className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-1.5 ${
                    accountType === "individual"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span>Физлицо / Клуб</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAccountType("company")}
                  className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-1.5 ${
                    accountType === "company"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  <span>Компания / B2B</span>
                </button>
              </div>

              {/* Phone Field */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Номер телефона <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    required
                    placeholder="+7 (999) 000-00-00"
                    value={phone}
                    onChange={handlePhoneChange}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:border-[#1B4965] focus:ring-2 focus:ring-[#1B4965]/20 outline-none transition"
                  />
                </div>
              </div>

              {/* Name Field */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Ваше имя или контактное лицо <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Александр Иванов"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:border-[#1B4965] focus:ring-2 focus:ring-[#1B4965]/20 outline-none transition"
                  />
                </div>
              </div>

              {/* B2B Extra Fields */}
              {accountType === "company" && (
                <div className="space-y-4 pt-1 animate-in fade-in duration-200">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Название организации / ИП <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        required
                        placeholder="ООО «Фитнес Арена» или ИП Смирнов"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:border-[#1B4965] focus:ring-2 focus:ring-[#1B4965]/20 outline-none transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      ИНН (для автоматического выставления счетов)
                    </label>
                    <input
                      type="text"
                      maxLength={12}
                      placeholder="7701234567"
                      value={inn}
                      onChange={(e) => setInn(e.target.value.replace(/\D/g, ""))}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:border-[#1B4965] focus:ring-2 focus:ring-[#1B4965]/20 outline-none transition"
                    />
                  </div>
                </div>
              )}

              {/* Email (Optional) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Email <span className="text-slate-400 font-normal">(для отправки документов и счетов)</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    placeholder="director@fitarena.ru"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:border-[#1B4965] focus:ring-2 focus:ring-[#1B4965]/20 outline-none transition"
                  />
                </div>
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-5 bg-[#8BC34A] hover:bg-[#7CB342] text-slate-950 font-black text-sm rounded-xl shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 mt-2"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Отправка SMS...</span>
                  </>
                ) : (
                  <>
                    <span>Получить код подтверждения</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-[11px] text-center text-slate-400 leading-tight">
                Нажимая кнопку, вы соглашаетесь с условиями оферты и обработкой персональных данных.
              </div>
            </form>
          )}

          {/* STEP 2: SMS Verification Code */}
          {step === 2 && (
            <form onSubmit={handleVerifyCode} className="space-y-5 animate-in fade-in duration-200">
              {/* Notification Banner with Demo Code */}
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs text-emerald-900">
                  <p className="font-bold">Тестовый SMS-код отправлен!</p>
                  <p className="mt-0.5">
                    Используйте код: <span className="font-mono font-black text-sm text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">{expectedCode}</span> (или универсальный <span className="font-mono font-bold">1234</span>).
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 text-center">
                  Введите 4-значный код из SMS
                </label>
                <div className="relative max-w-[200px] mx-auto">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    maxLength={4}
                    autoFocus
                    required
                    placeholder="0000"
                    value={smsCode}
                    onChange={(e) => {
                      setSmsCode(e.target.value.replace(/\D/g, ""));
                      setErrorMessage(null);
                    }}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border-2 border-slate-300 rounded-2xl text-center text-2xl font-black tracking-widest text-slate-900 focus:bg-white focus:border-[#1B4965] focus:ring-4 focus:ring-[#1B4965]/10 outline-none transition"
                  />
                </div>
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Verify Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-5 bg-[#8BC34A] hover:bg-[#7CB342] text-slate-950 font-black text-sm rounded-xl shadow-md hover:shadow-lg transition flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Проверка кода...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Войти в личный кабинет</span>
                  </>
                )}
              </button>

              {/* Timer & Resend / Change Phone */}
              <div className="flex flex-col items-center justify-center gap-2 text-xs text-slate-500 pt-2 border-t border-slate-100">
                {canResend ? (
                  <button
                    type="button"
                    onClick={handleResendCode}
                    className="text-[#1B4965] font-bold hover:underline flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Отправить код повторно</span>
                  </button>
                ) : (
                  <span>Отправить код повторно через {countdown} сек.</span>
                )}

                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-slate-400 hover:text-slate-700 underline text-[11px]"
                >
                  Изменить номер телефона
                </button>
              </div>
            </form>
          )}

          {/* Security note */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-slate-400 text-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Безопасная авторизация без пароля</span>
          </div>
        </div>
      </div>
    </div>
  );
}
