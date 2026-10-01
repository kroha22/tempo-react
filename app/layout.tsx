import type { Metadata } from "next";
import "./globals.css";
import "@/features/practice/adult-lessons.css";

export const metadata: Metadata = {
  title: "Tempo — европейский португальский",
  description: "Европейский португальский: короткие уроки, практика спряжений и карточки для повторения слов.",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
