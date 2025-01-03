import { readFile, writeFile } from 'fs/promises'
import { join } from 'path'
import type { VideoInfo, VideosDatabase } from '../types/video'
import type { AnalysisResult } from '../types/analysis'

const DB_FILE = join(process.cwd(), 'videos.json')

// 初始化数据库结构
const initDB: VideosDatabase = {
  videos: [],
  lastUpdated: new Date().toISOString()
}

// 读取数据库
export async function readDB(): Promise<VideosDatabase> {
  try {
    const data = await readFile(DB_FILE, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    // 如果文件不存在，创建新的数据库文件
    await writeFile(DB_FILE, JSON.stringify(initDB, null, 2))
    return initDB
  }
}

// 写入数据库
export async function writeDB(data: VideosDatabase): Promise<void> {
  await writeFile(DB_FILE, JSON.stringify(data, null, 2))
}

// 添加视频记录
export async function addVideo(video: VideoInfo): Promise<void> {
  const db = await readDB()
  db.videos.push(video)
  db.lastUpdated = new Date().toISOString()
  await writeDB(db)
}

// 获取所有视频
export async function getAllVideos(): Promise<VideoInfo[]> {
  const db = await readDB()
  return db.videos
}

// 根据 ID 获取视频
export async function getVideoById(id: string): Promise<VideoInfo | undefined> {
  const db = await readDB()
  return db.videos.find(video => video.id === id)
}

// 更新视频状态和分析结果
export async function updateVideoStatus(
  id: string,
  status: VideoInfo['status'],
  analysis?: AnalysisResult,
  error?: string
): Promise<void> {
  const db = await readDB()
  const video = db.videos.find(v => v.id === id)
  if (video) {
    video.status = status
    if (analysis) {
      video.analysis = analysis
    }
    if (error) {
      video.error = error
    }
    db.lastUpdated = new Date().toISOString()
    await writeDB(db)
  }
} 