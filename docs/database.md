# 数据库设计

## 技术栈
- **MySQL** (TypeORM) — 核心业务数据，18个实体
- **MongoDB** (Mongoose) — 非结构化数据：ChatMessage, UserBehaviorLog
- **Redis** — 缓存 + 会话 + 限流计数

## MySQL 实体 (18个)

| 实体 | 表名 | 说明 |
|------|------|------|
| User | users | 用户 (username/phone/email/nickname/status/riskLevel) |
| Admin | admins | 管理员 (username/password/roles) |
| AdminOperationLog | admin_operation_logs | 管理员操作日志 |
| MoodRecord | mood_records | 心情记录 (moodType/moodScore/reason/aiSuggestion) |
| MoodDiary | mood_diaries | 情绪日记 (moodScore/moodTags/content/aiInsight/isPublic) |
| AiSession | ai_sessions | AI对话会话 (title/messageCount/riskFlag/moodTag/status) |
| KnowledgeArticle | knowledge_articles | 知识文章 (title/content/categoryId/status/viewCount) |
| KnowledgeCategory | knowledge_categories | 文章分类 (name/description/sort) |
| ArticleLike | article_likes | 点赞 (userId+articleId 唯一) |
| ArticleCollect | article_collects | 收藏 (userId+articleId 唯一) |
| Comment | comments | 评论 (content/parentId/articleId/userId 支持嵌套) |
| Meditation | meditations | 冥想课程 (title/category/duration/audioUrl/coverImage/playCount) |
| MeditationHistory | meditation_history | 冥想记录 (userId/meditationId/duration/completed) |
| Notification | notifications | 通知 (userId/type/title/content/isRead/reference) |
| Questionnaire | questionnaires | 问卷 (title/questions JSON/scoringRules JSON/category/status) |
| QuestionnaireResult | questionnaire_results | 问卷结果 (userId/answers JSON/totalScore/resultLevel/aiAdvice) |
| VideoSession | video_sessions | 视频会话 (roomId/userId/status) |
| Reminder | reminders | 提醒 (userId/type/title/time/daysOfWeek JSON/enabled) |

## MongoDB Schema (2个)

| Schema | 集合 | 说明 |
|--------|------|------|
| ChatMessage | chat_messages | 聊天消息 (sessionId/userId/role/content/riskLevel/moodTag) |
| UserBehaviorLog | user_behavior_logs | 用户行为日志 (userId/eventType/page/duration/extra) |

## Redis 缓存结构

| Key | 说明 |
|-----|------|
| `chat:count:daily:{userId}:{date}` | 日对话计数 |
| `chat:count:weekly:{userId}:{week}` | 周对话计数 |
| `token:{userId}` | JWT令牌缓存 |
| `risk:history:{userId}` | 风险历史 (List) |
| `notification:unread:{userId}` | 未读通知计数 |
