export type VideoSegmentType = 
  | "商品讲解"  // 主播正常口播讲解商品
  | "商品展示"  // 主播手持商品讲解
  | "素材展示"; // 主播手持商品或展示板

export interface VideoSegment {
  startTime: number;
  endTime: number;
  type: VideoSegmentType;
  description: string;
  confidence: number;
  thumbnailUrl?: string;
} 