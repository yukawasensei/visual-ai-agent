import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai'
import { readFileSync } from 'fs'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'
import { GEMINI_CONFIG } from '../config/api'

// 配置 Gemini
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '')

// 创建模型实例
const model = genAI.getGenerativeModel({ 
  model: GEMINI_CONFIG.MODEL,
  safetySettings: [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
  ],
})

interface AnalysisResult {
  type: string
  tags: string[]
  confidence: number
}

interface VideoSegment {
  type: string
  tags: string[]
  startFrame: number
}

async function analyzeImage(imagePath: string): Promise<AnalysisResult | null> {
  try {
    const imageData = readFileSync(imagePath)
    const imageBase64 = imageData.toString('base64')
    
    const result = await model.generateContent({
      contents: [{
        role: 'user',
        parts: [
          { text: `分析这个视频帧图像，识别以下内容：
1. 产品：识别画面中的商品、物品等
2. 人物：识别人脸、表情、动作等
3. 场景：识别环境、背景等

请用 JSON 格式返回结果，包含以下字段：
- type: 主要类型（product/face/action）
- tags: 标签数组
- confidence: 置信度（0-1）` },
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: imageBase64
            }
          }
        ]
      }],
      generationConfig: {
        maxOutputTokens: GEMINI_CONFIG.MAX_OUTPUT_TOKENS,
        temperature: GEMINI_CONFIG.TEMPERATURE,
        topP: GEMINI_CONFIG.TOP_P,
        topK: GEMINI_CONFIG.TOP_K,
      }
    })

    const response = await result.response
    return JSON.parse(response.text()) as AnalysisResult
  } catch (error) {
    console.error('分析图像失败:', error)
    return null
  }
}

export async function analyzeVideo(videoPath: string, frameCount: number): Promise<{
  segments: Array<{
    id: string
    startTime: number
    endTime: number
    type: string
    tags: string[]
  }>
  duration: number
}> {
  const framesDir = join(process.cwd(), 'temp', 'frames')
  const results: (AnalysisResult | null)[] = []
  const batchSize = 5 // 每批处理的图像数量
  
  // 批量处理图像
  for (let i = 0; i < frameCount; i += batchSize) {
    const batch = Array.from({ length: Math.min(batchSize, frameCount - i) }, (_, j) => {
      const frameIndex = i + j
      const framePath = join(framesDir, `frame-${frameIndex}.jpg`)
      return analyzeImage(framePath)
    })

    const batchResults = await Promise.all(batch)
    results.push(...batchResults)
    
    // 每批处理完后等待一小段时间
    if (i + batchSize < frameCount) {
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }

  // 处理分析结果
  const segments: Array<{
    id: string
    startTime: number
    endTime: number
    type: string
    tags: string[]
  }> = []

  let currentSegment: VideoSegment | null = null

  results.forEach((result, index) => {
    if (!result) return

    const frameTime = (index / frameCount) * 30 // 假设视频是 30 秒

    if (!currentSegment || currentSegment.type !== result.type) {
      if (currentSegment) {
        segments.push({
          id: uuidv4(),
          startTime: (currentSegment.startFrame / frameCount) * 30,
          endTime: frameTime,
          type: currentSegment.type,
          tags: currentSegment.tags
        })
      }

      currentSegment = {
        type: result.type,
        tags: result.tags,
        startFrame: index
      }
    } else {
      // 更新当前片段的标签
      currentSegment.tags = Array.from(new Set([...currentSegment.tags, ...result.tags]))
    }
  })

  // 添加最后一个片段
  if (currentSegment) {
    segments.push({
      id: uuidv4(),
      startTime: (currentSegment.startFrame / frameCount) * 30,
      endTime: 30,
      type: currentSegment.type,
      tags: currentSegment.tags
    })
  }

  return {
    segments,
    duration: 30 // 假设视频是 30 秒
  }
} 