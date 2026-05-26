import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Meditation, MeditationHistory } from '@/database/entities';
import { MeditationController } from './meditation.controller';
import { MeditationService } from './meditation.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Meditation, MeditationHistory]),
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: configService.get('JWT_EXPIRES_IN') }
      }),
      inject: [ConfigService]
    })
  ],
  controllers: [MeditationController],
  providers: [MeditationService]
})
export class MeditationModule {}