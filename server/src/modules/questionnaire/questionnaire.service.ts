import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Questionnaire, QuestionnaireResult } from '@/database/entities';
import { AiService } from '@/shared';

@Injectable()
export class QuestionnaireService {
  constructor(
    @InjectRepository(Questionnaire)
    private questionnaireRepository: Repository<Questionnaire>,
    @InjectRepository(QuestionnaireResult)
    private resultRepository: Repository<QuestionnaireResult>,
    private aiService: AiService
  ) {}

  async getQuestionnaires(): Promise<Questionnaire[]> {
    return this.questionnaireRepository.find({
      where: { status: 1 },
      select: ['id', 'title', 'description', 'category']
    });
  }

  async getQuestionnaire(id: number): Promise<Questionnaire> {
    const q = await this.questionnaireRepository.findOne({ where: { id, status: 1 } });
    if (!q) throw new NotFoundException('问卷不存在');
    return q;
  }

  async submitResult(
    userId: number,
    questionnaireId: number,
    answers: Array<{ questionId: number; selectedValue: number }>
  ): Promise<QuestionnaireResult> {
    const questionnaire = await this.getQuestionnaire(questionnaireId);

    // Calculate scores
    const scoredAnswers = answers.map(a => {
      const question = questionnaire.questions.find(q => q.id === a.questionId);
      const option = question?.options.find(o => o.value === a.selectedValue);
      return {
        questionId: a.questionId,
        selectedValue: a.selectedValue,
        score: option?.score || 0
      };
    });

    const totalScore = scoredAnswers.reduce((sum, a) => sum + a.score, 0);

    // Determine level — scoringRules is a direct array of ranges
    let resultLevel: 'low' | 'moderate' | 'high' = 'low';
    let resultLabel = '状态良好';
    const rules = questionnaire.scoringRules as any[];
    if (rules?.length) {
      // Sort by min score ascending
      const sorted = [...rules].sort((a, b) => a.min - b.min);
      const matched = sorted.find(r => totalScore >= r.min && totalScore <= r.max);
      if (matched) {
        resultLevel = matched.level;
        resultLabel = matched.label;
      } else if (totalScore < sorted[0].min) {
        // Below lowest range — use lowest level
        resultLevel = sorted[0].level;
        resultLabel = sorted[0].label;
      } else {
        // Above highest range — use highest level
        resultLevel = sorted[sorted.length - 1].level;
        resultLabel = sorted[sorted.length - 1].label;
      }
    }

    // Generate AI advice — use questionnaire title for context
    let aiAdvice = '';
    try {
      const moodMap: Record<string, string> = {
        low: 'calm', moderate: 'anxious', high: 'sad'
      };
      const advice = await this.aiService.generateMoodSuggestion(
        moodMap[resultLevel] || 'calm',
        `问卷「${questionnaire.title}」测评得分: ${totalScore}分，等级: ${resultLabel}`
      );
      aiAdvice = advice;
    } catch {
      aiAdvice = this.getDefaultAdvice(resultLevel, resultLabel, questionnaire.title);
    }

    const result = this.resultRepository.create({
      userId,
      questionnaireId,
      answers: scoredAnswers,
      totalScore,
      resultLevel,
      aiAdvice
    });

    return this.resultRepository.save(result);
  }

  async getUserResults(userId: number, page: number = 1, pageSize: number = 10): Promise<{ list: QuestionnaireResult[]; total: number; page: number; pageSize: number; totalPages: number }> {
    const [list, total] = await this.resultRepository.findAndCount({
      where: { userId },
      relations: ['questionnaire'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize
    });
    return { list, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async getResultDetail(userId: number, resultId: number): Promise<QuestionnaireResult> {
    const result = await this.resultRepository.findOne({
      where: { id: resultId, userId },
      relations: ['questionnaire']
    });
    if (!result) throw new NotFoundException('测评结果不存在');
    return result;
  }

  async getLatestResult(userId: number, questionnaireId: number): Promise<QuestionnaireResult | null> {
    return this.resultRepository.findOne({
      where: { userId, questionnaireId },
      order: { createdAt: 'DESC' },
      select: ['id', 'totalScore', 'resultLevel', 'createdAt'],
    });
  }

  // Admin methods

  async adminList(): Promise<Questionnaire[]> {
    return this.questionnaireRepository.find({
      order: { createdAt: 'DESC' },
      select: ['id', 'title', 'description', 'category', 'questions', 'scoringRules', 'status', 'createdAt'],
    });
  }

  async createQuestionnaire(data: Partial<Questionnaire>): Promise<Questionnaire> {
    const q = this.questionnaireRepository.create(data);
    return this.questionnaireRepository.save(q);
  }

  async updateQuestionnaire(id: number, data: Partial<Questionnaire>): Promise<Questionnaire> {
    await this.questionnaireRepository.update(id, data);
    return this.getQuestionnaire(id);
  }

  async deleteQuestionnaire(id: number): Promise<void> {
    await this.questionnaireRepository.update(id, { status: 0 });
  }

  private getDefaultAdvice(level: string, label: string, questionnaireTitle?: string): string {
    const prefix = questionnaireTitle ? `「${questionnaireTitle}」测评完成。` : '';
    if (level === 'low') {
      return prefix + '您目前的状态良好，请继续保持良好的生活习惯和积极的心态，定期进行自我关照。';
    } else if (level === 'moderate') {
      return prefix + '测评结果显示您可能需要关注自己的心理状态。建议尝试规律的作息、适度运动和放松练习。如果状态持续，可以考虑寻求专业建议。';
    } else {
      return prefix + '测评结果提示您当前可能承受较大的心理压力。请重视自己的心理健康，及时寻求专业帮助。全国心理援助热线：400-161-9995。请记住，求助是勇敢的表现。';
    }
  }
}
