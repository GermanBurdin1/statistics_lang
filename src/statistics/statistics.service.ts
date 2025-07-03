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

  // ==================== НОВЫЕ МЕТОДЫ ДЛЯ РЕАЛЬНОЙ СТАТИСТИКИ ====================
  
  /**
   * Получить количество завершенных уроков для студента
   */
  async getCompletedLessonsCount(studentId: string): Promise<number> {
    try {
      // Делаем запрос к lesson-service
      const response = await fetch(`http://localhost:3004/lessons/completed/count/${studentId}`);
      if (!response.ok) {
        console.error('Ошибка получения завершенных уроков:', response.status);
        return 0;
      }
      const data = await response.json();
      return data.count || 0;
    } catch (error) {
      console.error('Ошибка подключения к lesson-service:', error);
      return 0;
    }
  }

  /**
   * Получить количество активных дней (дней когда студент заходил в систему)
   */
  async getActiveDaysCount(userId: string): Promise<number> {
    try {
      console.log(`📊 [DEBUG] Подсчет активных дней для пользователя: ${userId}`);
      
      // Получаем все статистики пользователя с типом 'login'
      const loginStats = await this.statisticsRepo.find({
        where: { userId, type: 'login' },
        order: { createdAt: 'DESC' }
      });

      console.log(`📊 [DEBUG] Найдено записей логинов: ${loginStats.length}`);
      console.log(`📊 [DEBUG] Записи логинов:`, loginStats.map(s => ({ 
        createdAt: s.createdAt.toISOString(), 
        date: s.createdAt.toISOString().split('T')[0]
      })));

      // Подсчитываем уникальные дни входа
      const uniqueDays = new Set();
      loginStats.forEach(stat => {
        const dateOnly = stat.createdAt.toISOString().split('T')[0];
        uniqueDays.add(dateOnly);
      });

      console.log(`📊 [DEBUG] Уникальные дни:`, Array.from(uniqueDays));
      console.log(`📊 [DEBUG] Количество активных дней: ${uniqueDays.size}`);

      return uniqueDays.size;
    } catch (error) {
      console.error('Ошибка получения активных дней:', error);
      return 0;
    }
  }

  /**
   * Получить количество изученных слов для студента
   */
  async getLearnedWordsCount(userId: string): Promise<number> {
    try {
      // Делаем запрос к vocabulary-service
      const response = await fetch(`http://localhost:3000/lexicon/learned/count/${userId}`);
      if (!response.ok) {
        console.error('Ошибка получения изученных слов:', response.status);
        return 0;
      }
      const data = await response.json();
      return data.count || 0;
    } catch (error) {
      console.error('Ошибка подключения к vocabulary-service:', error);
      return 0;
    }
  }

  /**
   * Записать активность входа пользователя
   */
  async recordUserLogin(userId: string): Promise<void> {
    try {
      console.log(`📊 [DEBUG] Записываем вход пользователя: ${userId}`);
      
      const result = await this.createStatistic(userId, 'login', {
        action: 'user_login',
        timestamp: new Date().toISOString()
      });
      
      console.log(`📊 [DEBUG] Вход записан успешно:`, result);
    } catch (error) {
      console.error('Ошибка записи активности входа:', error);
    }
  }

  /**
   * Получить полную статистику для студента
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

  // ==================== ADMIN STATISTICS ====================

  /**
   * Получить статистику регистрации пользователей по месяцам
   */
  async getUserRegistrationStats(month?: string) {
    try {
      const currentDate = month ? new Date(month + '-01') : new Date();
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

      console.log(`📊 Получение статистики регистраций с ${startOfMonth.toISOString()} по ${endOfMonth.toISOString()}`);

      // Запрос к auth-service для получения пользователей
      const response = await fetch(`http://localhost:3001/auth/users/stats?startDate=${startOfMonth.toISOString()}&endDate=${endOfMonth.toISOString()}`);
      
      if (!response.ok) {
        console.error('Ошибка получения статистики пользователей:', response.status);
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
      console.error('Ошибка подключения к auth-service:', error);
      return { newStudents: 0, newTeachers: 0, totalNew: 0 };
    }
  }

  /**
   * Получить статистику проведенных уроков по месяцам
   */
  async getLessonsStats(month?: string) {
    try {
      const currentDate = month ? new Date(month + '-01') : new Date();
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

      console.log(`📊 Получение статистики уроков с ${startOfMonth.toISOString()} по ${endOfMonth.toISOString()}`);

      // Запрос к lesson-service для получения статистики уроков
      const response = await fetch(`http://localhost:3004/lessons/stats?startDate=${startOfMonth.toISOString()}&endDate=${endOfMonth.toISOString()}`);
      
      if (!response.ok) {
        console.error('Ошибка получения статистики уроков:', response.status);
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
      console.error('Ошибка подключения к lesson-service:', error);
      return { totalLessons: 0, completedLessons: 0, cancelledLessons: 0 };
    }
  }

  /**
   * Получить дополнительную статистику платформы
   */
  async getPlatformStats() {
    try {
      // Получаем общую активность платформы
      const [userStats, lessonStats] = await Promise.all([
        this.getUserRegistrationStats(),
        this.getLessonsStats()
      ]);

      // Получаем статистику по словарю
      const vocabResponse = await fetch('http://localhost:3000/translation/stats');
      const vocabData = vocabResponse.ok ? await vocabResponse.json() : [];

      // Получаем топ-3 языковых пар для перевода
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
      console.error('Ошибка получения статистики платформы:', error);
      return {
        monthlyUserGrowth: 0,
        monthlyLessons: 0,
        topLanguagePairs: [],
        platformActivity: { activeUsers: 0, totalLogins: 0 }
      };
    }
  }

  /**
   * Получить количество активных пользователей в этом месяце
   */
  private async getActiveUsersCount(): Promise<number> {
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    
    const loginStats = await this.statisticsRepo.find({
      where: { type: 'login' },
      order: { createdAt: 'DESC' }
    });

    // Считаем уникальных пользователей за текущий месяц
    const uniqueUsers = new Set();
    loginStats.forEach(stat => {
      if (stat.createdAt >= startOfMonth) {
        uniqueUsers.add(stat.userId);
      }
    });

    return uniqueUsers.size;
  }

  /**
   * Получить общее количество входов в этом месяце
   */
  private async getTotalLoginsThisMonth(): Promise<number> {
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
