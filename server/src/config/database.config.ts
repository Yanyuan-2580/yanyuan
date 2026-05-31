import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User, MoodDiary, AiSession, KnowledgeArticle, KnowledgeCategory, Admin, AdminOperationLog, ArticleLike, ArticleCollect, MoodRecord, Meditation, MeditationHistory, Notification } from '@/database/entities';

export const getTypeOrmConfig = (configService: ConfigService): TypeOrmModuleOptions => ({
  type: 'mysql',
  host: configService.get('MYSQL_HOST'),
  port: configService.get('MYSQL_PORT'),
  username: configService.get('MYSQL_USERNAME'),
  password: configService.get('MYSQL_PASSWORD'),
  database: configService.get('MYSQL_DATABASE'),
  entities: [User, MoodDiary, AiSession, KnowledgeArticle, KnowledgeCategory, Admin, AdminOperationLog, ArticleLike, ArticleCollect, MoodRecord, Meditation, MeditationHistory, Notification],
  synchronize: configService.get('NODE_ENV') === 'development',
  logging: configService.get('NODE_ENV') === 'development',
  timezone: '+08:00'
});

export const getMongoConfig = (configService: ConfigService): string => {
  return configService.get('MONGODB_URI');
};
