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
} 