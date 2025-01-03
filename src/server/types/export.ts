export interface ExportSegmentsRequest {
  videoId: string;
  segmentIds: string[];
  format?: 'mp4' | 'mov' | 'avi';  // 导出格式
  quality?: 'high' | 'medium' | 'low';  // 导出质量
  mergeSegments?: boolean;  // 是否合并片段
}

export interface ExportedSegment {
  id: string;
  originalSegmentId: string;
  filename: string;
  path: string;
  size: number;
  duration: number;
  createdAt: string;
}

export interface ExportResult {
  videoId: string;
  segments: ExportedSegment[];
  totalSize: number;
  totalDuration: number;
  format: string;
  quality: string;
  downloadUrl?: string;  // 如果合并导出，则提供下载链接
} 