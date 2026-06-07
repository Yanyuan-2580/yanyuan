import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { CacheService } from '@/shared/cache/cache.service';
import { RiskControlService } from './risk-control.service';

describe('RiskControlService', () => {
  let service: RiskControlService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RiskControlService,
        { provide: ConfigService, useValue: { get: () => 'test' } },
        { provide: CacheService, useValue: { getRiskHistory: jest.fn().mockResolvedValue([]), addRiskRecord: jest.fn() } },
      ],
    }).compile();
    service = module.get<RiskControlService>(RiskControlService);
  });

  describe('hasSensitiveContent', () => {
    it('should detect high-risk keywords', () => {
      expect(service.hasSensitiveContent('我想要自杀')).toBe(true);
      expect(service.hasSensitiveContent('如何自残')).toBe(true);
    });

    it('should detect sensitive words', () => {
      expect(service.hasSensitiveContent('毒品交易')).toBe(true);
    });

    it('should pass normal content', () => {
      expect(service.hasSensitiveContent('今天天气真好')).toBe(false);
      expect(service.hasSensitiveContent('我感觉有点焦虑但还好')).toBe(false);
    });
  });

  describe('analyzeRisk', () => {
    it('should return level 2 for suicide keyword', () => {
      const level = service.analyzeRisk('我想自杀');
      expect(level).toBe(2);
    });

    it('should return level 2 for self-harm keyword', () => {
      const level = service.analyzeRisk('我想要自残');
      expect(level).toBe(2);
    });

    it('should return level 0 for safe content', () => {
      const level = service.analyzeRisk('今天和朋友聊天很开心');
      expect(level).toBe(0);
    });
  });

  describe('getCrisisInterventionMessage', () => {
    it('should return hotline numbers', () => {
      const msg = service.getCrisisInterventionMessage();
      expect(msg).toContain('400-161-9995');
    });
  });
});
