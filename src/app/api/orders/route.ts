import { NextResponse } from "next/server";
import { z } from "zod";

const orderSchema = z.object({
  client: z.object({
    name: z.string().min(2, "Имя слишком короткое").max(100),
    phone: z.string().min(6, "Некорректный телефон"),
    email: z.string().email("Некорректный email"),
    company: z.string().max(150).optional(),
    comment: z.string().max(1000).optional(),
  }),
  configuration: z.any().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validation = orderSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Ошибка валидации", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    console.log("Новая заявка absvers:", validation.data);

    return NextResponse.json({
      success: true,
      message: "Заявка успешно принята в обработку",
      orderNumber: `ABS-${Math.floor(100000 + Math.random() * 900000)}`,
    });
  } catch (error) {
    return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 });
  }
}
