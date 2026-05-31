import { Controller, Post, Get, Param, UseGuards } from '@nestjs/common';
import { VideoService } from './video.service';
import { JwtAuthGuard } from '@/common';
import { CurrentUser } from '@/common';
import { JwtPayload } from '@/types';

@Controller('video')
@UseGuards(JwtAuthGuard)
export class VideoController {
  constructor(private videoService: VideoService) {}

  @Post('rooms')
  createRoom(@CurrentUser() user: JwtPayload) {
    return this.videoService.createRoom(user.userId);
  }

  @Get('rooms/:roomId')
  getRoom(@Param('roomId') roomId: string) {
    return this.videoService.getRoom(roomId);
  }

  @Post('rooms/:roomId/join')
  joinRoom(@CurrentUser() user: JwtPayload, @Param('roomId') roomId: string) {
    return this.videoService.joinRoom(user.userId, roomId);
  }

  @Post('rooms/:roomId/end')
  endRoom(@CurrentUser() user: JwtPayload, @Param('roomId') roomId: string) {
    return this.videoService.endRoom(user.userId, roomId);
  }
}
