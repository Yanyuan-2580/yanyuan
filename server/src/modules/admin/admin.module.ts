import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User, Admin, AdminOperationLog, AiSession, MoodDiary, KnowledgeArticle, KnowledgeCategory, ArticleLike, ArticleCollect, MoodRecord, MeditationHistory, QuestionnaireResult, Notification } from '@/database/entities';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { KnowledgeService } from '@/modules/knowledge/knowledge.service';
import { ExportModule } from '@/shared/export/export.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Admin, AdminOperationLog, AiSession, MoodDiary, KnowledgeArticle, KnowledgeCategory, ArticleLike, ArticleCollect, MoodRecord, MeditationHistory, QuestionnaireResult, Notification]),
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: configService.get('JWT_EXPIRES_IN') },
      }),
      inject: [ConfigService],
    }),
    ExportModule,
  ],
  providers: [AdminService, KnowledgeService],
  controllers: [AdminController],
})
export class AdminModule {}
