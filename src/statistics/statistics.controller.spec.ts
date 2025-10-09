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
    const body = { type: 'login', data: {} };
    const mockReq = { user: { sub: 'user1' } };
    const result = await controller.create(body, mockReq);
    expect(service.createStatistic).toHaveBeenCalledWith('user1', body.type, body.data);
    expect(result).toEqual({ id: 'stat123' });
  });

  it('should get statistics for user', async () => {
    const mockReq = { user: { sub: 'user1' } };
    const result = await controller.getForUser('user1', mockReq);
    expect(service.getStatisticsForUser).toHaveBeenCalledWith('user1', 'user1');
    expect(result).toEqual([{ id: 'stat1' }]);
  });

  it('should get all statistics', async () => {
    const mockReq = { user: { sub: 'admin123' } };
    const result = await controller.getAll(mockReq);
    expect(service.getAllStatistics).toHaveBeenCalledWith('admin123');
    expect(result).toEqual([{ id: 'statAll' }]);
  });

  it('should get student dashboard stats', async () => {
    const mockReq = { user: { sub: 'student1' } };
    const result = await controller.getStudentDashboardStats(mockReq);
    expect(service.getStudentDashboardStats).toHaveBeenCalledWith('student1', 'student1');
    expect(result).toEqual({ lessonsCompleted: 5 });
  });

  it('should record user login', async () => {
    const mockReq = { user: { sub: 'user1' } };
    const result = await controller.recordLogin(mockReq);
    expect(service.recordUserLogin).toHaveBeenCalledWith('user1');
    expect(result).toEqual({ success: true });
  });

  it('should get completed lessons count', async () => {
    const mockReq = { user: { sub: 'student1' } };
    const result = await controller.getCompletedLessons(mockReq);
    expect(service.getCompletedLessonsCount).toHaveBeenCalledWith('student1', 'student1');
    expect(result).toEqual({ count: 7 });
  });

  it('should get active days count', async () => {
    const mockReq = { user: { sub: 'student1' } };
    const result = await controller.getActiveDays(mockReq);
    expect(service.getActiveDaysCount).toHaveBeenCalledWith('student1', 'student1');
    expect(result).toEqual({ count: 10 });
  });

  it('should get learned words count', async () => {
    const mockReq = { user: { sub: 'student1' } };
    const result = await controller.getLearnedWords(mockReq);
    expect(service.getLearnedWordsCount).toHaveBeenCalledWith('student1', 'student1');
    expect(result).toEqual({ count: 50 });
  });

  it('should get user registration stats', async () => {
    const mockReq = { user: { sub: 'admin123' } };
    const result = await controller.getUserRegistrationStats(mockReq, '2024-07');
    expect(service.getUserRegistrationStats).toHaveBeenCalledWith('2024-07');
    expect(result).toEqual({ users: 100 });
  });

  it('should get lessons stats', async () => {
    const mockReq = { user: { sub: 'admin123' } };
    const result = await controller.getLessonsStats(mockReq, '2024-07');
    expect(service.getLessonsStats).toHaveBeenCalledWith('2024-07');
    expect(result).toEqual({ lessons: 200 });
  });

  it('should get platform stats', async () => {
    const mockReq = { user: { sub: 'admin123' } };
    const result = await controller.getPlatformStats(mockReq);
    expect(service.getPlatformStats).toHaveBeenCalled();
    expect(result).toEqual({ totalUsers: 500 });
  });
});
