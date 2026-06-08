---
name: generate-vue-page
description: 按项目规范生成用户端 Vue 3 页面 — 页面组件 + 路由 + API + 类型定义，遵循治愈轻奢风
---

# 生成用户端 Vue 页面

> **AI 执行规则**: 严格按照模板生成，遵循极简治愈轻奢风格。生成后告知用户需要手动添加路由。

## 输入

用户需提供:
- **页面名** (中文): 如 `提醒列表`
- **路由路径**: 如 `/reminders`
- **所属模块** (英文): 如 `reminder` (对应 `pages/reminder/`, `api/modules/reminder.ts`)
- **页面类型**: 列表页 / 详情页 / 表单页 / 自定义

## 生成文件清单

```
client/src/pages/{module}/PageName.vue          # 页面组件
client/src/api/modules/{module}.ts               # API 模块 (新建或追加)
client/src/types/{module}.ts                     # 类型定义 (新建或追加)
client/src/router/index.ts                       # 添加路由
```

## 1. 页面组件模板

### 列表页

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import PageHeader from '@/components/PageHeader.vue'
import BottomNavBar from '@/components/BottomNavBar.vue'
import type { ItemType } from '@/types/{module}'

const router = useRouter()
const loading = ref(false)
const list = ref<ItemType[]>([])
const page = ref(1)
const total = ref(0)
const pageSize = 20

const fetchData = async () => {
  loading.value = true
  try {
    // const res = await apiMethod({ page: page.value, pageSize })
    // list.value = res.data.list
    // total.value = res.data.total
  } catch (error) {
    console.error('获取数据失败:', error)
  } finally {
    loading.value = false
  }
}

const goDetail = (id: number) => {
  router.push(`/{route-prefix}/${id}`)
}

