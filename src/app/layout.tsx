import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "absvers — Модульные шкафчики-локеры из инженерного АБС-пластика",
  description: "Официальный интернет-магазин локеров absvers: гигиена, прочность, 100% влагостойкость для фитнес-клубов, школ, офисов и производств.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className="min-h-screen bg-slate-50 text-slate-800 antialiased">
        {children}
      </body>
    </html>
  );
}
