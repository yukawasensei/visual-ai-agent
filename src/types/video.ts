export interface VideoSegment {
  type: 'product_explanation' | 'product_showcase' | 'material_showcase';
  startTime: number;
  endTime: number;
  confidence: number;
  description?: string;
}

export interface AnalysisResult {
  videoId: string;
  fileName: string;
  duration: number;
  segments: VideoSegment[];
  createdAt: Date;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
}

export interface AnalyzeVideoRequest {
  file: File;
  options?: {
    language?: string;
    minDuration?: number;
  };
}

export interface AnalyzeVideoResponse {
  success: boolean;
  data?: AnalysisResult;
  error?: string;
} 