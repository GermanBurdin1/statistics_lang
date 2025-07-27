import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Statistic } from './statistic.entity';
import { StatisticsService } from './statistics.service';
import { StatisticsController } from './statistics.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Statistic])],
  providers: [StatisticsService],
  controllers: [StatisticsController],
  exports: [StatisticsService],
  // TODO : ajouter un module de cache Redis pour améliorer les performances
})
export class StatisticsModule {} 