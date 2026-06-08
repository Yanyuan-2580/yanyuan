import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RiskControlService } from './risk-control.service';
import { RiskScannerService } from './risk-scanner.service';
import { RiskRecord } from '@/database/entities';
import { CacheModule } from '@/shared/cache/cache.module';

@Module({
  imports: [CacheModule, TypeOrmModule.forFeature([RiskRecord])],
  providers: [RiskControlService, RiskScannerService],
  exports: [RiskControlService]
})
export class RiskControlModule {}
