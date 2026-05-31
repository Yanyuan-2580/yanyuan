import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AiSession } from '@/database/entities';
import { ChatMessageSchema } from '@/database/schemas';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { AiModule, RiskControlModule, CacheModule, NotificationModule } from '@/shared';

@Module({
  imports: [
    TypeOrmModule.forFeature([AiSession]),
    MongooseModule.forFeature([{ name: 'ChatMessage', schema: ChatMessageSchema }]),
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: configService.get('JWT_EXPIRES_IN') }
      }),
      inject: [ConfigService]
    }),
    AiModule,
    RiskControlModule,
    CacheModule,
    NotificationModule
  ],
  providers: [ChatService],
  controllers: [ChatController]
})
export class ChatModule {}
