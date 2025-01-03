export const API_CONFIG = {
  GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,
  MAX_VIDEO_SIZE: 100 * 1024 * 1024, // 100MB
  SUPPORTED_VIDEO_FORMATS: ['.mp4', '.mov', '.avi', '.mkv'],
  MIN_SEGMENT_DURATIONS: {
    product_explanation: 180, // 3 minutes
    product_showcase: 60,    // 1 minute
    material_showcase: 30,   // 30 seconds
  },
  DEFAULT_LANGUAGE: 'zh-CN',
} as const;

export const GEMINI_CONFIG = {
  MODEL: 'gemini-2.0-flash-exp',
  MAX_OUTPUT_TOKENS: 2048,
  TEMPERATURE: 0.4,
  TOP_P: 1,
  TOP_K: 32,
  MAX_RETRIES: 3,
} as const; 