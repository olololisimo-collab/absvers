"use client";

import React, { useState } from "react";
import { 
  ShoppingBag, 
  Sliders, 
  Menu, 
  X, 
  PhoneCall, 
  FileText, 
  Layers, 
  ShieldCheck, 
  Truck,
  FileSpreadsheet,
  Settings,
  UserCheck,
  LogIn,
  LogOut,
  Building2,
  FolderHeart,
  Lock
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useAdminAuth } from "../context/AdminAuthContext";

interface MobileNavigationProps {
  activeTab: "catalog" | "configurator" | "admin" | "orders" | "cabinet";
  setActiveTab: (tab: "catalog" | "configurator" | "admin" | "orders" | "cabinet") => void;
  cartCount: number;
  onOpenCart: () => void;
}

export default function MobileNavigation({
  activeTab,
  setActiveTab,
  cartCount,
  onOpenCart,
}: MobileNavigationProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { user, isLoggedIn, openAuthModal, logout } = useAuth();
  const { isAdminAuthenticated, logoutAdmin } = useAdminAuth();

  return (
    <>
      {/* 1. Верхний компактный мобильный Header (md:hidden) */}
      <div className="md:hidden sticky top-0 z-40 bg-[#1B4965] text-white px-4 h-14 flex items-center justify-between shadow-sm">
        <button
          onClick={() => setIsDrawerOpen(true)}
          className="p-2 -ml-2 text-slate-200 hover:text-white"
          aria-label="Открыть меню"
        >
          <Menu className="w-6 h-6" />
        </button>

        <div 
          onClick={() => setActiveTab("catalog")}
          className="flex items-center gap-2 cursor-pointer font-black text-lg tracking-tight"
        >
          <span className="w-7 h-7 bg-[#8BC34A] text-slate-950 rounded-lg flex items-center justify-center text-sm font-black shadow-inner">
            A
          </span>
          <span>absvers</span>
        </div>

        <div className="flex items-center gap-1">
          {/* Quick Profile / Login button */}
          <button
            onClick={() => {
              if (isLoggedIn) {
                setActiveTab("cabinet");
              } else {
                openAuthModal();
              }
            }}
            className="p-2 text-slate-200 hover:text-[#8BC34A] transition"
            aria-label={isLoggedIn ? "Личный кабинет" : "Войти"}
          >
            {isLoggedIn ? (
              <UserCheck className="w-5 h-5 text-[#8BC34A]" />
            ) : (
              <LogIn className="w-5 h-5" />
            )}
          </button>

          <a
            href="tel:+78000000000"
            className="p-2 -mr-2 text-[#8BC34A] hover:text-white transition"
            aria-label="Позвонить в отдел продаж"
          >
            <PhoneCall className="w-5 h-5" />
          </a>
        </div>
      </div>

      {/* 2. Нижний таб-бар (Bottom Bar) для большого пальца */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-lg">
        <div className="flex items-center justify-around">
          {/* Вкладка Каталог */}
          <button
            onClick={() => setActiveTab("catalog")}
            className={`flex flex-col items-center justify-center w-14 py-1 rounded-xl transition ${
              activeTab === "catalog" ? "text-[#1B4965] font-bold" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Layers className={`w-5 h-5 ${activeTab === "catalog" ? "stroke-[2.5px] text-[#1B4965]" : ""}`} />
            <span className="text-[10px] mt-1">Каталог</span>
          </button>

          {/* Вкладка 3D-Конфигуратор */}
          <button
            onClick={() => setActiveTab("configurator")}
            className={`flex flex-col items-center justify-center w-14 py-1 rounded-xl transition ${
              activeTab === "configurator" ? "text-[#1B4965] font-bold" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <div className={`p-1 rounded-lg ${activeTab === "configurator" ? "bg-[#8BC34A]/20" : ""}`}>
              <Sliders className={`w-5 h-5 ${activeTab === "configurator" ? "stroke-[2.5px] text-[#1B4965]" : ""}`} />
            </div>
            <span className="text-[10px] mt-0.5">3D Конфиг</span>
          </button>

          {/* Кнопка Корзины с бейджем */}
          <button
            onClick={onOpenCart}
            className="flex flex-col items-center justify-center w-14 py-1 rounded-xl relative text-slate-500 hover:text-slate-800 transition"
          >
            <div className="relative">
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-[#8BC34A] text-slate-950 font-black text-[10px] min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1 shadow-sm">
                  {cartCount}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-1">Корзина</span>
          </button>

          {/* Заявки и КП (видны в нижнем баре только для авторизованного администратора) */}
          {isAdminAuthenticated && (
            <button
              onClick={() => setActiveTab("orders")}
              className={`flex flex-col items-center justify-center w-14 py-1 rounded-xl transition ${
                activeTab === "orders" ? "text-amber-600 font-bold" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <FileSpreadsheet className={`w-5 h-5 ${activeTab === "orders" ? "stroke-[2.5px] text-amber-600" : ""}`} />
              <span className="text-[10px] mt-1">Заявки</span>
            </button>
          )}

          {/* Профиль / Вход */}
          <button
            onClick={() => {
              if (isLoggedIn) {
                setActiveTab("cabinet");
              } else {
                openAuthModal();
              }
            }}
            className={`flex flex-col items-center justify-center w-14 py-1 rounded-xl transition ${
              activeTab === "cabinet" 
                ? "text-[#1B4965] font-bold" 
                : isLoggedIn 
                  ? "text-emerald-700" 
                  : "text-slate-500 hover:text-slate-800"
            }`}
          >
            {isLoggedIn ? (
              <UserCheck className={`w-5 h-5 ${activeTab === "cabinet" ? "text-[#1B4965] stroke-[2.5px]" : "text-emerald-600"}`} />
            ) : (
              <LogIn className="w-5 h-5" />
            )}
            <span className="text-[10px] mt-1 truncate max-w-[56px]">
              {isLoggedIn ? (user?.name?.split(" ")[0] || "Кабинет") : "Войти"}
            </span>
          </button>
        </div>
      </nav>

      {/* 3. Боковое меню (Drawer) */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsDrawerOpen(false)}
          />

          <div className="relative w-[80%] max-w-xs bg-white h-full shadow-2xl flex flex-col justify-between p-6 z-10 animate-slide-in overflow-y-auto">
            <div>
              <div className="flex items-center justify-between pb-5 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 bg-[#8BC34A] text-slate-950 rounded-lg flex items-center justify-center font-black">
                    A
                  </span>
                  <span className="font-black text-xl text-[#1B4965]">absvers</span>
                </div>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Блок пользователя в Drawer */}
              <div className="py-4 border-b border-slate-100">
                {isLoggedIn && user ? (
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-[#1B4965] text-white flex items-center justify-center font-bold text-sm shrink-0">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
                        <p className="text-xs text-slate-500 truncate">{user.phone}</p>
                        {user.type === "company" && user.companyName && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded mt-0.5">
                            <Building2 className="w-3 h-3" />
                            {user.companyName}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        logout();
                        setIsDrawerOpen(false);
                      }}
                      className="mt-3 w-full py-1.5 px-3 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Выйти из аккаунта</span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setIsDrawerOpen(false);
                      openAuthModal();
                    }}
                    className="w-full py-2.5 px-4 bg-[#8BC34A] text-slate-950 font-black text-sm rounded-xl shadow-sm flex items-center justify-center gap-2 hover:bg-[#7CB342] transition"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Войти в личный кабинет</span>
                  </button>
                )}
              </div>

              {/* Навигационные ссылки */}
              <div className="py-4 space-y-1">
                {isLoggedIn && (
                  <button
                    onClick={() => {
                      setActiveTab("cabinet");
                      setIsDrawerOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm font-semibold transition ${
                      activeTab === "cabinet" ? "bg-emerald-50 text-emerald-800 font-bold" : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <UserCheck className="w-5 h-5 text-emerald-600" />
                    <span>Личный кабинет и заказы</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setActiveTab("catalog");
                    setIsDrawerOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm font-semibold transition ${
                    activeTab === "catalog" ? "bg-slate-100 text-[#1B4965]" : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <Layers className="w-5 h-5 text-[#1B4965]" />
                  <span>Каталог шкафов</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab("configurator");
                    setIsDrawerOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm font-semibold transition ${
                    activeTab === "configurator" ? "bg-slate-100 text-[#1B4965]" : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <Sliders className="w-5 h-5 text-[#8BC34A]" />
                  <span>3D Конфигуратор</span>
                </button>

                {isAdminAuthenticated && (
                  <>
                    <button
                      onClick={() => {
                        setActiveTab("orders");
                        setIsDrawerOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-sm font-semibold transition ${
                        activeTab === "orders" ? "bg-amber-50 text-amber-700" : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <FileSpreadsheet className="w-5 h-5 text-amber-600" />
                        <span>Панель заявок и КП</span>
                      </div>
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    </button>

                    <button
                      onClick={() => {
                        setActiveTab("admin");
                        setIsDrawerOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-sm font-semibold transition ${
                        activeTab === "admin" ? "bg-indigo-50 text-indigo-700" : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Settings className="w-5 h-5 text-indigo-600" />
                        <span>Склад и цены</span>
                      </div>
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    </button>
                  </>
                )}

                <div className="pt-2 border-t border-slate-100 mt-2">
                  <a
                    href="#delivery"
                    onClick={() => setIsDrawerOpen(false)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    <Truck className="w-5 h-5 text-slate-400" />
                    <span>Доставка и монтаж</span>
                  </a>

                  <a
                    href="#warranty"
                    onClick={() => setIsDrawerOpen(false)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    <ShieldCheck className="w-5 h-5 text-slate-400" />
                    <span>Гарантия и сертификаты</span>
                  </a>

                  <a
                    href="#specs"
                    onClick={() => setIsDrawerOpen(false)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    <FileText className="w-5 h-5 text-slate-400" />
                    <span>Оптовый прайс / ТЗ</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Контакты внизу */}
            <div className="pt-4 border-t border-slate-100">
              <p className="text-xs text-slate-400 mb-1">Отдел продаж:</p>
              <a href="tel:+78000000000" className="block text-base font-bold text-[#1B4965]">
                +7 (800) 000-00-00
              </a>
              <p className="text-xs text-slate-500 mt-1">info@absvers.ru</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
