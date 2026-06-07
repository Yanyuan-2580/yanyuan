# 系统架构

## 架构概览

```
┌──────────┐  ┌──────────┐  ┌───────────────┐
│  Client  │  │  Admin   │  │  Miniprogram  │
│ Vue 3    │  │ Vue 3    │  │  Uni-App      │
│ :5173    │  │ :5174    │  │  WeChat       │
└────┬─────┘  └────┬─────┘  └───────┬───────┘
     │              │               │
     └──────────────┼───────────────┘
                    │ HTTP/SSE + JWT
              ┌─────┴──────┐
              │   Nginx    │
              │   :80/443  │
              └─────┬──────┘
                    │ Reverse Proxy → /api/v1
              ┌─────┴──────┐
              │   NestJS   │
              │   :3000    │
              └──┬──┬──┬───┘
                 │  │  │
          ┌──────┘  │  └──────┐
          ▼         ▼         ▼
      ┌──────┐ ┌───────┐ ┌──────┐
      │MySQL │ │MongoDB│ │Redis │
      │:3306 │ │:27017 │ │:6379 │
      └──────┘ └───────┘ └──────┘
```

## 技术栈

| 层 | 技术 | 说明 |
|---|------|------|
| 前端 | Vue 3 + Vite + Pinia + Tailwind CSS | 用户端极简治愈风 |
| 管理端 | Vue 3 + Element Plus + Tailwind CSS | 管理后台 |
| 后端 | NestJS + TypeScript | 模块化架构 |
| ORM | TypeORM + Mongoose | MySQL + MongoDB |
| 缓存 | Redis | 会话/计数/限流 |
| 认证 | JWT (access+refresh token) | 双令牌轮换 |
| AI | DeepSeek/OpenAI API | SSE流式 + 非流式回退 |
| 安全 | 风控33+高危词 + 正则 + 限流 | 实时检测 |

## 后端模块架构

```
AppModule
├── UserModule          # 用户认证/资料
├── ChatModule          # AI对话 (SSE流式)
├── DiaryModule         # 情绪日记
├── KnowledgeModule     # 知识文章 + 评论
├── MoodModule          # 心情记录 + 统计
├── MeditationModule    # 冥想课程
├── QuestionnaireModule # 心理测评
├── NotificationModule  # 应用内通知
├── ReminderModule      # 定时提醒
├── VideoModule         # 视频咨询
├── AdminModule         # 管理后台
├── BehaviorLogModule   # 行为日志 (新)
├── UploadModule        # 文件上传
├── HealthModule        # 健康检查
└── SharedModule
    ├── AiService       # AI模型调用
    ├── CacheService    # Redis/内存缓存
    ├── RiskControlService # 风控检测
    ├── NotificationService # 短信/邮件外发
    └── ExportService   # 数据导出
```

## 数据流

1. **用户请求** → Nginx反向代理 → NestJS → 守卫验证JWT → Controller → Service → Repository → DB
2. **AI对话** → ChatController → ChatService → AiService → DeepSeek/OpenAI API → SSE流式返回
3. **风控检测** → ChatService → RiskControlService → 关键词/正则匹配 → 风险升级追踪
4. **提醒通知** → ReminderScheduler (每分钟) → 创建DB通知 + 短信/邮件外发
5. **行为日志** → BehaviorInterceptor (每个请求) → MongoDB写入

## 部署

- 生产: Nginx反向代理 + HTTPS + PM2进程管理
- 静态资源: Nginx直接serve client/admin dist
- API: Nginx proxy_pass → localhost:3000
