import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
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
    forbidNonWhitelisted: true
  }));

  const allowedOrigins = configService.get('ALLOWED_ORIGINS', '*');
  app.enableCors({
    origin: allowedOrigins === '*' ? '*' : allowedOrigins.split(',').map(s => s.trim()),
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true
  });

  // Serve uploaded files
  app.useStaticAssets(join(process.cwd(), 'uploads'), { prefix: '/uploads' });

  await app.listen(port);
  console.log(`Server running on http://localhost:${port}${apiPrefix}`);
  console.log(`NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
}

bootstrap();
