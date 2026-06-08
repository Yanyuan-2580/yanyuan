---
name: kill-ports
description: 清理开发服务器占用的端口 — 释放 3000(Server) / 5173(Client) / 5174(Admin)
---

# 清理端口占用

## AI 执行流程

### Step 1: 查找占用进程

```bash
echo "=== 当前端口占用 ==="
netstat -ano | grep -E ":3000|:5173|:5174" | grep LISTENING
```

### Step 2: 按需终止

根据 Step 1 的输出，终止对应的 PID:

```bash
# 终止 Server 端口 3000
netstat -ano | grep ":3000" | grep LISTENING | awk '{print $5}' | while read pid; do
  echo "终止 PID $pid (端口 3000)"
  taskkill //PID "$pid" //F 2>/dev/null
done

# 终止 Client 端口 5173
netstat -ano | grep ":5173" | grep LISTENING | awk '{print $5}' | while read pid; do
  echo "终止 PID $pid (端口 5173)"
  taskkill //PID "$pid" //F 2>/dev/null
done

# 终止 Admin 端口 5174
netstat -ano | grep ":5174" | grep LISTENING | awk '{print $5}' | while read pid; do
  echo "终止 PID $pid (端口 5174)"
  taskkill //PID "$pid" //F 2>/dev/null
done
```

### Step 3: 验证

```bash
echo "=== 清理后状态 ==="
netstat -ano | grep -E ":3000|:5173|:5174" | grep LISTENING && echo "⚠️ 仍有端口占用" || echo "✅ 所有端口已释放"
```

## 一键清理 (备选)

```bash
netstat -ano | grep -E ":3000|:5173|:5174" | grep LISTENING | awk '{print $5}' | sort -u | while read pid; do taskkill //PID "$pid" //F 2>/dev/null && echo "已终止 PID $pid"; done
```

## 端口对照

| 端口 | 服务 | 启动命令 |
|------|------|---------|
| 3000 | NestJS Server | `cd server && npm run start:dev` |
| 5173 | Vue Client | `cd client && npm run dev` |
| 5174 | Vue Admin | `cd admin && npm run dev` |
