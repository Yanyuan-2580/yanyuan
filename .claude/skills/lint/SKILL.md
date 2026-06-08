---
name: lint
description: 对 server/client/admin 依次执行 TypeScript 类型检查 — 发现编译时错误
---

# 类型检查

## AI 执行流程

对三个子项目依次执行 TypeScript 类型检查，汇总结果。

### Step 1: Server 类型检查

```bash
echo "=== Server ==="
cd server && npx tsc --noEmit 2>&1 | head -50
```

如果项目没有 `--noEmit` 支持，使用:
```bash
cd server && npm run build 2>&1 | tail -20
```

### Step 2: Client 类型检查

```bash
echo "=== Client ==="
cd client && npx vue-tsc --noEmit 2>&1 | head -50
```

### Step 3: Admin 类型检查

```bash
echo "=== Admin ==="
cd admin && npx vue-tsc --noEmit 2>&1 | head -50
```

Admin 使用 `vue-tsc -b` 模式:
```bash
cd admin && npm run build 2>&1 | tail -20
```

### Step 4: 汇总

输出格式:
```
类型检查报告:
  Server: ✅ 无错误 / ❌ N 个错误
  Client: ✅ 无错误 / ❌ N 个错误
  Admin: ✅ 无错误 / ❌ N 个错误
```

## tsconfig 关键配置

| 配置项 | Server | Client | Admin |
|--------|--------|--------|-------|
| strict | ❌ (false) | ✅ (true) | (见子配置) |
| noUnusedLocals | ❌ | ✅ | (见子配置) |
| noUnusedParameters | ❌ | ✅ | (见子配置) |
| module | commonjs | ESNext | ESNext |
| target | ES2021 | ES2020 | (见子配置) |

## 常见类型错误及修复

| 错误 | 原因 | 修复 |
|------|------|------|
| `Cannot find module '@/...'` | 路径别名未配置 | 检查 `tsconfig.json` 中的 `paths` |
| `Property 'xxx' does not exist` | 类型定义缺失 | 添加类型声明 |
| `Type 'xxx' is not assignable` | 类型不匹配 | 修正类型或使用 `as` 断言 |
| `Could not find a declaration file` | 缺少 @types 包 | 安装 `@types/xxx` 或添加 `.d.ts` |
| `Object is possibly 'undefined'` | strict 模式下可选属性 | 使用可选链 `?.` 或判空 |

## 注意事项

- **先检查 Server**，因为它定义了核心类型
- Client 和 Admin 的类型错误通常是局部的，修复后重新检查即可
- `--noEmit` 只检查不输出文件，比完整 build 快
- 如果 `vue-tsc` 不可用，`npm run build` 也会执行类型检查
