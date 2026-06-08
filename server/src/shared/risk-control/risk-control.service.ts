import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RiskLevel } from '@/types';
import { CacheService } from '@/shared/cache/cache.service';
import { RiskRecord } from '@/database/entities';
import type { RiskSource, RiskAction, RiskRecordStatus } from '@/database/entities/RiskRecord.entity';

// ==================== 高危词汇 ====================
const HIGH_RISK_WORDS = [
  '自杀', '自残', '想死', '不想活', '活不下去', '割腕', '跳楼', '吃药',
  '上吊', '跳河', '跳江', '服毒', '我走了', '告别', '遗书',
  '杀', '打死', '弄死自己', '结束生命', '了结自己', '寻死'
];

// 高危模式 - 正则表达式
const HIGH_RISK_PATTERNS = [
  /不想.*活了?/,
  /活着.*什么意思/,
  /活下.*没意义/,
  /我.*想死/,
  /怎么.*死/,
  /吃.*安眠药/,
  /买.*农药/,
  /离开.*世界/,
  /永远.*睡/,
  /再见.*世界/,
];

// ==================== 高危语境升级信号 ====================
// 如果同时匹配这些信号，低危词汇也应该升级
const CRISIS_SIGNAL_WORDS = [
  '已经决定', '最后', '再见', '永别', '再见了', '谢谢陪伴',
  '安排好', '遗嘱', '告别信', '不想拖累', '太累了',
  '撑不住了', '真的受不了', '解脱', '没有办法了'
];

// ==================== 中危词汇 ====================
const MEDIUM_RISK_WORDS = [
  '难过', '痛苦', '孤独', '绝望', '无助', '焦虑', '抑郁', '失眠',
  '崩溃', '撑不下去', '煎熬', '折磨', '没人理解', '没人关心',
  '没人在乎', '被抛弃', '心碎', '万念俱灰', '走不出来',
  '喘不过气', '窒息', '恐惧', '害怕', '迷茫', '困惑'
];

const MEDIUM_RISK_PATTERNS = [
  /我.*受不了/,
  /坚持.*不下去/,
  /撑.*不住了?/,
  /太.*痛苦/,
  /非常.*绝望/,
  /严重.*抑郁/,
  /长期.*失眠/,
  /控制.*不住.*情绪/,
  /为什么.*活着/,
  /人生.*没意义/,
];

// ==================== 低危/负面情绪词汇 ====================
const NEGATIVE_WORDS = [
  '不开心', '烦躁', '郁闷', '压力大', '心累', '疲惫',
  '无聊', '寂寞', '委屈', '失望', '烦恼', '倦了',
  '累', '乏', '空虚', '不开心', '丧'
];

// ==================== 敏感内容词汇 ====================
const SENSITIVE_WORDS = ['色情', '暴力', '赌博', '毒品', '诈骗', '裸聊'];

// ==================== 否定词 ====================
// 如果否定词紧邻风险关键词之前，降低匹配权重
const NEGATION_WORDS = ['不', '没有', '不要', '不会', '不是', '别', '不想', '从未', '不会去'];

// ==================== 时间衰减权重 ====================
const TIME_DECAY_WINDOWS = [
  { maxHours: 24, weight: 1.0 },
  { maxHours: 72, weight: 0.5 },
  { maxHours: 168, weight: 0.2 },
  { maxHours: Infinity, weight: 0.1 },
];

@Injectable()
export class RiskControlService {
  private readonly logger = new Logger(RiskControlService.name);

  constructor(
    private cacheService: CacheService,
    @InjectRepository(RiskRecord)
    private riskRecordRepository: Repository<RiskRecord>,
  ) {}

  // ==================== 核心分析 ====================

