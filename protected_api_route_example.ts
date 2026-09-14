import { NextResponse } from "next/server";
import { z } from "zod";

// 1. Схема строгой валидации входящих данных (Zod)
const orderSchema = z.object({
  client: z.object({
    name: z.string().min(2, "Имя слишком короткое").max(100),
    phone: z.string().regex(/^(\+7|7|8)?[\s\-]?\(?[489][0-9]{2}\)?[\s\-]?[0-9]{3}[\s\-]?[0-9]{2}[\s\-]?[0-9]{2}$/, "Некорректный номер телефона"),
    email: z.string().email("Некорректный email"),
    company: z.string().max(150).optional(),
    comment: z.string().max(1000).optional(),
  }),
  // Поле-ловушка для ботов (Honeypot) — должно быть пустым
  hp_website_trap: z.string().max(0).optional(),
  // Временная метка открытия формы клиентом
  form_rendered_at: z.number().optional(),
  // Токен капчи (Turnstile / reCAPTCHA)
  captcha_token: z.string().optional(),
  configuration: z.object({
    model: z.string(),
    columnsCount: z.number().min(1).max(10),
    totalCells: z.number().min(1),
    pricing: z.object({
      totalPrice: z.number().positive(),
    }),
  }),
});

// Простой In-Memory Rate Limiter (для production рекомендуется Upstash Redis)
const ipRequestMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string, limit = 5, windowMs = 60_000): boolean {
  const now = Date.now();
  const record = ipRequestMap.get(ip);

  if (!record || now > record.resetTime) {
    ipRequestMap.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= limit) {
    return false;
  }

  record.count += 1;
  return true;
}

export async function POST(req: Request) {
  try {
    // Получение IP-адреса клиента
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";

    // А) Проверка Rate Limiting (не более 5 заявок в минуту с одного IP)
    if (!checkRateLimit(ip, 5, 60_000)) {
      return NextResponse.json(
        { error: "Слишком много запросов. Пожалуйста, подождите минуту." },
        { status: 429 }
      );
    }

    const body = await req.json();

    // Б) Проверка ловушки Honeypot (боты автоматически заполняют все поля)
    if (body.hp_website_trap && body.hp_website_trap.length > 0) {
      // Возвращаем фиктивный успех, чтобы бот не пытался обойти защиту
      return NextResponse.json({ success: true, message: "Заявка принята" });
    }

    // В) Проверка времени заполнения формы (человек не заполняет форму быстрее 3-4 секунд)
    if (body.form_rendered_at) {
      const duration = Date.now() - body.form_rendered_at;
      if (duration < 2500) { // Меньше 2.5 секунд
        return NextResponse.json({ success: true, message: "Заявка принята" });
      }
    }

    // Г) Валидация структуры данных через Zod
    const validation = orderSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Ошибка валидации", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    // Д) Верификация Cloudflare Turnstile / Google reCAPTCHA
    if (body.captcha_token) {
      const verifyRes = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          secret: process.env.TURNSTILE_SECRET_KEY || "",
          response: body.captcha_token,
          remoteip: ip,
        }),
      });
      const verifyData = await verifyRes.json();
      if (!verifyData.success) {
        return NextResponse.json({ error: "Капча не пройдена" }, { status: 403 });
      }
    }

    const { client, configuration } = validation.data;

    // Е) Успешная обработка заявки: сохранение в БД и отправка Email
    console.log("Заявка успешно защищена и принята:", { client, configuration });

    return NextResponse.json({ 
      success: true, 
      message: "Заявка успешно оформлена и передана в обработку" 
    });

  } catch (error) {
    return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 });
  }
}
