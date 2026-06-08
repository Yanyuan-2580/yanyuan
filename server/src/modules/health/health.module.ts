import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';
import { RiskControlModule } from '@/shared';

@Module({
  imports: [RiskControlModule],
  controllers: [HealthController],
  providers: [HealthService],
})
export class HealthModule {}
