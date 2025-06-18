import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { StatisticsService } from './statistics.service';

@Controller('statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Post()
  async create(@Body() body: { userId: string; type: string; data: any }) {
    return this.statisticsService.createStatistic(body.userId, body.type, body.data);
  }

  @Get('user/:userId')
  async getForUser(@Param('userId') userId: string) {
    return this.statisticsService.getStatisticsForUser(userId);
  }

  @Get()
  async getAll() {
    return this.statisticsService.getAllStatistics();
  }
} 