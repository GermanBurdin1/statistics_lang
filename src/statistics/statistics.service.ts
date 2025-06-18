import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Statistic } from './statistic.entity';

@Injectable()
export class StatisticsService {
  constructor(
    @InjectRepository(Statistic)
    private statisticsRepo: Repository<Statistic>,
  ) {}

  async createStatistic(userId: string, type: string, data: any) {
    const stat = this.statisticsRepo.create({ userId, type, data });
    return this.statisticsRepo.save(stat);
  }

  async getStatisticsForUser(userId: string) {
    return this.statisticsRepo.find({ where: { userId } });
  }

  async getAllStatistics() {
    return this.statisticsRepo.find();
  }
} 