# 心理健康AI助手 — 项目README文档

> AI对话陪伴 + 情绪追踪 + 知识库 + 冥想放松 + 日记反思 + 心理测评 + 管理后台 全栈心理健康AI助手应用

---

## Badges

![Version](https://img.shields.io/badge/version-v2.7.0-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)
![Node](https://img.shields.io/badge/node-%3E%3D18.0-green)
![Vue](https://img.shields.io/badge/vue-3.x-4FC08D)
![NestJS](https://img.shields.io/badge/nestjs-latest-E0234E)
![TypeScript](https://img.shields.io/badge/typescript-5.x-3178C6)

---

## 快速开始 Quick Start

### 前置要求 Prerequisites

| 依赖 | 最低版本 | 用途 |
|------|---------|------|
| Node.js | >= 18.0 | 运行环境 |
| MySQL | >= 8.0 | 关系型数据库（用户、日记、文章、测评等） |
| MongoDB | >= 7.0 | 文档数据库（聊天消息、用户行为日志） |
| Redis | >= 7.0 | 缓存与Session |
| DeepSeek API Key | — | AI大模型对话服务 |

### 三步安装

```bash
# Step 1: 克隆项目
git clone https://github.com/your-org/mental-health-ai.git
cd mental-health-ai

# Step 2: 安装依赖（一键安装 client + admin + server）
npm install

# Step 3: 配置环境变量并启动开发服务器
# 编辑 server/.env 填入数据库连接信息和 DeepSeek API Key
npm run dev
```

启动后访问：
- **用户端**: http://localhost:5173
- **管理端**: http://localhost:5174
- **API服务**: http://localhost:3000/api/v1

---

## 核心功能 Core Features

### AI对话陪伴
基于 **DeepSeek** 大模型的智能心理对话，支持 **SSE流式输出** 与非流式回退。会话管理（创建/编辑/删除），对话历史永久保存至 **MongoDB**。风控系统实时检测高危内容，自动升级风险等级并通知管理员。

### 情绪管理
- **情绪日记**: 富文本编辑器撰写日记，**AI自动分析** 情绪倾向与心理状态
- **心情追踪**: 可视化图表展示心情变化趋势，支持日/周/月多维度统计
- **数据导出**: JSON格式报告聚合导出

### 疗愈放松
- **冥想指导**: 冥想音频/视频列表，内置 **计时器** 功能
- **冥想历史**: 记录每次冥想时长与完成状态
- **放松统计**: 累计冥想时长、连续天数等统计数据

### 知识科普
- **知识库**: 心理健康文章分类浏览，支持 **全文搜索**
- **互动功能**: 文章 **点赞** + **收藏** + **评论**（嵌套回复）
- **分类管理**: 管理员可创建/编辑文章分类

### 安全辅助
- **风控系统**: 35+高危词、15+中危词库，正则模式匹配，风险升级追踪
- **JWT认证**: accessToken + refreshToken 双Token机制
- **通知系统**: SMS/Email接口 + 站内通知 + 未读计数轮询
- **热线目录**: 心理援助热线信息展示

### 管理后台
- **仪表盘 Dashboard**: 用户数/文章数/对话数/测评数等核心指标
- **用户管理**: 用户列表、状态管理（正常/禁用）、风险记录查看
- **文章管理**: 知识库文章CRUD、Markdown编辑器、分类管理
- **风控管理**: 风险记录查看、操作日志审计

---

## 技术栈 Tech Stack

| 层 Layer | 技术 Technology |
|----------|----------------|
| **Client (用户端)** | Vue 3 + Vite + Pinia + Tailwind CSS + Vue Router + Lucide Icons |
| **Admin (管理端)** | Vue 3 + Vite + Element Plus + Pinia + Tailwind CSS |
| **Server (后端)** | NestJS + TypeORM (MySQL) + Mongoose (MongoDB) + Redis + JWT |
| **AI (人工智能)** | DeepSeek API + SSE流式传输 + 非流式回退 |
| **Auth (认证)** | JWT (accessToken + refreshToken) + 路由守卫 |

---

## 项目结构 Project Structure

```
project1/
├── client/src/                    # 用户端源码
│   ├── api/                       # API请求层
│   │   ├── modules/               # 按模块划分
│   │   │   ├── chat.ts            # 对话模块API
│   │   │   ├── diary.ts           # 日记模块API
│   │   │   ├── knowledge.ts       # 知识库模块API
│   │   │   ├── mood.ts            # 心情追踪模块API
│   │   │   ├── meditation.ts      # 冥想模块API
│   │   │   ├── user.ts            # 用户模块API
│   │   │   ├── questionnaire.ts   # 测评模块API
│   │   │   ├── video.ts           # 视频咨询模块API
│   │   │   └── notification.ts    # 通知模块API
│   │   └── request.ts             # Axios封装 + 拦截器
│   ├── components/                # 共享组件
│   │   ├── BottomNavBar.vue       # 底部导航栏
│   │   ├── PageHeader.vue         # 页面标题栏
│   │   ├── ArticleCard.vue        # 文章卡片
│   │   ├── CommentList.vue        # 评论列表（嵌套回复）
│   │   └── ...
│   ├── pages/                     # 页面组件 (22个页面)
│   │   ├── home/                  # 首页 HomePage
│   │   ├── chat/                  # AI对话 ChatPage
│   │   ├── diary/                 # 日记 (DiaryList/DiaryCreate/DiaryEdit/DiaryDetail)
│   │   ├── knowledge/             # 知识库 (KnowledgeList/ArticleDetail)
│   │   ├── mood/                  # 心情追踪 MoodPage
│   │   ├── meditation/            # 冥想 MeditationPage
│   │   ├── user/                  # 用户中心 (User/UserSettings/ChangePassword/UserHelp/About)
│   │   ├── auth/                  # 认证 (Login/Register)
│   │   ├── questionnaire/         # 测评 (QuestionnaireList/Questionnaire/QuestionnaireResult)
│   │   ├── video/                 # 视频咨询 VideoCallPage
│   │   ├── notification/          # 通知 NotificationPage
│   │   └── NotFound.vue           # 404页面
│   ├── router/                    # 路由配置 (路由守卫+懒加载)
│   ├── stores/                    # Pinia状态管理 (user/auth/notification等)
│   ├── types/                     # TypeScript类型定义
│   └── assets/                    # 静态资源
│
├── admin/src/                     # 管理端源码
│   ├── api/                       # API请求层
│   │   └── modules/               # admin/user/knowledge/risk
│   ├── components/                # AdminLayout / MarkdownEditor
│   ├── pages/                     # 管理页面 (5个)
│   │   ├── Dashboard.vue          # 数据仪表盘
│   │   ├── UserManagement.vue     # 用户管理
│   │   ├── ArticleManagement.vue  # 文章管理
│   │   ├── RiskManagement.vue     # 风控管理
│   │   └── Login.vue              # 管理端登录
│   ├── router/                    # 管理端路由
│   ├── stores/                    # Pinia store
│   └── types/                     # 类型定义
│
├── server/src/                    # 后端源码
│   ├── common/                    # 通用模块
│   │   ├── guards/                # JWT守卫 (jwt-auth.guard.ts)
│   │   ├── filters/               # 异常过滤器
│   │   ├── interceptors/          # 响应拦截器 (transform)
│   │   └── decorators/            # 自定义装饰器
│   ├── config/                    # 配置文件
│   │   └── database.config.ts     # 数据库配置 (MySQL/MongoDB/Redis)
│   ├── database/                  # 数据库层
│   │   ├── entities/              # TypeORM实体 (14个)
│   │   │   ├── user.entity.ts
│   │   │   ├── admin.entity.ts
│   │   │   ├── mood-diary.entity.ts
│   │   │   ├── ai-session.entity.ts
│   │   │   ├── knowledge-article.entity.ts
│   │   │   ├── knowledge-category.entity.ts
│   │   │   ├── comment.entity.ts
│   │   │   ├── notification.entity.ts
│   │   │   ├── questionnaire.entity.ts
│   │   │   ├── questionnaire-result.entity.ts
│   │   │   ├── meditation.entity.ts
│   │   │   ├── meditation-history.entity.ts
│   │   │   ├── video-session.entity.ts
│   │   │   └── admin-operation-log.entity.ts
│   │   └── schemas/               # Mongoose Schema (2个)
│   │       ├── chat-message.schema.ts
│   │       └── user-behavior-log.schema.ts
│   ├── modules/                   # 业务模块 (12个)
│   │   ├── user/                  # 用户模块 (注册/登录/个人信息/密码/注销)
│   │   ├── chat/                  # 对话模块 (会话CRUD/消息/SSE流式)
│   │   ├── diary/                 # 日记模块 (CRUD + 统计)
│   │   ├── knowledge/             # 知识库 (文章/分类/搜索/点赞/收藏)
│   │   ├── mood/                  # 心情追踪 (记录/历史/统计)
│   │   ├── meditation/            # 冥想 (列表/详情/记录/统计)
│   │   ├── questionnaire/         # 测评 (列表/题目/提交/结果)
│   │   ├── video/                 # 视频咨询 (房间CRUD)
│   │   ├── notification/          # 通知 (列表/未读数/已读)
│   │   ├── comment/               # 评论 (嵌套回复)
│   │   └── admin/                 # 管理 (用户/文章/分类/对话/日记/分析/风控/审计)
│   ├── shared/                    # 共享服务
│   │   ├── ai/                    # AI服务 (DeepSeek集成)
│   │   ├── cache/                 # 缓存服务 (Redis)
│   │   ├── risk-control/          # 风控服务 (35+高危词 + 15+中危词)
│   │   ├── notification/          # 通知服务 (SMS/Email/站内)
│   │   └── export/                # 导出服务 (JSON报告)
│   └── types/                     # 类型定义
│       └── index.ts               # RiskLevel / UserStatus / ArticleStatus 等枚举
│
├── docs/                          # 项目文档
│   ├── Agents.md                  # AI Agent行为规范
│   ├── requirements.md            # 需求文档
│   ├── architecture.md            # 架构设计文档
│   ├── api.md                     # API接口文档
│   ├── database.md                # 数据库设计文档
│   └── deployment.md              # 部署文档
│
├── wodewendang/                   # 交付文档
│   ├── 01-项目概述与需求分析.md
│   ├── 02-系统架构设计.md
│   ├── 03-数据库设计文档.md
│   ├── 04-API接口文档.md
│   ├── 05-前端组件文档.md
│   ├── 06-部署运维文档.md
│   ├── 07-用户操作手册.md
│   ├── 08-开发规范与代码风格指南.md
│   ├── 09-关键技术方案.md
│   ├── 10-性能优化与安全策略.md
│   ├── 11-问题排查与FAQ.md
│   ├── 12-Readme文档.md            # 本文档
│   ├── 13-测试用例与测试报告.md
│   └── 14-项目验收报告.md
│
├── CLAUDE.md                      # AI助手行为指引
├── package.json                   # 根package.json (workspaces)
├── .env.example                   # 环境变量示例
└── .gitignore
```

---

## API端点总览 (所有以 /api/v1 为前缀)

| 模块 | 关键端点 | 说明 |
|------|---------|------|
| **User** | POST `/api/v1/user/register` | 用户注册 |
| | POST `/api/v1/user/login` | 用户登录 |
| | GET `/api/v1/user/profile` | 获取个人信息 |
| | PUT `/api/v1/user/profile` | 更新个人信息 |
| | PUT `/api/v1/user/password` | 修改密码 |
| | POST `/api/v1/user/logout` | 退出登录 |
| | GET `/api/v1/user/report` | 用户数据报告 |
| **Chat** | GET `/api/v1/chat/sessions` | 会话列表 |
| | POST `/api/v1/chat/sessions` | 创建会话 |
| | PUT `/api/v1/chat/sessions/:id` | 编辑会话 |
| | DELETE `/api/v1/chat/sessions/:id` | 删除会话 |
| | GET `/api/v1/chat/sessions/:id/messages` | 消息列表 |
| | POST `/api/v1/chat/sessions/:id/messages/stream` | SSE流式消息 |
| **Diary** | GET `/api/v1/diary` | 日记列表 |
| | POST `/api/v1/diary` | 创建日记 |
| | PUT `/api/v1/diary/:id` | 编辑日记 |
| | DELETE `/api/v1/diary/:id` | 删除日记 |
| | GET `/api/v1/diary/:id` | 日记详情 |
| | GET `/api/v1/diary/stats/:period` | 日记统计 |
| **Knowledge** | GET `/api/v1/knowledge/articles` | 文章列表（分页+搜索） |
| | GET `/api/v1/knowledge/articles/:id` | 文章详情 |
| | POST `/api/v1/knowledge/articles/:id/like` | 点赞文章 |
| | POST `/api/v1/knowledge/articles/:id/collect` | 收藏文章 |
| | GET `/api/v1/knowledge/categories` | 分类列表 |
| | GET `/api/v1/knowledge/articles/:id/comments` | 文章评论 |
| | POST `/api/v1/knowledge/articles/:id/comments` | 发表评论 |
| **Mood** | POST `/api/v1/mood/record` | 记录心情 |
| | GET `/api/v1/mood/history` | 心情历史 |
| | GET `/api/v1/mood/stats` | 心情统计 |
| **Meditation** | GET `/api/v1/meditation/list` | 冥想列表 |
| | GET `/api/v1/meditation/:id` | 冥想详情 |
| | POST `/api/v1/meditation/record` | 记录冥想 |
| | GET `/api/v1/meditation/history` | 冥想历史 |
| | GET `/api/v1/meditation/stats` | 冥想统计 |
| **Questionnaire** | GET `/api/v1/questionnaire/list` | 测评列表 |
| | GET `/api/v1/questionnaire/:id` | 测评题目 |
| | POST `/api/v1/questionnaire/:id/submit` | 提交测评 |
| | GET `/api/v1/questionnaire/results` | 测评结果 |
| **Video** | GET `/api/v1/video/rooms` | 房间列表 |
| | POST `/api/v1/video/rooms` | 创建房间 |
| | GET `/api/v1/video/rooms/:id` | 房间详情 |
| **Notification** | GET `/api/v1/notification/list` | 通知列表 |
| | GET `/api/v1/notification/unread-count` | 未读数 |
| | PUT `/api/v1/notification/read/:id` | 标记已读 |
| | PUT `/api/v1/notification/read-all` | 全部已读 |
| **Admin** | GET `/api/v1/admin/users` | 用户管理 |
| | GET `/api/v1/admin/articles` | 文章管理 |
| | GET `/api/v1/admin/categories` | 分类管理 |
| | GET `/api/v1/admin/chat` | 对话管理 |
| | GET `/api/v1/admin/diaries` | 日记管理 |
| | GET `/api/v1/admin/analytics` | 数据分析 |
| | GET `/api/v1/admin/risk-records` | 风控记录 |
| | GET `/api/v1/admin/audit-logs` | 审计日志 |

---

## 类型定义

```typescript
// 风控等级
type RiskLevel = 0 | 1 | 2;  // 0=正常 1=中危 2=高危

// 用户状态
type UserStatus = 0 | 1 | 2;  // 0=正常 1=禁用 2=待审核

// 文章状态
type ArticleStatus = 0 | 1 | 2 | 3;  // 0=草稿 1=已发布 2=已下架 3=待审核

// API统一响应格式
interface ApiResponse<T> {
  code: number;        // 200=成功
  message: string;     // 提示信息
  data: T;             // 响应数据
  timestamp: number;   // 时间戳
}

// 分页响应格式
interface PaginatedResponse<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
```

---

## 版本信息

| 字段 | 值 |
|------|-----|
| 当前版本 | v2.7.0 |
| 发布日期 | 2026-06-02 |
| 开发状态 | Phase 1-4 已完成 (用户端+管理端+后端全部核心功能) |
| 待开发 | Phase 5 (微信小程序) / Phase 6 (提醒系统+RBAC+审计日志页面+文件上传) |
| 许可证 | MIT License |

### 版本历史

| 版本 | 日期 | 主要更新 |
|------|------|---------|
| v2.7.0 | 2026-06-02 | 当前版本：全功能稳定版 |
| v2.6.0 | — | API导出修复 + 忘记密码 + 验证码登录 + 视频页完善 |
| v2.5.1 | — | 首页改为导航页，未登录用户先看项目介绍再进入登录 |
| v2.5.0 | — | 项目导航介绍页 /nav |
| v2.4.0 | — | 登录注册页大改造，对标简单心理风格 |
| v2.3.3 | — | Sparkles图标兼容修复 |

---

## 开发约定

1. **API响应格式**: 统一使用 `{ code: 200, message: 'success', data: {}, timestamp }` 格式
2. **分页格式**: `{ list, total, page, pageSize, totalPages }`
3. **路由保护**: client 使用 localStorage accessToken 守卫，admin 使用 adminToken 守卫
4. **命名规范**: 文件名小写短横线连接 (kebab-case)，组件名首字母大写 (PascalCase)，API函数名驼峰 (camelCase)
5. **样式**: Tailwind CSS 优先，尽量减少自定义 CSS
6. **图标**: Lucide Icons (lucide-vue-next)
7. **用户端风格**: 极简治愈轻奢风 — 雾松青(#577f63) + 柔烟蓝(#8b95be) + 奶杏白 + 大圆角 + 大量留白

---

## 许可证

本项目基于 MIT License 开源。
