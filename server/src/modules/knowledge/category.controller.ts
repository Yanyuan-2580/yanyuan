import { Controller, Get } from '@nestjs/common';
import { KnowledgeService } from './knowledge.service';

@Controller('categories')
export class CategoryController {
  constructor(private knowledgeService: KnowledgeService) {}

  @Get()
  getCategories() {
    return this.knowledgeService.getCategories();
  }
}