  /**
   * 分析文本风险等级（v2 - 增强版）
   * 新增：否定词检测、语境信号升级、上下文权重
   */
  analyzeRisk(text: string): RiskLevel {
    if (!text || text.trim().length === 0) return 0;

    // Step 1: 检测否定语境
    const hasNegation = this.detectNegation(text);

    // Step 2: 高危检查
    for (const pattern of HIGH_RISK_PATTERNS) {
      if (pattern.test(text)) {
        if (hasNegation) {
          this.logger.debug(`高危模式 "${pattern}" 被否定词削弱，降为中危`);
          return 1;
        }
        return 2;
      }
    }

    for (const word of HIGH_RISK_WORDS) {
      if (text.includes(word)) {
        if (hasNegation && !this.hasCrisisSignal(text)) {
          this.logger.debug(`高危词 "${word}" 被否定词削弱，降为中危`);
          return 1;
        }
        return 2;
      }
    }

    // Step 3: 中危检查
    for (const pattern of MEDIUM_RISK_PATTERNS) {
      if (pattern.test(text)) {
        // 语境信号升级：中危 + 危机信号 → 高危
        if (this.hasCrisisSignal(text)) {
          this.logger.warn(`中危模式 "${pattern}" 叠加危机信号，升级为高危`);
          return 2;
        }
        if (hasNegation) {
          return 0; // 否定语境下降为正常
        }
        return 1;
      }
    }

    for (const word of MEDIUM_RISK_WORDS) {
      if (text.includes(word)) {
        if (this.hasCrisisSignal(text)) {
          return 2;
        }
        if (hasNegation) {
          return 0;
        }
        return 1;
      }
    }

    // Step 4: 低危词汇（仅记录，不标记风险）
    for (const word of NEGATIVE_WORDS) {
      if (text.includes(word)) {
        return 0;
      }
    }

    return 0;
  }

  /**
   * 检测否定语境
   * 判断文本中是否存在否定词紧邻风险表达的语境
   */
  private detectNegation(text: string): boolean {
    // 检测否定词 + 风险词（中间不超过3个字符）
    const negationPattern = new RegExp(
      `(${NEGATION_WORDS.join('|')})\\s*.{0,3}(${[...HIGH_RISK_WORDS, ...MEDIUM_RISK_WORDS].join('|')})`,
      'i'
    );
    return negationPattern.test(text);
  }

  /**
   * 检测高危语境升级信号
   * 即使关键词本身风险不高，配合这些信号也应升级
   */
  hasCrisisSignal(text: string): boolean {
    return CRISIS_SIGNAL_WORDS.some(word => text.includes(word));
  }

  // ==================== 敏感内容 ====================

  hasSensitiveContent(text: string): boolean {
    const lowerText = text.toLowerCase();
    return [...SENSITIVE_WORDS, ...HIGH_RISK_WORDS.slice(0, 8)].some(word =>
      lowerText.includes(word)
    );
  }

  // ==================== 风险追踪 + 时间衰减（优化4） ====================

  /**
   * 追踪用户风险升级趋势（v2 - 时间衰减加权）
   */
  async trackRisk(userId: number, level: RiskLevel, text?: string): Promise<RiskLevel> {
    const record = {
      level,
      text: text?.slice(0, 200),
      timestamp: Date.now(),
    };
    await this.cacheService.pushRiskRecord(userId, record);

    const history = await this.cacheService.getRiskHistory(userId);

    // 时间衰减加权计算
    const now = Date.now();
    let weightedHighScore = 0;
    let mediumAndAboveCount = 0;

    for (const h of history) {
      const ageHours = (now - (h.timestamp || 0)) / (1000 * 60 * 60);
      const weight = this.getTimeDecayWeight(ageHours);

      if (h.level === 2) {
        weightedHighScore += weight;
      }
      if (h.level >= 1) {
        mediumAndAboveCount += weight;
      }
    }

    // 加权高危 ≥ 2.0 → 高危
    if (weightedHighScore >= 2.0) {
      return 2;
    }

    // 加权中危以上 ≥ 3.5 → 关注
    if (mediumAndAboveCount >= 3.5) {
      return 1;
    }

    return level;
  }

  /**
   * 时间衰减权重
   */
  private getTimeDecayWeight(ageHours: number): number {
    for (const window of TIME_DECAY_WINDOWS) {
      if (ageHours <= window.maxHours) {
        return window.weight;
      }
    }
    return 0.1;
  }

