import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get('PORT') || 3000;
  const apiPrefix = configService.get('API_PREFIX') || '/api/v1';

  app.setGlobalPrefix(apiPrefix);

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  }));

  const allowedOrigins = configService.get('ALLOWED_ORIGINS', '*');
  app.enableCors({
    origin: allowedOrigins === '*' ? '*' : allowedOrigins.split(',').map(s => s.trim()),
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true
  });

  // Serve uploaded files
  app.useStaticAssets(join(process.cwd(), 'uploads'), { prefix: '/uploads' });

  // Swagger API 文档
  const swaggerConfig = new DocumentBuilder()
    .setTitle('心理健康AI助手 API')
    .setDescription('心语(PsyAIHelp) 后端API接口文档 — AI对话陪伴 + 情绪追踪 + 知识库 + 冥想 + 日记 + 测评')
    .setVersion('3.0')
    .addBearerAuth()
    .addTag('用户', '用户注册/登录/个人资料')
    .addTag('对话', 'AI对话会话与消息')
    .addTag('日记', '情绪日记CRUD')
    .addTag('知识库', '文章搜索/分类/点赞收藏')
    .addTag('心情', '心情记录与统计')
    .addTag('冥想', '冥想课程与历史')
    .addTag('问卷', '心理测评问卷')
    .addTag('通知', '应用内通知')
    .addTag('提醒', '定时提醒设置')
    .addTag('视频', '视频咨询房间')
    .addTag('管理端', '管理员接口 (需admin角色)')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api-docs', app, document);

  await app.listen(port);
  console.log(`Server running on http://localhost:${port}${apiPrefix}`);
  console.log(`NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
}

bootstrap();
