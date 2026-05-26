export interface User {
  id: number;
  phone: string;
  email?: string;
  nickname: string;
  avatarUrl?: string;
  riskLevel: number;
  createdAt: string;
}

export interface AiSession {
  id: number;
  userId: number;
  title: string;
  moodTag?: string;
  messageCount: number;
  status: number;
  riskFlag: number;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  _id?: string;
  sessionId: string;
  userId: number;
  role: 'user' | 'assistant' | 'system';
  content: string;
  moodTag?: string;
  riskLevel: number;
  createdAt: string;
}

export interface MoodDiary {
  id: number;
  userId: number;
  moodScore: number;
  moodTags: string[];
  triggerEvent?: string;
  bodyFeeling?: string;
  sleepHours?: number;
  content?: string;
  aiInsight?: string;
  isPublic: number;
  createdAt: string;
}

export interface KnowledgeArticle {
  id: number;
  title: string;
  content: string;
  coverUrl?: string;
  categoryId: number;
  tags: string[];
  authorId: number;
  viewCount: number;
  likeCount: number;
  collectCount: number;
  status: number;
  publishedAt: string;
  createdAt: string;
}

export interface KnowledgeCategory {
  id: number;
  name: string;
  description?: string;
  sortOrder: number;
  status: number;
  createdAt: string;
}

export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
  timestamp: number;
}

export interface PageResult<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages?: number;
}

export type MoodScore = 1 | 2 | 3 | 4 | 5;

export const MOOD_EMOJIS: Record<MoodScore, string> = {
  1: '😢',
  2: '😔',
  3: '😐',
  4: '😊',
  5: '😄'
};

export const MOOD_LABELS: Record<MoodScore, string> = {
  1: '非常难过',
  2: '有点低落',
  3: '一般',
  4: '比较开心',
  5: '非常开心'
};
