import { randomUUID } from 'crypto'
import type { Segment, CreateSegmentRequest, UpdateSegmentRequest } from '../types/segment'
import { readDB, writeDB } from './database'

// 添加片段
export async function addSegment(request: CreateSegmentRequest): Promise<Segment> {
  const db = await readDB()
  const video = db.videos.find(v => v.id === request.videoId)
  
  if (!video) {
    throw new Error('视频不存在')
  }

  const segment: Segment = {
    id: randomUUID(),
    videoId: request.videoId,
    startTime: request.startTime,
    endTime: request.endTime,
    type: request.type,
    products: request.products,
    notes: request.notes,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }

  if (!video.segments) {
    video.segments = []
  }

  // 验证时间段是否重叠
  const hasOverlap = video.segments.some(s => 
    (segment.startTime >= s.startTime && segment.startTime <= s.endTime) ||
    (segment.endTime >= s.startTime && segment.endTime <= s.endTime) ||
    (segment.startTime <= s.startTime && segment.endTime >= s.endTime)
  )

  if (hasOverlap) {
    throw new Error('片段时间段重叠')
  }

  video.segments.push(segment)
  video.segments.sort((a, b) => a.startTime - b.startTime)
  
  db.lastUpdated = new Date().toISOString()
  await writeDB(db)

  return segment
}

// 更新片段
export async function updateSegment(request: UpdateSegmentRequest): Promise<Segment> {
  const db = await readDB()
  const video = db.videos.find(v => v.segments?.some(s => s.id === request.id))

  if (!video || !video.segments) {
    throw new Error('片段不存在')
  }

  const segmentIndex = video.segments.findIndex(s => s.id === request.id)
  const segment = video.segments[segmentIndex]

  // 更新字段
  if (request.startTime !== undefined) segment.startTime = request.startTime
  if (request.endTime !== undefined) segment.endTime = request.endTime
  if (request.type !== undefined) segment.type = request.type
  if (request.products !== undefined) segment.products = request.products
  if (request.notes !== undefined) segment.notes = request.notes
  segment.updatedAt = new Date().toISOString()

  // 验证时间段是否重叠
  const otherSegments = video.segments.filter((_, i) => i !== segmentIndex)
  const hasOverlap = otherSegments.some(s => 
    (segment.startTime >= s.startTime && segment.startTime <= s.endTime) ||
    (segment.endTime >= s.startTime && segment.endTime <= s.endTime) ||
    (segment.startTime <= s.startTime && segment.endTime >= s.endTime)
  )

  if (hasOverlap) {
    throw new Error('片段时间段重叠')
  }

  // 重新排序
  video.segments.sort((a, b) => a.startTime - b.startTime)
  
  db.lastUpdated = new Date().toISOString()
  await writeDB(db)

  return segment
}

// 删除片段
export async function deleteSegment(id: string): Promise<void> {
  const db = await readDB()
  const video = db.videos.find(v => v.segments?.some(s => s.id === id))

  if (!video || !video.segments) {
    throw new Error('片段不存在')
  }

  video.segments = video.segments.filter(s => s.id !== id)
  db.lastUpdated = new Date().toISOString()
  await writeDB(db)
}

// 获取视频的所有片段
export async function getVideoSegments(videoId: string): Promise<Segment[]> {
  const db = await readDB()
  const video = db.videos.find(v => v.id === videoId)

  if (!video) {
    throw new Error('视频不存在')
  }

  return video.segments || []
}

// 获取单个片段
export async function getSegmentById(id: string): Promise<Segment | undefined> {
  const db = await readDB()
  for (const video of db.videos) {
    if (video.segments) {
      const segment = video.segments.find(s => s.id === id)
      if (segment) return segment
    }
  }
  return undefined
} 