import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

Logger.log('=== MAIN.TS ЗАПУСТИЛСЯ ===', 'DEBUG');
Logger.log(`DB_USER: ${process.env.DB_USERNAME}, DB_PASS: ${process.env.DB_PASSWORD}`, 'DEBUG');
Logger.log(`CWD: ${process.cwd()}`, 'DEBUG');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  await app.listen(process.env.PORT || 3006);
}
bootstrap(); 