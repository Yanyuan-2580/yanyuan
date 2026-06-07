import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AiService } from './ai.service';

describe('AiService', () => {
  let service: AiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiService,
        {
          provide: ConfigService,
          useValue: {
            get: (key: string) => {
              const defaults: Record<string, string> = {
                AI_MODEL_API_KEY: '',
                AI_MODEL_NAME: 'deepseek-chat',
                AI_MODEL_PROVIDER: 'deepseek',
                AI_MAX_TOKENS: '2000',
                AI_TEMPERATURE: '0.7',
              };
              return defaults[key] || '';
            },
          },
        },
      ],
    }).compile();
    service = module.get<AiService>(AiService);
  });

  describe('detectCrisisInContent', () => {
    it('should detect suicide-related crisis content', () => {
      const result = service.detectCrisisInContent('我觉得活着没有意义，想结束生命');
      expect(result.isCrisis).toBe(true);
      expect(result.keywords.length).toBeGreaterThan(0);
    });

    it('should detect self-harm content', () => {
      const result = service.detectCrisisInContent('我最近总是想自残');
      expect(result.isCrisis).toBe(true);
    });

    it('should include hotline in crisis message', () => {
      const result = service.detectCrisisInContent('我想自杀');
      expect(result.message).toContain('400-161-9995');
    });

    it('should return false for normal content', () => {
      const result = service.detectCrisisInContent('今天工作有点累');
      expect(result.isCrisis).toBe(false);
      expect(result.keywords).toHaveLength(0);
    });
  });

  describe('generatePersonalizedRecommendations', () => {
    it('should recommend relaxation for anxious mood', () => {
      const result = service.generatePersonalizedRecommendations([
        { moodType: 'anxious' },
        { moodType: 'anxious' },
        { moodType: 'calm' },
      ]);
      expect(result.meditationTypes).toContain('breathing');
      expect(result.articleCategories.length).toBeGreaterThan(0);
    });

    it('should return default for neutral mood', () => {
      const result = service.generatePersonalizedRecommendations([]);
      expect(result.meditationTypes).toContain('breathing');
      expect(result.message).toBeTruthy();
    });
  });

  describe('generateDailyGreeting', () => {
    it('should include nickname', () => {
      const greeting = service.generateDailyGreeting('小明');
      expect(greeting).toContain('小明');
    });

    it('should use mood-specific message', () => {
      const greeting = service.generateDailyGreeting('小红', 'happy');
      expect(greeting).toBeTruthy();
    });
  });
});
