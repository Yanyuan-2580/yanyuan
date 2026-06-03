export type UserStatus = 0 | 1 | 2;
export type RiskLevel = 0 | 1 | 2;
export type DiaryStatus = 0 | 1;
export type SessionStatus = 0 | 1;
export type ArticleStatus = 0 | 1 | 2 | 3;
export type RiskFlag = 0 | 1 | 2;
export type MessageRole = 'user' | 'assistant' | 'system';

export interface JwtPayload {
  userId: number;
  username: string;
  phone?: string;
  role?: string;
}

export interface PageQuery {
  page: number;
  pageSize: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface PageResult<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
  timestamp: number;
}

export interface ChatMessage {
  _id?: string;
  sessionId: string;
  userId: number;
  role: MessageRole;
  content: string;
  moodTag?: string;
  riskLevel: RiskLevel;
  tokensUsed?: number;
  model?: string;
  createdAt: Date;
}

export interface UserBehaviorLog {
  _id?: string;
  userId: number;
  eventType: string;
  page: string;
  duration?: number;
  extra?: Record<string, any>;
  createdAt: Date;
}
