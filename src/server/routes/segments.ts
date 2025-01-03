import { Hono } from 'hono'
import { 
  addSegment, 
  updateSegment, 
  deleteSegment, 
  getVideoSegments,
  getSegmentById
} from '../utils/segments'
import type { CreateSegmentRequest, UpdateSegmentRequest } from '../types/segment'

const app = new Hono()

// 创建片段
app.post('/api/segments', async (c) => {
  try {
    const body = await c.req.json() as CreateSegmentRequest
    
    // 验证请求体
    if (!body.videoId || body.startTime === undefined || body.endTime === undefined || !body.type) {
      return c.json(
        {
          success: false,
          error: '缺少必要字段'
        },
        400
      )
    }

    // 验证时间范围
    if (body.startTime < 0 || body.endTime <= body.startTime) {
      return c.json(
        {
          success: false,
          error: '无效的时间范围'
        },
        400
      )
    }

    const segment = await addSegment(body)
    return c.json({
      success: true,
      data: segment
    })
  } catch (error) {
    console.error('创建片段失败:', error)
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '创建片段失败'
      },
      error instanceof Error && error.message === '视频不存在' ? 404 : 500
    )
  }
})

// 更新片段
app.put('/api/segments/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const body = await c.req.json() as Partial<CreateSegmentRequest>
    
    // 验证时间范围
    if (
      (body.startTime !== undefined || body.endTime !== undefined) &&
      ((body.startTime || 0) < 0 || (body.endTime || 0) <= (body.startTime || 0))
    ) {
      return c.json(
        {
          success: false,
          error: '无效的时间范围'
        },
        400
      )
    }

    const segment = await updateSegment({ id, ...body })
    return c.json({
      success: true,
      data: segment
    })
  } catch (error) {
    console.error('更新片段失败:', error)
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '更新片段失败'
      },
      error instanceof Error && error.message === '片段不存在' ? 404 : 500
    )
  }
})

// 删除片段
app.delete('/api/segments/:id', async (c) => {
  try {
    const id = c.req.param('id')
    await deleteSegment(id)
    return c.json({
      success: true,
      data: { message: '片段已删除' }
    })
  } catch (error) {
    console.error('删除片段失败:', error)
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '删除片段失败'
      },
      error instanceof Error && error.message === '片段不存在' ? 404 : 500
    )
  }
})

// 获取视频的所有片段
app.get('/api/videos/:videoId/segments', async (c) => {
  try {
    const videoId = c.req.param('videoId')
    const segments = await getVideoSegments(videoId)
    return c.json({
      success: true,
      data: segments
    })
  } catch (error) {
    console.error('获取片段列表失败:', error)
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '获取片段列表失败'
      },
      error instanceof Error && error.message === '视频不存在' ? 404 : 500
    )
  }
})

// 获取单个片段
app.get('/api/segments/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const segment = await getSegmentById(id)

    if (!segment) {
      return c.json(
        {
          success: false,
          error: '片段不存在'
        },
        404
      )
    }

    return c.json({
      success: true,
      data: segment
    })
  } catch (error) {
    console.error('获取片段失败:', error)
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '获取片段失败'
      },
      500
    )
  }
})

export default app 