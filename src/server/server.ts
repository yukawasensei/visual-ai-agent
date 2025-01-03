import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { prettyJSON } from 'hono/pretty-json'
import uploadRouter from './routes/upload'
import videosRouter from './routes/videos'
import segmentsRouter from './routes/segments'
import exportRouter from './routes/export'

// 创建 Hono 应用实例
const app = new Hono()

// 配置中间件
app.use('*', logger())
app.use('*', prettyJSON())
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  exposeHeaders: ['Content-Length', 'X-Request-Id'],
  maxAge: 3600,
  credentials: true,
}))

// 注册路由
app.route('', uploadRouter)
app.route('', videosRouter)
app.route('', segmentsRouter)
app.route('', exportRouter)

// 健康检查路由
app.get('/api/health', (c) => {
  return c.json(
    {
      status: 'ok',
      message: 'Server is running',
      timestamp: new Date().toISOString()
    },
    200
  )
})

// 错误处理中间件
app.onError((err, c) => {
  console.error(`[ERROR] ${err.message}`)
  return c.json(
    {
      status: 'error',
      message: err.message
    },
    500
  )
})

// 404 处理
app.notFound((c) => {
  return c.json(
    {
      status: 'error',
      message: 'Not Found'
    },
    404
  )
})

// 配置服务器
const port = Number(process.env.PORT) || 3001

// 导出 Hono 应用实例（用于测试）和启动函数
export const startServer = () => {
  serve({
    fetch: app.fetch,
    port
  })
  console.log(`🚀 Server is running on http://localhost:${port}`)
}

export default app 