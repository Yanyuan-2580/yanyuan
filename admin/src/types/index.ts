export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
}

export interface PageResult<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages?: number;
}

export interface Admin {
  id: number;
  username: string;
  nickname: string;
  roles?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: number;
  phone: string;
  email?: string;
  nickname: string;
  avatarUrl?: string;
  status: number;
  riskLevel: number;
  createdAt: string;
  updatedAt: string;
}

export interface KnowledgeArticle {
  id: number;
  title: string;
  content: string;
  summary?: string;
  coverUrl?: string;
  author?: string;
  authorId?: number;
  categoryId: number;
  category?: KnowledgeCategory;
  tags?: string[];
  viewCount: number;
  likeCount: number;
  collectCount: number;
  status: number;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface KnowledgeCategory {
  id: number;
  name: string;
  description?: string;
  sortOrder?: number;
  status?: number;
  createdAt?: string;
}

export interface RiskRecord {
  id: number;
  type: string;
  userId?: number;
  userName?: string;
  name?: string;
  phone?: string;
  content: string;
  riskLevel: number;
  riskFlag?: number;
  riskType?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Statistics {
  totalUsers: number;
  activeUsers?: number;
  todayUsers?: number;
  totalSessions?: number;
  todaySessions?: number;
  totalDiaries?: number;
  todayDiaries?: number;
  totalArticles?: number;
  totalChats?: number;
  highRiskUsers: number;
  highRiskSessions: number;
  riskCount: number;
}

export interface LoginData {
  username: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  admin: Admin;
}
