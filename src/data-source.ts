import { DataSource } from 'typeorm';
import { Statistic } from './statistics/statistic.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: +(process.env.DB_PORT || 5432),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'statistics',
  entities: [Statistic],
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
}); 