  /**
   * 计算用户当前风险等级（v2 - 滑动窗口）
   */
  async getUserRiskLevel(userId: number): Promise<RiskLevel> {
    const history = await this.cacheService.getRiskHistory(userId);
    if (!history || history.length === 0) return 0;

    const now = Date.now();

    // 近期窗口（最近10条或7天内）
    const recentHistory = history
      .filter((h: any) => (now - (h.timestamp || 0)) / (1000 * 60 * 60) < 168) // 7天内
      .slice(0, 10);

    if (recentHistory.length === 0) return 0;

    let weightedHigh = 0;
    let weightedMedium = 0;

    for (const h of recentHistory) {
      const ageHours = (now - (h.timestamp || 0)) / (1000 * 60 * 60);
      const weight = this.getTimeDecayWeight(ageHours);

      if (h.level === 2) weightedHigh += weight;
      if (h.level >= 1) weightedMedium += weight;
    }

    if (weightedHigh >= 1.5) return 2;
    if (weightedMedium >= 2.5) return 1;
    return 0;
  }

  /**
   * 获取用户风险统计（供跨模块关联使用）
   */
  async getRiskStats(userId: number): Promise<{
    recentHighCount: number;
    recentMediumCount: number;
    totalRecords: number;
    lastRiskAt: Date | null;
    trend: 'rising' | 'stable' | 'falling';
  }> {
    const history = await this.cacheService.getRiskHistory(userId);
    const now = Date.now();
    const recent7d = history.filter((h: any) => (now - (h.timestamp || 0)) / (1000 * 60 * 60) < 168);

    const recentHighCount = recent7d.filter((h: any) => h.level === 2).length;
    const recentMediumCount = recent7d.filter((h: any) => h.level >= 1).length;

    // 趋势判断：比较前3天和后4天
    const firstHalf = recent7d.slice(0, Math.floor(recent7d.length / 2));
    const secondHalf = recent7d.slice(Math.floor(recent7d.length / 2));
    const firstScore = firstHalf.reduce((s: number, h: any) => s + h.level, 0);
    const secondScore = secondHalf.reduce((s: number, h: any) => s + h.level, 0);

    let trend: 'rising' | 'stable' | 'falling' = 'stable';
    if (secondScore > firstScore) trend = 'rising';
    else if (secondScore < firstScore) trend = 'falling';

    return {
      recentHighCount,
      recentMediumCount,
      totalRecords: history.length,
      lastRiskAt: recent7d.length > 0 ? new Date(recent7d[0].timestamp) : null,
      trend,
    };
  }

  // ==================== 干预消息 ====================

  getCrisisInterventionMessage(): string {
    return `我听到你现在非常痛苦，我很关心你的安全。

如果你需要帮助，请立即联系：
- 全国心理援助热线：400-161-9995
- 北京心理危机研究与干预中心：010-82951332
- 希望24热线：400-161-9995

请一定联系身边可信任的人，你不是一个人。`;
  }

  /**
   * 分级干预消息（优化7）
   */
  getInterventionMessage(level: RiskLevel, repeatCount: number = 0): string {
    switch (level) {
      case 1:
        return `我注意到你最近可能有些情绪低落。这是很正常的，每个人都会有困难的时刻。

如果你想聊聊，我随时在这里倾听。你也可以试试这些方式：
- 做一次深呼吸冥想放松一下
- 出门散散步，接触大自然
- 和家人朋友聊聊你的感受

需要我为你推荐一些放松练习吗？`;

      case 2:
        if (repeatCount >= 3) {
          return `【紧急提醒】系统检测到你反复表达了强烈的痛苦情绪。

**请立即寻求帮助，你的安全非常重要：**
- 🔴 全国心理援助热线：400-161-9995
- 🔴 北京心理危机研究与干预中心：010-82951332
- 🔴 希望24热线：400-161-9995
- 🔴 也可以直接拨打：110 或 120

请现在就联系以上任一热线，专业的心理咨询师会帮助你。`;
        }
        return this.getCrisisInterventionMessage();

      default:
        return '';
    }
  }

  /**
   * 获取温和关怀提示（中危时随 AI 回复一起返回）
   */
  getGentlePrompt(): string {
    return `\n\n💙 *如果你感到压力或焦虑，需要倾诉的话，我一直在这里。*`;
  }

  getRiskLevelDescription(level: RiskLevel): string {
    switch (level) {
      case 0: return '正常';
      case 1: return '关注';
      case 2: return '高危';
      default: return '未知';
    }
  }

