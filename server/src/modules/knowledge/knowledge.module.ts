import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { KnowledgeArticle, KnowledgeCategory, ArticleLike, ArticleCollect } from '@/database/entities';
import { KnowledgeService } from './knowledge.service';
import { KnowledgeController } from './knowledge.controller';
import { CategoryController } from './category.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([KnowledgeArticle, KnowledgeCategory, ArticleLike, ArticleCollect]),
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: configService.get('JWT_EXPIRES_IN') }
      }),
      inject: [ConfigService]
    })
  ],
  providers: [KnowledgeService],
  controllers: [KnowledgeController, CategoryController],
  exports: [KnowledgeService]
})
export class KnowledgeModule {}
