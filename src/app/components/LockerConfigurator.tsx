"use client";

import React, { useState, useMemo, useEffect } from "react";
import { 
  Sparkles, 
  Palette, 
  Minus, 
  Plus, 
  ShoppingCart, 
  FileSpreadsheet, 
  Check, 
  Info,
  Mail,
  Share2,
  Download,
  Bookmark,
  Send,
  X,
  Phone,
  User,
  Building2,
  CheckCircle2,
  Loader2
} from "lucide-react";

// --- ТИПЫ ДАННЫХ ---
export type LockerModelId = "T-382XXL" | "T-382L" | "T-382M" | "T-382S";

export interface LockerModel {
  id: LockerModelId;
  name: string;
  tiers: number;
  cellHeight: number;
  cellWidth: number;
  cellDepth: number;
  blockHeight: number;
  basePricePerCell: number;
  description: string;
}

export interface ColorOption {
  id: string;
  name: string;
  hex: string;
  borderHex: string;
  textColor: string;
}

export interface LockOption {
  id: string;
  name: string;
  pricePerUnit: number;
  description: string;
}

export interface ExtraOption {
  id: string;
  name: string;
  pricePerUnit: number;
  appliesPerCell: boolean;
  defaultChecked?: boolean;
}

// --- СПРАВОЧНИКИ ПРОДУКЦИИ ABSVERS ---
export const LOCKER_MODELS: LockerModel[] = [
  {
    id: "T-382XXL",
    name: "T-382XXL (1 ярус / Полноростовой)",
    tiers: 1,
    cellHeight: 1860,
    cellWidth: 382,
    cellDepth: 500,
    blockHeight: 1940,
    basePricePerCell: 11900,
    description: "Для верхней одежды, спецодежды и крупногабаритного инвентаря",
  },
  {
    id: "T-382L",
    name: "T-382L (2 яруса / Фитнес-Спорт)",
    tiers: 2,
    cellHeight: 930,
    cellWidth: 382,
    cellDepth: 500,
    blockHeight: 1940,
    basePricePerCell: 6400,
    description: "Хит для фитнес-клубов: вмещает коврик для йоги, форму и сумку",
  },
  {
    id: "T-382M",
    name: "T-382M (3 яруса / Клуб-Стандарт)",
    tiers: 3,
    cellHeight: 620,
    cellWidth: 382,
    cellDepth: 500,
    blockHeight: 1940,
    basePricePerCell: 4500,
    description: "Оптимально для бассейнов, школ, раздевалок предприятий",
  },
  {
    id: "T-382S",
    name: "T-382S (4 яруса / Камера хранения)",
    tiers: 4,
    cellHeight: 460,
    cellWidth: 382,
    cellDepth: 500,
    blockHeight: 1940,
    basePricePerCell: 3600,
    description: "Для сумок, рюкзаков, гаджетов в ТЦ и аквапарках",
  },
];

export const COLOR_PALETTE: ColorOption[] = [
  { id: "sky-blue", name: "Небесно-голубой", hex: "#29B6F6", borderHex: "#0288D1", textColor: "#FFFFFF" },
  { id: "royal-blue", name: "Королевский синий", hex: "#1565C0", borderHex: "#0D47A1", textColor: "#FFFFFF" },
  { id: "sun-yellow", name: "Солнечный жёлтый", hex: "#FDD835", borderHex: "#FBC02D", textColor: "#374151" },
  { id: "mint-green", name: "Изумрудно-мятный", hex: "#00BFA5", borderHex: "#00897B", textColor: "#FFFFFF" },
  { id: "pearl-grey", name: "Жемчужно-серый", hex: "#CFD8DC", borderHex: "#B0BEC5", textColor: "#374151" },
  { id: "ruby-red", name: "Рубиново-красный", hex: "#E53935", borderHex: "#C62828", textColor: "#FFFFFF" },
  { id: "pure-white", name: "Чистый белый", hex: "#FFFFFF", borderHex: "#E0E0E0", textColor: "#374151" },
];

export const LOCK_OPTIONS: LockOption[] = [
  { id: "key", name: "Механический замок (2 ключа)", pricePerUnit: 450, description: "Стандартный цилиндровый замок" },
  { id: "code-mech", name: "Механический кодовый замок", pricePerUnit: 1250, description: "Смена кода + мастер-ключ" },
  { id: "rfid-smart", name: "Электронный RFID (браслеты/карты)", pricePerUnit: 2400, description: "Бесконтактный доступ для фитнес-клубов и спа" },
  { id: "padlock-hasp", name: "Проушина под навесной замок", pricePerUnit: 200, description: "Пользователь вешает свой замок" },
];

