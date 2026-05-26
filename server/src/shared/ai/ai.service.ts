import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(private configService: ConfigService) {}

  async generateResponse(sessionId: string, userId: number, content: string, history: any[] = []): Promise<string> {
    const systemPrompt = this.buildSystemPrompt();
    const messages = [
      { role: 'system', content: systemPrompt },
      ...history,
      { role: 'user', content: content }
    ];

    try {
      const response = await this.callModel(messages);
      return response;
    } catch (error) {
      this.logger.error(`AI model call failed: ${error.message}`);
      throw new Error('AI服务暂时不可用');
    }
  }

  async analyzeMood(text: string): Promise<{ mood: string; score: number; tags: string[] }> {
    const prompt = `分析以下文本的情绪状态：\n\n${text}\n\n请返回JSON格式：{"mood": "情绪类型", "score": 1-5, "tags": ["标签1", "标签2"]}`;
    
    try {
      const response = await this.callModel([{ role: 'user', content: prompt }]);
      try {
        const result = JSON.parse(response);
        return {
          mood: result.mood || 'neutral',
          score: result.score || 3,
          tags: result.tags || []
        };
      } catch {
        return { mood: 'neutral', score: 3, tags: [] };
      }
    } catch {
      return { mood: 'neutral', score: 3, tags: [] };
    }
  }

  async generateMoodSuggestion(moodType: string, reason?: string): Promise<string> {
    const prompt = `用户今天的心情是${this.getMoodLabel(moodType)}，${reason ? `原因是：${reason}` : '没有说明原因'}。

请提供一段温暖的建议，帮助用户改善心情或更好地应对当前情绪。

要求：
- 语气温暖、鼓励
- 建议具体、可操作
- 不超过150字
- 使用自然的口语化表达`;
    
    try {
      const response = await this.callModel([{ role: 'user', content: prompt }]);
      return response;
    } catch {
      return this.getDefaultMoodSuggestion(moodType);
    }
  }

  private getMoodLabel(moodType: string): string {
    const labels: Record<string, string> = {
      happy: '开心',
      sad: '难过',
      angry: '生气',
      anxious: '焦虑',
      calm: '平静'
    };
    return labels[moodType] || moodType;
  }

  private getDefaultMoodSuggestion(moodType: string): string {
    const suggestions: Record<string, string> = {
      happy: '保持这份好心情！可以记录下来今天开心的事，以后回忆起来也会很温暖。',
      sad: '难过的时候允许自己哭一场，或者找个朋友聊聊。记住，一切都会过去的。',
      angry: '先深呼吸几次，冷静下来再处理问题。有时候生气是因为我们太在乎了。',
      anxious: '试着做几个深呼吸，把注意力集中在当下。你已经在努力面对了，很棒！',
      calm: '享受这份平静，这是难得的状态。可以做点喜欢的事，让自己更放松。'
    };
    return suggestions[moodType] || '无论心情如何，都要好好照顾自己哦~';
  }

  async generateDiaryInsight(diaryContent: string): Promise<string> {
    const prompt = this.buildDiaryAnalysisPrompt(diaryContent);
    
    try {
      const response = await this.callModel([{ role: 'user', content: prompt }]);
      return response;
    } catch {
      return '根据你的日记，我看到你今天的心情变化。记住要好好照顾自己，一切都会好起来的。';
    }
  }

  private buildSystemPrompt(): string {
    return `你是一位专业、温暖、有同理心的心理健康陪伴助手。请遵循以下原则：

【角色定位】
- 你是用户的倾听者和陪伴者，不是医生或心理咨询师
- 始终保持温和、耐心、不评判的态度

【核心原则】
1. 共情优先：先认可用户的情绪，再提供建议
2. 不诊断：绝不给出医学诊断或用药建议
3. 不评判：不批评、不说教、不否定用户的感受
4. 引导式提问：用开放式问题帮助用户自我探索
5. 适度建议：建议要具体、可操作，避免空泛的安慰

【安全底线】
- 如检测到自杀、自残倾向，必须回复危机干预热线
- 不提供任何医疗诊断、处方建议
- 不替代专业心理咨询

【回复风格】
- 语言温暖自然，像朋友一样交流
- 回复简洁，每次回复不超过300字
- 适当使用表情符号增加亲和力（每段最多1个）
- 结尾可以提出一个引导性问题，鼓励用户继续表达`;
  }

  private buildDiaryAnalysisPrompt(diaryContent: string): string {
    return `请根据以下用户日记内容，生成一段温暖的情绪洞察分析：

${diaryContent}

【分析维度】
1. 情绪状态识别：识别主要情绪（如焦虑、开心、低落、平静等）
2. 触发因素分析：找出可能影响情绪的事件或因素
3. 积极面挖掘：即使情绪负面，也要找到用户表现出的积极面
4. 改善建议：提供1-2条具体、可操作的小建议

【输出要求】
- 语气温暖、鼓励，像朋友在聊天
- 不超过200字
- 不使用专业术语
- 最后给一个温暖的结尾`;
  }

  private async callModel(messages: { role: string; content: string }[]): Promise<string> {
    const mockResponse = `我理解你现在的感受，这确实不容易。${messages[messages.length - 1].content.includes('难过') ? '难过的时候就好好哭一场，释放出来会好受很多。' : '你已经很棒了，在努力面对这些情绪。'}你愿意和我多说说吗？`;
    await new Promise(resolve => setTimeout(resolve, 1000));
    return mockResponse;
  }
}
