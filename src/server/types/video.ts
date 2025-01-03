export interface VideoInfo {
  id: string;
  filename: string;
  originalname: string;
  mimetype: string;
  size: number;
  path: string;
  uploadedAt: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

export interface VideosDatabase {
  videos: VideoInfo[];
  lastUpdated: string;
} 