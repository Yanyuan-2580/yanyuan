---
name: db-check
description: 检查 MySQL/MongoDB/Redis 数据库连接状态 — 自动执行诊断
---

# 数据库连接检查

## AI 执行流程

依次检查 MySQL → MongoDB → Redis，输出状态报告。

### Step 1: MySQL (127.0.0.1:3306)

数据库名: `mental_health_db` | ORM: TypeORM

```bash
echo "=== MySQL (3306) ==="

# 检查端口
netstat -ano | grep ":3306" | grep LISTENING && echo "✅ 端口 3306 监听中" || echo "❌ 端口 3306 未监听"

# 尝试连接并列出表
mysql -u root -p123456 -e "USE mental_health_db; SHOW TABLES;" 2>&1
```

### Step 2: MongoDB (127.0.0.1:27017)

数据库名: `mental_health` | ODM: Mongoose

```bash
echo "=== MongoDB (27017) ==="

# 检查端口
netstat -ano | grep ":27017" | grep LISTENING && echo "✅ 端口 27017 监听中" || echo "❌ 端口 27017 未监听"

# 检查 HTTP 接口
curl -s -o /dev/null -w "HTTP 状态: %{http_code}" http://localhost:27017 2>&1
```

### Step 3: Redis (127.0.0.1:6379)

```bash
echo "=== Redis (6379) ==="

# 检查端口
netstat -ano | grep ":6379" | grep LISTENING && echo "✅ 端口 6379 监听中" || echo "❌ 端口 6379 未监听"

# PING
redis-cli ping 2>&1
```

### Step 4: 汇总报告

输出格式:
```
数据库状态报告:
  MySQL:    ✅/❌
  MongoDB:  ✅/❌
  Redis:    ✅/❌
  Server:   ✅/❌ (健康检查)
```

## 数据表清单 (TypeORM 实体 → MySQL 表)

| 实体类 | 数据库表 | 说明 |
|--------|---------|------|
| User | user | 用户 |
| Admin | admin | 管理员 |
| AdminOperationLog | admin_operation_log | 操作日志 |
| MoodRecord | mood_record | 心情记录 |
| AiSession | ai_session | AI对话会话 |
| KnowledgeArticle | knowledge_article | 知识文章 |
| KnowledgeCategory | knowledge_category | 文章分类 |
| ArticleLike | article_like | 文章点赞 |
| ArticleCollect | article_collect | 文章收藏 |
| Meditation | meditation | 冥想资源 |
| MeditationHistory | meditation_history | 冥想记录 |
| Notification | notification | 通知 |
| Comment | comment | 评论 |
| Questionnaire | questionnaire | 问卷 |
| QuestionnaireResult | questionnaire_result | 问卷结果 |
| VideoSession | video_session | 视频会话 |
| Reminder | reminder | 提醒 |

## MongoDB 集合

| Schema | 集合名 | 说明 |
|--------|--------|------|
| ChatMessage | chatmessages | AI对话消息 (适合非结构化数据) |
| UserBehaviorLog | userbehaviorlogs | 用户行为日志 |

## 故障排查

| 症状 | 可能原因 | 解决 |
|------|---------|------|
| MySQL `Access denied` | 密码错误 | 检查 `server/.env` 中 `MYSQL_PASSWORD` |
| MySQL `Unknown database` | 数据库未创建 | `mysql -u root -p -e "CREATE DATABASE mental_health_db"` |
| MongoDB 无响应 | 服务未启动 | Windows: `sc start MongoDB` 或手动启动 mongod |
| Redis `Connection refused` | 服务未启动 | Windows: `sc start Redis` |
