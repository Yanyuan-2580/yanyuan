import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { MoodDiary } from '@/database/entities';
import { DiaryService } from './diary.service';
import { DiaryController } from './diary.controller';
import { AiModule } from '@/shared';

@Module({
  imports: [
    TypeOrmModule.forFeature([MoodDiary]),
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: configService.get('JWT_EXPIRES_IN') }
      }),
      inject: [ConfigService]
    }),
    AiModule
  ],
  providers: [DiaryService],
  controllers: [DiaryController]
})
export class DiaryModule {}
