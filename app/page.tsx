import Image from "next/image";
// app/page.tsx

import type { Metadata } from "next";
// 如果你有 shadcn 的 UI 组件库，可以按需引入，例如：
import { Button } from "@/components/ui/button";
import "./globals.css";

export const metadata: Metadata = {
  title: "首页",
  description: "使用 Next.js 与 shadcn 风格实现的首页布局示例",
};

export default function Home() {
  return (
    <div className="min-h-screen flex">
      {/* 主要内容区域 */}
      <div className="flex-1 flex flex-col">
        {/* 主内容 */}
        <h1 className="text-3xl font-bold">欢迎来到首页</h1>
        <p className="mt-4 text-base">
          这里是主要内容区域，可以根据业务需求定制更多组件。
        </p>
      </div>
    </div>
  );
}
