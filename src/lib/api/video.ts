import type { AnalyzeVideoRequest, AnalyzeVideoResponse } from '@/types/video';

export async function analyzeVideo(
  request: AnalyzeVideoRequest
): Promise<AnalyzeVideoResponse> {
  try {
    const formData = new FormData();
    formData.append('file', request.file);
    
    if (request.options) {
      formData.append('options', JSON.stringify(request.options));
    }

    const response = await fetch('/api/analyze', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || '视频分析失败');
    }

    return data;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知错误',
    };
  }
} 