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
  status?: number;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: number;
  username: string;
  phone?: string;
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

// V2 风险记录（持久化到 risk_records 表）
export interface RiskRecordV2 {
  id: number;
  userId: number;
  sessionId?: number;
  content?: string;
  riskLevel: number;
  source: 'chat' | 'diary' | 'comment' | 'mood';
  action: 'crisis_blocked' | 'warned' | 'logged';
  status: 'pending' | 'resolved' | 'false_positive';
  resolvedBy?: number;
  resolvedAt?: string;
  resolution?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RiskRecordStats {
  pendingCount: number;
  highCount: number;
  mediumCount: number;
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

// ==================== Analytics Types ====================

export interface WeeklyTrend {
  trends: Array<{
    day: string;
    date: string;
    newUsers: number;
    sessions: number;
    diaries: number;
  }>;
}

export interface HourlyHeatmap {
  days: string[];
  hours: string[];
  data: number[][];
  maxValue: number;
  sourceTypes: {
    sessions: number[][];
    diaries: number[][];
    moodRecords: number[][];
    meditation: number[][];
  };
}

export interface WeeklyDistribution {
  labels: string[];
  datasets: Array<{
    label: string;
    color: string;
    data: number[];
  }>;
}

export interface MoodDistribution {
  scoreDistribution: {
    labels: string[];
    counts: number[];
    percentages: number[];
  };
  riskLevelDistribution: {
    low: number;
    medium: number;
    high: number;
  };
  moodTypeDistribution: {
    happy: number;
    sad: number;
    angry: number;
    anxious: number;
    calm: number;
  };
  totalResponses: number;
}

export interface DashboardOverview extends Statistics {
  totalMoodRecords: number;
  totalMeditationSessions: number;
  totalQuestionnaires: number;
  averageMoodScore: number;
  activeUsersToday: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  engagementRate: number;
  hotModules: Array<{
    name: string;
    count: number;
  }>;
}
