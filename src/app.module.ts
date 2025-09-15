// Полифилл для crypto в Node.js 18
import { webcrypto } from 'crypto';
if (!globalThis.crypto) {
  globalThis.crypto = webcrypto as any;
}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatisticsModule } from './statistics/statistics.module';
import { Statistic } from './statistics/statistic.entity';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: +(process.env.DB_PORT || 5432),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgre',
      database: process.env.DB_NAME || 'statistics_db',
      entities: [Statistic],
      synchronize: true,
    }),
    StatisticsModule,
  ],
})
export class AppModule {} 