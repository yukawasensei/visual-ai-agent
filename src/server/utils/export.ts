import { join } from 'path'
import { mkdir, stat, writeFile, unlink } from 'fs/promises'
import ffmpeg from 'fluent-ffmpeg'
import { randomUUID } from 'crypto'
import type { ExportedSegment, ExportResult } from '../types/export'
import type { Segment } from '../types/segment'
import { getVideoById } from './database'

// 质量预设
const QUALITY_PRESETS = {
  high: { videoBitrate: '2000k', audioBitrate: '192k' },
  medium: { videoBitrate: '1000k', audioBitrate: '128k' },
  low: { videoBitrate: '500k', audioBitrate: '96k' }
}

// 确保导出目录存在
async function ensureExportDir(): Promise<string> {
  const exportDir = join(process.cwd(), 'exports')
  await mkdir(exportDir, { recursive: true })
  return exportDir
}

// 导出单个片段
async function exportSegment(
  sourceVideo: string,
  segment: Segment,
  options: {
    format: string;
    quality: keyof typeof QUALITY_PRESETS;
  }
): Promise<ExportedSegment> {
  const exportDir = await ensureExportDir()
  const outputFilename = `segment-${randomUUID()}.${options.format}`
  const outputPath = join(exportDir, outputFilename)

  const preset = QUALITY_PRESETS[options.quality]

  await new Promise<void>((resolve, reject) => {
    ffmpeg(sourceVideo)
      .setStartTime(segment.startTime)
      .setDuration(segment.endTime - segment.startTime)
      .videoBitrate(preset.videoBitrate)
      .audioBitrate(preset.audioBitrate)
      .output(outputPath)
      .on('end', () => resolve())
      .on('error', (err) => reject(err))
      .run()
  })

  const stats = await stat(outputPath)

  return {
    id: randomUUID(),
    originalSegmentId: segment.id,
    filename: outputFilename,
    path: outputPath,
    size: stats.size,
    duration: segment.endTime - segment.startTime,
    createdAt: new Date().toISOString()
  }
}

// 合并片段
async function mergeSegments(
  segments: ExportedSegment[],
  options: {
    format: string;
    quality: keyof typeof QUALITY_PRESETS;
  }
): Promise<string> {
  const exportDir = await ensureExportDir()
  const outputFilename = `merged-${randomUUID()}.${options.format}`
  const outputPath = join(exportDir, outputFilename)

  const preset = QUALITY_PRESETS[options.quality]

  // 创建合并文件列表
  const listPath = join(exportDir, `${randomUUID()}.txt`)
  const listContent = segments
    .map(s => `file '${s.path}'`)
    .join('\n')
  await writeFile(listPath, listContent, 'utf-8')

  try {
    await new Promise<void>((resolve, reject) => {
      ffmpeg()
        .input(listPath)
        .inputOptions(['-f', 'concat', '-safe', '0'])
        .videoBitrate(preset.videoBitrate)
        .audioBitrate(preset.audioBitrate)
        .output(outputPath)
        .on('end', () => resolve())
        .on('error', (err) => reject(err))
        .run()
    })

    return outputPath
  } finally {
    // 清理临时文件
    await unlink(listPath).catch(console.error)
  }
}

// 主导出函数
export async function exportVideoSegments(
  videoId: string,
  segmentIds: string[],
  options: {
    format?: string;
    quality?: keyof typeof QUALITY_PRESETS;
    mergeSegments?: boolean;
  } = {}
): Promise<ExportResult> {
  // 获取视频信息
  const video = await getVideoById(videoId)
  if (!video) {
    throw new Error('视频不存在')
  }

  // 验证片段
  if (!video.segments) {
    throw new Error('视频没有片段信息')
  }

  const segments = video.segments.filter(s => segmentIds.includes(s.id))
  if (segments.length === 0) {
    throw new Error('未找到指定的片段')
  }

  // 设置默认选项
  const exportOptions = {
    format: options.format || 'mp4',
    quality: options.quality || 'high',
    mergeSegments: options.mergeSegments || false
  }

  // 导出每个片段
  const exportedSegments = await Promise.all(
    segments.map(segment => 
      exportSegment(video.path, segment, exportOptions)
    )
  )

  // 计算总大小和时长
  const totalSize = exportedSegments.reduce((sum, s) => sum + s.size, 0)
  const totalDuration = exportedSegments.reduce((sum, s) => sum + s.duration, 0)

  // 如果需要合并片段
  let downloadUrl: string | undefined
  if (exportOptions.mergeSegments && exportedSegments.length > 1) {
    const mergedPath = await mergeSegments(exportedSegments, exportOptions)
    downloadUrl = `/downloads/${mergedPath.split('/').pop()}`
  }

  return {
    videoId,
    segments: exportedSegments,
    totalSize,
    totalDuration,
    format: exportOptions.format,
    quality: exportOptions.quality,
    downloadUrl
  }
} 