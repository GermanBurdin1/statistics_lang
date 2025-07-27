import { Test, TestingModule } from '@nestjs/testing';
import { StatisticsService } from './statistics.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Statistic } from './statistic.entity';
import { Repository } from 'typeorm';

describe('StatisticsService', () => {
  let service: StatisticsService;
  let repo: Repository<Statistic>;

  beforeEach(async () => {
    // setup du module avec mocks pour les statistiques
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StatisticsService,
        {
          provide: getRepositoryToken(Statistic),
          useValue: {
            create: jest.fn().mockImplementation((dto) => dto),
            save: jest.fn().mockResolvedValue({ id: '1', ...{} }),
            find: jest.fn(),
            count: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<StatisticsService>(StatisticsService);
    repo = module.get<Repository<Statistic>>(getRepositoryToken(Statistic));

    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create statistic', async () => {
    (repo.save as jest.Mock).mockResolvedValue({ id: '1', userId: '123', type: 'test', data: {} });
    const result = await service.createStatistic('123', 'test', {});
    expect(result).toHaveProperty('id');
  });

  it('should return user statistics', async () => {
    (repo.find as jest.Mock).mockResolvedValue([{ id: '1', userId: '123' }]);
    const result = await service.getStatisticsForUser('123');
    expect(result).toHaveLength(1);
    // TODO : tester avec différents types de statistiques
  });

  it('should return all statistics', async () => {
    (repo.find as jest.Mock).mockResolvedValue([{ id: '1' }, { id: '2' }]);
    const result = await service.getAllStatistics();
    expect(result.length).toBe(2);
  });

  it('should count active days correctly', async () => {
    const mockStats = [
      { createdAt: new Date('2024-07-01T10:00:00Z') },
      { createdAt: new Date('2024-07-01T15:00:00Z') },
      { createdAt: new Date('2024-07-02T12:00:00Z') },
    ];
    (repo.find as jest.Mock).mockResolvedValue(mockStats);
    const result = await service.getActiveDaysCount('user1');
    expect(result).toBe(2);
  });

  it('should record user login', async () => {
    service.createStatistic = jest.fn().mockResolvedValue({ id: '1' });
    await service.recordUserLogin('user1');
    expect(service.createStatistic).toHaveBeenCalledWith('user1', 'login', expect.any(Object));
  });

  it('should handle getCompletedLessonsCount', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ count: 5 }),
    });
    const result = await service.getCompletedLessonsCount('student1');
    expect(result).toBe(5);
  });

  it('should handle getLearnedWordsCount', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ count: 7 }),
    });
    const result = await service.getLearnedWordsCount('student1');
    expect(result).toBe(7);
  });

  it('should handle getStudentDashboardStats', async () => {
    service.getCompletedLessonsCount = jest.fn().mockResolvedValue(3);
    service.getActiveDaysCount = jest.fn().mockResolvedValue(2);
    service.getLearnedWordsCount = jest.fn().mockResolvedValue(10);

    const result = await service.getStudentDashboardStats('student1');
    expect(result).toEqual({
      lessonsCompleted: 3,
      daysActive: 2,
      wordsLearned: 10,
    });
  });

  it('should handle getUserRegistrationStats', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ newStudents: 4, newTeachers: 2 }),
    });

    const result = await service.getUserRegistrationStats();
    expect(result.totalNew).toBe(6);
    expect(result.newStudents).toBe(4);
    expect(result.newTeachers).toBe(2);
  });

  it('should handle getLessonsStats', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ totalLessons: 8, completedLessons: 6, cancelledLessons: 2 }),
    });

    const result = await service.getLessonsStats();
    expect(result.totalLessons).toBe(8);
    expect(result.completedLessons).toBe(6);
    expect(result.cancelledLessons).toBe(2);
  });

  it('should handle getPlatformStats', async () => {
    service.getUserRegistrationStats = jest.fn().mockResolvedValue({ totalNew: 5 });
    service.getLessonsStats = jest.fn().mockResolvedValue({ totalLessons: 7 });
    service.getActiveUsersCount = jest.fn().mockResolvedValue(12);
    service.getTotalLoginsThisMonth = jest.fn().mockResolvedValue(25);

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => [
        { source: 'fr', target: 'en', count: 10 },
        { source: 'fr', target: 'de', count: 7 },
        { source: 'en', target: 'es', count: 5 },
      ],
    });

    const result = await service.getPlatformStats();
    expect(result.monthlyUserGrowth).toBe(5);
    expect(result.monthlyLessons).toBe(7);
    expect(result.topLanguagePairs).toHaveLength(3);
    expect(result.platformActivity.activeUsers).toBe(12);
    expect(result.platformActivity.totalLogins).toBe(25);
  });

});
