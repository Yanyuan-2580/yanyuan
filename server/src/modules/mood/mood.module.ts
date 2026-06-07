import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { MoodRecord, MoodDiary, AiSession } from '@/database/entities';
import { MoodController } from './mood.controller';
import { MoodService } from './mood.service';
import { AiModule } from '@/shared';

@Module({
  imports: [
    TypeOrmModule.forFeature([MoodRecord, MoodDiary, AiSession]),
    AiModule,
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: configService.get('JWT_EXPIRES_IN') }
      }),
      inject: [ConfigService]
    })
  ],
  controllers: [MoodController],
  providers: [MoodService]
})
export class MoodModule {}