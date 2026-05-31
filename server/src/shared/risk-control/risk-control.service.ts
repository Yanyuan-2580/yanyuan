import { Injectable, Logger } from '@nestjs/common';
import { RiskLevel } from '@/types';
import { CacheService } from '@/shared/cache/cache.service';

// 高危词汇 - 明确的自杀、自残、暴力倾向
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

// 中危词汇 - 强烈的负面情绪
const MEDIUM_RISK_WORDS = [
  '难过', '痛苦', '孤独', '绝望', '无助', '焦虑', '抑郁', '失眠',
  '崩溃', '撑不下去', '煎熬', '折磨', '没人理解', '没人关心',
  '没人在乎', '被抛弃', '心碎', '万念俱灰', '走不出来',
  '喘不过气', '窒息', '恐惧', '害怕', '迷茫', '困惑'
];

// 中危模式
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

// 低危/负面情绪词汇
const NEGATIVE_WORDS = [
  '不开心', '烦躁', '郁闷', '压力大', '心累', '疲惫',
  '无聊', '寂寞', '委屈', '失望', '烦恼', '倦了',
  '累', '乏', '空虚', '不开心', '丧'
];

// 敏感内容词汇
const SENSITIVE_WORDS = ['色情', '暴力', '赌博', '毒品', '诈骗', '裸聊'];

@Injectable()
export class RiskControlService {
  private readonly logger = new Logger(RiskControlService.name);

  constructor(private cacheService: CacheService) {}

  analyzeRisk(text: string): RiskLevel {
    if (!text) return 0;
    const lowerText = text.toLowerCase();

    // 检查高危模式（正则）
    for (const pattern of HIGH_RISK_PATTERNS) {
      if (pattern.test(text)) {
        return 2;
      }
    }

    // 检查高危关键词
    for (const word of HIGH_RISK_WORDS) {
      if (lowerText.includes(word)) {
        return 2;
      }
    }

    // 检查中危模式
    for (const pattern of MEDIUM_RISK_PATTERNS) {
      if (pattern.test(text)) {
        return 1;
      }
    }

    // 检查中危关键词
    for (const word of MEDIUM_RISK_WORDS) {
      if (lowerText.includes(word)) {
        return 1;
      }
    }

    // 检查低危词汇（但不直接标记为风险，只是记录）
    for (const word of NEGATIVE_WORDS) {
      if (lowerText.includes(word)) {
        return 0; // 仅负面情绪，不升级风险等级
      }
    }

    return 0;
  }

  hasSensitiveContent(text: string): boolean {
    const lowerText = text.toLowerCase();
    return [...SENSITIVE_WORDS, ...HIGH_RISK_WORDS.slice(0, 8)].some(word =>
      lowerText.includes(word)
    );
  }

  /**
   * 追踪用户风险升级趋势
   * 连续出现中高危内容时升级风险等级
   */
  async trackRisk(userId: number, level: RiskLevel): Promise<RiskLevel> {
    // 保存风险记录到持久化存储
    const record = { level, lastAt: new Date().toISOString() };
    await this.cacheService.pushRiskRecord(userId, record);

    // 获取历史记录
    const history = await this.cacheService.getRiskHistory(userId);

    // 检查是否有 3 次以上高危
    const highCount = history.filter((h: any) => h.level === 2).length;
    if (highCount >= 3) {
      return 2;
    }

    // 检查是否有连续 5 次中危以上
    const mediumAndAbove = history.filter((h: any) => h.level >= 1).length;
    if (mediumAndAbove >= 5) {
      return 1;
    }

    return level;
  }

  /**
   * 计算用户当前风险等级（基于整体历史）
   */
  async getUserRiskLevel(userId: number): Promise<RiskLevel> {
    const history = await this.cacheService.getRiskHistory(userId);
    if (!history || history.length === 0) return 0;

    const recentHistory = history.slice(-5);
    const highCount = recentHistory.filter((h: any) => h.level === 2).length;
    const mediumCount = recentHistory.filter((h: any) => h.level >= 1).length;

    if (highCount >= 2) return 2;
    if (mediumCount >= 3) return 1;
    return 0;
  }

  getCrisisInterventionMessage(): string {
    return `我听到你现在非常痛苦，我很关心你的安全。

如果你需要帮助，请立即联系：
- 全国心理援助热线：400-161-9995
- 北京心理危机研究与干预中心：010-82951332
- 希望24热线：400-161-9995

请一定联系身边可信任的人，你不是一个人。`;
  }

  getRiskLevelDescription(level: RiskLevel): string {
    switch (level) {
      case 0:
        return '正常';
      case 1:
        return '关注';
      case 2:
        return '高危';
      default:
        return '未知';
    }
  }

  /**
   * 获取风险提示消息（根据等级）
   */
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
}
