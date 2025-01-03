import { GoogleGenerativeAI } from '@google/generative-ai'
import { readFile } from 'fs/promises'
import type { AnalysisResult } from '../types/analysis'
import { extractFrames, cleanupFrames } from '../utils/video'

// 配置 Gemini API
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '')
const model = genAI.getGenerativeModel({ model: 'gemini-pro-vision' })

// 分析单个图像
async function analyzeImage(imagePath: string, timestamp: number) {
  try {
    const imageData = await readFile(imagePath)
    const imageParts = [{
      inlineData: {
        data: imageData.toString('base64'),
        mimeType: 'image/jpeg'
      }
    }]

    const prompt = `分析这个视频帧，识别以下内容：
1. 商品：识别画面中的商品，包括位置和名称
2. 主播：识别主播的面部表情和动作
3. 场景：判断当前是否在进行商品讲解或展示

请用 JSON 格式返回结果，包含以下字段：
- objects: 识别到的商品列表，每个商品包含 label（名称）和 confidence（置信度）
- faces: 识别到的人脸信息，包含 emotions（表情）和 confidence（置信度）
- actions: 识别到的动作，包含 label（动作描述）和 confidence（置信度）
- sceneType: 场景类型（product_explanation/product_showcase/other）

注意：
1. 只返回 JSON 格式的结果，不要包含其他文字
2. confidence 值范围为 0-1
3. 如果没有识别到某类内容，对应字段返回空数组

示例响应格式：
{
  "objects": [
    { "label": "手机", "confidence": 0.95 }
  ],
  "faces": [
    { "emotions": ["专注", "微笑"], "confidence": 0.88 }
  ],
  "actions": [
    { "label": "手持商品", "confidence": 0.92 }
  ],
  "sceneType": "product_showcase"
}`

    const result = await model.generateContent([prompt, ...imageParts])
    const response = await result.response
    const text = response.text()
    
    try {
      return {
        ...JSON.parse(text),
        timestamp
      }
    } catch (e) {
      console.error('解析 Gemini 响应失败:', text)
      throw e
    }
  } catch (error) {
    console.error(`分析图像失败 (${imagePath}):`, error)
    throw error
  }
}

// 合并分析结果
function mergeResults(frameResults: any[]): AnalysisResult {
  const result: AnalysisResult = {
    objects: [],
    faces: [],
    actions: [],
    summary: {
      productExplanations: [],
      productShowcases: [],
      hostAppearances: []
    }
  }

  let currentScene = {
    type: '',
    startTime: 0,
    objects: new Set<string>(),
    actions: new Set<string>()
  }

  frameResults.forEach((frame, index) => {
    // 添加物体识别结果
    if (frame.objects) {
      result.objects.push(...frame.objects.map((obj: any) => ({
        ...obj,
        timestamp: frame.timestamp
      })))
    }

    // 添加人脸识别结果
    if (frame.faces) {
      result.faces.push(...frame.faces.map((face: any) => ({
        ...face,
        timestamp: frame.timestamp
      })))
    }

    // 场景分析
    if (frame.sceneType !== currentScene.type) {
      if (currentScene.type) {
        // 结束当前场景
        const duration = frame.timestamp - currentScene.startTime
        if (currentScene.type === 'product_explanation') {
          result.summary.productExplanations.push({
            timestamp: currentScene.startTime,
            duration,
            description: Array.from(currentScene.objects).join(', ')
          })
        } else if (currentScene.type === 'product_showcase') {
          result.summary.productShowcases.push({
            timestamp: currentScene.startTime,
            duration,
            productName: Array.from(currentScene.objects).join(', ')
          })
        }

        // 记录主播出现
        if (frame.faces?.length > 0) {
          result.summary.hostAppearances.push({
            timestamp: currentScene.startTime,
            duration,
            action: Array.from(currentScene.actions).join(', ')
          })
        }
      }
      // 开始新场景
      currentScene = {
        type: frame.sceneType,
        startTime: frame.timestamp,
        objects: new Set<string>(),
        actions: new Set<string>()
      }
    }

    // 更新当前场景的物体和动作
    frame.objects?.forEach((obj: any) => currentScene.objects.add(obj.label))
    frame.actions?.forEach((action: any) => currentScene.actions.add(action.label))
  })

  return result
}

// 主分析函数
export async function analyzeVideo(
  videoPath: string,
  options: {
    interval?: number;
    maxFrames?: number;
  } = {}
): Promise<AnalysisResult> {
  try {
    // 提取视频帧
    console.log('正在提取视频帧...')
    const frames = await extractFrames(videoPath, options)

    try {
      // 分析每一帧
      console.log('正在分析视频帧...')
      const frameResults = await Promise.all(
        frames.map(async (frame, index) => {
          const timestamp = index * (options.interval || 1)
          return analyzeImage(frame, timestamp)
        })
      )

      // 合并结果
      console.log('正在合并分析结果...')
      const result = mergeResults(frameResults)

      return result
    } finally {
      // 清理临时文件
      await cleanupFrames(frames)
    }
  } catch (error) {
    console.error('视频分析失败:', error)
    throw error
  }
} 