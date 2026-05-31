import { Controller, Post, Get, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { CommentService } from './comment.service';
import { JwtAuthGuard } from '@/common';
import { CurrentUser } from '@/common';
import { JwtPayload } from '@/types';
import { CreateCommentDto } from './dto/create-comment.dto';

@Controller('articles')
export class CommentController {
  constructor(private commentService: CommentService) {}

  @Get(':articleId/comments')
  getComments(
    @Param('articleId') articleId: string,
    @Query('page') page: string = '1',
    @Query('pageSize') pageSize: string = '20'
  ) {
    return this.commentService.getComments(
      parseInt(articleId),
      parseInt(page),
      parseInt(pageSize)
    );
  }

  @Post(':articleId/comments')
  @UseGuards(JwtAuthGuard)
  createComment(
    @CurrentUser() user: JwtPayload,
    @Param('articleId') articleId: string,
    @Body() dto: CreateCommentDto
  ) {
    return this.commentService.createComment(user.userId, parseInt(articleId), dto);
  }

  @Delete('comments/:id')
  @UseGuards(JwtAuthGuard)
  deleteComment(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.commentService.deleteComment(user.userId, parseInt(id));
  }
}
