import React, { useState, useEffect } from 'react';
import { Slider } from './ui/slider';

interface VideoSegment {
  id: string;
  startTime: number;
  endTime: number;
  type: string;
  tags: string[];
}

interface VideoTimelineProps {
  duration: number;
  segments?: VideoSegment[];
  onSegmentClick?: (segment: VideoSegment) => void;
  currentTime?: number;
  onTimeChange?: (time: number) => void;
}

export function VideoTimeline({
  duration = 0,
  segments = [],
  onSegmentClick,
  currentTime = 0,
  onTimeChange
}: VideoTimelineProps) {
  const [selectedSegment, setSelectedSegment] = useState<string | null>(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSegmentClick = (segment: VideoSegment) => {
    setSelectedSegment(segment.id);
    onSegmentClick?.(segment);
  };

  const getSegmentStyle = (segment: VideoSegment) => {
    const left = (segment.startTime / duration) * 100;
    const width = ((segment.endTime - segment.startTime) / duration) * 100;
    
    let backgroundColor = 'bg-blue-500';
    switch (segment.type) {
      case 'product':
        backgroundColor = 'bg-green-500';
        break;
      case 'face':
        backgroundColor = 'bg-purple-500';
        break;
      case 'action':
        backgroundColor = 'bg-orange-500';
        break;
    }

    return {
      left: `${left}%`,
      width: `${width}%`,
      backgroundColor: selectedSegment === segment.id ? 'bg-blue-700' : backgroundColor
    };
  };

  if (!duration) {
    return (
      <div className="w-full p-6 bg-white rounded-lg shadow text-center text-gray-500">
        等待视频分析结果...
      </div>
    );
  }

  return (
    <div className="w-full space-y-4 p-6 bg-white rounded-lg shadow">
      <div className="flex justify-between text-sm text-gray-500">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>

      <div className="relative h-20">
        {/* 时间轴背景 */}
        <div className="absolute w-full h-1 bg-gray-200 top-1/2 transform -translate-y-1/2"></div>

        {/* 当前时间指示器 */}
        <div
          className="absolute w-0.5 h-full bg-red-500 transform -translate-x-1/2"
          style={{ left: `${(currentTime / duration) * 100}%` }}
        ></div>

        {/* 视频片段 */}
        {segments?.length > 0 ? (
          segments.map((segment) => (
            <div
              key={segment.id}
              className={`absolute h-12 rounded cursor-pointer transition-all
                hover:brightness-110 ${selectedSegment === segment.id ? 'ring-2 ring-blue-300' : ''}`}
              style={getSegmentStyle(segment)}
              onClick={() => handleSegmentClick(segment)}
            >
              <div className="p-2 text-xs text-white truncate">
                {segment.tags.join(', ')}
              </div>
            </div>
          ))
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-500">
            暂无分析结果
          </div>
        )}
      </div>

      {/* 时间滑块 */}
      <Slider
        value={[currentTime]}
        max={duration}
        step={0.1}
        onValueChange={(value: number[]) => onTimeChange?.(value[0])}
      />

      {/* 图例 */}
      <div className="flex space-x-4 text-sm">
        <div className="flex items-center">
          <div className="w-3 h-3 rounded bg-green-500 mr-2"></div>
          <span>产品</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded bg-purple-500 mr-2"></div>
          <span>人脸</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded bg-orange-500 mr-2"></div>
          <span>动作</span>
        </div>
      </div>
    </div>
  );
} 