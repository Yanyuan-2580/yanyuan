import { Controller, Post, Get, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '@/common';
import { CurrentUser } from '@/common';
import { JwtPayload } from '@/types';
import { SendMessageDto } from './dto/send-message.dto';

@Controller('chat')
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Get('stats/weekly-count')
  @UseGuards(JwtAuthGuard)
  getWeeklyChatCount(@CurrentUser() user: JwtPayload) {
    return this.chatService.getWeeklyChatCount(user.userId);
  }

  @Post('sessions')
  @UseGuards(JwtAuthGuard)
  createSession(@CurrentUser() user: JwtPayload) {
    return this.chatService.createSession(user.userId);
  }

  @Get('sessions')
  @UseGuards(JwtAuthGuard)
  getSessions(@CurrentUser() user: JwtPayload) {
    return this.chatService.getSessions(user.userId);
  }

  @Get('sessions/:id')
  @UseGuards(JwtAuthGuard)
  getSession(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.chatService.getSessionById(user.userId, parseInt(id));
  }

  @Delete('sessions/:id')
  @UseGuards(JwtAuthGuard)
  endSession(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.chatService.endSession(user.userId, parseInt(id));
  }

  @Get('messages/:sessionId')
  @UseGuards(JwtAuthGuard)
  getMessages(@Param('sessionId') sessionId: string) {
    return this.chatService.getMessages(sessionId);
  }

  @Post('messages')
  @UseGuards(JwtAuthGuard)
  sendMessage(@CurrentUser() user: JwtPayload, @Body() dto: SendMessageDto) {
    return this.chatService.sendMessage(user.userId, dto);
  }
}
