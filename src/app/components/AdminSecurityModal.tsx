"use client";

import React, { useState } from "react";
import { 
  Lock, 
  KeyRound, 
  User, 
  Key, 
  Save, 
  X, 
  CheckCircle2, 
  AlertCircle,
  ShieldAlert,
  RotateCcw
} from "lucide-react";
import { useAdminAuth } from "../context/AdminAuthContext";

interface AdminSecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminSecurityModal({ isOpen, onClose }: AdminSecurityModalProps) {
  const { adminCredentials, updateAdminCredentials } = useAdminAuth();

  const [newLogin, setNewLogin] = useState<string>(adminCredentials.login);
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [newPin, setNewPin] = useState<string>(adminCredentials.pinCode);
  const [confirmPin, setConfirmPin] = useState<string>("");
  
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    // Validation
    if (!newLogin.trim()) {
      setStatusMessage({ type: "error", text: "Логин не может быть пустым." });
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      setStatusMessage({ type: "error", text: "Новый пароль и подтверждение не совпадают." });
      return;
    }

    if (newPin && newPin.length !== 4 && newPin.length !== 6) {
      setStatusMessage({ type: "error", text: "PIN-код должен состоять из 4 или 6 цифр." });
      return;
    }

    if (newPin && confirmPin && newPin !== confirmPin) {
      setStatusMessage({ type: "error", text: "Новый PIN-код и подтверждение не совпадают." });
      return;
    }

    // Perform update
    const result = updateAdminCredentials({
      login: newLogin,
      password: newPassword ? newPassword : adminCredentials.passwordHash,
      pinCode: newPin ? newPin : adminCredentials.pinCode,
    });

    if (result.success) {
      setStatusMessage({ type: "success", text: result.message });
      setNewPassword("");
      setConfirmPassword("");
      setConfirmPin("");
      setTimeout(() => {
        onClose();
        setStatusMessage(null);
      }, 1500);
    } else {
      setStatusMessage({ type: "error", text: result.message });
    }
  };

  const handleResetToDefaults = () => {
    setNewLogin("Admin");
    setNewPassword("Admin");
    setConfirmPassword("Admin");
    setNewPin("1234");
    setConfirmPin("1234");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 sm:p-8 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
          <div className="w-12 h-12 rounded-2xl bg-[#1B4965] text-[#8BC34A] flex items-center justify-center shrink-0 shadow-md">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Безопасность и пароли админки</h3>
            <p className="text-xs text-slate-500">Смена логина, мастер-пароля и быстрого PIN-кода доступа</p>
          </div>
        </div>

        {/* Status Alerts */}
        {statusMessage && (
          <div
            className={`mb-5 p-3 rounded-xl flex items-center gap-2.5 text-xs font-semibold ${
              statusMessage.type === "success"
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                : "bg-rose-50 text-rose-800 border border-rose-200"
            }`}
          >
            {statusMessage.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSave} className="space-y-4">
          {/* Section 1: Login */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Логин администратора
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={newLogin}
                onChange={(e) => setNewLogin(e.target.value)}
                placeholder="Admin"
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-[#1B4965] focus:bg-white transition"
              />
            </div>
          </div>

          {/* Section 2: Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Новый пароль
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Оставьте пустым, если не меняете"
                  className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#1B4965] focus:bg-white transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Повтор пароля
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Повторите пароль"
                  className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#1B4965] focus:bg-white transition"
                />
              </div>
            </div>
          </div>

          {/* Section 3: PIN-code */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Новый PIN-код (4 или 6 цифр)
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  maxLength={6}
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ""))}
                  placeholder="1234"
                  className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold outline-none focus:ring-2 focus:ring-[#1B4965] focus:bg-white transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Повтор PIN-кода
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  maxLength={6}
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ""))}
                  placeholder="1234"
                  className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold outline-none focus:ring-2 focus:ring-[#1B4965] focus:bg-white transition"
                />
              </div>
            </div>
          </div>

          {/* Reset Helper */}
          <div className="pt-2 flex justify-between items-center text-xs">
            <button
              type="button"
              onClick={handleResetToDefaults}
              className="text-slate-400 hover:text-slate-600 flex items-center gap-1 transition"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Сбросить на заводские (Admin / 1234)</span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 px-4 rounded-xl bg-[#1B4965] hover:bg-slate-900 text-white font-bold text-xs shadow-md flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <Save className="w-4 h-4 text-[#8BC34A]" />
              <span>Сохранить изменения</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
