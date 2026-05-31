import { Controller, Post, Get, Delete, Body, Param, UseGuards, Res } from '@nestjs/common';
import type { Response } from 'express';
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

  @Post('messages/stream')
  @UseGuards(JwtAuthGuard)
  sendMessageStream(
    @CurrentUser() user: JwtPayload,
    @Body() dto: SendMessageDto,
    @Res() res: Response
  ) {
    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    const stream = this.chatService.sendMessageStream(user.userId, dto);

    stream.subscribe({
      next: (event) => {
        res.write(`data: ${JSON.stringify(event)}\n\n`);
      },
      error: (err) => {
        res.write(`data: ${JSON.stringify({ type: 'error', data: { message: err.message || '服务器错误' } })}\n\n`);
        res.end();
      },
      complete: () => {
        res.end();
      }
    });

    // Handle client disconnect
    res.on('close', () => {
      // Stream will be garbage collected
    });
  }
}
