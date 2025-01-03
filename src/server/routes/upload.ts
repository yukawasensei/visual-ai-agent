import { Hono } from 'hono'
import { join } from 'path'
import { mkdir, writeFile } from 'fs/promises'
import { API_CONFIG } from '../config/api'
import { addVideo, getAllVideos, getVideoById, updateVideoStatus } from '../utils/database'
import { randomUUID } from 'crypto'
import { analyzeVideo } from '../services/videoAnalysis'

const app = new Hono()

// 获取视频列表
app.get('/api/videos', async (c) => {
  try {
    const videos = await getAllVideos()
    return c.json({
      success: true,
      data: videos
    })
  } catch (error) {
    console.error('获取视频列表失败:', error)
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '获取视频列表失败'
      },
      500
    )
  }
})

// 获取单个视频信息
app.get('/api/videos/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const video = await getVideoById(id)

    if (!video) {
      return c.json(
        {
          success: false,
          error: '视频不存在'
        },
        404
      )
    }

    return c.json({
      success: true,
      data: video
    })
  } catch (error) {
    console.error('获取视频信息失败:', error)
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '获取视频信息失败'
      },
      500
    )
  }
})

// 文件上传路由
app.post('/api/upload', async (c) => {
  try {
    const body = await c.req.parseBody()
    const file = body.video

    if (!file || !(file instanceof File)) {
      return c.json(
        {
          success: false,
          error: '请上传视频文件'
        },
        400
      )
    }

    // 验证文件大小
    if (file.size > API_CONFIG.MAX_VIDEO_SIZE) {
      return c.json(
        {
          success: false,
          error: '文件大小超过限制'
        },
        400
      )
    }

    // 验证文件类型
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
    if (!API_CONFIG.SUPPORTED_VIDEO_FORMATS.includes(fileExtension as any)) {
      return c.json(
        {
          success: false,
          error: '不支持的文件格式'
        },
        400
      )
    }

    // 创建上传目录
    const uploadDir = join(process.cwd(), 'uploads')
    await mkdir(uploadDir, { recursive: true })

    // 生成唯一文件名
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    const filename = `${uniqueSuffix}${fileExtension}`
    const filepath = join(uploadDir, filename)

    // 保存文件
    const buffer = await file.arrayBuffer()
    await writeFile(filepath, Buffer.from(buffer))

    // 创建视频记录
    const videoId = randomUUID()
    const videoInfo = {
      id: videoId,
      filename,
      originalname: file.name,
      mimetype: file.type,
      size: file.size,
      path: filepath,
      uploadedAt: new Date().toISOString(),
      status: 'processing' as const
    }

    // 保存到数据库
    await addVideo(videoInfo)

    // 启动异步分析
    analyzeVideo(filepath, {
      interval: 1,    // 每秒一帧
      maxFrames: 100  // 最多分析 100 帧
    })
      .then(async (analysis) => {
        // 更新视频状态和分析结果
        await updateVideoStatus(videoId, 'completed', analysis)
      })
      .catch(async (error) => {
        console.error('视频分析失败:', error)
        await updateVideoStatus(videoId, 'failed', undefined, error.message)
      })

    // 返回成功响应
    return c.json({
      success: true,
      data: {
        ...videoInfo,
        message: '视频已上传，正在进行分析'
      }
    })

  } catch (error) {
    console.error('文件上传失败:', error)
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '文件上传失败'
      },
      500
    )
  }
})

export default app 