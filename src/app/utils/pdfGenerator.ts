import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { ROBOTO_REGULAR_BASE64, ROBOTO_BOLD_BASE64 } from "./pdfFonts";

// Register Roboto fonts for Cyrillic / Russian language support
export function setupCyrillicFont(doc: jsPDF) {
  try {
    doc.addFileToVFS("Roboto-Regular.ttf", ROBOTO_REGULAR_BASE64);
    doc.addFileToVFS("Roboto-Bold.ttf", ROBOTO_BOLD_BASE64);
    doc.addFont("Roboto-Regular.ttf", "Roboto", "normal");
    doc.addFont("Roboto-Bold.ttf", "Roboto", "bold");
    doc.setFont("Roboto", "normal");
  } catch (e) {
    console.error("Error setting up Cyrillic font in jsPDF:", e);
  }
}

export interface PdfOrderItem {
  name: string;
  description?: string;
  dimensions?: string;
  quantity: number;
  price: number;
}

export interface PdfClientInfo {
  name: string;
  phone: string;
  email?: string;
  company?: string;
  inn?: string;
  kpp?: string;
  city?: string;
  address?: string;
}

export interface PdfPricingInfo {
  subtotal: number;
  discountAmount?: number;
  deliveryCost?: number;
  totalAmount: number;
  vatAmount?: number;
}

export interface PdfOrderData {
  orderNumber: string;
  createdAt?: string;
  client: PdfClientInfo;
  items: PdfOrderItem[];
  pricing: PdfPricingInfo;
  status?: string;
  deliveryMethod?: string;
  managerComment?: string;
}

/**
 * 1. Создание документа Коммерческого Предложения (КП)
 */
