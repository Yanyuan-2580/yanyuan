---
name: dev-client
description: 仅启动用户端 Vue 开发服务器 (localhost:5173) — 极简治愈轻奢风 UI
---

# 启动用户端开发服务器

启动 Vue 3 + Vite 用户端，监听 `http://localhost:5173`。

**注意: 依赖后端 Server 运行在 `localhost:3000`，请先启动 Server。**

## AI 执行流程

### Step 1: 启动

```bash
cd client && npm run dev
```

### Step 2: 验证

```bash
curl -s -o /dev/null -w "HTTP %{http_code}" http://localhost:5173
```

预期: `HTTP 200`

## 页面路由速查 (26个路由)

| 路径 | 页面 | 认证 |
|------|------|------|
| `/nav` | 导航首页 (公开) | ❌ |
| `/login` | 登录 | ❌ |
| `/register` | 注册 | ❌ |
| `/` | 首页 | ✅ |
| `/chat` | AI对话 | ✅ |
| `/chat/:sessionId` | 对话会话 | ✅ |
| `/diary` | 日记列表 | ✅ |
| `/diary/new` | 写日记 | ✅ |
| `/diary/:id` | 日记详情 | ✅ |
| `/diary/:id/edit` | 编辑日记 | ✅ |
| `/knowledge` | 知识库 | ✅ |
| `/knowledge/new` | 写文章 | ✅ |
| `/knowledge/:id` | 文章详情 | ✅ |
| `/mood` | 心情追踪 | ✅ |
| `/meditation` | 冥想放松 | ✅ |
| `/user` | 个人中心 | ✅ |
| `/user/settings` | 设置 | ✅ |
| `/user/change-password` | 改密码 | ✅ |
| `/user/hotline` | 心理热线 | ✅ |
| `/user/help` | 帮助 | ✅ |
| `/user/about` | 关于 | ✅ |
| `/user/notifications` | 通知 | ✅ |
| `/user/reminders` | 提醒 | ✅ |
| `/questionnaire` | 问卷列表 | ✅ |
| `/questionnaire/:id` | 答题 | ✅ |
| `/questionnaire/:id/result` | 结果 | ✅ |
| `/video/:roomId?` | 视频咨询 | ✅ |

## 路由守卫逻辑

- `/login`, `/register`, `/nav` → 已登录用户自动跳转到 `/`
- 其他所有路由 → 未登录用户强制跳转到 `/nav`
- 检查依据: `localStorage.getItem('accessToken')`

## API 模块清单

```
client/src/api/modules/
├── chat.ts        # AI 对话
├── diary.ts       # 日记
├── knowledge.ts   # 知识库
├── meditation.ts  # 冥想
├── mood.ts        # 心情
└── user.ts        # 用户
```

## UI 风格约定

- **背景**: `bg-[#FBF8F4]` 奶杏白
- **卡片**: `bg-white rounded-2xl shadow-sm border-[#E8E4DF]`
- **主色**: `#8BA88C` 雾松青 / `#8A9BAE` 柔烟蓝
- **文字**: `#4A4A4A` 正文 / `#A6A6A6` 次要
- **圆角**: 12-16px
- **图标**: `lucide-vue-next` (极简线性)
- **底部导航**: `BottomNavBar.vue` — 所有主页面必须包含 `pb-24`
