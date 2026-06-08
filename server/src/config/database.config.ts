import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User, MoodDiary, AiSession, KnowledgeArticle, KnowledgeCategory, Admin, AdminOperationLog, ArticleLike, ArticleCollect, MoodRecord, Meditation, MeditationHistory, Notification, Comment, Questionnaire, QuestionnaireResult, VideoSession, Reminder, RiskRecord, TextChatSession, TextChatMessage } from '@/database/entities';

export const getTypeOrmConfig = (configService: ConfigService): TypeOrmModuleOptions => ({
  type: 'mysql',
  host: configService.get('MYSQL_HOST'),
  port: configService.get('MYSQL_PORT'),
  username: configService.get('MYSQL_USERNAME'),
  password: configService.get('MYSQL_PASSWORD'),
  database: configService.get('MYSQL_DATABASE'),
  entities: [User, MoodDiary, AiSession, KnowledgeArticle, KnowledgeCategory, Admin, AdminOperationLog, ArticleLike, ArticleCollect, MoodRecord, Meditation, MeditationHistory, Notification, Comment, Questionnaire, QuestionnaireResult, VideoSession, Reminder, RiskRecord, TextChatSession, TextChatMessage],
  synchronize: true,
  logging: false,
  timezone: '+08:00'
});

export const getMongoConfig = (configService: ConfigService): string => {
  return configService.get('MONGODB_URI');
};
