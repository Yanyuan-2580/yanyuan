---
name: dev-server
description: 仅启动 NestJS 后端开发服务器 (localhost:3000) — 含前置检查和验证
---

# 启动后端开发服务器

启动 NestJS 后端，监听 `http://localhost:3000`，API 前缀 `/api/v1`。

## AI 执行流程

### Step 1: 检查数据库

```bash
echo "检查数据库连接..."

# MySQL
netstat -ano | grep ":3306" | grep LISTENING && echo "✅ MySQL" || echo "❌ MySQL 未运行"

# MongoDB
curl -s -o /dev/null http://localhost:27017 && echo "✅ MongoDB 可访问" || echo "⚠️ MongoDB 无响应"

# Redis
redis-cli ping 2>&1 | grep -q PONG && echo "✅ Redis" || echo "⚠️ Redis 无响应"
```

### Step 2: 检查 .env

```bash
test -f server/.env && echo "✅ .env 已配置" || echo "❌ 缺少 .env"
```

### Step 3: 启动

```bash
cd server && npm run start:dev
```

### Step 4: 验证

```bash
sleep 3
curl -s http://localhost:3000/api/v1/health
```

预期响应: `{"code":200,"message":"success","data":{"status":"ok"}}`

## 项目模块速查

```
server/src/modules/
├── user/           # 用户 (register/login/profile/password)
├── chat/           # AI对话 (sessions + messages + SSE stream)
├── diary/          # 日记 (CRUD + stats)
├── knowledge/      # 知识库 (articles + search + like/collect)
├── mood/           # 心情 (record/history/stats)
├── meditation/     # 冥想 (list/detail/record/history)
├── admin/          # 管理后台 (users/articles/analytics/risk)
├── notification/   # 通知 (list/unread-count/read)
├── comment/        # 评论 (嵌套回复 + 风控)
├── questionnaire/  # 问卷 (list/submit/results)
├── video/          # 视频 (rooms)
├── reminder/       # 提醒 (定时任务)
└── upload/         # 文件上传

server/src/shared/
├── ai/             # DeepSeek/OpenAI 调用
├── cache/          # Redis 缓存
├── risk-control/   # 风控 (高危词/中危词/正则)
├── notification/   # 通知服务 (SMS/Email)
└── export/         # 报告导出
```

## 常见问题

| 问题 | 解决 |
|------|------|
| `ts-node: command not found` | `npx ts-node -r tsconfig-paths/register src/main.ts` |
| TypeORM 连接失败 | 检查 MySQL 密码和数据库名 (`mental_health_db`) |
| MongoDB 连接警告 | 非致命，模块启动后自动重试 |
| 端口 3000 占用 | `netstat -ano \| grep 3000` 查找进程 |
