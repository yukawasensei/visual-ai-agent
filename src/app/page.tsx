"use client";

import { useState } from 'react';
import VideoUploader from '@/components/VideoUploader';
import { VideoTimeline } from '@/components/VideoTimeline';

interface AnalysisResult {
  segments: Array<{
    id: string;
    startTime: number;
    endTime: number;
    type: string;
    tags: string[];
  }>;
  duration: number;
}

export default function Home() {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [currentTime, setCurrentTime] = useState(0);

  const handleUploadComplete = (result: AnalysisResult) => {
    setAnalysisResult(result);
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold text-center mb-8">
          视频内容智能分析
        </h1>
        
        <div className="space-y-8">
          <VideoUploader onUploadComplete={handleUploadComplete} />
          
          {analysisResult && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">视频分析结果</h2>
              <VideoTimeline
                duration={analysisResult.duration}
                segments={analysisResult.segments}
                currentTime={currentTime}
                onTimeChange={setCurrentTime}
                onSegmentClick={(segment) => {
                  console.log('Selected segment:', segment);
                }}
              />
            </div>
          )}
        </div>
      </div>
    </main>
  );
} 