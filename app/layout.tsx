import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { WalletConnectButton } from "./wallet/connect/connect_button";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="min-h-screen flex">
          {/* 侧边栏导航区域 */}
          <aside className="w-40 bg-gray-50 p-6 border-r">
            {/* 添加大标题或logo */}
            <header className="mb-15 flex items-center justify-center">
              {/* 这里可以使用文本标题 */}
              <h1 className="text-5xl font-bold">来</h1>
            </header>
            <nav className="flex flex-col items-center space-y-5">
              <a
                href="/wallet"
                className="text-lg font-medium hover:text-primary transition-colors"
              >
                钱包
              </a>
              <a
                href="/dex"
                className="text-lg font-medium hover:text-primary transition-colors"
              >
                DEX
              </a>
              <a
                href="/quant"
                className="text-lg font-medium hover:text-primary transition-colors"
              >
                量化
              </a>
            </nav>
          </aside>
          {/* 主要内容区域 */}
          <div className="flex-1 flex flex-col">
            {/* 页眉：显示钱包地址 */}
            <header className="flex justify-end items-center p-4 bg-white shadow">
              <WalletConnectButton />
            </header>
            <main className="flex-1 p-8">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
