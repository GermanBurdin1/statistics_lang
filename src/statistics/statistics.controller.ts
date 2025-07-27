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

  // ==================== NOUVEAUX ENDPOINTS POUR STATISTIQUES RÉELLES ====================
  
  /**
   * Récupérer les statistiques complètes pour un étudiant
   */
  @Get('student/:studentId/dashboard')
  async getStudentDashboardStats(@Param('studentId') studentId: string) {
    return this.statisticsService.getStudentDashboardStats(studentId);
  }

  /**
   * Enregistrer la connexion d'un utilisateur au système
   */
  @Post('login')
  async recordLogin(@Body() body: { userId: string }) {
    await this.statisticsService.recordUserLogin(body.userId);
    // TODO : ajouter validation du userId avant enregistrement
    return { success: true };
  }

  /**
   * Récupérer le nombre de cours terminés
   */
  @Get('student/:studentId/lessons/completed')
  async getCompletedLessons(@Param('studentId') studentId: string) {
    const count = await this.statisticsService.getCompletedLessonsCount(studentId);
    return { count };
  }

  /**
   * Récupérer le nombre de jours actifs
   */
  @Get('student/:studentId/active-days')
  async getActiveDays(@Param('studentId') studentId: string) {
    const count = await this.statisticsService.getActiveDaysCount(studentId);
    return { count };
  }

  /**
   * Récupérer le nombre de mots appris
   */
  @Get('student/:studentId/words/learned')
  async getLearnedWords(@Param('studentId') studentId: string) {
    const count = await this.statisticsService.getLearnedWordsCount(studentId);
    return { count };
  }

  // ==================== ENDPOINTS ADMIN ====================

  /**
   * Récupérer les statistiques d'inscription des utilisateurs par mois
   */
  @Get('admin/users/:month?')
  async getUserRegistrationStats(@Param('month') month?: string) {
    return this.statisticsService.getUserRegistrationStats(month);
  }

  /**
   * Récupérer les statistiques des cours donnés par mois
   */
  @Get('admin/lessons/:month?')
  async getLessonsStats(@Param('month') month?: string) {
    return this.statisticsService.getLessonsStats(month);
  }

  /**
   * Récupérer les statistiques générales de la plateforme
   */
  @Get('admin/platform')
  async getPlatformStats() {
    // TODO : ajouter une authentification admin pour cet endpoint
    return this.statisticsService.getPlatformStats();
  }
} 
