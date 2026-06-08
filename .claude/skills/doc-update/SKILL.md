---
name: doc-update
description: 根据最新代码变更检查文档同步状态 — 提示需要更新的 api.md / database.md / devlog.md
---

# 文档同步检查

> **AI 执行规则**: 对比代码与文档的差异，列出需要更新的文档清单。不直接修改文档，只给出建议。

## AI 执行流程

### Step 1: 检查最近的代码变更

```bash
echo "=== 最近变更 (最近2周) ==="
git log --oneline --since="2 weeks ago" --name-only | head -40
```

### Step 2: 对比 API 文档

检查 `server/src/modules/` 中的 controller 文件与 `docs/api.md` 的差异:

```bash
echo "=== API 端点变化 ==="

# 统计各模块 controller 中的端点数量
echo "Controller 端点统计:"
find server/src/modules -name "*.controller.ts" | while read f; do
  module=$(echo "$f" | sed 's|.*/modules/||; s|/.*||')
  count=$(grep -c "@Get\|@Post\|@Put\|@Delete\|@Patch" "$f")
  echo "  $module: $count 个端点"
done

echo ""
echo "docs/api.md 行数:"
wc -l docs/api.md
```

如果 `docs/api.md` 内容过少 (< 30 行)，说明文档未同步，需要大幅更新。

### Step 3: 对比数据库文档

检查实体文件与 `docs/database.md` 的差异:

```bash
echo "=== 数据库实体变化 ==="

echo "Entity 文件:"
find server/src/database/entities -name "*.entity.ts" | while read f; do
  entity=$(basename "$f" .entity.ts)
  echo "  $entity"
done

echo ""
echo "docs/database.md 行数:"
wc -l docs/database.md
```

### Step 4: 检查 DevLog

```bash
echo "=== DevLog 检查 ==="

# 检查是否有 devlog
test -f docs/devlog.md && echo "✅ devlog.md 存在" || echo "❌ 缺少 devlog.md"

# 检查最近更新日期
test -f docs/devlog.md && echo "最后更新:" && head -5 docs/devlog.md || true

# 对比最近 Git 提交
echo ""
echo "最近 Git 提交 (最近1周):"
git log --oneline --since="1 week ago"
```

### Step 5: 输出同步报告

格式:
```
文档同步报告:
  docs/api.md:       ✅ 已同步 / ⚠️ 需要更新 (缺少 N 个模块的端点)
  docs/database.md:  ✅ 已同步 / ⚠️ 需要更新 (缺少 N 个实体)
  docs/devlog.md:    ✅ 最近更新 / ⚠️ 需要补充 (最近 N 次提交未记录)
  docs/architecture.md: ⚠️ 内容为空，需要填充
  docs/requirements.md: ✅/⚠️
```

## 文档维护清单

| 文档 | 何时更新 | 更新内容 |
|------|---------|---------|
| `api.md` | 新增/修改/删除 API 端点 | 端点路径、请求参数、响应格式 |
| `database.md` | 新增/修改/删除实体 | 表结构、字段说明、关联关系 |
| `devlog.md` | 每次开发任务后 | 完成内容、修改文件、问题记录 |
| `architecture.md` | 架构变更 | 技术选型变化、目录结构调整 |
| `requirements.md` | 需求变更 | 新增/修改功能需求 |
| `CLAUDE.md` | 开发进度变化 | Phase 完成情况、模块状态 |

## 文档同步优先级

1. **🔴 必须**: `api.md` — API 变更必须同步，否则前后端对接出问题
2. **🔴 必须**: `devlog.md` — 每次 `/git-save` 后应更新一条
3. **🟡 推荐**: `database.md` — 表结构变更时更新
4. **🟢 可选**: `architecture.md` / `requirements.md` — 重大变更时更新

## DevLog 更新模板

每次完成开发任务后，在 `docs/devlog.md` 中追加:

```markdown
## YYYY-MM-DD

### 任务: {任务描述}
- **完成内容**: {具体做了什么}
- **修改文件**: 
  - `server/src/modules/xxx/xxx.ts` — {改动说明}
  - `client/src/pages/xxx/XxxPage.vue` — {改动说明}
- **问题记录**: {遇到的问题，无则写"无"}
- **解决方案**: {如何解决的，无则写"无"}
```
