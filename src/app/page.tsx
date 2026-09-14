"use client";

import React, { useState } from "react";
import Image from "next/image";
import { 
  ShieldCheck, 
  Layers, 
  Droplets, 
  Lock, 
  Settings, 
  Phone, 
  Mail, 
  MapPin, 
  CheckCircle2, 
  ArrowRight, 
  Sliders, 
  FileSpreadsheet, 
  Building2, 
  Award,
  Sparkles,
  UserCheck
} from "lucide-react";
import LockerConfigurator from "../../LockerConfigurator";
import AdminDashboard from "../../AdminDashboard";
import AdminOrdersPanel from "../../AdminOrdersPanel";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<"catalog" | "configurator" | "admin" | "orders">("catalog");

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#1B4965] text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab("catalog")}>
            <div className="w-10 h-10 rounded-xl bg-[#8BC34A] flex items-center justify-center font-black text-xl text-slate-900 shadow-inner">
              A
            </div>
            <div>
              <span className="text-2xl font-black tracking-tight text-white">absvers</span>
              <p className="text-xs text-emerald-300 font-medium hidden sm:block">модульные АБС-локеры нового поколения</p>
            </div>
          </div>

          <nav className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => setActiveTab("catalog")}
              className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-semibold transition ${
                activeTab === "catalog"
                  ? "bg-white/15 text-white shadow-sm"
                  : "text-slate-200 hover:text-white hover:bg-white/10"
              }`}
            >
              Каталог и преимущества
            </button>
            <button
              onClick={() => setActiveTab("configurator")}
              className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2 ${
                activeTab === "configurator"
                  ? "bg-[#8BC34A] text-slate-900 shadow-md"
                  : "bg-white/10 text-white hover:bg-[#8BC34A] hover:text-slate-900"
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>3D-Конфигуратор</span>
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-1.5 ${
                activeTab === "orders"
                  ? "bg-amber-600 text-white shadow-sm"
                  : "text-slate-300 hover:text-white hover:bg-white/10"
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span className="hidden md:inline">Заявки и КП</span>
            </button>
            <button
              onClick={() => setActiveTab("admin")}
              className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-1.5 ${
                activeTab === "admin"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-300 hover:text-white hover:bg-white/10"
              }`}
            >
              <Settings className="w-4 h-4" />
              <span className="hidden md:inline">Склад и цены</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1">
        {activeTab === "catalog" && (
          <div>
            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-[#1B4965] via-[#144B6E] to-slate-900 text-white py-16 lg:py-24 overflow-hidden">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#8BC34A]/20 border border-[#8BC34A]/40 text-[#8BC34A] text-xs sm:text-sm font-semibold mb-6">
                      <Sparkles className="w-4 h-4" />
                      100% инженерный первичный АБС-пластик
                    </div>
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
                      Модульные шкафчики-локеры нового поколения
                    </h1>
                    <p className="mt-4 text-base sm:text-lg text-slate-200 leading-relaxed max-w-xl">
                      Абсолютная влагостойкость, ударопрочность и гигиеничность на десятилетия. Идеально для фитнес-клубов, бассейнов, школ, современных офисов и производств.
                    </p>

                    <div className="mt-8 flex flex-wrap items-center gap-4">
                      <button
                        onClick={() => setActiveTab("configurator")}
                        className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#8BC34A] to-[#7CB342] text-slate-950 font-bold text-base shadow-lg hover:shadow-[#8BC34A]/30 transition transform hover:-translate-y-0.5 flex items-center gap-2"
                      >
                        <Sliders className="w-5 h-5" />
                        Рассчитать в 3D-конфигураторе
                        <ArrowRight className="w-4 h-4" />
                      </button>
                      <a
                        href="#models"
                        className="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-base transition border border-white/20"
                      >
                        Модельный ряд
                      </a>
                    </div>

                    <div className="mt-10 grid grid-cols-3 gap-4 border-t border-white/15 pt-6 text-slate-200">
                      <div>
                        <div className="text-2xl font-black text-[#8BC34A]">10+ лет</div>
                        <div className="text-xs text-slate-300">Гарантии на корпус</div>
                      </div>
                      <div>
                        <div className="text-2xl font-black text-[#8BC34A]">100%</div>
                        <div className="text-xs text-slate-300">Влагостойкость</div>
                      </div>
                      <div>
                        <div className="text-2xl font-black text-[#8BC34A]">0 руб</div>
                        <div className="text-xs text-slate-300">Коррозии и ржавчины</div>
                      </div>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/20 bg-slate-800">
                      <img 
                        src="/images/hero_locker_room.png" 
                        alt="Интерьер раздевалки с шкафчиками absvers" 
                        className="w-full h-auto object-cover max-h-[480px]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Key Advantages */}
            <section className="py-16 bg-white border-b border-slate-200">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-12">
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1B4965]">
                    Почему выбирают АБС-локеры absvers
                  </h2>
                  <p className="mt-3 text-slate-600 text-base">
                    Традиционные металлические и деревянные шкафы быстро ржавеют и разбухают от влаги. Наши локеры созданы служить десятилетиями.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 shadow-sm hover:shadow-md transition">
                    <div className="w-12 h-12 rounded-xl bg-blue-100 text-[#1B4965] flex items-center justify-center mb-4">
                      <Droplets className="w-6 h-6 text-[#1B4965]" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">100% Влагостойкость</h3>
                    <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                      Не впитывают влагу, не деформируются и не ржавеют. Можно мыть водой под давлением и дезинфицирующими растворами.
                    </p>
                  </div>

                  <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 shadow-sm hover:shadow-md transition">
                    <div className="w-12 h-12 rounded-xl bg-emerald-100 text-[#8BC34A] flex items-center justify-center mb-4">
                      <ShieldCheck className="w-6 h-6 text-emerald-600" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">Ударопрочный АБС-пластик</h3>
                    <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                      Высокотехнологичный первичный полимер выдерживает интенсивные механические нагрузки без вмятин и царапин.
                    </p>
                  </div>

                  <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 shadow-sm hover:shadow-md transition">
                    <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mb-4">
                      <Layers className="w-6 h-6 text-amber-600" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">Модульная матрица сборки</h3>
                    <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                      Легко комбинируйте секции разной высоты (1, 2, 3 яруса) и создавайте ряды любой длины с защитным цоколем.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Model Lineup Section */}
            <section id="models" className="py-16 bg-slate-50">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
                  <div>
                    <span className="text-sm font-bold text-[#8BC34A] tracking-wider uppercase">Модельный ряд</span>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1B4965] mt-1">
                      Популярные линейки шкафов Т-382
                    </h2>
                  </div>
                  <button
                    onClick={() => setActiveTab("configurator")}
                    className="mt-4 md:mt-0 text-sm font-bold text-[#1B4965] hover:text-[#8BC34A] transition flex items-center gap-1.5"
                  >
                    Собрать индивидуальный блок в конфигураторе
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Model XXL */}
                  <div className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition flex flex-col">
                    <div className="bg-slate-100 p-6 flex items-center justify-center h-64 relative">
                      <img 
                        src="/images/card_t382xxl_royal_blue.png" 
                        alt="Шкаф absvers Т-382XXL" 
                        className="h-full object-contain"
                      />
                      <span className="absolute top-4 left-4 px-3 py-1 bg-[#1B4965] text-white text-xs font-bold rounded-full">
                        1 ярус / полная высота
                      </span>
                    </div>
                    <div className="p-6 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-xl font-extrabold text-slate-900">absvers Т-382XXL</h3>
                        <p className="text-xs text-slate-500 mt-1">Высота ячейки: 1850 мм · Ширина: 382 мм</p>
                        <p className="text-sm text-slate-600 mt-3">
                          Односекционный полноразмерный шкаф для премиальных фитнес-клубов и офисов. Оснащен штангой для длинной одежды и полкой для обуви.
                        </p>
                      </div>
                      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                        <div>
                          <span className="text-xs text-slate-400 block">Базовая цена от</span>
                          <span className="text-xl font-extrabold text-slate-900">18 500 ₽</span>
                        </div>
                        <button
                          onClick={() => setActiveTab("configurator")}
                          className="px-4 py-2 bg-[#8BC34A] hover:bg-[#7CB342] text-slate-950 font-bold text-xs rounded-lg transition"
                        >
                          Сконфигурировать
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Model L */}
                  <div className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition flex flex-col">
                    <div className="bg-slate-100 p-6 flex items-center justify-center h-64 relative">
                      <img 
                        src="/images/card_t382l_ruby_red.png" 
                        alt="Шкаф absvers Т-382L" 
                        className="h-full object-contain"
                      />
                      <span className="absolute top-4 left-4 px-3 py-1 bg-emerald-600 text-white text-xs font-bold rounded-full">
                        2 яруса / Хит продаж
                      </span>
                    </div>
                    <div className="p-6 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-xl font-extrabold text-slate-900">absvers Т-382L</h3>
                        <p className="text-xs text-slate-500 mt-1">Высота ячейки: 925 мм (2 яруса) · Ширина: 382 мм</p>
                        <p className="text-sm text-slate-600 mt-3">
                          Самый популярный двухъярусный формат для спортивных комплексов и бассейнов. Вмещает спортивную сумку, куртку и сменную обувь.
                        </p>
                      </div>
                      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                        <div>
                          <span className="text-xs text-slate-400 block">Базовая цена секции</span>
                          <span className="text-xl font-extrabold text-slate-900">12 400 ₽</span>
                        </div>
                        <button
                          onClick={() => setActiveTab("configurator")}
                          className="px-4 py-2 bg-[#8BC34A] hover:bg-[#7CB342] text-slate-950 font-bold text-xs rounded-lg transition"
                        >
                          Сконфигурировать
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Model M */}
                  <div className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition flex flex-col">
                    <div className="bg-slate-100 p-6 flex items-center justify-center h-64 relative">
                      <img 
                        src="/images/card_t382m_grey_yellow_mix.png" 
                        alt="Шкаф absvers Т-382M" 
                        className="h-full object-contain"
                      />
                      <span className="absolute top-4 left-4 px-3 py-1 bg-amber-600 text-white text-xs font-bold rounded-full">
                        3 яруса / Школы и детсады
                      </span>
                    </div>
                    <div className="p-6 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-xl font-extrabold text-slate-900">absvers Т-382M</h3>
                        <p className="text-xs text-slate-500 mt-1">Высота ячейки: 615 мм (3 яруса) · Ширина: 382 мм</p>
                        <p className="text-sm text-slate-600 mt-3">
                          Трехъярусная компоновка для учебных заведений, детских садов, камер хранения в супермаркетах и производственных раздевалок.
                        </p>
                      </div>
                      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                        <div>
                          <span className="text-xs text-slate-400 block">Базовая цена секции</span>
                          <span className="text-xl font-extrabold text-slate-900">9 800 ₽</span>
                        </div>
                        <button
                          onClick={() => setActiveTab("configurator")}
                          className="px-4 py-2 bg-[#8BC34A] hover:bg-[#7CB342] text-slate-950 font-bold text-xs rounded-lg transition"
                        >
                          Сконфигурировать
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Smart Lockers and Office Section */}
            <section className="py-16 bg-white border-t border-b border-slate-200">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                  <div className="order-2 lg:order-1 rounded-2xl overflow-hidden shadow-xl border border-slate-200">
                    <img 
                      src="/images/office_smart_locker.png" 
                      alt="Электронные смарт-локеры для офисов и коворкингов" 
                      className="w-full h-auto object-cover max-h-[440px]"
                    />
                  </div>

                  <div className="order-1 lg:order-2">
                    <span className="text-sm font-bold text-indigo-600 tracking-wider uppercase">Smart Lockers</span>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1B4965] mt-1">
                      Электронные замковые системы и терминалы управления
                    </h2>
                    <p className="mt-4 text-slate-600 text-base leading-relaxed">
                      Интегрируйте бесключевой доступ в ваш бизнес: замки с RFID-браслетами, PIN-кодом или централизованным сенсорным терминалом с выдачей ячеек по QR-коду.
                    </p>

                    <div className="mt-6 space-y-3">
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="text-sm text-slate-700 font-medium">RFID / NFC браслеты и карты для фитнес-клубов и аквапарков</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="text-sm text-slate-700 font-medium">Сенсорные терминалы самообслуживания с интеграцией в CRM</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="text-sm text-slate-700 font-medium">Безопасное автономное питание замков от батареек до 2-3 лет</span>
                      </div>
                    </div>

                    <div className="mt-8">
                      <button
                        onClick={() => setActiveTab("configurator")}
                        className="px-6 py-3 rounded-xl bg-[#1B4965] hover:bg-[#144B6E] text-white font-bold text-sm shadow transition"
                      >
                        Выбрать замковую систему в конфигураторе
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Applications Grid */}
            <section className="py-16 bg-slate-50">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-2xl mx-auto mb-12">
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1B4965]">
                    Сферы применения локеров absvers
                  </h2>
                  <p className="mt-2 text-slate-600 text-sm">
                    Шкафчики спроектированы с учетом санитарных норм и строгих требований к надежности.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-center">
                    <div className="w-12 h-12 mx-auto rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                      <Droplets className="w-6 h-6" />
                    </div>
                    <h4 className="font-bold text-slate-900">Бассейны и СПА</h4>
                    <p className="text-xs text-slate-500 mt-1">100% защита от пара и хлорированной воды</p>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-center">
                    <div className="w-12 h-12 mx-auto rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                      <Award className="w-6 h-6" />
                    </div>
                    <h4 className="font-bold text-slate-900">Фитнес-клубы</h4>
                    <p className="text-xs text-slate-500 mt-1">Стильный дизайн под фирменные цвета бренда</p>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-center">
                    <div className="w-12 h-12 mx-auto rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <h4 className="font-bold text-slate-900">Школы и детсады</h4>
                    <p className="text-xs text-slate-500 mt-1">Безопасные скругленные углы и яркие фасады</p>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-center">
                    <div className="w-12 h-12 mx-auto rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
                      <UserCheck className="w-6 h-6" />
                    </div>
                    <h4 className="font-bold text-slate-900">Офисы и заводы</h4>
                    <p className="text-xs text-slate-500 mt-1">Камеры хранения личных вещей и спецодежды</p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {activeTab === "configurator" && (
          <div className="py-8 bg-slate-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1B4965]">
                    Интерактивный конфигуратор шкафов absvers
                  </h1>
                  <p className="text-sm text-slate-600 mt-1">
                    Сформируйте модульную компоновку, выберите модель, цвета дверей и замки.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab("catalog")}
                  className="text-xs font-semibold px-3 py-2 bg-white rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
                >
                  ← Назад к каталогу
                </button>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6">
                <LockerConfigurator />
              </div>
            </div>
          </div>
        )}

        {activeTab === "orders" && (
          <div className="py-8 bg-slate-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1B4965]">
                    Управление заявками и коммерческими предложениями
                  </h1>
                  <p className="text-sm text-slate-600 mt-1">
                    Обработка поступивших конфигураций, выставление счетов и изменение статусов заказов.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab("catalog")}
                  className="text-xs font-semibold px-3 py-2 bg-white rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
                >
                  ← В магазин
                </button>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6">
                <AdminOrdersPanel />
              </div>
            </div>
          </div>
        )}

        {activeTab === "admin" && (
          <div className="py-8 bg-slate-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1B4965]">
                    Панель администратора интернет-магазина
                  </h1>
                  <p className="text-sm text-slate-600 mt-1">
                    Управление номенклатурой товаров, ценами, остатками и поступившими заказами.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab("catalog")}
                  className="text-xs font-semibold px-3 py-2 bg-white rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
                >
                  ← В магазин
                </button>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6">
                <AdminDashboard />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-[#1B4965] text-white border-t border-white/10 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#8BC34A] flex items-center justify-center font-black text-slate-900">
                  A
                </div>
                <span className="text-2xl font-black tracking-tight">absvers</span>
              </div>
              <p className="mt-3 text-sm text-slate-300 max-w-sm leading-relaxed">
                Производство и оптовые поставки модульных шкафчиков и локеров из ударопрочного АБС-пластика для любых типов помещений.
              </p>
            </div>

            <div>
              <h4 className="text-sm font-bold text-[#8BC34A] uppercase tracking-wider">Модели шкафов</h4>
              <ul className="mt-3 space-y-2 text-sm text-slate-300">
                <li>absvers Т-382XXL (1 ярус)</li>
                <li>absvers Т-382L (2 яруса)</li>
                <li>absvers Т-382M (3 яруса)</li>
                <li>absvers Smart Lockers</li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-bold text-[#8BC34A] uppercase tracking-wider">Контакты и заказ</h4>
              <ul className="mt-3 space-y-2 text-sm text-slate-300">
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#8BC34A]" />
                  <span>+7 (800) 555-38-20</span>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#8BC34A]" />
                  <span>info@absvers.ru</span>
                </li>
                <li className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#8BC34A]" />
                  <span>г. Москва / Доставка по РФ и СНГ</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
            <p>© {new Date().getFullYear()} absvers. Все права защищены.</p>
            <p>Модульные АБС-системы хранения и локеры</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
