---
name: git-save
description: 规范化 Git 提交流程 — 展示变更 → 生成 commit message → 用户确认 → 提交
---

# 规范化 Git 提交

> **AI 执行规则**: 不直接执行 `git commit`，必须先展示变更内容，生成 commit message，等用户确认后再提交。

## AI 执行流程

### Step 1: 查看当前状态

```bash
git status
```

### Step 2: 查看具体变更

```bash
git diff --stat
```

如果有已暂存的变更:
```bash
git diff --cached --stat
```

### Step 3: 展示关键变更内容

选择 3-5 个最关键的文件展示变更摘要:

```bash
git diff --name-only
```

### Step 4: 生成 Commit Message

根据变更内容，生成符合 Conventional Commits 规范的提交信息:

格式: `<type>(<scope>): <description>`

| Type | 用途 | 示例 |
|------|------|------|
| `feat` | 新功能 | `feat(chat): 添加 SSE 流式对话` |
| `fix` | Bug 修复 | `fix(auth): 修复 Token 刷新逻辑` |
| `docs` | 文档更新 | `docs(api): 更新心情模块接口文档` |
| `style` | 代码格式 | `style(client): 统一卡片圆角为 12px` |
| `refactor` | 重构 | `refactor(server): 提取风控服务` |
| `perf` | 性能优化 | `perf(chat): 添加消息缓存` |
| `test` | 测试 | `test(mood): 添加心情统计测试` |
| `chore` | 杂项 | `chore(deps): 升级 TypeScript 到 5.5` |

Scope 取值:
- `client` / `admin` / `server` (按前端/后端)
- `chat` / `diary` / `knowledge` / `mood` / `meditation` / `user` / `questionnaire` / `video` / `notification` / `admin` (按模块)
- `docs` / `deps` / `config` / `build` (其他)

### Step 5: 展示并等待确认

向用户展示:
```
📋 准备提交:

文件变更:
  M  client/src/pages/chat/ChatPage.vue
  M  server/src/modules/chat/chat.service.ts
  ...

Commit Message:
  feat(chat): 优化对话流式响应体验

确认提交？(y/n)
```

### Step 6: 执行提交 (用户确认后)

```bash
git add -A
git commit -m "<commit-message>"
```

## 注意事项

- **永远不覆盖 .env** — 检查变更中是否包含 `.env` 文件
- **检查敏感数据** — `git diff` 中不应出现密码、Token、API Key
- **检查大文件** — 图片 > 1MB 应该提示用户
- **检查意外文件** — `node_modules/`、`dist/` 不能出现在变更中
- **dist 文件不该提交** — 如果 `git diff` 中有 `dist/`，说明 `.gitignore` 可能有问题

## 示例对话

用户: `/git-save`

AI:
```
📋 当前变更 (2 个文件):

  M  client/src/pages/chat/ChatPage.vue  (+15, -3)
     - 添加 Loading 骨架屏
     - 优化消息滚动体验

  M  server/src/modules/chat/chat.service.ts  (+8, -2)
     - 增加超时重试逻辑

建议 Commit:
  feat(chat): 对话页添加骨架屏 + 服务端超时重试

确认提交？(y/n)
```
