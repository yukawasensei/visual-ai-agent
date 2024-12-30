"use client";

import { useState } from "react";
import VideoUploader from "@/components/VideoUploader";
import VideoAnalyzer from "@/components/VideoAnalyzer";
import { VideoSegment } from "@/types/video";

export default function Home() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [segments, setSegments] = useState<VideoSegment[]>([]);
  const [analyzing, setAnalyzing] = useState(false);

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">视频分析工具</h1>
          <p className="text-gray-500">
            上传视频文件，AI 将自动分析并标记视频片段，用于数字人直播训练
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <VideoUploader
              onVideoSelect={(file) => setVideoFile(file)}
              disabled={analyzing}
            />
            {videoFile && (
              <VideoAnalyzer
                videoFile={videoFile}
                onAnalysisStart={() => setAnalyzing(true)}
                onAnalysisComplete={(results) => {
                  setSegments(results);
                  setAnalyzing(false);
                }}
              />
            )}
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">分析结果</h2>
            {segments.length > 0 ? (
              <div className="space-y-4">
                {segments.map((segment, index) => (
                  <div
                    key={index}
                    className="p-4 border rounded-lg hover:border-blue-500 transition-colors"
                  >
                    <h3 className="font-medium">片段 {index + 1}</h3>
                    <p className="text-sm text-gray-500">
                      时间: {segment.startTime}s - {segment.endTime}s
                    </p>
                    <p className="text-sm text-gray-500">
                      类型: {segment.type}
                    </p>
                    <p className="mt-2">{segment.description}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">
                {analyzing
                  ? "正在分析视频..."
                  : "上传并分析视频后，这里将显示分析结果"}
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
} 