export function createCommercialOfferPdfDoc(order: PdfOrderData): jsPDF {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  setupCyrillicFont(doc);

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Primary colors: #1B4965 (Dark Blue), #8BC34A (Apple Green), #64748B (Slate Gray)
  const colorPrimary = [27, 73, 101]; // #1B4965
  const colorAccent = [139, 195, 74]; // #8BC34A
  const colorTextDark = [30, 41, 59]; // Slate 800
  const colorMuted = [100, 116, 139]; // Slate 500

  // Top header bar
  doc.setFillColor(colorPrimary[0], colorPrimary[1], colorPrimary[2]);
  doc.rect(0, 0, pageWidth, 28, "F");

  // Green accent stripe
  doc.setFillColor(colorAccent[0], colorAccent[1], colorAccent[2]);
  doc.rect(0, 28, pageWidth, 2.5, "F");

  // Logo text
  doc.setFont("Roboto", "bold");
  doc.setFontSize(20);
  doc.setTextColor(255, 255, 255);
  doc.text("absvers", 14, 15);

  doc.setFont("Roboto", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(190, 227, 248);
  doc.text("МОДУЛЬНЫЕ АБС-ЛОКЕРЫ НОВОГО ПОКОЛЕНИЯ", 14, 21);

  // Supplier contacts on right
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text("8 (800) 550-42-88  |  info@absvers.ru", pageWidth - 14, 13, { align: "right" });
  doc.text("www.absvers.ru  |  Производство в РФ", pageWidth - 14, 19, { align: "right" });

  // Document Title
  doc.setFont("Roboto", "bold");
  doc.setFontSize(15);
  doc.setTextColor(colorPrimary[0], colorPrimary[1], colorPrimary[2]);
  doc.text("КОММЕРЧЕСКОЕ ПРЕДЛОЖЕНИЕ", 14, 40);

  doc.setFont("Roboto", "normal");
  doc.setFontSize(9);
  doc.setTextColor(colorMuted[0], colorMuted[1], colorMuted[2]);
  const dateStr = order.createdAt || new Date().toLocaleDateString("ru-RU");
  doc.text(`№ ${order.orderNumber} от ${dateStr}`, 14, 46);

  // Client info card (gray background)
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, 51, pageWidth - 28, 26, 2, 2, "FD");

  doc.setFont("Roboto", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(colorPrimary[0], colorPrimary[1], colorPrimary[2]);
  doc.text("ЗАКАЗЧИК:", 18, 57);

  doc.setFont("Roboto", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(colorTextDark[0], colorTextDark[1], colorTextDark[2]);
  
  const clientName = order.client.company 
    ? `${order.client.company} (конт. лицо: ${order.client.name})` 
    : order.client.name;
  doc.text(`Наименование: ${clientName}`, 18, 63);
  doc.text(`Телефон: ${order.client.phone}${order.client.email ? `  |  Email: ${order.client.email}` : ""}`, 18, 68);
  if (order.client.address || order.client.city) {
    const addr = [order.client.city, order.client.address].filter(Boolean).join(", ");
    doc.text(`Адрес поставки: ${addr}`, 18, 73);
  } else {
    doc.text(`Условия поставки: Доставка транспортной компанией / Самовывоз`, 18, 73);
  }

  // Items Table
  const tableData = order.items.map((item, index) => {
    let title = item.name;
    if (item.description) title += `\n${item.description}`;
    if (item.dimensions) title += `\nГабариты: ${item.dimensions}`;
    const sum = (item.price * item.quantity).toLocaleString("ru-RU") + " руб.";
    return [
      (index + 1).toString(),
      title,
      `${item.quantity} шт.`,
      item.price.toLocaleString("ru-RU") + " руб.",
      sum
    ];
  });

  autoTable(doc, {
    startY: 81,
    head: [["№", "Наименование оборудования / Комплектация", "Кол-во", "Цена за ед.", "Сумма"]],
    body: tableData,
    theme: "striped",
    headStyles: {
      fillColor: [27, 73, 101],
      textColor: [255, 255, 255],
      font: "Roboto",
      fontStyle: "bold",
      fontSize: 8.5,
      halign: "center",
      valign: "middle",
      cellPadding: 2.5,
    },
    styles: {
      font: "Roboto",
      fontSize: 8,
      textColor: [30, 41, 59],
      cellPadding: 2.5,
      valign: "middle",
    },
    columnStyles: {
      0: { halign: "center", cellWidth: 10 },
      1: { halign: "left", cellWidth: "auto" },
      2: { halign: "center", cellWidth: 20 },
      3: { halign: "right", cellWidth: 32 },
      4: { halign: "right", cellWidth: 32, fontStyle: "bold" },
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    margin: { left: 14, right: 14 },
  });

  const finalY = (doc as any).lastAutoTable.finalY + 6;

  // Totals summary box
  const totalBoxWidth = 85;
  const totalBoxX = pageWidth - 14 - totalBoxWidth;

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(totalBoxX, finalY, totalBoxWidth, 34, 2, 2, "FD");

  doc.setFont("Roboto", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(colorMuted[0], colorMuted[1], colorMuted[2]);
  doc.text("Сумма без скидки:", totalBoxX + 4, finalY + 6);
  doc.text((order.pricing.subtotal || order.pricing.totalAmount).toLocaleString("ru-RU") + " руб.", totalBoxX + totalBoxWidth - 4, finalY + 6, { align: "right" });

  if (order.pricing.discountAmount && order.pricing.discountAmount > 0) {
    doc.text("Скидка по акции / объему:", totalBoxX + 4, finalY + 12);
    doc.setTextColor(220, 38, 38);
    doc.text(`-${order.pricing.discountAmount.toLocaleString("ru-RU")} руб.`, totalBoxX + totalBoxWidth - 4, finalY + 12, { align: "right" });
    doc.setTextColor(colorMuted[0], colorMuted[1], colorMuted[2]);
  }

  const deliveryCost = order.pricing.deliveryCost || 0;
  doc.text("Доставка:", totalBoxX + 4, finalY + 18);
  doc.text(deliveryCost > 0 ? `${deliveryCost.toLocaleString("ru-RU")} руб.` : "По тарифам ТК", totalBoxX + totalBoxWidth - 4, finalY + 18, { align: "right" });

  doc.setDrawColor(226, 232, 240);
  doc.line(totalBoxX + 4, finalY + 22, totalBoxX + totalBoxWidth - 4, finalY + 22);

  doc.setFont("Roboto", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(colorPrimary[0], colorPrimary[1], colorPrimary[2]);
  doc.text("ИТОГО К ОПЛАТЕ:", totalBoxX + 4, finalY + 28);
  doc.text(order.pricing.totalAmount.toLocaleString("ru-RU") + " руб.", totalBoxX + totalBoxWidth - 4, finalY + 28, { align: "right" });

  const vat = order.pricing.vatAmount || Math.round(order.pricing.totalAmount * (20 / 120));
  doc.setFont("Roboto", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(colorMuted[0], colorMuted[1], colorMuted[2]);
  doc.text(`В т.ч. НДС (20%): ${vat.toLocaleString("ru-RU")} руб.`, totalBoxX + totalBoxWidth - 4, finalY + 32, { align: "right" });

  // Warranty & advantages box on the left of totals
  const advWidth = pageWidth - 28 - totalBoxWidth - 6;
  doc.setFillColor(240, 253, 244);
  doc.setDrawColor(187, 247, 208);
  doc.roundedRect(14, finalY, advWidth, 34, 2, 2, "FD");

  doc.setFont("Roboto", "bold");
  doc.setFontSize(8);
  doc.setTextColor(21, 128, 61); // Green 700
  doc.text("ПРЕИМУЩЕСТВА ПРОДУКЦИИ ABSVERS:", 18, finalY + 6);

  doc.setFont("Roboto", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);
  doc.text("• 100% влагостойкость (не ржавеют во влажных зонах и бассейнах)", 18, finalY + 12);
  doc.text("• Ударопрочный первичный инженерный АБС-пластик (нагрузка до 200 кг)", 18, finalY + 17);
  doc.text("• Официальная заводская гарантия — 10 лет на все корпуса", 18, finalY + 22);
  doc.text("• Срок действия коммерческого предложения — 30 календарных дней", 18, finalY + 27);

  // Footer notes & signature area
  const notesY = Math.min(finalY + 42, pageHeight - 32);

  doc.setFont("Roboto", "bold");
  doc.setFontSize(8);
  doc.setTextColor(colorPrimary[0], colorPrimary[1], colorPrimary[2]);
  doc.text("УСЛОВИЯ ПОСТАВКИ И ОПЛАТЫ:", 14, notesY);

  doc.setFont("Roboto", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(colorMuted[0], colorMuted[1], colorMuted[2]);
  doc.text("1. Оплата по безналичному расчету с НДС 20% (100% предоплата или по согласованию сторон).", 14, notesY + 4.5);
  doc.text("2. Срок отгрузки со склада: 1-3 рабочих дня при наличии, 7-14 рабочих дней при изготовлении под проект.", 14, notesY + 9);
  doc.text("3. Доставка осуществляется транспортными компаниями (Деловые Линии, СДЭК, ПЭК) по всей России и ЕАЭС.", 14, notesY + 13.5);

  // Signatures
  doc.setDrawColor(203, 213, 225);
  doc.line(14, pageHeight - 14, pageWidth - 14, pageHeight - 14);

  doc.setFontSize(7.5);
  doc.setTextColor(colorMuted[0], colorMuted[1], colorMuted[2]);
  doc.text("Руководитель направления ABSVERS: ______________ / Смирнов Д. В. /", 14, pageHeight - 8);
  doc.text(`Документ сформирован автоматически: ${new Date().toLocaleString("ru-RU")}`, pageWidth - 14, pageHeight - 8, { align: "right" });

  return doc;
}

export function generateCommercialOfferPdf(order: PdfOrderData) {
  const doc = createCommercialOfferPdfDoc(order);
  doc.save(`КП_absvers_${order.orderNumber}.pdf`);
}

export function getCommercialOfferPdfBase64(order: PdfOrderData): string {
  const doc = createCommercialOfferPdfDoc(order);
  return doc.output("datauristring");
}

/**
 * 2. Создание документа Официального Счета на оплату (B2B Счет с НДС 20%)
 */
export function createInvoicePdfDoc(order: PdfOrderData): jsPDF {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  setupCyrillicFont(doc);

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const colorTextDark = [15, 23, 42]; // Slate 900
  const colorMuted = [100, 116, 139]; // Slate 500

  // 1. Bank Notice Box (Образец заполнения платежного поручения)
  doc.setFont("Roboto", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(colorMuted[0], colorMuted[1], colorMuted[2]);
  doc.text("Внимание! Оплата данного счета означает согласие с условиями поставки продукции.", 14, 12);

  // Bank table
  autoTable(doc, {
    startY: 15,
    head: [],
    body: [
      ["Банк получателя:\nАО «АЛЬФА-БАНК» г. Москва", "БИК", "044525593"],
      ["", "Сч. №", "30101810200000000593"],
      ["ИНН  7701987654   КПП  770101001", "Сч. №", "40702810901400008892"],
      ["Получатель:\nООО «АБС ВЕРС ТРЕЙДИНГ»", "", ""],
    ],
    theme: "grid",
    styles: {
      font: "Roboto",
      fontSize: 8,
      textColor: [15, 23, 42],
      cellPadding: 2,
      valign: "middle",
      lineColor: [148, 163, 184],
      lineWidth: 0.2,
    },
    columnStyles: {
      0: { cellWidth: 110 },
      1: { cellWidth: 18, halign: "center", textColor: [100, 116, 139] },
      2: { cellWidth: 54, fontStyle: "bold" },
    },
    margin: { left: 14, right: 14 },
  });

  const invoiceTopY = (doc as any).lastAutoTable.finalY + 8;

  // Title: Счет на оплату № ...
  doc.setFont("Roboto", "bold");
  doc.setFontSize(14);
  doc.setTextColor(27, 73, 101); // #1B4965
  const dateStr = order.createdAt || new Date().toLocaleDateString("ru-RU");
  doc.text(`Счет на оплату № ${order.orderNumber} от ${dateStr} г.`, 14, invoiceTopY);

  doc.setDrawColor(27, 73, 101);
  doc.setLineWidth(0.6);
  doc.line(14, invoiceTopY + 2.5, pageWidth - 14, invoiceTopY + 2.5);

  // Parties details
  const partiesY = invoiceTopY + 8;

  doc.setFont("Roboto", "bold");
  doc.setFontSize(8);
  doc.setTextColor(colorMuted[0], colorMuted[1], colorMuted[2]);
  doc.text("Поставщик:", 14, partiesY);

  doc.setFont("Roboto", "normal");
  doc.setTextColor(colorTextDark[0], colorTextDark[1], colorTextDark[2]);
  doc.text("ООО «АБС ВЕРС ТРЕЙДИНГ», ИНН 7701987654, КПП 770101001, 125047, г. Москва, ул. Лесная, д. 43, тел.: 8 (800) 550-42-88", 32, partiesY, { maxWidth: pageWidth - 46 });

  doc.setFont("Roboto", "bold");
  doc.setTextColor(colorMuted[0], colorMuted[1], colorMuted[2]);
  doc.text("Покупатель:", 14, partiesY + 9);

  doc.setFont("Roboto", "normal");
  doc.setTextColor(colorTextDark[0], colorTextDark[1], colorTextDark[2]);
  const buyerName = order.client.company || order.client.name;
  const buyerInn = order.client.inn ? `, ИНН ${order.client.inn}${order.client.kpp ? `, КПП ${order.client.kpp}` : ""}` : "";
  const buyerPhone = order.client.phone ? `, тел.: ${order.client.phone}` : "";
  const buyerAddress = order.client.address ? `, адрес: ${order.client.address}` : "";
  doc.text(`${buyerName}${buyerInn}${buyerAddress}${buyerPhone}`, 32, partiesY + 9, { maxWidth: pageWidth - 46 });

  doc.setFont("Roboto", "bold");
  doc.setTextColor(colorMuted[0], colorMuted[1], colorMuted[2]);
  doc.text("Основание:", 14, partiesY + 18);

  doc.setFont("Roboto", "normal");
  doc.setTextColor(colorTextDark[0], colorTextDark[1], colorTextDark[2]);
  doc.text(`Договор-счет поставки модульных локеров № ${order.orderNumber}`, 32, partiesY + 18);

  // Items Table
  const tableData = order.items.map((item, index) => {
    let name = item.name;
    if (item.dimensions) name += ` (${item.dimensions})`;
    const sum = (item.price * item.quantity).toLocaleString("ru-RU") + " руб.";
    return [
      (index + 1).toString(),
      name,
      item.quantity.toString(),
      "шт",
      item.price.toLocaleString("ru-RU") + " руб.",
      sum
    ];
  });

  autoTable(doc, {
    startY: partiesY + 23,
    head: [["№", "Товары (работы, услуги)", "Кол-во", "Ед.", "Цена", "Сумма"]],
    body: tableData,
    theme: "grid",
    headStyles: {
      fillColor: [241, 245, 249],
      textColor: [15, 23, 42],
      font: "Roboto",
      fontStyle: "bold",
      fontSize: 8,
      halign: "center",
      valign: "middle",
      cellPadding: 2,
      lineColor: [148, 163, 184],
      lineWidth: 0.2,
    },
    styles: {
      font: "Roboto",
      fontSize: 8,
      textColor: [15, 23, 42],
      cellPadding: 2,
      valign: "middle",
      lineColor: [203, 213, 225],
      lineWidth: 0.2,
    },
    columnStyles: {
      0: { halign: "center", cellWidth: 10 },
      1: { halign: "left", cellWidth: "auto" },
      2: { halign: "right", cellWidth: 16 },
      3: { halign: "center", cellWidth: 12 },
      4: { halign: "right", cellWidth: 28 },
      5: { halign: "right", cellWidth: 30, fontStyle: "bold" },
    },
    margin: { left: 14, right: 14 },
  });

  const totalsY = (doc as any).lastAutoTable.finalY + 4;
  const vat = order.pricing.vatAmount || Math.round(order.pricing.totalAmount * (20 / 120));

  // Totals
  doc.setFont("Roboto", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(colorTextDark[0], colorTextDark[1], colorTextDark[2]);
  doc.text("Итого:", pageWidth - 46, totalsY, { align: "right" });
  doc.text(order.pricing.totalAmount.toLocaleString("ru-RU") + " руб.", pageWidth - 14, totalsY, { align: "right" });

  doc.text("В том числе НДС (20%):", pageWidth - 46, totalsY + 5, { align: "right" });
  doc.text(vat.toLocaleString("ru-RU") + " руб.", pageWidth - 14, totalsY + 5, { align: "right" });

  doc.setFontSize(9.5);
  doc.setTextColor(27, 73, 101);
  doc.text("Всего к оплате:", pageWidth - 46, totalsY + 11, { align: "right" });
  doc.text(order.pricing.totalAmount.toLocaleString("ru-RU") + " руб.", pageWidth - 14, totalsY + 11, { align: "right" });

  // Written sum description
  const summaryY = totalsY + 18;
  doc.setFont("Roboto", "normal");
  doc.setFontSize(8);
  doc.setTextColor(colorTextDark[0], colorTextDark[1], colorTextDark[2]);
  doc.text(`Всего наименований ${order.items.length}, на сумму ${order.pricing.totalAmount.toLocaleString("ru-RU")} руб.`, 14, summaryY);

  doc.setFont("Roboto", "bold");
  doc.text(`Сумма прописью: ${numberToWordsRu(order.pricing.totalAmount)}`, 14, summaryY + 4.5);

  doc.setDrawColor(203, 213, 225);
  doc.line(14, summaryY + 8, pageWidth - 14, summaryY + 8);

  // Signatures & Stamp area
  const signY = summaryY + 14;

  doc.setFont("Roboto", "bold");
  doc.setFontSize(8);
  doc.setTextColor(colorTextDark[0], colorTextDark[1], colorTextDark[2]);
  doc.text("Руководитель", 14, signY);
  doc.setFont("Roboto", "normal");
  doc.text("________________ / Смирнов Д. В. /", 38, signY);

  doc.setFont("Roboto", "bold");
  doc.text("Главный бухгалтер", 110, signY);
  doc.setFont("Roboto", "normal");
  doc.text("________________ / Кузнецова Е. А. /", 142, signY);

  // Blue Stamp Simulation Badge
  doc.setDrawColor(37, 99, 235);
  doc.setFillColor(239, 246, 255);
  doc.roundedRect(pageWidth - 60, signY + 4, 46, 20, 3, 3, "FD");

  doc.setFont("Roboto", "bold");
  doc.setFontSize(7);
  doc.setTextColor(37, 99, 235);
  doc.text("ООО «АБС ВЕРС ТРЕЙДИНГ»", pageWidth - 37, signY + 9, { align: "center" });
  doc.setFont("Roboto", "normal");
  doc.setFontSize(6);
  doc.text("ИНН 7701987654 / ОГРН 1227700543210", pageWidth - 37, signY + 13, { align: "center" });
  doc.setFont("Roboto", "bold");
  doc.setFontSize(7);
  doc.text("ДЛЯ ДОКУМЕНТОВ", pageWidth - 37, signY + 18, { align: "center" });

  return doc;
}

export function generateInvoicePdf(order: PdfOrderData) {
  const doc = createInvoicePdfDoc(order);
  doc.save(`Счет_на_оплату_${order.orderNumber}.pdf`);
}

export function getInvoicePdfBase64(order: PdfOrderData): string {
  const doc = createInvoicePdfDoc(order);
  return doc.output("datauristring");
}

/**
 * 3. Генерация PDF для Конфигуратора (Смета и чертеж 3D-проекта)
 */
export function buildConfiguratorOrderData(configData: {
  modelName: string;
  columnsCount: number;
  tiersCount: number;
  totalCells: number;
  dimensions: string;
  lockType: string;
  accessories: string[];
  totalPrice: number;
  vatAmount: number;
  client?: PdfClientInfo;
}): PdfOrderData {
  const orderNumber = `CFG-${Math.floor(1000 + Math.random() * 9000)}`;

  return {
    orderNumber,
    createdAt: new Date().toLocaleDateString("ru-RU"),
    client: configData.client || {
      name: "Покупатель / Проект",
      phone: "+7 (800) 550-42-88",
    },
    items: [
      {
        name: `Модульный комплект локеров ${configData.modelName}`,
        description: `Конфигурация: ${configData.columnsCount} секц. × ${configData.tiersCount} яр. (${configData.totalCells} ячеек), замок: ${configData.lockType}${configData.accessories.length > 0 ? `, опции: ${configData.accessories.join(", ")}` : ""}`,
        dimensions: configData.dimensions,
        quantity: 1,
        price: configData.totalPrice,
      },
    ],
    pricing: {
      subtotal: configData.totalPrice,
      totalAmount: configData.totalPrice,
      vatAmount: configData.vatAmount,
      deliveryCost: 0,
    },
  };
}

export function generateConfiguratorSpecPdf(configData: {
  modelName: string;
  columnsCount: number;
  tiersCount: number;
  totalCells: number;
  dimensions: string;
  lockType: string;
  accessories: string[];
  totalPrice: number;
  vatAmount: number;
  client?: PdfClientInfo;
}) {
  const orderData = buildConfiguratorOrderData(configData);
  generateCommercialOfferPdf(orderData);
}

export function getConfiguratorSpecPdfBase64(configData: {
  modelName: string;
  columnsCount: number;
  tiersCount: number;
  totalCells: number;
  dimensions: string;
  lockType: string;
  accessories: string[];
  totalPrice: number;
  vatAmount: number;
  client?: PdfClientInfo;
}): string {
  const orderData = buildConfiguratorOrderData(configData);
  return getCommercialOfferPdfBase64(orderData);
}

/**
 * Вспомогательная функция суммы прописью (на русском языке)
 */
function numberToWordsRu(num: number): string {
  const units = ["", "один", "два", "три", "четыре", "пять", "шесть", "семь", "восемь", "девять"];
  const teens = ["десять", "одиннадцать", "двенадцать", "тринадцать", "четырнадцать", "пятнадцать", "шестнадцать", "семнадцать", "восемнадцать", "девятнадцать"];
  const tens = ["", "", "двадцать", "тридцать", "сорок", "пятьдесят", "шестьдесят", "семьдесят", "восемьдесят", "девяносто"];
  const hundreds = ["", "сто", "двести", "триста", "четыреста", "пятьсот", "шестьсот", "семьсот", "восемьсот", "девятьсот"];

  if (num === 0) return "ноль рублей 00 копеек";

  const thousands = Math.floor(num / 1000);
  const remainder = Math.floor(num % 1000);

  let result = "";

  // Тысячи
  if (thousands > 0) {
    const h = Math.floor(thousands / 100);
    const t = Math.floor((thousands % 100) / 10);
    const u = thousands % 10;

    if (h > 0) result += hundreds[h] + " ";
    if (t === 1) {
      result += teens[u] + " ";
    } else {
      if (t > 1) result += tens[t] + " ";
      if (u === 1) result += "одна ";
      else if (u === 2) result += "две ";
      else if (u > 2) result += units[u] + " ";
    }

    if (t !== 1 && u === 1) result += "тысяча ";
    else if (t !== 1 && u >= 2 && u <= 4) result += "тысячи ";
    else result += "тысяч ";
  }

  // Сотни и единицы
  if (remainder > 0 || thousands === 0) {
    const h = Math.floor(remainder / 100);
    const t = Math.floor((remainder % 100) / 10);
    const u = remainder % 10;

    if (h > 0) result += hundreds[h] + " ";
    if (t === 1) {
      result += teens[u] + " ";
    } else {
      if (t > 1) result += tens[t] + " ";
      if (u > 0) result += units[u] + " ";
    }
  }

  // Склонение слова рубль
  const lastTen = Math.floor(num % 100);
  const lastUnit = Math.floor(num % 10);
  let rubleStr = "рублей";

  if (lastTen < 10 || lastTen > 20) {
    if (lastUnit === 1) rubleStr = "рубль";
    else if (lastUnit >= 2 && lastUnit <= 4) rubleStr = "рубля";
  }

  result = result.trim();
  if (result.length > 0) {
    result = result.charAt(0).toUpperCase() + result.slice(1);
  }

  return `${result} ${rubleStr} 00 копеек`;
}
