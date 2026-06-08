---
name: generate-admin-page
description: 生成管理端 Vue 页面 — Element Plus 表格/表单 + 搜索栏 + 分页 + CRUD 弹窗
---

# 生成管理端 Vue 页面

> **AI 执行规则**: 使用 Element Plus 组件库，遵循管理端现有页面风格。生成后告知用户添加路由。

## 输入

用户需提供:
- **页面名** (中文): 如 `提醒管理`
- **路由路径**: 如 `/reminders`
- **API 前缀**: 如 `/api/v1/admin/reminders`
- **表格列**: `列名:字段名:宽度`

## 生成文件清单

```
admin/src/pages/{PageName}Page.vue          # 页面组件
admin/src/api/modules/{module}.ts            # API 模块
admin/src/router/index.ts                    # 添加路由
```

## 1. 页面组件模板 (标准 CRUD 表格)

```vue
<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getList, create, update, remove } from '@/api/modules/{module}'
import type { {TypeName}Item } from '@/types/{module}'

// ========== 表格数据 ==========
const loading = ref(false)
const tableData = ref<{TypeName}Item[]>([])
const page = ref(1)
const pageSize = ref(20)
const total = ref(0)

// ========== 搜索 ==========
const searchForm = reactive({
  keyword: '',
})

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getList({
      page: page.value,
      pageSize: pageSize.value,
      ...searchForm,
    })
    tableData.value = res.data.list
    total.value = res.data.total
  } catch (error) {
    ElMessage.error('获取数据失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  page.value = 1
  fetchData()
}

const handleReset = () => {
  searchForm.keyword = ''
  page.value = 1
  fetchData()
}

// ========== 新增/编辑弹窗 ==========
const dialogVisible = ref(false)
const dialogTitle = ref('新增')
const isEditing = ref(false)
const editId = ref<number | null>(null)
const submitting = ref(false)

const form = reactive({
  name: '',
  description: '',
})

const formErrors = reactive<Record<string, string>>({})

const resetForm = () => {
  form.name = ''
  form.description = ''
  Object.keys(formErrors).forEach(k => delete formErrors[k])
}

const validateForm = (): boolean => {
  Object.keys(formErrors).forEach(k => delete formErrors[k])
  if (!form.name.trim()) {
    formErrors.name = '名称不能为空'
    return false
  }
  return true
}

const handleCreate = () => {
  dialogTitle.value = '新增'
  isEditing.value = false
  editId.value = null
  resetForm()
  dialogVisible.value = true
}

const handleEdit = (row: {TypeName}Item) => {
  dialogTitle.value = '编辑'
  isEditing.value = true
  editId.value = row.id
  form.name = row.name
  form.description = row.description || ''
  dialogVisible.value = true
}

const handleDelete = async (row: {TypeName}Item) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除 "${row.name}" 吗？此操作不可恢复。`,
      '确认删除',
      { confirmButtonText: '删除', cancelButtonText: '取消', type: 'warning' }
    )
    await remove(row.id)
    ElMessage.success('删除成功')
    fetchData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const handleSubmit = async () => {
  if (!validateForm()) return
  submitting.value = true
  try {
    if (isEditing.value && editId.value) {
      await update(editId.value, form)
      ElMessage.success('更新成功')
    } else {
      await create(form)
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    fetchData()
  } catch (error) {
    ElMessage.error(isEditing.value ? '更新失败' : '创建失败')
  } finally {
    submitting.value = false
  }
}

// ========== 分页 ==========
const handlePageChange = (p: number) => {
  page.value = p
  fetchData()
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div class="p-6">
    <h2 class="text-xl font-semibold text-gray-800 mb-6">{页面标题}</h2>

    <!-- 搜索栏 -->
    <div class="bg-white rounded-lg p-4 mb-4 shadow-sm">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="关键词">
          <el-input
            v-model="searchForm.keyword"
            placeholder="搜索..."
            clearable
            @clear="handleSearch"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 操作区 -->
    <div class="mb-4">
      <el-button type="primary" @click="handleCreate">
        <el-icon class="mr-1"><Plus /></el-icon>
        新增
      </el-button>
    </div>

    <!-- 表格 -->
    <div class="bg-white rounded-lg shadow-sm">
      <el-table :data="tableData" border stripe v-loading="loading" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column prop="name" label="名称" min-width="150" />
        <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
        <el-table-column prop="createdAt" label="创建时间" width="180" align="center" />
        <el-table-column label="操作" width="180" align="center" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="flex justify-end p-4">
        <el-pagination
          v-model:current-page="page"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next"
          @current-change="handlePageChange"
          @size-change="handlePageChange"
        />
      </div>
    </div>

    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="560px" :close-on-click-modal="false">
      <el-form :model="form" label-width="80px">
        <el-form-item label="名称" :error="formErrors.name" required>
          <el-input v-model="form.name" placeholder="请输入名称" maxlength="100" show-word-limit />
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="4"
            placeholder="请输入描述"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">
          {{ isEditing ? '更新' : '创建' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>
```

## 2. API 模块模板

```typescript
// admin/src/api/modules/{module}.ts
import { get, post, put, del } from '../request'

const prefix = '/{route-prefix}'

export const getList = (params?: Record<string, any>) =>
  get(prefix, params)

export const create = (data: Record<string, any>) =>
  post(prefix, data)

export const update = (id: number, data: Record<string, any>) =>
  put(`${prefix}/${id}`, data)

export const remove = (id: number) =>
  del(`${prefix}/${id}`)
```

**注意**: Admin 的 `request.ts` baseURL 已经是 `http://localhost:3000/api/v1/admin`，所以 prefix 只需写子路径。

## 3. 路由添加

在 `admin/src/router/index.ts` 的 `routes` 数组中添加:

```typescript
{
  path: '/{route-path}',
  name: '{RouteName}',
  component: () => import('@/pages/{PageName}Page.vue'),
  meta: { requiresAuth: true }
}
```

## Element Plus 常用组件速查

| 组件 | 用途 | 示例 |
|------|------|------|
| `el-table` | 数据表格 | `<el-table :data="list" border stripe v-loading="loading">` |
| `el-table-column` | 列 | `prop="name" label="名称" width="150"` |
| `el-form` | 表单 | `<el-form :model="form" label-width="80px">` |
| `el-form-item` | 表单项 | `<el-form-item label="名称" required>` |
| `el-input` | 输入框 | `<el-input v-model="form.name" placeholder="..." />` |
| `el-button` | 按钮 | `type="primary"` / `type="danger"` / `type="success"` |
| `el-dialog` | 弹窗 | `<el-dialog v-model="visible" title="标题">` |
| `el-pagination` | 分页 | `<el-pagination v-model:current-page="page" :total="total" />` |
| `el-tag` | 标签 | `<el-tag type="success">已审核</el-tag>` |
| `ElMessage` | 消息提示 | `ElMessage.success('操作成功')` |
| `ElMessageBox` | 确认框 | `ElMessageBox.confirm('确定删除？', '警告', { type: 'warning' })` |

## 管理端风格约定

- 页面容器: `<div class="p-6">`
- 卡片: `<div class="bg-white rounded-lg p-4 shadow-sm">`
- 搜索和表格分两个独立卡片
- 弹窗宽度: 560px
- 删除必须弹出 ElMessageBox 确认
- 所有操作必须有成功/失败 Toast 提示
- 表格列数 > 6 时考虑 `fixed="right"` 固定操作列
