export type SegmentType = 'product_explanation' | 'product_showcase' | 'material_showcase'

export interface Segment {
  id: string;
  videoId: string;
  startTime: number;  // 开始时间（秒）
  endTime: number;    // 结束时间（秒）
  type: SegmentType;  // 片段类型
  products: {         // 相关商品
    name: string;     // 商品名称
    confidence: number; // 置信度
  }[];
  notes?: string;     // 备注
  createdAt: string;  // 创建时间
  updatedAt: string;  // 更新时间
}

export interface CreateSegmentRequest {
  videoId: string;
  startTime: number;
  endTime: number;
  type: SegmentType;
  products: {
    name: string;
    confidence: number;
  }[];
  notes?: string;
}

export interface UpdateSegmentRequest extends Partial<CreateSegmentRequest> {
  id: string;
} 