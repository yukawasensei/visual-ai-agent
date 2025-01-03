export interface AnalysisResult {
  objects: {
    label: string;
    confidence: number;
    boundingBox?: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
    timestamp: number;
  }[];
  faces: {
    confidence: number;
    emotions?: string[];
    boundingBox?: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
    timestamp: number;
  }[];
  actions: {
    label: string;
    confidence: number;
    startTime: number;
    endTime: number;
  }[];
  summary: {
    productExplanations: {
      timestamp: number;
      duration: number;
      description: string;
    }[];
    productShowcases: {
      timestamp: number;
      duration: number;
      productName: string;
    }[];
    hostAppearances: {
      timestamp: number;
      duration: number;
      action: string;
    }[];
  };
} 