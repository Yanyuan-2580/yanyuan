---
name: dev
description: 一键启动全栈开发环境 — 检查前置条件 → 启动 server(3000) + client(5173) + admin(5174) → 验证
---

# 启动全栈开发环境

## AI 执行流程

按以下顺序执行，每一步必须成功才能继续：

### Step 1: 检查前置服务

```bash
echo "=== 检查前置服务 ==="

# MySQL (端口 3306)
netstat -ano | grep ":3306" | grep LISTENING && echo "✅ MySQL 运行中" || echo "❌ MySQL 未运行，请先启动"

# MongoDB (端口 27017)
curl -s -o /dev/null -w "MongoDB: HTTP %{http_code}" http://localhost:27017 2>&1
echo ""

# Redis (端口 6379)
redis-cli ping 2>&1 && echo "✅ Redis 运行中" || echo "❌ Redis 未运行，请先启动"
```

如果任一服务未运行，**停止并告知用户先启动对应服务**。

### Step 2: 确认 .env 配置

```bash
test -f server/.env && echo "✅ server/.env 存在" || echo "❌ 缺少 server/.env，请先配置"
```

### Step 3: 启动 Server (必须先启动)

```bash
cd server && npm run start:dev
```

等待 Server 启动完成（看到 "Nest application successfully started" 或类似日志）。

### Step 4: 启动 Client

在新终端中：
```bash
cd client && npm run dev
```

### Step 5: 启动 Admin

在新终端中：
```bash
cd admin && npm run dev
```

### Step 6: 验证全部服务

```bash
echo "=== 验证服务状态 ==="

# Server
echo -n "Server (3000): "
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/v1/health

# Client
echo -n "Client (5173): "
curl -s -o /dev/null -w "%{http_code}" http://localhost:5173

# Admin
echo -n "Admin (5174): "
curl -s -o /dev/null -w "%{http_code}" http://localhost:5174
```

预期：三个服务都返回 200。

## 故障排查

| 问题 | 解决 |
|------|------|
| 端口被占用 | 使用 `/kill-ports` 清理 |
| ts-node 找不到 | `cd server && npx ts-node -r tsconfig-paths/register src/main.ts` |
| MongoDB 连接失败 | 检查 MongoDB 服务是否启动，URI 是否正确 |
| Redis 连接失败 | `sc start Redis` (Windows 服务) |
| Client 代理报错 | 检查 `client/vite.config.ts` 中 proxy 指向 localhost:3000 |
