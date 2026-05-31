<template>
  <div class="space-y-4">
    <h3 class="text-lg font-semibold text-gray-800">
      评论 {{ total > 0 ? `(${total})` : '' }}
    </h3>

    <!-- Comment Items -->
    <div v-if="comments.length > 0" class="space-y-3">
      <div
        v-for="comment in comments"
        :key="comment.id"
        class="bg-white rounded-2xl p-4 shadow-sm border border-gray-50"
      >
        <!-- Top-level comment -->
        <div class="flex gap-3">
          <div class="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
            <span class="text-primary-600 text-xs font-semibold">
              {{ comment.user?.nickname?.[0] || '匿' }}
            </span>
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between mb-1">
              <span class="text-sm font-medium text-gray-700">{{ comment.user?.nickname || '匿名用户' }}</span>
              <span class="text-xs text-gray-400">{{ formatTime(comment.createdAt) }}</span>
            </div>
            <p class="text-sm text-gray-600 leading-relaxed">{{ comment.content }}</p>
            <button
              class="text-xs text-gray-400 hover:text-primary-500 mt-2"
              @click="toggleReply(comment.id)"
            >回复</button>
          </div>
        </div>

        <!-- Replies -->
        <div v-if="comment.replies?.length > 0" class="ml-12 mt-3 space-y-2">
          <div
            v-for="reply in comment.replies"
            :key="reply.id"
            class="bg-gray-50 rounded-xl p-3"
          >
            <div class="flex gap-2">
              <div class="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                <span class="text-gray-500 text-xs font-semibold">
                  {{ reply.user?.nickname?.[0] || '匿' }}
                </span>
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between mb-0.5">
                  <span class="text-xs font-medium text-gray-600">{{ reply.user?.nickname || '匿名用户' }}</span>
                  <span class="text-xs text-gray-400">{{ formatTime(reply.createdAt) }}</span>
                </div>
                <p class="text-xs text-gray-500 leading-relaxed">{{ reply.content }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Reply Form -->
        <div v-if="replyingTo === comment.id" class="ml-12 mt-2">
          <CommentForm
            :article-id="articleId"
            :parent-id="comment.id"
            :placeholder="`回复 ${comment.user?.nickname || '匿名用户'}...`"
            @submitted="onReplySubmitted"
            @cancel="replyingTo = null"
          />
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-8 text-gray-400">
      <p class="text-sm">暂无评论，来说点什么吧</p>
    </div>

    <!-- Load More -->
    <div v-if="hasMore" class="text-center">
      <button
        class="text-sm text-primary-500 hover:underline"
        @click="$emit('loadMore')"
      >加载更多评论</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import CommentForm from './CommentForm.vue';

interface CommentUser {
  id: number;
  nickname: string;
  avatarUrl?: string;
}

interface CommentReply {
  id: number;
  content: string;
  createdAt: string;
  user?: CommentUser;
}

interface CommentItem {
  id: number;
  content: string;
  createdAt: string;
  user?: CommentUser;
  replies?: CommentReply[];
}

defineProps<{
  comments: CommentItem[];
  total: number;
  hasMore: boolean;
  articleId: number;
}>();

const emit = defineEmits<{
  loadMore: [];
  submitted: [];
}>();

const replyingTo = ref<number | null>(null);

const toggleReply = (commentId: number) => {
  replyingTo.value = replyingTo.value === commentId ? null : commentId;
};

const onReplySubmitted = () => {
  replyingTo.value = null;
  emit('submitted');
};

const formatTime = (dateStr: string) => {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 60000) return '刚刚';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
  return d.toLocaleDateString('zh-CN');
};
</script>
