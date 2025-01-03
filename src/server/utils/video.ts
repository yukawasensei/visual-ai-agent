import { join } from 'path'
import { readdir, mkdir, unlink } from 'fs/promises'
import ffmpeg from 'fluent-ffmpeg'
import { promisify } from 'util'

// 确保目录存在
async function ensureDir(dir: string): Promise<void> {
  try {
    await mkdir(dir, { recursive: true })
  } catch (error) {
    if ((error as any).code !== 'EEXIST') {
      throw error
    }
  }
}

// 获取视频时长（秒）
export async function getVideoDuration(videoPath: string): Promise<number> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(videoPath, (err, metadata) => {
      if (err) reject(err)
      else resolve(metadata.format.duration || 0)
    })
  })
}

// 提取视频帧
export async function extractFrames(
  videoPath: string,
  options: {
    interval?: number;  // 帧间隔（秒）
    maxFrames?: number; // 最大帧数
  } = {}
): Promise<string[]> {
  const {
    interval = 1,
    maxFrames = 100
  } = options

  // 创建临时目录
  const framesDir = join(process.cwd(), 'temp', 'frames')
  await ensureDir(framesDir)

  // 获取视频时长
  const duration = await getVideoDuration(videoPath)
  
  // 计算实际间隔，确保不超过最大帧数
  const actualInterval = Math.max(interval, duration / maxFrames)
  
  // 提取帧
  const framePattern = join(framesDir, `frame-%d.jpg`)
  await new Promise<void>((resolve, reject) => {
    ffmpeg(videoPath)
      .outputOptions([
        `-vf fps=1/${actualInterval}`,
        '-frame_pts 1'
      ])
      .output(framePattern)
      .on('end', () => resolve())
      .on('error', (err) => reject(err))
      .run()
  })

  // 获取生成的帧文件列表
  const files = await readdir(framesDir)
  return files
    .filter(file => file.startsWith('frame-') && file.endsWith('.jpg'))
    .sort((a, b) => {
      const numA = parseInt(a.replace('frame-', '').replace('.jpg', ''))
      const numB = parseInt(b.replace('frame-', '').replace('.jpg', ''))
      return numA - numB
    })
    .map(file => join(framesDir, file))
}

// 清理临时文件
export async function cleanupFrames(frames: string[]): Promise<void> {
  await Promise.all(frames.map(frame => {
    try {
      return unlink(frame)
    } catch (error) {
      console.warn(`清理帧文件失败 (${frame}):`, error)
    }
  }))
} 