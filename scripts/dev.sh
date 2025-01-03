#!/bin/bash

# 创建必要的目录
mkdir -p uploads exports temp/frames

# 检查 FFmpeg 是否安装
if ! command -v ffmpeg &> /dev/null; then
    echo "错误: FFmpeg 未安装"
    echo "请安装 FFmpeg:"
    echo "  macOS: brew install ffmpeg"
    echo "  Ubuntu: sudo apt-get install ffmpeg"
    exit 1
fi

# 启动开发服务器
npm run dev 