# 视频分析工具

基于 Next.js 和 Gemini API 的视频内容分析工具。

## 项目结构

```
├── src/
│   ├── app/                    # Next.js 应用路由和页面
│   │   ├── api/               # API 路由处理
│   │   │   └── analyze/       # 视频分析相关 API
│   │   ├── layout.tsx         # 根布局组件
│   │   └── page.tsx           # 首页组件
│   ├── components/            # React 组件
│   │   ├── ui/               # 通用 UI 组件
│   │   └── video/            # 视频相关组件
│   ├── lib/                   # 工具函数和共享库
│   │   ├── api/              # API 相关工具
│   │   └── utils.ts          # 通用工具函数
│   ├── server/               # 服务器端代码
│   │   ├── config/          # 服务器配置
│   │   ├── services/        # 业务服务
│   │   └── utils/           # 服务器工具函数
│   └── types/                # TypeScript 类型定义
├── public/                    # 静态资源
└── prisma/                   # 数据库模型和迁移（如果需要）
```

## 技术栈

- **前端**
  - Next.js 14
  - React
  - TypeScript
  - Tailwind CSS
  - Shadcn UI

- **后端**
  - Next.js API Routes
  - Google Gemini API
  - Prisma (可选，用于数据库操作)

## 开发指南

### 环境要求

- Node.js 18+
- npm 或 yarn

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
npm start
```

### 环境变量

创建 `.env.local` 文件并添加以下配置：

```env
GOOGLE_API_KEY=your_gemini_api_key
```

## API 文档

### 视频分析 API

POST `/api/analyze`
- 功能：分析上传的视频内容
- 请求体：视频文件
- 响应：分析结果

## 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

## 许可证

MIT 