---
name: api-test
description: 快速测试后端 API 端点 — 覆盖用户/心情/日记/知识库/对话/管理/通知/问卷共8个模块
---

# API 测试工具

**AI 执行规则**: 先检查 Server 是否运行，然后按用户指定的模块执行对应的 curl 命令。如果没有指定模块，执行健康检查并列出各模块的基础测试命令供用户选择。

后端: `http://localhost:3000` | API 前缀: `/api/v1` | 响应格式: `{ code, message, data, timestamp }`

## Step 0: 前置检查

```bash
curl -s http://localhost:3000/api/v1/health
```

如果无响应，提示用户先启动 Server (`/dev-server`)。

## 模块测试命令

### 1. 用户模块 `/api/v1/user`

```bash
# 注册
curl -s -X POST http://localhost:3000/api/v1/user/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"Test123456","phone":"13800138000"}'

# 登录 (保存 TOKEN)
curl -s -X POST http://localhost:3000/api/v1/user/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"Test123456"}'

# 用上面返回的 accessToken 替换 <TOKEN>
# 个人信息
curl -s http://localhost:3000/api/v1/user/profile -H "Authorization: Bearer <TOKEN>"

# 修改密码
curl -s -X PUT http://localhost:3000/api/v1/user/password \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"oldPassword":"Test123456","newPassword":"NewPass123"}'
```

### 2. 心情模块 `/api/v1/mood`

```bash
# 记录心情 (mood: 1-10)
curl -s -X POST http://localhost:3000/api/v1/mood/record \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"mood":7,"note":"今天心情不错","tags":["开心","放松"]}'

# 历史记录
curl -s "http://localhost:3000/api/v1/mood/history?page=1&pageSize=10" \
  -H "Authorization: Bearer <TOKEN>"

# 统计
curl -s http://localhost:3000/api/v1/mood/stats \
  -H "Authorization: Bearer <TOKEN>"
```

### 3. 日记模块 `/api/v1/diary`

```bash
# 创建日记
curl -s -X POST http://localhost:3000/api/v1/diary \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"title":"测试日记","content":"今天是美好的一天","mood":5,"tags":["日常"]}'

# 列表
curl -s "http://localhost:3000/api/v1/diary?page=1" \
  -H "Authorization: Bearer <TOKEN>"

# 统计
curl -s http://localhost:3000/api/v1/diary/stats/weekly \
  -H "Authorization: Bearer <TOKEN>"
```

### 4. 知识库模块 `/api/v1/knowledge`

```bash
# 文章列表 (公开)
curl -s "http://localhost:3000/api/v1/knowledge/articles?page=1&pageSize=10"

# 搜索
curl -s "http://localhost:3000/api/v1/knowledge/articles/search?keyword=焦虑"

# 文章详情
curl -s http://localhost:3000/api/v1/knowledge/articles/1

# 点赞 (需登录)
curl -s -X POST http://localhost:3000/api/v1/knowledge/articles/1/like \
  -H "Authorization: Bearer <TOKEN>"
```

### 5. 对话模块 `/api/v1/chat`

```bash
# 创建会话
curl -s -X POST http://localhost:3000/api/v1/chat/sessions \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"title":"新对话"}'

# 发送消息 (非流式)
curl -s -X POST http://localhost:3000/api/v1/chat/messages \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"sessionId":1,"content":"你好，我最近压力很大"}'

# 会话列表
curl -s http://localhost:3000/api/v1/chat/sessions \
  -H "Authorization: Bearer <TOKEN>"
```

### 6. 管理端 `/api/v1/admin`

```bash
# 管理员登录
curl -s -X POST http://localhost:3000/api/v1/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
# 保存返回的 token 为 ADMIN_TOKEN

# 统计概览
curl -s http://localhost:3000/api/v1/admin/statistics \
  -H "Authorization: Bearer <ADMIN_TOKEN>"

# 用户管理
curl -s "http://localhost:3000/api/v1/admin/users?page=1&pageSize=10" \
  -H "Authorization: Bearer <ADMIN_TOKEN>"

# 周趋势
curl -s http://localhost:3000/api/v1/admin/analytics/weekly-trend \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

### 7. 通知模块 `/api/v1/notification`

```bash
curl -s http://localhost:3000/api/v1/notification/list?page=1 \
  -H "Authorization: Bearer <TOKEN>"

curl -s http://localhost:3000/api/v1/notification/unread-count \
  -H "Authorization: Bearer <TOKEN>"

# 全部已读
curl -s -X PUT http://localhost:3000/api/v1/notification/read-all \
  -H "Authorization: Bearer <TOKEN>"
```

### 8. 问卷模块 `/api/v1/questionnaire`

```bash
# 问卷列表
curl -s http://localhost:3000/api/v1/questionnaire/list \
  -H "Authorization: Bearer <TOKEN>"

# 问卷详情
curl -s http://localhost:3000/api/v1/questionnaire/1 \
  -H "Authorization: Bearer <TOKEN>"

# 提交
curl -s -X POST http://localhost:3000/api/v1/questionnaire/submit \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"questionnaireId":1,"answers":[{"questionId":1,"score":3},{"questionId":2,"score":4}]}'
```
