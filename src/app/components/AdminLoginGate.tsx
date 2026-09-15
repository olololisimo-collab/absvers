"use client";

import React, { useState } from "react";
import { 
  Lock, 
  KeyRound, 
  User, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight,
  Sparkles,
  Key
} from "lucide-react";
import { useAdminAuth } from "../context/AdminAuthContext";

interface AdminLoginGateProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export default function AdminLoginGate({
  children,
  title = "Панель управления absvers",
  description = "Доступ к заказам, сметам и складскому учёту защищен. Авторизуйтесь под учетной записью администратора.",
}: AdminLoginGateProps) {
  const { isAdminAuthenticated, verifyCredentials, loginAdmin } = useAdminAuth();

  // Auth mode: 'pin' (4 digits) or 'password' (Login + Password)
  const [authMode, setAuthMode] = useState<"pin" | "password">("pin");

  // Form states
  const [pinInput, setPinInput] = useState<string>("");
  const [loginInput, setLoginInput] = useState<string>("");
  const [passwordInput, setPasswordInput] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccessAnim, setIsSuccessAnim] = useState<boolean>(false);

  // If already authenticated, render protected admin content
  if (isAdminAuthenticated) {
    return <>{children}</>;
  }

  // Handle PIN Submission
  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (verifyCredentials(pinInput)) {
      setIsSuccessAnim(true);
      setTimeout(() => {
        loginAdmin();
      }, 300);
    } else {
      setErrorMessage("Неверный PIN-код доступа. Попробуйте еще раз.");
      setPinInput("");
    }
  };

  // Handle Login/Password Submission
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!loginInput.trim() || !passwordInput) {
      setErrorMessage("Введите логин и пароль");
      return;
    }

    if (verifyCredentials(loginInput, passwordInput)) {
      setIsSuccessAnim(true);
      setTimeout(() => {
        loginAdmin();
      }, 300);
    } else {
      setErrorMessage("Неверный логин или пароль администратора.");
    }
  };

  // Quick PIN pad button click
  const handlePinPadClick = (digit: string) => {
    if (pinInput.length < 6) {
      const nextPin = pinInput + digit;
      setPinInput(nextPin);
      setErrorMessage(null);

      // Auto-submit on 4 digits if matches
      if (nextPin.length === 4 && verifyCredentials(nextPin)) {
        setIsSuccessAnim(true);
        setTimeout(() => {
          loginAdmin();
        }, 300);
      }
    }
  };

  const handlePinBackspace = () => {
    setPinInput((prev) => prev.slice(0, -1));
    setErrorMessage(null);
  };

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-md mx-auto">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden p-6 sm:p-8">
        {/* Header with logo & Lock icon */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-[#1B4965] text-[#8BC34A] flex items-center justify-center mx-auto mb-4 shadow-lg ring-4 ring-slate-100">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">{title}</h2>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">{description}</p>
        </div>

        {/* Tab switcher: PIN / Login+Password */}
        <div className="flex bg-slate-100 p-1 rounded-xl mb-6 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setAuthMode("pin");
              setErrorMessage(null);
            }}
            className={`flex-1 py-2 rounded-lg transition flex items-center justify-center gap-1.5 ${
              authMode === "pin"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Вход по PIN-коду</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode("password");
              setErrorMessage(null);
            }}
            className={`flex-1 py-2 rounded-lg transition flex items-center justify-center gap-1.5 ${
              authMode === "password"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Логин и Пароль</span>
          </button>
        </div>

        {/* Error notification */}
        {errorMessage && (
          <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2.5 text-xs text-rose-700 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Success animation */}
        {isSuccessAnim && (
          <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-center gap-2 text-xs text-emerald-800 font-bold animate-pulse">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Вход выполнен! Загрузка панели...</span>
          </div>
        )}

        {/* --- FORM 1: PIN CODE --- */}
        {authMode === "pin" && (
          <form onSubmit={handlePinSubmit} className="space-y-6">
            {/* PIN Indicator Dots */}
            <div className="flex justify-center gap-3 my-4">
              {[0, 1, 2, 3].map((idx) => {
                const filled = pinInput.length > idx;
                return (
                  <div
                    key={idx}
                    className={`w-4 h-4 rounded-full transition-all duration-200 ${
                      filled
                        ? "bg-[#1B4965] scale-110 shadow-sm"
                        : "bg-slate-200 border border-slate-300"
                    }`}
                  />
                );
              })}
            </div>

            {/* Custom Numeric PinPad */}
            <div className="grid grid-cols-3 gap-2.5 max-w-[260px] mx-auto">
              {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handlePinPadClick(num)}
                  className="h-12 rounded-2xl bg-slate-50 hover:bg-slate-100 active:bg-slate-200 text-slate-800 font-bold text-lg border border-slate-200/80 transition flex items-center justify-center cursor-pointer select-none"
                >
                  {num}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setPinInput("")}
                className="h-12 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-400 font-medium text-xs border border-slate-200/80 transition flex items-center justify-center cursor-pointer select-none"
              >
                Очистить
              </button>
              <button
                type="button"
                onClick={() => handlePinPadClick("0")}
                className="h-12 rounded-2xl bg-slate-50 hover:bg-slate-100 active:bg-slate-200 text-slate-800 font-bold text-lg border border-slate-200/80 transition flex items-center justify-center cursor-pointer select-none"
              >
                0
              </button>
              <button
                type="button"
                onClick={handlePinBackspace}
                className="h-12 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-600 font-medium text-sm border border-slate-200/80 transition flex items-center justify-center cursor-pointer select-none"
              >
                ⌫
              </button>
            </div>

            <button
              type="submit"
              disabled={pinInput.length === 0}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-[#1B4965] to-slate-900 hover:brightness-110 text-white font-bold text-sm rounded-2xl shadow-md flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-40"
            >
              <span>Подтвердить PIN</span>
              <ArrowRight className="w-4 h-4 text-[#8BC34A]" />
            </button>
          </form>
        )}

        {/* --- FORM 2: LOGIN + PASSWORD --- */}
        {authMode === "password" && (
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Логин администратора
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={loginInput}
                  onChange={(e) => setLoginInput(e.target.value)}
                  placeholder="Admin"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#1B4965] focus:bg-white transition"
                  autoFocus
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Пароль
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#1B4965] focus:bg-white transition"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-4 bg-gradient-to-r from-[#1B4965] to-slate-900 hover:brightness-110 text-white font-bold text-sm rounded-2xl shadow-md flex items-center justify-center gap-2 transition cursor-pointer mt-2"
            >
              <span>Войти в админ-панель</span>
              <ArrowRight className="w-4 h-4 text-[#8BC34A]" />
            </button>
          </form>
        )}

        {/* Footer info & defaults note */}
        <div className="mt-8 pt-4 border-t border-slate-100 text-center">
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Защищённый доступ ООО «АБС ВЕРС ТРЕЙДИНГ»</span>
          </div>
          <div className="mt-2 text-[10px] text-slate-400 bg-slate-50 p-2 rounded-lg border border-slate-100">
            По умолчанию: Логин: <code className="text-slate-700 font-bold">Admin</code>, Пароль: <code className="text-slate-700 font-bold">Admin</code>, PIN: <code className="text-slate-700 font-bold">1234</code>
          </div>
        </div>
      </div>
    </div>
  );
}
