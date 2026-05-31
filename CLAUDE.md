# CLAUDE.md - 心理健康AI助手项目

> 参考行为规范: `docs/Agents.md`

## 项目概述

全栈心理健康AI助手应用：「AI对话陪伴 + 情绪追踪 + 知识库 + 冥想放松 + 日记反思 + 心理测评 + 管理后台」。

## 技术栈

| 层 | 技术 |
|---|------|
| Client (用户端) | Vue 3 + Vite + Pinia + Tailwind CSS + Vue Router + Lucide Icons |
| Admin (管理端) | Vue 3 + Vite + Element Plus + Pinia + Tailwind CSS |
| Server | NestJS + TypeORM (MySQL) + Mongoose (MongoDB) + Redis + JWT |

## 目录结构

```
project1/
├── client/src/          # 用户端
│   ├── api/modules/     # 按模块划分的API (chat/diary/knowledge/mood/meditation/user)
│   ├── components/      # 共享组件 (BottomNavBar/PageHeader/ArticleCard/CommentList等)
│   ├── pages/           # 页面 (home/chat/diary/knowledge/mood/meditation/user/auth/questionnaire/video)
│   ├── router/          # 路由配置
│   ├── stores/          # Pinia store
│   └── types/           # TypeScript类型
├── admin/src/           # 管理端
│   ├── api/modules/     # API模块 (admin/user/knowledge/risk)
│   ├── components/      # AdminLayout/MarkdownEditor
│   ├── pages/           # Dashboard/UserManagement/ArticleManagement/RiskManagement
│   └── types/
├── server/src/          # 后端
│   ├── common/          # 守卫/过滤器/拦截器/装饰器
│   ├── config/          # database.config.ts
│   ├── database/
│   │   ├── entities/    # TypeORM实体 (User/Admin/MoodDiary/AiSession/KnowledgeArticle/Comment/Notification/Questionnaire等)
│   │   └── schemas/     # MongoDB schema (ChatMessage/UserBehaviorLog)
│   ├── modules/         # 业务模块 (user/chat/diary/knowledge/mood/meditation/admin/notification/comment/questionnaire/video)
│   ├── shared/          # 共享服务 (ai/cache/risk-control/notification/export)
│   └── types/
└── docs/                # 文档 (Agents.md/requirements.md/architecture.md/api.md/database.md等)
```

## 当前开发进度 (Phase 1-4 已完成)

### 已完成模块

**Server已注册实体 (14个):** User, Admin, AdminOperationLog, MoodDiary, MoodRecord, AiSession, KnowledgeArticle, KnowledgeCategory, ArticleLike, ArticleCollect, Meditation, MeditationHistory, Notification, Comment, Questionnaire, QuestionnaireResult, VideoSession

**Server API端点 (所有以 /api/v1 为前缀):**

| 模块 | 状态 | 关键端点 |
|------|------|---------|
| User | ✅ | register/login/profile/password/logout/account/report |
| Chat | ✅ | sessions CRUD, messages, messages/stream (SSE) |
| Diary | ✅ | CRUD + stats/:period |
| Knowledge | ✅ | articles + search + like/collect + categories + comments |
| Mood | ✅ | record/history/stats |
| Meditation | ✅ | list/detail/record/history/stats |
| Admin | ✅ | users/articles/categories/chat/diaries/analytics/risk-records/audit-logs |
| Notification | ✅ | list/unread-count/read/read-all |
| Questionnaire | ✅ | list/:id/submit/results |
| Video | ✅ | rooms CRUD |

**Client已创建页面 (22个):**
Home/Chat/DiaryList/DiaryCreate/DiaryEdit/DiaryDetail/KnowledgeList/ArticleDetail/Mood/Meditation/User/Login/Register/NotFound/UserSettings/ChangePassword/UserHelp/About/Notification/Reminder/QuestionnaireList/Questionnaire/QuestionnaireResult/VideoCall

**Admin已创建页面 (5个):**
Dashboard/UserManagement/ArticleManagement/RiskManagement/Login

### Phase 1-4已实现的核心特性
- JWT认证 (accessToken + refreshToken)
- AI对话 (DeepSeek/OpenAI, SSE流式 + 非流式回退)
- 风控系统 (35+高危词, 15+中危词, 正则匹配, 风险升级追踪)
- 通知系统 (SMS/Email接口 + DB通知 + 未读计数轮询)
- 评论系统 (嵌套回复 + 风控检查)
- 问卷测评 (JSON题库 + 自动评分 + AI建议)
- 报告导出 (JSON报告聚合)
- 视频咨询 (房间管理)

## 待完成 (Phase 5-6)

### Phase 5: 微信小程序
- miniprogram/ Uni-App项目
- 核心页面适配 (首页/对话/日记/知识/心情/冥想/用户)
- 微信登录集成

### Phase 6: 提醒系统 + 最终打磨
- Reminder实体 + @nestjs/schedule定时检查
- 客户端提醒CRUD页面
- 管理端RBAC权限控制
- 审计日志查看页面
- 文件上传模块 (multer)

## 关键开发约定

1. **API响应格式**: `{ code: 200, message: 'success', data: {}, timestamp }`
2. **分页格式**: `{ list, total, page, pageSize, totalPages }`
3. **类型定义**: `RiskLevel = 0|1|2`, `UserStatus = 0|1|2`, `ArticleStatus = 0|1|2|3`
4. **路由保护**: client使用localStorage accessToken守卫, admin使用adminToken守卫
5. **命名**: 文件小写短横线, 组件PascalCase, API camelCase
6. **Tailwind优先**: 所有样式使用Tailwind, 尽量减少自定义CSS
7. **图标**: Lucide Icons (lucide-vue-next)
8. **用户端风格**: 极简治愈轻奢风(雾松青/柔烟蓝/奶杏白/大圆角/留白)
