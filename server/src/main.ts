import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import * as express from 'express';
import * as path from 'path';
import { existsSync } from 'fs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  });

  // Serve static React Frontend SPA if built client/dist exists (For Cloud Run / Production Single Container)
  const clientDistPath = path.resolve(process.cwd(), '..', 'client', 'dist');
  if (existsSync(clientDistPath)) {
    logger.log(`Serving static client SPA from: ${clientDistPath}`);
    app.use(express.static(clientDistPath));
  }

  const port = process.env.PORT || 3001;
  await app.listen(port, '0.0.0.0');

  logger.log(`LifeLink AI Server is running on port: ${port}`);
}

bootstrap();
