import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LUOSHEN 洛神 · 家庭健康用水守护系统",
  description: "LUOSHEN connects household water status with care for every family member.",
  icons: {
    icon: "/luoshen-logo.png",
    shortcut: "/luoshen-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">{children}</body>
    </html>
  );
}
