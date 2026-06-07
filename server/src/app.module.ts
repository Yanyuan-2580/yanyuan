import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { APP_FILTER, APP_INTERCEPTOR, APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { getTypeOrmConfig, getMongoConfig } from '@/config/database.config';
import { HttpExceptionFilter } from '@/common';
import { ResponseInterceptor, LoggingInterceptor, BehaviorInterceptor } from '@/common';
import { UserModule, ChatModule, DiaryModule, KnowledgeModule, AdminModule, MoodModule, MeditationModule, NotificationModule as UserNotificationModule, CommentModule, QuestionnaireModule, VideoModule, ReminderModule, UploadModule, HealthModule, BehaviorLogModule } from '@/modules';
import { AiModule, CacheModule, RiskControlModule, NotificationModule, ExportModule } from '@/shared';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env'
    }),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100,
    }]),
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => getTypeOrmConfig(configService),
      inject: [ConfigService]
    }),
    MongooseModule.forRootAsync({
      useFactory: (configService: ConfigService) => {
        const mongoUri = getMongoConfig(configService);
        const uri = mongoUri || 'mongodb://localhost:27017/mental_health';
        return {
          uri,
          retryAttempts: 2,
          retryDelay: 3000,
          serverSelectionTimeoutMS: 5000,
          connectionFactory: (connection) => {
            connection.on('error', (err) => {
              console.warn(`MongoDB connection error: ${err.message}`);
            });
            return connection;
          },
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
    ExportModule,
    ReminderModule,
    UploadModule,
    HealthModule,
    BehaviorLogModule,
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
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: BehaviorInterceptor
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    }
  ]
})
export class AppModule {}
