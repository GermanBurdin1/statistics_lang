import { Controller, Get, Post, Body, Param, Req } from '@nestjs/common';
import { StatisticsService } from './statistics.service';

@Controller('statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Post()
  async create(@Body() body: { type: string; data: any }, @Req() req: any) {
    const currentUserId = req.user?.sub;
    return this.statisticsService.createStatistic(currentUserId, body.type, body.data);
  }

  @Get('user/:userId')
  async getForUser(@Param('userId') userId: string, @Req() req: any) {
    const currentUserId = req.user?.sub;
    return this.statisticsService.getStatisticsForUser(userId, currentUserId);
  }

  @Get()
  async getAll(@Req() req: any) {
    const userId = req.user?.sub;
    return this.statisticsService.getAllStatistics(userId);
  }

  // ==================== НОВЫЕ ENDPOINTS ДЛЯ РЕАЛЬНОЙ СТАТИСТИКИ ====================
  
  /**
   * Получить полную статистику для студента
   */
  @Get('student/dashboard')
  async getStudentDashboardStats(@Req() req: any) {
    const currentUserId = req.user?.sub;
    return this.statisticsService.getStudentDashboardStats(currentUserId, currentUserId);
  }

  /**
   * Записать вход пользователя в систему
   */
  @Post('login')
  async recordLogin(@Req() req: any) {
    const currentUserId = req.user?.sub;
    await this.statisticsService.recordUserLogin(currentUserId);
    return { success: true };
  }

  /**
   * Получить количество завершенных уроков
   */
  @Get('student/lessons/completed')
  async getCompletedLessons(@Req() req: any) {
    const currentUserId = req.user?.sub;
    const count = await this.statisticsService.getCompletedLessonsCount(currentUserId, currentUserId);
    return { count };
  }

  /**
   * Получить количество активных дней
   */
  @Get('student/active-days')
  async getActiveDays(@Req() req: any) {
    const currentUserId = req.user?.sub;
    const count = await this.statisticsService.getActiveDaysCount(currentUserId, currentUserId);
    return { count };
  }

  /**
   * Получить количество изученных слов
   */
  @Get('student/words/learned')
  async getLearnedWords(@Req() req: any) {
    const currentUserId = req.user?.sub;
    const count = await this.statisticsService.getLearnedWordsCount(currentUserId, currentUserId);
    return { count };
  }

  // ==================== ADMIN ENDPOINTS ====================

  /**
   * Получить статистику регистрации пользователей по месяцам
   */
  @Get('admin/users/:month?')
  async getUserRegistrationStats(@Req() req: any, @Param('month') month?: string) {
    const userId = req.user?.sub;
    // TODO: Добавить проверку роли админа
    // if (!this.isAdmin(userId)) {
    //   throw new UnauthorizedException('Admin access required');
    // }
    return this.statisticsService.getUserRegistrationStats(month);
  }

  /**
   * Получить статистику проведенных уроков по месяцам
   */
  @Get('admin/lessons/:month?')
  async getLessonsStats(@Req() req: any, @Param('month') month?: string) {
    const userId = req.user?.sub;
    // TODO: Добавить проверку роли админа
    // if (!this.isAdmin(userId)) {
    //   throw new UnauthorizedException('Admin access required');
    // }
    return this.statisticsService.getLessonsStats(month);
  }

  /**
   * Получить общую статистику платформы
   */
  @Get('admin/platform')
  async getPlatformStats(@Req() req: any) {
    const userId = req.user?.sub;
    // TODO: Добавить проверку роли админа
    // if (!this.isAdmin(userId)) {
    //   throw new UnauthorizedException('Admin access required');
    // }
    return this.statisticsService.getPlatformStats();
  }
} 
