import { Injectable } from '@nestjs/common';
import { RiskLevel } from '@/types';

const HIGH_RISK_WORDS = ['自杀', '自残', '想死', '不想活', '活不下去', '割腕', '跳楼', '吃药'];
const MEDIUM_RISK_WORDS = ['难过', '痛苦', '孤独', '绝望', '无助', '焦虑', '抑郁', '失眠'];
const NEGATIVE_WORDS = ['不开心', '烦躁', '郁闷', '压力大', '心累'];

@Injectable()
export class RiskControlService {
  analyzeRisk(text: string): RiskLevel {
    const lowerText = text.toLowerCase();
    
    for (const word of HIGH_RISK_WORDS) {
      if (lowerText.includes(word)) {
        return 2;
      }
    }
    
    for (const word of MEDIUM_RISK_WORDS) {
      if (lowerText.includes(word)) {
        return 1;
      }
    }
    
    return 0;
  }

  hasSensitiveContent(text: string): boolean {
    const sensitiveWords = [...HIGH_RISK_WORDS, '色情', '暴力', '赌博', '毒品'];
    const lowerText = text.toLowerCase();
    return sensitiveWords.some(word => lowerText.includes(word));
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
      case 0: return '正常';
      case 1: return '关注';
      case 2: return '高危';
      default: return '未知';
    }
  }
}
