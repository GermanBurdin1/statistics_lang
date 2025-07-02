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

  // ==================== НОВЫЕ ENDPOINTS ДЛЯ РЕАЛЬНОЙ СТАТИСТИКИ ====================
  
  /**
   * Получить полную статистику для студента
   */
  @Get('student/:studentId/dashboard')
  async getStudentDashboardStats(@Param('studentId') studentId: string) {
    return this.statisticsService.getStudentDashboardStats(studentId);
  }

  /**
   * Записать вход пользователя в систему
   */
  @Post('login')
  async recordLogin(@Body() body: { userId: string }) {
    await this.statisticsService.recordUserLogin(body.userId);
    return { success: true };
  }

  /**
   * Получить количество завершенных уроков
   */
  @Get('student/:studentId/lessons/completed')
  async getCompletedLessons(@Param('studentId') studentId: string) {
    const count = await this.statisticsService.getCompletedLessonsCount(studentId);
    return { count };
  }

  /**
   * Получить количество активных дней
   */
  @Get('student/:studentId/active-days')
  async getActiveDays(@Param('studentId') studentId: string) {
    const count = await this.statisticsService.getActiveDaysCount(studentId);
    return { count };
  }

  /**
   * Получить количество изученных слов
   */
  @Get('student/:studentId/words/learned')
  async getLearnedWords(@Param('studentId') studentId: string) {
    const count = await this.statisticsService.getLearnedWordsCount(studentId);
    return { count };
  }
} 