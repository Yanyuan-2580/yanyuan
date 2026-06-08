---
name: security-check
description: 项目安全检查 — .gitignore 完整性 / 敏感信息泄露 / 依赖漏洞 / 文件权限
---

# 项目安全检查

## AI 执行流程

依次检查以下 4 个维度，输出安全报告。

### Step 1: .gitignore 完整性

```bash
echo "=== .gitignore 检查 ==="

# 检查 .env 是否被追踪
git ls-files | grep "\.env$" && echo "⚠️ .env 文件被 Git 追踪！应立即移除" || echo "✅ .env 未被追踪"

# 检查 node_modules 是否被追踪
git ls-files | grep "^node_modules/" | head -5 && echo "⚠️ node_modules 被追踪" || echo "✅ node_modules 未被追踪"

# 检查 dist 是否被追踪
git ls-files | grep "^server/dist/" | head -1 && echo "⚠️ dist 目录被追踪" || echo "✅ dist 未被追踪"

# 检查 uploads (除了 .gitkeep)
git ls-files | grep "^uploads/" | grep -v gitkeep | head -1 && echo "⚠️ uploads 中有文件被追踪" || echo "✅ uploads 安全"
```

### Step 2: 敏感信息泄露检查

搜索硬编码密钥和敏感信息:

```bash
echo "=== 敏感信息检查 ==="

# API Key / Secret
grep -rn --include="*.ts" --include="*.js" --include="*.vue" \
  -e "api_key\s*=\s*['\"]\w" \
  -e "apikey\s*=\s*['\"]\w" \
  -e "secret\s*=\s*['\"]\w" \
  -e "password\s*=\s*['\"]\w" \
  -e "token\s*=\s*['\"]\w" \
  server/src/ client/src/ admin/src/ \
  --exclude-dir=node_modules --exclude-dir=dist \
  2>/dev/null | grep -v "\.example\|\.env\|process\.env\|configService\|config\.get" \
  && echo "⚠️ 可能存在硬编码密钥" || echo "✅ 未发现明显硬编码密钥"

# JWT Secret 检查
grep -rn "jwt.*secret\|JWT_SECRET" server/src/ --include="*.ts" | grep -v "process\.env\|configService\|env\|import" \
  && echo "⚠️ JWT Secret 可能硬编码" || echo "✅ JWT Secret 使用环境变量"

# 数据库密码
grep -rn "password" server/src/config/ server/src/app.module.ts 2>/dev/null | grep -v "process\.env\|env\|import\|\.example" \
  && echo "⚠️ 数据库密码可能硬编码" || echo "✅ 数据库密码使用环境变量"
```

### Step 3: 依赖漏洞

```bash
echo "=== 依赖检查 ==="

# Server
cd server && npm audit --audit-level=high 2>&1 | tail -10

# Client
cd client && npm audit --audit-level=high 2>&1 | tail -10

# Admin
cd admin && npm audit --audit-level=high 2>&1 | tail -10
```

### Step 4: .env 文件安全

```bash
echo "=== .env 安全 ==="

# 检查 .env.example 是否被追踪 (应该被追踪)
git ls-files | grep "\.env\.example" && echo "✅ .env.example 已追踪" || echo "⚠️ .env.example 未被追踪"

# 检查 .env 是否被 Git 忽略
git check-ignore server/.env 2>&1 && echo "✅ server/.env 被忽略" || echo "⚠️ server/.env 可能未被忽略"

# 检查 .env.local
git check-ignore server/.env.local 2>&1 && echo "✅ .env.local 被忽略" || echo "✅ .env.local 不存在或无此文件"
```

### Step 5: 输出报告

格式:
```
安全检查报告:
  .gitignore:   ✅/⚠️ (N 个问题)
  敏感信息:     ✅/⚠️ (N 个可疑点)
  依赖漏洞:     ✅/⚠️ (N 个高危)
  .env 安全:   ✅/⚠️ (N 个问题)

综合评级: 🟢 安全 / 🟡 需注意 / 🔴 有风险
```

## 已知需关注的敏感文件

| 文件 | 状态 | 说明 |
|------|------|------|
| `server/.env` | ✅ 已忽略 | 含真实数据库密码和 API Key |
| `server/.env.example` | ✅ 已追踪 | 模板文件，无真实密钥 |
| `.claude/settings.local.json` | ✅ 已忽略 | 含个人 Token |
| `client/public/images/` | 🆕 新文件 | 检查是否过大 (>5MB) |

## 安全隐患清单

| 风险等级 | 问题 | 修复 |
|---------|------|------|
| 🔴 高 | .env 被 Git 追踪 | `git rm --cached server/.env` + 立即更换所有密钥 |
| 🔴 高 | 硬编码的 API Key | 改为 `process.env.XXX` 或 `configService.get('XXX')` |
| 🟡 中 | JWT Secret 太短 | 至少 32 字符随机字符串 |
| 🟡 中 | 依赖有已知漏洞 | `npm audit fix` 或手动升级 |
| 🟢 低 | uploads 中有测试文件 | 清理或加入 .gitignore |

## 不应被追踪的文件类型

- `*.env` 和 `*.env.local` (所有环境的)
- `node_modules/`
- `dist/`
- `uploads/*` (除了 `.gitkeep`)
- `*.log`
- `.claude/settings.local.json`
