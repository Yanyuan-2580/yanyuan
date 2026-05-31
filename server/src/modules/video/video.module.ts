import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { VideoSession } from '@/database/entities/VideoSession.entity';
import { VideoService } from './video.service';
import { VideoController } from './video.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([VideoSession]),
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: configService.get('JWT_EXPIRES_IN') }
      }),
      inject: [ConfigService]
    })
  ],
  providers: [VideoService],
  controllers: [VideoController],
  exports: [VideoService]
})
export class VideoModule {}
