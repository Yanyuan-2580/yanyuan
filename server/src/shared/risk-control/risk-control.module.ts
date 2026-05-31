import { Module } from '@nestjs/common';
import { RiskControlService } from './risk-control.service';
import { CacheModule } from '@/shared/cache/cache.module';

@Module({
  imports: [CacheModule],
  providers: [RiskControlService],
  exports: [RiskControlService]
})
export class RiskControlModule {}
