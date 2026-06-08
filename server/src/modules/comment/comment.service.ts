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
    // 误报白名单检查
    if (this.riskControlService.isKnownFalsePositive(dto.content)) {
      // 跳过，继续正常创建
    }
    // 敏感内容拦截
    else if (this.riskControlService.hasSensitiveContent(dto.content)) {
      throw new ForbiddenException('评论内容包含敏感信息');
    }

    // 完整风险分析（优化6）
    const riskLevel = this.riskControlService.analyzeRisk(dto.content);

    if (riskLevel >= 1) {
      // 持久化风险记录
      await this.riskControlService.saveRiskRecord({
        userId,
        content: dto.content.slice(0, 500),
        riskLevel,
        source: 'comment',
        action: riskLevel === 2 ? 'crisis_blocked' : 'warned',
      });

      // 追踪风险趋势
      await this.riskControlService.trackRisk(userId, riskLevel, dto.content);
    }

    // 高危评论仍然发布（因为已通过敏感词检测），但标记为需审核
    const commentStatus = riskLevel === 2 ? 0 : 1;

    const comment = this.commentRepository.create({
      articleId,
      userId,
      content: dto.content,
      parentId: dto.parentId || null,
      status: commentStatus
    });

    return this.commentRepository.save(comment);
  }

  async getComments(articleId: number, page: number = 1, pageSize: number = 20): Promise<{ list: any[]; total: number; page: number; pageSize: number; totalPages: number }> {
    // Get top-level comments
    const [list, total] = await this.commentRepository.findAndCount({
      where: { articleId, parentId: null as any, status: 1 },
      relations: ['user'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize
    });

    // Batch-fetch all replies for these comments in one query
    const parentIds = list.map(c => c.id);
    const allReplies = parentIds.length > 0
      ? await this.commentRepository.find({
          where: { parentId: { $in: parentIds } as any, status: 1 },
          relations: ['user'],
          order: { createdAt: 'ASC' }
        })
      : [];

    // Group replies by parentId
    const repliesMap = new Map<number, any[]>();
    for (const reply of allReplies) {
      const list = repliesMap.get(reply.parentId) || [];
      list.push(reply);
      repliesMap.set(reply.parentId, list);
    }

    const commentsWithReplies = list.map(comment => {
      const replies = (repliesMap.get(comment.id) || []).map(r => ({
        ...r,
        user: r.user ? {
          id: r.user.id,
          nickname: r.user.nickname,
          avatarUrl: r.user.avatarUrl
        } : null
      }));
      return {
        ...comment,
        user: comment.user ? {
          id: comment.user.id,
          nickname: comment.user.nickname,
          avatarUrl: comment.user.avatarUrl
        } : null,
        replies
      };
    });

    return { list: commentsWithReplies, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
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