const goCreate = () => {
  router.push(`/{route-prefix}/new`)
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div class="min-h-screen bg-[#FBF8F4]">
    <PageHeader title="{页面标题}" />

    <main class="px-4 py-6 pb-24 max-w-2xl mx-auto">
      <!-- Loading -->
      <div v-if="loading" class="flex justify-center py-20">
        <div class="animate-spin w-8 h-8 border-2 border-[#8BA88C] border-t-transparent rounded-full" />
      </div>

      <!-- Empty -->
      <div v-else-if="!list.length" class="text-center py-20">
        <div class="text-5xl mb-4">📭</div>
        <p class="text-[#A6A6A6]">暂无数据</p>
        <button
          @click="goCreate"
          class="mt-4 px-6 py-2 bg-[#8BA88C] text-white rounded-full text-sm hover:bg-[#7A9A7B] transition-colors duration-300"
        >
          创建第一个
        </button>
      </div>

      <!-- List -->
      <div v-else class="space-y-3">
        <div
          v-for="item in list"
          :key="item.id"
          @click="goDetail(item.id)"
          class="bg-white rounded-2xl p-5 shadow-sm border border-[#E8E4DF] hover:shadow-md transition-all duration-300 cursor-pointer hover:scale-[1.01]"
        >
          <h3 class="text-[#4A4A4A] font-medium text-base">{{ item.name }}</h3>
          <p class="text-[#A6A6A6] text-sm mt-1">{{ item.createdAt }}</p>
        </div>
      </div>

      <!-- Load More -->
      <div v-if="list.length < total" class="text-center mt-6">
        <button
          @click="page++; fetchData()"
          class="px-6 py-2 text-[#8BA88C] border border-[#8BA88C] rounded-full text-sm hover:bg-[#8BA88C10] transition-colors duration-300"
        >
          加载更多
        </button>
      </div>
    </main>

    <BottomNavBar />
  </div>
</template>

<style scoped>
/* 仅在 Tailwind 无法满足时使用 */
</style>
```

### 表单页

额外包含表单验证和提交逻辑:

```vue
<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import PageHeader from '@/components/PageHeader.vue'

const router = useRouter()
const submitting = ref(false)
const form = reactive({
  title: '',
  content: '',
})

const errors = reactive<Record<string, string>>({})

const validate = (): boolean => {
  Object.keys(errors).forEach(k => delete errors[k])
  if (!form.title.trim()) {
    errors.title = '请输入标题'
    return false
  }
  return true
}

const handleSubmit = async () => {
  if (!validate()) return
  submitting.value = true
  try {
    // await apiCreate(form)
    router.back()
  } catch (error) {
    console.error('提交失败:', error)
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-[#FBF8F4]">
    <PageHeader title="{页面标题}" showBack />

    <main class="px-4 py-6 max-w-2xl mx-auto">
      <div class="bg-white rounded-2xl p-6 shadow-sm border border-[#E8E4DF] space-y-5">
        <!-- 表单字段 -->
        <div>
          <label class="block text-sm font-medium text-[#4A4A4A] mb-2">标题</label>
          <input
            v-model="form.title"
            type="text"
            class="w-full px-4 py-2.5 border border-[#E8E4DF] rounded-xl focus:outline-none focus:border-[#8BA88C] focus:ring-1 focus:ring-[#8BA88C] transition-all duration-300 text-[#4A4A4A]"
            placeholder="请输入标题"
          />
          <p v-if="errors.title" class="text-red-400 text-xs mt-1">{{ errors.title }}</p>
        </div>

        <!-- 操作按钮 -->
        <div class="flex gap-3 pt-2">
          <button
            @click="router.back()"
            class="flex-1 py-2.5 border border-[#E8E4DF] text-[#A6A6A6] rounded-full text-sm hover:bg-gray-50 transition-colors duration-300"
          >
            取消
          </button>
          <button
            @click="handleSubmit"
            :disabled="submitting"
            class="flex-1 py-2.5 bg-[#8BA88C] text-white rounded-full text-sm hover:bg-[#7A9A7B] disabled:opacity-50 transition-all duration-300"
          >
            {{ submitting ? '提交中...' : '保存' }}
          </button>
        </div>
      </div>
    </main>
  </div>
</template>
```

## 2. API 模块模板

```typescript
// client/src/api/modules/{module}.ts
import request from '../request'

const prefix = '/api/v1/{route-prefix}'

export const getList = (params?: Record<string, any>) =>
  request.get(prefix, { params })

export const getDetail = (id: number) =>
  request.get(`${prefix}/${id}`)

export const create = (data: Record<string, any>) =>
  request.post(prefix, data)

export const update = (id: number, data: Record<string, any>) =>
  request.put(`${prefix}/${id}`, data)

export const remove = (id: number) =>
  request.delete(`${prefix}/${id}`)
```

## 3. 类型定义模板

```typescript
// client/src/types/{module}.ts
export interface {TypeName}Item {
  id: number
  name: string
  createdAt: string
  updatedAt: string
}

export interface {TypeName}ListResponse {
  list: {TypeName}Item[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}
```

## 4. 路由添加

在 `client/src/router/index.ts` 的 `routes` 数组中添加:

```typescript
{
  path: '/{route-path}',
  name: '{RouteName}',
  component: () => import('@/pages/{module}/PageName.vue'),
  meta: { requiresAuth: true }  // 需要登录
}
```

## UI 风格检查表

生成后确认:
- [ ] 背景色 `bg-[#FBF8F4]` (奶杏白)
- [ ] 卡片 `rounded-2xl shadow-sm border-[#E8E4DF]`
- [ ] 主按钮 `bg-[#8BA88C]` (雾松青)
- [ ] 圆角 12-16px
- [ ] 有 Loading / Empty / Error 状态
- [ ] 底部 `pb-24` (留出底部导航栏空间)
- [ ] Hover 效果 `transition-all duration-300` + `hover:scale-[1.01]`
- [ ] 使用 `lucide-vue-next` 图标
- [ ] 无自定义 CSS (除非 Tailwind 不支持)
