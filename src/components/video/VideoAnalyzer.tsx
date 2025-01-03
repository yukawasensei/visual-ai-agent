"use client";

import { useState, useEffect } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { VideoSegment, VideoSegmentType } from "@/types/video";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface VideoAnalyzerProps {
  videoFile: File;
  onAnalysisStart: () => void;
  onAnalysisComplete: (segments: VideoSegment[]) => void;
}

export default function VideoAnalyzer({
  videoFile,
  onAnalysisStart,
  onAnalysisComplete,
}: VideoAnalyzerProps) {
  const [progress, setProgress] = useState(0);
  const [analyzing, setAnalyzing] = useState(false);

  const analyzeVideo = async () => {
    try {
      setAnalyzing(true);
      onAnalysisStart();

      // 初始化 Gemini API
      const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");
      const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });

      // 将视频分割成帧进行分析
      const frameRate = 1; // 每秒分析一帧
      const duration = await getVideoDuration(videoFile);
      const totalFrames = Math.floor(duration);
      
      let segments: VideoSegment[] = [];
      let currentSegment: VideoSegment | null = null;

      for (let i = 0; i < totalFrames; i += frameRate) {
        const frame = await extractFrame(videoFile, i);
        const result = await analyzeFrame(model, frame);
        
        if (result.type !== currentSegment?.type) {
          if (currentSegment) {
            segments.push({
              ...currentSegment,
              endTime: i
            });
          }
          
          currentSegment = {
            startTime: i,
            endTime: i + 1,
            type: result.type,
            description: result.description,
            confidence: result.confidence
          };
        } else if (currentSegment) {
          currentSegment.endTime = i + 1;
          currentSegment.confidence = Math.max(currentSegment.confidence, result.confidence);
        }

        setProgress((i / totalFrames) * 100);
      }

      if (currentSegment) {
        segments.push(currentSegment);
      }

      // 合并相近的相同类型片段
      segments = mergeSegments(segments);

      onAnalysisComplete(segments);
    } catch (error) {
      console.error("视频分析失败:", error);
    } finally {
      setAnalyzing(false);
      setProgress(0);
    }
  };

  return (
    <div className="space-y-4">
      <Button
        onClick={analyzeVideo}
        disabled={analyzing}
        className="w-full"
      >
        {analyzing ? "正在分析..." : "开始分析"}
      </Button>
      {analyzing && (
        <div className="space-y-2">
          <Progress value={progress} />
          <p className="text-sm text-gray-500 text-center">
            {Math.round(progress)}% 完成
          </p>
        </div>
      )}
    </div>
  );
}

// 辅助函数
async function getVideoDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => resolve(video.duration);
    video.onerror = reject;
    video.src = URL.createObjectURL(file);
  });
}

async function extractFrame(file: File, timeInSeconds: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    video.onloadeddata = () => {
      video.currentTime = timeInSeconds;
    };

    video.onseeked = () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx?.drawImage(video, 0, 0);
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Failed to extract frame"));
      }, "image/jpeg");
    };

    video.onerror = reject;
    video.src = URL.createObjectURL(file);
  });
}

async function analyzeFrame(model: any, frame: Blob) {
  const result = await model.generateContent([
    "分析这个视频帧，判断是否属于以下类型之一：",
    "1. 商品讲解：主播正常口播讲解商品，需要主播面部完整可见",
    "2. 商品展示：主播手持商品讲解，需要主播面部完整可见",
    "3. 素材展示：主播手持商品或者商品演示展板",
    "请返回类型和描述，以及置信度（0-1）",
    frame
  ]);

  const response = result.response.text();
  // 解析响应，返回类型、描述和置信度
  // 这里需要根据实际的 API 响应格式进行调整
  return {
    type: "商品讲解" as VideoSegmentType,
    description: response,
    confidence: 0.8
  };
}

function mergeSegments(segments: VideoSegment[]): VideoSegment[] {
  const merged: VideoSegment[] = [];
  let current: VideoSegment | null = null;

  for (const segment of segments) {
    if (!current) {
      current = { ...segment };
    } else if (
      current.type === segment.type &&
      segment.startTime - current.endTime <= 2 // 合并间隔小于 2 秒的片段
    ) {
      current.endTime = segment.endTime;
      current.confidence = Math.max(current.confidence, segment.confidence);
    } else {
      merged.push(current);
      current = { ...segment };
    }
  }

  if (current) {
    merged.push(current);
  }

  return merged;
} 