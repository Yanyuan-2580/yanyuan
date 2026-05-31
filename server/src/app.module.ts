import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { getTypeOrmConfig, getMongoConfig } from '@/config/database.config';
import { HttpExceptionFilter } from '@/common';
import { ResponseInterceptor, LoggingInterceptor } from '@/common';
import { UserModule, ChatModule, DiaryModule, KnowledgeModule, AdminModule, MoodModule, MeditationModule, NotificationModule as UserNotificationModule, CommentModule, QuestionnaireModule, VideoModule } from '@/modules';
import { AiModule, CacheModule, RiskControlModule, NotificationModule, ExportModule } from '@/shared';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env'
    }),
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => getTypeOrmConfig(configService),
      inject: [ConfigService]
    }),
    MongooseModule.forRootAsync({
      useFactory: (configService: ConfigService) => {
        const mongoUri = getMongoConfig(configService);
        if (!mongoUri) {
          console.warn('MongoDB URI not configured, skipping MongoDB connection');
        }
        return {
          uri: mongoUri || 'mongodb://localhost:27017/mental_health',
          retryAttempts: 0
        };
      },
      inject: [ConfigService]
    }),
    UserModule,
    ChatModule,
    DiaryModule,
    KnowledgeModule,
    AdminModule,
    MoodModule,
    MeditationModule,
    AiModule,
    CacheModule,
    RiskControlModule,
    NotificationModule,
    UserNotificationModule,
    CommentModule,
    QuestionnaireModule,
    VideoModule,
    ExportModule
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor
    }
  ]
})
export class AppModule {}
