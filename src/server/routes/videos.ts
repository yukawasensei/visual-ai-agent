import { Hono } from 'hono'
import { getAllVideos, getVideoById } from '../utils/database'

const app = new Hono()

// 获取视频列表
app.get('/api/videos', async (c) => {
  try {
    // 获取查询参数
    const { page = '1', limit = '10', status, sort = 'uploadedAt' } = c.req.query()
    
    // 获取所有视频
    let videos = await getAllVideos()

    // 根据状态筛选
    if (status) {
      videos = videos.filter(video => video.status === status)
    }

    // 排序
    videos.sort((a, b) => {
      if (sort === 'uploadedAt') {
        return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
      }
      if (sort === 'size') {
        return b.size - a.size
      }
      return 0
    })

    // 分页
    const pageNum = parseInt(page)
    const limitNum = parseInt(limit)
    const startIndex = (pageNum - 1) * limitNum
    const endIndex = pageNum * limitNum
    const paginatedVideos = videos.slice(startIndex, endIndex)

    // 返回响应
    return c.json({
      success: true,
      data: {
        videos: paginatedVideos,
        pagination: {
          total: videos.length,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(videos.length / limitNum)
        }
      }
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

export default app 