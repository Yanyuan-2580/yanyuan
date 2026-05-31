import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VideoSession } from '@/database/entities/VideoSession.entity';
import { VideoService } from './video.service';
import { VideoController } from './video.controller';

@Module({
  imports: [TypeOrmModule.forFeature([VideoSession])],
  providers: [VideoService],
  controllers: [VideoController],
  exports: [VideoService]
})
export class VideoModule {}
