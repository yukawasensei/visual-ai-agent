import { Hono } from 'hono'
import { serveStatic } from '@hono/node-server/serve-static'
import type { ExportSegmentsRequest } from '../types/export'
import { exportVideoSegments } from '../utils/export'

const app = new Hono()

// 静态文件服务
app.use('/downloads/*', serveStatic({ root: './exports' }))

// 导出片段
app.post('/api/export-segments', async (c) => {
  try {
    const body = await c.req.json() as ExportSegmentsRequest
    
    // 验证请求体
    if (!body.videoId || !body.segmentIds || body.segmentIds.length === 0) {
      return c.json(
        {
          success: false,
          error: '缺少必要字段'
        },
        400
      )
    }

    // 验证格式
    if (body.format && !['mp4', 'mov', 'avi'].includes(body.format)) {
      return c.json(
        {
          success: false,
          error: '不支持的导出格式'
        },
        400
      )
    }

    // 验证质量
    if (body.quality && !['high', 'medium', 'low'].includes(body.quality)) {
      return c.json(
        {
          success: false,
          error: '无效的质量设置'
        },
        400
      )
    }

    // 导出视频片段
    const result = await exportVideoSegments(
      body.videoId,
      body.segmentIds,
      {
        format: body.format,
        quality: body.quality as 'high' | 'medium' | 'low',
        mergeSegments: body.mergeSegments
      }
    )

    return c.json({
      success: true,
      data: result
    })
  } catch (error) {
    console.error('导出片段失败:', error)
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '导出片段失败'
      },
      error instanceof Error && 
      (error.message === '视频不存在' || error.message === '未找到指定的片段') 
        ? 404 
        : 500
    )
  }
})

export default app 