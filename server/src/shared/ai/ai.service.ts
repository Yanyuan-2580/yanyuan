import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { Observable } from 'rxjs';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly apiKey: string;
  private readonly modelName: string;
  private readonly provider: string;
  private readonly maxTokens: number;
  private readonly temperature: number;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get('AI_MODEL_API_KEY', '');
    this.modelName = this.configService.get('AI_MODEL_NAME', 'deepseek-chat');
    this.provider = this.configService.get('AI_MODEL_PROVIDER', 'deepseek');
    this.maxTokens = parseInt(this.configService.get('AI_MAX_TOKENS', '2000'), 10);
    this.temperature = parseFloat(this.configService.get('AI_TEMPERATURE', '0.7'));
  }

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
      return this.getMockResponse(content);
    }
  }

  generateResponseStream(sessionId: string, userId: number, content: string, history: any[] = []): Observable<string> {
    return new Observable<string>(subscriber => {
      (async () => {
        try {
          const systemPrompt = this.buildSystemPrompt();
          const messages = [
            { role: 'system', content: systemPrompt },
            ...history,
            { role: 'user', content: content }
          ];

          if (!this.apiKey || this.apiKey === 'your_api_key') {
            // Mock streaming with fallback response
            const mockResponse = this.getMockResponse(content);
            const chars = mockResponse.split('');
            for (let i = 0; i < chars.length; i++) {
              subscriber.next(chars[i]);
              await this.delay(30); // simulate typing
            }
            subscriber.complete();
            return;
          }

          let url: string;
          let data: any;

          switch (this.provider.toLowerCase()) {
            case 'deepseek':
              url = 'https://api.deepseek.com/v1/chat/completions';
              data = {
                model: this.modelName,
                messages,
                max_tokens: this.maxTokens,
                temperature: this.temperature,
                stream: true
              };
              break;
            case 'openai':
              url = 'https://api.openai.com/v1/chat/completions';
              data = {
                model: this.modelName,
                messages,
                max_tokens: this.maxTokens,
                temperature: this.temperature,
                stream: true
              };
              break;
            default:
              throw new Error(`Unsupported AI provider: ${this.provider}`);
          }

          const response = await axios.post(url, data, {
            headers: {
              'Authorization': `Bearer ${this.apiKey}`,
              'Content-Type': 'application/json'
            },
            timeout: 120000,
            responseType: 'stream'
          });

          let buffer = '';
          response.data.on('data', (chunk: Buffer) => {
            buffer += chunk.toString();
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed || !trimmed.startsWith('data: ')) continue;

              const dataStr = trimmed.slice(6);
              if (dataStr === '[DONE]') {
                subscriber.complete();
                return;
              }

              try {
                const parsed = JSON.parse(dataStr);
                const delta = parsed.choices?.[0]?.delta?.content;
                if (delta) {
                  subscriber.next(delta);
                }
              } catch {
                // Skip unparseable lines
              }
            }
          });

          response.data.on('end', () => {
            subscriber.complete();
          });

          response.data.on('error', (err: Error) => {
            this.logger.error(`Stream error: ${err.message}`);
            subscriber.error(err);
          });
        } catch (error) {
          this.logger.error(`AI streaming failed: ${error.message}`);
          // Fallback to mock streaming on error
          const fallback = this.getMockResponse(content);
          const chars = fallback.split('');
          for (let i = 0; i < chars.length; i++) {
            subscriber.next(chars[i]);
            await this.delay(20);
          }
          subscriber.complete();
        }
      })();
    });
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
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
        return this.analyzeMoodSimple(text);
      }
    } catch {
      return this.analyzeMoodSimple(text);
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
    if (!this.apiKey || this.apiKey === 'your_api_key') {
      return this.getMockResponse(messages[messages.length - 1]?.content || '');
    }

    try {
      let url: string;
      let data: any;

      switch (this.provider.toLowerCase()) {
        case 'deepseek':
          url = 'https://api.deepseek.com/v1/chat/completions';
          data = {
            model: this.modelName,
            messages: messages,
            max_tokens: this.maxTokens,
            temperature: this.temperature
          };
          this.logger.log(`Sending request to DeepSeek API with ${messages.length} messages`);
          break;
        case 'openai':
          url = 'https://api.openai.com/v1/chat/completions';
          data = {
            model: this.modelName,
            messages: messages,
            max_tokens: this.maxTokens,
            temperature: this.temperature
          };
          break;
        default:
          throw new Error(`Unsupported AI provider: ${this.provider}`);
      }

      const response = await axios.post(url, data, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 60000
      });

      this.logger.log(`DeepSeek API response received, tokens: ${response.data.usage?.total_tokens || 'unknown'}`);
      return response.data.choices[0].message.content;
    } catch (error) {
      this.logger.error(`AI API call failed: ${error.message}`);
      if (error.response) {
        this.logger.error(`API Error Response: ${JSON.stringify(error.response.data)}`);
      }
      throw error;
    }
  }

  private getMockResponse(content: string): string {
    const mockResponses: Record<string, string[]> = {
      '焦虑': [
        '我理解你的焦虑，这是很正常的情绪。试着做几个深呼吸，把注意力集中在当下的事情上，一步一步来~',
        '焦虑的时候，我们的思绪会像脱缰的野马。不如试着把担心的事情写下来，也许会发现很多都是过度思考呢。',
        '抱抱你~焦虑是身体在提醒我们需要关注自己了。今天先做一件小事让自己放松一下吧。'
      ],
      '压力': [
        '压力大的时候，记得给自己留一些喘息的空间。哪怕只是五分钟的放空，也会有帮助的。',
        '压力就像背了很重的包袱，试着把它放下一会儿。你不需要时刻都那么坚强呀。',
        '感受到压力说明你对自己有期待，这很棒！但也要学会照顾好自己，休息是为了更好地出发。'
      ],
      '难过': [
        '难过的时候就好好哭一场，释放出来会好受很多。我在这里陪着你~',
        '允许自己难过，这不是软弱，而是勇敢地面对自己的情绪。一切都会好起来的。',
        '想哭就哭吧，眼泪是情绪的出口。哭完之后，你会发现自己其实很坚强。'
      ],
      '孤独': [
        '孤独的感觉确实很难受，但你不是一个人。我一直在这里，愿意听你说话。',
        '有时候孤独感会悄悄来临，但请记住，总有人在关心你。想聊聊吗？',
        '孤独的时候，试着做一些能让自己专注的事情，也许会发现内心的平静。'
      ],
      '开心': [
        '看到你开心我也很开心！这份好心情要好好珍藏呀~',
        '开心的时光总是很美好，记得记录下来，以后回忆起来也会很温暖。',
        '愿这份开心能一直伴随着你，每天都有小确幸~'
      ],
      '生气': [
        '生气是很正常的情绪，说明你在乎这件事。先深呼吸几次，冷静下来再处理吧。',
        '愤怒就像一团火，先别被它吞噬。试着找个安全的方式释放出来。',
        '我理解你的愤怒，这是很自然的反应。但请记住，不要用别人的错误惩罚自己。'
      ],
      '抑郁': [
        '我知道现在很难，但请相信，这只是暂时的。你不是一个人在战斗。',
        '抑郁就像乌云笼罩，但总会有放晴的一天。请一定不要放弃希望。',
        '如果你感到非常痛苦，记得寻求专业的帮助。你值得被好好对待。'
      ],
      '失眠': [
        '失眠的夜晚确实很煎熬。不如试着做一些放松的事情，比如听轻音乐或者阅读。',
        '睡不着的时候别着急，闭上眼睛休息也是一种充电。告诉自己，慢慢来~',
        '试试478呼吸法：吸气4秒，憋气7秒，呼气8秒，也许会有帮助。'
      ]
    };

    for (const [keyword, responses] of Object.entries(mockResponses)) {
      if (content.includes(keyword)) {
        return responses[Math.floor(Math.random() * responses.length)];
      }
    }

    const defaultResponses = [
      '我理解你的感受，这确实不容易。你愿意和我多说说吗？',
      '谢谢你愿意和我分享这些，我在这里听你说。',
      '你的感受很重要，我愿意陪你一起面对。',
      '有时候倾诉本身就是一种治愈，继续说吧，我在。',
      '你已经很棒了，能够表达自己的情绪就是一种勇气。'
    ];

    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  }

  private analyzeMoodSimple(text: string): { mood: string; score: number; tags: string[] } {
    const moodKeywords: Record<string, { mood: string; score: number }> = {
      '开心': { mood: 'happy', score: 5 },
      '高兴': { mood: 'happy', score: 5 },
      '快乐': { mood: 'happy', score: 5 },
      '幸福': { mood: 'happy', score: 5 },
      '难过': { mood: 'sad', score: 1 },
      '伤心': { mood: 'sad', score: 1 },
      '悲伤': { mood: 'sad', score: 1 },
      '沮丧': { mood: 'sad', score: 2 },
      '生气': { mood: 'angry', score: 1 },
      '愤怒': { mood: 'angry', score: 1 },
      '烦躁': { mood: 'angry', score: 2 },
      '焦虑': { mood: 'anxious', score: 2 },
      '紧张': { mood: 'anxious', score: 2 },
      '压力': { mood: 'anxious', score: 2 },
      '平静': { mood: 'calm', score: 4 },
      '放松': { mood: 'calm', score: 4 },
      '平和': { mood: 'calm', score: 4 }
    };

    for (const [keyword, result] of Object.entries(moodKeywords)) {
      if (text.includes(keyword)) {
        return { ...result, tags: [keyword] };
      }
    }

    return { mood: 'neutral', score: 3, tags: [] };
  }
}
