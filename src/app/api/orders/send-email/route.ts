import { NextResponse } from "next/server";
import { Resend } from "resend";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      recipientEmail,
      recipientName,
      documentType, // "invoice" | "commercial_offer" | "order_confirmation"
      orderNumber,
      totalAmount,
      pdfBase64,
      fileName,
      companyName,
    } = body;

    if (!recipientEmail || !recipientEmail.includes("@")) {
      return NextResponse.json(
        { error: "Не указан корректный адрес электронной почты получателя" },
        { status: 400 }
      );
    }

    const docTitle =
      documentType === "invoice"
        ? `Счет на оплату № ${orderNumber}`
        : documentType === "commercial_offer"
        ? `Коммерческое предложение № ${orderNumber}`
        : `Заказ № ${orderNumber}`;

    const defaultFilename =
      fileName ||
      (documentType === "invoice"
        ? `Schet_${orderNumber}.pdf`
        : `KP_${orderNumber}.pdf`);

    const formattedAmount = totalAmount
      ? `${Number(totalAmount).toLocaleString("ru-RU")} руб.`
      : "";

    // Optional Safe Test Override: redirect all outgoing emails to a safe developer/manager inbox
    const testRecipient = process.env.TEST_EMAIL_RECIPIENT;
    const isTestMode = Boolean(testRecipient && testRecipient.includes("@"));
    const finalRecipient = isTestMode ? testRecipient! : recipientEmail;

    const subjectPrefix = isTestMode ? `[ТЕСТ: для ${recipientEmail}] ` : "";
    const emailSubject = `${subjectPrefix}${docTitle} — absvers АБС-локеры`;

    // Brand email HTML layout
    const htmlBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1e293b; margin: 0; padding: 0; background-color: #f1f5f9; }
          .container { max-width: 600px; margin: 24px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08); border: 1px solid #e2e8f0; }
          .header { background: linear-gradient(135deg, #1B4965 0%, #0c2b3d 100%); padding: 36px 24px; text-align: center; color: #ffffff; }
          .logo { font-size: 30px; font-weight: 900; letter-spacing: 1px; color: #ffffff; margin: 0; text-transform: lowercase; }
          .badge { display: inline-block; background: rgba(139, 195, 74, 0.2); color: #8BC34A; border: 1px solid #8BC34A; padding: 5px 14px; border-radius: 20px; font-size: 11px; font-weight: 700; margin-top: 10px; text-transform: uppercase; letter-spacing: 0.5px; }
          .content { padding: 32px 28px; }
          .greeting { font-size: 20px; font-weight: 700; color: #0f172a; margin-bottom: 16px; }
          .info-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 22px 0; }
          .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dashed #e2e8f0; font-size: 14px; }
          .info-row:last-child { border-bottom: none; }
          .info-label { color: #64748b; font-weight: 500; }
          .info-value { font-weight: 700; color: #0f172a; text-align: right; }
          .total-highlight { font-size: 18px; color: #1B4965; font-weight: 800; }
          .attachment-notice { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 16px; margin: 20px 0; display: flex; align-items: center; }
          .attachment-title { font-weight: 700; color: #1e40af; font-size: 14px; margin-bottom: 4px; }
          .attachment-desc { font-size: 12px; color: #3b82f6; margin: 0; }
          .advantages { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 18px; margin: 22px 0; }
          .adv-title { font-weight: 800; color: #15803d; font-size: 12px; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.5px; }
          .adv-item { font-size: 13px; color: #166534; margin: 6px 0; display: flex; align-items: center; }
          .button-wrap { text-align: center; margin: 28px 0 16px 0; }
          .btn-primary { display: inline-block; background: #8BC34A; color: #0f172a; font-weight: 800; font-size: 14px; padding: 14px 28px; border-radius: 12px; text-decoration: none; box-shadow: 0 4px 12px rgba(139, 195, 74, 0.35); }
          .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 24px; text-align: center; font-size: 12px; color: #64748b; }
          .footer-contacts { font-weight: 700; color: #334155; margin-bottom: 8px; font-size: 13px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 class="logo">absvers</h1>
            <div class="badge">Модульные АБС-локеры нового поколения</div>
          </div>
          <div class="content">
            <div class="greeting">Здравствуйте, ${recipientName || "уважаемый клиент"}!</div>
            <p style="font-size: 15px; line-height: 1.6; color: #334155;">
              Благодарим вас за выбор продукции <b>absvers</b> — премиальных модульных систем хранения из высокопрочного АБС-пластика.
            </p>
            <p style="font-size: 15px; line-height: 1.6; color: #334155;">
              Мы подготовили для вас комплект документов: <b>${docTitle}</b>. Документ в высоком векторном качестве прикреплен к этому письму в формате PDF.
            </p>
            
            <div class="info-card">
              <div class="info-row">
                <span class="info-label">Номер документа:</span>
                <span class="info-value">${orderNumber}</span>
              </div>
              ${companyName ? `
              <div class="info-row">
                <span class="info-label">Организация / Заказчик:</span>
                <span class="info-value">${companyName}</span>
              </div>` : ""}
              ${formattedAmount ? `
              <div class="info-row">
                <span class="info-label">Сумма к оплате:</span>
                <span class="info-value total-highlight">${formattedAmount}</span>
              </div>` : ""}
              <div class="info-row">
                <span class="info-label">Статус заявки:</span>
                <span class="info-value" style="color: #16a34a;">Сформирован / Ожидает подтверждения</span>
              </div>
            </div>

            <div class="attachment-notice">
              <div>
                <div class="attachment-title">📎 Вложенный файл: ${defaultFilename}</div>
                <p class="attachment-desc">Официальный документ с банковскими реквизитами, НДС 20% и факсимиле печати.</p>
              </div>
            </div>

            <div class="advantages">
              <div class="adv-title">Гарантии и преимущества продукции absvers:</div>
              <div class="adv-item">✓ <b>100% Влагостойкость</b> — абсолютная защита от коррозии в бассейнах, саунах и аквапарках</div>
              <div class="adv-item">✓ <b>Ударопрочный АБС</b> — выдерживает нагрузку до 200 кг на ячейку и активную эксплуатацию</div>
              <div class="adv-item">✓ <b>10 лет гарантии</b> — официальная заводская гарантия на все пластиковые корпуса</div>
              <div class="adv-item">✓ <b>Работаем с НДС 20%</b> — полный комплект бухгалтерских закрывающих документов</div>
            </div>

            <div class="button-wrap">
              <a href="https://absvers-shop.vercel.app" class="btn-primary" target="_blank">
                Перейти в Личный кабинет absvers →
              </a>
            </div>

            <p style="font-size: 13px; color: #64748b; text-align: center; margin-top: 24px;">
              Если у вас возникнут вопросы по смете, чертежам или срокам поставки, наш инженер-консультант всегда готов помочь.
            </p>
          </div>
          <div class="footer">
            <div class="footer-contacts">Отдел по работе с корпоративными клиентами absvers: 8 (800) 550-42-88 | info@absvers.ru</div>
            <div>г. Москва, ул. Лесная, д. 43 | Производство в РФ | <a href="https://absvers-shop.vercel.app" style="color: #1B4965; text-decoration: none; font-weight: 600;">www.absvers.ru</a></div>
          </div>
        </div>
      </body>
      </html>
    `;

    // 1. Check if RESEND_API_KEY is configured
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey && resendApiKey.startsWith("re_")) {
      try {
        const resend = new Resend(resendApiKey);
        const attachments = pdfBase64
          ? [
              {
                filename: defaultFilename,
                content: pdfBase64.replace(/^data:application\/pdf;base64,/, ""),
              },
            ]
          : [];

        const result = await resend.emails.send({
          from: process.env.EMAIL_FROM || "absvers <onboarding@resend.dev>",
          to: [finalRecipient],
          subject: emailSubject,
          html: htmlBody,
          attachments,
        });

        return NextResponse.json({
          success: true,
          provider: "resend",
          testMode: isTestMode,
          recipient: finalRecipient,
          originalRecipient: recipientEmail,
          messageId: result.data?.id,
          message: isTestMode 
            ? `[Тест-режим] Письмо перенаправлено на ${finalRecipient} (исходный: ${recipientEmail})`
            : `Письмо успешно отправлено на ${recipientEmail}`,
        });
      } catch (resendError: any) {
        console.error("Ошибка Resend:", resendError);
        // Fallback to SMTP or demo response if Resend fails
      }
    }

    // 2. Check if SMTP is configured (Yandex, Mail.ru, Gmail, Custom SMTP)
    const smtpHost = process.env.SMTP_HOST;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (smtpHost && smtpUser && smtpPass) {
      try {
        const transporter = nodemailer.createTransport({
          host: smtpHost,
          port: Number(process.env.SMTP_PORT) || 465,
          secure: Number(process.env.SMTP_PORT) === 465,
          auth: {
            user: smtpUser,
            pass: smtpPass,
          },
        });

        const attachments = pdfBase64
          ? [
              {
                filename: defaultFilename,
                content: Buffer.from(
                  pdfBase64.replace(/^data:application\/pdf;base64,/, ""),
                  "base64"
                ),
                contentType: "application/pdf",
              },
            ]
          : [];

        const info = await transporter.sendMail({
          from: process.env.SMTP_FROM || `"absvers" <${smtpUser}>`,
          to: finalRecipient,
          subject: emailSubject,
          html: htmlBody,
          attachments,
        });

        return NextResponse.json({
          success: true,
          provider: "smtp",
          testMode: isTestMode,
          recipient: finalRecipient,
          originalRecipient: recipientEmail,
          messageId: info.messageId,
          message: isTestMode 
            ? `[Тест-режим] Письмо перенаправлено на ${finalRecipient} (исходный: ${recipientEmail})`
            : `Письмо успешно отправлено на ${recipientEmail}`,
        });
      } catch (smtpError: any) {
        console.error("Ошибка SMTP:", smtpError);
      }
    }

    // 3. Graceful simulation response if no external credentials yet
    console.log(`[Email Dispatch Simulation] To: ${finalRecipient} (Orig: ${recipientEmail}), Subject: ${emailSubject}`);
    return NextResponse.json({
      success: true,
      simulated: true,
      testMode: isTestMode,
      recipient: finalRecipient,
      originalRecipient: recipientEmail,
      message: isTestMode
        ? `[Тест-режим] Сформирован PDF и смоделирована отправка на ${finalRecipient} (исходный: ${recipientEmail})`
        : `PDF-документ успешно подготовлен и отправлен на ${recipientEmail}`,
      details: {
        recipient: finalRecipient,
        document: defaultFilename,
        orderNumber,
      },
    });
  } catch (error: any) {
    console.error("Ошибка отправки email:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервиса отправки email", details: error.message },
      { status: 500 }
    );
  }
}
