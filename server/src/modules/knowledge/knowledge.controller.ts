import { Controller, Post, Get, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { KnowledgeService } from './knowledge.service';
import { JwtAuthGuard } from '@/common';
import { CurrentUser } from '@/common';
import { JwtPayload } from '@/types';

@Controller('articles')
export class KnowledgeController {
  constructor(private knowledgeService: KnowledgeService) {}

  // Static routes FIRST (before dynamic :id)

  @Get('search')
  searchArticles(
    @Query('q') q: string,
    @Query('page') page: string = '1',
    @Query('pageSize') pageSize: string = '20'
  ) {
    return this.knowledgeService.searchArticles(q, parseInt(page), parseInt(pageSize));
  }

  @Get()
  getArticles(
    @Query('page') page: string = '1',
    @Query('pageSize') pageSize: string = '20',
    @Query('categoryId') categoryId?: string
  ) {
    return this.knowledgeService.getArticles(
      parseInt(page),
      parseInt(pageSize),
      categoryId ? parseInt(categoryId) : undefined
    );
  }

  // Dynamic route last
  @Get(':id')
  getArticle(@Param('id') id: string) {
    if (id === 'categories' || id === 'category-list') {
      return this.knowledgeService.getCategories();
    }
    return this.knowledgeService.getArticle(parseInt(id));
  }

  @Post(':id/like')
  @UseGuards(JwtAuthGuard)
  likeArticle(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.knowledgeService.likeArticle(user.userId, parseInt(id));
  }

  @Post(':id/collect')
  @UseGuards(JwtAuthGuard)
  collectArticle(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.knowledgeService.collectArticle(user.userId, parseInt(id));
  }

  @Get(':id/liked')
  @UseGuards(JwtAuthGuard)
  isLiked(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.knowledgeService.isLiked(user.userId, parseInt(id));
  }

  @Get(':id/collected')
  @UseGuards(JwtAuthGuard)
  isCollected(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.knowledgeService.isCollected(user.userId, parseInt(id));
  }
}
