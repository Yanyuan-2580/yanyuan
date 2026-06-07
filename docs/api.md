# API 文档

> 基础路径: `/api/v1` | Swagger UI: `http://localhost:3000/api-docs`
> 响应格式: `{ code: 200, message: 'success', data: {}, timestamp }`

## 模块概览

### 用户 `/users` | 对话 `/chat` | 心情 `/mood` | 日记 `/diaries`
### 知识库 `/articles` | 冥想 `/meditation` | 问卷 `/questionnaires`
### 通知 `/notifications` | 提醒 `/reminders` | 视频 `/video`
### 管理端 `/admin` (需 admin 角色 JWT)

## 类型定义

- `RiskLevel = 0 | 1 | 2` (0=正常 1=关注 2=高危)
- `UserStatus = 0 | 1 | 2` (0=正常 1=禁用 2=已注销)
- `ArticleStatus = 0 | 1 | 2 | 3` (0=草稿 1=待审核 2=已发布 3=已拒绝)

完整端点列表请访问 Swagger UI。
