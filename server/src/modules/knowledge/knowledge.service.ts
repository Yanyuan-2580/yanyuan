import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { KnowledgeArticle, KnowledgeCategory, ArticleLike, ArticleCollect } from '@/database/entities';
import { CreateArticleDto } from './dto/create-article.dto';

@Injectable()
export class KnowledgeService {
  constructor(
    @InjectRepository(KnowledgeArticle)
    private articleRepository: Repository<KnowledgeArticle>,
    @InjectRepository(KnowledgeCategory)
    private categoryRepository: Repository<KnowledgeCategory>,
    @InjectRepository(ArticleLike)
    private articleLikeRepository: Repository<ArticleLike>,
    @InjectRepository(ArticleCollect)
    private articleCollectRepository: Repository<ArticleCollect>
  ) {}

  async createArticle(dto: CreateArticleDto): Promise<KnowledgeArticle> {
    const article = this.articleRepository.create(dto);
    return this.articleRepository.save(article);
  }

  // 用户投稿（待审核）
  async submitArticle(userId: number, data: { title: string; content: string; categoryId: number; tags?: string[]; coverUrl?: string }): Promise<KnowledgeArticle> {
    const article = this.articleRepository.create({
      ...data,
      authorId: userId,
      status: 0, // 待审核
    });
    return this.articleRepository.save(article);
  }

