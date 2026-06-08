---
name: dev-admin
description: 仅启动管理端 Vue 开发服务器 (localhost:5174) — Element Plus 管理后台
---

# 启动管理端开发服务器

启动 Vue 3 + Vite + Element Plus 管理后台，监听 `http://localhost:5174`。

**注意: 依赖后端 Server 运行在 `localhost:3000`，请先启动 Server。**

## AI 执行流程

### Step 1: 启动

```bash
cd admin && npm run dev
```

### Step 2: 验证

```bash
curl -s -o /dev/null -w "HTTP %{http_code}" http://localhost:5174
```

预期: `HTTP 200`

## 页面路由速查

| 路径 | 页面 | 认证 |
|------|------|------|
| `/login` | 管理员登录 | ❌ |
| `/` | Dashboard 统计概览 | ✅ |
| `/users` | 用户管理 | ✅ |
| `/articles` | 文章管理 | ✅ |
| `/risk` | 风控管理 | ✅ |
| `/audit-logs` | 审计日志 | ✅ |

## 路由守卫逻辑

- `/login` → 已登录管理员跳转到 `/`
- 其他所有路由 → 未登录跳转到 `/login`
- 检查依据: `localStorage.getItem('adminToken')`
- **注意**: adminToken 与用户端 accessToken 完全独立

## API 模块清单

```
admin/src/api/modules/
├── admin.ts      # Dashboard/Statistics/Analytics
├── user.ts       # 用户管理 CRUD
├── knowledge.ts  # 文章管理 CRUD + 审核
└── risk.ts       # 风控记录
```

**Admin API baseURL**: `http://localhost:3000/api/v1/admin`

## UI 框架说明

- **主框架**: Element Plus (表格 `el-table`, 表单 `el-form`, 弹窗 `el-dialog`, 分页 `el-pagination`)
- **样式补充**: Tailwind CSS
- **布局**: `AdminLayout.vue` (侧边栏 + 顶栏 + 内容区)
- **编辑器**: `MarkdownEditor.vue` (文章编辑)

## Element Plus 常用模式

```vue
<!-- 表格页面标准结构 -->
<template>
  <div class="p-6">
    <!-- 搜索栏 -->
    <el-form :inline="true" :model="searchForm" class="mb-4">
      <el-form-item label="关键词">
        <el-input v-model="searchForm.keyword" placeholder="搜索..." clearable />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="fetchData">搜索</el-button>
        <el-button @click="resetSearch">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 操作按钮 -->
    <div class="mb-4">
      <el-button type="primary" @click="handleCreate">新增</el-button>
    </div>

    <!-- 表格 -->
    <el-table :data="tableData" border stripe v-loading="loading">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="name" label="名称" />
      <el-table-column label="操作" width="200">
        <template #default="{ row }">
          <el-button size="small" @click="handleEdit(row)">编辑</el-button>
          <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <el-pagination
      class="mt-4"
      v-model:current-page="page"
      v-model:page-size="pageSize"
      :total="total"
      layout="total, prev, pager, next"
      @current-change="fetchData"
    />
  </div>
</template>
```
