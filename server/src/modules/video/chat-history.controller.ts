import { Controller, Get, Delete, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard, CurrentUser } from '@/common';
import { JwtPayload } from '@/types';
import { TextChatPersistenceService } from './text-chat.service';

@Controller('chat-history')
@UseGuards(JwtAuthGuard)
export class ChatHistoryController {
  constructor(private persistence: TextChatPersistenceService) {}

  @Get('sessions')
  getMySessions(@CurrentUser() user: JwtPayload) {
    return this.persistence.getMySessions(user.userId);
  }

  @Get('messages/:roomId')
  getMessages(
    @CurrentUser() user: JwtPayload,
    @Param('roomId') roomId: string,
    @Query('page') page = '1',
    @Query('pageSize') pageSize = '50',
  ) {
    return this.persistence.getMessages(roomId, user.userId, parseInt(page), parseInt(pageSize));
  }

  @Delete('sessions/:roomId')
  deleteSession(
    @CurrentUser() user: JwtPayload,
    @Param('roomId') roomId: string,
  ) {
    return this.persistence.deleteSession(roomId, user.userId);
  }
}
