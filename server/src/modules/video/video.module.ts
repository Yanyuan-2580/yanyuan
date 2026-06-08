import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { VideoSession } from '@/database/entities/VideoSession.entity';
import { TextChatSession, TextChatMessage } from '@/database/entities';
import { VideoService } from './video.service';
import { VideoController } from './video.controller';
import { VideoGateway } from './video.gateway';
import { VideoMatchService } from './video-match.service';
import { TextChatPersistenceService } from './text-chat.service';
import { ChatHistoryController } from './chat-history.controller';
import { WsJwtGuard } from './ws-jwt.guard';
import { RiskControlModule } from '@/shared/risk-control/risk-control.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([VideoSession, TextChatSession, TextChatMessage]),
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: configService.get('JWT_EXPIRES_IN') }
      }),
      inject: [ConfigService]
    }),
    RiskControlModule,
  ],
  providers: [VideoService, VideoGateway, VideoMatchService, TextChatPersistenceService, WsJwtGuard],
  controllers: [VideoController, ChatHistoryController],
  exports: [VideoService]
})
export class VideoModule {}
