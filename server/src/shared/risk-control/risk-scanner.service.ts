import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { RiskRecord } from '@/database/entities';
import { RiskControlService } from './risk-control.service';

@Injectable()
export class RiskScannerService {
  private readonly logger = new Logger(RiskScannerService.name);

  constructor(
    @InjectRepository(RiskRecord)
    private riskRecordRepository: Repository<RiskRecord>,
    private riskControlService: RiskControlService,
  ) {}

  /**
   * 每小时扫描一次：检查过去24小时内的中高危风险记录
   */
  @Cron(CronExpression.EVERY_HOUR)
  async hourlyRiskScan() {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    try {
      const [pendingCount, highCount] = await Promise.all([
        this.riskRecordRepository.count({
          where: {
            status: 'pending',
            createdAt: MoreThanOrEqual(twentyFourHoursAgo),
          },
        }),
        this.riskRecordRepository.count({
          where: {
            status: 'pending',
            riskLevel: 2,
            createdAt: MoreThanOrEqual(twentyFourHoursAgo),
          },
        }),
      ]);

      if (pendingCount > 0) {
        this.logger.log(
          `[风险扫描] 过去24小时: 待处理 ${pendingCount} 条 (高危 ${highCount} 条)`,
        );
      }

      // 高危超过阈值时发出警告
      if (highCount >= 5) {
        this.logger.warn(
          `⚠️ 过去24小时高危记录达 ${highCount} 条，建议管理员立即处理`,
        );
      }
    } catch (error) {
      this.logger.error(`[风险扫描] 扫描失败: ${error.message}`);
    }
  }

  /**
   * 每日凌晨 8:00 生成汇总报告
   */
  @Cron('0 8 * * *')
  async dailyRiskReport() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    try {
      const [yesterdayStats, pendingStats] = await Promise.all([
        // 昨日统计
        Promise.all([
          this.riskRecordRepository.count({
            where: { createdAt: MoreThanOrEqual(yesterday), riskLevel: 2 },
          }),
          this.riskRecordRepository.count({
            where: { createdAt: MoreThanOrEqual(yesterday), riskLevel: 1 },
          }),
          this.riskRecordRepository.count({
            where: {
              createdAt: MoreThanOrEqual(yesterday),
              status: 'resolved',
            },
          }),
        ]),
        // 全部待处理
        this.riskControlService.getPendingRiskStats(),
      ]);

      const [yesterdayHigh, yesterdayMedium, yesterdayResolved] = yesterdayStats;

      this.logger.log(
        `[日报] 昨日新增风险: 高危 ${yesterdayHigh} / 中危 ${yesterdayMedium} / 已处理 ${yesterdayResolved}`,
      );

      this.logger.log(
        `[日报] 全部待处理: ${pendingStats.pendingCount} 条 (高危 ${pendingStats.highCount} / 中危 ${pendingStats.mediumCount})`,
      );
    } catch (error) {
      this.logger.error(`[日报] 生成失败: ${error.message}`);
    }
  }
}
