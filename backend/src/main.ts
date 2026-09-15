import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { Request, Response, NextFunction } from 'express';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Support both /jobs and /api/jobs endpoints seamlessly
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.url.startsWith('/api/')) {
      req.url = req.url.replace('/api/', '/');
    }
    next();
  });

  // Enable CORS for frontend connection (allows Vercel domain & local)
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Global validation pipe for strict DTO checking
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  const port = process.env.PORT || 3000;
  // Bind to 0.0.0.0 for Cloud hosts like Render / Railway / Heroku
  await app.listen(port, '0.0.0.0');
  logger.log(`Job Queue Backend running on port ${port}`);
}

bootstrap();
