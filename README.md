# 视频分析工具

这是一个基于 Gemini API 的视频分析工具，可以自动分析视频内容并标记不同类型的片段，用于数字人直播训练。

## 功能特点

- 支持视频文件上传和拖放
- 自动分析视频内容，识别以下类型的片段：
  1. 商品讲解：主播正常口播讲解商品（≥3分钟）
  2. 商品展示：主播手持商品讲解（≥1分钟）
  3. 素材展示：主播手持商品或展示板（≥30秒）
- 实时显示分析进度
- 支持查看和导出分析结果

## 技术栈

- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- Google Gemini API

## 开始使用

1. 克隆项目：
   ```bash
   git clone https://github.com/yourusername/visual-ai-agent.git
   cd visual-ai-agent
   ```

2. 安装依赖：
   ```bash
   npm install
   ```

3. 配置环境变量：
   - 复制 `.env.local.example` 到 `.env.local`
   - 在 `.env.local` 中设置你的 Gemini API 密钥：
     ```
     NEXT_PUBLIC_GEMINI_API_KEY=your_api_key_here
     ```

4. 启动开发服务器：
   ```bash
   npm run dev
   ```

5. 在浏览器中访问 `http://localhost:3000`

## 使用说明

1. 打开网页应用
2. 将视频文件拖放到上传区域，或点击选择文件
3. 点击"开始分析"按钮
4. 等待分析完成，查看结果
5. 可以查看每个片段的详细信息，包括类型、时长和置信度

## 注意事项

- 支持的视频格式：MP4、MOV、AVI、MKV
- 建议上传清晰的视频以获得更准确的分析结果
- 视频分析过程可能需要一些时间，取决于视频长度

## 许可证

MIT 