  // 用户查看自己的文章
  async getMyArticles(userId: number, page: number, pageSize: number): Promise<{ list: KnowledgeArticle[]; total: number }> {
    const [list, total] = await this.articleRepository
      .createQueryBuilder('article')
      .where('article.authorId = :userId', { userId })
      .orderBy('article.createdAt', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();
    return { list, total };
  }

  // 管理员审核通过
  async approveArticle(id: number): Promise<KnowledgeArticle> {
    await this.articleRepository.update(id, {
      status: 2,
      publishedAt: new Date(),
    });
    return this.articleRepository.findOne({ where: { id } });
  }

  // 管理员驳回
  async rejectArticle(id: number): Promise<KnowledgeArticle> {
    await this.articleRepository.update(id, { status: 1 });
    return this.articleRepository.findOne({ where: { id } });
  }

  // 管理员获取待审核文章
  async getPendingArticles(page: number, pageSize: number): Promise<{ list: KnowledgeArticle[]; total: number }> {
    const [list, total] = await this.articleRepository
      .createQueryBuilder('article')
      .where('article.status = 0')
      .orderBy('article.createdAt', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();
    return { list, total };
  }

  async getArticles(page: number, pageSize: number, categoryId?: number): Promise<{ list: KnowledgeArticle[]; total: number }> {
    const query = this.articleRepository
      .createQueryBuilder('article')
      .where('article.status = 2');
    
    if (categoryId) {
      query.andWhere('article.categoryId = :categoryId', { categoryId });
    }

    const [list, total] = await query
      .orderBy('article.publishedAt', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    return { list, total };
  }

  async getArticle(id: number): Promise<KnowledgeArticle> {
    if (!id || isNaN(id)) {
      throw new NotFoundException('文章不存在或未发布');
    }
    const article = await this.articleRepository.findOne({ where: { id, status: 2 } });
    if (!article) {
      throw new NotFoundException('文章不存在或未发布');
    }
    
    await this.articleRepository.update(id, { viewCount: () => 'viewCount + 1' });
    return article;
  }

  async updateArticle(id: number, dto: Partial<CreateArticleDto>): Promise<KnowledgeArticle> {
    const article = await this.articleRepository.findOne({ where: { id } });
    if (!article) {
      throw new NotFoundException('文章不存在');
    }
    await this.articleRepository.update(id, dto);
    return this.articleRepository.findOne({ where: { id } });
  }

  async deleteArticle(id: number): Promise<void> {
    const article = await this.articleRepository.findOne({ where: { id } });
    if (!article) {
      throw new NotFoundException('文章不存在');
    }
    await this.articleRepository.delete(id);
  }

  async publishArticle(id: number): Promise<KnowledgeArticle> {
    const article = await this.articleRepository.findOne({ where: { id } });
    if (!article) {
      throw new NotFoundException('文章不存在');
    }
    await this.articleRepository.update(id, { status: 2, publishedAt: new Date() });
    return this.articleRepository.findOne({ where: { id } });
  }

  async likeArticle(userId: number, articleId: number): Promise<{ liked: boolean; count: number }> {
    return this.articleRepository.manager.transaction(async (manager) => {
      const likeRepo = manager.getRepository(ArticleLike);
      const articleRepo = manager.getRepository(KnowledgeArticle);
      const existing = await likeRepo.findOne({ where: { userId, articleId } });

      if (existing) {
        await likeRepo.delete(existing.id);
        await articleRepo.update(articleId, { likeCount: () => 'likeCount - 1' });
        const article = await articleRepo.findOne({ where: { id: articleId } });
        return { liked: false, count: article.likeCount };
      }

      await likeRepo.save({ userId, articleId });
      await articleRepo.update(articleId, { likeCount: () => 'likeCount + 1' });
      const article = await articleRepo.findOne({ where: { id: articleId } });
      return { liked: true, count: article.likeCount };
    });
  }

  async collectArticle(userId: number, articleId: number): Promise<{ collected: boolean; count: number }> {
    return this.articleRepository.manager.transaction(async (manager) => {
      const collectRepo = manager.getRepository(ArticleCollect);
      const articleRepo = manager.getRepository(KnowledgeArticle);
      const existing = await collectRepo.findOne({ where: { userId, articleId } });

      if (existing) {
        await collectRepo.delete(existing.id);
        await articleRepo.update(articleId, { collectCount: () => 'collectCount - 1' });
        const article = await articleRepo.findOne({ where: { id: articleId } });
        return { collected: false, count: article.collectCount };
      }

      await collectRepo.save({ userId, articleId });
      await articleRepo.update(articleId, { collectCount: () => 'collectCount + 1' });
      const article = await articleRepo.findOne({ where: { id: articleId } });
      return { collected: true, count: article.collectCount };
    });
  }

  async isLiked(userId: number, articleId: number): Promise<boolean> {
    const result = await this.articleLikeRepository.findOne({ where: { userId, articleId } });
    return !!result;
  }

  async isCollected(userId: number, articleId: number): Promise<boolean> {
    const result = await this.articleCollectRepository.findOne({ where: { userId, articleId } });
    return !!result;
  }

  async getCategories(): Promise<KnowledgeCategory[]> {
    return this.categoryRepository.find({ where: { status: 1 }, order: { sortOrder: 'ASC' } });
  }

  async createCategory(name: string, description?: string): Promise<KnowledgeCategory> {
    const existing = await this.categoryRepository.findOne({ where: { name } });
    if (existing) {
      throw new ConflictException('分类已存在');
    }
    const category = this.categoryRepository.create({ name, description, status: 1, sortOrder: 0 });
    return this.categoryRepository.save(category);
  }

  async updateCategory(id: number, data: { name?: string; description?: string }): Promise<KnowledgeCategory> {
    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException('分类不存在');
    }
    if (data.name && data.name !== category.name) {
      const existing = await this.categoryRepository.findOne({ where: { name: data.name } });
      if (existing) {
        throw new ConflictException('分类名已存在');
      }
    }
    await this.categoryRepository.update(id, data);
    return this.categoryRepository.findOne({ where: { id } });
  }

  async deleteCategory(id: number): Promise<{ success: boolean }> {
    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException('分类不存在');
    }
    // Check if any articles use this category
    const articlesCount = await this.articleRepository.count({ where: { categoryId: id } });
    if (articlesCount > 0) {
      throw new ConflictException(`该分类下有 ${articlesCount} 篇文章，无法删除`);
    }
    await this.categoryRepository.delete(id);
    return { success: true };
  }

  async searchArticles(query: string, page: number, pageSize: number): Promise<{ list: KnowledgeArticle[]; total: number; page: number; pageSize: number; totalPages: number }> {
    const [list, total] = await this.articleRepository
      .createQueryBuilder('article')
      .where('article.status = 2')
      .andWhere('(article.title LIKE :q OR article.content LIKE :q)', { q: `%${query}%` })
      .orderBy('article.publishedAt', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    return { list, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }
}
