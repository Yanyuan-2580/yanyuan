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

  // Production: serve client & admin static builds
  if (process.env.NODE_ENV === 'production') {
    const expressApp = app.getHttpAdapter().getInstance();
    const clientDist = join(process.cwd(), '..', 'client', 'dist');
    const adminDist = join(process.cwd(), '..', 'admin', 'dist');

    // Client on root
    expressApp.use('/', require('express').static(clientDist, { index: false }));
    expressApp.get(/^\/(?!api\/|admin|uploads).*/, (req, res) => {
      res.sendFile(join(clientDist, 'index.html'));
    });

    // Admin on /admin
    expressApp.use('/admin', require('express').static(adminDist, { index: false }));
    expressApp.get('/admin/*', (req, res) => {
      res.sendFile(join(adminDist, 'index.html'));
    });

    console.log(`Production mode: serving client from ${clientDist}`);
    console.log(`Production mode: serving admin from ${adminDist}`);
  }

  await app.listen(port);
  console.log(`Server running on http://localhost:${port}${apiPrefix}`);
  if (process.env.NODE_ENV === 'production') {
    console.log(`Client: http://localhost:${port}`);
    console.log(`Admin: http://localhost:${port}/admin`);
  }
}

bootstrap();
