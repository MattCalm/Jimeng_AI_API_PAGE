import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "即梦 4.0 生成器",
  description: "通过 Next.js 调用火山引擎即梦 4.0 接口"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
