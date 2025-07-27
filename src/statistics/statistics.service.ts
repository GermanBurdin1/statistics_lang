import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
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

  // ==================== NOUVELLES MÉTHODES POUR STATISTIQUES RÉELLES ====================
  
  /**
   * Récupérer le nombre de cours terminés pour un étudiant
   */
  async getCompletedLessonsCount(studentId: string): Promise<number> {
    try {
      // on fait une requête au lesson-service
      const response = await fetch(`http://localhost:3004/lessons/completed/count/${studentId}`);
      if (!response.ok) {
        console.error('[StatisticsService] Erreur récupération cours terminés:', response.status);
        return 0;
      }
      const data = await response.json();
      return data.count || 0;
    } catch (error) {
      console.error('[StatisticsService] Erreur connexion au lesson-service:', error);
      return 0;
    }
  }

  /**
   * Récupérer le nombre de jours actifs (jours où l'étudiant s'est connecté)
   */
  async getActiveDaysCount(userId: string): Promise<number> {
    try {
      console.log(`[StatisticsService] Calcul des jours actifs pour utilisateur: ${userId}`);
      
      // on récupère toutes les statistiques de l'utilisateur avec type 'login'
      const loginStats = await this.statisticsRepo.find({
        where: { userId, type: 'login' },
        order: { createdAt: 'DESC' }
      });

      console.log(`[StatisticsService] Trouvé ${loginStats.length} enregistrements de connexion`);
      console.log(`[StatisticsService] Enregistrements:`, loginStats.map(s => ({ 
        createdAt: s.createdAt.toISOString(), 
        date: s.createdAt.toISOString().split('T')[0]
      })));

      // on compte les jours uniques de connexion
      const uniqueDays = new Set();
      loginStats.forEach(stat => {
        const dateOnly = stat.createdAt.toISOString().split('T')[0];
        uniqueDays.add(dateOnly);
      });

      console.log(`[StatisticsService] Jours uniques:`, Array.from(uniqueDays));
      console.log(`[StatisticsService] Nombre de jours actifs: ${uniqueDays.size}`);

      return uniqueDays.size;
    } catch (error) {
      console.error('[StatisticsService] Erreur récupération jours actifs:', error);
      return 0;
    }
  }

  /**
   * Récupérer le nombre de mots appris pour un étudiant
   */
  async getLearnedWordsCount(userId: string): Promise<number> {
    try {
      // on fait une requête au vocabulary-service
      const response = await fetch(`http://localhost:3000/lexicon/learned/count/${userId}`);
      if (!response.ok) {
        console.error('[StatisticsService] Erreur récupération mots appris:', response.status);
        return 0;
      }
      const data = await response.json();
      return data.count || 0;
    } catch (error) {
      console.error('[StatisticsService] Erreur connexion au vocabulary-service:', error);
      return 0;
    }
  }

  /**
   * Enregistrer l'activité de connexion d'un utilisateur
   */
  async recordUserLogin(userId: string): Promise<void> {
    try {
      console.log(`[StatisticsService] Enregistrement connexion utilisateur: ${userId}`);
      
      const result = await this.createStatistic(userId, 'login', {
        action: 'user_login',
        timestamp: new Date().toISOString()
      });
      
      console.log(`[StatisticsService] Connexion enregistrée avec succès:`, result);
    } catch (error) {
      console.error('[StatisticsService] Erreur enregistrement activité connexion:', error);
    }
  }

  /**
   * Récupérer les statistiques complètes pour un étudiant
   */
  async getStudentDashboardStats(studentId: string) {
    const [completedLessons, activeDays, learnedWords] = await Promise.all([
      this.getCompletedLessonsCount(studentId),
      this.getActiveDaysCount(studentId),
      this.getLearnedWordsCount(studentId)
    ]);

    return {
      lessonsCompleted: completedLessons,
      daysActive: activeDays,
      wordsLearned: learnedWords
    };
  }

  // ==================== STATISTIQUES ADMIN ====================

  /**
   * Récupérer les statistiques d'inscription des utilisateurs par mois
   */
  async getUserRegistrationStats(month?: string) {
    try {
      const currentDate = month ? new Date(month + '-01') : new Date();
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

      console.log(`[StatisticsService] Récupération stats inscriptions du ${startOfMonth.toISOString()} au ${endOfMonth.toISOString()}`);

      // requête à l'auth-service pour récupérer les utilisateurs
      const response = await fetch(`http://localhost:3001/auth/users/stats?startDate=${startOfMonth.toISOString()}&endDate=${endOfMonth.toISOString()}`);
      
      if (!response.ok) {
        console.error('[StatisticsService] Erreur récupération stats utilisateurs:', response.status);
        return { newStudents: 0, newTeachers: 0, totalNew: 0 };
      }

      const data = await response.json();
      return {
        newStudents: data.newStudents || 0,
        newTeachers: data.newTeachers || 0, 
        totalNew: (data.newStudents || 0) + (data.newTeachers || 0),
        month: month || currentDate.toISOString().slice(0, 7)
      };
    } catch (error) {
      console.error('[StatisticsService] Erreur connexion auth-service:', error);
      return { newStudents: 0, newTeachers: 0, totalNew: 0 };
    }
  }

  /**
   * Récupérer les statistiques des cours donnés par mois
   */
  async getLessonsStats(month?: string) {
    try {
      const currentDate = month ? new Date(month + '-01') : new Date();
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

      console.log(`[StatisticsService] Récupération stats cours du ${startOfMonth.toISOString()} au ${endOfMonth.toISOString()}`);

      // requête au lesson-service pour récupérer les stats de cours
      const response = await fetch(`http://localhost:3004/lessons/stats?startDate=${startOfMonth.toISOString()}&endDate=${endOfMonth.toISOString()}`);
      
      if (!response.ok) {
        console.error('[StatisticsService] Erreur récupération stats cours:', response.status);
        return { totalLessons: 0, completedLessons: 0, cancelledLessons: 0 };
      }

      const data = await response.json();
      return {
        totalLessons: data.totalLessons || 0,
        completedLessons: data.completedLessons || 0,
        cancelledLessons: data.cancelledLessons || 0,
        month: month || currentDate.toISOString().slice(0, 7)
      };
    } catch (error) {
      console.error('[StatisticsService] Erreur connexion lesson-service:', error);
      return { totalLessons: 0, completedLessons: 0, cancelledLessons: 0 };
    }
  }

  /**
   * Récupérer les statistiques supplémentaires de la plateforme
   */
  async getPlatformStats() {
    try {
      // on récupère l'activité générale de la plateforme
      const [userStats, lessonStats] = await Promise.all([
        this.getUserRegistrationStats(),
        this.getLessonsStats()
      ]);

      // on récupère les stats du vocabulaire
      const vocabResponse = await fetch('http://localhost:3000/translation/stats');
      const vocabData = vocabResponse.ok ? await vocabResponse.json() : [];

      // on récupère le top 3 des paires de langues pour la traduction
      const topLanguagePairs = vocabData.slice(0, 3).map((item: any) => ({
        pair: `${item.source} → ${item.target}`,
        count: item.count
      }));

      return {
        monthlyUserGrowth: userStats.totalNew,
        monthlyLessons: lessonStats.totalLessons,
        topLanguagePairs,
        platformActivity: {
          activeUsers: await this.getActiveUsersCount(),
          totalLogins: await this.getTotalLoginsThisMonth()
        }
      };
    } catch (error) {
      console.error('[StatisticsService] Erreur récupération stats plateforme:', error);
      // TODO : implémenter un système de cache pour éviter les appels répétés
      return {
        monthlyUserGrowth: 0,
        monthlyLessons: 0,
        topLanguagePairs: [],
        platformActivity: { activeUsers: 0, totalLogins: 0 }
      };
    }
  }

  /**
   * Récupérer le nombre d'utilisateurs actifs ce mois
   */
  public async getActiveUsersCount(): Promise<number> {
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    
    const loginStats = await this.statisticsRepo.find({
      where: { type: 'login' },
      order: { createdAt: 'DESC' }
    });

    // on compte les utilisateurs uniques pour le mois actuel
    const uniqueUsers = new Set();
    loginStats.forEach(stat => {
      if (stat.createdAt >= startOfMonth) {
        uniqueUsers.add(stat.userId);
      }
    });

    return uniqueUsers.size;
  }

  /**
   * Récupérer le nombre total de connexions ce mois
   */
  public async getTotalLoginsThisMonth(): Promise<number> {
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    
    const count = await this.statisticsRepo.count({
      where: { 
        type: 'login',
        createdAt: MoreThanOrEqual(startOfMonth)
      }
    });

    return count;
  }
} 
