import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "视频分析工具",
  description: "基于 Gemini API 的视频内容分析工具",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh">
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b shadow-sm z-10">
          <div className="container mx-auto px-4 h-full flex items-center justify-between">
            <h1 className="text-xl font-bold">视频分析工具</h1>
            <nav className="space-x-4">
              <a href="/" className="hover:text-blue-600">首页</a>
              <a href="/about" className="hover:text-blue-600">关于</a>
            </nav>
          </div>
        </header>

        <main className="flex-grow container mx-auto px-4 pt-20 pb-16">
          {children}
        </main>

        <footer className="fixed bottom-0 left-0 right-0 h-12 bg-white border-t">
          <div className="container mx-auto px-4 h-full flex items-center justify-center">
            <p className="text-sm text-gray-600">© 2024 视频分析工具. All rights reserved.</p>
          </div>
        </footer>
      </body>
    </html>
  );
} 