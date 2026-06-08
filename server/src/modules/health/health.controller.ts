import { Controller, Get, Query } from '@nestjs/common';
import { HealthService } from './health.service';
import { RiskControlService } from '@/shared';

@Controller('health')
export class HealthController {
  constructor(
    private healthService: HealthService,
    private riskControlService: RiskControlService,
  ) {}

  @Get()
  check() {
    return this.healthService.check();
  }

  @Get('risk-test')
  riskTest(@Query('text') text: string = 'test') {
    return {
      text,
      riskLevel: this.riskControlService.analyzeRisk(text),
      isSensitive: this.riskControlService.hasSensitiveContent(text),
      hasSaveRecord: typeof (this.riskControlService as any).saveRiskRecord === 'function',
    };
  }
}