  getRiskWarningMessage(level: RiskLevel): string {
    switch (level) {
      case 1:
        return '我们注意到您最近的情绪有些低落，如果您需要倾诉，我们随时在这里。';
      case 2:
        return this.getCrisisInterventionMessage();
      default:
        return '';
    }
  }

  // ==================== 风险记录持久化（优化3） ====================

  /**
   * 持久化风险记录到 MySQL
   */
  async saveRiskRecord(params: {
    userId: number;
    sessionId?: number;
    content?: string;
    riskLevel: number;
    source: RiskSource;
    action: RiskAction;
  }): Promise<RiskRecord> {
    const record = this.riskRecordRepository.create({
      ...params,
      status: 'pending',
    });
    return this.riskRecordRepository.save(record);
  }

  /**
   * 分页查询风险记录
   */
  async getRiskRecords(
    page: number,
    pageSize: number,
    filters?: {
      status?: RiskRecordStatus;
      riskLevel?: number;
      source?: RiskSource;
    },
  ): Promise<{ list: RiskRecord[]; total: number; page: number; pageSize: number }> {
    const query = this.riskRecordRepository.createQueryBuilder('record');

    if (filters?.status) {
      query.andWhere('record.status = :status', { status: filters.status });
    }
    if (filters?.riskLevel !== undefined) {
      query.andWhere('record.riskLevel = :riskLevel', { riskLevel: filters.riskLevel });
    }
    if (filters?.source) {
      query.andWhere('record.source = :source', { source: filters.source });
    }

    const [list, total] = await query
      .orderBy('record.createdAt', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    return { list, total, page, pageSize };
  }

  /**
   * 获取用户风险记录历史
   */
  async getUserRiskRecords(userId: number, limit: number = 20): Promise<RiskRecord[]> {
    return this.riskRecordRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  /**
   * 获取待处理风险统计
   */
  async getPendingRiskStats(): Promise<{
    pendingCount: number;
    highCount: number;
    mediumCount: number;
  }> {
    const [pendingResult, highResult, mediumResult] = await Promise.all([
      this.riskRecordRepository.count({ where: { status: 'pending' } }),
      this.riskRecordRepository.count({ where: { status: 'pending', riskLevel: 2 } }),
      this.riskRecordRepository.count({ where: { status: 'pending', riskLevel: 1 } }),
    ]);

    return {
      pendingCount: pendingResult,
      highCount: highResult,
      mediumCount: mediumResult,
    };
  }

  // ==================== 误报标记与自学习（优化8） ====================

  private falsePositivePatterns: Set<string> = new Set();

  /**
   * 标记风险记录为误报
   */
  async markAsFalsePositive(recordId: number, adminId: number, reason?: string): Promise<RiskRecord> {
    const record = await this.riskRecordRepository.findOne({ where: { id: recordId } });
    if (!record) throw new NotFoundException('风险记录不存在');

    // 提取内容模式加入白名单
    if (record.content) {
      const normalized = record.content.slice(0, 100).replace(/\s+/g, '');
      this.falsePositivePatterns.add(normalized);
    }

    await this.riskRecordRepository.update(recordId, {
      status: 'false_positive',
      resolvedBy: adminId,
      resolvedAt: new Date(),
      resolution: reason || '管理员标记为误报',
    });

    this.logger.log(`风险记录 #${recordId} 标记为误报，模式已加入白名单`);
    return this.riskRecordRepository.findOne({ where: { id: recordId } }) as Promise<RiskRecord>;
  }

  /**
   * 解除风险记录（标记为已处理）
   */
  async resolveRiskRecord(recordId: number, adminId: number, resolution?: string): Promise<RiskRecord> {
    const record = await this.riskRecordRepository.findOne({ where: { id: recordId } });
    if (!record) throw new NotFoundException('风险记录不存在');

    await this.riskRecordRepository.update(recordId, {
      status: 'resolved',
      resolvedBy: adminId,
      resolvedAt: new Date(),
      resolution: resolution || '管理员已处理',
    });

    return this.riskRecordRepository.findOne({ where: { id: recordId } }) as Promise<RiskRecord>;
  }

  /**
   * 检查是否为已知误报模式
   */
  isKnownFalsePositive(text: string): boolean {
    const normalized = text.slice(0, 100).replace(/\s+/g, '');
    return this.falsePositivePatterns.has(normalized);
  }
}
