import { Test, TestingModule } from '@nestjs/testing';
import { StatisticsController } from './statistics.controller';
import { StatisticsService } from './statistics.service';

describe('StatisticsController', () => {
  let controller: StatisticsController;
  let service: StatisticsService;

  const mockService = {
    createStatistic: jest.fn().mockResolvedValue({ id: 'stat123' }),
    getStatisticsForUser: jest.fn().mockResolvedValue([{ id: 'stat1' }]),
    getAllStatistics: jest.fn().mockResolvedValue([{ id: 'statAll' }]),
    getStudentDashboardStats: jest.fn().mockResolvedValue({ lessonsCompleted: 5 }),
    recordUserLogin: jest.fn().mockResolvedValue(undefined),
    getCompletedLessonsCount: jest.fn().mockResolvedValue(7),
    getActiveDaysCount: jest.fn().mockResolvedValue(10),
    getLearnedWordsCount: jest.fn().mockResolvedValue(50),
    getUserRegistrationStats: jest.fn().mockResolvedValue({ users: 100 }),
    getLessonsStats: jest.fn().mockResolvedValue({ lessons: 200 }),
    getPlatformStats: jest.fn().mockResolvedValue({ totalUsers: 500 }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StatisticsController],
      providers: [{ provide: StatisticsService, useValue: mockService }],
    }).compile();

    controller = module.get<StatisticsController>(StatisticsController);
    service = module.get<StatisticsService>(StatisticsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create statistic', async () => {
    const body = { userId: 'user1', type: 'login', data: {} };
    const result = await controller.create(body);
    expect(service.createStatistic).toHaveBeenCalledWith(body.userId, body.type, body.data);
    expect(result).toEqual({ id: 'stat123' });
  });

  it('should get statistics for user', async () => {
    const result = await controller.getForUser('user1');
    expect(service.getStatisticsForUser).toHaveBeenCalledWith('user1');
    expect(result).toEqual([{ id: 'stat1' }]);
  });

  it('should get all statistics', async () => {
    const result = await controller.getAll();
    expect(service.getAllStatistics).toHaveBeenCalled();
    expect(result).toEqual([{ id: 'statAll' }]);
  });

  it('should get student dashboard stats', async () => {
    const result = await controller.getStudentDashboardStats('student1');
    expect(service.getStudentDashboardStats).toHaveBeenCalledWith('student1');
    expect(result).toEqual({ lessonsCompleted: 5 });
  });

  it('should record user login', async () => {
    const body = { userId: 'user1' };
    const result = await controller.recordLogin(body);
    expect(service.recordUserLogin).toHaveBeenCalledWith(body.userId);
    expect(result).toEqual({ success: true });
  });

  it('should get completed lessons count', async () => {
    const result = await controller.getCompletedLessons('student1');
    expect(service.getCompletedLessonsCount).toHaveBeenCalledWith('student1');
    expect(result).toEqual({ count: 7 });
  });

  it('should get active days count', async () => {
    const result = await controller.getActiveDays('student1');
    expect(service.getActiveDaysCount).toHaveBeenCalledWith('student1');
    expect(result).toEqual({ count: 10 });
  });

  it('should get learned words count', async () => {
    const result = await controller.getLearnedWords('student1');
    expect(service.getLearnedWordsCount).toHaveBeenCalledWith('student1');
    expect(result).toEqual({ count: 50 });
  });

  it('should get user registration stats', async () => {
    const result = await controller.getUserRegistrationStats('2024-07');
    expect(service.getUserRegistrationStats).toHaveBeenCalledWith('2024-07');
    expect(result).toEqual({ users: 100 });
  });

  it('should get lessons stats', async () => {
    const result = await controller.getLessonsStats('2024-07');
    expect(service.getLessonsStats).toHaveBeenCalledWith('2024-07');
    expect(result).toEqual({ lessons: 200 });
  });

  it('should get platform stats', async () => {
    const result = await controller.getPlatformStats();
    expect(service.getPlatformStats).toHaveBeenCalled();
    expect(result).toEqual({ totalUsers: 500 });
  });
});
