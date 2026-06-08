---
name: build
description: 生产构建 — server(tsc) + client(vite build) + admin(vite build)，输出到各 dist 目录
---

# 生产构建

## AI 执行流程

按 Server → Client → Admin 顺序构建，汇总结果。

### Step 1: Server 构建

```bash
echo "=== 构建 Server ==="
cd server && npm run build 2>&1
```

输出: `server/dist/` (CommonJS JS 文件)
构建命令: `tsc && tsc-alias` (编译 + 路径别名转换)

验证:
```bash
test -f server/dist/main.js && echo "✅ Server 构建成功" || echo "❌ Server 构建失败"
```

### Step 2: Client 构建

```bash
echo "=== 构建 Client ==="
cd client && npm run build 2>&1
```

输出: `client/dist/` (Vite 打包的静态文件)
构建命令: `vue-tsc && vite build`

验证:
```bash
test -f client/dist/index.html && echo "✅ Client 构建成功" || echo "❌ Client 构建失败"
```

### Step 3: Admin 构建

```bash
echo "=== 构建 Admin ==="
cd admin && npm run build 2>&1
```

输出: `admin/dist/` (Vite 打包的静态文件)
构建命令: `vue-tsc -b && vite build`

验证:
```bash
test -f admin/dist/index.html && echo "✅ Admin 构建成功" || echo "❌ Admin 构建失败"
```

### Step 4: 汇总

输出格式:
```
构建报告:
  Server: ✅ dist/main.js
  Client: ✅ dist/index.html  (N KB)
  Admin: ✅ dist/index.html   (N KB)
```

## 构建产物

| 项目 | 输出目录 | 入口文件 | 说明 |
|------|---------|---------|------|
| Server | `server/dist/` | `main.js` | Node.js 可直接运行 `node dist/main.js` |
| Client | `client/dist/` | `index.html` | 静态文件，需 Web 服务器部署 |
| Admin | `admin/dist/` | `index.html` | 静态文件，需 Web 服务器部署 |

## 部署注意事项

1. **Server** 运行时需要:
   - `node_modules/` (生产依赖)
   - `server/.env` (生产环境变量)
   - MySQL / MongoDB / Redis 可访问

2. **Client/Admin** 部署时需要:
   - 配置 Nginx 反向代理: `/api/v1` → Server 3000
   - SPA fallback: 所有路由 → index.html

3. **Nginx 配置示例**:
```nginx
server {
    listen 80;
    server_name example.com;

    # Client
    location / {
        root /var/www/client/dist;
        try_files $uri $uri/ /index.html;
    }

    # Admin
    location /admin {
        alias /var/www/admin/dist;
        try_files $uri $uri/ /admin/index.html;
    }

    # API
    location /api/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 常见构建错误

| 错误 | 原因 | 解决 |
|------|------|------|
| `vue-tsc: command not found` | 未安装 vue-tsc | `npm install` |
| `Cannot find module` | 缺少依赖 | `npm install` |
| `Type error in ...` | 类型不匹配 | 修复类型或 `// @ts-ignore` (临时) |
| `Out of memory` | Vite 内存不足 | `NODE_OPTIONS=--max-old-space-size=4096 npm run build` |
| `ENOENT: no such file` | 引用不存在的文件 | 检查 import 路径 |
