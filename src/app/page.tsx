"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [count, setCount] = useState(0);

  const handleClick = () => {
    setCount(prev => prev + 1);
    console.log('按钮被点击了！');
  };

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">视频分析工具</h1>
          <p className="text-gray-500">
            上传视频文件，AI 将自动分析并标记视频片段，用于数字人直播训练
          </p>
        </div>

        <div className="space-y-4">
          <Button 
            onClick={handleClick}
            variant="default"
            size="lg"
            className="w-full md:w-auto"
          >
            测试按钮 (点击次数: {count})
          </Button>

          <p className="text-sm text-gray-500">
            点击按钮测试交互效果
          </p>
        </div>
      </div>
    </main>
  );
} 