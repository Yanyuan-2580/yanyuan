# 心理健康AI助手 — 心语 (PsyAIHelp)

全栈心理健康AI助手应用：AI对话陪伴 + 情绪追踪 + 知识库 + 冥想放松 + 日记反思 + 心理测评 + 管理后台。

## 技术栈

| 层 | 技术 |
|---|------|
| 用户端 | Vue 3 + Vite + Pinia + Tailwind CSS + Vue Router |
| 管理端 | Vue 3 + Vite + Element Plus + Pinia + Tailwind CSS |
| 后端 | NestJS + TypeORM (MySQL) + Mongoose (MongoDB) + Redis + JWT |
| 小程序 | Uni-App (Vue 3) — Phase 5 开发中 |

## 快速启动

### 前置条件
- Node.js >= 18
- MySQL 8.0+
- MongoDB 6.0+
- Redis 6.0+

### 安装与运行

```bash
# 1. 克隆项目
git clone <repo-url>
cd project1

# 2. 安装依赖
cd server && npm install
cd ../client && npm install
cd ../admin && npm install

# 3. 配置环境变量
cp server/.env.example server/.env
# 编辑 server/.env 填入数据库连接信息和AI API密钥

# 4. 一键启动开发环境
# 在项目根目录运行 /dev 技能
# 或分别启动:
cd server && npm run start:dev    # 后端 :3000
cd client && npm run dev          # 用户端 :5173
cd admin && npm run dev           # 管理端 :5174
```

### 运行测试

```bash
cd server
npm test        # 单元测试
npm run test:cov  # 覆盖率
```

## 项目结构

```
project1/
├── client/src/          # 用户端 (22个页面)
│   ├── api/modules/     # API模块 (chat/diary/knowledge/mood/meditation/user)
│   ├── components/      # 共享组件 (BottomNavBar/PageHeader/ArticleCard等)
│   ├── pages/           # 页面 (home/chat/diary/knowledge/mood/meditation/user/auth/questionnaire/video)
│   ├── composables/     # 组合式函数 (useDarkMode)
│   └── stores/          # Pinia store
├── admin/src/           # 管理端 (12个页面)
│   ├── api/modules/     # API模块 (admin/user/knowledge/risk等)
│   ├── components/      # AdminLayout
│   └── pages/           # Dashboard/用户/文章/风险/会话/日记/问卷/冥想/导出/行为分析/审计日志
├── server/src/          # 后端
│   ├── common/          # 守卫/过滤器/拦截器/装饰器
│   ├── database/
│   │   ├── entities/    # TypeORM实体 (18个)
│   │   └── schemas/     # MongoDB schema (ChatMessage/UserBehaviorLog)
│   ├── modules/         # 业务模块 (14个)
│   ├── shared/          # 共享服务 (AI/缓存/风控/通知/导出/行为日志)
│   └── types/           # TypeScript类型
├── miniprogram/         # 微信小程序 (Uni-App)
└── docs/                # 文档 (api/database/architecture)
```

## 已完成功能

### 核心功能
- ✅ JWT认证 (accessToken + refreshToken)
- ✅ AI对话 (DeepSeek/OpenAI, SSE流式 + 非流式回退)
- ✅ 情绪追踪 (心情记录/统计/趋势/AI建议/周报)
- ✅ 情绪日记 (CRUD + AI洞察 + 公开分享)
- ✅ 知识库 (文章搜索/分类/点赞/收藏/评论)
- ✅ 冥想放松 (课程/记录/历史/统计)
- ✅ 心理测评 (JSON题库/自动评分/AI建议)
- ✅ 视频咨询 (房间管理/TRTC集成)
- ✅ 提醒系统 (CRUD + 定时调度 + 短信/邮件推送)

### 安全与风控
- ✅ 35+高危词 + 15+中危词 + 45条正则模式
- ✅ 风险升级追踪 + 危机干预
- ✅ AI辅助危机检测 (实时流检测)
- ✅ JWT守卫 + 角色守卫 + 限流守卫

### 通知系统
- ✅ 应用内DB通知 + 未读计数
- ✅ 阿里云/腾讯云短信
- ✅ nodemailer SMTP邮件
- ✅ 提醒调度器 → 短信/邮件推送

### 管理后台
- ✅ 12个管理页面 (数据概览/用户/文章/风险/会话/日记/问卷/冥想/行为分析/数据导出/审计日志)
- ✅ 深色模式支持

## API规范

- 基础路径: `/api/v1`
- 响应格式: `{ code: 200, message: 'success', data: {}, timestamp }`
- 分页格式: `{ list, total, page, pageSize, totalPages }`
- Swagger文档: `http://localhost:3000/api-docs`

## 设计风格

极简治愈轻奢风 — 雾松青/柔烟蓝/奶杏白/大圆角/留白/柔和阴影

## 开发规范

详见 `docs/Agents.md` (34条开发规范) 和 `CLAUDE.md`

## 许可证

MIT
