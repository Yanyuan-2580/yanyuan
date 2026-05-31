import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from '@/database/entities';
import { RiskControlService } from '@/shared';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
    private riskControlService: RiskControlService
  ) {}

  async createComment(userId: number, articleId: number, dto: CreateCommentDto): Promise<Comment> {
    // Risk check
    if (this.riskControlService.hasSensitiveContent(dto.content)) {
      throw new ForbiddenException('评论内容包含敏感信息');
    }

    const comment = this.commentRepository.create({
      articleId,
      userId,
      content: dto.content,
      parentId: dto.parentId || null,
      status: 1
    });

    return this.commentRepository.save(comment);
  }

  async getComments(articleId: number, page: number = 1, pageSize: number = 20): Promise<{ list: any[]; total: number }> {
    // Get top-level comments
    const [list, total] = await this.commentRepository.findAndCount({
      where: { articleId, parentId: null as any, status: 1 },
      relations: ['user'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize
    });

    // Get replies for each comment
    const commentsWithReplies = await Promise.all(
      list.map(async (comment) => {
        const replies = await this.commentRepository.find({
          where: { parentId: comment.id, status: 1 },
          relations: ['user'],
          order: { createdAt: 'ASC' }
        });
        return {
          ...comment,
          user: comment.user ? {
            id: comment.user.id,
            nickname: comment.user.nickname,
            avatarUrl: comment.user.avatarUrl
          } : null,
          replies: replies.map(r => ({
            ...r,
            user: r.user ? {
              id: r.user.id,
              nickname: r.user.nickname,
              avatarUrl: r.user.avatarUrl
            } : null
          }))
        };
      })
    );

    return { list: commentsWithReplies, total, page, pageSize };
  }

  async deleteComment(userId: number, commentId: number): Promise<void> {
    const comment = await this.commentRepository.findOne({ where: { id: commentId } });
    if (!comment) {
      throw new NotFoundException('评论不存在');
    }
    if (comment.userId !== userId) {
      throw new ForbiddenException('只能删除自己的评论');
    }
    // Soft delete
    await this.commentRepository.update(commentId, { status: 0 });
  }
}
