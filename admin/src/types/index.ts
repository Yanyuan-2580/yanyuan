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
}

export interface Admin {
  id: number;
  username: string;
  nickname: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: number;
  phone: string;
  nickname: string;
  avatar: string;
  status: number;
  createdAt: string;
  updatedAt: string;
}

export interface KnowledgeArticle {
  id: number;
  title: string;
  content: string;
  summary: string;
  author: string;
  categoryId: number;
  categoryName: string;
  tags: string[];
  viewCount: number;
  likeCount: number;
  collectCount: number;
  status: number;
  createdAt: string;
  updatedAt: string;
}

export interface KnowledgeCategory {
  id: number;
  name: string;
  description: string;
  createdAt: string;
}

export interface RiskRecord {
  id: number;
  userId: number;
  userName: string;
  content: string;
  riskLevel: number;
  riskType: string;
  createdAt: string;
}

export interface Statistics {
  totalUsers: number;
  activeUsers: number;
  totalDiaries: number;
  totalChats: number;
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
