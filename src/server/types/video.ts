import type { AnalysisResult } from './analysis'
import type { Segment } from './segment'

export interface VideoInfo {
  id: string;
  filename: string;
  originalname: string;
  mimetype: string;
  size: number;
  path: string;
  uploadedAt: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  analysis?: AnalysisResult;
  segments?: Segment[];
  error?: string;
}

export interface VideosDatabase {
  videos: VideoInfo[];
  lastUpdated: string;
} 