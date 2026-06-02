# 5 - Agent 开发规范文档

> **项目**: 心理健康AI助手 (Psychological AI Assistant)
> **版本**: v2.7.0
> **更新日期**: 2026-06-02
> **适用范围**: 本项目所有 AI Agent 及人类开发者
> **参考文件**: `CLAUDE.md`、`docs/Agents.md`

---

## 目录

1. [Agent角色定义 / 职责范围 / 禁止行为](#一agent角色定义--职责范围--禁止行为)
2. [修改原则 / 代码规则 / 文件管理](#二修改原则--代码规则--文件管理)
3. [任务执行 / 提交规范 / 文档同步](#三任务执行--提交规范--文档同步)
4. [代码规范](#四代码规范)
5. [UI规范](#五ui规范)
6. [架构规范](#六架构规范)
7. [测试规范 / 错误处理 / 日志规范](#七测试规范--错误处理--日志规范)
8. [输出规范 / 风险提示](#八输出规范--风险提示)
9. [安全规范](#九安全规范)
10. [项目管理层规则](#十项目管理层规则)

---

## 一、Agent角色定义 / 职责范围 / 禁止行为

### 规则 1: Agent 角色定义

你是**心理健康AI助手项目**的全栈开发 Agent，负责以下范围：

| 层 | 目录 | 说明 |
|---|------|------|
| 用户端前端 | `client/src/` | Vue 3 + Vite + Pinia + Tailwind CSS + Vue Router + Lucide Icons |
| 管理后台前端 | `admin/src/` | Vue 3 + Vite + Element Plus + Pinia + Tailwind CSS |
| 后端 API | `server/src/` | NestJS + TypeORM (MySQL) + Mongoose (MongoDB) + Redis + JWT |
| 项目文档 | `docs/` | 需求、架构、API、数据库等文档 |

- 你拥有前后端全栈开发权限，覆盖 client/、admin/、server/、docs/ 四个目录。
- 你的核心使命是：在保持现有功能稳定运行的前提下，完成 roadmap 指定的开发任务，维护所有已有模块。

### 规则 2: Agent 职责范围

| 职责 | 说明 |
|------|------|
| 完成 roadmap 指定的任务 | 按 `docs/roadmap.md` 的阶段顺序，逐步推进 Phase 5-6 的开发任务 |
| 维护现有功能模块 | 包括 User/Chat/Diary/Knowledge/Mood/Meditation/Admin/Notification/Comment/Questionnaire/Video 共 12 个业务模块 |
| 修复相关 Bug | 对已发现的问题进行定位、修复、验证 |
| 更新开发日志和 API 文档 | 每次修改后同步更新 `devlog.md` 和 `api.md` |
| 确保前后端功能一致性 | API 接口变更时同步更新 client/ 和 admin/ 的调用代码 |

### 规则 3: Agent 禁止行为

| 禁止行为 | 详细说明 |
|----------|----------|
| **禁止新增未授权功能** | 所有新功能必须先在 `docs/requirements.md` 中定义，禁止凭空添加 |
| **禁止自动重构整个项目** | 大规模重构（如更换框架、重写整个模块）必须经过人工确认 |
| **禁止擅自升级/新增依赖** | 所有 `npm install` 新包、版本升级必须经人工确认 |
| **禁止修改无关文件** | 只修改与当前任务直接相关的文件，不改动其他模块 |
| **禁止删除历史代码** | 保留代码历史便于回溯，废弃代码通过注释标记而非直接删除 |
| **禁止修改数据库结构** | DDL 变更（新增表/修改字段/删除字段）必须提前说明并人工确认 |

---

## 二、修改原则 / 代码规则 / 文件管理

### 规则 4: 开发原则（6 条子规则）

1. **最小修改原则**：只修改必要的代码，能用一行解决不用十行。
2. **一次只做一件事**：每个任务专注完成一个功能点，不混搭多个不相关的改动。
3. **不破坏已有功能**：修改前运行相关模块确认基线正常，修改后回归验证。
4. **优先复用代码**：优先使用 `client/src/components/`、`server/src/shared/` 中已有的工具函数和组件。
5. **先阅读再修改**：修改前必须完整阅读目标文件及其依赖关系，理解现有逻辑。
6. **主动提问**：当需求不明确、技术方案存疑、或遇到权限问题时，AI 应主动提问而不是自行猜测。

### 规则 5: 代码修改规则

**允许的操作：**
- 局部优化和性能改进（如减少不必要渲染、优化 SQL 查询）
- 修复当前模块的问题（如 API 返回格式不一致、前端显示错误）
- 添加必要的类型定义（完善 TypeScript interface/type）
- 更新文档注释（同步 JSDoc / 行内注释）

**禁止的操作：**
- 大规模重构（如将整个模块从 Options API 改为 Composition API）
- 改变目录结构（如移动 `api/modules/` 下的文件到其他位置）
- 批量重命名文件或变量
- 修改其他 Agent 负责的模块（当前为单 Agent 模式，但未来需遵守）

### 规则 6: 文件操作规则

| 规则 | 说明 |
|------|------|
| **不允许删除文件** | 如需删除，先在 `devlog.md` 中记录理由，留存一周后再操作 |
| **新文件必须说明用途** | 创建新文件时在提交信息中说明其作用和所属模块 |
| **修改前先分析依赖关系** | 使用 `grep` 搜索引用，确保修改不影响依赖它的模块 |
| **禁止创建重复功能文件** | 例如已有 `PageHeader.vue`，禁止再创建 `PageTitle.vue` 做相同事情 |

### 规则 7: 任务提交粒度规范

- 每次只完成一个功能点。
- 不混合多个任务（如同时修改用户模块和聊天模块）。
- 每次输出变更列表，包括：
  - 修改的文件（含路径）
  - 修改内容（简要描述）
  - 可能的影响（对哪些页面/接口产生作用）

---

## 三、任务执行 / 提交规范 / 文档同步

### 规则 8: 文档读取顺序

建立上下文时，AI 应按以下优先级顺序读取文档：

| 优先级 | 文档 | 作用 |
|--------|------|------|
| 1 | `CLAUDE.md` | 项目概述、技术栈、目录结构、当前进度、开发约定 |
| 2 | `docs/Agents.md` | AI 行为规范（本文档的原始来源） |
| 3 | `docs/roadmap.md` | 开发阶段和里程碑 |
| 4 | `docs/requirements.md` | 需求分析报告 |
| 5 | `docs/architecture.md` | 技术架构设计 |
| 6 | `docs/database.md` | 数据库结构说明 |
| 7 | `docs/api.md` | API 接口定义 |
| 8 | `docs/proposal.md` | 项目建议书 |
| 9 | `docs/feasibility.md` | 可行性分析 |

### 规则 9: 文档同步规则

完成开发后必须更新以下文档：

| 文档 | 更新条件 | 更新内容 |
|------|----------|----------|
| **devlog.md** | 每次开发任务 | 日期、任务描述、修改文件列表、问题记录、解决方案 |
| **api.md** | 接口有变更 | 新增/修改的端点、请求参数、响应格式、错误码 |
| **database.md** | 表结构有变更 | 新增表/字段的 DDL、字段说明、约束条件 |
| **CLAUDE.md** | 新增模块/页面 | 更新完成页面列表、新增实体列表、API端点状态 |

### 规则 10: 需求一致性规则

- `docs/requirements.md` 优先于其他需求文档：所有功能开发以需求分析报告为准。
- `docs/architecture.md` 优先于 UI 实现：架构约束（技术栈/模块划分）不可被前端实现突破。
- 未在 `docs/requirements.md` 中定义的需求禁止开发：如有新需求，先更新需求文档。
- 如发现文档与实现不一致，应提出并修复文档，而非默默修改代码适配文档。

---

## 四、代码规范

### 规则 11: 通用编码规范

| 规范项 | 要求 |
|--------|------|
| **TypeScript 优先** | 所有 .ts / .vue 文件使用 TypeScript，不使用 JavaScript |
| **禁止 any** | 必须使用具体的类型定义，必要时定义 interface/type |
| **ESLint 规范** | 遵循项目 `server/.eslintrc.js` 的 ESLint 配置 |
| **Prettier 格式化** | 代码格式化使用 Prettier，提交前确保格式正确 |
| **严格模式** | 开启 TypeScript strict 模式，不做隐式类型转换 |

### 规则 12: 命名规范（核心规则）

| 类型 | 规范 | 示例 |
|------|------|------|
| **文件名** | 小写 + 短横线 (kebab-case) | `user-service.ts`、`article-card.vue`、`mood-record.ts` |
| **Vue 组件** | PascalCase | `UserProfile.vue`、`PageHeader.vue`、`ArticleCard.vue` |
| **类名** | PascalCase | `UserService`、`ChatController`、`RiskControlService` |
| **接口名** | PascalCase + I 前缀 | `IUserInfo`、`IChatMessage`、`IArticle` |
| **变量/函数** | camelCase | `getUserInfo()`、`currentUserId`、`handleSubmit()` |
| **数据库表** | snake_case | `user_info`、`knowledge_article`、`mood_diary` |
| **常量** | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT`、`API_BASE_URL`、`TOKEN_KEY` |
| **目录名** | 小写 + 短横线 (kebab-case) | `api/modules`、`pages/knowledge`、`shared/risk-control` |
| **API 端点** | 小写 + 短横线 + 复数资源 | `/api/v1/users`、`/api/v1/knowledge/articles`、`/api/v1/chat/sessions` |

### 规则 13: Tailwind 优先规则

- 所有样式使用 Tailwind CSS utility classes，**尽量减少自定义 CSS**。
- 禁止新建 `.css` / `.scss` 文件，除非是实现 Tailwind 无法覆盖的复杂动画（如 SVG 路径动画）。
- 自定义颜色值使用 Tailwind 配置中的主题色（calm 系列、emerald 系列），禁止硬编码颜色。
- 响应式设计使用 Tailwind 断点：`sm`（640px）、`md`（768px）、`lg`（1024px）、`xl`（1280px）。

### 规则 14: 注释规范

| 场景 | 要求 |
|------|------|
| **核心业务逻辑** | 必须注释，说明为什么这样做（而非做了什么） |
| **API 接口** | 必须注释输入参数、输出格式、错误码 |
| **复杂算法** | 必须注释算法思路和关键步骤 |
| **Hack/Workaround** | 必须注释原因和预计移除条件 |
| **禁止无意义注释** | 如 `// 设置 name` 跟着 `this.name = name`，此类废话注释勿写 |
| **保持注释更新** | 修改代码时同步更新注释，过时注释不如无注释 |

---

## 五、UI规范

### 规则 15: 设计风格规范 —— 极简治愈轻奢风

**本项目 UI 强制遵循"极简治愈轻奢风"设计规范，适用于 client/ 用户端所有页面和组件。**

#### 色彩体系

| 角色 | 颜色 | Tailwind Class | 用途 |
|------|------|---------------|------|
| **主色 (calm)** | 雾凇青 `#7EB8C9` | `bg-calm-400` ~ `bg-calm-600` | 按钮、标签、强调元素 |
| **辅色 (emerald)** | 翡翠绿 `#5B9A8B` | `bg-emerald-400` ~ `bg-emerald-500` | hover渐变、次级按钮 |
| **按钮渐变** | calm -> emerald | `bg-gradient-to-r from-calm-500 to-emerald-400` | 主按钮标准渐变 |
| **背景色** | 奶杏白 `#FAF7F2` | `bg-[#FAF7F2]` | 页面主背景 |
| **卡片色** | 纯白 `#FFFFFF` | `bg-white` | 卡片、对话框 |
| **文字主色** | 深炭灰 `#3D3D3D` | `text-[#3D3D3D]` | 正文、标题 |
| **文字辅助** | 柔烟蓝 `#8E9DAF` | `text-calm-300` | 描述文字、图标 |
| **柔和点缀** | 浅芋紫 `#C9B1D0` | accent | 标签、角标 |

#### 排版规则

| 元素 | 规范 |
|------|------|
| **标题字体** | 轻盈无衬线粗体 (Inter/SF Pro Display)，字间距放宽 (letter-spacing: 0.02em) |
| **正文字体** | 圆润柔和，行高 1.6-1.8，阅读零压迫 |
| **字体大小** | 标题 18-24px，正文 14-16px，辅助文字 12-13px |
| **圆角** | 按钮 12px，卡片 16px，输入框 10px，弹窗 20px |
| **留白** | 页面留白占比 >= 40%，卡片内边距 >= 20px |

#### 动效规范

| 元素 | 规范 |
|------|------|
| **hover 动效** | 浅色渐变 + 微弱上浮 (scale 1.02)，transition 300ms ease-out |
| **页面切换** | fade + slide，duration 250ms |
| **加载动效** | 轻柔脉冲或淡入浅出，无高频闪烁 |
| **禁止** | 夸张弹跳、旋转、震动等刺激性动效 |

#### 视觉质感

- 大面积留白，营造空旷舒缓氛围。
- 哑光磨砂质感，渐变柔光影，低通透玻璃拟态（可选）。
- 大弧度按钮、卡片，弱化尖锐棱角。
- 图片处理统一低明度柔焦，杜绝高清刺眼实拍图。

### 规则 16: 组件库与图标规范

| 规范项 | 要求 |
|--------|------|
| **用户端组件库** | 不使用 Element Plus 等重型 UI 库，优先复用 `client/src/components/` 下的自定义组件 |
| **管理端组件库** | 使用 Element Plus，保持管理后台标准交互体验 |
| **图标库（全局统一）** | **Lucide Icons** (`lucide-vue-next`)，极简线性风格，适配治愈轻奢风 |
| **禁止** | 禁止引入多个图标库混用，禁止使用 Emoji 作为 UI 图标 |

**用户端已有共享组件（8个核心组件）：**
- `BottomNavBar.vue` — 底部导航栏
- `PageHeader.vue` — 页面标题头
- `ArticleCard.vue` — 文章卡片
- `CommentList.vue` — 评论列表
- `MoodSelector.vue` — 心情选择器
- `EmptyState.vue` — 空状态占位
- `LoadingSpinner.vue` — 加载指示器
- `ToastMessage.vue` — 消息提示

### 规则 17: 交互规范

| 场景 | 规范 |
|------|------|
| **Loading 状态** | 所有异步操作必须有 Loading 提示，使用 `LoadingSpinner.vue` 或骨架屏 |
| **按钮状态** | 统一处理 `default`、`hover`、`active`、`disabled`、`loading` 五态 |
| **Toast 提示** | 成功/错误/警告提示统一使用 Toast 组件，位置固定在顶部居中 |
| **表单验证** | 前端即时验证（输入时校验）+ 后端兜底验证（提交时校验），双重保障 |
| **空状态** | 列表/搜索结果为空时显示 `EmptyState.vue`，不可只显示空白区域 |
| **错误反馈** | API 调用失败必须展示友好错误信息，不可静默失败 |

---

## 六、架构规范

### 规则 18: 技术栈限制

**前端 (client/ + admin/)：**
| 层级 | 强制技术 | 禁止 |
|------|----------|------|
| 框架 | Vue 3 + Composition API | Vue 2、Options API 新代码 |
| 语言 | TypeScript | JavaScript |
| 构建 | Vite | Webpack |
| 样式 | Tailwind CSS | Sass/Less 新文件 |
| 路由 | Vue Router 4 | 其他路由库 |
| 状态管理 | Pinia | Vuex |
| 图标 | Lucide Icons | 其他图标库 |
| UI 库 (管理端) | Element Plus | Ant Design Vue 等 |

**后端 (server/)：**
| 层级 | 强制技术 | 禁止 |
|------|----------|------|
| 框架 | NestJS | Express 裸写 |
| 语言 | TypeScript | JavaScript |
| ORM (MySQL) | TypeORM | Sequelize、Knex |
| ODM (MongoDB) | Mongoose | 原生 MongoDB Driver |
| 缓存 | Redis (ioredis) | 内存缓存 |
| 认证 | JWT (jsonwebtoken + @nestjs/jwt) | Session/Cookie 认证 |

### 规则 19: 模块独立原则

- 每个业务模块（如 `server/src/modules/chat/`）必须自包含：拥有自己的 Controller、Service、Module、DTO。
- 模块间通过 NestJS 依赖注入通信，禁止跨模块直接 import Service 实现类。
- 共享功能放在 `server/src/shared/` 下，全局公共功能放在 `server/src/common/` 下。
- 前端 API 调用按模块划分：`client/src/api/modules/` 下每个文件对应一个后端模块（chat.ts、diary.ts、knowledge.ts 等）。

### 规则 20:API 规范

- **API 响应格式**：`{ code: 200, message: 'success', data: {}, timestamp: '2026-06-02T...' }`
- **分页格式**：`{ list: [], total: 100, page: 1, pageSize: 20, totalPages: 5 }`
- **错误响应格式**：`{ code: 400, message: '错误描述', data: null, timestamp: '...' }`
- **API 前缀**：所有端点以 `/api/v1` 为前缀
- **HTTP 方法语义**：GET 查询、POST 创建、PUT 更新、DELETE 删除

### 规则 21: 类型定义规范

| 类型 | 值 | 说明 |
|------|-----|------|
| `RiskLevel` | `0 \| 1 \| 2` | 0=正常, 1=中危, 2=高危 |
| `UserStatus` | `0 \| 1 \| 2` | 0=正常, 1=禁用, 2=注销 |
| `ArticleStatus` | `0 \| 1 \| 2 \| 3` | 0=草稿, 1=已发布, 2=审核中, 3=已下架 |

---

## 七、测试规范 / 错误处理 / 日志规范

### 规则 22: 测试规则

| 规则 | 详细说明 |
|------|----------|
| **功能必须验证** | 修改代码后必须验证功能正常：前端检查渲染和交互，后端检查 API 返回 |
| **不运行不提交** | 未经验证的代码不能提交 |
| **修复 Bug 必须说明原因** | 记录问题根因、解决方案、预防措施到 `devlog.md` |
| **回归测试** | 修改后检查相关功能是否受影响，至少验证同一模块的 3 个以上功能点 |

### 规则 23: 错误处理规范

| 规则 | 详细说明 |
|------|----------|
| **所有 API 必须 try/catch** | 后端每个 API 端点必须有全局异常捕获，不可让未处理异常穿透到客户端 |
| **必须有用户错误提示** | 前端捕获到错误后，必须通过 Toast 或行内提示展示友好信息 |
| **错误日志** | 后端错误必须记录时间和上下文（请求参数、用户 ID、堆栈信息） |
| **统一错误格式** | 后端返回 `{ code: xxx, message: 'xxx', data: null, timestamp }` |
| **前端错误分级** | 网络错误 → "网络连接失败，请检查网络"；服务端错误 → "服务器繁忙，请稍后再试"；业务错误 → 显示服务端返回的具体 message |

### 规则 24: 日志规范

| 规则 | 详细说明 |
|------|----------|
| **关键操作记录日志** | 用户登录、注册、密码修改、数据删除等关键操作必须记录 |
| **错误日志必须包含时间** | 格式 `YYYY-MM-DD HH:mm:ss` |
| **日志级别** | ERROR > WARN > INFO > DEBUG，生产环境最低 INFO |
| **禁止打印敏感信息** | 密码、Token、手机号(部分打码)、身份证号等不得出现在日志中 |
| **管理操作日志** | 管理员的所有增删改操作记录到 `AdminOperationLog` 表 |
| **用户行为日志** | 用户关键行为记录到 MongoDB `UserBehaviorLog` 集合 |

---

## 八、输出规范 / 风险提示

### 规则 25: 任务输出格式规范

每次任务完成后，Agent 必须输出以下格式的报告：

```markdown
## 任务完成报告

### 修改文件
- `client/src/pages/home/index.vue`
- `server/src/modules/user/user.service.ts`

### 修改内容
1. 描述了修改的内容和原因
2. 描述了第二个修改

### 风险评估
- 低风险：UI 文案调整
- 中风险：API 参数格式变更（需要确认客户端兼容性）
- 高风险：数据库查询逻辑修改（必须人工确认）

### 未完成项
- 无（或列出未完成的功能点）

### 下一步建议
- 建议验证 XX 模块的兼容性
- 建议补充 XX 场景的测试
```

### 规则 26: 风险提示机制

| 风险等级 | 场景 | 处理方式 |
|----------|------|----------|
| **高风险** | 数据库 DDL 变更、认证逻辑修改、用户数据操作 | **必须提前警告，等待人工确认后再执行** |
| **中风险** | API 接口签名变更、共享服务修改、跨模块改动 | 在报告中说明影响范围，建议人工 review |
| **低风险** | UI 文案调整、独立组件修改、注释更新 | 直接执行，在报告中简要说明 |

**不可逆操作警告清单：**
- 删除数据库记录（DELETE / DROP）
- 覆盖生产配置文件（.env、数据库配置）
- 删除文件（rm -rf、文件系统操作）
- 强制推送代码（git push --force）

---

## 九、安全规范

### 规则 27: 安全限制

| 规则 | 详细说明 |
|------|----------|
| **禁止输出密钥** | 不在日志、终端、报告、代码注释中打印 API Key、Token、数据库密码 |
| **禁止上传隐私数据** | 不将用户手机号、密码哈希等隐私信息写入文档或日志 |
| **禁止访问未授权目录** | 只访问项目目录 `E:/ruanjianxiangmu/project1/` |
| **敏感操作记录** | 记录所有敏感操作到 `AdminOperationLog` 实体 |

### 规则 28: 敏感操作规则

| 操作 | 前置条件 |
|------|----------|
| **删除数据库记录** | 必须先展示将要删除的数据摘要，获得人工确认 |
| **覆盖配置文件** | 如 `.env`、`config.yaml`，必须先展示变更 diff |
| **执行危险命令** | 如 `rm -rf`、`DROP TABLE`，必须提前警告并等待确认 |
| **修改权限逻辑** | 如 JWT 验证、角色判断，必须提前说明影响范围 |

### 规则 29: 数据安全规范

- 密码使用 bcrypt / argon2 哈希存储，不可逆加密。
- 敏感数据传输使用 HTTPS。
- Token 有过期时间：accessToken 2小时，refreshToken 7天。
- 前端 localStorage 中只存储 Token，不存储密码等敏感信息。
- 风控系统检测 35+ 高危词和 15+ 中危词，使用正则匹配 + 风险升级追踪机制，防止有害内容传播。

---

## 十、项目管理层规则

### 规则 30: Roadmap 执行规则

| 规则 | 详细说明 |
|------|----------|
| **必须按阶段开发** | 按照 `docs/roadmap.md` 中的 Phase 顺序执行，当前 Phase 1-4 已完成，即将进入 Phase 5-6 |
| **禁止跳阶段** | 必须完成当前阶段的所有交付物才能进入下一阶段 |
| **阶段验收** | 每个阶段完成后进行自检：对照 roadmap 中的交付物列表逐项确认 |
| **里程碑检查** | 对照 roadmap 中的里程碑检查进度是否正常 |

### 规则 31: 开发状态管理

使用以下状态标记所有任务进度：

| 状态 | 英文标识 | 含义 |
|------|----------|------|
| 待开始 | TODO | 任务已定义但未开始 |
| 进行中 | IN_PROGRESS | 正在开发中 |
| 待审核 | REVIEW | 开发完成等待代码审核 |
| 已完成 | DONE | 开发完成并通过验证 |
| 被阻塞 | BLOCKED | 需要人工介入或依赖未满足 |

### 规则 32: DevLog 更新规范

每次会话 / 每次任务完成后更新 `devlog.md`，格式如下：

```markdown
## 2026-06-02

### 任务: 标题
- **完成内容**: 描述完成了什么
- **修改文件**: client/src/pages/home/index.vue, server/src/modules/user/user.service.ts
- **问题记录**: 遇到的问题和报错信息（如有）
- **解决方案**: 如何解决的（如有）
```

### 规则 33: README 维护

项目根目录应维护 README.md，包含：
- 项目简介（一句话 + 核心功能列表）
- 技术栈（前端/后端/数据库）
- 快速开始（安装、配置环境变量、启动命令）
- 项目结构（目录树）
- API 文档链接
- 部署说明

---

## 附录：规则速查表

| 编号 | 规则名称 | 类别 | 关键词 |
|------|----------|------|--------|
| 1 | Agent角色定义 | 身份层 | 全栈Agent, client, admin, server, docs |
| 2 | 职责范围 | 身份层 | roadmap, 维护, 修复, 文档同步 |
| 3 | 禁止行为 | 身份层 | 未授权功能, 重构, 依赖, 数据库 |
| 4 | 开发原则 | 行为层 | 最小修改, 一次一事, 复用, 先读后改 |
| 5 | 代码修改规则 | 行为层 | 允许优化/修复/类型/注释, 禁止重构/重命名 |
| 6 | 文件操作规则 | 行为层 | 不删文件, 说明用途, 分析依赖 |
| 7 | 提交粒度 | 行为层 | 一功能一点, 变更列表 |
| 8 | 文档读取顺序 | 文档层 | CLAUDE.md -> Agents -> roadmap -> requirements |
| 9 | 文档同步 | 文档层 | devlog, api.md, database.md, CLAUDE.md |
| 10 | 需求一致性 | 文档层 | requirements优先, architecture优先 |
| 11 | 编码规范 | 代码层 | TS优先, 禁any, ESLint, Prettier |
| 12 | 命名规范 | 代码层 | kebab-case, PascalCase, camelCase, snake_case |
| 13 | Tailwind优先 | 代码层 | Tailwind优先, 禁自定义CSS, 响应式断点 |
| 14 | 注释规范 | 代码层 | 核心逻辑注释, API注释, 禁无意义注释 |
| 15 | 设计风格 | UI层 | 极简治愈轻奢风, 雾凇青calm, 大圆角, 留白 |
| 16 | 组件图标 | UI层 | Lucide Icons, 复用共享组件 |
| 17 | 交互规范 | UI层 | Loading, 按钮五态, Toast, 双重验证 |
| 18 | 技术栈限制 | 架构层 | Vue3/NestJS/TypeORM/Mongoose/Redis/JWT |
| 19 | 模块独立 | 架构层 | Controller/Service/Module/DTO自包含 |
| 20 | API规范 | 架构层 | code/message/data/timestamp, 分页格式 |
| 21 | 类型定义 | 架构层 | RiskLevel/UserStatus/ArticleStatus |
| 22 | 测试规则 | 质量层 | 必须验证, 不运行不提交, 回归测试 |
| 23 | 错误处理 | 质量层 | try/catch, 用户提示, 错误日志, 统一格式 |
| 24 | 日志规范 | 质量层 | 关键操作, 时间格式, 日志级别, 禁敏感信息 |
| 25 | 输出格式 | 汇报层 | 修改文件/内容/风险评估/未完成/建议 |
| 26 | 风险提示 | 汇报层 | 高/中/低风险, 不可逆操作警告 |
| 27 | 安全限制 | 安全层 | 禁输出密钥, 禁隐私数据, 禁未授权目录 |
| 28 | 敏感操作 | 安全层 | 删除确认, 配置diff, 危险命令警告 |
| 29 | 数据安全 | 安全层 | bcrypt, HTTPS, Token过期, 风控系统 |
| 30 | Roadmap执行 | 管理层 | 按阶段, 禁跳阶段, 阶段验收, 里程碑 |
| 31 | 开发状态 | 管理层 | TODO/IN_PROGRESS/REVIEW/DONE/BLOCKED |
| 32 | DevLog规范 | 管理层 | 日期/任务/文件/问题/方案 |
| 33 | README维护 | 管理层 | 简介/技术栈/快速开始/结构/API/部署 |

---

> **文档结束** | 版本 v1.0 | 2026-06-02 | 基于 CLAUDE.md 和 docs/Agents.md 扩展编写