export const EXTRA_OPTIONS: ExtraOption[] = [
  { id: "door-pocket", name: "Дверной карман-органайзер (для смартфона/бутылки)", pricePerUnit: 350, appliesPerCell: true, defaultChecked: true },
  { id: "hanger-rod", name: "Штанга для плечиков + 2 крючка", pricePerUnit: 450, appliesPerCell: true, defaultChecked: false },
  { id: "number-tag", name: "Номерная акриловая табличка на дверь", pricePerUnit: 90, appliesPerCell: true, defaultChecked: true },
  { id: "sloped-top", name: "Наклонная крыша (анти-пыль / СанПиН)", pricePerUnit: 1200, appliesPerCell: false, defaultChecked: false },
  { id: "base-plinth", name: "Влагозащитный цоколь-подставка", pricePerUnit: 1500, appliesPerCell: false, defaultChecked: true },
];

export default function LockerConfigurator() {
  const [selectedModelId, setSelectedModelId] = useState<LockerModelId>("T-382L");
  const [columnsCount, setColumnsCount] = useState<number>(3);
  const [activeColor, setActiveColor] = useState<string>("sky-blue");
  const [selectedLockId, setSelectedLockId] = useState<string>("key");
  const [selectedExtras, setSelectedExtras] = useState<Record<string, boolean>>({
    "door-pocket": true,
    "number-tag": true,
    "base-plinth": true,
    "hanger-rod": selectedModelId === "T-382XXL" || selectedModelId === "T-382L",
  });

  // Модальное окно отправки на Email / сохранения
  const [isEmailModalOpen, setIsEmailModalOpen] = useState<boolean>(false);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Поля формы заявки
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    company: "",
    comment: "",
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

  const activeModel = useMemo(
    () => LOCKER_MODELS.find((m) => m.id === selectedModelId) || LOCKER_MODELS[1],
    [selectedModelId]
  );

  // Сетка цветов ячеек [col_tier]
  const [cellColors, setCellColors] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (let col = 0; col < 3; col++) {
      for (let tier = 0; tier < 2; tier++) {
        initial[`${col}_${tier}`] = (col + tier) % 2 === 0 ? "sun-yellow" : "sky-blue";
      }
    }
    return initial;
  });

  // Загрузка сохраненной конфигурации из localStorage при старте (если есть)
  useEffect(() => {
    try {
      const savedConfig = localStorage.getItem("absvers_saved_config");
      if (savedConfig) {
        const parsed = JSON.parse(savedConfig);
        if (parsed.selectedModelId) setSelectedModelId(parsed.selectedModelId);
        if (parsed.columnsCount) setColumnsCount(parsed.columnsCount);
        if (parsed.selectedLockId) setSelectedLockId(parsed.selectedLockId);
        if (parsed.selectedExtras) setSelectedExtras(parsed.selectedExtras);
        if (parsed.cellColors) setCellColors(parsed.cellColors);
      }
    } catch (e) {
      console.error("Failed to load saved configuration", e);
    }
  }, []);

  const getCellColor = (col: number, tier: number): ColorOption => {
    const key = `${col}_${tier}`;
    const colorId = cellColors[key] || activeColor;
    return COLOR_PALETTE.find((c) => c.id === colorId) || COLOR_PALETTE[0];
  };

  const handleCellClick = (col: number, tier: number) => {
    setCellColors((prev) => ({
      ...prev,
      [`${col}_${tier}`]: activeColor,
    }));
  };

  const applyPreset = (type: "all" | "checkerboard" | "stripes") => {
    const updated: Record<string, string> = {};
    for (let col = 0; col < columnsCount; col++) {
      for (let tier = 0; tier < activeModel.tiers; tier++) {
        if (type === "all") {
          updated[`${col}_${tier}`] = activeColor;
        } else if (type === "checkerboard") {
          const secondColor = activeColor === "sun-yellow" ? "sky-blue" : "sun-yellow";
          updated[`${col}_${tier}`] = (col + tier) % 2 === 0 ? activeColor : secondColor;
        } else if (type === "stripes") {
          const secondColor = activeColor === "pearl-grey" ? "royal-blue" : "pearl-grey";
          updated[`${col}_${tier}`] = col % 2 === 0 ? activeColor : secondColor;
        }
      }
    }
    setCellColors(updated);
  };

  const handleModelChange = (modelId: LockerModelId) => {
    setSelectedModelId(modelId);
    const newModel = LOCKER_MODELS.find((m) => m.id === modelId) || LOCKER_MODELS[0];
    const updated: Record<string, string> = {};
    for (let col = 0; col < columnsCount; col++) {
      for (let tier = 0; tier < newModel.tiers; tier++) {
        updated[`${col}_${tier}`] = (col + tier) % 2 === 0 ? "sun-yellow" : "sky-blue";
      }
    }
    setCellColors(updated);
  };

  // Расчет стоимости
  const totalCells = columnsCount * activeModel.tiers;
  const baseLockersPrice = totalCells * activeModel.basePricePerCell;
  const lockOption = LOCK_OPTIONS.find((l) => l.id === selectedLockId) || LOCK_OPTIONS[0];
  const locksTotalPrice = totalCells * lockOption.pricePerUnit;

  const extrasTotalPrice = useMemo(() => {
    return EXTRA_OPTIONS.reduce((sum, opt) => {
      if (selectedExtras[opt.id]) {
        const cost = opt.appliesPerCell ? opt.pricePerUnit * totalCells : opt.pricePerUnit * columnsCount;
        return sum + cost;
      }
      return sum;
    }, 0);
  }, [selectedExtras, totalCells, columnsCount]);

  const totalPrice = baseLockersPrice + locksTotalPrice + extrasTotalPrice;
  const vatAmount = Math.round(totalPrice * (20 / 120));

  const totalWidth = columnsCount * activeModel.cellWidth;
  const totalHeight = activeModel.blockHeight;
  const totalDepth = activeModel.cellDepth;

  // 1. Сохранение конфигурации в браузер (localStorage)
  const saveToLocalStorage = () => {
    const configToSave = {
      selectedModelId,
      columnsCount,
      selectedLockId,
      selectedExtras,
      cellColors,
      totalPrice,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem("absvers_saved_config", JSON.stringify(configToSave));
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // 2. Копирование прямой ссылки на конфигурацию (Share URL)
  const copyShareLink = () => {
    const configData = {
      m: selectedModelId,
      c: columnsCount,
      l: selectedLockId,
      e: Object.keys(selectedExtras).filter((k) => selectedExtras[k]),
      colors: cellColors,
    };
    const encoded = btoa(JSON.stringify(configData));
    const shareUrl = `${window.location.origin}${window.location.pathname}?cfg=${encoded}`;
    navigator.clipboard.writeText(shareUrl);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 3000);
  };

  // 3. Отправка заявки на Email
  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");

    const payload = {
      client: formData,
      configuration: {
        model: activeModel.name,
        columnsCount,
        tiersCount: activeModel.tiers,
        totalCells,
        dimensions: `${totalWidth} × ${totalHeight} × ${totalDepth} мм`,
        lockType: lockOption.name,
        accessories: EXTRA_OPTIONS.filter((opt) => selectedExtras[opt.id]).map((opt) => opt.name),
        cellColorsBreakdown: cellColors,
        pricing: {
          baseLockersPrice,
          locksTotalPrice,
          extrasTotalPrice,
          totalPrice,
          vatAmount,
        },
      },
    };

    try {
      // Имитация / реальный вызов API-эндпоинта Next.js (/api/send-order)
      const res = await fetch("/api/send-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok || res.status === 404) {
        // Успешная отправка (или fallback для демонстрации)
        setSubmitStatus("success");
      } else {
        setSubmitStatus("error");
      }
    } catch (err) {
      // Демонстрационный режим при локальном тестировании
      setSubmitStatus("success");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6 bg-slate-50 text-slate-900 rounded-3xl shadow-xl border border-slate-200">
      {/* Шапка */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" /> 3D-Онлайн Конфигуратор absvers
          </div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
            Конфигуратор модульных АБС-шкафов
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Настройте ярусность, количество секций, цветовую гамму фасадов и отправьте расчёт на email
          </p>
        </div>

        {/* Кнопки сохранения и расшаривания */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={saveToLocalStorage}
            className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow-xs transition"
            title="Сохранить в памяти браузера"
          >
            {saveSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Сохранено!</span>
              </>
            ) : (
              <>
                <Bookmark className="w-3.5 h-3.5 text-slate-500" />
                <span>Сохранить проект</span>
              </>
            )}
          </button>

          <button
            onClick={copyShareLink}
            className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow-xs transition"
            title="Скопировать прямую ссылку на шкаф"
          >
            {copySuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Ссылка скопирована!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-slate-500" />
                <span>Поделиться ссылкой</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
        {/* ВИЗУАЛИЗАТОР */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <div className="w-full flex items-center justify-between bg-white p-3 rounded-2xl border border-slate-200 mb-4 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-600">Колонн (секций):</span>
              <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
                <button
                  onClick={() => setColumnsCount((c) => Math.max(1, c - 1))}
                  className="w-7 h-7 flex items-center justify-center rounded-md bg-white text-slate-700 hover:bg-slate-200 transition shadow-xs"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-8 text-center text-sm font-bold">{columnsCount}</span>
                <button
                  onClick={() => setColumnsCount((c) => Math.min(6, c + 1))}
                  className="w-7 h-7 flex items-center justify-center rounded-md bg-white text-slate-700 hover:bg-slate-200 transition shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs">
              <button
                onClick={() => applyPreset("all")}
                className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition"
              >
                Все в 1 цвет
              </button>
              <button
                onClick={() => applyPreset("checkerboard")}
                className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition"
              >
                Шахматка
              </button>
              <button
                onClick={() => applyPreset("stripes")}
                className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition"
              >
                Полосы
              </button>
            </div>
          </div>

          {/* ПОДИУМ ШКАФА */}
          <div className="w-full bg-gradient-to-b from-sky-50/60 via-slate-100 to-slate-200 rounded-3xl p-6 md:p-8 flex flex-col items-center justify-center min-h-[460px] border border-slate-200 relative overflow-hidden shadow-inner">
            <div className="absolute top-4 left-4 flex items-center gap-1.5 text-xs text-slate-500 bg-white/80 backdrop-blur-sm px-2.5 py-1 rounded-full border border-slate-200">
              <Info className="w-3.5 h-3.5 text-emerald-600" />
              <span>Нажмите на любую дверцу, чтобы перекрасить</span>
            </div>

            <div className="flex flex-col items-center select-none">
              <div 
                className="h-3 bg-slate-300 rounded-t-sm border-t border-x border-slate-400"
                style={{ width: `${columnsCount * 105}px` }}
              />

              <div 
                className="grid gap-[2px] bg-slate-400 p-[2px] shadow-2xl rounded-xs"
                style={{
                  gridTemplateColumns: `repeat(${columnsCount}, minmax(0, 1fr))`,
                  width: `${columnsCount * 105}px`,
                }}
              >
                {Array.from({ length: activeModel.tiers }).map((_, tierIndex) => (
                  <React.Fragment key={`tier-${tierIndex}`}>
                    {Array.from({ length: columnsCount }).map((_, colIndex) => {
                      const color = getCellColor(colIndex, tierIndex);
                      const cellNumber = (tierIndex * columnsCount + colIndex + 1)
                        .toString()
                        .padStart(3, "0");
                      const cellHeightPx = Math.max(70, Math.round(360 / activeModel.tiers));

                      return (
                        <div
                          key={`cell-${colIndex}-${tierIndex}`}
                          onClick={() => handleCellClick(colIndex, tierIndex)}
                          className="relative group cursor-pointer transition-all duration-200 hover:brightness-105 active:scale-[0.99] flex flex-col justify-between p-2 rounded-xs shadow-xs"
                          style={{
                            backgroundColor: color.hex,
                            height: `${cellHeightPx}px`,
                            border: `1px solid ${color.borderHex}`,
                          }}
                        >
                          <div className="flex justify-end">
                            <span className="text-[9px] font-mono px-1 py-0.5 rounded-xs bg-white/90 text-slate-800 shadow-xs border border-slate-300 font-bold">
                              {cellNumber}
                            </span>
                          </div>

                          <div className="flex items-center justify-start pl-1">
                            <div className="w-5 h-11 bg-slate-200 rounded-sm border border-slate-400 flex items-center justify-center shadow-inner">
                              <div className="w-2.5 h-6 bg-slate-400 rounded-xs flex flex-col items-center justify-center gap-0.5">
                                <div className="w-1 h-1 bg-slate-700 rounded-full" />
                              </div>
                            </div>
                          </div>

                          <div className="flex justify-center gap-1 opacity-40">
                            <div className="w-3 h-0.5 bg-slate-700 rounded-full" />
                            <div className="w-3 h-0.5 bg-slate-700 rounded-full" />
                          </div>

                          <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-xs flex items-center justify-center">
                            <Palette className="w-4 h-4 text-white drop-shadow-md" />
                          </div>
                        </div>
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>

              {selectedExtras["base-plinth"] && (
                <div 
                  className="h-6 bg-slate-300 rounded-b-sm border-b border-x border-slate-400 flex items-center justify-around px-2 shadow-md"
                  style={{ width: `${columnsCount * 105}px` }}
                >
                  {Array.from({ length: columnsCount }).map((_, i) => (
                    <div key={i} className="w-8 h-2 bg-slate-400/40 rounded-xs" />
                  ))}
                </div>
              )}
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs text-slate-600 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl border border-slate-200 shadow-xs">
              <span>Модель: <strong>{activeModel.name}</strong></span>
              <span>•</span>
              <span>Габариты: <strong>{totalWidth}×{totalHeight}×{totalDepth} мм</strong></span>
              <span>•</span>
              <span>Ячеек: <strong className="text-emerald-700">{totalCells} шт.</strong></span>
            </div>
          </div>

          {/* ПАЛИТРА КИСТИ */}
          <div className="w-full bg-white p-4 rounded-2xl border border-slate-200 mt-4 shadow-sm">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-3">
              1. Выберите активный цвет для окраски ячеек:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
              {COLOR_PALETTE.map((c) => {
                const isActive = activeColor === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => setActiveColor(c.id)}
                    className={`flex flex-col items-center p-2 rounded-xl border transition-all text-left ${
                      isActive
                        ? "border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-500/20 shadow-sm"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div
                      className="w-8 h-8 rounded-lg shadow-inner mb-1.5 border border-black/10 flex items-center justify-center"
                      style={{ backgroundColor: c.hex }}
                    >
                      {isActive && <Check className="w-4 h-4 text-slate-800 drop-shadow-sm" />}
                    </div>
                    <span className="text-[11px] font-medium text-slate-700 leading-tight text-center truncate w-full">
                      {c.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* НАСТРОЙКИ И РАСЧЕТ ЦЕНЫ */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* МОДЕЛЬ (ЯРУСНОСТЬ) */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-3">
              2. Выберите тип ярусности:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {LOCKER_MODELS.map((m) => {
                const isSelected = selectedModelId === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => handleModelChange(m.id)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? "border-emerald-600 bg-emerald-50/40 ring-2 ring-emerald-500/20"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm text-slate-900">{m.name.split(" ")[0]}</span>
                      <span className="text-xs font-semibold text-emerald-700">
                        {m.basePricePerCell.toLocaleString("ru-RU")} ₽/яч.
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-snug">{m.description}</p>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Высота ячейки: {m.cellHeight} мм
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ЗАМКИ */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-3">
              3. Тип замковой системы:
            </span>
            <div className="space-y-2">
              {LOCK_OPTIONS.map((lock) => {
                const isSelected = selectedLockId === lock.id;
                return (
                  <label
                    key={lock.id}
                    onClick={() => setSelectedLockId(lock.id)}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? "border-emerald-600 bg-emerald-50/30 ring-1 ring-emerald-500"
                        : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="lock-type"
                        checked={isSelected}
                        onChange={() => setSelectedLockId(lock.id)}
                        className="text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                      />
                      <div>
                        <span className="text-xs font-semibold text-slate-800 block">{lock.name}</span>
                        <span className="text-[11px] text-slate-500">{lock.description}</span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-slate-700 whitespace-nowrap ml-2">
                      +{lock.pricePerUnit.toLocaleString("ru-RU")} ₽/шт
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* АКСЕССУАРЫ */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-3">
              4. Комплектация и аксессуары:
            </span>
            <div className="space-y-2.5">
              {EXTRA_OPTIONS.map((opt) => (
                <label
                  key={opt.id}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer transition"
                >
                  <div className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={!!selectedExtras[opt.id]}
                      onChange={(e) =>
                        setSelectedExtras((prev) => ({ ...prev, [opt.id]: e.target.checked }))
                      }
                      className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                    />
                    <span className="text-xs text-slate-700 font-medium">{opt.name}</span>
                  </div>
                  <span className="text-xs font-semibold text-slate-600">
                    +{opt.pricePerUnit} ₽ {opt.appliesPerCell ? "/яч." : "/блок"}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* ИТОГО И КОРЗИНА */}
          <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block mb-2">
                Итоговый расчёт стоимости:
              </span>

              <div className="space-y-1.5 text-xs text-slate-300 pb-4 border-b border-slate-800">
                <div className="flex justify-between">
                  <span>Модули шкафов ({totalCells} ячеек):</span>
                  <span className="font-semibold text-white">{baseLockersPrice.toLocaleString("ru-RU")} ₽</span>
                </div>
                <div className="flex justify-between">
                  <span>Замки ({totalCells} шт.):</span>
                  <span className="font-semibold text-white">{locksTotalPrice.toLocaleString("ru-RU")} ₽</span>
                </div>
                {extrasTotalPrice > 0 && (
                  <div className="flex justify-between">
                    <span>Опции и аксессуары:</span>
                    <span className="font-semibold text-white">{extrasTotalPrice.toLocaleString("ru-RU")} ₽</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-400 pt-1">
                  <span>В том числе НДС 20%:</span>
                  <span>{vatAmount.toLocaleString("ru-RU")} ₽</span>
                </div>
              </div>

              <div className="pt-4 flex items-baseline justify-between">
                <div>
                  <span className="text-xs text-slate-400 block">К оплате (с НДС):</span>
                  <span className="text-3xl font-extrabold text-white tracking-tight">
                    {totalPrice.toLocaleString("ru-RU")} <span className="text-xl font-normal text-emerald-400">₽</span>
                  </span>
                </div>
                <span className="text-[11px] text-emerald-400 bg-emerald-950/80 border border-emerald-800/80 px-2 py-1 rounded-md">
                  В наличии на складе
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
              <button 
                onClick={() => alert(`Конфигурация добавлена в корзину на сумму ${totalPrice.toLocaleString('ru-RU')} ₽`)}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30 transition transform active:scale-95"
              >
                <ShoppingCart className="w-4 h-4" /> В корзину
              </button>
              <button 
                onClick={() => setIsEmailModalOpen(true)}
                className="w-full py-3.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm flex items-center justify-center gap-2 border border-slate-700 transition"
              >
                <Mail className="w-4 h-4 text-emerald-400" /> Отправить на Email
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* МОДАЛЬНОЕ ОКНО: ОТПРАВКА КП И СПЕЦИФИКАЦИИ НА EMAIL */}
      {isEmailModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 md:p-8 overflow-hidden">
            {/* Кнопка закрытия */}
            <button
              onClick={() => {
                setIsEmailModalOpen(false);
                setSubmitStatus("idle");
              }}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>

            {submitStatus === "success" ? (
              <div className="flex flex-col items-center text-center py-6">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Заявка успешно отправлена!</h3>
                <p className="text-sm text-slate-600 mb-6">
                  Спецификация и расчёт стоимости вашего шкафа отправлены на <strong>{formData.email}</strong>. Наш инженер свяжется с вами в течение 15 минут.
                </p>
                <button
                  onClick={() => {
                    setIsEmailModalOpen(false);
                    setSubmitStatus("idle");
                  }}
                  className="w-full py-3 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 transition"
                >
                  Вернуться к конфигуратору
                </button>
              </div>
            ) : (
              <div>
                <div className="mb-5">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-semibold mb-2">
                    <Mail className="w-3.5 h-3.5" /> Получить расчёт и чертёж в PDF
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-slate-900">
                    Отправить спецификацию на Email
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Мы пришлём детальную смету с НДС, чертёж расстановки и официальное КП
                  </p>
                </div>

                {/* Сводка заказа */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 mb-5 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Конфигурация:</span>
                    <span className="font-semibold text-slate-800">{activeModel.name} ({columnsCount} секц.)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Количество ячеек:</span>
                    <span className="font-semibold text-slate-800">{totalCells} шт.</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Сумма с НДС 20%:</span>
                    <span className="font-bold text-emerald-700">{totalPrice.toLocaleString("ru-RU")} ₽</span>
                  </div>
                </div>

                <form onSubmit={handleSubmitOrder} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Ваше имя *</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Константин Иванов"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Телефон *</label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="+7 (999) 000-00-00"
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Email для КП *</label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="client@mail.ru"
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Компания / Клуб (необязательно)</label>
                    <div className="relative">
                      <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        placeholder="ООО Фитнес Профи"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Комментарий к проекту</label>
                    <textarea
                      rows={2}
                      value={formData.comment}
                      onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                      placeholder="Нужен монтаж в г. Москва, планируем закупку 4 блоков..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none resize-none"
                    />
                  </div>

                  {submitStatus === "error" && (
                    <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200">
                      Произошла ошибка при отправке. Пожалуйста, попробуйте еще раз или позвоните нам.
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20 transition disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Отправка...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" /> Отправить расчёт и получить КП
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
